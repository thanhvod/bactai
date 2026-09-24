import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:driver_app/core/push/driver_push.dart';
import 'package:driver_app/core/router/routes.dart';
import 'package:driver_app/features/auth/data/auth_repository.dart';
import 'package:driver_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:flutter_test/flutter_test.dart';

import 'fakes.dart';

void main() {
  group('điều hướng khi bấm thông báo (D-017)', () {
    test('chuyến → chi tiết chuyến; điểm dừng → điểm dừng', () {
      expect(driverPathForPush(const PushTarget(type: 'TRIP_ASSIGNED', entityType: 'TRIP', entityId: 't1')), DriverRoutes.tripDetailPath('t1'));
      expect(driverPathForPush(const PushTarget(type: 'TRIP_CHANGED', entityType: 'ORDER_STOP', entityId: 's1')), DriverRoutes.stopDetailPath('s1'));
    });
    test('COD giữ → màn tiền; loại khác / thiếu id → Thông báo', () {
      expect(driverPathForPush(const PushTarget(type: 'COD_HELD_WARNING', entityType: 'DRIVER', entityId: 'd1')), DriverRoutes.pMoney);
      expect(driverPathForPush(const PushTarget(type: 'SYSTEM')), DriverRoutes.pNotifications);
      expect(driverPathForPush(const PushTarget(type: 'TRIP_ASSIGNED', entityType: 'TRIP')), DriverRoutes.pNotifications);
    });
  });

  test('push chuyến mới khi app mở → báo tải lại danh sách chuyến; loại khác thì không', () {
    final before = jobsRefreshBus.value;
    onDriverPushReceived(const PushTarget(type: 'SYSTEM'));
    expect(jobsRefreshBus.value, before);
    onDriverPushReceived(const PushTarget(type: 'TRIP_ASSIGNED', entityType: 'TRIP', entityId: 't1'));
    expect(jobsRefreshBus.value, before + 1);
  });

  test('DriverPushRegistrar gọi đúng mutation', () async {
    final api = FakeDriverApi();
    final r = DriverPushRegistrar(api);
    await r.register('tok', 'ANDROID');
    await r.unregister('tok');
    expect(api.calls.map((c) => c.$1), ['registerPushToken', 'unregisterPushToken']);
    expect(api.calls.first.$2, {'token': 'tok', 'platform': 'ANDROID'});
  });

  test('đăng xuất gọi hủy token push trước khi xóa phiên; lỗi push không chặn đăng xuất', () async {
    final order = <String>[];
    final repo = _Repo(order);
    final cubit = AuthCubit(repo, beforeLogout: () async {
      order.add('unregister');
      throw Exception('offline');
    });
    await cubit.logout();
    expect(order, ['unregister', 'logout']);
    expect(cubit.state.status, AuthStatus.unauthenticated);
  });
}

class _Repo implements AuthRepository {
  _Repo(this.order);
  final List<String> order;
  @override
  Future<void> logout() async => order.add('logout');
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
