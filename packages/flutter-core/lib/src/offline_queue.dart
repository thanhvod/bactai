import 'dart:convert';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';
import 'package:uuid/uuid.dart';

/// Loại thao tác có thể xếp hàng khi mất mạng (doc/4-DESIGN/03 §11). Tên khớp API.
// ignore: constant_identifier_names
enum QueueItemType { TRIP_STATUS, STOP_STATUS, COD, UPLOAD, GPS_BATCH, INCIDENT }

enum QueueItemStatus { pending, failed, done }

class QueueItem {
  const QueueItem({
    required this.id,
    required this.type,
    required this.payload,
    required this.clientRequestId,
    required this.capturedAt,
    this.entityLabel,
    this.attempts = 0,
    this.status = QueueItemStatus.pending,
    this.lastError,
  });

  final int id;
  final QueueItemType type;
  final Map<String, dynamic> payload;
  /// Luôn có, để backend idempotent khi gửi lại.
  final String clientRequestId;
  final DateTime capturedAt;
  final String? entityLabel;
  final int attempts;
  final QueueItemStatus status;
  final String? lastError;

  static QueueItem fromRow(Map<String, Object?> r) => QueueItem(
        id: r['id'] as int,
        type: QueueItemType.values.byName(r['type'] as String),
        payload: jsonDecode(r['payload'] as String) as Map<String, dynamic>,
        clientRequestId: r['client_request_id'] as String,
        capturedAt: DateTime.parse(r['captured_at'] as String),
        entityLabel: r['entity_label'] as String?,
        attempts: r['attempts'] as int,
        status: QueueItemStatus.values.byName(r['status'] as String),
        lastError: r['last_error'] as String?,
      );
}

/// Kết quả replay 1 mục: done → xóa khỏi pending; failed → giữ lại, tăng attempts; skip → giữ nguyên (ví dụ đang offline).
enum ReplayOutcome { done, failed, skip }

typedef ReplayHandler = Future<ReplayOutcome> Function(QueueItem item);

/// Hàng đợi offline lưu sqflite. Thứ tự replay theo capturedAt (cũ trước) để trạng thái đúng thứ tự.
/// App cung cấp `ReplayHandler` gọi API tương ứng; queue không biết API.
class OfflineQueue {
  OfflineQueue._(this._db);

  static const _table = 'queue';
  static const int maxAttempts = 10;
  final Database _db;
  static const _uuid = Uuid();

  /// `databaseFactory` cho phép test bằng sqflite_common_ffi; `path` null → thư mục DB mặc định.
  static Future<OfflineQueue> open({String? path, DatabaseFactory? factory}) async {
    final f = factory ?? databaseFactory;
    final dbPath = path ?? p.join(await f.getDatabasesPath(), 'bta_offline_queue.db');
    final db = await f.openDatabase(
      dbPath,
      options: OpenDatabaseOptions(
        version: 1,
        onCreate: (db, _) => db.execute('''
          CREATE TABLE $_table (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            payload TEXT NOT NULL,
            client_request_id TEXT NOT NULL UNIQUE,
            entity_label TEXT,
            captured_at TEXT NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'pending',
            last_error TEXT
          )'''),
      ),
    );
    return OfflineQueue._(db);
  }

  static String newClientRequestId() => _uuid.v4();

  /// Thêm mục vào hàng đợi. Payload sẽ được gắn `clientRequestId` nếu chưa có.
  Future<QueueItem> enqueue(QueueItemType type, Map<String, dynamic> payload, {String? entityLabel, DateTime? capturedAt, String? clientRequestId}) async {
    final cid = clientRequestId ?? (payload['clientRequestId'] as String?) ?? newClientRequestId();
    final body = {...payload, 'clientRequestId': cid};
    final at = capturedAt ?? DateTime.now();
    final id = await _db.insert(_table, {
      'type': type.name,
      'payload': jsonEncode(body),
      'client_request_id': cid,
      'entity_label': entityLabel,
      'captured_at': at.toIso8601String(),
      'attempts': 0,
      'status': QueueItemStatus.pending.name,
    });
    return QueueItem(id: id, type: type, payload: body, clientRequestId: cid, capturedAt: at, entityLabel: entityLabel);
  }

  Future<List<QueueItem>> pending() async {
    final rows = await _db.query(_table, where: 'status != ?', whereArgs: [QueueItemStatus.done.name], orderBy: 'captured_at ASC, id ASC');
    return rows.map(QueueItem.fromRow).toList();
  }

  Future<List<QueueItem>> all() async {
    final rows = await _db.query(_table, orderBy: 'captured_at ASC, id ASC');
    return rows.map(QueueItem.fromRow).toList();
  }

  Future<int> pendingCount() async {
    final r = await _db.rawQuery('SELECT COUNT(*) c FROM $_table WHERE status != ?', [QueueItemStatus.done.name]);
    return (r.first['c'] as int?) ?? 0;
  }

  Future<void> markDone(int id) => _db.update(_table, {'status': QueueItemStatus.done.name, 'last_error': null}, where: 'id = ?', whereArgs: [id]);

  Future<void> markFailed(int id, String error) =>
      _db.rawUpdate('UPDATE $_table SET status = ?, attempts = attempts + 1, last_error = ? WHERE id = ?', [QueueItemStatus.failed.name, error, id]);

  Future<void> remove(int id) => _db.delete(_table, where: 'id = ?', whereArgs: [id]);

  Future<void> clearDone() => _db.delete(_table, where: 'status = ?', whereArgs: [QueueItemStatus.done.name]);

  /// Gửi lại các mục chờ theo thứ tự; dừng sớm khi handler trả `skip` (mất mạng).
  /// `onlyFailed` = chỉ retry mục lỗi; `ids` = retry một số mục cụ thể.
  Future<ReplaySummary> replay(ReplayHandler handler, {bool onlyFailed = false, Set<int>? ids}) async {
    var done = 0, failed = 0, skipped = 0;
    for (final item in await pending()) {
      if (ids != null && !ids.contains(item.id)) continue;
      if (onlyFailed && item.status != QueueItemStatus.failed) continue;
      ReplayOutcome outcome;
      String? error;
      try {
        outcome = await handler(item);
      } catch (e) {
        outcome = ReplayOutcome.failed;
        error = e.toString();
      }
      switch (outcome) {
        case ReplayOutcome.done:
          await markDone(item.id);
          done++;
        case ReplayOutcome.failed:
          await markFailed(item.id, error ?? 'Gửi thất bại');
          failed++;
        case ReplayOutcome.skip:
          skipped++;
          return ReplaySummary(done: done, failed: failed, skipped: skipped + 1, stoppedEarly: true);
      }
    }
    return ReplaySummary(done: done, failed: failed, skipped: skipped);
  }

  Future<void> close() => _db.close();
}

class ReplaySummary {
  const ReplaySummary({required this.done, required this.failed, required this.skipped, this.stoppedEarly = false});
  final int done;
  final int failed;
  final int skipped;
  final bool stoppedEarly;
}
