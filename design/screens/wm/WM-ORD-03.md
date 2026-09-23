# WM-ORD-03 — Tạo/sửa đơn

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Đơn hàng |
| Route | `/orders/new · /orders/:orderId/edit` |
| Pattern | `form` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1320 |
| Mockup | [../../mockups/WM-ORD-03.html](../../mockups/WM-ORD-03.html) · canvas artboard `WM-ORD-03.dc.html` |

## Mục đích

Tạo đơn nhanh 1 xe (không wizard): khách → điểm lấy/trả → hàng → giá cước/add-on → hạn thanh toán.

## Dữ liệu hiển thị

- `customerId`
- `stops[{type, locationSnapshot, contact, codExpected, plannedAt}]`
- `cargoLines[]`
- `freightAmount`
- `addons[]`
- `dueDate`
- `status`
- `note`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu nháp | order.create |
| Lưu & tạo chuyến | order.create → WM-TRIP-02 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xem công nợ khách | WM-CUS-05 | | action |
| Mở sổ địa chỉ khách | WM-CUS-04 | | action |
| Hủy tạo đơn | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | action |
| Lưu đơn → chi tiết đơn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
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
| [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | Tạo đơn |
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Sửa đơn |
| [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | Sửa đơn |
| [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | Sửa đơn |
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Sửa đơn |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | Sửa đơn |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Sửa đơn |

## Components (design system)

`EntityPicker`, `FormField`, `TextField`, `WarningPanel`, `StatusBadge`, `MoneyInput`, `IconButton`, `Button`, `Select`, `DateField`, `RadioGroup`, `Textarea`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `customers`
- `customerLocations(customerId)`
- `catalogItems(type: ADDON|CARGO_TYPE)`
- `createOrder(input)`
- `updateOrder(id, input)`

## Trạng thái UI

- **validation**: Lỗi inline danger dưới field; khách vượt hạn mức = WarningPanel (không chặn)
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- react-hook-form + zod; MoneyInput số nguyên VND.
- Sửa giá đơn đã xác nhận → mở SensitiveActionModal (WM-ORD-08).
