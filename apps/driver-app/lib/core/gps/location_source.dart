import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'dart:io' show Platform;

import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart' as ph;

enum GpsPermission { unknown, denied, deniedForever, whileInUse, always, serviceDisabled }

/// Nguồn vị trí (tách để test). Impl thật dùng geolocator.
abstract class LocationSource {
  Future<GpsPermission> check();
  /// Bước 1: xin quyền khi dùng app.
  Future<GpsPermission> request();
  /// Bước 2 (sau khi đã giải thích): xin "Luôn cho phép" để ghi nền khi tắt app (D-016).
  Future<GpsPermission> requestAlways();
  Stream<GpsPoint> positions();
  Future<GpsPoint?> current();
  Future<void> openSettings();
}

class GeolocatorLocationSource implements LocationSource {
  GpsPermission _map(LocationPermission p) => switch (p) {
        LocationPermission.always => GpsPermission.always,
        LocationPermission.whileInUse => GpsPermission.whileInUse,
        LocationPermission.deniedForever => GpsPermission.deniedForever,
        LocationPermission.denied => GpsPermission.denied,
        LocationPermission.unableToDetermine => GpsPermission.unknown,
      };

  @override
  Future<GpsPermission> check() async {
    if (!await Geolocator.isLocationServiceEnabled()) return GpsPermission.serviceDisabled;
    return _map(await Geolocator.checkPermission());
  }

  @override
  Future<GpsPermission> request() async {
    if (!await Geolocator.isLocationServiceEnabled()) return GpsPermission.serviceDisabled;
    return _map(await Geolocator.requestPermission());
  }

  @override
  Future<GpsPermission> requestAlways() async {
    final current = await check();
    if (current == GpsPermission.always || current == GpsPermission.serviceDisabled) return current;
    if (current != GpsPermission.whileInUse) {
      final first = await request();
      if (first != GpsPermission.whileInUse) return first;
    }
    // Android 11+: hệ điều hành chuyển sang trang cài đặt để chọn "Luôn cho phép"; iOS hiện hộp thoại nâng quyền.
    if (Platform.isAndroid || Platform.isIOS) await ph.Permission.locationAlways.request();
    return check();
  }

  GpsPoint _point(Position p) => GpsPoint(
        lat: p.latitude,
        lng: p.longitude,
        recordedAt: p.timestamp,
        accuracyMeters: p.accuracy,
        speed: p.speed >= 0 ? p.speed * 3.6 : null,
        heading: p.heading >= 0 ? p.heading : null,
      );

  @override
  Stream<GpsPoint> positions() => Geolocator.getPositionStream(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 30),
      ).map(_point);

  @override
  Future<GpsPoint?> current() async {
    try {
      return _point(await Geolocator.getCurrentPosition(locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, timeLimit: Duration(seconds: 15))));
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> openSettings() async {
    await Geolocator.openAppSettings();
  }
}
