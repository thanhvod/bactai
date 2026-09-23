// Enum trạng thái + nhãn tiếng Việt + tone — KHỚP packages/shared/src/status.ts.
// Khi sửa status.ts phải sửa file này (API trả string enum, parse bằng `xxxFromApi`).
// ignore_for_file: constant_identifier_names
import '../tokens/bta_tokens.dart';

class StatusMeta {
  const StatusMeta(this.label, this.tone);
  final String label;
  final BtaTone tone;
}

T? _parse<T extends Enum>(List<T> values, String? raw) {
  if (raw == null) return null;
  for (final v in values) {
    if (v.name == raw) return v;
  }
  return null;
}

// ---------- Order ----------
enum OrderStatus { DRAFT, PENDING_CONFIRMATION, CONFIRMED, DISPATCHED, IN_PROGRESS, COMPLETED, CANCELLED }

const orderStatusMeta = {
  OrderStatus.DRAFT: StatusMeta('Nháp', BtaTone.neutral),
  OrderStatus.PENDING_CONFIRMATION: StatusMeta('Chờ xác nhận', BtaTone.warning),
  OrderStatus.CONFIRMED: StatusMeta('Đã xác nhận', BtaTone.info),
  OrderStatus.DISPATCHED: StatusMeta('Đã xếp xe', BtaTone.primary),
  OrderStatus.IN_PROGRESS: StatusMeta('Đang thực hiện', BtaTone.accent),
  OrderStatus.COMPLETED: StatusMeta('Hoàn thành', BtaTone.success),
  OrderStatus.CANCELLED: StatusMeta('Đã hủy', BtaTone.danger),
};
OrderStatus? orderStatusFromApi(String? raw) => _parse(OrderStatus.values, raw);

// ---------- Trip ----------
enum TripStatus { SCHEDULED, TO_PICKUP, PICKING_UP, IN_TRANSIT, PAUSED, DELIVERING, COMPLETED, CANCELLED }

const tripStatusMeta = {
  TripStatus.SCHEDULED: StatusMeta('Đã lên lịch', BtaTone.neutral),
  TripStatus.TO_PICKUP: StatusMeta('Đang đến điểm lấy', BtaTone.info),
  TripStatus.PICKING_UP: StatusMeta('Đang lấy hàng', BtaTone.info),
  TripStatus.IN_TRANSIT: StatusMeta('Đang vận chuyển', BtaTone.accent),
  TripStatus.PAUSED: StatusMeta('Tạm dừng', BtaTone.warning),
  TripStatus.DELIVERING: StatusMeta('Đang trả hàng', BtaTone.primary),
  TripStatus.COMPLETED: StatusMeta('Hoàn thành', BtaTone.success),
  TripStatus.CANCELLED: StatusMeta('Đã hủy', BtaTone.danger),
};
TripStatus? tripStatusFromApi(String? raw) => _parse(TripStatus.values, raw);

const tripRunningStatuses = {TripStatus.TO_PICKUP, TripStatus.PICKING_UP, TripStatus.IN_TRANSIT, TripStatus.PAUSED, TripStatus.DELIVERING};
const tripClosedStatuses = {TripStatus.COMPLETED, TripStatus.CANCELLED};

/// Nhãn nút hành động chính theo trạng thái (doc/4-DESIGN/03 §6).
String? tripPrimaryActionLabel(TripStatus s) {
  switch (s) {
    case TripStatus.SCHEDULED:
      return 'Bắt đầu đi lấy';
    case TripStatus.TO_PICKUP:
      return 'Đã đến điểm lấy';
    case TripStatus.PICKING_UP:
      return 'Bắt đầu vận chuyển';
    case TripStatus.IN_TRANSIT:
      return 'Đến điểm trả';
    case TripStatus.DELIVERING:
      return 'Hoàn thành chuyến';
    case TripStatus.PAUSED:
      return 'Tiếp tục chuyến';
    case TripStatus.COMPLETED:
    case TripStatus.CANCELLED:
      return null;
  }
}

