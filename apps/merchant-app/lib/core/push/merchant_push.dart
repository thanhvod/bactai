import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter/foundation.dart';

import '../api/merchant_graphql_client.dart';
import '../router/routes.dart';

/// Tăng khi có push lúc app mở (D-017) → Tổng quan / Thông báo tải lại.
final merchantPushTick = ValueNotifier<int>(0);

class MerchantPushRegistrar implements PushRegistrar {
  MerchantPushRegistrar(this._client);
  final MerchantGraphqlClient _client;

  @override
  Future<void> register(String token, String platform) async {
    await _client.mutate(r'mutation($i: RegisterPushTokenInput!) { registerPushToken(input: $i) }', variables: {
      'i': {'token': token, 'platform': platform},
    });
  }

  @override
  Future<void> unregister(String token) async {
    await _client.mutate(r'mutation($t: String!) { unregisterPushToken(token: $t) }', variables: {'t': token});
  }
}

/// Màn mở khi bấm thông báo; không có màn chi tiết tương ứng → Thông báo.
String merchantPathForPush(PushTarget t) {
  if (t.entityId.isNotEmpty) {
    switch (t.entityType) {
      case 'TRIP':
        return MerchantRoutes.tripDetailPath(t.entityId);
      case 'ORDER':
        return MerchantRoutes.orderDetailPath(t.entityId);
      case 'PAYROLL':
        return MerchantRoutes.payrollDetailPath(t.entityId);
      case 'CUSTOMER':
        return MerchantRoutes.customerDetailPath(t.entityId);
    }
  }
  if (t.type == 'COD_HELD_WARNING' || t.entityType == 'DRIVER') return MerchantRoutes.pCod;
  return '${MerchantRoutes.pHome}/notifications';
}

/// Push thuộc nhà xe khác nhà xe đang chọn, và người dùng có membership ACTIVE ở đó → cần đổi nhà xe trước.
String? merchantToSwitch(PushTarget t, {required String? currentMerchantId, required Iterable<String> activeMerchantIds}) {
  if (t.merchantId.isEmpty || t.merchantId == currentMerchantId) return null;
  return activeMerchantIds.contains(t.merchantId) ? t.merchantId : null;
}
