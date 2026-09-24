import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'push_manager.dart';

/// Lưu FCM token đã đăng ký với API (theo app: key khác nhau cho tài xế / merchant).
class SecurePushTokenStore implements PushTokenStore {
  SecurePushTokenStore({this.key = 'bta.push.registeredToken', FlutterSecureStorage? storage}) : _s = storage ?? const FlutterSecureStorage();
  final String key;
  final FlutterSecureStorage _s;

  @override
  Future<String?> read() => _s.read(key: key);

  @override
  Future<void> write(String? token) => token == null ? _s.delete(key: key) : _s.write(key: key, value: token);
}
