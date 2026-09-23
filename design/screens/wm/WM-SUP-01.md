# WM-SUP-01 — Danh sách NCC

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Nhà cung cấp |
| Route | `/suppliers` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-SUP-01.html](../../mockups/WM-SUP-01.html) · canvas artboard `WM-SUP-01.dc.html` |

## Mục đích

Tìm/lọc nhà cung cấp, xem loại, liên hệ, số khoản chi, công nợ phải trả; tạo NCC.

## Dữ liệu hiển thị

- `code`
- `name`
- `type`
- `contact`
- `expenseCount`
- `payableAmount`
- `status`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Thêm NCC | supplier.create (Admin, Operation, Accountant) |
| Xuất Excel | supplier.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chi tiết NCC | [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | `/suppliers/:supplierId` | action |
| Xuất danh sách NCC | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Thêm NCC | [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | `/suppliers/new · /suppliers/:supplierId/edit` | action |
| Mở công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | action |
| Mở phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | action |
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
| [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | Hủy → danh sách NCC |
| [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | Đóng |

## Components (design system)

`StatusBadge`, `Menu`, `IconButton`, `Button`, `PageHeader`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `suppliers(filter: {search, type, status, hasDebt}, sort, first, after)`

## Trạng thái UI

- **loading**: DataTable skeleton
- **empty**: EmptyState 'Chưa có nhà cung cấp' + 'Thêm NCC'
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Công nợ NCC = tổng phiếu chi gắn NCC chưa trả (FIN-005). Operation xem công nợ ⚠️ theo cấu hình.
