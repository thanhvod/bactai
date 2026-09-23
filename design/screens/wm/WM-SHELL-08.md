# WM-SHELL-08 — Sensitive action modal

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khung chung |
| Route | `(modal)` |
| Pattern | `dialog` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1040 |
| Mockup | [../../mockups/WM-SHELL-08.html](../../mockups/WM-SHELL-08.html) · canvas artboard `WM-SHELL-08.dc.html` |
| Overlay trên | [WM-ORD-07](./WM-ORD-07.md) (drawer/modal, không cần route riêng) |

## Mục đích

Khung dùng chung cho thao tác nhạy cảm: nội dung thay đổi, dữ liệu bị ảnh hưởng, cảnh báo, lý do bắt buộc.

## Dữ liệu hiển thị

- `action`
- `entity`
- `affected[]`
- `before/after`
- `requiredPermission`
- `reason`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xác nhận | permission riêng theo action + reason ≥ 5 ký tự |
| Quay lại | đóng modal, không đổi dữ liệu |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Xác nhận hủy phiếu | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Đóng | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở drawer giá cước/add-on | [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | `/orders/:orderId?tab=finance (drawer)` | action |
| Tạo phiếu thu | WM-PAY-03 | | action |
| Phân bổ từ phiếu có sẵn | WM-PAY-04 | | action |
| Mở phiếu chi | WM-EXP-02 | | action |
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
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Xóa chứng từ (sensitive) |

## Components (design system)

`DescriptionList`, `AuditDiff`, `SensitiveActionModal`, `Banner`, `Textarea`, `FormField`, `Button`, `Dialog`, `IconButton`, `DataTable`, `EmptyState`, `StatusBadge`, `EntityHeader`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `cancelExpense(id, reason)`
- `cancelTrip(id, reason)`
- `updatePayment(id, input, reason)`
- `deleteAttachment(id, reason)`

## Trạng thái UI

- **no_permission**: Nút xác nhận disabled + inline 'Bạn cần quyền … — liên hệ Admin'
- **validation**: Lý do trống → lỗi inline danger
- **error**: Banner danger trong modal, giữ lý do đã nhập
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Backend reject nếu thiếu reason; ghi audit_log {actor, action, reason, before, after}.
- Ví dụ trong mockup: hủy phiếu chi PC-202609-0001 trên tab Tài chính của DH-202609-0001.
