import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'api_error.dart';
import 'session_store.dart';

/// REST auth tài xế (D-009: SĐT + mật khẩu do merchant cấp, không OTP).
///
/// POST /driver/auth/login {phone, password} → {accessToken, refreshToken, expiresIn, driver{...}}
/// POST /driver/auth/refresh {refreshToken} → như trên
/// POST /driver/auth/logout {refreshToken}
/// POST /driver/auth/change-password {oldPassword, newPassword} (Bearer)
class DriverAuthApi {
  DriverAuthApi(this.config, {http.Client? client}) : _client = client ?? http.Client();

  final ApiConfig config;
  final http.Client _client;

  Future<DriverSession> login({required String phone, required String password}) =>
      _session('/driver/auth/login', {'phone': phone.trim(), 'password': password});

  Future<DriverSession> refresh(String refreshToken) => _session('/driver/auth/refresh', {'refreshToken': refreshToken});

  Future<void> logout(String refreshToken) async {
    try {
      await _post('/driver/auth/logout', {'refreshToken': refreshToken});
    } on ApiException catch (e) {
      if (!e.isNetwork && !e.isUnauthenticated) rethrow;
    }
  }

  Future<void> changePassword({required String accessToken, required String oldPassword, required String newPassword}) =>
      _post('/driver/auth/change-password', {'oldPassword': oldPassword, 'newPassword': newPassword}, token: accessToken);

  Future<DriverSession> _session(String path, Map<String, Object?> body) async {
    final j = await _post(path, body);
    return parseSession(j);
  }

  static DriverSession parseSession(Map<String, dynamic> j) {
    final expiresIn = (j['expiresIn'] as num?)?.toInt() ?? 3600;
    return DriverSession(
      accessToken: j['accessToken'] as String,
      refreshToken: j['refreshToken'] as String,
      expiresAt: DateTime.now().add(Duration(seconds: expiresIn)),
      driver: DriverProfile.fromJson(j['driver'] as Map<String, dynamic>),
    );
  }

  Future<Map<String, dynamic>> _post(String path, Map<String, Object?> body, {String? token}) async {
    http.Response res;
    try {
      res = await _client
          .post(config.uri(path),
              headers: {'content-type': 'application/json', if (token != null) 'authorization': 'Bearer $token'},
              body: jsonEncode(body))
          .timeout(const Duration(seconds: 20));
    } catch (e) {
      throw ApiException.network(e);
    }
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.body.isEmpty) return {};
      final j = jsonDecode(res.body);
      return j is Map<String, dynamic> ? j : {};
    }
    throw ApiException.fromResponse(res.statusCode, res.body);
  }
}
