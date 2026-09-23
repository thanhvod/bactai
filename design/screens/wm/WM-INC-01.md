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
| Mở đơn liên quan | WM-ORD-02 | | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Đóng sự cố (nhập ghi chú) | WM-SHELL-08 | | action |
| Xem ảnh sự cố | WM-SHELL-06 | | action |
| Mở tài xế | WM-DRV-02 | | action |
| Mở xe | WM-VEH-02 | | action |
| Mở Timeline | WM-SHELL-07 | | action |
| Breadcrumb Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Breadcrumb Sự cố | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | nav |
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
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở chi tiết sự cố |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Mở sự cố từ thẻ chuyến |
| [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | Mở chi tiết sự cố |
| [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | Tạo sự cố |

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
