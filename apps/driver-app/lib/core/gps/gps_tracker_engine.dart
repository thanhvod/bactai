import 'dart:async';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:uuid/uuid.dart';

import 'gps_buffer.dart';
import 'tracking_store.dart';

/// Gửi một lô điểm lên `POST /driver/gps/batch`. Ném [ApiException] khi lỗi (NETWORK → giữ lại gửi sau).
abstract class GpsBatchSender {
  Future<void> send({required String clientRequestId, required String tripId, required List<GpsPoint> points});
}

/// Hỏi server chuyến đang chạy của tài xế (`driverJobs(bucket: RUNNING)`). Ném [ApiException] khi lỗi.
abstract class RunningTripChecker {
  Future<ActiveTrip?> runningTrip();
}

enum TrackingAction { keep, start, switchTrip, stop }

/// Quyết định bật/tắt/đổi chuyến theo chuyến đang chạy trên server — logic thuần để test.
TrackingAction decideTracking({required String? currentTripId, required ActiveTrip? running}) {
  if (running == null) return currentTripId == null ? TrackingAction.keep : TrackingAction.stop;
  if (currentTripId == null) return TrackingAction.start;
  return running.id == currentTripId ? TrackingAction.keep : TrackingAction.switchTrip;
}

class FlushResult {
  const FlushResult({this.sent = 0, this.dropped = 0, this.remaining = 0, this.networkError = false, this.sessionLost = false});
  final int sent;
  final int dropped;
  final int remaining;
  final bool networkError;
  final bool sessionLost;
}

/// Lõi ghi GPS nền (D-016), chạy được trong isolate dịch vụ Android hoặc isolate chính (iOS):
/// nhận điểm → ghi bộ đệm bền vững → gom lô 30s/20 điểm → gửi với clientRequestId cố định; mất mạng giữ lại;
/// 5 phút hỏi server chuyến còn chạy không, hết chuyến thì gửi nốt rồi dừng.
class GpsTrackerEngine {
  GpsTrackerEngine({
    required this.positions,
    required this.buffer,
    required this.sender,
    required this.checker,
    required this.store,
    String Function()? newId,
    this.flushEvery = const Duration(seconds: 30),
    this.checkEvery = const Duration(minutes: 5),
    this.flushAtPoints = 20,
    this.maxAttempts = 50,
    this.onStopped,
    this.onStatus,
  }) : _newId = newId ?? (() => const Uuid().v4());

  final Stream<GpsPoint> Function() positions;
  final GpsBuffer buffer;
  final GpsBatchSender sender;
  final RunningTripChecker checker;
  final TrackingStore store;
  final String Function() _newId;
  final Duration flushEvery;
  final Duration checkEvery;
  final int flushAtPoints;
  /// Lô lỗi nghiệp vụ lặp quá số lần này thì bỏ (tránh kẹt mãi).
  final int maxAttempts;
  final void Function()? onStopped;
  final void Function(TrackingStatus status, ActiveTrip? trip)? onStatus;

  String? _tripId;
  ActiveTrip? _trip;
  StreamSubscription<GpsPoint>? _sub;
  Timer? _flushTimer;
  Timer? _checkTimer;
  int _sinceFlush = 0;
  bool _flushing = false;
  TrackingStatus _status = const TrackingStatus();

  String? get tripId => _tripId;
  bool get running => _sub != null;

  /// Khởi động: đọc chuyến đang chạy đã lưu; không có → hỏi server; vẫn không → dừng.
  Future<bool> boot() async {
    final saved = await store.activeTrip();
    if (saved != null) {
      await start(saved);
      return true;
    }
    return checkTrips();
  }

  Future<void> start(ActiveTrip trip) async {
    _trip = trip;
    _tripId = trip.id;
    await store.setActiveTrip(trip);
    await _sub?.cancel();
    _sub = positions().listen((p) => unawaited(onPoint(p)), onError: (Object e) => _saveStatus(lastError: 'Lỗi định vị: $e'));
    _flushTimer?.cancel();
    _flushTimer = Timer.periodic(flushEvery, (_) => unawaited(flush()));
    _checkTimer?.cancel();
    _checkTimer = Timer.periodic(checkEvery, (_) => unawaited(checkTrips()));
    await _saveStatus(running: true);
  }

