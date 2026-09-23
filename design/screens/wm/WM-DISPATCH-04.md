# WM-DISPATCH-04 — Theo dõi vị trí

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Điều phối |
| Route | `/dispatch/map` |
| Pattern | `page` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1000 |
| Mockup | [../../mockups/WM-DISPATCH-04.html](../../mockups/WM-DISPATCH-04.html) · canvas artboard `WM-DISPATCH-04.dc.html` |

## Mục đích

Bản đồ + LocationList vị trí gần nhất của xe có chuyến đang chạy; mở chuyến/lịch sử GPS.

## Dữ liệu hiển thị

- `trip{code, status}`
- `vehicle.plate`
- `driver.name`
- `lat`
- `lng`
- `address`
- `capturedAt`
- `speed`
- `isStale`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở chuyến / lịch sử GPS | trip.view |
| Làm mới | trip.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến từ danh sách vị trí | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở tab GPS của chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở chuyến chưa chạy | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Mở bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | action |
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
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Mở bản đồ vị trí |
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Mở theo dõi vị trí |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở bản đồ vị trí xe |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Mở vị trí xe |

## Components (design system)

`MapView`, `LocationList`, `StatusBadge`, `Button`, `Banner`, `PageHeader`, `FilterBar`, `TextField`, `FilterChip`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `lastKnownLocations(filter: {status: RUNNING})`
- `tripLocations(tripId)`

## Trạng thái UI

- **no GPS**: 'Chưa có vị trí — app chỉ gửi GPS khi chuyến đang chạy'
- **stale**: Badge 'Mất tín hiệu' khi capturedAt > 15 phút
- **map error**: Fallback chỉ LocationList
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Polling 60 giây. Map SDK (Google Maps/Mapbox) quyết định ở tech; mockup dùng MapView placeholder.
