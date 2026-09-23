# WM-ORD-02 — Chi tiết đơn hàng

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Đơn hàng |
| Route | `/orders/:orderId` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1140 |
| Mockup | [../../mockups/WM-ORD-02.html](../../mockups/WM-ORD-02.html) · canvas artboard `WM-ORD-02.dc.html` |

## Mục đích

Trung tâm xử lý một đơn: trạng thái, tiền, điểm dừng, chuyến, sự cố, chứng từ, timeline.

## Dữ liệu hiển thị

- `code`
- `status`
- `customer`
- `stops[]`
- `cargoLines[]`
- `addons[]`
- `trips[]`
- `financeSummary`
- `incidents[]`
- `attachments[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo chuyến | trip.create |
| Sửa | order.update |
| In phiếu | order.view |
| Hủy đơn | order.cancel — sensitive |
| Timeline | order.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở tài xế | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Quản lý điểm dừng | [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | `/orders/:orderId?tab=stops` | action |
| Mở bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | action |
| Mở Công ty Gạo Miền Tây | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Xem sự cố | [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | `/dispatch/incidents/:incidentId` | action |
| Mở Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| In/chia sẻ đơn | [WM-ORD-09](../wm/WM-ORD-09.md) In/chia sẻ đơn | `/orders/:orderId/print` | action |
| Sửa đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Tạo chuyến từ đơn | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Menu: Hủy đơn / sửa giá (sensitive) | [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | `(modal)` | action |
| Mở khách hàng | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tab Điểm dừng | [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | `/orders/:orderId?tab=stops` | action |
| Tab Hàng hóa | [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | `/orders/:orderId?tab=cargo` | action |
| Tab Tài chính | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Breadcrumb Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
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
| [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | Mở đơn trên Web Merchant |
| [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | Click mã đơn → chi tiết |
| [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | Lưu đơn → chi tiết đơn |
| [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | Tab Tổng quan |
| [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | Tab Tổng quan |
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Tab Tổng quan |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | Tab Tổng quan |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Xác nhận sửa giá |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Tab Tổng quan |
| [WM-ORD-09](../wm/WM-ORD-09.md) In/chia sẻ đơn | Quay lại chi tiết đơn |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Thông báo đơn mới → chi tiết đơn |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở đơn cần xử lý |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Xác nhận đơn |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở đơn quá hạn |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Kết quả đơn → chi tiết đơn |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở đơn cần xử lý |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Xác nhận đơn |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở đơn quá hạn |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Đóng |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Tab Tổng quan |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Tab Tổng quan |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Tab Tổng quan |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở đơn cần xử lý |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Xác nhận đơn |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở đơn quá hạn |
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Mở đơn của chuyến |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở đơn hàng |
| [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | Mở đơn hàng |
| [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | Hủy → quay lại đơn |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Mở đơn hàng |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Mở đơn từ thẻ |
| [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | Mở đơn |
| [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | Mở đơn liên quan |
| [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | Mở đơn nháp |
| [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | Mở đơn |
| [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | Mở đơn thuê xe ngoài |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Mở đơn |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Mở đơn còn nợ |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Mở đơn được phân bổ |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Mở chi tiết đơn |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Mở đơn |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Mở đơn |
| [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | Mở đơn hàng |
| [WM-RPT-03](../wm/WM-RPT-03.md) Lãi/lỗ theo đơn | Click mã đơn → chi tiết đơn |
| [WM-RPT-07](../wm/WM-RPT-07.md) COD tài xế | Mở đơn |

## Components (design system)

`StatusBadge`, `DataTable`, `DescriptionList`, `PartnerCard`, `Timeline`, `EntityHeader`, `Button`, `IconButton`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `order(id)`
- `activityLogs(entityType: ORDER, entityId)`

## Trạng thái UI

- **loading**: Skeleton header + tabs
- **error**: Không tìm thấy đơn / không có quyền → EmptyState + quay lại danh sách
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Tabs dùng ?tab= (overview|stops|cargo|trips|finance|incidents|attachments|timeline).
- Primary next action đổi theo trạng thái: Nháp→Xác nhận; Đã xác nhận→Tạo chuyến; Hoàn thành→Ghi nhận thanh toán.
