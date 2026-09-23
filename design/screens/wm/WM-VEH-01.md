# WM-VEH-01 — Danh sách xe

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Xe |
| Route | `/vehicles` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-VEH-01.html](../../mockups/WM-VEH-01.html) · canvas artboard `WM-VEH-01.dc.html` |

## Mục đích

Tìm/lọc xe, xem trạng thái, chuyến hiện tại, chi phí gần đây; tạo xe, import/export.

## Dữ liệu hiển thị

- `code`
- `plate`
- `type`
- `capacity`
- `status`
- `currentTrip{code}`
- `monthCost`
- `registrationExpiresAt`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Thêm xe | vehicle.create (Admin, Operation) |
| Import | vehicle.create → WM-SHELL-04 |
| Xuất Excel | vehicle.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến hiện tại | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở chi tiết xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Import xe từ Excel | WM-SHELL-04 | | action |
| Xuất danh sách xe | WM-SHELL-05 | | action |
| Thêm xe | [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | `/vehicles/new · /vehicles/:vehicleId/edit` | action |
| Mở phiếu chi xe | WM-EXP-01 | | action |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | nav |
| Sidebar: Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | Hủy → danh sách xe |
| [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | Đóng |

## Components (design system)

`StatusBadge`, `Menu`, `IconButton`, `Button`, `PageHeader`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `Checkbox`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `vehicles(filter: {search, status, type}, sort, first, after)`

## Trạng thái UI

- **loading**: DataTable skeleton
- **empty**: EmptyState 'Chưa có xe' + 'Thêm xe đầu tiên' / Import
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Accountant chỉ xem: ẩn Thêm xe/Import/Sửa.
- Chip 'Sắp hết đăng kiểm' = còn ≤ 30 ngày.
