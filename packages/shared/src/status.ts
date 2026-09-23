/**
 * Nguồn sự thật duy nhất cho mọi enum/trạng thái dùng chung giữa API, Web, Flutter.
 * Prisma enum trong packages/db phải khớp tên giá trị ở đây (test đồng bộ ở db).
 * Ref: doc/3-TECHNICAL/ARCHITECTURE.md §13, doc/1-BRD/02 §4.
 */

export type Tone = 'neutral' | 'info' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

export interface EnumMeta {
  label: string;
  tone: Tone;
}

function values<T extends Record<string, EnumMeta>>(meta: T) {
  return Object.keys(meta) as (keyof T & string)[];
}

// ---------- Order / Trip / Stop ----------

export const ORDER_STATUS = {
  DRAFT: { label: 'Nháp', tone: 'neutral' },
  PENDING_CONFIRMATION: { label: 'Chờ xác nhận', tone: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'info' },
  DISPATCHED: { label: 'Đã xếp xe', tone: 'primary' },
  IN_PROGRESS: { label: 'Đang thực hiện', tone: 'accent' },
  COMPLETED: { label: 'Hoàn thành', tone: 'success' },
  CANCELLED: { label: 'Đã hủy', tone: 'danger' },
} as const satisfies Record<string, EnumMeta>;
export type OrderStatus = keyof typeof ORDER_STATUS;
export const ORDER_STATUSES = values(ORDER_STATUS);
/** Thứ tự tiến trình để phát hiện "đổi trạng thái ngược". CANCELLED nằm ngoài chuỗi. */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'DRAFT',
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'DISPATCHED',
  'IN_PROGRESS',
  'COMPLETED',
];
/** Từ trạng thái này trở đi, sửa giá cước là thao tác nhạy cảm. */
export const ORDER_PRICE_LOCKED_FROM: OrderStatus = 'CONFIRMED';

export const TRIP_STATUS = {
  SCHEDULED: { label: 'Đã lên lịch', tone: 'neutral' },
  TO_PICKUP: { label: 'Đang đến điểm lấy', tone: 'info' },
  PICKING_UP: { label: 'Đang lấy hàng', tone: 'info' },
  IN_TRANSIT: { label: 'Đang vận chuyển', tone: 'accent' },
  PAUSED: { label: 'Tạm dừng', tone: 'warning' },
  DELIVERING: { label: 'Đang trả hàng', tone: 'primary' },
  COMPLETED: { label: 'Hoàn thành', tone: 'success' },
  CANCELLED: { label: 'Đã hủy', tone: 'danger' },
} as const satisfies Record<string, EnumMeta>;
export type TripStatus = keyof typeof TRIP_STATUS;
export const TRIP_STATUSES = values(TRIP_STATUS);
export const TRIP_STATUS_FLOW: TripStatus[] = [
  'SCHEDULED',
  'TO_PICKUP',
  'PICKING_UP',
  'IN_TRANSIT',
  'DELIVERING',
  'COMPLETED',
];
/** Trạng thái được coi là "đang chạy" — bật GPS, tính dashboard. */
export const TRIP_RUNNING_STATUSES: TripStatus[] = ['TO_PICKUP', 'PICKING_UP', 'IN_TRANSIT', 'PAUSED', 'DELIVERING'];
export const TRIP_CLOSED_STATUSES: TripStatus[] = ['COMPLETED', 'CANCELLED'];

export const STOP_STATUS = {
  NOT_ARRIVED: { label: 'Chưa đến', tone: 'neutral' },
  ARRIVED: { label: 'Đã đến', tone: 'info' },
  COMPLETED: { label: 'Hoàn thành', tone: 'success' },
  SKIPPED: { label: 'Bỏ qua', tone: 'warning' },
} as const satisfies Record<string, EnumMeta>;
export type StopStatus = keyof typeof STOP_STATUS;
export const STOP_STATUSES = values(STOP_STATUS);
export const STOP_STATUS_FLOW: StopStatus[] = ['NOT_ARRIVED', 'ARRIVED', 'COMPLETED'];

