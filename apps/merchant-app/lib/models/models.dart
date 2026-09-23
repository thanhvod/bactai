// Model thuần (parse từ JSON GraphQL — chữ ký theo apps/api/schema.gql). Money = int VND, DateTime = ISO string.

typedef Json = Map<String, dynamic>;

int money(Object? v) => v == null ? 0 : (v as num).round();
int? moneyOrNull(Object? v) => v == null ? null : (v as num).round();
DateTime? date(Object? v) => v == null ? null : DateTime.tryParse(v.toString())?.toLocal();
String str(Object? v) => v?.toString() ?? '';
String? strOrNull(Object? v) => v?.toString();
List<Json> list(Object? v) => (v as List?)?.cast<Map>().map((e) => e.cast<String, dynamic>()).toList() ?? const [];
Json obj(Object? v) => (v as Map?)?.cast<String, dynamic>() ?? const {};

class PageResult<T> {
  const PageResult({required this.items, required this.totalCount, this.endCursor, this.hasNextPage = false});
  final List<T> items;
  final int totalCount;
  final String? endCursor;
  final bool hasNextPage;

  static PageResult<T> parse<T>(Json conn, T Function(Json) f) => PageResult(
        items: list(conn['nodes']).map(f).toList(),
        totalCount: (conn['totalCount'] as num?)?.toInt() ?? 0,
        endCursor: obj(conn['pageInfo'])['endCursor'] as String?,
        hasNextPage: obj(conn['pageInfo'])['hasNextPage'] == true,
      );
}

// ---------------- Auth ----------------
class Membership {
  const Membership({required this.id, required this.merchantId, required this.merchantName, required this.merchantCode, required this.role, required this.status});
  final String id, merchantId, merchantName, merchantCode, role, status;
  bool get isActive => status == 'ACTIVE';
  factory Membership.fromJson(Json j) => Membership(
      id: str(j['id']), merchantId: str(j['merchantId']), merchantName: str(j['merchantName']), merchantCode: str(j['merchantCode']), role: str(j['role']), status: str(j['status']));
}

class CurrentContext {
  const CurrentContext({required this.merchantId, required this.merchantName, required this.role, required this.permissions});
  final String merchantId, merchantName, role;
  final Set<String> permissions;
  factory CurrentContext.fromJson(Json j) => CurrentContext(
      merchantId: str(j['merchantId']), merchantName: str(j['merchantName']), role: str(j['role']), permissions: (j['permissions'] as List? ?? const []).map((e) => e.toString()).toSet());
}

class Me {
  const Me({required this.email, this.name, this.phone, this.mustChangePassword = false, required this.memberships, this.current});
  final String email;
  final String? name;
  /// SĐT đăng nhập App Merchant (D-014)
  final String? phone;
  final bool mustChangePassword;
  final List<Membership> memberships;
  final CurrentContext? current;
  factory Me.fromJson(Json j) => Me(
        email: str(obj(j['account'])['email']),
        name: strOrNull(obj(j['account'])['name']),
        phone: strOrNull(obj(j['account'])['phone']),
        mustChangePassword: obj(j['account'])['mustChangePassword'] == true,
        memberships: list(j['memberships']).map(Membership.fromJson).toList(),
        current: j['current'] == null ? null : CurrentContext.fromJson(obj(j['current'])),
      );
  List<Membership> get activeMemberships => memberships.where((m) => m.isActive).toList();
}

const roleLabels = {'ADMIN': 'Giám đốc / Admin', 'OPERATION': 'Operation', 'ACCOUNTANT': 'Kế toán'};

