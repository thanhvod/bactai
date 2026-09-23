import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:merchant_app/data/merchant_repository.dart';
import 'package:merchant_app/models/models.dart';

const allPerms = {
  'order.view', 'order.create', 'order.update', 'trip.status.update', 'trip.cancel', 'status.reverse', 'payroll.view', 'payroll.approve',
  'payroll.return', 'cod.remittance.record', 'driverLedger.view', 'debt.view', 'finance.view', 'report.view', 'customer.view',
};
const operationPerms = {'order.view', 'order.create', 'order.update', 'trip.status.update', 'payroll.view', 'driverLedger.view', 'debt.view', 'report.view', 'customer.view'};

TripItem sampleTrip({String status = 'IN_TRANSIT', List<String> next = const ['DELIVERING', 'PAUSED']}) => TripItem.fromJson({
      'id': 't1', 'code': 'CX-202609-0001', 'status': status, 'orderId': 'o1', 'routeSummary': 'Kho Cần Thơ → Kho Bình Dương',
      'plannedStartAt': '2026-09-23T06:00:00Z', 'codExpectedTotal': 12500000, 'codActualTotal': 0, 'openIncidentCount': 1, 'hasWarning': false,
      'allowedNextStatuses': next, 'order': {'id': 'o1', 'code': 'DH-202609-0001', 'customerName': 'Công ty Gạo Miền Tây'},
      'vehicle': {'plate': '51C-123.45'}, 'driver': {'name': 'Nguyễn Văn Tài', 'phone': '0900000001'},
      'stops': [
        {'id': 's1', 'type': 'PICKUP', 'sequence': 1, 'status': 'COMPLETED', 'address': 'KCN Trà Nóc', 'locationName': 'Kho Cần Thơ', 'podCount': 0},
        {'id': 's2', 'type': 'DROPOFF', 'sequence': 2, 'status': 'NOT_ARRIVED', 'address': 'KCN Sóng Thần', 'locationName': 'Kho Bình Dương', 'codExpected': 12500000, 'podCount': 1},
      ],
      'incidents': [
        {'id': 'i1', 'code': 'SC-1', 'title': 'Kẹt xe', 'severity': 'MEDIUM', 'status': 'OPEN'}
      ],
    });

OrderItem sampleOrder({String status = 'PENDING_CONFIRMATION'}) => OrderItem.fromJson({
      'id': 'o1', 'code': 'DH-202609-0001', 'status': status, 'routeSummary': 'Kho Cần Thơ → Kho Bình Dương', 'orderDate': '2026-09-22',
      'dueDate': '2026-10-07', 'totalAmount': 12500000, 'paidAmount': 0, 'remainingAmount': 12500000, 'overdueDays': 0, 'tripCount': 1, 'warnings': [],
      'customer': {'id': 'c1', 'name': 'Công ty Gạo Miền Tây', 'phone': '0292123456'},
      'stops': [], 'trips': [],
      'financeSummary': {'totalAmount': 12500000, 'paidAmount': 0, 'remainingAmount': 12500000, 'expenseTotal': 800000, 'profit': 11700000, 'provisional': true, 'overdueDays': 0},
    });

PayrollItem samplePayroll({String status = 'SUBMITTED'}) => PayrollItem.fromJson({
      'id': 'p1', 'code': 'BL-202609-0001', 'status': status, 'periodLabel': 'Tháng 09/2026', 'anomalyCount': 1,
      'totals': {'salary': 21000000, 'bonus': 3500000, 'advance': 2000000, 'deduction': 500000, 'adjustment': 0, 'net': 22000000, 'driverCount': 2},
      'lines': [
        {'driverName': 'Nguyễn Văn Tài', 'baseSalary': 10000000, 'bonusTotal': 1500000, 'advanceTotal': 2000000, 'deductionTotal': 0, 'netAmount': 9500000, 'anomalies': []},
      ],
    });

class MockMerchantRepository implements MerchantRepository {
  MockMerchantRepository({this.perms = allPerms, this.memberships = 1});
  Set<String> perms;
  int memberships;
  String? currentMerchant;
  /// Mô phỏng header x-merchant-id (gắn auth.currentMerchantId).
  String? Function()? merchantHeader;
  final calls = <String>[];
  String orderStatus = 'PENDING_CONFIRMATION';
  String payrollStatus = 'SUBMITTED';

