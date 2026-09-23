import 'dart:io';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:driver_app/core/api/driver_api.dart';
import 'package:driver_app/features/jobs/domain/models.dart';
import 'package:flutter_test/flutter_test.dart';

/// Kiểm tra app ↔ API thật (chỉ đọc, không đổi dữ liệu). Chạy:
///   API_URL=http://localhost:2001 flutter test test/integration/api_smoke_test.dart
/// Không có API_URL → bỏ qua.
void main() {
  final url = Platform.environment['API_URL'];
  final skip = url == null ? 'Đặt API_URL để chạy smoke test với API thật' : false;

  test('login → driverMe → driverJobs → driverTrip (tài xế seed 0900000001)', () async {
    final config = ApiConfig(baseUrl: url!);
    final session = SessionStore(MemoryKeyValueStore());
    final auth = DriverAuthApi(config);
    final s = await auth.login(phone: Platform.environment['DRIVER_PHONE'] ?? '0900000001', password: Platform.environment['DRIVER_PASSWORD'] ?? 'Taixe123');
    await session.save(s);
    final api = GraphqlDriverApi(GraphqlClientFactory(config: config, sessionStore: session, authApi: auth));

    final me = await api.driverMe();
    expect(me['name'], isNotEmpty);

    final jobs = [
      for (final b in ['TODAY', 'RUNNING', 'UPCOMING', 'DONE']) ...await api.driverJobs(bucket: b),
    ].map(DriverTrip.fromJson).toList();
    expect(jobs, isNotEmpty, reason: 'Seed có chuyến cho tài xế này');

    final trip = DriverTrip.fromJson(await api.driverTrip(jobs.first.id));
    expect(trip.code, startsWith('CX-'));
    expect(trip.stops, isNotEmpty);

    final pause = await api.catalogItems('PAUSE_REASON');
    expect(pause, isNotEmpty);
    final ledger = await api.driverLedger();
    expect(ledger.containsKey('codHeld'), isTrue);
    final noti = await api.notifications();
    expect(noti.containsKey('unreadCount'), isTrue);
    // ignore: avoid_print
    print('OK: ${me['name']} · ${jobs.length} chuyến · ${trip.code} ${trip.status.name} · ${trip.stops.length} điểm · COD giữ ${ledger['codHeld']}');
  }, skip: skip);
}
