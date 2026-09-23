# WM-DEBT-02 — Công nợ NCC

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/supplier-debt` |
| Pattern | `list` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×900 |
| Mockup | [../../mockups/WM-DEBT-02.html](../../mockups/WM-DEBT-02.html) · canvas artboard `WM-DEBT-02.dc.html` |

## Mục đích

Phải trả NCC = phiếu chi gắn NCC chưa trả, theo tuổi nợ; trả NCC bằng đánh dấu phiếu chi đã trả.

## Dữ liệu hiển thị

- `supplier`
- `unpaidTotal`
- `aging[0-15, 16-30, 31-60, >60]`
- `oldestDays`
- `unpaidCount`
- `expenses[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Trả NCC (đánh dấu phiếu chi đã trả) | expense.markPaid — admin/kế toán |
| Tạo phiếu chi | expense.create |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chi tiết NCC | WM-SUP-02 | | action |
| Trả NCC → đánh dấu phiếu chi đã trả | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở phiếu chi NCC | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở tài chính đơn | WM-ORD-07 | | action |
| Mở chi tiết xe | WM-VEH-02 | | action |
| Xuất công nợ NCC | WM-SHELL-05 | | action |
| Tạo phiếu chi NCC | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| KPI đã trả → phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | action |
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
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | KPI chưa trả → công nợ NCC |
| [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | KPI chưa trả NCC → công nợ NCC |

## Components (design system)

`Button`, `StatusBadge`, `DataTable`, `PageHeader`, `Breadcrumb`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `supplierDebt(filter: {asOf})`
- `expenses(filter: {supplierId, status: UNPAID})`

## Trạng thái UI

- **loading**: Skeleton
- **empty**: EmptyState 'Không còn công nợ NCC'
- **forbidden**: Operation xem hạn chế (⚠️)
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Khoản chi không gắn NCC không vào công nợ NCC.
- Tuổi nợ tính từ ngày chi.