/// Trạng thái kế tiếp theo luồng chuẩn (không tính PAUSED/CANCELLED).
TripStatus? tripNextStatus(TripStatus s) {
  switch (s) {
    case TripStatus.SCHEDULED:
      return TripStatus.TO_PICKUP;
    case TripStatus.TO_PICKUP:
      return TripStatus.PICKING_UP;
    case TripStatus.PICKING_UP:
      return TripStatus.IN_TRANSIT;
    case TripStatus.IN_TRANSIT:
      return TripStatus.DELIVERING;
    case TripStatus.DELIVERING:
      return TripStatus.COMPLETED;
    default:
      return null;
  }
}

// ---------- Stop ----------
enum StopStatus { NOT_ARRIVED, ARRIVED, COMPLETED, SKIPPED }

const stopStatusMeta = {
  StopStatus.NOT_ARRIVED: StatusMeta('Chưa đến', BtaTone.neutral),
  StopStatus.ARRIVED: StatusMeta('Đã đến', BtaTone.info),
  StopStatus.COMPLETED: StatusMeta('Hoàn thành', BtaTone.success),
  StopStatus.SKIPPED: StatusMeta('Bỏ qua', BtaTone.warning),
};
StopStatus? stopStatusFromApi(String? raw) => _parse(StopStatus.values, raw);

enum StopType { PICKUP, DROPOFF }

const stopTypeMeta = {
  StopType.PICKUP: StatusMeta('Điểm lấy', BtaTone.info),
  StopType.DROPOFF: StatusMeta('Điểm trả', BtaTone.primary),
};
StopType? stopTypeFromApi(String? raw) => _parse(StopType.values, raw);

// ---------- Finance ----------
enum PaymentInType { CUSTOMER_PAYMENT, DRIVER_COD_REMITTANCE, DRIVER_ADVANCE_RETURN, OTHER }

const paymentInTypeMeta = {
  PaymentInType.CUSTOMER_PAYMENT: StatusMeta('Khách trả', BtaTone.success),
  PaymentInType.DRIVER_COD_REMITTANCE: StatusMeta('Tài xế nộp COD', BtaTone.info),
  PaymentInType.DRIVER_ADVANCE_RETURN: StatusMeta('Tài xế hoàn tạm ứng', BtaTone.info),
  PaymentInType.OTHER: StatusMeta('Thu khác', BtaTone.neutral),
};
PaymentInType? paymentInTypeFromApi(String? raw) => _parse(PaymentInType.values, raw);

enum ExpenseKind { TRIP_COST, EXTERNAL_TRANSPORT, VEHICLE_SUPPLY, OTHER_COST, DRIVER_REIMBURSEMENT, SALARY_ADVANCE, TRIP_ADVANCE, SALARY_PAYMENT }

const expenseKindMeta = {
  ExpenseKind.TRIP_COST: StatusMeta('Chi phí chuyến', BtaTone.neutral),
  ExpenseKind.EXTERNAL_TRANSPORT: StatusMeta('Thuê xe ngoài', BtaTone.neutral),
  ExpenseKind.VEHICLE_SUPPLY: StatusMeta('Vật tư / sửa chữa xe', BtaTone.neutral),
  ExpenseKind.OTHER_COST: StatusMeta('Chi phí khác', BtaTone.neutral),
  ExpenseKind.DRIVER_REIMBURSEMENT: StatusMeta('Hoàn ứng tài xế', BtaTone.info),
  ExpenseKind.SALARY_ADVANCE: StatusMeta('Ứng lương', BtaTone.info),
  ExpenseKind.TRIP_ADVANCE: StatusMeta('Tạm ứng chuyến', BtaTone.info),
  ExpenseKind.SALARY_PAYMENT: StatusMeta('Chi trả lương', BtaTone.info),
};
ExpenseKind? expenseKindFromApi(String? raw) => _parse(ExpenseKind.values, raw);

// ---------- Incident ----------
enum IncidentSeverity { LOW, MEDIUM, HIGH, CRITICAL }

const incidentSeverityMeta = {
  IncidentSeverity.LOW: StatusMeta('Thấp', BtaTone.neutral),
  IncidentSeverity.MEDIUM: StatusMeta('Trung bình', BtaTone.warning),
  IncidentSeverity.HIGH: StatusMeta('Cao', BtaTone.danger),
  IncidentSeverity.CRITICAL: StatusMeta('Nghiêm trọng', BtaTone.danger),
};
IncidentSeverity? incidentSeverityFromApi(String? raw) => _parse(IncidentSeverity.values, raw);

