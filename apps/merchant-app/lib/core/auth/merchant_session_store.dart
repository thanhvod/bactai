import 'package:bta_flutter_core/bta_flutter_core.dart';

import 'merchant_auth_api.dart';

/// Phiên App Merchant lưu secure storage: access/refresh token (D-014), merchant đang chọn.
class MerchantSessionStore {
  MerchantSessionStore([KeyValueStore? store]) : _s = store ?? SecureKeyValueStore();
  final KeyValueStore _s;

  static const _kAccess = 'bta.merchant.accessToken';
  static const _kRefresh = 'bta.merchant.refreshToken';
  static const _kExpires = 'bta.merchant.expiresAt';
  static const _kMustChange = 'bta.merchant.mustChangePassword';
  static const _kMerchant = 'bta.merchant.merchantId';

  Future<String?> accessToken() => _s.read(_kAccess);
  Future<String?> refreshToken() => _s.read(_kRefresh);
  Future<String?> merchantId() => _s.read(_kMerchant);
  Future<bool> mustChangePassword() async => (await _s.read(_kMustChange)) == '1';
  Future<DateTime?> expiresAt() async => DateTime.tryParse(await _s.read(_kExpires) ?? '');

  Future<void> saveSession(MerchantAuthSession s) async {
    await _s.write(_kAccess, s.accessToken);
    await _s.write(_kRefresh, s.refreshToken);
    await _s.write(_kExpires, s.expiresAt.toIso8601String());
    await setMustChangePassword(s.mustChangePassword);
  }

  Future<void> setMustChangePassword(bool v) => v ? _s.write(_kMustChange, '1') : _s.delete(_kMustChange);
  Future<void> saveMerchant(String id) => _s.write(_kMerchant, id);
  Future<void> clearMerchant() => _s.delete(_kMerchant);

  Future<void> clear() async {
    for (final k in [_kAccess, _kRefresh, _kExpires, _kMustChange, _kMerchant]) {
      await _s.delete(k);
    }
  }
}
