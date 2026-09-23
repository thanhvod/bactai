# WM-VEH-02 — Chi tiết xe

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Xe |
| Route | `/vehicles/:vehicleId` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1180 |
| Mockup | [../../mockups/WM-VEH-02.html](../../mockups/WM-VEH-02.html) · canvas artboard `WM-VEH-02.dc.html` |

## Mục đích

Hồ sơ xe, lịch sử chạy, chi phí vật tư/nhiên liệu, chứng từ, timeline.

## Dữ liệu hiển thị

- `plate`
- `type`
- `capacity`
- `specs{brand, model, year, chassisNo, engineNo, fuelNorm}`
- `status`
- `currentTrip`
- `tripHistory[]`
- `expenses[]`
- `attachments[]`
- `registrationExpiresAt`
- `insuranceExpiresAt`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Sửa | vehicle.update → WM-VEH-03 |
| Thêm chi phí xe | expense.create → WM-EXP-03 |
| Ngừng sử dụng | vehicle.deactivate — sensitive, WM-SHELL-08 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến hiện tại | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở tài xế | WM-DRV-02 | | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Sửa xe | [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | `/vehicles/new · /vehicles/:vehicleId/edit` | action |
| Tạo phiếu chi gắn xe | WM-EXP-03 | | action |
| Menu: Ngừng sử dụng xe (sensitive) | WM-SHELL-08 | | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở lịch xe | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | action |
| Mở phiếu chi | WM-EXP-02 | | action |
| Mở NCC | [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | `/suppliers/:supplierId` | action |
| Thêm chi phí xe | WM-EXP-03 | | action |
| Xem chứng từ Dang-kiem-51C12345.pdf | WM-SHELL-06 | | action |
| Xem chứng từ Bao-hiem-TNDS-2026.pdf | WM-SHELL-06 | | action |
| Xem chứng từ Cavet-xe.jpg | WM-SHELL-06 | | action |
| Mở Timeline | WM-SHELL-07 | | action |
| Breadcrumb Xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | nav |
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
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở xe |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Mở xe |
| [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | Mở xe |
| [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | Mở xe |
| [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | Mở chi tiết xe |
| [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | Lưu → chi tiết xe |
| [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | Mở chi tiết xe |

## Components (design system)

`EntityHeader`, `StatusBadge`, `Button`, `IconButton`, `SummaryStrip`, `DescriptionList`, `DataTable`, `AttachmentList`, `Banner`, `Timeline`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `vehicle(id)`
- `trips(filter: {vehicleId}, first: 10)`
- `expenses(filter: {vehicleId, month})`
- `attachments(entityType: VEHICLE)`
- `activityLogs(entityType: VEHICLE, entityId)`

## Trạng thái UI

- **loading**: Skeleton header + tabs
- **error**: Không tìm thấy xe → EmptyState + quay lại danh sách
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Tabs dùng ?tab= (overview|trips|expenses|attachments|timeline).
- Lịch sử chạy/chi phí phase đầu có thể placeholder (MD-005).
