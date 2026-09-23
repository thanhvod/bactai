# WM-INC-01 — Chi tiết sự cố

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Điều phối |
| Route | `/dispatch/incidents/:incidentId` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1000 |
| Mockup | [../../mockups/WM-INC-01.html](../../mockups/WM-INC-01.html) · canvas artboard `WM-INC-01.dc.html` |

## Mục đích

Loại, mức độ, mô tả, ảnh, đơn/chuyến liên quan, người xử lý, trạng thái, timeline; cập nhật xử lý và đóng.

## Dữ liệu hiển thị

- `code`
- `type`
- `severity`
- `title`
- `description`
- `location`
- `attachments[]`
- `order`
- `trip`
- `driver`
- `vehicle`
- `assignee`
- `status`
- `activity[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Cập nhật xử lý | incident.manage |
| Gán người xử lý | incident.manage |
| Đóng sự cố | incident.manage — ghi chú bắt buộc |
| Upload ảnh | incident.manage |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến liên quan | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở đơn liên quan | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Đóng sự cố (nhập ghi chú) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Xem ảnh sự cố | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Mở tài xế | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Mở xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Mở Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Breadcrumb Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Breadcrumb Sự cố | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | nav |
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
| [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | Mở sự cố trên Web Merchant |
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Xem sự cố |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Thông báo sự cố → chi tiết sự cố |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở sự cố |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở sự cố |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Xem sự cố |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở sự cố |
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Xem sự cố |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở chi tiết sự cố |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Mở sự cố từ thẻ chuyến |
| [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | Mở chi tiết sự cố |
| [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | Tạo sự cố |
| [WM-RPT-05](../wm/WM-RPT-05.md) Hiệu suất tài xế | Mở sự cố |

## Components (design system)

`StatusBadge`, `Button`, `DescriptionList`, `AttachmentUploader`, `Select`, `FormField`, `Textarea`, `Timeline`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `incident(id)`
- `updateIncident(id, input)`
- `assignIncident(id, userId)`
- `closeIncident(id, note)`
- `createAttachment(input)`

## Trạng thái UI

- **closed**: Form cập nhật ẩn; hiện ghi chú đóng + người đóng
- **loading**: Skeleton
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Ảnh mở Attachment viewer (WM-SHELL-06).
- Sự cố mở hiển thị badge trên đơn/chuyến liên quan và Dashboard.
