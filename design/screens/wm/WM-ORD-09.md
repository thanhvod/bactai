# WM-ORD-09 — In/chia sẻ đơn

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Đơn hàng |
| Route | `/orders/:orderId/print` |
| Pattern | `page` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1040 |
| Mockup | [../../mockups/WM-ORD-09.html](../../mockups/WM-ORD-09.html) · canvas artboard `WM-ORD-09.dc.html` |

## Mục đích

Preview PDF: phiếu giao hàng, phiếu điều xe, bảng chi phí chuyến.

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại chi tiết đơn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Breadcrumb Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Breadcrumb DH-202609-0001 | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | nav |
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
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | In/chia sẻ đơn |
| [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | In/chia sẻ đơn |
| [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | In/chia sẻ đơn |
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | In/chia sẻ đơn |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | In/chia sẻ đơn |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | In/chia sẻ đơn |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | In/chia sẻ đơn |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | In/chia sẻ đơn |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | In/chia sẻ đơn |

## Components (design system)

`PrintSheet`, `Logo`, `DescriptionList`, `DataTable`, `RadioGroup`, `Select`, `FormField`, `Checkbox`, `Button`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `renderOrderDocument(orderId, template)`

## Trạng thái UI

- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.
