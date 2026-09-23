import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _wrap(Widget child) => MaterialApp(theme: btaTheme(), home: Scaffold(body: child));

void main() {
  test('BtaFormat.vnd', () {
    expect(BtaFormat.vnd(1250000), '1.250.000 đ');
    expect(BtaFormat.vnd(0), '0 đ');
    expect(BtaFormat.vnd(-5000, withUnit: false), '-5.000');
  });

  testWidgets('StatusBadge luôn có chữ và đúng nhãn', (tester) async {
    final m = tripStatusMeta[TripStatus.PAUSED]!;
    await tester.pumpWidget(_wrap(StatusBadge(label: m.label, tone: m.tone)));
    expect(find.text('Tạm dừng'), findsOneWidget);
  });

  testWidgets('MoneyText định dạng VND', (tester) async {
    await tester.pumpWidget(_wrap(const MoneyText(12500000)));
    expect(find.text('12.500.000 đ'), findsOneWidget);
  });

  testWidgets('TripCard hiển thị mã, tuyến, COD, trạng thái', (tester) async {
    await tester.pumpWidget(_wrap(TripCard(
      trip: TripCardData(
        id: '1',
        code: 'CX-202609-0001',
        routeSummary: 'Kho Cần Thơ → Kho Bình Dương',
        status: TripStatus.IN_TRANSIT,
        plannedStartAt: DateTime(2026, 9, 23, 6),
        vehiclePlate: '51C-123.45',
        codExpected: 12500000,
      ),
    )));
    expect(find.text('CX-202609-0001'), findsOneWidget);
    expect(find.text('Kho Cần Thơ → Kho Bình Dương'), findsOneWidget);
    expect(find.text('Đang vận chuyển'), findsOneWidget);
    expect(find.text('12.500.000 đ'), findsOneWidget);
    expect(find.text('51C-123.45'), findsOneWidget);
  });

  testWidgets('StopCard có nút Gọi/Chỉ đường', (tester) async {
    await tester.pumpWidget(_wrap(StopCard(
      stop: const StopCardData(id: 's', sequence: 2, type: StopType.DROPOFF, address: 'KCN Sóng Thần', status: StopStatus.NOT_ARRIVED, contactPhone: '0912000002', codExpected: 1000),
      onCall: () {},
      onNavigate: () {},
    )));
    expect(find.text('Gọi'), findsOneWidget);
    expect(find.text('Chỉ đường'), findsOneWidget);
    expect(find.text('Điểm trả'), findsOneWidget);
  });

  testWidgets('PrimaryBottomAction nhãn dài + nút phụ không tràn', (tester) async {
    tester.view.physicalSize = const Size(360 * 3, 640 * 3);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(MaterialApp(home: Scaffold(bottomNavigationBar: PrimaryBottomAction(label: 'Duyệt bảng lương tháng 09/2026 cho 12 tài xế', onPressed: () {}, secondaryLabel: 'Trả về có lý do', onSecondary: () {}))));
    expect(tester.takeException(), isNull);
  });

  testWidgets('KpiTile ô hẹp không tràn (số lớn tự thu nhỏ)', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: SizedBox(width: 120, child: KpiTile(label: 'Công nợ quá hạn của khách hàng', value: '1.250.000.000 đ', sub: '12 khách · 30 đơn')))));
    expect(tester.takeException(), isNull);
  });
}
