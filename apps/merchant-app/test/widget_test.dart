import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:merchant_app/core/auth/auth_controller.dart';

import 'app_harness.dart';
import 'fake_auth_api.dart';
import 'mock_repository.dart';

void main() {
  testWidgets('Đăng nhập SĐT + mật khẩu → 1 nhà xe → vào Tổng quan (MA-AUTH-01 → MA-HOME-01)', (tester) async {
    final (auth, _) = await pumpApp(tester, loggedIn: false);
    expect(find.text('Số điện thoại'), findsOneWidget);
    // SĐT sai định dạng → báo lỗi, không gọi API
    await tester.enterText(find.byKey(const Key('phone')), '12345');
    await tester.enterText(find.byKey(const Key('password')), 'Nhanvien123');
    await tester.tap(find.byKey(const Key('login')));
    await tester.pumpAndSettle();
    expect(find.text('Số điện thoại di động không hợp lệ'), findsOneWidget);
    // sai mật khẩu → thông báo rõ
    await tester.enterText(find.byKey(const Key('phone')), '0911 000 001');
    await tester.enterText(find.byKey(const Key('password')), 'sai');
    await tester.tap(find.byKey(const Key('login')));
    await tester.pumpAndSettle();
    expect(find.text('Số điện thoại hoặc mật khẩu không đúng'), findsOneWidget);
    expect(auth.status, AuthStatus.signedOut);
    // đúng
    await tester.enterText(find.byKey(const Key('password')), 'Nhanvien123');
    await tester.tap(find.byKey(const Key('login')));
    await tester.pumpAndSettle();
    expect(auth.status, AuthStatus.ready);
    expect(find.text('Chuyến đang chạy'), findsWidgets);
    expect(find.text('5.500.000 đ'), findsOneWidget); // COD tài xế giữ
    expect(find.text('Tạo nhanh đơn'), findsOneWidget);
  });

  testWidgets('Mật khẩu tạm → bắt buộc đổi mật khẩu trước khi vào app', (tester) async {
    final api = FakeMerchantAuthApi();
    final (auth, _) = await pumpApp(tester, loggedIn: false, api: api);
    await tester.enterText(find.byKey(const Key('phone')), api.tempPhone);
    await tester.enterText(find.byKey(const Key('password')), 'TAMTHOI1');
    await tester.tap(find.byKey(const Key('login')));
    await tester.pumpAndSettle();
    expect(auth.status, AuthStatus.mustChangePassword);
    expect(find.textContaining('mật khẩu tạm'), findsOneWidget);
    await tester.enterText(find.byKey(const Key('oldPassword')), 'TAMTHOI1');
    await tester.enterText(find.byKey(const Key('newPassword')), 'MoiMoi123');
    await tester.enterText(find.byKey(const Key('confirmPassword')), 'KhacNhau1');
    await tester.tap(find.byKey(const Key('savePassword')));
    await tester.pumpAndSettle();
    expect(find.text('Mật khẩu nhập lại không khớp'), findsOneWidget);
    await tester.enterText(find.byKey(const Key('confirmPassword')), 'MoiMoi123');
    await tester.tap(find.byKey(const Key('savePassword')));
    await tester.pumpAndSettle();
    expect(api.calls, contains('changePassword'));
    expect(auth.status, AuthStatus.ready);
    expect(find.text('Chuyến đang chạy'), findsWidgets);
  });

  testWidgets('Đăng xuất gọi /merchant/auth/logout và về màn đăng nhập', (tester) async {
    final api = FakeMerchantAuthApi();
    final (auth, _) = await pumpApp(tester, api: api);
    await auth.logout();
    await tester.pumpAndSettle();
    expect(api.calls, contains('logout:refresh-seed'));
    expect(find.text('Số điện thoại'), findsOneWidget);
  });

  testWidgets('Nhiều nhà xe → màn chọn nhà xe', (tester) async {
    final (auth, _) = await pumpApp(tester, repo: MockMerchantRepository(memberships: 2));
    expect(auth.status, AuthStatus.chooseMerchant);
    expect(find.text('Chọn nhà xe'), findsOneWidget);
    await tester.tap(find.text('Nhà xe 1'));
    await tester.pumpAndSettle();
    expect(auth.status, AuthStatus.ready);
    expect(auth.merchantId, 'merchant1');
  });

  testWidgets('Operation không thấy KPI tài chính bị giới hạn & không có FAB khi thiếu order.create', (tester) async {
    await pumpApp(tester, repo: MockMerchantRepository(perms: {'order.view', 'trip.status.update'}));
    expect(find.text('Nợ quá hạn'), findsNothing);
    expect(find.text('Tạo nhanh đơn'), findsNothing);
  });

  testWidgets('Chi tiết đơn: xác nhận đơn chờ xác nhận (MA-ORD-02)', (tester) async {
    final (_, repo) = await pumpApp(tester);
    await tester.tap(find.text('Đơn/Chuyến'));
    await tester.pumpAndSettle();
    expect(find.text('DH-202609-0001'), findsOneWidget);
    await tester.tap(find.text('DH-202609-0001'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Xác nhận đơn'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Xác nhận').last);
    await tester.pumpAndSettle();
    expect(repo.calls, contains('updateOrderStatus:CONFIRMED'));
  });

  testWidgets('Duyệt bảng lương chỉ admin; trả về bắt buộc lý do (MA-PAYROLL-01)', (tester) async {
    final (auth, repo) = await pumpApp(tester);
    auth.repository = repo;
    await tester.tap(find.text('Tài chính'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bảng lương chờ duyệt'));
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('BL-202609-0001'));
    await tester.pumpAndSettle();
    expect(find.text('Duyệt bảng lương'), findsWidgets);
    await tester.tap(find.text('Trả về'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).last, 'Sai số liệu thưởng chuyến');
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Trả về').last);
    await tester.pumpAndSettle();
    expect(repo.calls.any((c) => c.startsWith('returnPayroll:Sai số liệu')), isTrue);
  });

  testWidgets('Kế toán không duyệt được bảng lương', (tester) async {
    await pumpApp(tester, repo: MockMerchantRepository(perms: {'payroll.view', 'debt.view', 'finance.view'}));
    await tester.tap(find.text('Tài chính'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bảng lương chờ duyệt'));
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('BL-202609-0001'));
    await tester.pumpAndSettle();
    expect(find.widgetWithText(FilledButton, 'Duyệt'), findsNothing);
  });

  testWidgets('COD: ghi nhận nộp ẩn khi thiếu cod.remittance.record (MA-COD-01)', (tester) async {
    await pumpApp(tester, repo: MockMerchantRepository(perms: {'driverLedger.view', 'debt.view'}));
    await tester.tap(find.text('Tài chính'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('COD tài xế giữ'));
    await tester.pumpAndSettle();
    expect(find.text('Trần Minh Lái'), findsOneWidget);
    expect(find.text('Ghi nhận nộp COD'), findsNothing);
  });

  testWidgets('Chi tiết chuyến: hủy cần lý do (MA-TRIP-02)', (tester) async {
    final (_, repo) = await pumpApp(tester);
    await tester.tap(find.text('Đơn/Chuyến'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Chuyến'));
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('CX-202609-0001'));
    await tester.pumpAndSettle();
    expect(find.text('Sự cố đang mở'), findsOneWidget);
    await tester.tap(find.text('Cập nhật trạng thái'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Hủy chuyến'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).last, 'Khách hủy đơn');
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Xác nhận').last);
    await tester.pumpAndSettle();
    expect(repo.calls, contains('cancelTrip:Khách hủy đơn'));
  });
}