// ---------------- Dashboard ----------------
class DashboardTrip {
  const DashboardTrip({required this.id, required this.code, required this.status, required this.orderCode, this.routeSummary, this.vehiclePlate, this.driverName, required this.plannedStartAt, this.openIncident = false, this.hasWarning = false});
  final String id, code, status, orderCode;
  final String? routeSummary, vehiclePlate, driverName;
  final DateTime? plannedStartAt;
  final bool openIncident, hasWarning;
  factory DashboardTrip.fromJson(Json j) => DashboardTrip(
      id: str(j['id']), code: str(j['code']), status: str(j['status']), orderCode: str(j['orderCode']), routeSummary: strOrNull(j['routeSummary']),
      vehiclePlate: strOrNull(j['vehiclePlate']), driverName: strOrNull(j['driverName']), plannedStartAt: date(j['plannedStartAt']),
      openIncident: j['openIncident'] == true, hasWarning: j['hasWarning'] == true);
}

class DashboardData {
  const DashboardData({
    required this.runningTrips,
    required this.todayTrips,
    required this.ordersNeedAction,
    required this.unassignedOrders,
    required this.overdueAmount,
    required this.overdueCustomers,
    required this.codHeldAmount,
    required this.codHeldDrivers,
    required this.codOverThreshold,
    required this.openIncidents,
    required this.payrollPending,
    required this.revenueMonth,
    required this.profitMonth,
    required this.receivable,
    required this.todayTripList,
  });
  final int runningTrips, todayTrips, ordersNeedAction, unassignedOrders, overdueAmount, overdueCustomers, codHeldAmount, codHeldDrivers, codOverThreshold, openIncidents, payrollPending, revenueMonth, profitMonth, receivable;
  final List<DashboardTrip> todayTripList;
  factory DashboardData.fromJson(Json j) => DashboardData(
        runningTrips: money(j['runningTrips']),
        todayTrips: money(j['todayTrips']),
        ordersNeedAction: money(j['ordersNeedAction']),
        unassignedOrders: money(j['unassignedOrders']),
        overdueAmount: money(obj(j['overdueDebt'])['amount']),
        overdueCustomers: money(obj(j['overdueDebt'])['count']),
        codHeldAmount: money(obj(j['codHeld'])['amount']),
        codHeldDrivers: money(obj(j['codHeld'])['count']),
        codOverThreshold: money(j['codOverThreshold']),
        openIncidents: money(j['openIncidents']),
        payrollPending: money(j['payrollPending']),
        revenueMonth: money(j['revenueMonth']),
        profitMonth: money(j['profitMonth']),
        receivable: money(j['receivable']),
        todayTripList: list(j['todayTripList']).map(DashboardTrip.fromJson).toList(),
      );
}

// ---------------- Trips ----------------
class StopItem {
  const StopItem({required this.id, required this.type, required this.sequence, required this.status, required this.address, this.locationName, this.contactName, this.contactPhone, this.plannedAt, this.arrivedAt, this.completedAt, this.codExpected, this.codActual, this.podCount = 0, this.skipReason});
  final String id, type, status, address;
  final int sequence, podCount;
  final String? locationName, contactName, contactPhone, skipReason;
  final DateTime? plannedAt, arrivedAt, completedAt;
  final int? codExpected, codActual;
  factory StopItem.fromJson(Json j) => StopItem(
      id: str(j['id']), type: str(j['type']), sequence: money(j['tripSequence'] ?? j['sequence']), status: str(j['status']), address: str(j['address']),
      locationName: strOrNull(j['locationName']), contactName: strOrNull(j['contactName']), contactPhone: strOrNull(j['contactPhone']),
      plannedAt: date(j['plannedAt']), arrivedAt: date(j['arrivedAt']), completedAt: date(j['completedAt']),
      codExpected: moneyOrNull(j['codExpected']), codActual: moneyOrNull(j['codActual']), podCount: money(j['podCount']), skipReason: strOrNull(j['skipReason']));
}

class IncidentRef {
  const IncidentRef({required this.id, required this.code, required this.title, required this.severity, required this.status});
  final String id, code, title, severity, status;
  bool get isOpen => status == 'OPEN' || status == 'IN_PROGRESS';
  factory IncidentRef.fromJson(Json j) => IncidentRef(id: str(j['id']), code: str(j['code']), title: str(j['title']), severity: str(j['severity']), status: str(j['status']));
}

