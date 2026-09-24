import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:merchant_app/core/auth/auth_controller.dart';
import 'package:merchant_app/core/auth/merchant_auth_api.dart';
import 'package:merchant_app/core/auth/merchant_session_store.dart';
import 'package:merchant_app/core/push/merchant_push.dart';
import 'package:merchant_app/core/router/routes.dart';
import 'package:merchant_app/shared/async_view.dart';

import 'fake_auth_api.dart';
import 'mock_repository.dart';

void main() {
  group('điều hướng khi bấm thông báo (D-017)', () {
    test('chuyến / đơn / bảng lương / khách → màn chi tiết', () {
      expect(merchantPathForPush(const PushTarget(entityType: 'TRIP', entityId: 't1')), MerchantRoutes.tripDetailPath('t1'));
      expect(merchantPathForPush(const PushTarget(entityType: 'ORDER', entityId: 'o1')), MerchantRoutes.orderDetailPath('o1'));
      expect(merchantPathForPush(const PushTarget(type: 'PAYROLL_SUBMITTED', entityType: 'PAYROLL', entityId: 'p1')), MerchantRoutes.payrollDetailPath('p1'));
      expect(merchantPathForPush(const PushTarget(entityType: 'CUSTOMER', entityId: 'c1')), MerchantRoutes.customerDetailPath('c1'));
    });
    test('COD tài xế → màn COD; sự cố / booking / thiếu id → Thông báo', () {
      expect(merchantPathForPush(const PushTarget(type: 'COD_HELD_WARNING', entityType: 'DRIVER', entityId: 'd1')), MerchantRoutes.pCod);
      expect(merchantPathForPush(const PushTarget(type: 'INCIDENT_NEW', entityType: 'INCIDENT', entityId: 'i1')), '/home/notifications');
      expect(merchantPathForPush(const PushTarget(type: 'SYSTEM')), '/home/notifications');
    });
    test('đổi nhà xe khi push thuộc nhà xe khác mà người dùng là thành viên', () {
      expect(merchantToSwitch(const PushTarget(merchantId: 'm2'), currentMerchantId: 'm1', activeMerchantIds: ['m1', 'm2']), 'm2');
      expect(merchantToSwitch(const PushTarget(merchantId: 'm3'), currentMerchantId: 'm1', activeMerchantIds: ['m1', 'm2']), isNull);
      expect(merchantToSwitch(const PushTarget(merchantId: 'm1'), currentMerchantId: 'm1', activeMerchantIds: ['m1']), isNull);
      expect(merchantToSwitch(const PushTarget(), currentMerchantId: 'm1', activeMerchantIds: ['m1']), isNull);
    });
  });

  test('đăng xuất chạy hủy token push trước khi xóa phiên; lỗi push không chặn', () async {
    final store = MerchantSessionStore(MemoryKeyValueStore());
    await store.saveSession(MerchantAuthSession(accessToken: 'usr.a', refreshToken: 'r', expiresAt: DateTime.now().add(const Duration(hours: 1))));
    final auth = AuthController(store: store, api: FakeMerchantAuthApi())..repository = MockMerchantRepository();
    await auth.bootstrap();
    var calledWithToken = false;
    auth.beforeLogout = () async {
      calledWithToken = await auth.token() != null;
      throw Exception('offline');
    };
    await auth.logout();
    expect(calledWithToken, isTrue);
    expect(auth.status, AuthStatus.signedOut);
  });

  testWidgets('AsyncView tải lại khi push tới (refreshOn)', (tester) async {
    var loads = 0;
    final tick = ValueNotifier(0);
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: AsyncView<int>(refreshOn: tick, load: () async => ++loads, builder: (_, d, _) => ListView(children: [Text('lần $d')])),
      ),
    ));
    await tester.pumpAndSettle();
    expect(find.text('lần 1'), findsOneWidget);
    tick.value++;
    await tester.pumpAndSettle();
    expect(find.text('lần 2'), findsOneWidget);
  });
}
