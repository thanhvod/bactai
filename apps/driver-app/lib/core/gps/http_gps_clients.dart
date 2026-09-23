import 'dart:convert';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:http/http.dart' as http;

import 'gps_tracker_engine.dart';
import 'tracking_store.dart';

/// Token cho tiến trình nền: luôn đọc phiên mới nhất từ storage (UI có thể đã refresh), tự refresh khi 401.
/// Không tự xóa phiên — việc đăng xuất để UI quyết định.
class BackgroundAuth {
  BackgroundAuth(this.session, this.authApi);
  final SessionStore session;
  final DriverAuthApi authApi;

  Future<String?> token() async {
    final s = await session.reload();
    if (s == null) return null;
    if (!s.isExpired) return s.accessToken;
    return (await _refresh(s))?.accessToken;
  }

  Future<DriverSession?> _refresh(DriverSession current) async {
    try {
      final n = await authApi.refresh(current.refreshToken);
      await session.save(n);
      return n;
    } on ApiException catch (e) {
      final latest = await session.reload();
      if (latest != null && latest.refreshToken != current.refreshToken) return latest;
      if (e.isNetwork) rethrow;
      return null;
    }
  }

  /// Chạy [fn] với token; gặp UNAUTHENTICATED thì refresh 1 lần rồi chạy lại.
  Future<T> run<T>(Future<T> Function(String? token) fn) async {
    try {
      return await fn(await token());
    } on ApiException catch (e) {
      if (!e.isUnauthenticated) rethrow;
      final s = await session.reload();
      final r = s == null ? null : await _refresh(s);
      if (r == null) rethrow;
      return fn(r.accessToken);
    }
  }
}

class HttpGpsBatchSender implements GpsBatchSender {
  HttpGpsBatchSender(this.config, this.auth, {http.Client? client}) : _client = client ?? http.Client();
  final ApiConfig config;
  final BackgroundAuth auth;
  final http.Client _client;

  @override
  Future<void> send({required String clientRequestId, required String tripId, required List<GpsPoint> points}) => auth.run((token) async {
        http.Response res;
        try {
          res = await _client
              .post(config.uri('/driver/gps/batch'),
                  headers: {'content-type': 'application/json', if (token != null) 'authorization': 'Bearer $token'},
                  body: jsonEncode({'clientRequestId': clientRequestId, 'tripId': tripId, 'points': points.map((p) => p.toJson()).toList()}))
              .timeout(const Duration(seconds: 30));
        } catch (e) {
          throw ApiException.network(e);
        }
        if (res.statusCode >= 200 && res.statusCode < 300) return;
        throw ApiException.fromResponse(res.statusCode, res.body);
      });
}

/// `driverJobs(filter:{bucket:"RUNNING"})` qua HTTP thuần (isolate nền không dùng GraphQL client của UI).
class HttpRunningTripChecker implements RunningTripChecker {
  HttpRunningTripChecker(this.config, this.auth, {http.Client? client}) : _client = client ?? http.Client();
  final ApiConfig config;
  final BackgroundAuth auth;
  final http.Client _client;

  static const _query = 'query { driverJobs(filter: { bucket: "RUNNING" }) { id code status plannedStartAt } }';

  @override
  Future<ActiveTrip?> runningTrip() => auth.run((token) async {
        http.Response res;
        try {
          res = await _client
              .post(Uri.parse(config.graphqlUrl),
                  headers: {'content-type': 'application/json', if (token != null) 'authorization': 'Bearer $token'},
                  body: jsonEncode({'query': _query}))
              .timeout(const Duration(seconds: 30));
        } catch (e) {
          throw ApiException.network(e);
        }
        if (res.statusCode == 401) throw ApiException.fromResponse(401, res.body);
        if (res.statusCode >= 500) throw ApiException.fromResponse(res.statusCode, res.body);
        final j = jsonDecode(res.body) as Map<String, dynamic>;
        final errors = j['errors'] as List?;
        if (errors != null && errors.isNotEmpty) {
          final e = errors.first as Map<String, dynamic>;
          final code = ((e['extensions'] as Map?)?['code'] ?? 'SERVER_ERROR').toString();
          throw ApiException(code: code, message: (e['message'] ?? '').toString(), statusCode: code == 'UNAUTHENTICATED' ? 401 : null);
        }
        final jobs = ((j['data'] as Map?)?['driverJobs'] as List?) ?? const [];
        if (jobs.isEmpty) return null;
        // Nhiều chuyến chạy cùng lúc (hiếm): lấy chuyến bắt đầu sớm nhất.
        final list = jobs.cast<Map<String, dynamic>>()..sort((a, b) => (a['plannedStartAt'] ?? '').toString().compareTo((b['plannedStartAt'] ?? '').toString()));
        return ActiveTrip(id: list.first['id'] as String, code: list.first['code'] as String?);
      });
}
