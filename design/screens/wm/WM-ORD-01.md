# WM-ORD-01 — Danh sách đơn hàng

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Đơn hàng |
| Route | `/orders` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-ORD-01.html](../../mockups/WM-ORD-01.html) · canvas artboard `WM-ORD-01.dc.html` |

## Mục đích

Tìm/lọc đơn, theo dõi trạng thái và tiền; điểm vào tạo đơn và chi tiết đơn.

## Dữ liệu hiển thị

- `code`
- `customer.name`
- `routeSummary`
- `status`
- `totalAmount`
- `paidAmount`
- `remainingAmount`
- `dueDate`
- `warnings[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo đơn | order.create |
| Xuất Excel | order.view |
| Bulk: in phiếu / xuất | order.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click mã đơn → chi tiết | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Xuất Excel | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Tạo đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
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
| [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | Hủy tạo đơn |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | KPI Đơn cần xử lý → đơn lọc sẵn |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Xem tất cả đơn |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | KPI Đơn cần xử lý → đơn lọc sẵn |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Xem tất cả đơn |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | KPI Đơn cần xử lý → đơn lọc sẵn |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Xem tất cả đơn |
| [WM-SET-02](../wm/WM-SET-02.md) Cấu hình mã tự động | Mở danh sách Đơn hàng |

## Components (design system)

`StatusBadge`, `Menu`, `IconButton`, `Button`, `PageHeader`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `Checkbox`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `orders(filter, sort, first, after)`

## Trạng thái UI

- **loading**: DataTable loading (skeleton rows)
- **empty**: EmptyState 'Chưa có đơn hàng' + nút 'Tạo đơn đầu tiên'
- **error**: Banner danger 'Không tải được danh sách đơn' + Thử lại

## Ghi chú implement

- Quick filter chips map sang filter.status/warning; filter nâng cao mở Drawer.
- Cột tiền căn phải, tabular-nums.
- Row click hoặc click mã → /orders/:orderId.
