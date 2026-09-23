# WM-ORD-06 — Add-on & giá bán (drawer)

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Đơn hàng |
| Route | `/orders/:orderId?tab=finance (drawer)` |
| Pattern | `drawer` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1040 |
| Mockup | [../../mockups/WM-ORD-06.html](../../mockups/WM-ORD-06.html) · canvas artboard `WM-ORD-06.dc.html` |
| Overlay trên | [WM-ORD-07](./WM-ORD-07.md) (drawer/modal, không cần route riêng) |

## Mục đích

Sửa giá cước và dịch vụ thêm; đơn đã xác nhận phải qua lý do.

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu thay đổi giá | order.price.update — sensitive |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Đóng drawer | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Lưu → nhập lý do (sensitive) | [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | `(modal)` | action |
| Mở drawer giá cước/add-on | [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | `/orders/:orderId?tab=finance (drawer)` | action |
| Tạo phiếu thu | WM-PAY-03 | | action |
| Phân bổ từ phiếu có sẵn | WM-PAY-04 | | action |
| Mở phiếu chi | WM-EXP-02 | | action |
| Tạo phiếu chi gắn đơn | WM-EXP-03 | | action |
| Đóng | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| In/chia sẻ đơn | [WM-ORD-09](../wm/WM-ORD-09.md) In/chia sẻ đơn | `/orders/:orderId/print` | action |
| Sửa đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Tạo chuyến từ đơn | WM-TRIP-02 | | action |
| Menu: Hủy đơn / sửa giá (sensitive) | [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | `(modal)` | action |
| Mở khách hàng | WM-CUS-02 | | action |
| Tab Tổng quan | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Tab Điểm dừng | [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | `/orders/:orderId?tab=stops` | action |
| Tab Hàng hóa | [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | `/orders/:orderId?tab=cargo` | action |
| Breadcrumb Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
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
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Mở drawer giá cước/add-on |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | Mở drawer giá cước/add-on |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Mở drawer giá cước/add-on |

## Components (design system)

`Banner`, `MoneyInput`, `FormField`, `Select`, `IconButton`, `Button`, `DataTable`, `AuditDiff`, `EmptyState`, `StatusBadge`, `Drawer`, `EntityHeader`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `updateOrderPricing(id, input, reason)`

## Trạng thái UI

- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.