  @override
  Future<Me> me() async {
    calls.add('me');
    return Me(
      email: 'admin@bta-demo.test',
      name: 'Giám đốc Demo',
      memberships: [
        for (var i = 0; i < memberships; i++)
          Membership(id: 'm$i', merchantId: 'merchant$i', merchantName: i == 0 ? 'BTA Demo Transport' : 'Nhà xe $i', merchantCode: 'M$i', role: 'ADMIN', status: 'ACTIVE'),
      ],
      current: (merchantHeader?.call() ?? currentMerchant) == null ? null : CurrentContext(merchantId: (merchantHeader?.call() ?? currentMerchant)!, merchantName: 'BTA Demo Transport', role: 'ADMIN', permissions: perms),
    );
  }

  @override
  Future<DashboardData> dashboard() async => DashboardData.fromJson({
        'runningTrips': 1, 'todayTrips': 3, 'ordersNeedAction': 2, 'unassignedOrders': 1, 'codOverThreshold': 1, 'openIncidents': 1, 'payrollPending': 1,
        'revenueMonth': 60000000, 'profitMonth': 30000000, 'receivable': 70000000,
        'overdueDebt': {'amount': 15000000, 'count': 1}, 'codHeld': {'amount': 5500000, 'count': 1},
        'todayTripList': [
          {'id': 't1', 'code': 'CX-202609-0001', 'status': 'IN_TRANSIT', 'orderCode': 'DH-202609-0001', 'routeSummary': 'Kho Cần Thơ → Kho Bình Dương', 'vehiclePlate': '51C-123.45', 'driverName': 'Nguyễn Văn Tài', 'plannedStartAt': '2026-09-23T06:00:00Z', 'openIncident': true, 'hasWarning': false},
        ],
      });

  @override
  Future<int> unreadNotificationCount() async => 2;
  @override
  Future<PageResult<NotificationItem>> notifications({bool unreadOnly = false, String? after}) async => PageResult(items: [
        NotificationItem.fromJson({'id': 'n1', 'type': 'PAYROLL_SUBMITTED', 'title': 'Bảng lương BL-202609-0001 chờ duyệt', 'entityType': 'PAYROLL', 'entityId': 'p1', 'createdAt': '2026-09-23T01:00:00Z'}),
      ], totalCount: 1);
  @override
  Future<int> markNotificationRead(String id) async => 1;
  @override
  Future<int> markAllNotificationsRead() async => 0;

  @override
  Future<PageResult<OrderItem>> orders({String? search, List<String>? status, bool needsAction = false, String? after}) async {
    calls.add('orders:${search ?? ''}:${needsAction ? 'action' : ''}');
    return PageResult(items: [sampleOrder(status: orderStatus)], totalCount: 1);
  }

  @override
  Future<OrderItem> order(String id) async => sampleOrder(status: orderStatus);
  @override
  Future<OrderItem> updateOrderStatus(String id, String status, {String? reason}) async {
    calls.add('updateOrderStatus:$status');
    orderStatus = status;
    return sampleOrder(status: status);
  }

  @override
  Future<QuickOrderResult> createQuickOrder(QuickOrderInput input) async {
    calls.add('createQuickOrder:${input.freightAmount}');
    return const QuickOrderResult(orderId: 'o9', code: 'DH-202609-0009');
  }

  @override
  Future<PageResult<TripItem>> trips({bool? running, List<String>? status, String? dateFrom, String? dateTo, bool? hasWarning, String? after}) async =>
      PageResult(items: [sampleTrip()], totalCount: 1);
  @override
  Future<TripItem> trip(String id) async => sampleTrip();
  @override
  Future<TripItem> updateTripStatus(String id, String status, {String? reason, String? note, String? pauseReasonId}) async {
    calls.add('updateTripStatus:$status:${reason ?? ''}');
    return sampleTrip(status: status);
  }

  @override
  Future<TripItem> resumeTrip(String id) async => sampleTrip();
  @override
  Future<TripItem> cancelTrip(String id, String reason) async {
    calls.add('cancelTrip:$reason');
    return sampleTrip(status: 'CANCELLED', next: const []);
  }

