# WM-DISPATCH-05 — Sự cố vận hành

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Điều phối |
| Route | `/dispatch/incidents` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-DISPATCH-05.html](../../mockups/WM-DISPATCH-05.html) · canvas artboard `WM-DISPATCH-05.dc.html` |

## Mục đích

Danh sách sự cố theo trạng thái/mức độ; tạo, gán người xử lý, đóng.

## Dữ liệu hiển thị

- `code`
- `type`
- `title`
- `severity`
- `order.code`
- `trip.code`
- `reportedBy`
- `reportedAt`
- `assignee`
- `status`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo sự cố | incident.manage |
| Gán người xử lý | incident.manage |
| Đóng sự cố | incident.manage — ghi chú bắt buộc; Accountant ⚠️ |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chi tiết sự cố | [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | `/dispatch/incidents/:incidentId` | action |
| Mở đơn | WM-ORD-02 | | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Xuất danh sách sự cố | WM-SHELL-05 | | action |
| Tạo sự cố | [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | `/dispatch/incidents/:incidentId` | action |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | nav |
| Sidebar: Cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | nav |
| Sidebar: Vị trí xe | [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | `/dispatch/map` | nav |
| Sidebar: Sự cố | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
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
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Báo sự cố mới |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Click KPI sự cố |

## Components (design system)

`StatusBadge`, `Menu`, `IconButton`, `Button`, `PageHeader`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `incidents(filter: {status, severity, type, assigneeId, dateFrom, dateTo}, first, after)`

## Trạng thái UI

- **empty**: EmptyState 'Chưa có sự cố'
- **loading**: DataTable skeleton
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Mã sự cố SC-YYYYMM-NNNN theo cấu hình mã tự động (WM-SET-02).
