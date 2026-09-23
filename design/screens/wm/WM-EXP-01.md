# WM-EXP-01 — Danh sách phiếu chi

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/expenses` |
| Pattern | `list` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×1060 |
| Mockup | [../../mockups/WM-EXP-01.html](../../mockups/WM-EXP-01.html) · canvas artboard `WM-EXP-01.dc.html` |

## Mục đích

Danh sách khoản chi: loại, đối tượng gắn (NCC/đơn/chuyến/xe/tài xế), ai chi, số tiền, đã trả/chưa trả.

## Dữ liệu hiển thị

- `code`
- `date`
- `category`
- `subCategory`
- `supplier`
- `order`
- `trip`
- `vehicle`
- `driver`
- `paidBy`
- `amount`
- `status`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo phiếu chi | expense.create |
| Xuất Excel | finance.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click mã phiếu → chi tiết | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Xuất danh sách phiếu chi | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Tạo phiếu chi | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| KPI chưa trả NCC → công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | action |
| KPI hoàn tài xế → PC-202609-0001 | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| KPI tạm ứng → đối soát | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Sidebar: Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | nav |
| Sidebar: Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
| Sidebar: Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Sổ thu chi | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | nav |
| Sidebar: Phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | nav |
| Sidebar: Công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | nav |
| Sidebar: Công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | nav |
| Sidebar: Bảng kê công nợ | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | nav |
| Sidebar: COD tài xế | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | nav |
| Sidebar: Tạm ứng chuyến | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | nav |
| Sidebar: Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
| Sidebar: Báo cáo | [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | `/reports` | nav |
| Sidebar: Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | KPI Chi phí → phiếu chi |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | KPI tiền ra → phiếu chi |
| [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | Hủy tạo phiếu chi |
| [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | KPI đã trả → phiếu chi |
| [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | Mở phiếu chi xe |
| [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | Mở phiếu chi xe |
| [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | Mở phiếu chi |
| [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | Mở danh sách phiếu chi |
| [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | Mở phiếu chi |
| [WM-SET-02](../wm/WM-SET-02.md) Cấu hình mã tự động | Mở danh sách Phiếu chi |

## Components (design system)

`StatusBadge`, `Menu`, `IconButton`, `Button`, `PageHeader`, `Breadcrumb`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `expenses(filter: {category, supplierId, status, payer, dateRange}, sort, first, after)`

## Trạng thái UI

- **loading**: Skeleton
- **empty**: EmptyState 'Chưa có phiếu chi' + Tạo phiếu chi
- **error**: Banner danger + Thử lại

## Ghi chú implement

- KPI chi phí ghi nhận không gồm tạm ứng chuyến (tạm ứng chỉ thành chi phí khi đối soát).
- Chip 'Hoàn tài xế' = paidBy=DRIVER & status=UNPAID; 'Có NCC' = supplierId != null.
