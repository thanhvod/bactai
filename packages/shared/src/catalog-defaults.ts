// Giá trị danh mục seed mặc định khi tạo merchant mới (docs/07 nguyên tắc chung)
// Merchant tự thêm/sửa sau trong phần cài đặt.

export const CATALOG_DEFAULTS = {
  EXPENSE_CATEGORY: [
    "Cầu đường",
    "Bốc xếp",
    "Phí chành",
    "Bồi dưỡng",
    "Nhiên liệu",
    "Sửa chữa / vật tư",
    "Thuê xe ngoài",
    "Ứng lương tài xế",
    "Chi khác",
  ],
  INCOME_CATEGORY: ["Thu khác"],
  ADDON_SERVICE: [
    "Bốc xếp",
    "Nâng hạ",
    "Giao đêm",
    "Phí chờ / lưu ca",
    "Thêm điểm",
    "Đóng kiện",
  ],
  PAUSE_REASON: [
    "Giờ cấm tải",
    "Nghỉ đêm / nghỉ luật lái xe",
    "Chờ phà / chờ cầu",
    "Sự cố xe",
    "Kẹt xe",
    "Chờ bốc xếp",
  ],
  DEDUCTION_REASON: ["Nghỉ không phép", "Đền hàng hư hỏng", "Vi phạm", "Khác"],
  CARGO_TYPE: ["Nông sản", "Sắt thép", "Bao bì", "Hàng tiêu dùng", "Khác"],
} as const;

export type CatalogKind = keyof typeof CATALOG_DEFAULTS;
