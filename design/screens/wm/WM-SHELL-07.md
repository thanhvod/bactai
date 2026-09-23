# WM-SHELL-07 — Timeline drawer

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khung chung |
| Route | `(drawer) ?timeline=1` |
| Pattern | `drawer` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1040 |
| Mockup | [../../mockups/WM-SHELL-07.html](../../mockups/WM-SHELL-07.html) · canvas artboard `WM-SHELL-07.dc.html` |
| Overlay trên | [WM-ORD-07](./WM-ORD-07.md) (drawer/modal, không cần route riêng) |

## Mục đích

Nhật ký activity/audit theo entity: ai làm gì, khi nào, trước/sau, lý do.

## Dữ liệu hiển thị

- `createdAt`
- `actor{name, source}`
- `action`
- `category`
- `reason?`
- `before`
- `after`
- `relatedEntity`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lọc loại sự kiện | view |
| Xuất nhật ký | admin |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xem sự cố | [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | `/dispatch/incidents/:incidentId` | action |
| Mở chứng từ POD | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Mở phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Đóng timeline | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Đóng | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở drawer giá cước/add-on | [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | `/orders/:orderId?tab=finance (drawer)` | action |
| Tạo phiếu thu | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Phân bổ từ phiếu có sẵn | [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | `/finance/payments/:paymentId/allocate` | action |
| Tạo phiếu chi gắn đơn | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| In/chia sẻ đơn | [WM-ORD-09](../wm/WM-ORD-09.md) In/chia sẻ đơn | `/orders/:orderId/print` | action |
| Sửa đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Tạo chuyến từ đơn | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Menu: Hủy đơn / sửa giá (sensitive) | [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | `(modal)` | action |
| Mở khách hàng | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tab Tổng quan | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Tab Điểm dừng | [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | `/orders/:orderId?tab=stops` | action |
| Tab Hàng hóa | [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | `/orders/:orderId?tab=cargo` | action |
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
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Mở Timeline |
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Mở Timeline drawer |
| [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | Mở Timeline drawer |
| [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | Mở Timeline drawer |
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Mở Timeline drawer |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | Mở Timeline drawer |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Mở Timeline drawer |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Mở Timeline drawer |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Mở Timeline drawer |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Mở Timeline drawer |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở Timeline |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở Timeline drawer |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Mở Timeline drawer |
| [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | Mở Timeline drawer |
| [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | Mở Timeline |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Mở Timeline drawer |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Mở Timeline |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Tab Timeline |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Mở Timeline drawer |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Mở Timeline |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Tab Timeline |
| [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | Mở Timeline drawer |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Mở Timeline drawer |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Mở Timeline |
| [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | Mở Timeline drawer |
| [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | Mở Timeline |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Mở Timeline |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Mở Timeline drawer |
| [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | Mở Timeline drawer |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Mở Timeline drawer |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Mở Timeline drawer |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Mở Timeline |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Mở Timeline drawer |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Mở Timeline drawer |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Mở Timeline drawer |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Mở Timeline drawer |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Mở Timeline drawer |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Tab Timeline |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Mở Timeline |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Mở Timeline drawer |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Tab Timeline |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Mở Timeline |
| [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | Mở Timeline hồ sơ nhà xe |
| [WM-USER-02](../wm/WM-USER-02.md) Chi tiết nhân viên | Mở Timeline nhân viên |
| [WM-USER-02](../wm/WM-USER-02.md) Chi tiết nhân viên | Mở Timeline đầy đủ |
| [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | Mở Timeline cài đặt |
| [WM-SET-02](../wm/WM-SET-02.md) Cấu hình mã tự động | Mở Timeline cấu hình mã |

## Components (design system)

`AuditDiff`, `Checkbox`, `Timeline`, `Button`, `Drawer`, `IconButton`, `DataTable`, `EmptyState`, `StatusBadge`, `EntityHeader`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `activityTimeline(entity: {type, id}, filter: {category}, includeChildren)`

## Trạng thái UI

- **empty**: EmptyState 'Chưa có hoạt động'
- **loading**: Skeleton 5 dòng
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Category: status, money, attachment, note, sensitive.
- Sensitive action luôn hiện lý do + AuditDiff trước/sau.
