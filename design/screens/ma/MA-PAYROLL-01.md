# MA-PAYROLL-01 — Duyệt bảng lương

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Tài chính & lương |
| Route | `MerchantPayrollApprovalRoute` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-PAYROLL-01.html](../../mockups/MA-PAYROLL-01.html) · canvas artboard `MA-PAYROLL-01.dc.html` |

## Mục đích

Giám đốc xem bảng lương chờ duyệt (tổng tiền + thực lãnh từng tài xế) và duyệt / trả về.

## Dữ liệu hiển thị

- `code`
- `period`
- `status`
- `submittedBy`
- `submittedAt`
- `totals{salary, bonus, advance, deduction, net}`
- `lines[{driver, salary, bonus, advance, deduction, net}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Duyệt | payroll.approve — chỉ admin; ghi chú tuỳ chọn |
| Trả về | payroll.approve — lý do bắt buộc |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | back |
| Mở chi tiết bảng lương trên Web Merchant | WM-PAYROLL-02 | | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | KPI bảng lương → duyệt bảng lương |
| [MA-NOTI-01](../ma/MA-NOTI-01.md) Thông báo | Mở bảng lương chờ duyệt |
| [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | Mở bảng lương chờ duyệt |

## Components (design system)

`MobileHeader`, `StatusBadge`, `Button`, `PrimaryBottomAction`

## API (GraphQL)

- `payrolls(filter: {status: SUBMITTED})`
- `payroll(id){lines}`
- `approvePayroll(id, reason?)`
- `returnPayroll(id, reason)`

## Trạng thái UI

- **forbidden**: Không có payroll.approve → ẩn bottom bar, chỉ xem
- **empty**: Không có bảng lương chờ duyệt
- **done**: Sau duyệt: badge 'Đã duyệt' + toast, quay lại Tổng quan
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Bottom sheet 'Trả về bảng lương': textarea Lý do (bắt buộc, ≥ 5 ký tự) + nút danger 'Trả về'; bottom sheet 'Duyệt': tổng thực lãnh + ghi chú tuỳ chọn + nút 'Xác nhận duyệt'.
- Nếu có nhiều bảng lương chờ duyệt: hiển thị danh sách card trước, chạm để mở.
- Audit giống WM-PAYROLL-05.
