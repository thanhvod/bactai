import 'dart:async';
import 'dart:convert';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'push_config.dart';
import 'push_manager.dart';
import 'push_target.dart';

/// Channel Android khớp API (`android.notification.channelId`).
const btaNotificationChannelId = 'bta_default';

/// FCM thật (D-017). Tạo qua [create]; trả null nếu thiếu cấu hình hoặc khởi tạo Firebase lỗi.
class FirebasePushMessaging implements PushMessaging {
  FirebasePushMessaging._(this._fm, this._local, this._platform);

  final FirebaseMessaging _fm;
  final FlutterLocalNotificationsPlugin _local;
  final TargetPlatform _platform;
  final _opened = StreamController<PushTarget>.broadcast();
  final _foreground = StreamController<PushTarget>.broadcast();
  int _localId = 0;

  static Future<PushMessaging?> create(FirebasePushConfig config, {String channelName = 'Thông báo BTA', void Function(String)? log}) async {
    final l = log ?? (m) => debugPrint('[push] $m');
    final platform = defaultTargetPlatform;
    if (kIsWeb) return null;
    final missing = config.missingFor(platform);
    if (missing != null) {
      l('Tắt push FCM — thiếu cấu hình: $missing');
      return null;
    }
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp(
          options: FirebaseOptions(
            apiKey: config.apiKey,
            appId: config.appIdFor(platform),
            messagingSenderId: config.messagingSenderId,
            projectId: config.projectId,
            iosBundleId: config.iosBundleId.isEmpty ? null : config.iosBundleId,
          ),
        );
      }
      final local = FlutterLocalNotificationsPlugin();
      final m = FirebasePushMessaging._(FirebaseMessaging.instance, local, platform);
      await m._init(channelName);
      return m;
    } catch (e) {
      l('Khởi tạo Firebase lỗi, tắt push: $e');
      return null;
    }
  }

  Future<void> _init(String channelName) async {
    await _local.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@drawable/ic_stat_notify'),
        iOS: DarwinInitializationSettings(requestAlertPermission: false, requestBadgePermission: false, requestSoundPermission: false),
      ),
      onDidReceiveNotificationResponse: (r) {
        final t = _decode(r.payload);
        if (t != null) _opened.add(t);
      },
    );
    await _local
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(AndroidNotificationChannel(btaNotificationChannelId, channelName, importance: Importance.high));
    // iOS tự hiện banner khi app đang mở; Android tự hiện bằng local notification (bên dưới).
    await _fm.setForegroundNotificationPresentationOptions(alert: true, badge: true, sound: true);

    FirebaseMessaging.onMessage.listen((msg) {
      final t = _target(msg);
      _foreground.add(t);
      if (_platform == TargetPlatform.android && msg.notification != null) {
        _local.show(
          id: _localId++,
          title: msg.notification?.title,
          body: msg.notification?.body,
          notificationDetails: const NotificationDetails(
            android: AndroidNotificationDetails(btaNotificationChannelId, 'Thông báo BTA', importance: Importance.high, priority: Priority.high),
          ),
          payload: jsonEncode(t.toData()),
        );
      }
    });
    FirebaseMessaging.onMessageOpenedApp.listen((msg) => _opened.add(_target(msg)));
  }

  static PushTarget _target(RemoteMessage m) => PushTarget.fromData(m.data, title: m.notification?.title, body: m.notification?.body);

  static PushTarget? _decode(String? payload) {
    if (payload == null || payload.isEmpty) return null;
    try {
      return PushTarget.fromData(Map<String, dynamic>.from(jsonDecode(payload) as Map));
    } catch (_) {
      return null;
    }
  }

  @override
  Future<bool> requestPermission() async {
    final s = await _fm.requestPermission(alert: true, badge: true, sound: true);
    // Android 13+: POST_NOTIFICATIONS (firebase_messaging đã xin; gọi thêm plugin local cho chắc).
    await _local.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()?.requestNotificationsPermission();
    return s.authorizationStatus == AuthorizationStatus.authorized || s.authorizationStatus == AuthorizationStatus.provisional;
  }

  @override
  Future<String?> getToken() async {
    if (_platform == TargetPlatform.iOS) {
      // iOS cần APNs token trước khi có FCM token.
      for (var i = 0; i < 5 && await _fm.getAPNSToken() == null; i++) {
        await Future<void>.delayed(const Duration(seconds: 1));
      }
    }
    return _fm.getToken();
  }

  @override
  Stream<String> get onTokenRefresh => _fm.onTokenRefresh;

  @override
  Stream<PushTarget> get onForegroundMessage => _foreground.stream;

  @override
  Stream<PushTarget> get onOpened => _opened.stream;

  @override
  Future<PushTarget?> getInitialTarget() async {
    final msg = await _fm.getInitialMessage();
    if (msg != null) return _target(msg);
    final launch = await _local.getNotificationAppLaunchDetails();
    if (launch?.didNotificationLaunchApp ?? false) return _decode(launch!.notificationResponse?.payload);
    return null;
  }
}
