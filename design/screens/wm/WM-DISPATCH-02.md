# WM-DISPATCH-02 — Lịch xe/tài xế

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Điều phối |
| Route | `/dispatch/calendar` |
| Pattern | `board` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1000 |
| Mockup | [../../mockups/WM-DISPATCH-02.html](../../mockups/WM-DISPATCH-02.html) · canvas artboard `WM-DISPATCH-02.dc.html` |

## Mục đích

ScheduleView: dòng là xe hoặc tài xế, trục 00–24, khối là chuyến; trùng/gần trùng có viền cảnh báo; click khối mở chuyến.

## Dữ liệu hiển thị

- `resource{type, id, label, status}`
- `blocks[{tripId, code, start, end, status, warning}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Click khối → chi tiết chuyến | trip.view |
| Tạo chuyến | trip.create |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click block CX-202609-0001 | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Click block CX-202609-0002 | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Click block CX-202609-0003 | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Click block CX-202609-0007 | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở danh sách cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | action |
| Tạo chuyến | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Chuyển sang Danh sách | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | action |
| Chuyển sang Bảng | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | action |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | nav |
| Sidebar: Cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | nav |
| Sidebar: Vị trí xe | [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | `/dispatch/map` | nav |
| Sidebar: Sự cố | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | nav |
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
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Mở lịch xe/tài xế |
| [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | Xem lịch xe/tài xế |
| [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | Mở lịch xe/tài xế |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Chuyển sang Lịch |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Mở lịch xe/tài xế |
| [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | Mở lịch xe/tài xế |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Mở lịch xe |
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Click KPI → lịch xe/tài xế |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Mở lịch xe/tài xế |

## Components (design system)

`ScheduleView`, `WarningPanel`, `Button`, `PageHeader`, `SegmentedControl`, `FilterBar`, `TextField`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `vehicleSchedules(date)`
- `driverSchedules(date)`
- `checkTripOverlap(input)`

## Trạng thái UI

- **empty**: Dòng không có khối = rảnh
- **inactive**: Xe bảo dưỡng: khối gạch chéo; tài xế ngừng hoạt động: dòng mờ
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Phase 1 có thể thay bằng list nhóm theo xe/tài xế (BRD 05 §1).
- Vạch đỏ = thời điểm hiện tại.
