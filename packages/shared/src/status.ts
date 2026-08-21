// Nhãn tiếng Việt cho các trạng thái — nguồn: docs/02-nghiep-vu-don-hang.md mục 4
// Enum value phải khớp db/schema.prisma

export const ORDER_STATUS_LABEL = {
  DRAFT: "Nháp",
  PENDING_CONFIRM: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  ASSIGNED: "Đã xếp xe",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
} as const;

export const TRIP_STATUS_LABEL = {
  SCHEDULED: "Đã lên lịch",
  TO_PICKUP: "Đang đến điểm lấy",
  PICKING_UP: "Đang lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  PAUSED: "Tạm dừng",
  DELIVERING: "Đang trả hàng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
} as const;

export const STOP_STATUS_LABEL = {
  PENDING: "Chưa đến",
  ARRIVED: "Đã đến",
  COMPLETED: "Hoàn thành",
  SKIPPED: "Bỏ qua",
} as const;

export const USER_ROLE_LABEL = {
  ADMIN: "Giám đốc",
  OPERATION: "Điều hành",
  ACCOUNTANT: "Kế toán",
} as const;

export const PAYROLL_STATUS_LABEL = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PAID: "Đã trả",
} as const;

export const PAYMENT_IN_KIND_LABEL = {
  CUSTOMER_PAYMENT: "Khách hàng thanh toán",
  // Thu hồi phải thu từ tài xế — KHÔNG phải doanh thu (docs/04 mục 3.2)
  DRIVER_COD_REMIT: "Tài xế nộp tiền thu hộ",
  OTHER: "Thu khác",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_LABEL;
export type TripStatus = keyof typeof TRIP_STATUS_LABEL;
export type StopStatus = keyof typeof STOP_STATUS_LABEL;
export type UserRole = keyof typeof USER_ROLE_LABEL;
export type PayrollStatus = keyof typeof PAYROLL_STATUS_LABEL;
export type PaymentInKind = keyof typeof PAYMENT_IN_KIND_LABEL;
