import 'dart:convert';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

/// Lô điểm GPS đã "đóng" — có clientRequestId cố định, gửi lại bao nhiêu lần cũng dùng đúng id này
/// để backend chống ghi trùng.
class GpsBufferedBatch {
  const GpsBufferedBatch({required this.batchId, required this.tripId, required this.points, required this.attempts});
  final String batchId;
  final String tripId;
  final List<GpsPoint> points;
  final int attempts;
}

/// Bộ đệm GPS bền vững (sống sót khi app/dịch vụ bị hệ điều hành dừng, mất mạng).
abstract class GpsBuffer {
  Future<void> add(String tripId, GpsPoint point);
  Future<int> pendingPoints();
  /// Gom các điểm chưa thuộc lô nào thành lô mới (tối đa [maxPerBatch] điểm/lô), gán id bằng [newId].
  Future<void> seal(String Function() newId, {int maxPerBatch = 200});
  Future<List<GpsBufferedBatch>> batches();
  Future<void> remove(String batchId);
  Future<void> markFailed(String batchId);
}

class SqfliteGpsBuffer implements GpsBuffer {
  SqfliteGpsBuffer(this._db);
  final Database _db;

  static Future<SqfliteGpsBuffer> open({DatabaseFactory? factory, String? path}) async {
    final f = factory ?? databaseFactory;
    final dbPath = path ?? p.join(await f.getDatabasesPath(), 'bta_gps_buffer.db');
    final db = await f.openDatabase(dbPath,
        options: OpenDatabaseOptions(
          version: 1,
          onCreate: (db, _) => db.execute(
              'CREATE TABLE points (id INTEGER PRIMARY KEY AUTOINCREMENT, tripId TEXT NOT NULL, json TEXT NOT NULL, recordedAt TEXT NOT NULL, batchId TEXT, attempts INTEGER NOT NULL DEFAULT 0)'),
        ));
    return SqfliteGpsBuffer(db);
  }

  @override
  Future<void> add(String tripId, GpsPoint point) async {
    await _db.insert('points', {'tripId': tripId, 'json': jsonEncode(point.toJson()), 'recordedAt': point.recordedAt.toUtc().toIso8601String()});
  }

  @override
  Future<int> pendingPoints() async => Sqflite.firstIntValue(await _db.rawQuery('SELECT COUNT(*) FROM points')) ?? 0;

  @override
  Future<void> seal(String Function() newId, {int maxPerBatch = 200}) async {
    await _db.transaction((tx) async {
      final rows = await tx.query('points', columns: ['id', 'tripId'], where: 'batchId IS NULL', orderBy: 'recordedAt, id');
      final byTrip = <String, List<int>>{};
      for (final r in rows) {
        byTrip.putIfAbsent(r['tripId'] as String, () => []).add(r['id'] as int);
      }
      for (final ids in byTrip.values) {
        for (var i = 0; i < ids.length; i += maxPerBatch) {
          final chunk = ids.sublist(i, i + maxPerBatch > ids.length ? ids.length : i + maxPerBatch);
          await tx.update('points', {'batchId': newId()}, where: 'id IN (${List.filled(chunk.length, '?').join(',')})', whereArgs: chunk);
        }
      }
    });
  }

  @override
  Future<List<GpsBufferedBatch>> batches() async {
    final rows = await _db.query('points', where: 'batchId IS NOT NULL', orderBy: 'id');
    final map = <String, List<Map<String, Object?>>>{};
    for (final r in rows) {
      map.putIfAbsent(r['batchId'] as String, () => []).add(r);
    }
    return map.entries
        .map((e) => GpsBufferedBatch(
              batchId: e.key,
              tripId: e.value.first['tripId'] as String,
              points: e.value.map((r) => GpsPoint.fromJson(jsonDecode(r['json'] as String) as Map<String, dynamic>)).toList(),
              attempts: e.value.first['attempts'] as int,
            ))
        .toList();
  }

  @override
  Future<void> remove(String batchId) async {
    await _db.delete('points', where: 'batchId = ?', whereArgs: [batchId]);
  }

  @override
  Future<void> markFailed(String batchId) async {
    await _db.rawUpdate('UPDATE points SET attempts = attempts + 1 WHERE batchId = ?', [batchId]);
  }

  Future<void> close() => _db.close();
}

class MemoryGpsBuffer implements GpsBuffer {
  final _rows = <({String tripId, GpsPoint point, String? batchId, int attempts})>[];

  @override
  Future<void> add(String tripId, GpsPoint point) async => _rows.add((tripId: tripId, point: point, batchId: null, attempts: 0));

  @override
  Future<int> pendingPoints() async => _rows.length;

  @override
  Future<void> seal(String Function() newId, {int maxPerBatch = 200}) async {
    final trips = _rows.where((r) => r.batchId == null).map((r) => r.tripId).toSet();
    for (final t in trips) {
      var count = 0;
      String? id;
      for (var i = 0; i < _rows.length; i++) {
        final r = _rows[i];
        if (r.batchId != null || r.tripId != t) continue;
        if (id == null || count >= maxPerBatch) {
          id = newId();
          count = 0;
        }
        _rows[i] = (tripId: r.tripId, point: r.point, batchId: id, attempts: 0);
        count++;
      }
    }
  }

  @override
  Future<List<GpsBufferedBatch>> batches() async {
    final ids = <String>[];
    for (final r in _rows) {
      if (r.batchId != null && !ids.contains(r.batchId)) ids.add(r.batchId!);
    }
    return ids.map((id) {
      final rs = _rows.where((r) => r.batchId == id).toList();
      return GpsBufferedBatch(batchId: id, tripId: rs.first.tripId, points: rs.map((r) => r.point).toList(), attempts: rs.first.attempts);
    }).toList();
  }

  @override
  Future<void> remove(String batchId) async => _rows.removeWhere((r) => r.batchId == batchId);

  @override
  Future<void> markFailed(String batchId) async {
    for (var i = 0; i < _rows.length; i++) {
      final r = _rows[i];
      if (r.batchId == batchId) _rows[i] = (tripId: r.tripId, point: r.point, batchId: r.batchId, attempts: r.attempts + 1);
    }
  }
}
