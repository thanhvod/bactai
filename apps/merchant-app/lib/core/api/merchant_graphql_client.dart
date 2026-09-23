import 'dart:async';
import 'dart:convert';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:http/http.dart' as http;

/// Nguồn token cho API: `usr.<jwt>` của phiên SĐT + mật khẩu (D-014); forceRefresh → làm mới qua refresh token.
abstract class TokenProvider {
  Future<String?> token({bool forceRefresh = false});
}

/// GraphQL client của App Merchant: `Authorization: Bearer <token>` + `x-merchant-id`.
/// Lỗi → [ApiException] với `code` = extensions.code (UNAUTHENTICATED, FORBIDDEN, MERCHANT_REQUIRED...).
class MerchantGraphqlClient {
  MerchantGraphqlClient({required this.config, required this.tokens, required this.merchantId, http.Client? httpClient, this.onUnauthenticated})
      : _http = httpClient ?? http.Client();

  final ApiConfig config;
  final TokenProvider tokens;
  /// Merchant đang thao tác (null khi chưa chọn — chỉ gọi được `me`).
  final String? Function() merchantId;
  final void Function()? onUnauthenticated;
  final http.Client _http;

  Future<Map<String, dynamic>> query(String document, {Map<String, dynamic> variables = const {}}) => _run(document, variables);
  Future<Map<String, dynamic>> mutate(String document, {Map<String, dynamic> variables = const {}}) => _run(document, variables);

  Future<Map<String, dynamic>> _run(String document, Map<String, dynamic> variables, {bool retried = false}) async {
    final token = await tokens.token(forceRefresh: retried);
    final headers = <String, String>{'content-type': 'application/json'};
    if (token != null) headers['authorization'] = 'Bearer $token';
    final mid = merchantId();
    if (mid != null && mid.isNotEmpty) headers['x-merchant-id'] = mid;
    http.Response res;
    try {
      res = await _http
          .post(Uri.parse(config.graphqlUrl), headers: headers, body: jsonEncode({'query': document, 'variables': variables}))
          .timeout(const Duration(seconds: 30));
    } on TimeoutException catch (e) {
      throw ApiException.network(e);
    } catch (e) {
      throw ApiException.network(e);
    }
    Map<String, dynamic> body;
    try {
      body = jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
    } catch (_) {
      throw ApiException.fromResponse(res.statusCode, res.body);
    }
    final errors = body['errors'];
    if (errors is List && errors.isNotEmpty) {
      final e = errors.first as Map<String, dynamic>;
      final ext = (e['extensions'] as Map?)?.cast<String, dynamic>();
      final code = (ext?['code'] ?? 'SERVER_ERROR').toString();
      if (code == 'UNAUTHENTICATED') {
        if (!retried) return _run(document, variables, retried: true);
        onUnauthenticated?.call();
      }
      throw ApiException(code: code, message: (e['message'] ?? 'Lỗi không xác định').toString(), details: ext);
    }
    if (res.statusCode >= 400) throw ApiException.fromResponse(res.statusCode, res.body);
    return (body['data'] as Map?)?.cast<String, dynamic>() ?? {};
  }
}

/// Message thân thiện từ lỗi bất kỳ.
String errorMessage(Object e) {
  if (e is ApiException) {
    switch (e.code) {
      case 'FORBIDDEN':
        return e.message.isNotEmpty ? e.message : 'Bạn không có quyền thực hiện thao tác này';
      case 'SENSITIVE_REASON_REQUIRED':
        return 'Thao tác này cần nhập lý do';
      default:
        return e.message;
    }
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}