  @override
  Future<List<AttachmentItem>> stopPods(String stopId) async => const [];
  @override
  Future<List<CatalogOption>> pauseReasons() async => const [CatalogOption(id: 'r1', name: 'Kẹt xe')];
  @override
  Future<List<LocationPin>> lastKnownLocations() async => const [];

  @override
  Future<PageResult<CustomerItem>> customers({String? search, String? debtStatus, String? after}) async => PageResult(items: [await customer('c1')], totalCount: 1);
  @override
  Future<CustomerItem> customer(String id) async => CustomerItem.fromJson({
        'id': 'c1', 'code': 'CUS-A-001', 'name': 'Công ty Gạo Miền Tây', 'phone': '0292123456', 'status': 'ACTIVE', 'creditBalance': 0, 'creditLimit': 100000000, 'defaultDebtDays': 15, 'warnings': ['1 đơn quá hạn'],
        'debtSummary': {'remaining': 27500000, 'overdueAmount': 15000000, 'maxOverdueDays': 10, 'overLimit': false},
        'locations': [
          {'id': 'l1', 'name': 'Kho Cần Thơ', 'address': 'KCN Trà Nóc', 'usage': 'PICKUP', 'isDefault': true},
          {'id': 'l2', 'name': 'Kho Bình Dương', 'address': 'KCN Sóng Thần', 'usage': 'DROPOFF'},
        ],
      });
  @override
  Future<List<OrderItem>> recentOrdersOfCustomer(String customerId) async => [sampleOrder()];
  @override
  Future<List<CustomerLocationItem>> customerLocations(String customerId) async => (await customer(customerId)).locations;

  @override
  Future<FinanceOverview> financeOverview() async => FinanceOverview(
        debtRows: const [DebtRow(customerId: 'c1', customerName: 'Công ty Gạo Miền Tây', remaining: 27500000, overdueAmount: 15000000, maxOverdueDays: 10)],
        receivable: 70000000,
        overdue: 15000000,
        cod: await codHeld(),
        recentPayments: const [],
        recentExpenses: const [],
        pendingPayrolls: [samplePayroll()],
      );

  @override
  Future<CodReport> codHeld({String? driverId}) async => CodReport(rows: const [
        CodHolder(driverId: 'd2', driverName: 'Trần Minh Lái', phone: '0900000002', codCollected: 7500000, codRemitted: 2000000, codHeld: 5500000, daysHeld: 5, overAmount: true, items: [
          CodItem(stopId: 's9', orderCode: 'DH-202608-0010', customerName: 'Bao bì Hưng Lợi', held: 5500000, daysHeld: 5),
        ]),
      ], totalHeld: 5500000, warningAmount: 5000000, warningDays: 2);

  @override
  Future<void> recordCodRemittance({required String driverId, required int amount, required List<String> stopIds, required String clientRequestId, String? note}) async {
    calls.add('recordCod:$driverId:$amount');
  }

  @override
  Future<List<PayrollItem>> payrolls({List<String> status = const ['SUBMITTED']}) async => [samplePayroll(status: payrollStatus)];
  @override
  Future<PayrollItem> payroll(String id) async => samplePayroll(status: payrollStatus);
  @override
  Future<PayrollItem> approvePayroll(String id, {String? note}) async {
    calls.add('approvePayroll');
    payrollStatus = 'APPROVED';
    return samplePayroll(status: 'APPROVED');
  }

  @override
  Future<PayrollItem> returnPayroll(String id, String reason) async {
    if (reason.trim().length < 5) throw ApiException(code: 'SENSITIVE_REASON_REQUIRED', message: 'Thao tác nhạy cảm cần nhập lý do');
    calls.add('returnPayroll:$reason');
    payrollStatus = 'RETURNED';
    return samplePayroll(status: 'RETURNED');
  }

  @override
  Future<ReportsOverview> reports({required String period}) async => const ReportsOverview(
        totals: ProfitRow(label: 'Tổng', revenue: 60000000, cost: 30000000, profit: 30000000, margin: 50),
        series: [ProfitRow(label: '09/2026', revenue: 60000000, cost: 30000000, profit: 30000000)],
        totalDebt: 70000000,
        totalOverdue: 15000000,
        totalCredit: 3000000,
        codHeld: 5500000,
        codOverThreshold: 1,
      );
}
