import 'dart:io' show Platform;

/// Base URL API. Override: `flutter run --dart-define=API_URL=http://192.168.1.10:2001`.
/// Mặc định: Android emulator → 10.0.2.2, còn lại localhost (cổng API dev 2001).
class ApiConfig {
  const ApiConfig({required this.baseUrl});

  factory ApiConfig.fromEnvironment() {
    const fromDefine = String.fromEnvironment('API_URL');
    if (fromDefine.isNotEmpty) return ApiConfig(baseUrl: _trim(fromDefine));
    return ApiConfig(baseUrl: defaultBaseUrl());
  }

  final String baseUrl;

  String get graphqlUrl => '$baseUrl/graphql';

  Uri uri(String path) => Uri.parse('$baseUrl$path');

  static String defaultBaseUrl() {
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:2001';
    } catch (_) {}
    return 'http://localhost:2001';
  }

  static String _trim(String s) => s.endsWith('/') ? s.substring(0, s.length - 1) : s;
}
