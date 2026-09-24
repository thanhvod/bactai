import 'package:flutter/foundation.dart';

/// Cấu hình Firebase qua `--dart-define` (D-017) — không dùng google-services.json / GoogleService-Info.plist.
/// Thiếu giá trị bắt buộc cho nền tảng hiện tại → push tắt êm.
class FirebasePushConfig {
  const FirebasePushConfig({
    required this.apiKey,
    required this.appIdAndroid,
    required this.appIdIos,
    required this.messagingSenderId,
    required this.projectId,
    required this.iosBundleId,
  });

  factory FirebasePushConfig.fromEnvironment() => const FirebasePushConfig(
        apiKey: String.fromEnvironment('FIREBASE_API_KEY'),
        appIdAndroid: String.fromEnvironment('FIREBASE_APP_ID_ANDROID'),
        appIdIos: String.fromEnvironment('FIREBASE_APP_ID_IOS'),
        messagingSenderId: String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID', defaultValue: '208916047118'),
        projectId: String.fromEnvironment('FIREBASE_PROJECT_ID', defaultValue: 'bac-tai-app'),
        iosBundleId: String.fromEnvironment('FIREBASE_IOS_BUNDLE_ID'),
      );

  final String apiKey;
  final String appIdAndroid;
  final String appIdIos;
  final String messagingSenderId;
  final String projectId;
  final String iosBundleId;

  /// App id theo nền tảng; rỗng nếu nền tảng không hỗ trợ.
  String appIdFor(TargetPlatform platform) => switch (platform) {
        TargetPlatform.android => appIdAndroid,
        TargetPlatform.iOS => appIdIos,
        _ => '',
      };

  /// Lý do thiếu cấu hình (null = đủ).
  String? missingFor(TargetPlatform platform) {
    final missing = <String>[
      if (apiKey.isEmpty) 'FIREBASE_API_KEY',
      if (messagingSenderId.isEmpty) 'FIREBASE_MESSAGING_SENDER_ID',
      if (projectId.isEmpty) 'FIREBASE_PROJECT_ID',
      if (platform == TargetPlatform.android && appIdAndroid.isEmpty) 'FIREBASE_APP_ID_ANDROID',
      if (platform == TargetPlatform.iOS && appIdIos.isEmpty) 'FIREBASE_APP_ID_IOS',
      if (platform != TargetPlatform.android && platform != TargetPlatform.iOS) 'nền tảng không hỗ trợ push',
    ];
    return missing.isEmpty ? null : missing.join(', ');
  }
}

/// ANDROID | IOS — giá trị `platform` của mutation `registerPushToken`.
String pushPlatformName(TargetPlatform p) => p == TargetPlatform.iOS ? 'IOS' : 'ANDROID';
