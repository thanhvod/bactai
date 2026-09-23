# WM-SUP-02 — Chi tiết NCC

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Nhà cung cấp |
| Route | `/suppliers/:supplierId` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1240 |
| Mockup | [../../mockups/WM-SUP-02.html](../../mockups/WM-SUP-02.html) · canvas artboard `WM-SUP-02.dc.html` |

## Mục đích

Hồ sơ, liên hệ, khoản chi, công nợ phải trả, thuê xe ngoài, chứng từ, timeline; tạo phiếu chi.

## Dữ liệu hiển thị

- `code`
- `name`
- `type`
- `taxCode`
- `address`
- `bankAccount`
- `paymentTerms`
- `contacts[]`
- `expenses[]`
- `payable{total, aging}`
- `externalTransports[]`
- `attachments[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo phiếu chi | expense.create → WM-EXP-03 (prefill supplierId) |
| Sửa | supplier.update → WM-SUP-03 |
| Ngừng giao dịch | supplier.deactivate — sensitive |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Sửa NCC | [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | `/suppliers/new · /suppliers/:supplierId/edit` | action |
| Tạo phiếu chi cho NCC | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Menu: Ngừng giao dịch (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở đơn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở danh sách phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | action |
| Mở đơn thuê xe ngoài | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | action |
| Mở Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Breadcrumb Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
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
| [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | Mở nhà cung cấp |
| [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | Mở chi tiết NCC |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Mở NCC |
| [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | Mở chi tiết NCC |
| [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | Lưu → chi tiết NCC |
| [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | Mở chi tiết NCC |

## Components (design system)

`EntityHeader`, `StatusBadge`, `Button`, `IconButton`, `SummaryStrip`, `DataTable`, `DescriptionList`, `Timeline`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `supplier(id)`
- `expenses(filter: {supplierId})`
- `supplierDebt(filter: {supplierId})`
- `externalTransports(filter: {supplierId})`
- `activityLogs(entityType: SUPPLIER, entityId)`

## Trạng thái UI

- **loading**: Skeleton
- **no expenses**: EmptyState 'Chưa có khoản chi' + Tạo phiếu chi
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Tabs dùng ?tab= (overview|expenses|payables|external|attachments|timeline).
- Chi phí thuê ngoài không phải doanh thu; trừ vào lãi/lỗ đơn.