class LastLocation {
  const LastLocation({required this.lat, required this.lng, required this.capturedAt, this.isStale = false, this.speed});
  final double lat, lng;
  final DateTime? capturedAt;
  final bool isStale;
  final double? speed;
  factory LastLocation.fromJson(Json j) => LastLocation(
      lat: (j['lat'] as num).toDouble(), lng: (j['lng'] as num).toDouble(), capturedAt: date(j['capturedAt']), isStale: j['isStale'] == true, speed: (j['speed'] as num?)?.toDouble());
}

class TripItem {
  const TripItem({
    required this.id,
    required this.code,
    required this.status,
    required this.orderId,
    required this.orderCode,
    required this.customerName,
    this.routeSummary,
    this.vehiclePlate,
    this.driverName,
    this.driverPhone,
    this.plannedStartAt,
    this.plannedEndAt,
    this.previousStatusBeforePause,
    this.pauseReasonLabel,
    this.codExpectedTotal = 0,
    this.codActualTotal = 0,
    this.openIncidentCount = 0,
    this.hasWarning = false,
    this.allowedNextStatuses = const [],
    this.stops = const [],
    this.incidents = const [],
    this.lastLocation,
  });
  final String id, code, status, orderId, orderCode, customerName;
  final String? routeSummary, vehiclePlate, driverName, driverPhone, previousStatusBeforePause, pauseReasonLabel;
  final DateTime? plannedStartAt, plannedEndAt;
  final int codExpectedTotal, codActualTotal, openIncidentCount;
  final bool hasWarning;
  final List<String> allowedNextStatuses;
  final List<StopItem> stops;
  final List<IncidentRef> incidents;
  final LastLocation? lastLocation;

  factory TripItem.fromJson(Json j) {
    final order = obj(j['order']);
    final vehicle = obj(j['vehicle']);
    final driver = obj(j['driver']);
    return TripItem(
      id: str(j['id']),
      code: str(j['code']),
      status: str(j['status']),
      orderId: str(j['orderId'] ?? order['id']),
      orderCode: str(order['code']),
      customerName: str(order['customerName']),
      routeSummary: strOrNull(j['routeSummary']),
      vehiclePlate: strOrNull(vehicle['plate']),
      driverName: strOrNull(driver['name']),
      driverPhone: strOrNull(driver['phone']),
      plannedStartAt: date(j['plannedStartAt']),
      plannedEndAt: date(j['plannedEndAt']),
      previousStatusBeforePause: strOrNull(j['previousStatusBeforePause']),
      pauseReasonLabel: strOrNull(j['pauseReasonLabel']),
      codExpectedTotal: money(j['codExpectedTotal']),
      codActualTotal: money(j['codActualTotal']),
      openIncidentCount: money(j['openIncidentCount']),
      hasWarning: j['hasWarning'] == true,
      allowedNextStatuses: (j['allowedNextStatuses'] as List? ?? const []).map((e) => e.toString()).toList(),
      stops: list(j['stops']).map(StopItem.fromJson).toList(),
      incidents: list(j['incidents']).map(IncidentRef.fromJson).toList(),
      lastLocation: j['lastLocation'] == null ? null : LastLocation.fromJson(obj(j['lastLocation'])),
    );
  }
}

class LocationPin {
  const LocationPin({required this.tripId, required this.tripCode, required this.orderCode, required this.tripStatus, required this.lat, required this.lng, this.vehiclePlate, this.driverName, this.driverPhone, this.capturedAt, this.isStale = false});
  final String tripId, tripCode, orderCode, tripStatus;
  final double lat, lng;
  final String? vehiclePlate, driverName, driverPhone;
  final DateTime? capturedAt;
  final bool isStale;
  factory LocationPin.fromJson(Json j) => LocationPin(
      tripId: str(j['tripId']), tripCode: str(j['tripCode']), orderCode: str(j['orderCode']), tripStatus: str(j['tripStatus']),
      lat: (j['lat'] as num).toDouble(), lng: (j['lng'] as num).toDouble(), vehiclePlate: strOrNull(j['vehiclePlate']),
      driverName: strOrNull(j['driverName']), driverPhone: strOrNull(j['driverPhone']), capturedAt: date(j['capturedAt']), isStale: j['isStale'] == true);
}

