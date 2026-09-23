# WM-CUS-04 — Sổ địa chỉ/liên hệ

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khách hàng |
| Route | `/customers/:customerId/locations (tab)` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1000 |
| Mockup | [../../mockups/WM-CUS-04.html](../../mockups/WM-CUS-04.html) · canvas artboard `WM-CUS-04.dc.html` |

## Mục đích

Kho/địa chỉ thường dùng của khách kèm người liên hệ, tọa độ, ghi chú; chọn nhanh ở form đơn (WM-ORD-03).

## Dữ liệu hiển thị

- `name`
- `usage[PICKUP|DROPOFF|DOCUMENTS]`
- `address`
- `province`
- `lat?`
- `lng?`
- `contacts[{name, role, phone}]`
- `note`
- `usedInOrders`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Thêm địa chỉ | customer.update → Drawer |
| Sửa địa chỉ (drawer) | customer.update |
| Xóa địa chỉ | customer.update — nếu đã dùng trong đơn: SensitiveActionModal, chỉ ẩn khỏi picker |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xóa địa chỉ (sensitive nếu đã dùng) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Sửa khách hàng | [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | `/customers/new · /customers/:customerId/edit` | action |
| Tạo phiếu thu cho khách | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Tạo đơn cho khách | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Menu: Ngừng hoạt động khách (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Tab Tổng quan | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tab Đơn hàng | [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | `/customers/:customerId?tab=orders` | action |
| Tab Công nợ | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Breadcrumb Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
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
| [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | Mở sổ địa chỉ khách |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Mở sổ địa chỉ/liên hệ |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Tab Địa chỉ/liên hệ |
| [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | Mở sổ địa chỉ/liên hệ |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Tab Địa chỉ/liên hệ |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Tab Địa chỉ/liên hệ |

## Components (design system)

`TextField`, `FormField`, `Checkbox`, `MapView`, `Button`, `IconButton`, `Textarea`, `StatusBadge`, `Menu`, `DataTable`, `Drawer`, `EntityHeader`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `customer(id){locations{contacts}}`
- `createCustomerLocation(customerId, input)`
- `updateCustomerLocation(id, input)`
- `deleteCustomerLocation(id)`

## Trạng thái UI

- **empty**: EmptyState 'Chưa có địa chỉ' + Thêm địa chỉ
- **validation**: Tên + địa chỉ bắt buộc; tọa độ không bắt buộc
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Drawer phải 520px; map picker không bắt buộc (kéo ghim cập nhật lat/lng).
- Đơn lưu snapshot địa chỉ/liên hệ: sửa sổ địa chỉ không đổi đơn cũ.
- WM-ORD-03 dùng customerLocations(customerId) cho picker 'Chọn từ sổ địa chỉ'.
