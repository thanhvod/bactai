import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'api_error.dart';

class PresignResult {
  const PresignResult({required this.attachmentId, required this.uploadUrl, required this.method, required this.headers});
  final String attachmentId;
  final String uploadUrl;
  final String method;
  final Map<String, String> headers;

  factory PresignResult.fromJson(Map<String, dynamic> j) => PresignResult(
        attachmentId: j['attachmentId'] as String,
        uploadUrl: j['uploadUrl'] as String,
        method: (j['method'] ?? 'PUT') as String,
        headers: ((j['headers'] as Map?) ?? {}).map((k, v) => MapEntry(k.toString(), v.toString())),
      );
}

/// Upload chứng từ qua presigned URL (API dùng adapter local hoặc S3, cùng contract):
///  POST /uploads/presign → PUT bytes lên uploadUrl → POST /uploads/confirm.
class UploadApi {
  UploadApi(this.config, {required this.getToken, http.Client? client}) : _client = client ?? http.Client();

  final ApiConfig config;
  final Future<String?> Function() getToken;
  final http.Client _client;

  Future<PresignResult> presign({
    required String entityType,
    required String entityId,
    required String category,
    required String fileName,
    required String contentType,
    required int fileSize,
    DateTime? capturedAt,
    double? lat,
    double? lng,
  }) async {
    final j = await _postJson('/uploads/presign', {
      'entityType': entityType,
      'entityId': entityId,
      'category': category,
      'fileName': fileName,
      'contentType': contentType,
      'fileSize': fileSize,
      if (capturedAt != null) 'capturedAt': capturedAt.toUtc().toIso8601String(),
      'lat': ?lat,
      'lng': ?lng,
    });
    return PresignResult.fromJson(j);
  }

  Future<void> putBytes(PresignResult p, Uint8List bytes, {required String contentType}) async {
    http.Response res;
    try {
      final req = http.Request(p.method, Uri.parse(p.uploadUrl))
        ..headers.addAll({'content-type': contentType, ...p.headers})
        ..bodyBytes = bytes;
      res = await http.Response.fromStream(await _client.send(req).timeout(const Duration(minutes: 2)));
    } catch (e) {
      throw ApiException.network(e);
    }
    if (res.statusCode < 200 || res.statusCode >= 300) throw ApiException.fromResponse(res.statusCode, res.body);
  }

  Future<Map<String, dynamic>> confirm(String attachmentId, {String? checksum}) =>
      _postJson('/uploads/confirm', {'attachmentId': attachmentId, 'checksum': ?checksum});

  /// Presign + PUT + confirm trong một bước.
  Future<Map<String, dynamic>> upload({
    required String entityType,
    required String entityId,
    required String category,
    required String fileName,
    required String contentType,
    required Uint8List bytes,
    DateTime? capturedAt,
    double? lat,
    double? lng,
  }) async {
    final p = await presign(
        entityType: entityType, entityId: entityId, category: category, fileName: fileName, contentType: contentType, fileSize: bytes.length, capturedAt: capturedAt, lat: lat, lng: lng);
    await putBytes(p, bytes, contentType: contentType);
    return confirm(p.attachmentId);
  }

  Future<Map<String, dynamic>> _postJson(String path, Map<String, Object?> body) async {
    final token = await getToken();
    http.Response res;
    try {
      res = await _client
          .post(config.uri(path), headers: {'content-type': 'application/json', if (token != null) 'authorization': 'Bearer $token'}, body: jsonEncode(body))
          .timeout(const Duration(seconds: 30));
    } catch (e) {
      throw ApiException.network(e);
    }
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final j = res.body.isEmpty ? {} : jsonDecode(res.body);
      return j is Map<String, dynamic> ? j : {};
    }
    throw ApiException.fromResponse(res.statusCode, res.body);
  }
}