class AttachmentItem {
  const AttachmentItem({required this.id, required this.fileName, required this.category, this.url, this.createdAt, this.mimeType = ''});
  final String id, fileName, category, mimeType;
  final String? url;
  final DateTime? createdAt;
  bool get isImage => mimeType.startsWith('image/');
  factory AttachmentItem.fromJson(Json j) =>
      AttachmentItem(id: str(j['id']), fileName: str(j['fileName']), category: str(j['category']), url: strOrNull(j['url']), createdAt: date(j['createdAt']), mimeType: str(j['mimeType']));
}

class CatalogOption {
  const CatalogOption({required this.id, required this.name});
  final String id, name;
  factory CatalogOption.fromJson(Json j) => CatalogOption(id: str(j['id']), name: str(j['name']));
}

// ---------------- Orders ----------------
class OrderFinance {
  const OrderFinance({required this.totalAmount, required this.paidAmount, required this.remainingAmount, required this.expenseTotal, required this.profit, this.provisional = true, this.overdueDays = 0});
  final int totalAmount, paidAmount, remainingAmount, expenseTotal, profit, overdueDays;
  final bool provisional;
  factory OrderFinance.fromJson(Json j) => OrderFinance(
      totalAmount: money(j['totalAmount']), paidAmount: money(j['paidAmount']), remainingAmount: money(j['remainingAmount']),
      expenseTotal: money(j['expenseTotal']), profit: money(j['profit']), provisional: j['provisional'] != false, overdueDays: money(j['overdueDays']));
}

class OrderItem {
  const OrderItem({
    required this.id,
    required this.code,
    required this.status,
    required this.customerId,
    required this.customerName,
    this.customerPhone,
    this.routeSummary,
    this.orderDate,
    this.dueDate,
    this.totalAmount = 0,
    this.paidAmount = 0,
    this.remainingAmount = 0,
    this.overdueDays = 0,
    this.tripCount = 0,
    this.warnings = const [],
    this.stops = const [],
    this.trips = const [],
    this.cargo = const [],
    this.finance,
    this.attachmentCount = 0,
    this.note,
  });
  final String id, code, status, customerId, customerName;
  final String? customerPhone, routeSummary, note;
  final DateTime? orderDate, dueDate;
  final int totalAmount, paidAmount, remainingAmount, overdueDays, tripCount, attachmentCount;
  final List<String> warnings, cargo;
  final List<StopItem> stops;
  final List<TripItem> trips;
  final OrderFinance? finance;

  factory OrderItem.fromJson(Json j) {
    final c = obj(j['customer']);
    return OrderItem(
      id: str(j['id']),
      code: str(j['code']),
      status: str(j['status']),
      customerId: str(c['id']),
      customerName: str(c['name']),
      customerPhone: strOrNull(c['phone']),
      routeSummary: strOrNull(j['routeSummary']),
      orderDate: date(j['orderDate']),
      dueDate: date(j['dueDate']),
      totalAmount: money(j['totalAmount']),
      paidAmount: money(j['paidAmount']),
      remainingAmount: money(j['remainingAmount']),
      overdueDays: money(j['overdueDays']),
      tripCount: money(j['tripCount']),
      warnings: [...(j['warnings'] as List? ?? const []).map((e) => e.toString()), ...(j['customerWarnings'] as List? ?? const []).map((e) => e.toString())],
      stops: list(j['stops']).map(StopItem.fromJson).toList(),
      trips: list(j['trips']).map(TripItem.fromJson).toList(),
      cargo: list(j['cargoLines']).map((c) => [str(c['name']), if (c['weightKg'] != null) '${c['weightKg']} kg'].join(' · ')).toList(),
      finance: j['financeSummary'] == null ? null : OrderFinance.fromJson(obj(j['financeSummary'])),
      attachmentCount: money(j['attachmentCount']),
      note: strOrNull(j['note']),
    );
  }
}

