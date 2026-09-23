import 'dart:async';
import 'dart:io' show Platform;
import 'dart:ui';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_background_service/flutter_background_service.dart';

import 'gps_buffer.dart';
import 'gps_tracker_engine.dart';
import 'http_gps_clients.dart';
import 'location_settings.dart';
import 'tracking_store.dart';

/// Điều khiển ghi GPS nền (D-016). UI chỉ gọi start/stop/status; việc ghi & gửi do [GpsTrackerEngine].
abstract class BackgroundGpsController {
  Future<void> start(ActiveTrip trip);
  Future<void> stop();
  Future<bool> isRunning();
  Future<TrackingStatus> status();
  Future<void> flushNow();
  /// Gọi khi app khởi động: nếu còn chuyến đang theo dõi thì chạy tiếp (iOS relaunch sau significant change).
  Future<void> resumeIfNeeded();
}

GpsTrackerEngine _buildEngine({required TrackingStore store, required GpsBuffer buffer, void Function()? onStopped, void Function(TrackingStatus, ActiveTrip?)? onStatus}) {
  final config = ApiConfig.fromEnvironment();
  final auth = BackgroundAuth(SessionStore(), DriverAuthApi(config));
  return GpsTrackerEngine(
    positions: backgroundPositions,
    buffer: buffer,
    sender: HttpGpsBatchSender(config, auth),
    checker: HttpRunningTripChecker(config, auth),
    store: store,
    onStopped: onStopped,
    onStatus: onStatus,
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Android: foreground service + isolate riêng (flutter_background_service). stopWithTask=false → sống khi vuốt tắt app.
// ---------------------------------------------------------------------------------------------------------------

const _channelId = 'bta_gps_tracking';
const _notificationId = 7801;

@pragma('vm:entry-point')
Future<void> gpsServiceOnStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();
  final store = PrefsTrackingStore();
  final buffer = await SqfliteGpsBuffer.open();
  late final GpsTrackerEngine engine;

  void notify(TrackingStatus s, ActiveTrip? trip) {
    if (service is AndroidServiceInstance) {
      final sent = s.lastSentAt == null ? 'chưa gửi' : 'gửi lúc ${_hhmm(s.lastSentAt!)}';
      service.setForegroundNotificationInfo(
        title: 'BTA · Đang ghi lộ trình${trip?.code != null ? ' chuyến ${trip!.code}' : ''}',
        content: s.pendingPoints > 0 ? '$sent · ${s.pendingPoints} điểm chờ mạng' : sent,
      );
    }
  }

  engine = _buildEngine(store: store, buffer: buffer, onStopped: () => service.stopSelf(), onStatus: notify);
  service.on('trip').listen((data) async {
    final id = data?['id'] as String?;
    if (id == null) return;
    await engine.flush();
    await engine.start(ActiveTrip(id: id, code: data?['code'] as String?));
  });
  service.on('flush').listen((_) => engine.flush());
  service.on('stop').listen((_) async {
    await engine.stop();
    await service.stopSelf();
  });
  // Khởi động (kể cả sau reboot / hệ điều hành khởi động lại service): không còn chuyến chạy → tự tắt.
  final keep = await engine.boot();
  if (!keep) await service.stopSelf();
}

String _hhmm(DateTime d) {
  final l = d.toLocal();
  return '${l.hour.toString().padLeft(2, '0')}:${l.minute.toString().padLeft(2, '0')}';
}

class AndroidBackgroundGpsController implements BackgroundGpsController {
  AndroidBackgroundGpsController(this.store);
  final TrackingStore store;
  final _service = FlutterBackgroundService();
  bool _configured = false;

  Future<void> _configure() async {
    if (_configured) return;
    _configured = true;
    await _service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: gpsServiceOnStart,
        autoStart: false,
        // Máy khởi động lại khi còn chuyến chạy → service tự bật (tự tắt nếu server báo hết chuyến).
        autoStartOnBoot: true,
        isForegroundMode: true,
        notificationChannelId: _channelId,
        initialNotificationTitle: 'BTA · Đang ghi lộ trình',
        initialNotificationContent: 'Vị trí xe được gửi cho điều phối trong lúc chạy chuyến',
        foregroundServiceNotificationId: _notificationId,
        foregroundServiceTypes: [AndroidForegroundType.location],
      ),
      iosConfiguration: IosConfiguration(autoStart: false),
    );
  }

  @override
  Future<void> start(ActiveTrip trip) async {
    await _configure();
    await store.setActiveTrip(trip);
    if (await _service.isRunning()) {
      _service.invoke('trip', {'id': trip.id, 'code': trip.code});
    } else {
      await _service.startService();
    }
  }

  @override
  Future<void> stop() async {
    await store.setActiveTrip(null);
    if (await _service.isRunning()) _service.invoke('stop');
  }

  @override
  Future<bool> isRunning() => _service.isRunning();

  @override
  Future<TrackingStatus> status() => store.status();

  @override
  Future<void> flushNow() async {
    if (await _service.isRunning()) _service.invoke('flush');
  }

  @override
  Future<void> resumeIfNeeded() async {
    final t = await store.activeTrip();
    if (t != null && !await _service.isRunning()) await start(t);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// iOS: ghi trong tiến trình app (background location mode). App bị tắt hẳn → significant-location-change (native)
// đánh thức app, main() chạy lại và [resumeIfNeeded] tiếp tục ghi. Giới hạn: cập nhật thưa (~500m) khi bị tắt hẳn.
// ---------------------------------------------------------------------------------------------------------------

class InProcessGpsController implements BackgroundGpsController {
  InProcessGpsController(this.store, {this.engineFactory});
  final TrackingStore store;
  /// Thay engine (test).
  final GpsTrackerEngine Function(TrackingStore, GpsBuffer, void Function())? engineFactory;
  static const _native = MethodChannel('vn.bta.driver/significant_location');
  GpsTrackerEngine? _engine;

  Future<GpsTrackerEngine> _get() async {
    if (_engine != null) return _engine!;
    final buffer = await SqfliteGpsBuffer.open();
    void stopped() => unawaited(_setSignificant(false));
    return _engine = engineFactory?.call(store, buffer, stopped) ?? _buildEngine(store: store, buffer: buffer, onStopped: stopped);
  }

  Future<void> _setSignificant(bool on) async {
    if (!Platform.isIOS) return;
    try {
      await _native.invokeMethod(on ? 'start' : 'stop');
    } catch (_) {}
  }

  @override
  Future<void> start(ActiveTrip trip) async {
    final e = await _get();
    if (e.tripId != trip.id) {
      await e.flush();
      await e.start(trip);
    }
    await _setSignificant(true);
  }

  @override
  Future<void> stop() async {
    final e = await _get();
    await e.stop();
    await _setSignificant(false);
  }

  @override
  Future<bool> isRunning() async => _engine?.running ?? false;

  @override
  Future<TrackingStatus> status() => store.status();

  @override
  Future<void> flushNow() async => (await _get()).flush();

  @override
  Future<void> resumeIfNeeded() async {
    final t = await store.activeTrip();
    if (t != null) await start(t);
  }
}

BackgroundGpsController createBackgroundGpsController(TrackingStore store) {
  WidgetsFlutterBinding.ensureInitialized();
  return Platform.isAndroid ? AndroidBackgroundGpsController(store) : InProcessGpsController(store);
}
