# WM-TRIP-02 — Tạo/sửa chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Điều phối |
| Route | `/orders/:orderId/trips/new · /trips/:tripId/edit` |
| Pattern | `form` |
| Roles | admin, operation |
| Kích thước mockup | 1440×1460 |
| Mockup | [../../mockups/WM-TRIP-02.html](../../mockups/WM-TRIP-02.html) · canvas artboard `WM-TRIP-02.dc.html` |

## Mục đích

Tạo chuyến từ đơn: chọn điểm dừng phụ trách (đơn nhiều xe), xe, tài xế, giờ dự kiến, thưởng tài xế; kiểm tra trùng/gần trùng lịch mềm.

## Dữ liệu hiển thị

- `orderId`
- `stopIds[]`
- `vehicleId`
- `driverId`
- `plannedStartAt`
- `plannedEndAt`
- `driverBonusAmount`
- `note`
- `warnings[{type, subject, conflictTripId, gapMinutes}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu chuyến | trip.create / trip.assign |
| Tiếp tục và ghi lý do | dispatch.override_warning → WM-DISPATCH-03 |
| Đổi xe/tài xế | trip.assign |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở đơn hàng | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở chuyến B | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Tiếp tục và ghi lý do → cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | action |
| Xem lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | action |
| Mở lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | action |
| Hủy → quay lại đơn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Lưu chuyến (không cảnh báo) → chi tiết chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Breadcrumb Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Breadcrumb DH-202609-0002 | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | nav |
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
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Tạo chuyến từ đơn |
| [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | Tạo chuyến từ đơn |
| [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | Tạo chuyến từ đơn |
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Tạo chuyến từ đơn |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | Tạo chuyến từ đơn |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Tạo chuyến từ đơn |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Tạo chuyến từ dashboard |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Gán xe/tài xế |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Tạo chuyến từ dashboard |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Gán xe/tài xế |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Tạo chuyến từ đơn |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Tạo chuyến từ đơn |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Tạo chuyến từ đơn |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Tạo chuyến từ dashboard |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Gán xe/tài xế |
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Gán xe/tài xế |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Đổi xe/tài xế |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Sửa chuyến / đổi xe, tài xế |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Sửa chuyến / đổi xe, tài xế |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Gán xe/tài xế từ thẻ |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Tạo chuyến |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Gán xe cho chuyến chưa gán |
| [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | Tạo chuyến |
| [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | Quay lại form chuyến |

## Components (design system)

`EntityPicker`, `FormField`, `TextField`, `Checkbox`, `StatusBadge`, `DataTable`, `Popover`, `Button`, `WarningPanel`, `MoneyInput`, `Textarea`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `order(id){stops, trips}`
- `vehicles(filter: {status: ACTIVE})`
- `drivers(filter: {status: ACTIVE})`
- `checkTripOverlap(input)`
- `createTrip(input)`
- `updateTrip(id, input, reason?)`

## Trạng thái UI

- **validation**: Thiếu xe/tài xế/giờ → lỗi inline danger; end < start → lỗi inline
- **warning**: Overlap/gần overlap → WarningPanel (không chặn); thiếu quyền override → nút Lưu khóa
- **checking**: Gọi checkTripOverlap debounce 400ms khi đổi xe/tài xế/giờ; spinner nhỏ cạnh WarningPanel
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Đơn 1 xe: mặc định gán tất cả điểm. Đơn nhiều xe: checkbox điểm; điểm đã gán chuyến khác hiện mã chuyến.
- Tài xế/xe ngừng hoạt động hiện disabled trong picker (DRV-A-003), không chọn được.
- Ngưỡng gần trùng lấy từ merchant settings (seed: 2 giờ).
- MoneyInput số nguyên VND cho thưởng tài xế.
