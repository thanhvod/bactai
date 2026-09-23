# WM-ORD-08 — Hủy/sửa nhạy cảm đơn

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Đơn hàng |
| Route | `(modal)` |
| Pattern | `dialog` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1040 |
| Mockup | [../../mockups/WM-ORD-08.html](../../mockups/WM-ORD-08.html) · canvas artboard `WM-ORD-08.dc.html` |
| Overlay trên | [WM-ORD-07](./WM-ORD-07.md) (drawer/modal, không cần route riêng) |

## Mục đích

SensitiveActionModal cho sửa giá sau xác nhận, hủy đơn, sửa đơn hoàn thành, đổi trạng thái ngược.

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xác nhận | order.price.update | order.cancel | order.completed.update |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Xác nhận sửa giá | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Đóng | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở drawer giá cước/add-on | [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | `/orders/:orderId?tab=finance (drawer)` | action |
| Tạo phiếu thu | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Phân bổ từ phiếu có sẵn | [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | `/finance/payments/:paymentId/allocate` | action |
| Mở phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
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
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Menu: Hủy đơn / sửa giá (sensitive) |
| [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | Menu: Hủy đơn / sửa giá (sensitive) |
| [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | Menu: Hủy đơn / sửa giá (sensitive) |
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Lưu → nhập lý do (sensitive) |
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Menu: Hủy đơn / sửa giá (sensitive) |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | Menu: Hủy đơn / sửa giá (sensitive) |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Menu: Hủy đơn / sửa giá (sensitive) |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Menu: Hủy đơn / sửa giá (sensitive) |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Menu: Hủy đơn / sửa giá (sensitive) |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Menu: Hủy đơn / sửa giá (sensitive) |

## Components (design system)

`AuditDiff`, `StatusBadge`, `DescriptionList`, `SensitiveActionModal`, `Banner`, `Textarea`, `FormField`, `Button`, `Dialog`, `IconButton`, `DataTable`, `EmptyState`, `EntityHeader`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `updateOrderPricing(reason)`
- `cancelOrder(id, reason)`
- `reverseOrderStatus(id, reason)`

## Trạng thái UI

- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Lý do bắt buộc (min 5 ký tự), ghi audit_log với before/after.
