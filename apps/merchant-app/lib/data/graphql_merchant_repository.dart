import '../core/api/merchant_graphql_client.dart';
import '../models/models.dart';
import 'merchant_repository.dart';

const _tripFields = '''
  id code status orderId routeSummary plannedStartAt plannedEndAt previousStatusBeforePause pauseReasonLabel
  codExpectedTotal codActualTotal openIncidentCount hasWarning allowedNextStatuses
  order { id code customerName } vehicle { plate } driver { name phone }
''';

const _tripDetailFields = '''
  $_tripFields
  lastLocation { lat lng capturedAt isStale speed }
  incidents { id code title severity status }
  stops { id type sequence tripSequence status address locationName contactName contactPhone plannedAt arrivedAt completedAt codExpected codActual podCount skipReason }
''';

const _orderListFields = '''
  id code status routeSummary orderDate dueDate totalAmount paidAmount remainingAmount overdueDays tripCount warnings
  customer { id name phone }
''';

const _customerFields = '''
  id code name phone status creditBalance creditLimit defaultDebtDays warnings
  debtSummary { remaining overdueAmount maxOverdueDays overLimit }
''';

const _payrollFields = '''
  id code status periodLabel submittedAt submittedByName returnReason anomalyCount
  totals { salary bonus advance deduction adjustment net driverCount }
''';

