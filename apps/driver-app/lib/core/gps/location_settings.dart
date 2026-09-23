import 'dart:io' show Platform;

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:geolocator/geolocator.dart';

/// Luồng vị trí cho ghi nền: 50m hoặc 30s; iOS bật background updates, không tự tạm dừng, hiện chỉ báo xanh.
Stream<GpsPoint> backgroundPositions() {
  final LocationSettings settings;
  if (Platform.isAndroid) {
    settings = AndroidSettings(accuracy: LocationAccuracy.high, distanceFilter: 50, intervalDuration: const Duration(seconds: 30));
  } else if (Platform.isIOS) {
    settings = AppleSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 50,
      activityType: ActivityType.automotiveNavigation,
      pauseLocationUpdatesAutomatically: false,
      showBackgroundLocationIndicator: true,
      allowBackgroundLocationUpdates: true,
    );
  } else {
    settings = const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 50);
  }
  return Geolocator.getPositionStream(locationSettings: settings).map((p) => GpsPoint(
        lat: p.latitude,
        lng: p.longitude,
        recordedAt: p.timestamp,
        accuracyMeters: p.accuracy,
        speed: p.speed >= 0 ? p.speed * 3.6 : null,
        heading: p.heading >= 0 ? p.heading : null,
      ));
}
