import 'package:bta_flutter_core/bta_flutter_core.dart';

/// Phiên tài xế: đăng nhập SĐT + mật khẩu (D-009), lưu SessionStore.
class AuthRepository {
  AuthRepository({required this.authApi, required this.session});
  final DriverAuthApi authApi;
  final SessionStore session;

  Future<DriverSession?> restore() => session.load();

  Future<DriverSession> login(String phone, String password) async {
    final s = await authApi.login(phone: phone, password: password);
    await session.save(s);
    return s;
  }

  Future<void> logout() async {
    final s = await session.load();
    if (s != null) await authApi.logout(s.refreshToken);
    await session.clear();
  }

  Future<void> changePassword(String oldPassword, String newPassword) async {
    final s = await session.load();
    if (s == null) throw ApiException(code: 'UNAUTHENTICATED', message: 'Chưa đăng nhập');
    await authApi.changePassword(accessToken: s.accessToken, oldPassword: oldPassword, newPassword: newPassword);
    await session.updateProfile(s.driver.copyWith(mustChangePassword: false));
  }

  Future<void> clearLocal() => session.clear();
}
