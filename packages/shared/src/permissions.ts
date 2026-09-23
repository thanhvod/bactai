/**
 * Ma trận quyền mặc định — doc/2-PRD/08-permission-matrix.md.
 * ALLOWED = role có quyền; GRANTABLE = ⚠️ chỉ khi admin cấp thêm; DENIED = không có (admin vẫn có thể đổi matrix merchant).
 * `reason` = thao tác nhạy cảm, bắt buộc nhập lý do + ghi audit (08 §10).
 */

export const MERCHANT_ROLES = ['ADMIN', 'OPERATION', 'ACCOUNTANT'] as const;
export type MerchantRole = (typeof MERCHANT_ROLES)[number];
export const MERCHANT_ROLE_LABEL: Record<MerchantRole, string> = {
  ADMIN: 'Giám đốc / Admin',
  OPERATION: 'Operation',
  ACCOUNTANT: 'Kế toán',
};

export type Grant = 'ALLOWED' | 'GRANTABLE' | 'DENIED';

export const PERMISSION_GROUPS = {
  SYSTEM: 'Hệ thống',
  MASTER: 'Dữ liệu nền',
  ORDER: 'Đơn & điều phối',
  FINANCE: 'Tài chính',
  PAYROLL: 'Lương',
  REPORT: 'Báo cáo',
} as const;
export type PermissionGroup = keyof typeof PERMISSION_GROUPS;

interface PermissionDef {
  label: string;
  group: PermissionGroup;
  reason?: boolean;
  /** [ADMIN, OPERATION, ACCOUNTANT] */
  grants: [Grant, Grant, Grant];
}

const A: Grant = 'ALLOWED';
const G: Grant = 'GRANTABLE';
const D: Grant = 'DENIED';

