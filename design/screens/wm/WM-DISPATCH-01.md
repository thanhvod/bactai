# WM-DISPATCH-01 — Bảng điều phối

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Điều phối |
| Route | `/dispatch` |
| Pattern | `board` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-DISPATCH-01.html](../../mockups/WM-DISPATCH-01.html) · canvas artboard `WM-DISPATCH-01.dc.html` |

## Mục đích

Theo dõi chuyến theo ngày/trạng thái, lọc tài xế/xe, mở chuyến, gán xe cho chuyến chưa gán; cảnh báo lịch nổi rõ nhưng không chặn.

## Dữ liệu hiển thị

- `code`
- `order.code`
- `routeSummary`
- `vehicle.plate`
- `driver.name`
- `plannedStartAt`
- `plannedEndAt`
- `status`
- `warnings[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo chuyến | trip.create |
| Gán xe | trip.assign |
| Kéo thẻ đổi trạng thái | trip.status.update |
| Mở chuyến | trip.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở cảnh báo lịch từ thẻ chuyến | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | action |
| Mở chuyến từ thẻ | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở đơn từ thẻ | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Gán xe/tài xế từ thẻ | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Mở sự cố từ thẻ chuyến | [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | `/dispatch/incidents/:incidentId` | action |
| Chuyển sang Lịch | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | action |
| Mở cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | action |
| Tạo chuyến | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Gán xe cho chuyến chưa gán | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Click KPI cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | action |
| Click KPI sự cố | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | action |
| Mở vị trí xe | [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | `/dispatch/map` | action |
| Mở lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | action |
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
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Mở bảng điều phối |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | KPI Chuyến đang chạy → bảng điều phối |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở bảng điều phối |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | KPI Chuyến đang chạy → bảng điều phối |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở bảng điều phối |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | KPI Chuyến đang chạy → bảng điều phối |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở bảng điều phối |
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Mở bảng điều phối |
| [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | Chuyển sang Danh sách |
| [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | Chuyển sang Bảng |
| [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | Mở bảng điều phối |
| [WM-SET-02](../wm/WM-SET-02.md) Cấu hình mã tự động | Mở danh sách Điều phối |

## Components (design system)

`TripCard`, `StatusBadge`, `Button`, `EmptyState`, `DispatchBoard`, `SegmentedControl`, `PageHeader`, `FilterBar`, `TextField`, `KpiCard`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `trips(filter: {dateFrom, dateTo, status, driverId, vehicleId}, first, after)`
- `dispatchSummary(date)`
- `updateTripStatus(id, status, reason?)`

## Trạng thái UI

- **loading**: Skeleton cột + 2 thẻ/cột
- **empty**: Cột trống 'Không có chuyến'
- **error**: Banner danger + Thử lại
- **polling**: Refetch 30 giây để nhận trạng thái từ app tài xế

## Ghi chú implement

- SegmentedControl Danh sách · Bảng · Lịch; Lịch → /dispatch/calendar (WM-DISPATCH-02). Danh sách = DataTable cùng filter.
- Filter lưu vào query string (?date=&driverId=&vehicleId=&status=&view=board).
