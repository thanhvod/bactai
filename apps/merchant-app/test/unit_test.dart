import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:merchant_app/core/auth/auth_controller.dart';
import 'package:merchant_app/core/auth/merchant_auth_api.dart';
import 'package:merchant_app/core/auth/merchant_session_store.dart';
import 'package:merchant_app/core/permissions.dart';
import 'package:merchant_app/data/merchant_repository.dart';
import 'package:merchant_app/features/orders/quick_order_page.dart';
import 'package:merchant_app/features/trips/trip_detail_page.dart';
import 'package:merchant_app/models/models.dart';
import 'package:merchant_app/shared/money_field.dart';

import 'fake_auth_api.dart';
import 'mock_repository.dart';

void main() {
  group('Phiên SĐT + mật khẩu (D-014)', () {
    Future<(AuthController, FakeMerchantAuthApi, MerchantSessionStore)> signedIn() async {
      final api = FakeMerchantAuthApi();
      final store = MerchantSessionStore(MemoryKeyValueStore());
      await store.saveSession(MerchantAuthSession(accessToken: 'usr.old', refreshToken: 'r-old', expiresAt: DateTime.now().add(const Duration(hours: 1))));
      final auth = AuthController(store: store, api: api)..repository = MockMerchantRepository();
      await auth.bootstrap();
      return (auth, api, store);
    }

    test('chuẩn hóa SĐT VN', () {
      expect(normalizeVnMobile('+84 912 345 678'), '0912345678');
      expect(normalizeVnMobile('84912345678'), '0912345678');
      expect(normalizeVnMobile('0912.345.678'), '0912345678');
      expect(normalizeVnMobile('0212345678'), isNull);
      expect(normalizeVnMobile('12345'), isNull);
    });

    test('token() trả access; forceRefresh gộp các lần gọi đồng thời thành 1 lần refresh và lưu token mới', () async {
      final (auth, api, store) = await signedIn();
      expect(await auth.token(), 'usr.old');
      final results = await Future.wait([auth.token(forceRefresh: true), auth.token(forceRefresh: true), auth.token(forceRefresh: true)]);
      expect(api.refreshCount, 1);
      expect(results.toSet(), hasLength(1));
      expect(results.first, isNot('usr.old'));
      expect(await store.accessToken(), results.first);
      expect(await auth.token(), results.first);
    });

    test('refresh bị từ chối → xóa phiên cục bộ, token null', () async {
      final (auth, api, store) = await signedIn();
      api.refreshFails = true;
      expect(await auth.token(forceRefresh: true), isNull);
      expect(await store.refreshToken(), isNull);
      expect(auth.signedIn, isFalse);
    });

    test('mustChangePassword lưu lại → mở app lần sau vẫn bắt đổi mật khẩu', () async {
      final api = FakeMerchantAuthApi();
      final store = MerchantSessionStore(MemoryKeyValueStore());
      final auth = AuthController(store: store, api: api)..repository = MockMerchantRepository();
      await auth.login(api.tempPhone, 'TAMTHOI1');
      expect(auth.status, AuthStatus.mustChangePassword);
      final repo = MockMerchantRepository();
      final again = AuthController(store: store, api: api)..repository = repo;
      repo.merchantHeader = again.currentMerchantId;
      await again.bootstrap();
      expect(again.status, AuthStatus.mustChangePassword);
      expect(await again.changePassword('sai', 'MoiMoi123'), 'Mật khẩu hiện tại không đúng');
      expect(await again.changePassword('TAMTHOI1', '123'), 'Mật khẩu mới tối thiểu 6 ký tự');
      expect(await again.changePassword('TAMTHOI1', 'MoiMoi123'), isNull);
      expect(again.status, AuthStatus.ready);
      expect(await store.mustChangePassword(), isFalse);
    });
  });


  group('Parse JSON GraphQL', () {
    test('Me + quyền hiện tại', () {
      final me = Me.fromJson({
        'account': {'email': 'a@b.test', 'name': 'A'},
        'memberships': [
          {'id': 'm1', 'merchantId': 'x', 'merchantName': 'X', 'merchantCode': 'M1', 'role': 'OPERATION', 'status': 'ACTIVE'},
          {'id': 'm2', 'merchantId': 'y', 'merchantName': 'Y', 'merchantCode': 'M2', 'role': 'ADMIN', 'status': 'INVITED'},
        ],
        'current': {'merchantId': 'x', 'merchantName': 'X', 'role': 'OPERATION', 'permissions': ['order.create']},
      });
      expect(me.activeMemberships, hasLength(1));
      expect(me.current!.permissions.contains('order.create'), isTrue);
    });

    test('Tiền là số nguyên, ngày ISO', () {
      final o = sampleOrder();
      expect(o.totalAmount, 12500000);
      expect(o.finance!.profit, 11700000);
      expect(o.dueDate!.year, 2026);
      final t = sampleTrip();
      expect(t.stops.last.codExpected, 12500000);
      expect(t.incidents.single.isOpen, isTrue);
    });

    test('Page + cursor', () {
      final p = PageResult.parse({'totalCount': 3, 'pageInfo': {'endCursor': 'abc', 'hasNextPage': true}, 'nodes': [{'id': 'n1', 'type': 'SYSTEM', 'title': 'x'}]}, NotificationItem.fromJson);
      expect(p.items.single.title, 'x');
      expect(p.hasNextPage, isTrue);
    });
  });

  group('Quyền đổi trạng thái chuyến (MA-TRIP-02)', () {
    test('operation không hủy/lùi được', () {
      final opts = tripStatusOptions(sampleTrip(), {'trip.status.update'});
      expect(opts, containsAll(['DELIVERING', 'PAUSED']));
      expect(opts, isNot(contains('CANCELLED')));
      expect(opts, isNot(contains('PICKING_UP')));
    });
    test('admin có hủy + lùi, cần lý do', () {
      final opts = tripStatusOptions(sampleTrip(), allPerms);
      expect(opts, containsAll(['CANCELLED', 'PICKING_UP']));
      expect(tripChangeNeedsReason('IN_TRANSIT', 'PICKING_UP'), isTrue);
      expect(tripChangeNeedsReason('IN_TRANSIT', 'DELIVERING'), isFalse);
      expect(tripChangeNeedsReason('IN_TRANSIT', 'PAUSED'), isTrue);
      expect(extraPermissionFor('IN_TRANSIT', 'CANCELLED'), Perm.tripCancel);
    });
    test('không có quyền trip.status.update → không có lựa chọn', () {
      expect(tripStatusOptions(sampleTrip(), {'order.view'}), isEmpty);
    });
  });

  group('Tạo nhanh đơn', () {
    test('validate', () {
      const pick = CustomerLocationItem(id: 'l1', name: 'A', address: 'a', usage: 'PICKUP');
      const drop = CustomerLocationItem(id: 'l2', name: 'B', address: 'b', usage: 'DROPOFF');
      expect(validateQuickOrder(), 'Chọn khách hàng');
      expect(validateQuickOrder(customerId: 'c', pickup: pick, dropoff: drop, freight: 0), contains('giá cước'));
      expect(validateQuickOrder(customerId: 'c', pickup: pick, dropoff: drop, freight: 1000000), isNull);
    });
    test('input GraphQL', () {
      final m = const QuickOrderInput(customerId: 'c', pickupLocationId: 'l1', pickupAddress: 'a', dropoffLocationId: 'l2', dropoffAddress: 'b', freightAmount: 5000000, cargoNote: '10 tấn gạo', confirmed: true, dueDate: '2026-10-01').toGraphql();
      expect(m['status'], 'CONFIRMED');
      expect((m['stops'] as List).length, 2);
      expect(m['cargoLines'], [
        {'name': '10 tấn gạo'}
      ]);
    });
    test('parse tiền nhập', () {
      expect(parseMoneyText('1.250.000'), 1250000);
      expect(parseMoneyText(''), isNull);
    });
  });
}