// ---------------- Customers ----------------
class CustomerLocationItem {
  const CustomerLocationItem({required this.id, required this.name, required this.address, required this.usage, this.contactName, this.contactPhone, this.isDefault = false});
  final String id, name, address, usage;
  final String? contactName, contactPhone;
  final bool isDefault;
  factory CustomerLocationItem.fromJson(Json j) => CustomerLocationItem(
      id: str(j['id']), name: str(j['name']), address: str(j['address']), usage: str(j['usage']), contactName: strOrNull(j['contactName']),
      contactPhone: strOrNull(j['contactPhone']), isDefault: j['isDefault'] == true);
  bool get canPickup => usage == 'PICKUP' || usage == 'BOTH';
  bool get canDrop => usage == 'DROPOFF' || usage == 'BOTH';
}

class CustomerItem {
  const CustomerItem({
    required this.id,
    required this.code,
    required this.name,
    this.phone,
    this.status = 'ACTIVE',
    this.remaining = 0,
    this.overdueAmount = 0,
    this.maxOverdueDays = 0,
    this.creditBalance = 0,
    this.creditLimit,
    this.overLimit = false,
    this.defaultDebtDays,
    this.warnings = const [],
    this.locations = const [],
  });
  final String id, code, name, status;
  final String? phone;
  final int remaining, overdueAmount, maxOverdueDays, creditBalance;
  final int? creditLimit, defaultDebtDays;
  final bool overLimit;
  final List<String> warnings;
  final List<CustomerLocationItem> locations;
  factory CustomerItem.fromJson(Json j) {
    final d = obj(j['debtSummary']);
    return CustomerItem(
      id: str(j['id']),
      code: str(j['code']),
      name: str(j['name']),
      phone: strOrNull(j['phone']),
      status: str(j['status']),
      remaining: money(d['remaining']),
      overdueAmount: money(d['overdueAmount']),
      maxOverdueDays: money(d['maxOverdueDays']),
      creditBalance: money(j['creditBalance']),
      creditLimit: moneyOrNull(j['creditLimit']),
      overLimit: d['overLimit'] == true,
      defaultDebtDays: (j['defaultDebtDays'] as num?)?.toInt(),
      warnings: (j['warnings'] as List? ?? const []).map((e) => e.toString()).toList(),
      locations: list(j['locations']).map(CustomerLocationItem.fromJson).toList(),
    );
  }
}

// ---------------- Notifications ----------------
class NotificationItem {
  const NotificationItem({required this.id, required this.type, required this.title, this.body, this.entityType, this.entityId, this.readAt, this.createdAt});
  final String id, type, title;
  final String? body, entityType, entityId;
  final DateTime? readAt, createdAt;
  bool get isRead => readAt != null;
  factory NotificationItem.fromJson(Json j) => NotificationItem(
      id: str(j['id']), type: str(j['type']), title: str(j['title']), body: strOrNull(j['body']), entityType: strOrNull(j['entityType']),
      entityId: strOrNull(j['entityId']), readAt: date(j['readAt']), createdAt: date(j['createdAt']));
}

// ---------------- Finance ----------------
class DebtRow {
  const DebtRow({required this.customerId, required this.customerName, required this.remaining, required this.overdueAmount, required this.maxOverdueDays, this.phone});
  final String customerId, customerName;
  final String? phone;
  final int remaining, overdueAmount, maxOverdueDays;
  factory DebtRow.fromJson(Json j) => DebtRow(
      customerId: str(obj(j['customer'])['id']), customerName: str(obj(j['customer'])['name']), phone: strOrNull(j['phone']),
      remaining: money(j['remaining']), overdueAmount: money(j['overdueAmount']), maxOverdueDays: money(j['maxOverdueDays']));
}

