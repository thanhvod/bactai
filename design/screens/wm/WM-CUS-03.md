# WM-CUS-03 — Form khách hàng

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khách hàng |
| Route | `/customers/new · /customers/:customerId/edit` |
| Pattern | `form` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1260 |
| Mockup | [../../mockups/WM-CUS-03.html](../../mockups/WM-CUS-03.html) · canvas artboard `WM-CUS-03.dc.html` |

## Mục đích

Tạo/sửa khách: loại khách, pháp lý/xuất hóa đơn, liên hệ chính, hạn mức nợ, số ngày công nợ mặc định, trạng thái.

## Dữ liệu hiển thị

- `type(COMPANY|INDIVIDUAL)`
- `name`
- `code(auto)`
- `taxCode`
- `phone`
- `email`
- `group`
- `legalName`
- `billingAddress`
- `invoiceEmail`
- `primaryContact{name, role, phone, zalo}`
- `creditLimit?`
- `defaultDebtDays`
- `isActive`
- `note`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu khách hàng | customer.create | customer.update → WM-CUS-02 |
| Hủy | → WM-CUS-02 (sửa) / WM-CUS-01 (tạo) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở sổ địa chỉ/liên hệ | [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | `/customers/:customerId/locations (tab)` | action |
| Hủy → chi tiết khách | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Lưu → chi tiết khách | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Breadcrumb Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Breadcrumb Công ty Gạo Miền Tây | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Sidebar: Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
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
| [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | Sửa |
| [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | Tạo khách hàng |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Sửa khách hàng |
| [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | Sửa khách hàng |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Sửa khách hàng |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Sửa khách hàng |

## Components (design system)

`RadioGroup`, `FormField`, `TextField`, `Select`, `MoneyInput`, `Banner`, `Textarea`, `Button`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `createCustomer(input)`
- `updateCustomer(id, input)`
- `deactivateCustomer(id, reason)`

## Trạng thái UI

- **validation**: Tên, SĐT, số ngày công nợ bắt buộc; SĐT/MST trùng trong merchant → lỗi inline + link khách đã có
- **saving**: Nút Lưu loading, khóa form
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- react-hook-form + zod; MoneyInput số nguyên VND; hạn mức để trống = không giới hạn.
- Số ngày công nợ mặc định lấy từ cài đặt merchant (seed: 15) khi tạo mới.
- Chuyển sang Ngừng hoạt động khi khách đã có đơn → SensitiveActionModal (lý do bắt buộc).
- Tạo mới: tiêu đề 'Tạo khách hàng', breadcrumb Khách hàng › Tạo; lưu xong mở chi tiết.
