/// Key quyền giống packages/shared/src/permissions.ts (backend là nơi enforce thật; app chỉ ẩn/disable).
class Perm {
  Perm._();
  static const orderCreate = 'order.create';
  static const orderUpdate = 'order.update';
  static const orderView = 'order.view';
  static const tripStatusUpdate = 'trip.status.update';
  static const tripCancel = 'trip.cancel';
  static const statusReverse = 'status.reverse';
  static const payrollView = 'payroll.view';
  static const payrollApprove = 'payroll.approve';
  static const payrollReturn = 'payroll.return';
  static const codRemittanceRecord = 'cod.remittance.record';
  static const driverLedgerView = 'driverLedger.view';
  static const debtView = 'debt.view';
  static const financeView = 'finance.view';
  static const reportView = 'report.view';
  static const customerView = 'customer.view';
}

/// Trạng thái chuyến lùi so với luồng chuẩn → cần quyền status.reverse + lý do.
const tripFlow = ['SCHEDULED', 'TO_PICKUP', 'PICKING_UP', 'IN_TRANSIT', 'DELIVERING', 'COMPLETED'];

bool isReverseTrip(String from, String to) {
  final i = tripFlow.indexOf(from);
  final j = tripFlow.indexOf(to);
  return i >= 0 && j >= 0 && j < i;
}

/// Thay đổi trạng thái chuyến nào cần lý do (MA-TRIP-02: tạm dừng / hủy / lùi).
bool tripChangeNeedsReason(String from, String to) => to == 'PAUSED' || to == 'CANCELLED' || isReverseTrip(from, to);

/// Quyền cần cho thay đổi (null = chỉ cần trip.status.update).
String? extraPermissionFor(String from, String to) {
  if (to == 'CANCELLED') return Perm.tripCancel;
  if (isReverseTrip(from, to)) return Perm.statusReverse;
  return null;
}
