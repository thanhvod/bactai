# WM-DASH-02 — Dashboard vận hành

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Dashboard |
| Route | `/dashboard/operations` |
| Pattern | `dashboard` |
| Roles | admin, operation |
| Kích thước mockup | 1440×1140 |
| Mockup | [../../mockups/WM-DASH-02.html](../../mockups/WM-DASH-02.html) · canvas artboard `WM-DASH-02.dc.html` |

## Mục đích

Theo dõi điều phối bằng polling: chuyến theo trạng thái, xe/tài xế đang chạy, cảnh báo lịch, vị trí gần nhất.

## Dữ liệu hiển thị

- `tripCountsByStatus`
- `trips[]`
- `vehicles[]`
- `drivers[]`
- `warnings[]`
- `locations[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở chuyến | trip.view → WM-TRIP-01 |
| Mở bản đồ | → WM-DISPATCH-04 |
| Xử lý cảnh báo | → WM-DISPATCH-03 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở bản đồ vị trí | WM-DISPATCH-04 | | action |
| Mở bảng điều phối | WM-DISPATCH-01 | | action |
| Mở chuyến | WM-TRIP-01 | | action |
| Mở đơn của chuyến | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở lịch xe/tài xế | WM-DISPATCH-02 | | action |
| Mở chuyến cảnh báo | WM-TRIP-01 | | action |
| Mở cảnh báo lịch | WM-DISPATCH-03 | | action |
| Xem sự cố | WM-INC-01 | | action |
| Gán xe/tài xế | WM-TRIP-02 | | action |
| Mở theo dõi vị trí | WM-DISPATCH-04 | | action |
| Mở xe | WM-VEH-02 | | action |
| Mở chuyến hiện tại | WM-TRIP-01 | | action |
| Danh sách xe | WM-VEH-01 | | action |
| Mở tài xế | WM-DRV-02 | | action |
| Danh sách tài xế | WM-DRV-01 | | action |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Tổng quan | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Vận hành | [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | `/dashboard/operations` | nav |
| Sidebar: Tài chính | [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | `/dashboard/finance` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Chuyển sang 7 ngày |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở dashboard vận hành |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Chuyển sang 7 ngày |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở dashboard vận hành |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Chuyển sang 7 ngày |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở dashboard vận hành |

## Components (design system)

`StatusBadge`, `Button`, `PageHeader`, `SummaryStrip`, `DataTable`, `FilterBar`, `TextField`, `FilterChip`, `MapView`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `trips(filter: {dateRange, status})`
- `vehicles{status, currentTrip}`
- `drivers{status, currentTrip}`
- `scheduleWarnings`
- `lastKnownLocations`

## Trạng thái UI

- **polling**: Refetch 60 giây, badge thời điểm cập nhật
- **gps_stale**: Pin xám + 'GPS cũ > 30 phút'
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Kế toán có thể xem nếu có dispatch.view; ẩn khỏi sidebar nếu không.