export const STOP_TYPE = {
  PICKUP: { label: 'Điểm lấy', tone: 'info' },
  DROPOFF: { label: 'Điểm trả', tone: 'primary' },
} as const satisfies Record<string, EnumMeta>;
export type StopType = keyof typeof STOP_TYPE;
export const STOP_TYPES = values(STOP_TYPE);

// ---------- Master data ----------

export const CUSTOMER_TYPE = {
  COMPANY: { label: 'Doanh nghiệp', tone: 'neutral' },
  INDIVIDUAL: { label: 'Cá nhân', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type CustomerType = keyof typeof CUSTOMER_TYPE;
export const CUSTOMER_TYPES = values(CUSTOMER_TYPE);

export const ACTIVE_STATUS = {
  ACTIVE: { label: 'Đang hoạt động', tone: 'success' },
  INACTIVE: { label: 'Ngừng hoạt động', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type ActiveStatus = keyof typeof ACTIVE_STATUS;
export const ACTIVE_STATUSES = values(ACTIVE_STATUS);

export const VEHICLE_STATUS = {
  ACTIVE: { label: 'Sẵn sàng', tone: 'success' },
  MAINTENANCE: { label: 'Bảo dưỡng', tone: 'warning' },
  INACTIVE: { label: 'Ngừng sử dụng', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type VehicleStatus = keyof typeof VEHICLE_STATUS;
export const VEHICLE_STATUSES = values(VEHICLE_STATUS);

export const LOCATION_USAGE = {
  PICKUP: { label: 'Điểm lấy', tone: 'info' },
  DROPOFF: { label: 'Điểm trả', tone: 'primary' },
  BOTH: { label: 'Lấy & trả', tone: 'neutral' },
  DOCUMENTS: { label: 'Nhận chứng từ', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type LocationUsage = keyof typeof LOCATION_USAGE;
export const LOCATION_USAGES = values(LOCATION_USAGE);

export const DRIVER_ACCOUNT_STATUS = {
  NONE: { label: 'Chưa có tài khoản', tone: 'neutral' },
  ACTIVE: { label: 'Đang dùng app', tone: 'success' },
  MUST_CHANGE_PASSWORD: { label: 'Chờ đổi mật khẩu', tone: 'warning' },
  DISABLED: { label: 'Đã khóa', tone: 'danger' },
} as const satisfies Record<string, EnumMeta>;
export type DriverAccountStatus = keyof typeof DRIVER_ACCOUNT_STATUS;
export const DRIVER_ACCOUNT_STATUSES = values(DRIVER_ACCOUNT_STATUS);

export const MEMBER_STATUS = {
  INVITED: { label: 'Chờ chấp nhận', tone: 'warning' },
  ACTIVE: { label: 'Đang hoạt động', tone: 'success' },
  LOCKED: { label: 'Đã khóa', tone: 'danger' },
} as const satisfies Record<string, EnumMeta>;
export type MemberStatus = keyof typeof MEMBER_STATUS;
export const MEMBER_STATUSES = values(MEMBER_STATUS);

// ---------- Finance ----------

export const PAYMENT_IN_TYPE = {
  CUSTOMER_PAYMENT: { label: 'Khách trả', tone: 'success' },
  DRIVER_COD_REMITTANCE: { label: 'Tài xế nộp COD', tone: 'info' },
  DRIVER_ADVANCE_RETURN: { label: 'Tài xế hoàn tạm ứng', tone: 'info' },
  OTHER: { label: 'Thu khác', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type PaymentInType = keyof typeof PAYMENT_IN_TYPE;
export const PAYMENT_IN_TYPES = values(PAYMENT_IN_TYPE);

export const PAYMENT_METHOD = {
  BANK_TRANSFER: { label: 'Chuyển khoản', tone: 'neutral' },
  CASH: { label: 'Tiền mặt', tone: 'neutral' },
  OTHER: { label: 'Khác', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type PaymentMethod = keyof typeof PAYMENT_METHOD;
export const PAYMENT_METHODS = values(PAYMENT_METHOD);

export const DOC_STATUS = {
  ACTIVE: { label: 'Hiệu lực', tone: 'success' },
  CANCELLED: { label: 'Đã hủy', tone: 'danger' },
} as const satisfies Record<string, EnumMeta>;
export type DocStatus = keyof typeof DOC_STATUS;
export const DOC_STATUSES = values(DOC_STATUS);

/**
 * Nhóm hệ thống của phiếu chi. Danh mục chi tiết (cầu đường, bốc xếp...) nằm ở catalog EXPENSE_CATEGORY.
 * `isCost` = tính vào chi phí lãi/lỗ. Các khoản dòng tiền với tài xế (hoàn ứng, ứng lương, tạm ứng) KHÔNG phải chi phí.
 */
export const EXPENSE_KIND = {
  TRIP_COST: { label: 'Chi phí chuyến', tone: 'neutral', isCost: true },
  EXTERNAL_TRANSPORT: { label: 'Thuê xe ngoài', tone: 'neutral', isCost: true },
  VEHICLE_SUPPLY: { label: 'Vật tư / sửa chữa xe', tone: 'neutral', isCost: true },
  OTHER_COST: { label: 'Chi phí khác', tone: 'neutral', isCost: true },
  DRIVER_REIMBURSEMENT: { label: 'Hoàn ứng tài xế', tone: 'info', isCost: false },
  SALARY_ADVANCE: { label: 'Ứng lương', tone: 'info', isCost: false },
  TRIP_ADVANCE: { label: 'Tạm ứng chuyến', tone: 'info', isCost: false },
  SALARY_PAYMENT: { label: 'Chi trả lương', tone: 'info', isCost: false },
} as const satisfies Record<string, EnumMeta & { isCost: boolean }>;
export type ExpenseKind = keyof typeof EXPENSE_KIND;
export const EXPENSE_KINDS = values(EXPENSE_KIND);
export const COST_EXPENSE_KINDS = EXPENSE_KINDS.filter((k) => EXPENSE_KIND[k].isCost);

export const EXPENSE_PAID_BY = {
  COMPANY: { label: 'Công ty chi', tone: 'neutral' },
  DRIVER: { label: 'Tài xế chi trước', tone: 'warning' },
  DRIVER_ADVANCE: { label: 'Chi từ tạm ứng chuyến', tone: 'info' },
} as const satisfies Record<string, EnumMeta>;
export type ExpensePaidBy = keyof typeof EXPENSE_PAID_BY;
export const EXPENSE_PAID_BYS = values(EXPENSE_PAID_BY);

export const PAID_STATUS = {
  UNPAID: { label: 'Chưa trả', tone: 'warning' },
  PAID: { label: 'Đã trả', tone: 'success' },
} as const satisfies Record<string, EnumMeta>;
export type PaidStatus = keyof typeof PAID_STATUS;
export const PAID_STATUSES = values(PAID_STATUS);

export const TRIP_ADVANCE_STATUS = {
  OPEN: { label: 'Chưa đối soát', tone: 'warning' },
  RECONCILED: { label: 'Đã đối soát', tone: 'success' },
} as const satisfies Record<string, EnumMeta>;
export type TripAdvanceStatus = keyof typeof TRIP_ADVANCE_STATUS;
export const TRIP_ADVANCE_STATUSES = values(TRIP_ADVANCE_STATUS);

export const DEBT_STATEMENT_STATUS = {
  DRAFT: { label: 'Nháp', tone: 'neutral' },
  FINALIZED: { label: 'Đã chốt', tone: 'primary' },
  SENT: { label: 'Đã gửi', tone: 'success' },
  CANCELLED: { label: 'Đã hủy', tone: 'danger' },
} as const satisfies Record<string, EnumMeta>;
export type DebtStatementStatus = keyof typeof DEBT_STATEMENT_STATUS;
export const DEBT_STATEMENT_STATUSES = values(DEBT_STATEMENT_STATUS);

// ---------- Payroll ----------

export const PAYROLL_STATUS = {
  DRAFT: { label: 'Nháp', tone: 'neutral' },
  SUBMITTED: { label: 'Chờ duyệt', tone: 'warning' },
  RETURNED: { label: 'Bị trả về', tone: 'danger' },
  APPROVED: { label: 'Đã duyệt', tone: 'primary' },
  PAID: { label: 'Đã chi trả', tone: 'success' },
  CANCELLED: { label: 'Đã hủy', tone: 'danger' },
} as const satisfies Record<string, EnumMeta>;
export type PayrollStatus = keyof typeof PAYROLL_STATUS;
export const PAYROLL_STATUSES = values(PAYROLL_STATUS);
/** Trạng thái còn được sửa dòng lương (D-012). */
export const PAYROLL_EDITABLE_STATUSES: PayrollStatus[] = ['DRAFT', 'RETURNED'];

export const PAYROLL_ITEM_TYPE = {
  BASE: { label: 'Lương cố định', tone: 'neutral', sign: 1 },
  BONUS: { label: 'Thưởng chuyến', tone: 'success', sign: 1 },
  ADVANCE: { label: 'Trừ ứng lương', tone: 'warning', sign: -1 },
  DEDUCTION: { label: 'Giảm trừ', tone: 'danger', sign: -1 },
  ADJUSTMENT: { label: 'Điều chỉnh kỳ trước', tone: 'info', sign: 1 },
} as const satisfies Record<string, EnumMeta & { sign: 1 | -1 }>;
export type PayrollItemType = keyof typeof PAYROLL_ITEM_TYPE;
export const PAYROLL_ITEM_TYPES = values(PAYROLL_ITEM_TYPE);

export const PAYROLL_PERIOD_TYPE = {
  MONTHLY: { label: 'Theo tháng dương lịch', tone: 'neutral' },
  CUSTOM: { label: 'Theo ngày bắt đầu tùy chọn', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type PayrollPeriodType = keyof typeof PAYROLL_PERIOD_TYPE;
export const PAYROLL_PERIOD_TYPES = values(PAYROLL_PERIOD_TYPE);

// ---------- Incident ----------

export const INCIDENT_SEVERITY = {
  LOW: { label: 'Thấp', tone: 'neutral' },
  MEDIUM: { label: 'Trung bình', tone: 'warning' },
  HIGH: { label: 'Cao', tone: 'danger' },
  CRITICAL: { label: 'Nghiêm trọng', tone: 'danger' },
} as const satisfies Record<string, EnumMeta>;
export type IncidentSeverity = keyof typeof INCIDENT_SEVERITY;
export const INCIDENT_SEVERITIES = values(INCIDENT_SEVERITY);

export const INCIDENT_STATUS = {
  OPEN: { label: 'Mới', tone: 'danger' },
  IN_PROGRESS: { label: 'Đang xử lý', tone: 'warning' },
  RESOLVED: { label: 'Đã xử lý', tone: 'success' },
  CANCELLED: { label: 'Đã hủy', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type IncidentStatus = keyof typeof INCIDENT_STATUS;
export const INCIDENT_STATUSES = values(INCIDENT_STATUS);

// ---------- Booking (phase 3) ----------

export const BOOKING_STATUS = {
  SUBMITTED: { label: 'Chờ tiếp nhận', tone: 'warning' },
  ACCEPTED: { label: 'Đã tiếp nhận', tone: 'info' },
  CONVERTED: { label: 'Đã tạo đơn', tone: 'success' },
  REJECTED: { label: 'Từ chối', tone: 'danger' },
  CANCELLED: { label: 'Đã hủy', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type BookingStatus = keyof typeof BOOKING_STATUS;
export const BOOKING_STATUSES = values(BOOKING_STATUS);

// ---------- Cross-cutting ----------

export const ACTOR_TYPES = ['USER', 'DRIVER', 'CUSTOMER', 'SYSTEM'] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

export const ENTITY_TYPE = {
  MERCHANT: 'Nhà xe',
  MERCHANT_USER: 'Nhân viên',
  CUSTOMER: 'Khách hàng',
  CUSTOMER_LOCATION: 'Địa chỉ khách',
  DRIVER: 'Tài xế',
  VEHICLE: 'Xe',
  SUPPLIER: 'Nhà cung cấp',
  CATALOG_ITEM: 'Danh mục',
  ORDER: 'Đơn hàng',
  ORDER_STOP: 'Điểm dừng',
  TRIP: 'Chuyến',
  EXPENSE: 'Phiếu chi',
  PAYMENT_IN: 'Phiếu thu',
  DEBT_STATEMENT: 'Bảng kê công nợ',
  PAYROLL: 'Bảng lương',
  PAYROLL_LINE: 'Dòng lương',
  INCIDENT: 'Sự cố',
  BOOKING: 'Booking',
  TRIP_ADVANCE: 'Tạm ứng chuyến',
  SETTINGS: 'Cài đặt',
} as const;
export type EntityType = keyof typeof ENTITY_TYPE;
export const ENTITY_TYPES = Object.keys(ENTITY_TYPE) as EntityType[];

export const ACTIVITY_CATEGORY = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  STATUS: 'Trạng thái',
  MONEY: 'Tiền',
  ATTACHMENT: 'Chứng từ',
  NOTE: 'Ghi chú',
  SENSITIVE: 'Thao tác nhạy cảm',
  ASSIGNMENT: 'Phân công',
} as const;
export type ActivityCategory = keyof typeof ACTIVITY_CATEGORY;
export const ACTIVITY_CATEGORIES = Object.keys(ACTIVITY_CATEGORY) as ActivityCategory[];

export const NOTIFICATION_TYPE = {
  TRIP_ASSIGNED: { label: 'Chuyến mới', tone: 'info' },
  TRIP_CHANGED: { label: 'Chuyến thay đổi', tone: 'warning' },
  ORDER_OVERDUE: { label: 'Đơn quá hạn thanh toán', tone: 'danger' },
  CUSTOMER_OVER_LIMIT: { label: 'Khách vượt hạn mức', tone: 'warning' },
  COD_HELD_WARNING: { label: 'COD tài xế chưa nộp', tone: 'warning' },
  PAYROLL_SUBMITTED: { label: 'Bảng lương chờ duyệt', tone: 'warning' },
  PAYROLL_APPROVED: { label: 'Bảng lương đã duyệt', tone: 'success' },
  PAYROLL_RETURNED: { label: 'Bảng lương bị trả về', tone: 'danger' },
  SCHEDULE_CONFLICT: { label: 'Trùng lịch xe/tài xế', tone: 'warning' },
  INCIDENT_NEW: { label: 'Sự cố mới', tone: 'danger' },
  INCIDENT_ASSIGNED: { label: 'Sự cố được giao', tone: 'warning' },
  BOOKING_NEW: { label: 'Booking mới', tone: 'info' },
  BOOKING_UPDATED: { label: 'Booking cập nhật', tone: 'info' },
  ORDER_UPDATED: { label: 'Đơn hàng cập nhật', tone: 'info' },
  DEBT_STATEMENT_SENT: { label: 'Bảng kê mới', tone: 'info' },
  SYSTEM: { label: 'Hệ thống', tone: 'neutral' },
} as const satisfies Record<string, EnumMeta>;
export type NotificationType = keyof typeof NOTIFICATION_TYPE;
export const NOTIFICATION_TYPES = values(NOTIFICATION_TYPE);

export const RECIPIENT_TYPES = ['USER', 'DRIVER', 'CUSTOMER'] as const;
export type RecipientType = (typeof RECIPIENT_TYPES)[number];

/** Loại mã chứng từ tự động (doc/1-BRD/09 §2.1). */
export const DOC_TYPE = {
  ORDER: { prefix: 'DH', label: 'Đơn hàng' },
  TRIP: { prefix: 'CX', label: 'Chuyến xe' },
  PAYMENT_IN: { prefix: 'PT', label: 'Phiếu thu' },
  EXPENSE: { prefix: 'PC', label: 'Phiếu chi' },
  PAYROLL: { prefix: 'BL', label: 'Bảng lương' },
  DEBT_STATEMENT: { prefix: 'CN', label: 'Bảng kê công nợ' },
  INCIDENT: { prefix: 'SC', label: 'Sự cố' },
  BOOKING: { prefix: 'BK', label: 'Booking' },
  CUSTOMER: { prefix: 'KH', label: 'Khách hàng' },
  DRIVER: { prefix: 'TX', label: 'Tài xế' },
  VEHICLE: { prefix: 'XE', label: 'Xe' },
  SUPPLIER: { prefix: 'NCC', label: 'Nhà cung cấp' },
} as const;
export type DocType = keyof typeof DOC_TYPE;
export const DOC_TYPES = Object.keys(DOC_TYPE) as DocType[];
export const RESET_PERIODS = ['MONTHLY', 'YEARLY', 'NEVER'] as const;
export type ResetPeriod = (typeof RESET_PERIODS)[number];

/** Danh mục merchant tự định nghĩa (doc/1-BRD/07). */
export const CATALOG_TYPE = {
  EXPENSE_CATEGORY: 'Loại chi phí',
  ADDON_SERVICE: 'Dịch vụ cộng thêm',
  CARGO_TYPE: 'Loại hàng',
  PACKAGING_UNIT: 'Đơn vị đóng gói',
  PAUSE_REASON: 'Lý do tạm dừng',
  DEDUCTION_REASON: 'Lý do giảm trừ lương',
  DOCUMENT_TYPE: 'Loại chứng từ',
  INCIDENT_TYPE: 'Loại sự cố',
  VEHICLE_TYPE: 'Loại xe',
  SUPPLIER_TYPE: 'Loại nhà cung cấp',
  CUSTOMER_GROUP: 'Nhóm khách hàng',
} as const;
export type CatalogType = keyof typeof CATALOG_TYPE;
export const CATALOG_TYPES = Object.keys(CATALOG_TYPE) as CatalogType[];

export const CARGO_PROPERTY = {
  FRAGILE: 'Dễ vỡ',
  COLD: 'Hàng lạnh',
  OVERSIZE: 'Quá khổ/quá tải',
  HAZARDOUS: 'Hóa chất/nguy hiểm',
} as const;
export type CargoProperty = keyof typeof CARGO_PROPERTY;
export const CARGO_PROPERTIES = Object.keys(CARGO_PROPERTY) as CargoProperty[];

/** Mã hệ thống của loại chứng từ (DOCUMENT_TYPE catalog seed dùng cùng code). */
export const ATTACHMENT_CATEGORY = {
  POD: 'POD',
  WAREHOUSE_SLIP: 'Phiếu xuất kho',
  INVOICE: 'Hóa đơn',
  LOADING_RECEIPT: 'Biên nhận bốc xếp',
  EXPENSE_RECEIPT: 'Chứng từ chi phí',
  INCIDENT_PHOTO: 'Ảnh sự cố',
  CONTRACT: 'Hợp đồng/thỏa thuận',
  PAYMENT_PROOF: 'Chứng từ thanh toán',
  DEBT_STATEMENT_PDF: 'PDF bảng kê công nợ',
  PRINT_DOCUMENT: 'Mẫu in',
  LICENSE: 'Giấy phép/bằng lái',
  LOGO: 'Logo',
  OTHER: 'Khác',
} as const;
export type AttachmentCategory = keyof typeof ATTACHMENT_CATEGORY;
export const ATTACHMENT_CATEGORIES = Object.keys(ATTACHMENT_CATEGORY) as AttachmentCategory[];

export const SCHEDULE_WARNING_TYPE = {
  OVERLAP: 'Trùng lịch',
  NEAR_OVERLAP: 'Gần trùng lịch',
} as const;
export type ScheduleWarningType = keyof typeof SCHEDULE_WARNING_TYPE;

export const IMPORT_ENTITY_TYPES = ['CUSTOMER', 'VEHICLE', 'DRIVER'] as const;
export type ImportEntityType = (typeof IMPORT_ENTITY_TYPES)[number];

export function labelOf<T extends Record<string, EnumMeta>>(meta: T, key: string | null | undefined): string {
  if (!key) return '';
  return (meta as Record<string, EnumMeta>)[key]?.label ?? key;
}

export function toneOf<T extends Record<string, EnumMeta>>(meta: T, key: string | null | undefined): Tone {
  if (!key) return 'neutral';
  return (meta as Record<string, EnumMeta>)[key]?.tone ?? 'neutral';
}

export function isReverseTransition<S extends string>(flow: readonly S[], from: S, to: S): boolean {
  const i = flow.indexOf(from);
  const j = flow.indexOf(to);
  return i >= 0 && j >= 0 && j < i;
}
