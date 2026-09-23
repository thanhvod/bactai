import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:merchant_app/core/auth/merchant_auth_api.dart';

/// Auth API giả: SĐT 0911000001 / mật khẩu `Nhanvien123`; `tempPhone` dùng mật khẩu tạm (mustChangePassword).
class FakeMerchantAuthApi implements MerchantAuthApi {
  final calls = <String>[];
  int refreshCount = 0;
  bool refreshFails = false;
  String password = 'Nhanvien123';
  String tempPhone = '0911000009';
  int _n = 0;

  MerchantAuthSession _session(String phone, {bool mustChange = false}) {
    _n++;
    return MerchantAuthSession(accessToken: 'usr.access$_n', refreshToken: 'refresh$_n', expiresAt: DateTime.now().add(const Duration(hours: 1)), phone: phone, mustChangePassword: mustChange);
  }

  @override
  Future<MerchantAuthSession> login(String phone, String pw) async {
    calls.add('login:$phone');
    if (phone == tempPhone && pw == 'TAMTHOI1') return _session(phone, mustChange: true);
    if (pw != password) throw ApiException(code: 'UNAUTHENTICATED', message: 'Số điện thoại hoặc mật khẩu không đúng', statusCode: 401);
    return _session(phone);
  }

  @override
  Future<MerchantAuthSession> refresh(String refreshToken) async {
    refreshCount++;
    calls.add('refresh:$refreshToken');
    await Future<void>.delayed(const Duration(milliseconds: 10));
    if (refreshFails) throw ApiException(code: 'UNAUTHENTICATED', message: 'Phiên đã hết hạn', statusCode: 401);
    return _session('0911000001');
  }

  @override
  Future<void> logout(String refreshToken) async => calls.add('logout:$refreshToken');

  @override
  Future<void> changePassword(String accessToken, String oldPassword, String newPassword) async {
    calls.add('changePassword');
    if (oldPassword != 'TAMTHOI1' && oldPassword != password) {
      throw ApiException(code: 'VALIDATION_ERROR', message: 'Mật khẩu hiện tại không đúng', statusCode: 400);
    }
    password = newPassword;
  }
}