export const PERMISSIONS = {
  // Hệ thống
  'dashboard.view': { label: 'Xem dashboard', group: 'SYSTEM', grants: [A, A, A] },
  'settings.manage': { label: 'Quản lý hồ sơ & cài đặt nhà xe', group: 'SYSTEM', grants: [A, D, D] },
  'users.manage': { label: 'Quản lý nhân viên & phân quyền', group: 'SYSTEM', grants: [A, D, D] },
  'catalogs.manage': { label: 'Quản lý danh mục', group: 'SYSTEM', grants: [A, A, G] },
  'imports.run': { label: 'Import dữ liệu Excel', group: 'SYSTEM', grants: [A, A, G] },
  'attachments.delete': { label: 'Xóa chứng từ', group: 'SYSTEM', reason: true, grants: [A, G, G] },
  'audit.export': { label: 'Xuất nhật ký hoạt động', group: 'SYSTEM', grants: [A, D, D] },

  // Dữ liệu nền
  'customer.view': { label: 'Xem khách hàng', group: 'MASTER', grants: [A, A, A] },
  'customer.edit': { label: 'Tạo/sửa khách hàng', group: 'MASTER', grants: [A, A, A] },
  'customer.deactivate': { label: 'Ngừng hoạt động khách hàng', group: 'MASTER', reason: true, grants: [A, G, D] },
  'driver.view': { label: 'Xem tài xế', group: 'MASTER', grants: [A, A, A] },
  'driver.edit': { label: 'Tạo/sửa tài xế', group: 'MASTER', grants: [A, A, D] },
  'driver.salary.manage': { label: 'Quản lý lịch sử lương cố định', group: 'MASTER', grants: [A, G, D] },
  'driver.account.manage': { label: 'Tạo/đặt lại tài khoản app tài xế', group: 'MASTER', grants: [A, A, D] },
  'vehicle.view': { label: 'Xem xe', group: 'MASTER', grants: [A, A, A] },
  'vehicle.edit': { label: 'Tạo/sửa xe', group: 'MASTER', grants: [A, A, D] },
  'supplier.view': { label: 'Xem nhà cung cấp', group: 'MASTER', grants: [A, A, A] },
  'supplier.edit': { label: 'Tạo/sửa nhà cung cấp', group: 'MASTER', grants: [A, A, A] },
  'booking.manage': { label: 'Tiếp nhận booking khách', group: 'MASTER', grants: [A, A, D] },

  // Đơn & điều phối
  'order.view': { label: 'Xem đơn/chuyến', group: 'ORDER', grants: [A, A, A] },
  'order.create': { label: 'Tạo đơn', group: 'ORDER', grants: [A, A, G] },
  'order.update': { label: 'Sửa đơn (chưa xác nhận), điểm dừng, hàng, add-on', group: 'ORDER', grants: [A, A, G] },
  'order.price.update': { label: 'Sửa giá cước sau khi xác nhận', group: 'ORDER', reason: true, grants: [A, G, D] },
  'order.cancel': { label: 'Hủy đơn', group: 'ORDER', reason: true, grants: [A, G, D] },
  'order.completed.update': { label: 'Sửa đơn đã hoàn thành', group: 'ORDER', reason: true, grants: [A, G, D] },
  'status.reverse': { label: 'Đổi trạng thái ngược', group: 'ORDER', reason: true, grants: [A, G, D] },
  'trip.create': { label: 'Tạo chuyến', group: 'ORDER', grants: [A, A, D] },
  'trip.assign': { label: 'Gán xe/tài xế', group: 'ORDER', grants: [A, A, D] },
  'trip.status.update': { label: 'Cập nhật trạng thái chuyến/điểm trên web', group: 'ORDER', grants: [A, A, D] },
  'trip.cancel': { label: 'Hủy chuyến', group: 'ORDER', reason: true, grants: [A, G, D] },
  'dispatch.override_warning': { label: 'Bỏ qua cảnh báo trùng lịch', group: 'ORDER', reason: true, grants: [A, G, D] },
  'incident.manage': { label: 'Quản lý sự cố', group: 'ORDER', grants: [A, A, G] },
  'cod.update': { label: 'Sửa COD thực thu', group: 'ORDER', reason: true, grants: [A, G, D] },

  // Tài chính
  'finance.view': { label: 'Xem sổ thu chi', group: 'FINANCE', grants: [A, G, A] },
  'expense.create': { label: 'Tạo phiếu chi', group: 'FINANCE', grants: [A, A, A] },
  'expense.update': { label: 'Sửa/hủy phiếu chi', group: 'FINANCE', reason: true, grants: [A, G, A] },
  'expense.markPaid': { label: 'Đánh dấu phiếu chi đã trả', group: 'FINANCE', grants: [A, D, A] },
  'payment.create': { label: 'Tạo phiếu thu', group: 'FINANCE', grants: [A, G, A] },
  'payment.update': { label: 'Sửa/hủy phiếu thu', group: 'FINANCE', reason: true, grants: [A, D, A] },
  'payment.allocate': { label: 'Phân bổ phiếu thu', group: 'FINANCE', grants: [A, D, A] },
  'cod.remittance.record': { label: 'Ghi nhận tài xế nộp COD', group: 'FINANCE', grants: [A, D, A] },
  'debt.view': { label: 'Xem công nợ khách', group: 'FINANCE', grants: [A, A, A] },
  'supplierDebt.view': { label: 'Xem công nợ NCC', group: 'FINANCE', grants: [A, G, A] },
  'driverLedger.view': { label: 'Xem sổ công nợ tài xế/COD', group: 'FINANCE', grants: [A, A, A] },
  'debtStatement.create': { label: 'Tạo bảng kê công nợ', group: 'FINANCE', grants: [A, D, A] },
  'debtStatement.finalize': { label: 'Chốt/đánh dấu gửi bảng kê', group: 'FINANCE', grants: [A, D, A] },
  'debtStatement.cancel': { label: 'Hủy bảng kê', group: 'FINANCE', reason: true, grants: [A, D, A] },
  'tripAdvance.reconcile': { label: 'Đối soát tạm ứng chuyến', group: 'FINANCE', grants: [A, A, A] },

  // Lương
  'payroll.view': { label: 'Xem bảng lương', group: 'PAYROLL', grants: [A, A, A] },
  'payroll.generate': { label: 'Tạo bảng lương', group: 'PAYROLL', grants: [A, A, D] },
  'payroll.line.update': { label: 'Sửa dòng lương nháp (giảm trừ)', group: 'PAYROLL', reason: true, grants: [A, A, D] },
  'payroll.submit': { label: 'Gửi duyệt bảng lương', group: 'PAYROLL', grants: [A, A, D] },
  'payroll.approve': { label: 'Duyệt bảng lương', group: 'PAYROLL', grants: [A, D, D] },
  'payroll.return': { label: 'Trả về / hủy duyệt bảng lương', group: 'PAYROLL', reason: true, grants: [A, D, D] },
  'payroll.markPaid': { label: 'Đánh dấu đã chi trả lương', group: 'PAYROLL', grants: [A, D, A] },
  'payroll.export': { label: 'Xuất bảng lương/phiếu lương', group: 'PAYROLL', grants: [A, D, A] },

  // Báo cáo
  'report.view': { label: 'Xem báo cáo', group: 'REPORT', grants: [A, A, A] },
  'report.export': { label: 'Xuất báo cáo', group: 'REPORT', grants: [A, G, A] },
} as const satisfies Record<string, PermissionDef>;

export type Permission = keyof typeof PERMISSIONS;
export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[];

export const SENSITIVE_PERMISSIONS = PERMISSION_KEYS.filter(
  (k) => (PERMISSIONS[k] as PermissionDef).reason === true,
);

export function requiresReason(permission: Permission): boolean {
  return (PERMISSIONS[permission] as PermissionDef).reason === true;
}

export function defaultGrant(permission: Permission, role: MerchantRole): Grant {
  return PERMISSIONS[permission].grants[MERCHANT_ROLES.indexOf(role)];
}

/** Quyền mặc định của role (chỉ ALLOWED). */
export function defaultRolePermissions(role: MerchantRole): Permission[] {
  return PERMISSION_KEYS.filter((p) => defaultGrant(p, role) === 'ALLOWED');
}

/**
 * Tập quyền hiệu lực của một nhân viên.
 * roleOverrides: matrix merchant đã tùy chỉnh (permission -> Grant) cho role; extra: quyền admin cấp thêm cho cá nhân.
 */
export function effectivePermissions(
  role: MerchantRole,
  extra: readonly string[] = [],
  roleOverrides: Partial<Record<Permission, Grant>> = {},
): Permission[] {
  const set = new Set<Permission>();
  for (const p of PERMISSION_KEYS) {
    const g = roleOverrides[p] ?? defaultGrant(p, role);
    if (g === 'ALLOWED') set.add(p);
  }
  for (const p of extra) {
    if ((PERMISSIONS as Record<string, unknown>)[p]) set.add(p as Permission);
  }
  return [...set];
}

export const MIN_REASON_LENGTH = 5;
