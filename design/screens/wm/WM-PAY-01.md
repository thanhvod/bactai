# WM-PAY-01 — Danh sách phiếu thu

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/payments` |
| Pattern | `list` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×900 |
| Mockup | [../../mockups/WM-PAY-01.html](../../mockups/WM-PAY-01.html) · canvas artboard `WM-PAY-01.dc.html` |

## Mục đích

Danh sách phiếu thu theo loại (khách trả / tài xế nộp COD / thu khác) với số đã phân bổ và còn treo.

## Dữ liệu hiển thị

- `code`
- `receivedAt`
- `type`
- `payer(customer|driver|text)`
- `method`
- `amount`
- `allocatedAmount`
- `unallocatedAmount`
- `status`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo phiếu thu | payment.create (operation ⚠️) |
| Phân bổ | payment.allocate — admin/kế toán |
| Xuất Excel | finance.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click mã phiếu → chi tiết | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Mở công nợ khách Vật liệu Xây dựng Phú Mỹ | WM-CUS-05 | | action |
| Mở sổ công nợ tài xế Trần Minh Lái | WM-DRV-05 | | action |
| Phân bổ phiếu thu | [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | `/finance/payments/:paymentId/allocate` | action |
| Mở công nợ khách Bao bì Hưng Lợi | WM-CUS-05 | | action |
| Mở công nợ khách Công ty Gạo Miền Tây | WM-CUS-05 | | action |
| Xuất danh sách phiếu thu | WM-SHELL-05 | | action |
| Tạo phiếu thu | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| KPI COD → COD tài xế đang giữ | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| KPI còn treo → công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Sổ thu chi | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | nav |
| Sidebar: Phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | nav |
| Sidebar: Công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | nav |
| Sidebar: Công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | nav |
| Sidebar: Bảng kê công nợ | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | nav |
| Sidebar: COD tài xế | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | nav |
| Sidebar: Tạm ứng chuyến | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | KPI tiền vào → danh sách phiếu thu |
| [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | Hủy tạo phiếu thu |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Mở danh sách phiếu thu |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | KPI đã nộp → phiếu thu |

## Components (design system)

`Menu`, `IconButton`, `Button`, `StatusBadge`, `PageHeader`, `Breadcrumb`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `payments(filter: {type, method, dateRange, hasUnallocated}, sort, first, after)`

## Trạng thái UI

- **loading**: Skeleton
- **empty**: EmptyState 'Chưa có phiếu thu' + Tạo phiếu thu
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Còn treo = amount − allocated (chỉ loại Khách trả) = số dư khách.
- Loại Tài xế nộp COD: cột phân bổ '—', trạng thái 'Đã đối trừ COD'.
- Chip 'Còn treo' = filter.hasUnallocated=true.
