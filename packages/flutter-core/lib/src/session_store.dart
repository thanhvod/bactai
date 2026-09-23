import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Hồ sơ tài xế lưu kèm phiên (từ response login / driverMe).
class DriverProfile {
  const DriverProfile({
    required this.id,
    required this.code,
    required this.name,
    required this.phone,
    required this.merchantId,
    required this.merchantName,
    this.mustChangePassword = false,
    this.status,
  });

  final String id;
  final String code;
  final String name;
  final String phone;
  final String merchantId;
  final String merchantName;
  final bool mustChangePassword;
  final String? status;

  factory DriverProfile.fromJson(Map<String, dynamic> j) => DriverProfile(
        id: j['id'] as String,
        code: (j['code'] ?? '') as String,
        name: (j['name'] ?? '') as String,
        phone: (j['phone'] ?? '') as String,
        merchantId: (j['merchantId'] ?? '') as String,
        merchantName: (j['merchantName'] ?? '') as String,
        mustChangePassword: (j['mustChangePassword'] ?? false) as bool,
        status: j['status'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'code': code,
        'name': name,
        'phone': phone,
        'merchantId': merchantId,
        'merchantName': merchantName,
        'mustChangePassword': mustChangePassword,
        'status': status,
      };

  DriverProfile copyWith({bool? mustChangePassword}) => DriverProfile(
        id: id, code: code, name: name, phone: phone, merchantId: merchantId, merchantName: merchantName,
        mustChangePassword: mustChangePassword ?? this.mustChangePassword, status: status);
}

class DriverSession {
  const DriverSession({required this.accessToken, required this.refreshToken, required this.expiresAt, required this.driver});
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;
  final DriverProfile driver;

  bool get isExpired => DateTime.now().isAfter(expiresAt.subtract(const Duration(seconds: 30)));
}

/// Interface lưu trữ để test dễ (mặc định flutter_secure_storage).
abstract class KeyValueStore {
  Future<String?> read(String key);
  Future<void> write(String key, String value);
  Future<void> delete(String key);
}

class SecureKeyValueStore implements KeyValueStore {
  SecureKeyValueStore([FlutterSecureStorage? storage])
      : _s = storage ?? const FlutterSecureStorage();
  final FlutterSecureStorage _s;
  @override
  Future<String?> read(String key) => _s.read(key: key);
  @override
  Future<void> write(String key, String value) => _s.write(key: key, value: value);
  @override
  Future<void> delete(String key) => _s.delete(key: key);
}

class MemoryKeyValueStore implements KeyValueStore {
  final Map<String, String> _m = {};
  @override
  Future<String?> read(String key) async => _m[key];
  @override
  Future<void> write(String key, String value) async => _m[key] = value;
  @override
  Future<void> delete(String key) async => _m.remove(key);
}

/// Lưu accessToken/refreshToken/profile tài xế.
class SessionStore {
  SessionStore([KeyValueStore? store]) : _store = store ?? SecureKeyValueStore();

  static const _kAccess = 'bta.driver.accessToken';
  static const _kRefresh = 'bta.driver.refreshToken';
  static const _kExpires = 'bta.driver.expiresAt';
  static const _kProfile = 'bta.driver.profile';

  final KeyValueStore _store;
  DriverSession? _cache;

  Future<DriverSession?> load() async {
    if (_cache != null) return _cache;
    final access = await _store.read(_kAccess);
    final refresh = await _store.read(_kRefresh);
    final profile = await _store.read(_kProfile);
    if (access == null || refresh == null || profile == null) return null;
    final exp = await _store.read(_kExpires);
    _cache = DriverSession(
      accessToken: access,
      refreshToken: refresh,
      expiresAt: exp == null ? DateTime.now() : DateTime.parse(exp),
      driver: DriverProfile.fromJson(jsonDecode(profile) as Map<String, dynamic>),
    );
    return _cache;
  }

  /// Đọc lại từ storage, bỏ cache — dùng khi tiến trình khác (dịch vụ GPS nền) có thể đã đổi token.
  Future<DriverSession?> reload() async {
    _cache = null;
    return load();
  }

  Future<void> save(DriverSession s) async {
    _cache = s;
    await _store.write(_kAccess, s.accessToken);
    await _store.write(_kRefresh, s.refreshToken);
    await _store.write(_kExpires, s.expiresAt.toIso8601String());
    await _store.write(_kProfile, jsonEncode(s.driver.toJson()));
  }

  Future<void> updateProfile(DriverProfile p) async {
    final s = await load();
    if (s == null) return;
    await save(DriverSession(accessToken: s.accessToken, refreshToken: s.refreshToken, expiresAt: s.expiresAt, driver: p));
  }

  Future<void> clear() async {
    _cache = null;
    await _store.delete(_kAccess);
    await _store.delete(_kRefresh);
    await _store.delete(_kExpires);
    await _store.delete(_kProfile);
  }
}
