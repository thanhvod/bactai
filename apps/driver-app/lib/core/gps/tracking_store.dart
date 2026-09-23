import 'package:shared_preferences/shared_preferences.dart';

/// Trạng thái theo dõi GPS dùng chung giữa UI isolate và isolate dịch vụ nền (D-016).
/// UI ghi chuyến đang chạy; dịch vụ nền đọc để biết ghi cho chuyến nào và ghi lại tình trạng gửi.
abstract class TrackingStore {
  Future<ActiveTrip?> activeTrip();
  Future<void> setActiveTrip(ActiveTrip? trip);
  Future<TrackingStatus> status();
  Future<void> saveStatus(TrackingStatus status);
}

class ActiveTrip {
  const ActiveTrip({required this.id, this.code});
  final String id;
  final String? code;
}

class TrackingStatus {
  const TrackingStatus({this.running = false, this.lastPointAt, this.lastSentAt, this.pendingPoints = 0, this.lastError, this.heartbeatAt});
  final bool running;
  final DateTime? lastPointAt;
  final DateTime? lastSentAt;
  final int pendingPoints;
  final String? lastError;
  final DateTime? heartbeatAt;

  TrackingStatus copyWith({bool? running, DateTime? lastPointAt, DateTime? lastSentAt, int? pendingPoints, String? lastError, bool clearError = false, DateTime? heartbeatAt}) => TrackingStatus(
        running: running ?? this.running,
        lastPointAt: lastPointAt ?? this.lastPointAt,
        lastSentAt: lastSentAt ?? this.lastSentAt,
        pendingPoints: pendingPoints ?? this.pendingPoints,
        lastError: clearError ? null : (lastError ?? this.lastError),
        heartbeatAt: heartbeatAt ?? this.heartbeatAt,
      );
}

class PrefsTrackingStore implements TrackingStore {
  static const _kTrip = 'bta.gps.activeTripId';
  static const _kCode = 'bta.gps.activeTripCode';
  static const _kRunning = 'bta.gps.running';
  static const _kLastPoint = 'bta.gps.lastPointAt';
  static const _kLastSent = 'bta.gps.lastSentAt';
  static const _kPending = 'bta.gps.pending';
  static const _kError = 'bta.gps.lastError';
  static const _kBeat = 'bta.gps.heartbeatAt';

  Future<SharedPreferences> get _p async {
    final p = await SharedPreferences.getInstance();
    await p.reload(); // đọc giá trị do isolate khác ghi
    return p;
  }

  @override
  Future<ActiveTrip?> activeTrip() async {
    final p = await _p;
    final id = p.getString(_kTrip);
    return id == null ? null : ActiveTrip(id: id, code: p.getString(_kCode));
  }

  @override
  Future<void> setActiveTrip(ActiveTrip? trip) async {
    final p = await _p;
    if (trip == null) {
      await p.remove(_kTrip);
      await p.remove(_kCode);
    } else {
      await p.setString(_kTrip, trip.id);
      if (trip.code != null) {
        await p.setString(_kCode, trip.code!);
      } else {
        await p.remove(_kCode);
      }
    }
  }

  DateTime? _date(SharedPreferences p, String k) {
    final v = p.getString(k);
    return v == null ? null : DateTime.tryParse(v);
  }

  @override
  Future<TrackingStatus> status() async {
    final p = await _p;
    return TrackingStatus(
      running: p.getBool(_kRunning) ?? false,
      lastPointAt: _date(p, _kLastPoint),
      lastSentAt: _date(p, _kLastSent),
      pendingPoints: p.getInt(_kPending) ?? 0,
      lastError: p.getString(_kError),
      heartbeatAt: _date(p, _kBeat),
    );
  }

  @override
  Future<void> saveStatus(TrackingStatus s) async {
    final p = await _p;
    await p.setBool(_kRunning, s.running);
    Future<void> d(String k, DateTime? v) => v == null ? p.remove(k) : p.setString(k, v.toIso8601String());
    await d(_kLastPoint, s.lastPointAt);
    await d(_kLastSent, s.lastSentAt);
    await d(_kBeat, s.heartbeatAt);
    await p.setInt(_kPending, s.pendingPoints);
    if (s.lastError == null) {
      await p.remove(_kError);
    } else {
      await p.setString(_kError, s.lastError!);
    }
  }
}

class MemoryTrackingStore implements TrackingStore {
  ActiveTrip? trip;
  TrackingStatus current = const TrackingStatus();
  @override
  Future<ActiveTrip?> activeTrip() async => trip;
  @override
  Future<void> setActiveTrip(ActiveTrip? t) async => trip = t;
  @override
  Future<TrackingStatus> status() async => current;
  @override
  Future<void> saveStatus(TrackingStatus s) async => current = s;
}
