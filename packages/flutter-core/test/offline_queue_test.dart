import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

void main() {
  late OfflineQueue q;
  setUpAll(() => sqfliteFfiInit());
  setUp(() async => q = await OfflineQueue.open(path: inMemoryDatabasePath, factory: databaseFactoryFfi));
  tearDown(() => q.close());

  test('enqueue gắn clientRequestId và giữ thứ tự capturedAt', () async {
    final b = await q.enqueue(QueueItemType.STOP_STATUS, {'stopId': 's2', 'status': 'ARRIVED'}, capturedAt: DateTime(2026, 9, 23, 9));
    final a = await q.enqueue(QueueItemType.TRIP_STATUS, {'tripId': 't1', 'status': 'TO_PICKUP'}, capturedAt: DateTime(2026, 9, 23, 8));
    expect(a.clientRequestId, isNotEmpty);
    expect(a.payload['clientRequestId'], a.clientRequestId);
    final pending = await q.pending();
    expect(pending.map((e) => e.id), [a.id, b.id]);
    expect(await q.pendingCount(), 2);
  });

  test('replay: done xóa khỏi pending, failed tăng attempts, skip dừng sớm', () async {
    await q.enqueue(QueueItemType.TRIP_STATUS, {'n': 1}, capturedAt: DateTime(2026, 1, 1));
    await q.enqueue(QueueItemType.COD, {'n': 2}, capturedAt: DateTime(2026, 1, 2));
    await q.enqueue(QueueItemType.UPLOAD, {'n': 3}, capturedAt: DateTime(2026, 1, 3));

    var r = await q.replay((item) async {
      if (item.payload['n'] == 1) return ReplayOutcome.done;
      if (item.payload['n'] == 2) throw Exception('server 500');
      return ReplayOutcome.skip;
    });
    expect(r.done, 1);
    expect(r.failed, 1);
    expect(r.stoppedEarly, isTrue);

    final pending = await q.pending();
    expect(pending.length, 2);
    final failed = pending.firstWhere((e) => e.payload['n'] == 2);
    expect(failed.status, QueueItemStatus.failed);
    expect(failed.attempts, 1);
    expect(failed.lastError, contains('server 500'));

    r = await q.replay((_) async => ReplayOutcome.done, onlyFailed: true);
    expect(r.done, 1);
    expect(await q.pendingCount(), 1);
  });
}