enum IncidentStatus { OPEN, IN_PROGRESS, RESOLVED, CANCELLED }

const incidentStatusMeta = {
  IncidentStatus.OPEN: StatusMeta('Mới', BtaTone.danger),
  IncidentStatus.IN_PROGRESS: StatusMeta('Đang xử lý', BtaTone.warning),
  IncidentStatus.RESOLVED: StatusMeta('Đã xử lý', BtaTone.success),
  IncidentStatus.CANCELLED: StatusMeta('Đã hủy', BtaTone.neutral),
};
IncidentStatus? incidentStatusFromApi(String? raw) => _parse(IncidentStatus.values, raw);

// ---------- Notification ----------
enum NotificationType {
  TRIP_ASSIGNED,
  TRIP_CHANGED,
  ORDER_OVERDUE,
  CUSTOMER_OVER_LIMIT,
  COD_HELD_WARNING,
  PAYROLL_SUBMITTED,
  PAYROLL_APPROVED,
  PAYROLL_RETURNED,
  SCHEDULE_CONFLICT,
  INCIDENT_NEW,
  INCIDENT_ASSIGNED,
  BOOKING_NEW,
  BOOKING_UPDATED,
  ORDER_UPDATED,
  DEBT_STATEMENT_SENT,
  SYSTEM,
}

const notificationTypeMeta = {
  NotificationType.TRIP_ASSIGNED: StatusMeta('Chuyến mới', BtaTone.info),
  NotificationType.TRIP_CHANGED: StatusMeta('Chuyến thay đổi', BtaTone.warning),
  NotificationType.ORDER_OVERDUE: StatusMeta('Đơn quá hạn thanh toán', BtaTone.danger),
  NotificationType.CUSTOMER_OVER_LIMIT: StatusMeta('Khách vượt hạn mức', BtaTone.warning),
  NotificationType.COD_HELD_WARNING: StatusMeta('COD tài xế chưa nộp', BtaTone.warning),
  NotificationType.PAYROLL_SUBMITTED: StatusMeta('Bảng lương chờ duyệt', BtaTone.warning),
  NotificationType.PAYROLL_APPROVED: StatusMeta('Bảng lương đã duyệt', BtaTone.success),
  NotificationType.PAYROLL_RETURNED: StatusMeta('Bảng lương bị trả về', BtaTone.danger),
  NotificationType.SCHEDULE_CONFLICT: StatusMeta('Trùng lịch xe/tài xế', BtaTone.warning),
  NotificationType.INCIDENT_NEW: StatusMeta('Sự cố mới', BtaTone.danger),
  NotificationType.INCIDENT_ASSIGNED: StatusMeta('Sự cố được giao', BtaTone.warning),
  NotificationType.BOOKING_NEW: StatusMeta('Booking mới', BtaTone.info),
  NotificationType.BOOKING_UPDATED: StatusMeta('Booking cập nhật', BtaTone.info),
  NotificationType.ORDER_UPDATED: StatusMeta('Đơn hàng cập nhật', BtaTone.info),
  NotificationType.DEBT_STATEMENT_SENT: StatusMeta('Bảng kê mới', BtaTone.info),
  NotificationType.SYSTEM: StatusMeta('Hệ thống', BtaTone.neutral),
};
NotificationType? notificationTypeFromApi(String? raw) => _parse(NotificationType.values, raw);

// ---------- Driver account ----------
enum DriverAccountStatus { NONE, ACTIVE, MUST_CHANGE_PASSWORD, DISABLED }

const driverAccountStatusMeta = {
  DriverAccountStatus.NONE: StatusMeta('Chưa có tài khoản', BtaTone.neutral),
  DriverAccountStatus.ACTIVE: StatusMeta('Đang dùng app', BtaTone.success),
  DriverAccountStatus.MUST_CHANGE_PASSWORD: StatusMeta('Chờ đổi mật khẩu', BtaTone.warning),
  DriverAccountStatus.DISABLED: StatusMeta('Đã khóa', BtaTone.danger),
};
DriverAccountStatus? driverAccountStatusFromApi(String? raw) => _parse(DriverAccountStatus.values, raw);

// ---------- Sync (local) ----------
enum SyncState { ok, pending, offline }