class CodItem {
  const CodItem({required this.stopId, required this.orderCode, required this.customerName, required this.held, required this.daysHeld, this.collectedAt});
  final String stopId, orderCode, customerName;
  final int held, daysHeld;
  final DateTime? collectedAt;
  factory CodItem.fromJson(Json j) => CodItem(
      stopId: str(j['stopId']), orderCode: str(j['orderCode']), customerName: str(j['customerName']), held: money(j['held']), daysHeld: money(j['daysHeld']), collectedAt: date(j['collectedAt']));
}

class CodHolder {
  const CodHolder({required this.driverId, required this.driverName, this.phone, required this.codCollected, required this.codRemitted, required this.codHeld, required this.daysHeld, this.oldestHeldAt, this.overAmount = false, this.overDays = false, this.items = const []});
  final String driverId, driverName;
  final String? phone;
  final int codCollected, codRemitted, codHeld, daysHeld;
  final DateTime? oldestHeldAt;
  final bool overAmount, overDays;
  final List<CodItem> items;
  bool get overThreshold => overAmount || overDays;
  factory CodHolder.fromJson(Json j) => CodHolder(
      driverId: str(obj(j['driver'])['id']), driverName: str(obj(j['driver'])['name']), phone: strOrNull(j['phone']),
      codCollected: money(j['codCollected']), codRemitted: money(j['codRemitted']), codHeld: money(j['codHeld']), daysHeld: money(j['daysHeld']),
      oldestHeldAt: date(j['oldestHeldAt']), overAmount: j['overAmount'] == true, overDays: j['overDays'] == true, items: list(j['items']).map(CodItem.fromJson).toList());
}

class CodReport {
  const CodReport({required this.rows, required this.totalHeld, required this.warningAmount, required this.warningDays});
  final List<CodHolder> rows;
  final int totalHeld, warningAmount, warningDays;
  factory CodReport.fromJson(Json j) => CodReport(
      rows: list(j['rows']).map(CodHolder.fromJson).toList(), totalHeld: money(j['totalHeld']), warningAmount: money(j['codWarningAmount']), warningDays: money(j['codWarningDays']));
}

class PaymentItem {
  const PaymentItem({required this.id, required this.code, required this.typeLabel, required this.payerLabel, required this.amount, this.receivedAt, this.notRevenue = false});
  final String id, code, typeLabel, payerLabel;
  final int amount;
  final DateTime? receivedAt;
  final bool notRevenue;
  factory PaymentItem.fromJson(Json j) => PaymentItem(
      id: str(j['id']), code: str(j['code']), typeLabel: str(j['typeLabel']), payerLabel: str(j['payerLabel']), amount: money(j['amount']),
      receivedAt: date(j['receivedAt']), notRevenue: j['notRevenue'] == true);
}

class ExpenseItem {
  const ExpenseItem({required this.id, required this.code, required this.kindLabel, required this.amount, this.categoryName, this.expenseDate, this.paidStatus = 'PAID'});
  final String id, code, kindLabel, paidStatus;
  final String? categoryName;
  final int amount;
  final DateTime? expenseDate;
  factory ExpenseItem.fromJson(Json j) => ExpenseItem(
      id: str(j['id']), code: str(j['code']), kindLabel: str(j['kindLabel']), amount: money(j['amount']), categoryName: strOrNull(j['categoryName']),
      expenseDate: date(j['expenseDate']), paidStatus: str(j['paidStatus']));
}

