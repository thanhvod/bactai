# WM-DEBT-01 — Công nợ khách tổng hợp

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/customer-debt` |
| Pattern | `list` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×1060 |
| Mockup | [../../mockups/WM-DEBT-01.html](../../mockups/WM-DEBT-01.html) · canvas artboard `WM-DEBT-01.dc.html` |

## Mục đích

Phải thu theo khách: tổng phải thu, đã thu, còn nợ, quá hạn, số dư, hạn mức; quét cảnh báo, ghi thu, tạo bảng kê.

## Dữ liệu hiển thị

- `customer`
- `receivable`
- `paid(allocated)`
- `remaining`
- `overdueAmount`
- `maxOverdueDays`
- `creditBalance`
- `creditLimit`
- `openOrders`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Ghi nhận thanh toán | payment.create |
| Tạo bảng kê | debtStatement.create — admin/kế toán |
| Xuất Excel | finance.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở công nợ khách | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Ghi nhận thanh toán cho khách | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Tạo bảng kê cho khách | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | action |
| Mở tài chính đơn quá hạn | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Ghi thu đơn quá hạn | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Xuất công nợ khách | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Mở bảng kê công nợ | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | action |
| Tạo phiếu thu khách trả | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| KPI số dư → phiếu chưa phân bổ | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Mở báo cáo công nợ khách | [WM-RPT-06](../wm/WM-RPT-06.md) Công nợ khách | `/reports/customer-debt` | action |
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
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | KPI Công nợ quá hạn → công nợ khách |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Xem công nợ khách |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | KPI Công nợ quá hạn → công nợ khách |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Xem công nợ khách |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | KPI Công nợ quá hạn → công nợ khách |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Xem công nợ khách |
| [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | KPI Công nợ khách |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | KPI còn treo → công nợ khách |
| [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | Mở công nợ khách tổng hợp |
| [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | Click KPI Tổng còn nợ → công nợ khách |
| [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | Click KPI Quá hạn → công nợ khách |
| [WM-RPT-06](../wm/WM-RPT-06.md) Công nợ khách | KPI Quá hạn → công nợ khách tổng hợp |
| [WM-RPT-06](../wm/WM-RPT-06.md) Công nợ khách | Mở công nợ khách tổng hợp |
| [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | Mở công nợ khách |

## Components (design system)

`StatusBadge`, `IconButton`, `Button`, `DueIndicator`, `DataTable`, `PageHeader`, `Breadcrumb`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `customerDebt(filter: {asOf, overdueOnly, overLimit, hasCredit})`

## Trạng thái UI

- **loading**: Skeleton
- **empty**: EmptyState 'Không có khách còn nợ'
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Còn nợ = tổng đơn − tổng phân bổ; không trừ số dư (credit) tự động.
- Vượt hạn mức chỉ cảnh báo, không chặn tạo đơn.
- Click khách → WM-CUS-05 (tab công nợ).
