/** Mã lỗi GraphQL `extensions.code` — doc/2-PRD/07 §11. */
export const ERROR_CODES = {
  UNAUTHENTICATED: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  TENANT_SCOPE_VIOLATION: 'Dữ liệu không thuộc nhà xe hiện tại',
  VALIDATION_ERROR: 'Dữ liệu nhập chưa hợp lệ',
  CONFLICT: 'Dữ liệu bị trùng hoặc xung đột',
  SENSITIVE_REASON_REQUIRED: 'Thao tác nhạy cảm cần nhập lý do',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  BUSINESS_RULE_VIOLATION: 'Thao tác vi phạm quy tắc nghiệp vụ',
  MERCHANT_REQUIRED: 'Cần chọn nhà xe để tiếp tục',
} as const;
export type ErrorCode = keyof typeof ERROR_CODES;
