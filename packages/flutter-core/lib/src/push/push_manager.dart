import 'dart:async';

import 'package:flutter/foundation.dart';

import 'push_target.dart';

/// Nguồn push (FCM thật hoặc giả trong test).
abstract class PushMessaging {
  /// true nếu người dùng cho phép hiển thị thông báo.
  Future<bool> requestPermission();
  Future<String?> getToken();
  Stream<String> get onTokenRefresh;

  /// Push tới khi app đang mở.
  Stream<PushTarget> get onForegroundMessage;

  /// Người dùng bấm vào thông báo (app nền, hoặc local notification khi đang mở).
  Stream<PushTarget> get onOpened;

  /// Push đã mở app từ trạng thái tắt hẳn (nếu có).
  Future<PushTarget?> getInitialTarget();
}

/// Gọi API `registerPushToken` / `unregisterPushToken`.
abstract class PushRegistrar {
  Future<void> register(String token, String platform);
  Future<void> unregister(String token);
}

/// Nhớ token đã đăng ký để không gọi API thừa (và biết token nào cần hủy khi đăng xuất).
abstract class PushTokenStore {
  Future<String?> read();
  Future<void> write(String? token);
}

class MemoryPushTokenStore implements PushTokenStore {
  String? value;
  @override
  Future<String?> read() async => value;
  @override
  Future<void> write(String? token) async => value = token;
}

/// Điều phối push (D-017) dùng chung cho App Tài xế và App Merchant:
///  - [onLogin]: xin quyền → lấy token → đăng ký API (chỉ khi token đổi); theo dõi onTokenRefresh.
///  - [onLogout]: hủy token trên API trước khi xóa phiên.
///  - [taps]: người dùng bấm thông báo → app điều hướng; [received]: push tới khi app mở → app làm mới dữ liệu.
/// `messaging == null` (thiếu cấu hình Firebase) → mọi thao tác là no-op.
class PushManager {
  PushManager({required this.messaging, required this.registrar, required this.store, required this.platform, this.log = _defaultLog});

  final PushMessaging? messaging;
  final PushRegistrar registrar;
  final PushTokenStore store;
  final String platform;
  final void Function(String message) log;

  final _taps = StreamController<PushTarget>.broadcast();
  final _received = StreamController<PushTarget>.broadcast();

  /// Tăng mỗi khi có push lúc app mở — widget lắng nghe để tải lại (badge, danh sách thông báo).
  final ValueNotifier<int> receivedTick = ValueNotifier(0);

  StreamSubscription<String>? _refreshSub;
  StreamSubscription<PushTarget>? _fgSub;
  StreamSubscription<PushTarget>? _openSub;
  PushTarget? _pendingTap;
  bool _started = false;

  bool get enabled => messaging != null;
  Stream<PushTarget> get taps => _taps.stream;
  Stream<PushTarget> get received => _received.stream;

  static void _defaultLog(String m) => debugPrint('[push] $m');

  /// Gắn listener; gọi 1 lần khi app khởi động (trước khi biết đã đăng nhập hay chưa).
  Future<void> start() async {
    final m = messaging;
    if (m == null || _started) return;
    _started = true;
    _fgSub = m.onForegroundMessage.listen((t) {
      receivedTick.value++;
      _received.add(t);
    });
    _openSub = m.onOpened.listen(_emitTap);
    try {
      final initial = await m.getInitialTarget();
      if (initial != null) _pendingTap = initial;
    } catch (e) {
      log('getInitialTarget lỗi: $e');
    }
  }

  void _emitTap(PushTarget t) {
    if (_taps.hasListener) {
      _taps.add(t);
    } else {
      _pendingTap = t;
    }
  }

  /// Lấy tap chờ (app mở từ thông báo khi chưa sẵn sàng điều hướng) — trả 1 lần.
  PushTarget? takePendingTap() {
    final t = _pendingTap;
    _pendingTap = null;
    return t;
  }

  String? _owner;

  /// [ownerKey] = id người dùng (tài xế / tài khoản). Chống gọi thừa theo cặp (người dùng, token):
  /// cùng máy đổi người dùng thì vẫn đăng ký lại để API chuyển token sang người mới.
  Future<void> onLogin({String? ownerKey}) async {
    final m = messaging;
    if (m == null) return;
    _owner = ownerKey;
    try {
      final allowed = await m.requestPermission();
      if (!allowed) log('Người dùng chưa cho phép thông báo — vẫn đăng ký token để nhận khi bật lại');
      final token = await m.getToken();
      if (token != null && token.isNotEmpty) await _register(token);
      await _refreshSub?.cancel();
      _refreshSub = m.onTokenRefresh.listen((t) => _register(t));
    } catch (e) {
      log('Đăng ký push lỗi: $e');
    }
  }

  String _key(String token) => '${_owner ?? ''}|$token';

  static String? _tokenOf(String? stored) => stored == null ? null : (stored.contains('|') ? stored.substring(stored.indexOf('|') + 1) : stored);

  Future<void> _register(String token) async {
    if (await store.read() == _key(token)) return;
    await registrar.register(token, platform);
    await store.write(_key(token));
    log('Đã đăng ký FCM token: $token');
  }

  Future<void> onLogout() async {
    await _refreshSub?.cancel();
    _refreshSub = null;
    final last = _tokenOf(await store.read());
    if (last == null) return;
    try {
      await registrar.unregister(last);
    } catch (e) {
      log('Hủy token push lỗi (bỏ qua): $e');
    }
    await store.write(null);
  }

  Future<void> dispose() async {
    await _refreshSub?.cancel();
    await _fgSub?.cancel();
    await _openSub?.cancel();
    await _taps.close();
    await _received.close();
    receivedTick.dispose();
  }
}
