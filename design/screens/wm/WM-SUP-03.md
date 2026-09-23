# WM-SUP-03 — Form NCC

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Nhà cung cấp |
| Route | `/suppliers/new · /suppliers/:supplierId/edit` |
| Pattern | `drawer` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1060 |
| Mockup | [../../mockups/WM-SUP-03.html](../../mockups/WM-SUP-03.html) · canvas artboard `WM-SUP-03.dc.html` |
| Overlay trên | [WM-SUP-01](./WM-SUP-01.md) (drawer/modal, không cần route riêng) |

## Mục đích

Tạo/sửa NCC: tên, loại, MST (không bắt buộc), liên hệ, tài khoản, ghi chú, trạng thái.

## Dữ liệu hiển thị

- `name`
- `type`
- `taxCode`
- `address`
- `bankName`
- `bankAccountNo`
- `paymentTerms`
- `contacts[{name, phone, title, email}]`
- `note`
- `active`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu NCC | supplier.create / supplier.update — ghi audit |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Hủy → danh sách NCC | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | action |
| Lưu → chi tiết NCC | [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | `/suppliers/:supplierId` | action |
| Đóng | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | action |
| Mở chi tiết NCC | [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | `/suppliers/:supplierId` | action |
| Xuất danh sách NCC | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Thêm NCC | [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | `/suppliers/new · /suppliers/:supplierId/edit` | action |
| Mở công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | action |
| Mở phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | action |
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
| [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | Thêm NCC |
| [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | Sửa NCC |
| [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | Thêm NCC |

## Components (design system)

`TextField`, `FormField`, `Select`, `Button`, `Textarea`, `Switch`, `Drawer`, `IconButton`, `StatusBadge`, `Menu`, `PageHeader`, `KpiCard`, `FilterBar`, `FilterChip`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `catalogItems(type: SUPPLIER_TYPE)`
- `createSupplier(input)`
- `updateSupplier(id, input)`
- `deactivateSupplier(id, reason)`

## Trạng thái UI

- **validation**: Thiếu tên/loại/SĐT liên hệ → lỗi inline
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- NCC ngừng giao dịch không chọn được trong phiếu chi mới, dữ liệu cũ giữ nguyên.
