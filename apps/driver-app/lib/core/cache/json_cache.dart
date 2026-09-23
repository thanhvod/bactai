import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

/// Cache JSON đơn giản để mở được chuyến đã tải khi mất mạng (DA-TRIP-01 offline).
abstract class JsonCache {
  Future<Object?> read(String key);
  Future<void> write(String key, Object? value);
}

class PrefsJsonCache implements JsonCache {
  SharedPreferences? _prefs;
  Future<SharedPreferences> get _p async => _prefs ??= await SharedPreferences.getInstance();

  @override
  Future<Object?> read(String key) async {
    final s = (await _p).getString('cache:$key');
    return s == null ? null : jsonDecode(s);
  }

  @override
  Future<void> write(String key, Object? value) async => (await _p).setString('cache:$key', jsonEncode(value));
}

class MemoryJsonCache implements JsonCache {
  final Map<String, Object?> _m = {};
  @override
  Future<Object?> read(String key) async => _m[key];
  @override
  Future<void> write(String key, Object? value) async => _m[key] = jsonDecode(jsonEncode(value));
}
