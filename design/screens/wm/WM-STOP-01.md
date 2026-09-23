# WM-STOP-01 — Chi tiết điểm dừng

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Điều phối |
| Route | `/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)` |
| Pattern | `drawer` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1280 |
| Mockup | [../../mockups/WM-STOP-01.html](../../mockups/WM-STOP-01.html) · canvas artboard `WM-STOP-01.dc.html` |
| Overlay trên | [WM-TRIP-01](./WM-TRIP-01.md) (drawer/modal, không cần route riêng) |

## Mục đích

Chi tiết một điểm lấy/trả: địa chỉ, liên hệ, trạng thái, COD dự kiến/thực thu, POD, giờ thực tế; sửa COD có lý do.

## Dữ liệu hiển thị

- `type`
- `sequence`
- `location{name, address}`
- `contact{name, phone}`
- `plannedAt`
- `actualArrivedAt`
- `actualCompletedAt`
- `codExpected`
- `codActual`
- `podAttachments[]`
- `status`
- `statusHistory[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đánh dấu đã đến / hoàn thành | trip.status.update |
| Bỏ qua điểm | trip.status.update — lý do bắt buộc |
| Sửa COD | cod.update — sensitive, WM-SHELL-08, audit before/after |
| Xem POD | trip.view → WM-SHELL-06 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xem ảnh POD điểm lấy | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Mở đơn hàng | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Sửa COD thực thu (sensitive, nhập lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở attachment viewer | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Bỏ qua điểm (nhập lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Đóng drawer | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Đóng | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| In phiếu điều xe | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Sửa chuyến / đổi xe, tài xế | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Menu: Hủy chuyến (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở khách hàng | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Mở xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Mở tài xế | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Tạm dừng chuyến (nhập lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Hủy chuyến (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở chi tiết điểm dừng | [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | `/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)` | action |
| Breadcrumb Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Breadcrumb Bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
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
| [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | Mở chi tiết điểm dừng |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Mở điểm dừng |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở chi tiết điểm dừng |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Mở chi tiết điểm dừng |
| [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | Mở điểm dừng |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Mở điểm dừng |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Mở điểm dừng |

## Components (design system)

`StatusBadge`, `DescriptionList`, `Button`, `SummaryStrip`, `Timeline`, `Drawer`, `IconButton`, `EntityHeader`, `Breadcrumb`, `Tabs`, `StatusStepper`, `Stepper`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `orderStop(id){attachments(category: POD), statusHistory}`
- `updateStopStatus(id, status, reason?)`
- `updateStopCodActual(id, amount, reason)`

## Trạng thái UI

- **empty POD**: Ô POD nét đứt 'Chờ tài xế chụp'
- **loading**: Skeleton trong drawer
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Mở dạng drawer từ WM-TRIP-01 / WM-ORD-04; mở trực tiếp URL thì render như page.
- Xóa/bỏ qua điểm đã có POD/COD cần action nhạy cảm.
