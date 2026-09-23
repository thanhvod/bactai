import 'package:bta_flutter_core/bta_flutter_core.dart';

import '../../../core/api/driver_api.dart';
import '../../../core/cache/json_cache.dart';
import '../domain/jobs_repository.dart';
import '../domain/models.dart';

String _iso(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

/// Online-first: gọi API; lỗi mạng → trả cache gần nhất (stale). Thao tác offline ghi đè tạm (overlay) theo chuyến.
class GraphqlJobsRepository implements JobsRepository {
  GraphqlJobsRepository(this._api, this._cache);
  final DriverApi _api;
  final JsonCache _cache;
  final Map<String, DriverTrip> _overlay = {};

  DriverTrip _apply(DriverTrip t) => _overlay[t.id] ?? t;

  @override
  Future<({List<DriverTrip> items, bool stale})> jobs({JobBucket bucket = JobBucket.today, String? date}) async {
    final key = 'jobs:${bucket.api}:${date ?? ''}';
    try {
      final raw = await _api.driverJobs(bucket: date == null ? bucket.api : null, date: date);
      await _cache.write(key, raw);
      for (final t in raw) {
        await _cache.write('trip:${t['id']}', t);
      }
      final items = raw.map(DriverTrip.fromJson).toList();
      // Dữ liệu server mới → bỏ overlay của chuyến đã đồng bộ khớp trạng thái.
      for (final t in items) {
        final o = _overlay[t.id];
        if (o != null && !o.pendingSync) _overlay.remove(t.id);
      }
      return (items: items.map(_apply).toList(), stale: false);
    } on ApiException catch (e) {
      if (!e.isNetwork) rethrow;
      final cached = await _cache.read(key);
      if (cached == null) rethrow;
      return (items: (cached as List).map((e) => _apply(DriverTrip.fromJson(e as Map<String, dynamic>))).toList(), stale: true);
    }
  }

  @override
  Future<({DriverTrip trip, bool stale})> trip(String id) async {
    try {
      final raw = await _api.driverTrip(id);
      await _cache.write('trip:$id', raw);
      final t = DriverTrip.fromJson(raw);
      final o = _overlay[id];
      if (o != null && !o.pendingSync) _overlay.remove(id);
      return (trip: _apply(t), stale: false);
    } on ApiException catch (e) {
      if (!e.isNetwork) rethrow;
      if (_overlay[id] != null) return (trip: _overlay[id]!, stale: true);
      final cached = await _cache.read('trip:$id');
      if (cached == null) rethrow;
      return (trip: DriverTrip.fromJson(cached as Map<String, dynamic>), stale: true);
    }
  }

  @override
  Future<List<CalendarDay>> calendar(DateTime from, DateTime to) async {
    final key = 'calendar:${_iso(from)}:${_iso(to)}';
    try {
      final raw = await _api.driverJobCalendar(_iso(from), _iso(to));
      await _cache.write(key, raw);
      return raw.map(CalendarDay.fromJson).toList();
    } on ApiException catch (e) {
      if (!e.isNetwork) rethrow;
      final cached = await _cache.read(key);
      if (cached == null) rethrow;
      return (cached as List).map((e) => CalendarDay.fromJson(e as Map<String, dynamic>)).toList();
    }
  }

  @override
  Future<({DriverTrip trip, DriverStop stop, bool stale})> stop(String stopId) async {
    // Tìm chuyến chứa stop: overlay → danh sách đang chạy/hôm nay (API) → cache.
    for (final t in _overlay.values) {
      final s = t.stops.where((x) => x.id == stopId).firstOrNull;
      if (s != null) {
        try {
          final fresh = await trip(t.id);
          final fs = fresh.trip.stops.firstWhere((x) => x.id == stopId);
          return (trip: fresh.trip, stop: fs, stale: fresh.stale);
        } catch (_) {
          return (trip: t, stop: s, stale: true);
        }
      }
    }
    for (final b in [JobBucket.running, JobBucket.today, JobBucket.upcoming, JobBucket.done]) {
      final r = await jobs(bucket: b);
      for (final t in r.items) {
        final s = t.stops.where((x) => x.id == stopId).firstOrNull;
        if (s != null) return (trip: t, stop: s, stale: r.stale);
      }
    }
    throw ApiException(code: 'NOT_FOUND', message: 'Không tìm thấy điểm dừng');
  }

  @override
  Future<void> cacheTrip(DriverTrip trip, Map<String, dynamic>? raw) async {
    if (raw != null) {
      await _cache.write('trip:${trip.id}', raw);
      _overlay.remove(trip.id);
    } else {
      _overlay[trip.id] = trip;
    }
  }

  @override
  void clearOverlays() => _overlay.clear();
}
