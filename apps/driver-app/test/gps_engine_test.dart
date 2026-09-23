import 'dart:async';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:driver_app/core/gps/gps_buffer.dart';
import 'package:driver_app/core/gps/gps_tracker_engine.dart';
import 'package:driver_app/core/gps/tracking_store.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

class FakeSender implements GpsBatchSender {
  bool offline = false;
  ApiException? failWith;
  final sent = <({String id, String trip, int n})>[];
  final attempts = <String>[];
  @override
  Future<void> send({required String clientRequestId, required String tripId, required List<GpsPoint> points}) async {
    attempts.add(clientRequestId);
    if (offline) throw ApiException.network('offline');
    if (failWith != null) throw failWith!;
    sent.add((id: clientRequestId, trip: tripId, n: points.length));
  }
}

class FakeChecker implements RunningTripChecker {
  ActiveTrip? running;
  bool offline = false;
  @override
  Future<ActiveTrip?> runningTrip() async {
    if (offline) throw ApiException.network('offline');
    return running;
  }
}

GpsPoint pt(int i) => GpsPoint(lat: 10 + i / 1000, lng: 106 + i / 1000, recordedAt: DateTime.utc(2026, 9, 23, 3, 0, i));

void main() {
  late StreamController<GpsPoint> positions;
  late FakeSender sender;
  late FakeChecker checker;
  late MemoryTrackingStore store;
  late MemoryGpsBuffer buffer;
  late GpsTrackerEngine engine;
  var ids = 0;

  setUp(() {
    positions = StreamController<GpsPoint>.broadcast();
    sender = FakeSender();
    checker = FakeChecker();
    store = MemoryTrackingStore();
    buffer = MemoryGpsBuffer();
    ids = 0;
    engine = GpsTrackerEngine(
      positions: () => positions.stream,
      buffer: buffer,
      sender: sender,
      checker: checker,
      store: store,
      newId: () => 'batch-${++ids}',
      flushEvery: const Duration(hours: 1),
      checkEvery: const Duration(hours: 1),
      flushAtPoints: 20,
    );
  });

  tearDown(() async {
    await engine.dispose();
    await positions.close();
  });

  test('quyết định bật/tắt/đổi chuyến theo chuyến đang chạy trên server', () {
    const t1 = ActiveTrip(id: 't1');
    expect(decideTracking(currentTripId: null, running: null), TrackingAction.keep);
    expect(decideTracking(currentTripId: null, running: t1), TrackingAction.start);
    expect(decideTracking(currentTripId: 't1', running: t1), TrackingAction.keep);
    expect(decideTracking(currentTripId: 't0', running: t1), TrackingAction.switchTrip);
    expect(decideTracking(currentTripId: 't1', running: null), TrackingAction.stop);
  });

  test('gom lô: đủ 20 điểm tự gửi; ít hơn thì chờ flush định kỳ', () async {
    await engine.start(const ActiveTrip(id: 't1', code: 'CX-1'));
    for (var i = 0; i < 25; i++) {
      await engine.onPoint(pt(i));
    }
    expect(sender.sent.single.n, 20);
    expect(await buffer.pendingPoints(), 5);
    await engine.flush();
    expect(sender.sent.map((s) => s.n), [20, 5]);
    expect(await buffer.pendingPoints(), 0);
    expect(store.current.lastSentAt, isNotNull);
    expect(store.trip?.code, 'CX-1');
  });

  test('mất mạng: giữ điểm trong bộ đệm, gửi lại dùng đúng clientRequestId cũ (chống trùng)', () async {
    await engine.start(const ActiveTrip(id: 't1'));
    for (var i = 0; i < 3; i++) {
      await engine.onPoint(pt(i));
    }
    sender.offline = true;
    final r1 = await engine.flush();
    expect(r1.networkError, isTrue);
    expect(await buffer.pendingPoints(), 3);
    expect(store.current.lastError, contains('Mất mạng'));
    await engine.onPoint(pt(9)); // điểm mới trong lúc mất mạng → lô mới
    sender.offline = false;
    final r2 = await engine.flush();
    expect(r2.sent, 4);
    expect(sender.attempts.first, 'batch-1');
    expect(sender.sent.first.id, 'batch-1'); // lô cũ gửi lại cùng id
    expect(sender.sent.map((s) => s.n), [3, 1]);
    expect(store.current.lastError, isNull);
  });

  test('lỗi nghiệp vụ (chuyến đóng quá lâu) → bỏ lô; hết phiên → giữ lại', () async {
    await engine.start(const ActiveTrip(id: 't1'));
    await engine.onPoint(pt(1));
    sender.failWith = ApiException(code: 'UNAUTHENTICATED', message: 'x', statusCode: 401);
    final r = await engine.flush();
    expect(r.sessionLost, isTrue);
    expect(await buffer.pendingPoints(), 1);
    sender.failWith = ApiException(code: 'BUSINESS_RULE_VIOLATION', message: 'Chuyến không ở trạng thái đang chạy', statusCode: 422);
    final r2 = await engine.flush();
    expect(r2.dropped, 1);
    expect(await buffer.pendingPoints(), 0);
  });

  test('kiểm tra định kỳ: offline thì giữ; server báo hết chuyến → gửi nốt rồi dừng, xóa chuyến đã lưu', () async {
    var stopped = false;
    engine = GpsTrackerEngine(
      positions: () => positions.stream, buffer: buffer, sender: sender, checker: checker, store: store,
      newId: () => 'b${++ids}', flushEvery: const Duration(hours: 1), checkEvery: const Duration(hours: 1), onStopped: () => stopped = true,
    );
    checker.running = const ActiveTrip(id: 't1');
    expect(await engine.boot(), isTrue);
    expect(engine.tripId, 't1');
    await engine.onPoint(pt(1));
    checker.offline = true;
    expect(await engine.checkTrips(), isTrue);
    expect(engine.running, isTrue);
    checker.offline = false;
    checker.running = null;
    expect(await engine.checkTrips(), isFalse);
    expect(stopped, isTrue);
    expect(sender.sent.single.n, 1);
    expect(store.trip, isNull);
    expect(store.current.running, isFalse);
  });

  test('boot: có chuyến đã lưu (vd. sau reboot / iOS đánh thức) → chạy tiếp không cần hỏi server', () async {
    store.trip = const ActiveTrip(id: 't7', code: 'CX-7');
    expect(await engine.boot(), isTrue);
    expect(engine.tripId, 't7');
    positions.add(pt(1));
    await Future<void>.delayed(Duration.zero);
    await Future<void>.delayed(Duration.zero);
    expect(await buffer.pendingPoints(), 1);
  });

  test('đổi chuyến: gửi nốt điểm chuyến cũ rồi ghi cho chuyến mới', () async {
    checker.running = const ActiveTrip(id: 't1');
    await engine.boot();
    await engine.onPoint(pt(1));
    checker.running = const ActiveTrip(id: 't2');
    await engine.checkTrips();
    expect(sender.sent.single.trip, 't1');
    await engine.onPoint(pt(2));
    await engine.flush();
    expect(sender.sent.last.trip, 't2');
  });

  group('SqfliteGpsBuffer', () {
    setUpAll(sqfliteFfiInit);

    test('lưu điểm, đóng lô theo chuyến (≤ maxPerBatch), điểm mới không lẫn lô cũ, gửi xong xóa', () async {
      final path = inMemoryDatabasePath;
      final b = await SqfliteGpsBuffer.open(factory: databaseFactoryFfi, path: path);
      for (var i = 0; i < 5; i++) {
        await b.add('t1', pt(i));
      }
      await b.add('t2', pt(10));
      var n = 0;
      await b.seal(() => 'L${++n}', maxPerBatch: 3);
      final batches = await b.batches();
      expect(batches.map((x) => (x.tripId, x.points.length)).toList(), [('t1', 3), ('t1', 2), ('t2', 1)]);
      expect(batches.first.points.first.lat, closeTo(10.0, 1e-9));
      await b.markFailed(batches.first.batchId);
      expect((await b.batches()).first.attempts, 1);
      // điểm mới sau khi đóng lô không lẫn vào lô cũ
      await b.add('t1', pt(20));
      await b.seal(() => 'L${++n}');
      expect((await b.batches()).length, 4);
      await b.remove(batches.first.batchId);
      expect(await b.pendingPoints(), 4);
      await b.close();
    });
  });
}
