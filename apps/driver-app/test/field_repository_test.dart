import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:driver_app/core/cache/json_cache.dart';
import 'package:driver_app/features/field/data/field_repository.dart';
import 'package:driver_app/features/field/domain/field_models.dart';
import 'package:driver_app/features/jobs/data/graphql_jobs_repository.dart';
import 'package:driver_app/features/jobs/domain/jobs_repository.dart';
import 'package:driver_app/features/jobs/domain/models.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

import 'fakes.dart';

void main() {
  late FakeDriverApi api;
  late FakeQueue queue;
  late FakeGpsApi gps;
  late GraphqlJobsRepository jobs;
  late FieldRepository field;
  var n = 0;

  setUp(() {
    api = FakeDriverApi();
    queue = FakeQueue();
    gps = FakeGpsApi();
    jobs = GraphqlJobsRepository(api, MemoryJsonCache());
    field = FieldRepository(api: api, jobs: jobs, queue: queue, upload: FakeUploadApi(), gps: gps, newId: () => 'cid-${++n}');
  });

  DriverTrip trip() => DriverTrip.fromJson(tripJson());

  group('Đổi trạng thái chuyến (DRV-ACT-001)', () {
    test('online: gọi API ngay với idempotencyKey, không xếp hàng', () async {
      final r = await field.changeTripStatus(trip(), TripStatus.DELIVERING);
      expect(r.queued, isFalse);
      expect(r.value!.status, TripStatus.DELIVERING);
      final (name, args) = api.calls.single;
      expect(name, 'updateTripStatus');
      expect(args['idempotencyKey'], startsWith('cid-'));
      expect(args['status'], 'DELIVERING');
      expect(queue.items, isEmpty);
    });

    test('mất mạng: xếp TRIP_STATUS với cùng clientRequestId, UI cập nhật lạc quan + cache overlay', () async {
      api.offline = true;
      final r = await field.changeTripStatus(trip(), TripStatus.PAUSED, pauseReasonId: 'r1', pauseReasonLabel: 'Kẹt xe');
      expect(r.queued, isTrue);
      expect(r.value!.status, TripStatus.PAUSED);
      expect(r.value!.previousStatusBeforePause, TripStatus.IN_TRANSIT);
      expect(r.value!.allowedNextStatuses, [TripStatus.IN_TRANSIT]);
      final (type, payload, cid) = queue.items.single;
      expect(type, QueueItemType.TRIP_STATUS);
      expect(payload['clientRequestId'], cid);
      expect(payload['pauseReasonId'], 'r1');
      // Mở lại chuyến khi vẫn offline → thấy trạng thái lạc quan
      final cached = await jobs.trip('trip-1');
      expect(cached.trip.status, TripStatus.PAUSED);
      expect(cached.stale, isTrue);
    });

    test('lỗi nghiệp vụ (không phải mạng) → ném ra, không xếp hàng', () async {
      api.failWith = ApiException(code: 'FORBIDDEN', message: 'Chuyến không được giao cho bạn');
      expect(() => field.changeTripStatus(trip(), TripStatus.DELIVERING), throwsA(isA<ApiException>()));
      expect(queue.items, isEmpty);
    });
  });

  group('COD (DRV-ACT-003)', () {
    test('sửa COD đã lưu mà thiếu lý do → SENSITIVE_REASON_REQUIRED, không gọi API', () async {
      final t = DriverTrip.fromJson(tripJson(codActual: 12000000));
      final stop = t.stops[1];
      await expectLater(field.submitCod(t, stop, 11500000), throwsA(predicate((e) => e is ApiException && e.code == 'SENSITIVE_REASON_REQUIRED')));
      expect(api.calls, isEmpty);
      final r = await field.submitCod(t, stop, 11500000, reason: 'Khách trả thiếu 500k');
      expect(api.calls.single.$2['reason'], 'Khách trả thiếu 500k');
      expect(r.value!.codActual, 11500000);
      expect(r.warnings, isNotEmpty);
    });

    test('nhập lần đầu không cần lý do; offline → xếp COD', () async {
      api.offline = true;
      final t = trip();
      final r = await field.submitCod(t, t.stops[1], 12500000);
      expect(r.queued, isTrue);
      expect(r.value!.codActual, 12500000);
      expect(queue.items.single.$1, QueueItemType.COD);
      expect(queue.items.single.$2.containsKey('reason'), isFalse);
    });
  });

  group('Replay hàng đợi (DA-SYNC-01)', () {
    QueueItem item(QueueItemType t, Map<String, dynamic> p, {String cid = 'q-1'}) => QueueItem(id: 1, type: t, payload: {...p, 'clientRequestId': cid}, clientRequestId: cid, capturedAt: DateTime.now());

    test('gọi đúng mutation với idempotencyKey = clientRequestId', () async {
      expect(await field.replay(item(QueueItemType.TRIP_STATUS, {'tripId': 'trip-1', 'status': 'DELIVERING'}, cid: 'k1')), ReplayOutcome.done);
      expect(api.calls.last.$1, 'updateTripStatus');
      expect(api.calls.last.$2['idempotencyKey'], 'k1');
      expect(api.calls.last.$2.containsKey('clientRequestId'), isFalse);

      await field.replay(item(QueueItemType.TRIP_STATUS, {'tripId': 'trip-1', 'resume': true}, cid: 'k2'));
      expect(api.calls.last.$1, 'resumeTrip');
      expect(api.calls.last.$2['idempotencyKey'], 'k2');

      await field.replay(item(QueueItemType.STOP_STATUS, {'stopId': 's-2', 'tripId': 'trip-1', 'status': 'COMPLETED'}, cid: 'k3'));
      expect(api.calls.last.$1, 'updateStopStatus');
      expect(api.calls.last.$2['idempotencyKey'], 'k3');

      await field.replay(item(QueueItemType.COD, {'stopId': 's-2', 'amount': 1000}, cid: 'k4'));
      expect(api.calls.last.$1, 'submitCod');
      expect(api.calls.last.$2['idempotencyKey'], 'k4');

      await field.replay(item(QueueItemType.INCIDENT, {'tripId': 'trip-1', 'title': 'Thủng lốp', 'severity': 'HIGH'}, cid: 'k5'));
      expect(api.calls.last.$1, 'reportIncident');
      expect(api.calls.last.$2['idempotencyKey'], 'k5');

      await field.replay(item(QueueItemType.GPS_BATCH, {
        'tripId': 'trip-1',
        'points': [GpsPoint(lat: 10.8, lng: 106.6, recordedAt: DateTime.now()).toJson()],
      }, cid: 'k6'));
      expect(gps.sent.single, ('k6', 'trip-1', 1));
    });

    test('mất mạng khi replay → skip (dừng vòng); lỗi nghiệp vụ → failed', () async {
      api.offline = true;
      expect(await field.replay(item(QueueItemType.COD, {'stopId': 's-2', 'amount': 1})), ReplayOutcome.skip);
      api.offline = false;
      api.failWith = ApiException(code: 'SENSITIVE_REASON_REQUIRED', message: 'Thao tác nhạy cảm cần nhập lý do');
      expect(() => field.replay(item(QueueItemType.COD, {'stopId': 's-2', 'amount': 1})), throwsException);
    });

    test('UPLOAD mà file đã mất → failed', () async {
      expect(
        () => field.replay(item(QueueItemType.UPLOAD, {'entityType': 'ORDER_STOP', 'entityId': 's-2', 'category': 'POD', 'filePath': '/khong/ton/tai.jpg', 'fileName': 'a.jpg', 'contentType': 'image/jpeg'})),
        throwsException,
      );
    });

    test('OfflineQueue thật (sqflite ffi): enqueue offline → có mạng → replay gửi hết theo thứ tự', () async {
      sqfliteFfiInit();
      final q = await OfflineQueue.open(path: inMemoryDatabasePath, factory: databaseFactoryFfi);
      api.offline = true;
      final realQueue = _QueueAdapter(q);
      final f = FieldRepository(api: api, jobs: jobs, queue: realQueue, upload: FakeUploadApi(), gps: gps);
      final t = trip();
      await f.changeTripStatus(t, TripStatus.DELIVERING);
      await f.submitCod(t, t.stops[1], 12500000);
      expect(await q.pendingCount(), 2);
      final keys = (await q.pending()).map((e) => e.clientRequestId).toList();

      final s1 = await q.replay(f.replay);
      expect(s1.stoppedEarly, isTrue);
      expect(await q.pendingCount(), 2);

      api.offline = false;
      api.calls.clear();
      final s2 = await q.replay(f.replay);
      expect(s2.done, 2);
      expect(api.calls.map((c) => c.$1), ['updateTripStatus', 'submitCod']);
      expect(api.calls.map((c) => c.$2['idempotencyKey']), keys);
      await q.close();
    });
  });

  test('GPS offline → xếp GPS_BATCH', () async {
    gps.offline = true;
    final r = await field.sendGps('trip-1', [GpsPoint(lat: 1, lng: 2, recordedAt: DateTime.now())]);
    expect(r.queued, isTrue);
    expect(queue.items.single.$1, QueueItemType.GPS_BATCH);
  });

  test('JobsRepository: mất mạng → trả cache lần tải trước (stale)', () async {
    await jobs.jobs(bucket: JobBucket.today);
    api.offline = true;
    final r = await jobs.jobs(bucket: JobBucket.today);
    expect(r.stale, isTrue);
    expect(r.items.single.code, 'CX-202609-0001');
  });
}

class _QueueAdapter implements ActionQueue {
  _QueueAdapter(this.q);
  final OfflineQueue q;
  @override
  Future<void> enqueue(QueueItemType type, Map<String, dynamic> payload, {String? entityLabel, String? clientRequestId}) =>
      q.enqueue(type, payload, entityLabel: entityLabel, clientRequestId: clientRequestId);
}
