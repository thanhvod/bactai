import 'dart:async';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter/foundation.dart';

import '../../data/merchant_repository.dart';
import '../../models/models.dart';
import '../api/merchant_graphql_client.dart';
import 'merchant_auth_api.dart';
import 'merchant_session_store.dart';

enum AuthStatus { loading, signedOut, mustChangePassword, noMembership, chooseMerchant, ready }

/// Phiên SĐT + mật khẩu (D-014) + chọn nhà xe (MA-AUTH-01, MA-PROFILE-01). Là [TokenProvider] cho GraphQL client:
/// `forceRefresh` (client gặp UNAUTHENTICATED) → gọi `/merchant/auth/refresh` đúng 1 lần (gộp request đồng thời).
class AuthController extends ChangeNotifier implements TokenProvider {
  AuthController({required this.store, required this.api});

  final MerchantSessionStore store;
  final MerchantAuthApi api;
  late MerchantRepository repository;

  AuthStatus status = AuthStatus.loading;
  String? _access;
  String? _refresh;
  String? merchantId;
  Me? me;
  String? error;
  Future<String?>? _refreshing;

  /// Chạy trước khi xóa phiên khi đăng xuất (hủy FCM token trên API, D-017).
  Future<void> Function()? beforeLogout;

  Set<String> get permissions => me?.current?.permissions ?? const {};
  bool can(String permission) => permissions.contains(permission);
  String? get role => me?.current?.role;
  String get merchantName => me?.current?.merchantName ?? '';
  bool get signedIn => _access != null;

  @override
  Future<String?> token({bool forceRefresh = false}) async {
    if (_access == null) return null;
    if (!forceRefresh) return _access;
    return _refreshing ??= _doRefresh().whenComplete(() => _refreshing = null);
  }

  Future<String?> _doRefresh() async {
    final rt = _refresh;
    if (rt == null) return null;
    try {
      final s = await api.refresh(rt);
      await _apply(s);
      return _access;
    } on ApiException catch (e) {
      if (e.isUnauthenticated) await _clearLocal();
      return null;
    } catch (_) {
      return null;
    }
  }

  String? currentMerchantId() => merchantId;

  Future<void> bootstrap() async {
    _access = await store.accessToken();
    _refresh = await store.refreshToken();
    merchantId = await store.merchantId();
    if (_access == null || _refresh == null) {
      _set(AuthStatus.signedOut);
      return;
    }
    if (await store.mustChangePassword()) {
      _set(AuthStatus.mustChangePassword);
      return;
    }
    await _resolve();
  }

  /// Trả null nếu hợp lệ, ngược lại là thông báo lỗi.
  static String? validatePhone(String v) => normalizeVnMobile(v) == null ? 'Số điện thoại di động không hợp lệ' : null;

  Future<void> login(String phone, String password) async {
    error = null;
    final p = normalizeVnMobile(phone);
    if (p == null) {
      error = 'Số điện thoại di động không hợp lệ';
      notifyListeners();
      return;
    }
    if (password.isEmpty) {
      error = 'Nhập mật khẩu';
      notifyListeners();
      return;
    }
    try {
      final s = await api.login(p, password);
      await _apply(s);
      if (s.mustChangePassword) {
        _set(AuthStatus.mustChangePassword);
        return;
      }
      await _resolve();
    } on ApiException catch (e) {
      error = e.isNetwork ? e.message : (e.isUnauthenticated ? (e.message.isNotEmpty ? e.message : 'Số điện thoại hoặc mật khẩu không đúng') : errorMessage(e));
      notifyListeners();
    } catch (e) {
      error = errorMessage(e);
      notifyListeners();
    }
  }

  /// Đổi mật khẩu (bắt buộc lần đầu với mật khẩu tạm, hoặc từ màn Tài khoản). Trả null khi thành công.
  Future<String?> changePassword(String oldPassword, String newPassword) async {
    if (newPassword.length < 6) return 'Mật khẩu mới tối thiểu 6 ký tự';
    if (newPassword == oldPassword) return 'Mật khẩu mới phải khác mật khẩu hiện tại';
    try {
      var t = _access;
      if (t == null) return 'Phiên đăng nhập đã hết hạn';
      try {
        await api.changePassword(t, oldPassword, newPassword);
      } on ApiException catch (e) {
        if (!e.isUnauthenticated || e.code == 'VALIDATION_ERROR') rethrow;
        t = await token(forceRefresh: true);
        if (t == null) rethrow;
        await api.changePassword(t, oldPassword, newPassword);
      }
      await store.setMustChangePassword(false);
      if (status == AuthStatus.mustChangePassword) await _resolve();
      return null;
    } on ApiException catch (e) {
      if (e.code == 'VALIDATION_ERROR') return e.message.isNotEmpty ? e.message : 'Mật khẩu hiện tại không đúng';
      return errorMessage(e);
    } catch (e) {
      return errorMessage(e);
    }
  }

  Future<void> _apply(MerchantAuthSession s) async {
    _access = s.accessToken;
    _refresh = s.refreshToken;
    await store.saveSession(s);
  }

  /// Gọi `me` → 0 membership: chờ mời; 1 ACTIVE: vào thẳng; nhiều: chọn nhà xe.
  Future<void> _resolve() async {
    error = null;
    status = AuthStatus.loading;
    notifyListeners();
    try {
      me = await repository.me();
      final active = me!.activeMemberships;
      if (active.isEmpty) {
        _set(AuthStatus.noMembership);
        return;
      }
      if (me!.current != null && active.any((m) => m.merchantId == merchantId)) {
        _set(AuthStatus.ready);
        return;
      }
      if (active.length == 1) {
        await selectMerchant(active.first.merchantId);
        return;
      }
      merchantId = null;
      _set(AuthStatus.chooseMerchant);
    } on ApiException catch (e) {
      error = e.isUnauthenticated ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' : errorMessage(e);
      if (e.isUnauthenticated) await _clearLocal();
      _set(AuthStatus.signedOut);
    } catch (e) {
      error = errorMessage(e);
      _set(AuthStatus.signedOut);
    }
  }

  Future<void> selectMerchant(String id) async {
    merchantId = id;
    await store.saveMerchant(id);
    try {
      me = await repository.me();
      _set(me?.current != null ? AuthStatus.ready : AuthStatus.chooseMerchant);
    } catch (e) {
      error = errorMessage(e);
      _set(AuthStatus.chooseMerchant);
    }
  }

  Future<void> refreshMe() async {
    me = await repository.me();
    notifyListeners();
  }

  Future<void> _clearLocal() async {
    await store.clear();
    _access = null;
    _refresh = null;
    merchantId = null;
    me = null;
  }

  Future<void> logout() async {
    try {
      await beforeLogout?.call();
    } catch (_) {/* push lỗi không chặn đăng xuất */}
    final rt = _refresh;
    if (rt != null) {
      try {
        await api.logout(rt);
      } catch (_) {/* offline: vẫn xóa phiên cục bộ */}
    }
    await _clearLocal();
    _set(AuthStatus.signedOut);
  }

  /// Gọi khi API trả UNAUTHENTICATED sau khi đã thử refresh.
  void onSessionLost() {
    if (status == AuthStatus.signedOut) return;
    error = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
    _clearLocal().then((_) => _set(AuthStatus.signedOut));
  }

  void _set(AuthStatus s) {
    status = s;
    notifyListeners();
  }
}
