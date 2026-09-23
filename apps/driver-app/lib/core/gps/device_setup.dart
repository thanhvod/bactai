import 'dart:io' show Platform;

import 'package:permission_handler/permission_handler.dart' as ph;

/// Thiết lập máy để ghi GPS nền ổn định (D-016): thông báo (Android 13+, foreground service), bỏ tối ưu pin.
abstract class DeviceSetup {
  bool get isAndroid;
  Future<bool> notificationsGranted();
  Future<bool> requestNotifications();
  Future<bool> batteryUnrestricted();
  Future<bool> requestBatteryUnrestricted();
  Future<void> openAppSettings();
}

class PermissionHandlerDeviceSetup implements DeviceSetup {
  @override
  bool get isAndroid => Platform.isAndroid;

  @override
  Future<bool> notificationsGranted() async => !Platform.isAndroid || await ph.Permission.notification.isGranted;

  @override
  Future<bool> requestNotifications() async => !Platform.isAndroid || (await ph.Permission.notification.request()).isGranted;

  @override
  Future<bool> batteryUnrestricted() async => !Platform.isAndroid || await ph.Permission.ignoreBatteryOptimizations.isGranted;

  /// Hộp thoại hệ thống REQUEST_IGNORE_BATTERY_OPTIMIZATIONS.
  @override
  Future<bool> requestBatteryUnrestricted() async => !Platform.isAndroid || (await ph.Permission.ignoreBatteryOptimizations.request()).isGranted;

  @override
  Future<void> openAppSettings() async {
    await ph.openAppSettings();
  }
}

class FakeDeviceSetup implements DeviceSetup {
  FakeDeviceSetup({this.isAndroid = true, this.notifications = true, this.battery = true});
  @override
  final bool isAndroid;
  bool notifications;
  bool battery;
  @override
  Future<bool> notificationsGranted() async => notifications;
  @override
  Future<bool> requestNotifications() async => notifications = true;
  @override
  Future<bool> batteryUnrestricted() async => battery;
  @override
  Future<bool> requestBatteryUnrestricted() async => battery = true;
  @override
  Future<void> openAppSettings() async {}
}
