# WM-CUS-01 — Danh sách khách hàng

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khách hàng |
| Route | `/customers` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-CUS-01.html](../../mockups/WM-CUS-01.html) · canvas artboard `WM-CUS-01.dc.html` |

## Mục đích

Tìm/lọc khách, theo dõi công nợ, số dư, hạn mức và cảnh báo; điểm vào tạo khách, import, tạo đơn nhanh.

## Dữ liệu hiển thị

- `code`
- `name`
- `phone`
- `taxCode`
- `debtSummary{remaining, overdue, overdueDays}`
- `creditBalance`
- `creditLimit`
- `limitUsagePct`
- `defaultDebtDays`
- `orderCount`
- `warnings[]`
- `isActive`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo khách hàng | customer.create (admin/operation/accountant) |
| Import | customer.create → WM-SHELL-04 |
| Xuất Excel | customer.view |
| Row menu: Tạo đơn | order.create → WM-ORD-03 prefill customerId |
| Row menu: Ghi nhận thanh toán | payment.create |
| Row menu: Ngừng hoạt động | customer.deactivate — sensitive nếu có đơn (admin; operation nếu được cấp) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click tên khách → chi tiết | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Xem chi tiết | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tạo đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Ghi nhận thanh toán | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Sửa | [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | `/customers/new · /customers/:customerId/edit` | action |
| Ngừng hoạt động | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Click KPI Tổng còn nợ → công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | action |
| Click KPI Quá hạn → công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | action |
| Import khách hàng từ Excel | [WM-SHELL-04](../wm/WM-SHELL-04.md) Import wizard | `(dialog) từ danh sách khách/xe/tài xế` | action |
| Xuất danh sách khách | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Tạo khách hàng | [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | `/customers/new · /customers/:customerId/edit` | action |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Sidebar: Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | nav |
| Sidebar: Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
| Sidebar: Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
| Sidebar: Báo cáo | [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | `/reports` | nav |
| Sidebar: Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-SHELL-04](../wm/WM-SHELL-04.md) Import wizard | Hủy import |
| [WM-SHELL-04](../wm/WM-SHELL-04.md) Import wizard | Xác nhận import 45 dòng → danh sách khách |
| [WM-SHELL-04](../wm/WM-SHELL-04.md) Import wizard | Đóng |

## Components (design system)

`StatusBadge`, `IconButton`, `Button`, `Menu`, `Popover`, `KpiCard`, `PageHeader`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `customers(filter, sort, first, after)`

## Trạng thái UI

- **loading**: DataTable skeleton rows
- **empty**: EmptyState 'Chưa có khách hàng' + Tạo khách hàng / Import từ Excel
- **error**: Banner danger 'Không tải được danh sách khách' + Thử lại
- **filtered-empty**: Không có khách khớp bộ lọc + Xóa bộ lọc

## Ghi chú implement

- Search theo tên/SĐT/MST/mã; chip lọc: còn nợ, quá hạn, vượt hạn mức, có số dư, ngừng hoạt động.
- Cột hạn mức: số hạn mức + thanh % đã dùng (≥80% warning, >100% danger). Vượt hạn mức chỉ cảnh báo, không chặn tạo đơn.
- Khách ngừng hoạt động hiển thị mờ, không chọn được khi tạo đơn mới.
- KPI Tổng còn nợ/Quá hạn mở WM-DEBT-01.
