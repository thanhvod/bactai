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
| Xem sự cố | WM-INC-01 | | action |
| Mở chứng từ POD | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Mở phiếu chi | WM-EXP-02 | | action |
| Mở chuyến | WM-TRIP-01 | | action |
| Đóng timeline | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Đóng | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở drawer giá cước/add-on | [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | `/orders/:orderId?tab=finance (drawer)` | action |
| Tạo phiếu thu | WM-PAY-03 | | action |
| Phân bổ từ phiếu có sẵn | WM-PAY-04 | | action |
| Tạo phiếu chi gắn đơn | WM-EXP-03 | | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| In/chia sẻ đơn | [WM-ORD-09](../wm/WM-ORD-09.md) In/chia sẻ đơn | `/orders/:orderId/print` | action |
| Sửa đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Tạo chuyến từ đơn | WM-TRIP-02 | | action |
| Menu: Hủy đơn / sửa giá (sensitive) | [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | `(modal)` | action |
| Mở khách hàng | WM-CUS-02 | | action |
| Tab Tổng quan | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Tab Điểm dừng | [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | `/orders/:orderId?tab=stops` | action |
| Tab Hàng hóa | [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | `/orders/:orderId?tab=cargo` | action |
| Breadcrumb Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
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
