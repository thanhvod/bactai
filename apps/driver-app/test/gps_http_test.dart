import 'dart:convert';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:driver_app/core/gps/http_gps_clients.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

const config = ApiConfig(baseUrl: 'http://api');

Map<String, dynamic> sessionJson(String access, String refresh) => {
      'accessToken': access,
      'refreshToken': refresh,
      'expiresIn': 3600,
      'driver': {'id': 'd1', 'code': 'TX1', 'name': 'Tài', 'phone': '0900000001', 'merchantId': 'm1', 'merchantName': 'BTA'},
    };

Future<SessionStore> storeWith(String access, String refresh) async {
  final s = SessionStore(MemoryKeyValueStore());
  await s.save(DriverAuthApi.parseSession(sessionJson(access, refresh)));
  return s;
}

void main() {
  test('401 → refresh token rồi gửi lại lô với token mới', () async {
    final store = await storeWith('old', 'r1');
    final calls = <String>[];
    final client = MockClient((req) async {
      calls.add('${req.url.path} ${req.headers['authorization'] ?? ''}');
      if (req.url.path == '/driver/auth/refresh') return http.Response(jsonEncode(sessionJson('new', 'r2')), 200);
      if (req.headers['authorization'] == 'Bearer old') return http.Response('{"code":"UNAUTHENTICATED","message":"x"}', 401);
      return http.Response('{"accepted":1,"duplicates":0}', 200);
    });
    final auth = BackgroundAuth(store, DriverAuthApi(config, client: client));
    final sender = HttpGpsBatchSender(config, auth, client: client);
    await sender.send(clientRequestId: 'b1', tripId: 't1', points: [GpsPoint(lat: 1, lng: 2, recordedAt: DateTime.utc(2026))]);
    expect(calls, ['/driver/gps/batch Bearer old', '/driver/auth/refresh ', '/driver/gps/batch Bearer new']);
    expect((await store.reload())!.refreshToken, 'r2');
  });

  test('refresh token đã bị app (UI) xoay vòng → dùng phiên mới trong storage, không mất phiên', () async {
    final store = await storeWith('old', 'r1');
    final client = MockClient((req) async {
      if (req.url.path == '/driver/auth/refresh') {
        // UI vừa refresh xong & lưu phiên mới → r1 đã bị thu hồi
        await store.save(DriverAuthApi.parseSession(sessionJson('ui-new', 'r-ui')));
        return http.Response('{"code":"UNAUTHENTICATED","message":"revoked"}', 401);
      }
      if (req.headers['authorization'] == 'Bearer old') return http.Response('{"code":"UNAUTHENTICATED"}', 401);
      return http.Response(jsonEncode({'data': {'driverJobs': [{'id': 't9', 'code': 'CX-9', 'status': 'IN_TRANSIT', 'plannedStartAt': '2026-09-23T01:00:00Z'}]}}), 200);
    });
    final auth = BackgroundAuth(store, DriverAuthApi(config, client: client));
    final trip = await HttpRunningTripChecker(config, auth, client: client).runningTrip();
    expect(trip?.id, 't9');
    expect(trip?.code, 'CX-9');
  });

  test('không còn chuyến chạy → null; lỗi mạng → ApiException NETWORK', () async {
    final store = await storeWith('ok', 'r1');
    final empty = MockClient((req) async => http.Response(jsonEncode({'data': {'driverJobs': []}}), 200));
    expect(await HttpRunningTripChecker(config, BackgroundAuth(store, DriverAuthApi(config, client: empty)), client: empty).runningTrip(), isNull);
    final down = MockClient((req) async => throw Exception('socket'));
    expect(
      () => HttpGpsBatchSender(config, BackgroundAuth(store, DriverAuthApi(config, client: down)), client: down)
          .send(clientRequestId: 'b', tripId: 't', points: [GpsPoint(lat: 1, lng: 2, recordedAt: DateTime.utc(2026))]),
      throwsA(isA<ApiException>().having((e) => e.isNetwork, 'isNetwork', isTrue)),
    );
  });
}
