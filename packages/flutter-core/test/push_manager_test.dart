import 'dart:async';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeMessaging implements PushMessaging {
  String? token = 'tok-1';
  bool permission = true;
  PushTarget? initial;
  final refresh = StreamController<String>.broadcast();
  final fg = StreamController<PushTarget>.broadcast();
  final opened = StreamController<PushTarget>.broadcast();
  @override
  Future<bool> requestPermission() async => permission;
  @override
  Future<String?> getToken() async => token;
  @override
  Stream<String> get onTokenRefresh => refresh.stream;
  @override
  Stream<PushTarget> get onForegroundMessage => fg.stream;
  @override
  Stream<PushTarget> get onOpened => opened.stream;
  @override
  Future<PushTarget?> getInitialTarget() async => initial;
}

class FakeRegistrar implements PushRegistrar {
  final calls = <String>[];
  bool failUnregister = false;
  @override
  Future<void> register(String token, String platform) async => calls.add('register:$token:$platform');
  @override
  Future<void> unregister(String token) async {
    if (failUnregister) throw Exception('offline');
    calls.add('unregister:$token');
  }
}

void main() {
  late FakeMessaging m;
  late FakeRegistrar r;
  late MemoryPushTokenStore store;
  PushManager build({bool enabled = true}) => PushManager(messaging: enabled ? m : null, registrar: r, store: store, platform: 'ANDROID', log: (_) {});

  setUp(() {
    m = FakeMessaging();
    r = FakeRegistrar();
    store = MemoryPushTokenStore();
  });

  test('đăng nhập → đăng ký token 1 lần; lần sau cùng token không gọi lại', () async {
    final p = build();
    await p.onLogin(ownerKey: 'd1');
    await p.onLogin(ownerKey: 'd1');
    expect(r.calls, ['register:tok-1:ANDROID']);
    expect(await store.read(), 'd1|tok-1');
  });

  test('cùng máy đổi người dùng (phiên cũ hết hạn, không đăng xuất) → đăng ký lại cho người mới', () async {
    final p = build();
    await p.onLogin(ownerKey: 'd1');
    await p.onLogin(ownerKey: 'd2');
    expect(r.calls, ['register:tok-1:ANDROID', 'register:tok-1:ANDROID']);
    expect(await store.read(), 'd2|tok-1');
  });

  test('token refresh → đăng ký token mới', () async {
    final p = build();
    await p.onLogin();
    m.refresh.add('tok-2');
    await Future<void>.delayed(Duration.zero);
    await Future<void>.delayed(Duration.zero);
    expect(r.calls.last, 'register:tok-2:ANDROID');
    expect(await store.read(), '|tok-2');
  });

  test('đăng xuất → hủy token đã đăng ký; lỗi mạng vẫn xóa local', () async {
    final p = build();
    await p.onLogin();
    r.failUnregister = true;
    await p.onLogout();
    expect(r.calls.where((c) => c.startsWith('unregister')), isEmpty);
    await p.onLogin();
    r.failUnregister = false;
    await p.onLogout();
    expect(r.calls.last, 'unregister:tok-1');
    expect(await store.read(), isNull);
  });

  test('thiếu cấu hình (messaging null) → no-op, không lỗi', () async {
    final p = build(enabled: false);
    await p.start();
    await p.onLogin();
    await p.onLogout();
    expect(p.enabled, isFalse);
    expect(r.calls, isEmpty);
  });

  test('push khi app mở → tăng receivedTick; bấm thông báo → taps, chưa có listener thì giữ pending', () async {
    m.initial = const PushTarget(type: 'TRIP_ASSIGNED', entityType: 'TRIP', entityId: 't1');
    final p = build();
    await p.start();
    expect(p.takePendingTap()?.entityId, 't1');
    expect(p.takePendingTap(), isNull);
    m.fg.add(const PushTarget(type: 'TRIP_CHANGED'));
    await Future<void>.delayed(Duration.zero);
    expect(p.receivedTick.value, 1);
    final taps = <PushTarget>[];
    p.taps.listen(taps.add);
    m.opened.add(const PushTarget(entityType: 'ORDER', entityId: 'o1'));
    await Future<void>.delayed(Duration.zero);
    expect(taps.single.entityId, 'o1');
  });

  test('PushTarget.fromData + FirebasePushConfig.missingFor', () {
    final t = PushTarget.fromData({'type': 'X', 'entityType': 'TRIP', 'entityId': '1', 'merchantId': 'm'});
    expect(t.hasEntity, isTrue);
    expect(t.toData()['merchantId'], 'm');
    const c = FirebasePushConfig(apiKey: '', appIdAndroid: '', appIdIos: '', messagingSenderId: '1', projectId: 'p', iosBundleId: '');
    expect(c.missingFor(TargetPlatform.android), contains('FIREBASE_API_KEY'));
    expect(pushPlatformName(TargetPlatform.iOS), 'IOS');
  });
}