String _isoDate(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

class GraphqlMerchantRepository implements MerchantRepository {
  GraphqlMerchantRepository(this.client);
  final MerchantGraphqlClient client;

  @override
  Future<Me> me() async {
    final d = await client.query('''query { me {
      account { email name phone mustChangePassword }
      memberships { id merchantId merchantName merchantCode role status }
      current { merchantId merchantName role permissions }
    } }''');
    return Me.fromJson(obj(d['me']));
  }

  @override
  Future<DashboardData> dashboard() async {
    final d = await client.query('''query { dashboardSummary {
      runningTrips todayTrips ordersNeedAction unassignedOrders codOverThreshold openIncidents payrollPending
      revenueMonth profitMonth receivable
      overdueDebt { amount count } codHeld { amount count }
      todayTripList { id code status orderCode routeSummary vehiclePlate driverName plannedStartAt openIncident hasWarning }
    } }''');
    return DashboardData.fromJson(obj(d['dashboardSummary']));
  }

  @override
  Future<int> unreadNotificationCount() async => money((await client.query('query { unreadNotificationCount }'))['unreadNotificationCount']);

  @override
  Future<PageResult<NotificationItem>> notifications({bool unreadOnly = false, String? after}) async {
    final d = await client.query(r'''query($f: NotificationFilter, $after: String) { notifications(filter: $f, first: 30, after: $after) {
      totalCount pageInfo { endCursor hasNextPage } nodes { id type title body entityType entityId readAt createdAt } } }''', variables: {
      'f': {if (unreadOnly) 'unread': true},
      'after': after,
    });
    return PageResult.parse(obj(d['notifications']), NotificationItem.fromJson);
  }

  @override
  Future<int> markNotificationRead(String id) async =>
      money((await client.mutate(r'mutation($id: ID!) { markNotificationRead(id: $id) }', variables: {'id': id}))['markNotificationRead']);

  @override
  Future<int> markAllNotificationsRead() async => money((await client.mutate('mutation { markAllNotificationsRead }'))['markAllNotificationsRead']);

  @override
  Future<PageResult<OrderItem>> orders({String? search, List<String>? status, bool needsAction = false, String? after}) async {
    final d = await client.query('query(\$f: OrderFilter, \$after: String) { orders(filter: \$f, first: 20, after: \$after, sort: "ORDER_DATE_DESC") { totalCount pageInfo { endCursor hasNextPage } nodes { $_orderListFields } } }',
        variables: {
          'f': {
            if (search != null && search.isNotEmpty) 'search': search,
            if (status != null && status.isNotEmpty) 'status': status,
            if (needsAction) 'needsAction': true,
          },
          'after': after,
        });
    return PageResult.parse(obj(d['orders']), OrderItem.fromJson);
  }

  @override
  Future<OrderItem> order(String id) async {
    final d = await client.query('''query(\$id: ID!) { order(id: \$id) {
      $_orderListFields note attachmentCount customerWarnings
      cargoLines { name weightKg }
      stops { id type sequence status address locationName contactName contactPhone plannedAt arrivedAt completedAt codExpected codActual podCount skipReason }
      trips { $_tripFields }
      financeSummary { totalAmount paidAmount remainingAmount expenseTotal profit provisional overdueDays }
    } }''', variables: {'id': id});
    return OrderItem.fromJson(obj(d['order']));
  }

  @override
  Future<OrderItem> updateOrderStatus(String id, String status, {String? reason}) async {
    await client.mutate(r'mutation($id: ID!, $s: String!, $r: String) { updateOrderStatus(id: $id, status: $s, reason: $r) { id status } }',
        variables: {'id': id, 's': status, 'r': reason});
    return order(id);
  }

  @override
  Future<QuickOrderResult> createQuickOrder(QuickOrderInput input) async {
    final d = await client.mutate(r'mutation($i: CreateOrderInput!) { createOrder(input: $i) { order { id code } warnings } }', variables: {'i': input.toGraphql()});
    final p = obj(d['createOrder']);
    return QuickOrderResult(
        orderId: str(obj(p['order'])['id']), code: str(obj(p['order'])['code']), warnings: (p['warnings'] as List? ?? const []).map((e) => e.toString()).toList());
  }

  @override
  Future<PageResult<TripItem>> trips({bool? running, List<String>? status, String? dateFrom, String? dateTo, bool? hasWarning, String? after}) async {
    final d = await client.query('query(\$f: TripFilter, \$after: String) { trips(filter: \$f, first: 30, after: \$after) { totalCount pageInfo { endCursor hasNextPage } nodes { $_tripFields lastLocation { lat lng capturedAt isStale } } } }',
        variables: {
          'f': {
            'running': ?running,
            if (status != null && status.isNotEmpty) 'status': status,
            'dateFrom': ?dateFrom,
            'dateTo': ?dateTo,
            'hasWarning': ?hasWarning,
          },
          'after': after,
        });
    return PageResult.parse(obj(d['trips']), TripItem.fromJson);
  }

  @override
  Future<TripItem> trip(String id) async {
    final d = await client.query('query(\$id: ID!) { trip(id: \$id) { $_tripDetailFields } }', variables: {'id': id});
    return TripItem.fromJson(obj(d['trip']));
  }

  @override
  Future<TripItem> updateTripStatus(String id, String status, {String? reason, String? note, String? pauseReasonId}) async {
    await client.mutate(r'mutation($id: ID!, $i: TripStatusChangeInput!) { updateTripStatus(id: $id, input: $i) { id status } }', variables: {
      'id': id,
      'i': {'status': status, 'reason': reason, 'note': note, 'pauseReasonId': pauseReasonId},
    });
    return trip(id);
  }

  @override
  Future<TripItem> resumeTrip(String id) async {
    await client.mutate(r'mutation($id: ID!) { resumeTrip(id: $id) { id status } }', variables: {'id': id});
    return trip(id);
  }

  @override
  Future<TripItem> cancelTrip(String id, String reason) async {
    await client.mutate(r'mutation($id: ID!, $r: String!) { cancelTrip(id: $id, reason: $r) { id status } }', variables: {'id': id, 'r': reason});
    return trip(id);
  }

  @override
  Future<List<AttachmentItem>> stopPods(String stopId) async {
    final d = await client.query(r'query($id: ID!) { attachments(entityType: ORDER_STOP, entityId: $id, category: POD) { id fileName category url createdAt mimeType } }',
        variables: {'id': stopId});
    return list(d['attachments']).map(AttachmentItem.fromJson).toList();
  }

  @override
  Future<List<CatalogOption>> pauseReasons() async {
    final d = await client.query('query { catalogItems(type: PAUSE_REASON, activeOnly: true) { id name } }');
    return list(d['catalogItems']).map(CatalogOption.fromJson).toList();
  }

  @override
  Future<List<LocationPin>> lastKnownLocations() async {
    final d = await client.query('query { lastKnownLocations(running: true) { tripId tripCode orderCode tripStatus lat lng vehiclePlate driverName driverPhone capturedAt isStale } }');
    return list(d['lastKnownLocations']).map(LocationPin.fromJson).toList();
  }

  @override
  Future<PageResult<CustomerItem>> customers({String? search, String? debtStatus, String? after}) async {
    final d = await client.query('query(\$f: CustomerFilter, \$after: String) { customers(filter: \$f, first: 30, after: \$after) { totalCount pageInfo { endCursor hasNextPage } nodes { $_customerFields } } }',
        variables: {
          'f': {
            if (search != null && search.isNotEmpty) 'search': search,
            'debtStatus': ?debtStatus,
            'status': 'ACTIVE',
          },
          'after': after,
        });
    return PageResult.parse(obj(d['customers']), CustomerItem.fromJson);
  }

  @override
  Future<CustomerItem> customer(String id) async {
    final d = await client.query('query(\$id: ID!) { customer(id: \$id) { $_customerFields locations { id name address usage contactName contactPhone isDefault } } }', variables: {'id': id});
    return CustomerItem.fromJson(obj(d['customer']));
  }

  @override
  Future<List<OrderItem>> recentOrdersOfCustomer(String customerId) async {
    final d = await client.query('query(\$f: OrderFilter) { orders(filter: \$f, first: 5, sort: "ORDER_DATE_DESC") { nodes { $_orderListFields } } }', variables: {
      'f': {'customerId': customerId},
    });
    return list(obj(d['orders'])['nodes']).map(OrderItem.fromJson).toList();
  }

  @override
  Future<List<CustomerLocationItem>> customerLocations(String customerId) async {
    final d = await client.query(r'query($id: ID!) { customerLocations(customerId: $id) { id name address usage contactName contactPhone isDefault } }', variables: {'id': customerId});
    return list(d['customerLocations']).map(CustomerLocationItem.fromJson).toList();
  }

  static const _codFields = '''
    totalHeld codWarningAmount codWarningDays
    rows { driver { id name } phone codCollected codRemitted codHeld daysHeld oldestHeldAt overAmount overDays
      items { stopId orderCode customerName held daysHeld collectedAt } }
  ''';

  @override
  Future<FinanceOverview> financeOverview() async {
    final d = await client.query('''query {
      customerDebt(filter: { overdueOnly: true }) { totals { receivable remaining overdueAmount } rows { customer { id name } phone remaining overdueAmount maxOverdueDays } }
      driverCodHeld { $_codFields }
      payments(first: 3) { nodes { id code typeLabel payerLabel amount receivedAt notRevenue } }
      expenses(first: 3) { nodes { id code kindLabel amount categoryName expenseDate paidStatus } }
      payrolls(filter: { status: ["SUBMITTED"] }, first: 5) { nodes { $_payrollFields } }
    }''');
    final debt = obj(d['customerDebt']);
    final totals = obj(debt['totals']);
    return FinanceOverview(
      debtRows: list(debt['rows']).map(DebtRow.fromJson).toList(),
      receivable: money(totals['remaining']),
      overdue: money(totals['overdueAmount']),
      cod: CodReport.fromJson(obj(d['driverCodHeld'])),
      recentPayments: list(obj(d['payments'])['nodes']).map(PaymentItem.fromJson).toList(),
      recentExpenses: list(obj(d['expenses'])['nodes']).map(ExpenseItem.fromJson).toList(),
      pendingPayrolls: list(obj(d['payrolls'])['nodes']).map(PayrollItem.fromJson).toList(),
    );
  }

  @override
  Future<CodReport> codHeld({String? driverId}) async {
    final d = await client.query('query(\$f: DriverCodHeldFilter) { driverCodHeld(filter: \$f) { $_codFields } }', variables: {
      'f': {'driverId': ?driverId},
    });
    return CodReport.fromJson(obj(d['driverCodHeld']));
  }

  @override
  Future<void> recordCodRemittance({required String driverId, required int amount, required List<String> stopIds, required String clientRequestId, String? note}) async {
    await client.mutate(r'mutation($i: PaymentInInput!) { createPaymentIn(input: $i) { id code } }', variables: {
      'i': {
        'type': 'DRIVER_COD_REMITTANCE',
        'driverId': driverId,
        'amount': amount,
        'method': 'CASH',
        'receivedAt': DateTime.now().toUtc().toIso8601String(),
        if (stopIds.isNotEmpty) 'codStopIds': stopIds,
        'clientRequestId': clientRequestId,
        'note': ?note,
      },
    });
  }

  @override
  Future<List<PayrollItem>> payrolls({List<String> status = const ['SUBMITTED']}) async {
    final d = await client.query('query(\$f: PayrollFilter) { payrolls(filter: \$f, first: 20) { nodes { $_payrollFields } } }', variables: {
      'f': {'status': status},
    });
    return list(obj(d['payrolls'])['nodes']).map(PayrollItem.fromJson).toList();
  }

  @override
  Future<PayrollItem> payroll(String id) async {
    final d = await client.query('''query(\$id: ID!) { payroll(id: \$id) { $_payrollFields
      previousTotals { salary bonus advance deduction adjustment net driverCount }
      lines { driverName baseSalary bonusTotal advanceTotal deductionTotal netAmount anomalies } } }''', variables: {'id': id});
    return PayrollItem.fromJson(obj(d['payroll']));
  }

  @override
  Future<PayrollItem> approvePayroll(String id, {String? note}) async {
    await client.mutate(r'mutation($id: ID!, $n: String) { approvePayroll(id: $id, note: $n) { id status } }', variables: {'id': id, 'n': note});
    return payroll(id);
  }

  @override
  Future<PayrollItem> returnPayroll(String id, String reason) async {
    await client.mutate(r'mutation($id: ID!, $r: String) { returnPayroll(id: $id, reason: $r) { id status } }', variables: {'id': id, 'r': reason});
    return payroll(id);
  }

  @override
  Future<ReportsOverview> reports({required String period}) async {
    final now = DateTime.now();
    final DateTime from;
    final String groupBy;
    if (period == 'WEEK') {
      from = now.subtract(const Duration(days: 7 * 8));
      groupBy = 'WEEK';
    } else {
      from = DateTime(now.year, now.month - 5, 1);
      groupBy = 'MONTH';
    }
    final d = await client.query(r'''query($f: ReportFilter) {
      reportProfit(filter: $f) { totals { label revenue cost profit margin } rows { label revenue cost profit margin } }
      reportCustomerDebt { totalDebt totalOverdue totalCredit }
      reportCodHeld { totalHeld overThresholdCount }
    }''', variables: {
      'f': {'dateFrom': _isoDate(from), 'dateTo': _isoDate(now), 'groupBy': groupBy},
    });
    final p = obj(d['reportProfit']);
    final debt = obj(d['reportCustomerDebt']);
    final cod = obj(d['reportCodHeld']);
    return ReportsOverview(
      totals: ProfitRow.fromJson(obj(p['totals'])),
      series: list(p['rows']).map(ProfitRow.fromJson).toList(),
      totalDebt: money(debt['totalDebt']),
      totalOverdue: money(debt['totalOverdue']),
      totalCredit: money(debt['totalCredit']),
      codHeld: money(cod['totalHeld']),
      codOverThreshold: money(cod['overThresholdCount']),
    );
  }
}
