
import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:driver_app/core/cache/json_cache.dart';
import 'package:driver_app/core/gps/device_setup.dart';
import 'package:driver_app/core/gps/location_source.dart';
import 'package:driver_app/core/gps/tracking_store.dart';
import 'package:driver_app/features/field/data/field_repository.dart';
import 'package:driver_app/features/field/presentation/cubit/trip_cubit.dart';
import 'package:driver_app/features/gps/presentation/cubit/gps_cubit.dart';
import 'package:driver_app/features/jobs/data/graphql_jobs_repository.dart';
import 'package:flutter_test/flutter_test.dart';

import 'fakes.dart';

void main() {
  late FakeDriverApi api;
  late FakeQueue queue;
  late FakeGpsApi gps;
  late FieldRepository field;
  late GraphqlJobsRepository jobs;

  setUp(() {
    api = FakeDriverApi();
    queue = FakeQueue();
    gps = FakeGpsApi();
    jobs = GraphqlJobsRepository(api, MemoryJsonCache());
    field = FieldRepository(api: api, jobs: jobs, queue: queue, upload: FakeUploadApi(), gps: gps);
  });

  test('TripCubit: load → đổi trạng thái online; offline → thông báo "sẽ tự gửi" (tone warning)', () async {
    final c = TripCubit(jobs, field);
    await c.load('trip-1');
    expect(c.state.trip!.status, TripStatus.IN_TRANSIT);
    expect(await c.changeStatus(TripStatus.DELIVERING), isTrue);
    expect(c.state.trip!.status, TripStatus.DELIVERING);
    expect(c.state.messageTone, BtaTone.success);

    api.offline = true;
    expect(await c.changeStopStatus('s-2', StopStatus.COMPLETED), isTrue);
    expect(c.state.stop('s-2')!.status, StopStatus.COMPLETED);
    expect(c.state.stop('s-2')!.pendingSync, isTrue);
    expect(c.state.message, contains('sẽ tự gửi'));
    expect(c.state.messageTone, BtaTone.warning);
    await c.close();
  });

  test('TripCubit: không có quyền xem chuyến → thông báo rõ', () async {
    api.failWith = ApiException(code: 'NOT_FOUND', message: 'Không tìm thấy chuyến');
    final c = TripCubit(jobs, field);
    await c.load('x');
    expect(c.state.error, contains('không có quyền'));
    await c.close();
  });

  test('GpsCubit: có chuyến chạy → bật dịch vụ nền (kèm mã chuyến); hết chuyến → tắt', () async {
    final ctl = FakeBackgroundGpsController();
    final g = GpsCubit(FakeLocationSource()..permission = GpsPermission.always, ctl, FakeDeviceSetup());
    await g.ensureTracking(null);
    expect(ctl.calls, isEmpty);
    await g.ensureTracking('trip-1', tripCode: 'CX-202609-0001');
    expect(g.state.tracking, isTrue);
    expect(ctl.calls, ['start:trip-1:CX-202609-0001']);
    // gọi lại cùng chuyến không khởi động lại
    await g.ensureTracking('trip-1', tripCode: 'CX-202609-0001');
    expect(ctl.calls.length, 1);
    await g.ensureTracking(null);
    expect(ctl.calls.last, 'stop');
    expect(g.state.tracking, isFalse);
    expect(g.state.tripId, isNull);
    await g.close();
  });

  test('GpsCubit: chưa cấp quyền → chưa bật; xin "khi dùng app" rồi "Luôn cho phép"', () async {
    final src = FakeLocationSource()..permission = GpsPermission.denied;
    final ctl = FakeBackgroundGpsController();
    final g = GpsCubit(src, ctl, FakeDeviceSetup());
    await g.ensureTracking('trip-1');
    expect(g.state.tracking, isFalse);
    expect(g.state.tripId, 'trip-1');
    await g.requestPermission();
    expect(g.state.permission, GpsPermission.whileInUse);
    expect(g.state.tracking, isTrue);
    expect(g.state.backgroundReady, isFalse);
    await g.requestAlways();
    expect(g.state.backgroundReady, isTrue);
    expect(ctl.calls.where((c) => c.startsWith('start')).length, 1);
    await g.close();
  });

  test('GpsCubit: đọc tình trạng dịch vụ nền; tối ưu pin/thông báo', () async {
    final ctl = FakeBackgroundGpsController()
      ..running = true
      ..current = TrackingStatus(running: true, pendingPoints: 7, lastSentAt: DateTime(2026, 9, 23, 10), lastError: 'Mất mạng');
    final dev = FakeDeviceSetup(notifications: false, battery: false);
    final g = GpsCubit(FakeLocationSource(), ctl, dev);
    await g.refreshPermission();
    expect(g.state.pendingPoints, 7);
    expect(g.state.tracking, isTrue);
    expect(g.state.notificationsGranted, isFalse);
    await g.requestNotifications();
    await g.requestBatteryUnrestricted();
    expect(g.state.notificationsGranted && g.state.batteryUnrestricted, isTrue);
    await g.flush();
    expect(ctl.flushes, 1);
    await g.close();
  });
}

