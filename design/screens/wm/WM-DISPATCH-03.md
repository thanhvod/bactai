# WM-DISPATCH-03 — Cảnh báo lịch

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Điều phối |
| Route | `/dispatch/conflicts` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1060 |
| Mockup | [../../mockups/WM-DISPATCH-03.html](../../mockups/WM-DISPATCH-03.html) · canvas artboard `WM-DISPATCH-03.dc.html` |

## Mục đích

Danh sách chuyến trùng/gần trùng theo xe và tài xế, khoảng cách thời gian; override có quyền + lý do, ghi audit; quay lại form chuyến.

## Dữ liệu hiển thị

- `type (OVERLAP|NEAR_OVERLAP)`
- `subject (VEHICLE|DRIVER)`
- `trip`
- `conflictTrip`
- `gapMinutes`
- `thresholdMinutes`
- `status`
- `overrideReason`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xác nhận override và lưu | dispatch.override_warning — lý do bắt buộc |
| Override từng dòng | WM-SHELL-08 |
| Quay lại sửa chuyến | → WM-TRIP-02 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến bị trùng | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Override cảnh báo (sensitive) | WM-SHELL-08 | | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Quay lại form chuyến | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Override có lý do → lưu chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | action |
| Mở cài đặt vận hành | WM-SET-01 | | action |
| Breadcrumb Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
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
| [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | Tiếp tục và ghi lý do → cảnh báo lịch |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Mở cảnh báo lịch từ thẻ chuyến |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Mở cảnh báo lịch |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Click KPI cảnh báo lịch |
| [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | Mở danh sách cảnh báo lịch |

## Components (design system)

`StatusBadge`, `Button`, `DescriptionList`, `Textarea`, `FormField`, `Checkbox`, `PageHeader`, `Breadcrumb`, `Banner`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `IconButton`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `checkTripOverlap(input)`
- `scheduleWarnings(filter)`
- `createTrip(input, overrideReason)`
- `updateTrip(id, input, reason)`

## Trạng thái UI

- **no permission**: Khối override hiển thị 'Bạn không có quyền override' và khóa nút lưu
- **empty**: EmptyState 'Không có cảnh báo lịch'
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Ngưỡng gần trùng = merchant setting (WM-SET-01), seed 2 giờ.
- Override ghi audit_log gồm danh sách cảnh báo tại thời điểm lưu.
