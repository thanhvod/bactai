import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter/foundation.dart';

import '../api/driver_api.dart';
import '../router/routes.dart';

/// Tăng khi có push chuyến mới/thay đổi lúc app mở → các JobsCubit đang sống tải lại.
final jobsRefreshBus = ValueNotifier<int>(0);

/// Loại push làm thay đổi danh sách chuyến của tài xế.
const _tripTypes = {'TRIP_ASSIGNED', 'TRIP_CHANGED'};

class DriverPushRegistrar implements PushRegistrar {
  DriverPushRegistrar(this._api);
  final DriverApi _api;
  @override
  Future<void> register(String token, String platform) => _api.registerPushToken(token, platform);
  @override
  Future<void> unregister(String token) => _api.unregisterPushToken(token);
}

/// Đường dẫn mở khi tài xế bấm thông báo: chuyến → chi tiết chuyến; điểm dừng → điểm dừng;
/// COD / tiền của tài xế → màn Thưởng & ứng; còn lại → Thông báo.
String driverPathForPush(PushTarget t) {
  if (t.entityId.isNotEmpty) {
    switch (t.entityType) {
      case 'TRIP':
        return DriverRoutes.tripDetailPath(t.entityId);
      case 'ORDER_STOP':
        return DriverRoutes.stopDetailPath(t.entityId);
    }
  }
  if (t.type == 'COD_HELD_WARNING' || t.entityType == 'DRIVER') return DriverRoutes.pMoney;
  return DriverRoutes.pNotifications;
}

/// Push tới khi app mở: tải lại chuyến nếu là chuyến mới/thay đổi.
void onDriverPushReceived(PushTarget t) {
  if (_tripTypes.contains(t.type) || t.entityType == 'TRIP') jobsRefreshBus.value++;
}
