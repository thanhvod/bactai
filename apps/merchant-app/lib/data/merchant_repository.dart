import '../models/models.dart';

/// Nguồn dữ liệu nghiệp vụ App Merchant. Impl thật: [GraphqlMerchantRepository]; test: MockMerchantRepository.
abstract class MerchantRepository {
  Future<Me> me();

  Future<DashboardData> dashboard();
  Future<int> unreadNotificationCount();
  Future<PageResult<NotificationItem>> notifications({bool unreadOnly = false, String? after});
  Future<int> markNotificationRead(String id);
  Future<int> markAllNotificationsRead();

  Future<PageResult<OrderItem>> orders({String? search, List<String>? status, bool needsAction = false, String? after});
  Future<OrderItem> order(String id);
  Future<OrderItem> updateOrderStatus(String id, String status, {String? reason});
  Future<QuickOrderResult> createQuickOrder(QuickOrderInput input);

  Future<PageResult<TripItem>> trips({bool? running, List<String>? status, String? dateFrom, String? dateTo, bool? hasWarning, String? after});
  Future<TripItem> trip(String id);
  Future<TripItem> updateTripStatus(String id, String status, {String? reason, String? note, String? pauseReasonId});
  Future<TripItem> resumeTrip(String id);
  Future<TripItem> cancelTrip(String id, String reason);
  Future<List<AttachmentItem>> stopPods(String stopId);
  Future<List<CatalogOption>> pauseReasons();
  Future<List<LocationPin>> lastKnownLocations();

  Future<PageResult<CustomerItem>> customers({String? search, String? debtStatus, String? after});
  Future<CustomerItem> customer(String id);
  Future<List<OrderItem>> recentOrdersOfCustomer(String customerId);
  Future<List<CustomerLocationItem>> customerLocations(String customerId);

  Future<FinanceOverview> financeOverview();
  Future<CodReport> codHeld({String? driverId});
  Future<void> recordCodRemittance({required String driverId, required int amount, required List<String> stopIds, required String clientRequestId, String? note});

  Future<List<PayrollItem>> payrolls({List<String> status = const ['SUBMITTED']});
  Future<PayrollItem> payroll(String id);
  Future<PayrollItem> approvePayroll(String id, {String? note});
  Future<PayrollItem> returnPayroll(String id, String reason);

  Future<ReportsOverview> reports({required String period});
}

class QuickOrderInput {
  const QuickOrderInput({
    required this.customerId,
    required this.pickupLocationId,
    required this.pickupAddress,
    this.pickupName,
    required this.dropoffLocationId,
    required this.dropoffAddress,
    this.dropoffName,
    required this.freightAmount,
    this.cargoNote,
    this.dueDate,
    this.confirmed = false,
  });
  final String customerId;
  final String? pickupLocationId, dropoffLocationId, pickupName, dropoffName, cargoNote;
  final String pickupAddress, dropoffAddress;
  final int freightAmount;
  /// YYYY-MM-DD
  final String? dueDate;
  final bool confirmed;

  Map<String, dynamic> toGraphql() => {
        'customerId': customerId,
        'freightAmount': freightAmount,
        'status': confirmed ? 'CONFIRMED' : 'DRAFT',
        if (dueDate != null) 'dueDate': dueDate,
        if (cargoNote != null && cargoNote!.trim().isNotEmpty) 'cargoLines': [
          {'name': cargoNote!.trim()}
        ],
        'stops': [
          {'type': 'PICKUP', 'locationId': pickupLocationId, 'address': pickupAddress, 'locationName': pickupName},
          {'type': 'DROPOFF', 'locationId': dropoffLocationId, 'address': dropoffAddress, 'locationName': dropoffName},
        ],
      };
}

class QuickOrderResult {
  const QuickOrderResult({required this.orderId, required this.code, this.warnings = const []});
  final String orderId, code;
  final List<String> warnings;
}
