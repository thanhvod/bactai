import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'api_error.dart';

class GpsPoint {
  const GpsPoint({required this.lat, required this.lng, required this.recordedAt, this.accuracyMeters, this.speed, this.heading, this.batteryLevel});
  final double lat;
  final double lng;
  final DateTime recordedAt;
  final double? accuracyMeters;
  final double? speed;
  final double? heading;
  final double? batteryLevel;

  Map<String, dynamic> toJson() => {
        'lat': lat,
        'lng': lng,
        'recordedAt': recordedAt.toUtc().toIso8601String(),
        if (accuracyMeters != null) 'accuracyMeters': accuracyMeters,
        if (speed != null) 'speed': speed,
        if (heading != null) 'heading': heading,
        if (batteryLevel != null) 'batteryLevel': batteryLevel,
      };

  factory GpsPoint.fromJson(Map<String, dynamic> j) => GpsPoint(
        lat: (j['lat'] as num).toDouble(),
        lng: (j['lng'] as num).toDouble(),
        recordedAt: DateTime.parse(j['recordedAt'] as String),
        accuracyMeters: (j['accuracyMeters'] as num?)?.toDouble(),
        speed: (j['speed'] as num?)?.toDouble(),
        heading: (j['heading'] as num?)?.toDouble(),
        batteryLevel: (j['batteryLevel'] as num?)?.toDouble(),
      );
}

class GpsBatchResult {
  const GpsBatchResult({required this.accepted, required this.duplicates});
  final int accepted;
  final int duplicates;
}

/// POST /driver/gps/batch {clientRequestId, tripId, points[]} → {accepted, duplicates}.
/// Chỉ gửi khi chuyến đang chạy; backend từ chối nếu tài xế không được gán chuyến.
class GpsApi {
  GpsApi(this.config, {required this.getToken, http.Client? client}) : _client = client ?? http.Client();
  final ApiConfig config;
  final Future<String?> Function() getToken;
  final http.Client _client;

  Future<GpsBatchResult> sendBatch({required String clientRequestId, required String tripId, required List<GpsPoint> points}) async {
    final token = await getToken();
    http.Response res;
    try {
      res = await _client
          .post(config.uri('/driver/gps/batch'),
              headers: {'content-type': 'application/json', if (token != null) 'authorization': 'Bearer $token'},
              body: jsonEncode({'clientRequestId': clientRequestId, 'tripId': tripId, 'points': points.map((p) => p.toJson()).toList()}))
          .timeout(const Duration(seconds: 30));
    } catch (e) {
      throw ApiException.network(e);
    }
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final j = jsonDecode(res.body) as Map<String, dynamic>;
      return GpsBatchResult(accepted: (j['accepted'] as num?)?.toInt() ?? points.length, duplicates: (j['duplicates'] as num?)?.toInt() ?? 0);
    }
    throw ApiException.fromResponse(res.statusCode, res.body);
  }
}