class PayrollTotals {
  const PayrollTotals({this.salary = 0, this.bonus = 0, this.advance = 0, this.deduction = 0, this.adjustment = 0, this.net = 0, this.driverCount = 0});
  final int salary, bonus, advance, deduction, adjustment, net, driverCount;
  factory PayrollTotals.fromJson(Json j) => PayrollTotals(
      salary: money(j['salary']), bonus: money(j['bonus']), advance: money(j['advance']), deduction: money(j['deduction']),
      adjustment: money(j['adjustment']), net: money(j['net']), driverCount: money(j['driverCount']));
}

class PayrollLine {
  const PayrollLine({required this.driverName, required this.baseSalary, required this.bonusTotal, required this.advanceTotal, required this.deductionTotal, required this.netAmount, this.anomalies = const []});
  final String driverName;
  final int baseSalary, bonusTotal, advanceTotal, deductionTotal, netAmount;
  final List<String> anomalies;
  factory PayrollLine.fromJson(Json j) => PayrollLine(
      driverName: str(j['driverName']), baseSalary: money(j['baseSalary']), bonusTotal: money(j['bonusTotal']), advanceTotal: money(j['advanceTotal']),
      deductionTotal: money(j['deductionTotal']), netAmount: money(j['netAmount']), anomalies: (j['anomalies'] as List? ?? const []).map((e) => e.toString()).toList());
}

class PayrollItem {
  const PayrollItem({required this.id, required this.code, required this.status, required this.periodLabel, required this.totals, this.submittedAt, this.submittedByName, this.returnReason, this.lines = const [], this.previousTotals, this.anomalyCount = 0});
  final String id, code, status, periodLabel;
  final PayrollTotals totals;
  final PayrollTotals? previousTotals;
  final DateTime? submittedAt;
  final String? submittedByName, returnReason;
  final List<PayrollLine> lines;
  final int anomalyCount;
  factory PayrollItem.fromJson(Json j) => PayrollItem(
      id: str(j['id']), code: str(j['code']), status: str(j['status']), periodLabel: str(j['periodLabel']), totals: PayrollTotals.fromJson(obj(j['totals'])),
      previousTotals: j['previousTotals'] == null ? null : PayrollTotals.fromJson(obj(j['previousTotals'])),
      submittedAt: date(j['submittedAt']), submittedByName: strOrNull(j['submittedByName']), returnReason: strOrNull(j['returnReason']),
      lines: list(j['lines']).map(PayrollLine.fromJson).toList(), anomalyCount: money(j['anomalyCount']));
}

const payrollStatusLabels = {
  'DRAFT': 'Nháp',
  'SUBMITTED': 'Chờ duyệt',
  'RETURNED': 'Bị trả về',
  'APPROVED': 'Đã duyệt',
  'PAID': 'Đã chi trả',
  'CANCELLED': 'Đã hủy',
};

class FinanceOverview {
  const FinanceOverview({required this.debtRows, required this.receivable, required this.overdue, required this.cod, required this.recentPayments, required this.recentExpenses, required this.pendingPayrolls});
  final List<DebtRow> debtRows;
  final int receivable, overdue;
  final CodReport cod;
  final List<PaymentItem> recentPayments;
  final List<ExpenseItem> recentExpenses;
  final List<PayrollItem> pendingPayrolls;
}

// ---------------- Reports ----------------
class ProfitRow {
  const ProfitRow({required this.label, required this.revenue, required this.cost, required this.profit, this.margin});
  final String label;
  final int revenue, cost, profit;
  final double? margin;
  factory ProfitRow.fromJson(Json j) =>
      ProfitRow(label: str(j['label']), revenue: money(j['revenue']), cost: money(j['cost']), profit: money(j['profit']), margin: (j['margin'] as num?)?.toDouble());
}

class ReportsOverview {
  const ReportsOverview({required this.totals, required this.series, required this.totalDebt, required this.totalOverdue, required this.totalCredit, required this.codHeld, required this.codOverThreshold});
  final ProfitRow totals;
  final List<ProfitRow> series;
  final int totalDebt, totalOverdue, totalCredit, codHeld, codOverThreshold;
}
