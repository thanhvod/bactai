import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/gps/background_gps_controller.dart';
import '../../../../core/gps/device_setup.dart';
import '../../../../core/gps/location_source.dart';
import '../../../../core/gps/tracking_store.dart';

class GpsState {
  const GpsState({
    this.permission = GpsPermission.unknown,
    this.notificationsGranted = true,
    this.batteryUnrestricted = true,
    this.tripId,
    this.tripCode,
    this.tracking = false,
    this.lastSentAt,
    this.lastPointAt,
    this.pendingPoints = 0,
    this.lastError,
  });

  final GpsPermission permission;
  /// Android 13+: cần quyền thông báo để hiện thông báo "Đang ghi lộ trình" của dịch vụ nền.
  final bool notificationsGranted;
  /// Android: đã tắt tối ưu pin cho app (giảm rủi ro hệ điều hành dừng dịch vụ).
  final bool batteryUnrestricted;
  final String? tripId;
  final String? tripCode;
  /// Dịch vụ ghi nền đang chạy.
  final bool tracking;
  final DateTime? lastSentAt;
  final DateTime? lastPointAt;
  final int pendingPoints;
  final String? lastError;

  bool get granted => permission == GpsPermission.always || permission == GpsPermission.whileInUse;
  /// Ghi được cả khi tắt app chỉ khi có "Luôn cho phép".
  bool get backgroundReady => permission == GpsPermission.always;

  GpsState copyWith({
    GpsPermission? permission,
    bool? notificationsGranted,
    bool? batteryUnrestricted,
    String? tripId,
    String? tripCode,
    bool clearTrip = false,
    bool? tracking,
    DateTime? lastSentAt,
    DateTime? lastPointAt,
    int? pendingPoints,
    String? lastError,
    bool clearError = false,
  }) =>
      GpsState(
        permission: permission ?? this.permission,
        notificationsGranted: notificationsGranted ?? this.notificationsGranted,
        batteryUnrestricted: batteryUnrestricted ?? this.batteryUnrestricted,
        tripId: clearTrip ? null : (tripId ?? this.tripId),
        tripCode: clearTrip ? null : (tripCode ?? this.tripCode),
        tracking: tracking ?? this.tracking,
        lastSentAt: lastSentAt ?? this.lastSentAt,
        lastPointAt: lastPointAt ?? this.lastPointAt,
        pendingPoints: pendingPoints ?? this.pendingPoints,
        lastError: clearError ? null : (lastError ?? this.lastError),
      );
}

/// DA-GPS-01 / GPS-002 + D-016: UI chỉ điều khiển dịch vụ ghi GPS nền (bật khi có chuyến đang chạy, tắt khi hết).
/// Việc lấy vị trí, gom lô, gửi, giữ khi mất mạng do [BackgroundGpsController] / GpsTrackerEngine đảm nhận —
/// tiếp tục cả khi app ở nền hoặc bị vuốt tắt (Android), iOS xem giới hạn trong README.
class GpsCubit extends Cubit<GpsState> {
  GpsCubit(this._source, this._controller, this._device) : super(const GpsState());

  final LocationSource _source;
  final BackgroundGpsController _controller;
  final DeviceSetup _device;
  Timer? _poll;

  bool get isAndroid => _device.isAndroid;

  Future<GpsPermission> refreshPermission() async {
    final p = await _source.check();
    final n = await _device.notificationsGranted();
    final b = await _device.batteryUnrestricted();
    if (!isClosed) emit(state.copyWith(permission: p, notificationsGranted: n, batteryUnrestricted: b));
    await refreshStatus();
    return p;
  }

  /// Đọc tình trạng do dịch vụ nền ghi lại (lần gửi cuối, điểm chờ mạng, lỗi).
  Future<void> refreshStatus() async {
    final s = await _controller.status();
    final running = await _controller.isRunning();
    if (isClosed) return;
    emit(GpsState(
      permission: state.permission,
      notificationsGranted: state.notificationsGranted,
      batteryUnrestricted: state.batteryUnrestricted,
      tripId: state.tripId,
      tripCode: state.tripCode,
      tracking: running,
      lastSentAt: s.lastSentAt,
      lastPointAt: s.lastPointAt,
      pendingPoints: s.pendingPoints,
      lastError: s.lastError,
    ));
  }

  /// Bước 1: quyền khi dùng app. Đủ để bắt đầu ghi (nền ngắn); cần bước 2 để ghi khi tắt app.
  Future<GpsPermission> requestPermission() async {
    final p = await _source.request();
    if (!isClosed) emit(state.copyWith(permission: p));
    await _startIfPending();
    return p;
  }

  /// Bước 2 (sau khi giải thích): "Luôn cho phép" để ghi nền kể cả khi tắt app.
  Future<GpsPermission> requestAlways() async {
    final p = await _source.requestAlways();
    if (!isClosed) emit(state.copyWith(permission: p));
    await _startIfPending();
    return p;
  }

  Future<void> requestNotifications() async {
    final ok = await _device.requestNotifications();
    if (!isClosed) emit(state.copyWith(notificationsGranted: ok));
  }

  Future<void> requestBatteryUnrestricted() async {
    final ok = await _device.requestBatteryUnrestricted();
    if (!isClosed) emit(state.copyWith(batteryUnrestricted: ok));
  }

  Future<void> openSettings() => _source.openSettings();

  Future<void> _startIfPending() async {
    final t = state.tripId;
    if (t != null && state.granted && !state.tracking) await _start(t, state.tripCode);
  }

  Future<void> _start(String tripId, String? tripCode) async {
    await _controller.start(ActiveTrip(id: tripId, code: tripCode));
    if (!isClosed) emit(state.copyWith(tracking: true, clearError: true));
  }

  /// Gọi khi danh sách chuyến / trạng thái chuyến thay đổi: có chuyến đang chạy → bật dịch vụ nền; không có → tắt.
  Future<void> ensureTracking(String? runningTripId, {String? tripCode}) async {
    if (runningTripId == null) {
      if (state.tripId != null || state.tracking || await _controller.isRunning()) await stop();
      return;
    }
    if (runningTripId == state.tripId && state.tracking) return;
    emit(state.copyWith(tripId: runningTripId, tripCode: tripCode));
    final p = await refreshPermission();
    if (p == GpsPermission.always || p == GpsPermission.whileInUse) await _start(runningTripId, tripCode);
  }

  /// App khởi động lại (kể cả iOS được đánh thức vì thay đổi vị trí) → tiếp tục chuyến đang theo dõi.
  Future<void> resume() => _controller.resumeIfNeeded();

  Future<void> flush() => _controller.flushNow();

  Future<void> stop() async {
    await _controller.stop();
    if (!isClosed) emit(state.copyWith(tracking: false, clearTrip: true));
  }

  /// Làm mới tình trạng định kỳ khi màn DA-GPS-01 đang mở.
  void startStatusPolling([Duration every = const Duration(seconds: 10)]) {
    _poll?.cancel();
    _poll = Timer.periodic(every, (_) => refreshStatus());
  }

  void stopStatusPolling() {
    _poll?.cancel();
    _poll = null;
  }

  @override
  Future<void> close() {
    _poll?.cancel();
    return super.close();
  }
}