  Future<void> onPoint(GpsPoint p) async {
    final t = _tripId;
    if (t == null) return;
    await buffer.add(t, p);
    _sinceFlush++;
    await _saveStatus(lastPointAt: p.recordedAt);
    if (_sinceFlush >= flushAtPoints) await flush();
  }

  /// Đóng lô các điểm mới rồi gửi lần lượt mọi lô còn trong bộ đệm (kể cả lô cũ gửi lỗi trước đó).
  Future<FlushResult> flush() async {
    if (_flushing) return FlushResult(remaining: await buffer.pendingPoints());
    _flushing = true;
    try {
      _sinceFlush = 0;
      await buffer.seal(_newId);
      var sent = 0;
      var dropped = 0;
      for (final b in await buffer.batches()) {
        try {
          await sender.send(clientRequestId: b.batchId, tripId: b.tripId, points: b.points);
          await buffer.remove(b.batchId);
          sent += b.points.length;
        } on ApiException catch (e) {
          if (e.isNetwork) {
            await buffer.markFailed(b.batchId);
            final left = await buffer.pendingPoints();
            await _saveStatus(pendingPoints: left, lastError: 'Mất mạng — ${b.points.length} điểm chờ gửi');
            return FlushResult(sent: sent, dropped: dropped, remaining: left, networkError: true);
          }
          if (e.isUnauthenticated) {
            final left = await buffer.pendingPoints();
            await _saveStatus(pendingPoints: left, lastError: 'Phiên đăng nhập hết hạn — mở app để đăng nhập lại');
            return FlushResult(sent: sent, dropped: dropped, remaining: left, sessionLost: true);
          }
          // Lỗi nghiệp vụ (chuyến đã đóng quá lâu, không phải chuyến của mình...) → bỏ lô, không giữ mãi.
          if (e.statusCode == 429 || e.code == 'SERVER_ERROR') {
            await buffer.markFailed(b.batchId);
            if (b.attempts + 1 < maxAttempts) continue;
          }
          await buffer.remove(b.batchId);
          dropped += b.points.length;
        }
      }
      final left = await buffer.pendingPoints();
      await _saveStatus(pendingPoints: left, lastSentAt: sent > 0 ? DateTime.now() : null, clearError: true);
      return FlushResult(sent: sent, dropped: dropped, remaining: left);
    } finally {
      _flushing = false;
    }
  }

  /// Hỏi server chuyến đang chạy. Mất mạng → giữ nguyên (không tắt chỉ vì offline). Trả false nếu đã dừng.
  Future<bool> checkTrips() async {
    ActiveTrip? running;
    try {
      running = await checker.runningTrip();
    } on ApiException catch (e) {
      if (e.isUnauthenticated) {
        await _saveStatus(lastError: 'Phiên đăng nhập hết hạn — mở app để đăng nhập lại');
      }
      return _tripId != null;
    }
    switch (decideTracking(currentTripId: _tripId, running: running)) {
      case TrackingAction.keep:
        await _saveStatus(heartbeatAt: DateTime.now());
        return _tripId != null;
      case TrackingAction.start:
      case TrackingAction.switchTrip:
        await flush();
        await start(running!);
        return true;
      case TrackingAction.stop:
        await stop();
        return false;
    }
  }

  /// Gửi nốt điểm còn lại rồi tắt, xóa chuyến đang theo dõi.
  Future<void> stop() async {
    _flushTimer?.cancel();
    _checkTimer?.cancel();
    _flushTimer = null;
    _checkTimer = null;
    await _sub?.cancel();
    _sub = null;
    await flush();
    _tripId = null;
    _trip = null;
    await store.setActiveTrip(null);
    await _saveStatus(running: false);
    onStopped?.call();
  }

  Future<void> dispose() async {
    _flushTimer?.cancel();
    _checkTimer?.cancel();
    await _sub?.cancel();
    _sub = null;
  }

  Future<void> _saveStatus({bool? running, DateTime? lastPointAt, DateTime? lastSentAt, int? pendingPoints, String? lastError, bool clearError = false, DateTime? heartbeatAt}) async {
    _status = _status.copyWith(
      running: running,
      lastPointAt: lastPointAt,
      lastSentAt: lastSentAt,
      pendingPoints: pendingPoints,
      lastError: lastError,
      clearError: clearError,
      heartbeatAt: heartbeatAt ?? DateTime.now(),
    );
    await store.saveStatus(_status);
    onStatus?.call(_status, _trip);
  }
}
