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
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Sửa NCC | [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | `/suppliers/new · /suppliers/:supplierId/edit` | action |
| Tạo phiếu chi cho NCC | WM-EXP-03 | | action |
| Menu: Ngừng giao dịch (sensitive) | WM-SHELL-08 | | action |
| Mở phiếu chi | WM-EXP-02 | | action |
| Mở đơn | WM-ORD-02 | | action |
| Mở danh sách phiếu chi | WM-EXP-01 | | action |
| Mở đơn thuê xe ngoài | WM-ORD-02 | | action |
| Mở công nợ NCC | WM-DEBT-02 | | action |
| Mở Timeline | WM-SHELL-07 | | action |
| Breadcrumb Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | nav |
| Sidebar: Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
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
