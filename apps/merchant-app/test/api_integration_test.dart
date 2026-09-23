@Tags(['api'])
library;

import 'dart:io';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:merchant_app/core/api/merchant_graphql_client.dart';
import 'package:merchant_app/core/auth/merchant_auth_api.dart';
import 'package:merchant_app/data/graphql_merchant_repository.dart';

/// Chạy với API thật (seed demo): `API_E2E=1 flutter test test/api_integration_test.dart`.
/// Đăng nhập SĐT + mật khẩu seed qua `/merchant/auth/login` (D-014). Chỉ đọc dữ liệu — không ghi gì vào DB dev.
class _StaticToken implements TokenProvider {
  _StaticToken(this.value);
  final String value;
  @override
  Future<String?> token({bool forceRefresh = false}) async => value;
}

void main() {
  final enabled = Platform.environment['API_E2E'] == '1';
  final baseUrl = Platform.environment['API_URL'] ?? 'http://localhost:2001';

  Future<GraphqlMerchantRepository> repoFor(String phone) async {
    final config = ApiConfig(baseUrl: baseUrl);
    final session = await HttpMerchantAuthApi(config).login(phone, 'Nhanvien123');
    expect(session.accessToken, startsWith('usr.'));
    String? merchant;
    final repo = GraphqlMerchantRepository(MerchantGraphqlClient(config: config, tokens: _StaticToken(session.accessToken), merchantId: () => merchant));
    final me = await repo.me();
    merchant = me.activeMemberships.first.merchantId;
    return repo;
  }

  test('operation 0911000002: đăng nhập SĐT → me đúng vai trò; sai mật khẩu bị từ chối', () async {
    final repo = await repoFor('0911000002');
    final me = await repo.me();
    expect(me.phone, '0911000002');
    expect(me.current!.role, 'OPERATION');
    expect(me.current!.permissions, isNot(contains('payroll.approve')));
    await expectLater(HttpMerchantAuthApi(ApiConfig(baseUrl: baseUrl)).login('0911000002', 'sai'), throwsA(isA<ApiException>().having((e) => e.isUnauthenticated, 'unauth', true)));
  }, skip: enabled ? false : 'Đặt API_E2E=1 để chạy với API thật');

  test('admin: me → dashboard → danh sách/chi tiết các màn MA-*', () async {
    final repo = await repoFor('0911000001');
    final me = await repo.me();
    expect(me.current, isNotNull);
    expect(me.current!.permissions, contains('payroll.approve'));

    final d = await repo.dashboard();
    expect(d.payrollPending, greaterThanOrEqualTo(0));
    expect(await repo.unreadNotificationCount(), greaterThanOrEqualTo(0));
    await repo.notifications();

    final orders = await repo.orders();
    expect(orders.items, isNotEmpty);
    final order = await repo.order(orders.items.first.id);
    expect(order.code, startsWith('DH-'));

    final trips = await repo.trips();
    if (trips.items.isNotEmpty) {
      final t = await repo.trip(trips.items.first.id);
      expect(t.code, startsWith('CX-'));
      for (final s in t.stops.where((s) => s.podCount > 0)) {
        await repo.stopPods(s.id);
      }
    }
    await repo.trips(running: true);
    await repo.lastKnownLocations();
    expect(await repo.pauseReasons(), isNotEmpty);

    final customers = await repo.customers();
    expect(customers.items, isNotEmpty);
    final c = await repo.customer(customers.items.first.id);
    await repo.recentOrdersOfCustomer(c.id);
    await repo.customerLocations(c.id);

    final f = await repo.financeOverview();
    expect(f.cod.totalHeld, greaterThanOrEqualTo(0));
    await repo.codHeld();

    final payrolls = await repo.payrolls(status: const ['SUBMITTED', 'APPROVED', 'DRAFT', 'PAID', 'RETURNED']);
    if (payrolls.isNotEmpty) {
      final p = await repo.payroll(payrolls.first.id);
      expect(p.lines, isNotEmpty);
    }
    final r1 = await repo.reports(period: 'MONTH');
    expect(r1.series, isNotEmpty);
    await repo.reports(period: 'WEEK');
  }, skip: enabled ? false : 'Đặt API_E2E=1 để chạy với API thật');

  test('kế toán: không có quyền duyệt lương / tạo đơn', () async {
    final repo = await repoFor('0911000003');
    final me = await repo.me();
    expect(me.current!.permissions, isNot(contains('payroll.approve')));
    expect(me.current!.permissions, contains('cod.remittance.record'));
  }, skip: enabled ? false : 'Đặt API_E2E=1 để chạy với API thật');
}
