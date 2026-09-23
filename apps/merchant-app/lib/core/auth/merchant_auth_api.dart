import 'dart:async';
import 'dart:convert';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:http/http.dart' as http;

/// Phiên App Merchant (D-014): token `usr.<jwt>` + refresh token.
class MerchantAuthSession {
  const MerchantAuthSession({required this.accessToken, required this.refreshToken, required this.expiresAt, this.phone, this.name, this.mustChangePassword = false});
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;
  final String? phone;
  final String? name;
  final bool mustChangePassword;

  factory MerchantAuthSession.fromJson(Map<String, dynamic> j) {
    final acc = (j['account'] as Map?)?.cast<String, dynamic>() ?? const {};
    final expiresIn = (j['expiresIn'] as num?)?.toInt() ?? 3600;
    return MerchantAuthSession(
      accessToken: j['accessToken'] as String,
      refreshToken: j['refreshToken'] as String,
      expiresAt: DateTime.now().add(Duration(seconds: expiresIn)),
      phone: acc['phone'] as String?,
      name: acc['name'] as String?,
      mustChangePassword: acc['mustChangePassword'] == true,
    );
  }
}

/// REST `/merchant/auth/*` — đăng nhập SĐT + mật khẩu (OTP làm sau).
abstract class MerchantAuthApi {
  Future<MerchantAuthSession> login(String phone, String password);
  Future<MerchantAuthSession> refresh(String refreshToken);
  Future<void> logout(String refreshToken);
  Future<void> changePassword(String accessToken, String oldPassword, String newPassword);
}

class HttpMerchantAuthApi implements MerchantAuthApi {
  HttpMerchantAuthApi(this.config, {http.Client? client}) : _http = client ?? http.Client();
  final ApiConfig config;
  final http.Client _http;

  Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body, {String? bearer}) async {
    http.Response res;
    try {
      res = await _http
          .post(config.uri(path), headers: {'content-type': 'application/json', if (bearer != null) 'authorization': 'Bearer $bearer'}, body: jsonEncode(body))
          .timeout(const Duration(seconds: 20));
    } catch (e) {
      throw ApiException.network(e);
    }
    if (res.statusCode >= 400) throw ApiException.fromResponse(res.statusCode, utf8.decode(res.bodyBytes));
    return (jsonDecode(utf8.decode(res.bodyBytes)) as Map).cast<String, dynamic>();
  }

  @override
  Future<MerchantAuthSession> login(String phone, String password) async =>
      MerchantAuthSession.fromJson(await _post('/merchant/auth/login', {'phone': phone, 'password': password}));

  @override
  Future<MerchantAuthSession> refresh(String refreshToken) async => MerchantAuthSession.fromJson(await _post('/merchant/auth/refresh', {'refreshToken': refreshToken}));

  @override
  Future<void> logout(String refreshToken) async {
    await _post('/merchant/auth/logout', {'refreshToken': refreshToken});
  }

  @override
  Future<void> changePassword(String accessToken, String oldPassword, String newPassword) async {
    await _post('/merchant/auth/change-password', {'oldPassword': oldPassword, 'newPassword': newPassword}, bearer: accessToken);
  }
}

/// 0912345678 / +84912345678 / 84912345678 → 0912345678. Trả null nếu không phải SĐT di động VN.
String? normalizeVnMobile(String input) {
  var d = input.replaceAll(RegExp(r'[^\d+]'), '');
  if (d.startsWith('+84')) d = '0${d.substring(3)}';
  if (d.startsWith('84') && d.length == 11) d = '0${d.substring(2)}';
  return RegExp(r'^0[35789]\d{8}$').hasMatch(d) ? d : null;
}
