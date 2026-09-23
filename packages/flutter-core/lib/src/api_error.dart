import 'dart:convert';

/// Lỗi API dạng {code, message} (REST) hoặc GraphQL extensions.code.
class ApiException implements Exception {
  ApiException({required this.code, required this.message, this.statusCode, this.details});

  final String code;
  final String message;
  final int? statusCode;
  final Object? details;

  bool get isUnauthenticated => code == 'UNAUTHENTICATED' || statusCode == 401;
  bool get isNetwork => code == 'NETWORK';

  static ApiException fromResponse(int statusCode, String body) {
    try {
      final j = jsonDecode(body);
      if (j is Map) {
        final code = (j['code'] ?? j['error'] ?? _codeFor(statusCode)).toString();
        final msg = (j['message'] is List ? (j['message'] as List).join(', ') : j['message'])?.toString() ?? _messageFor(statusCode);
        return ApiException(code: code, message: msg, statusCode: statusCode, details: j);
      }
    } catch (_) {}
    return ApiException(code: _codeFor(statusCode), message: _messageFor(statusCode), statusCode: statusCode);
  }

  static ApiException network([Object? e]) =>
      ApiException(code: 'NETWORK', message: 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.', details: e);

  static String _codeFor(int s) {
    switch (s) {
      case 401:
        return 'UNAUTHENTICATED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 400:
      case 422:
        return 'VALIDATION_ERROR';
      default:
        return 'SERVER_ERROR';
    }
  }

  static String _messageFor(int s) {
    switch (s) {
      case 401:
        return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này';
      case 404:
        return 'Không tìm thấy dữ liệu';
      default:
        return 'Máy chủ gặp lỗi ($s). Thử lại sau.';
    }
  }

  @override
  String toString() => 'ApiException($code): $message';
}
