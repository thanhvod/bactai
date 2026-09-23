# WM-DASH-03 — Dashboard tài chính

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Dashboard |
| Route | `/dashboard/finance` |
| Pattern | `dashboard` |
| Roles | admin, accountant |
| Kích thước mockup | 1440×1560 |
| Mockup | [../../mockups/WM-DASH-03.html](../../mockups/WM-DASH-03.html) · canvas artboard `WM-DASH-03.dc.html` |

## Mục đích

Tổng hợp cho giám đốc/kế toán: doanh thu tạm tính, chi phí, lãi/lỗ, công nợ khách, công nợ NCC, COD chưa nộp.

## Dữ liệu hiển thị

- `revenue`
- `cost`
- `profit`
- `customerDebt`
- `overdueDebt`
- `supplierDebt`
- `codHeld`
- `cashIn`
- `monthly[{month, revenue, cost, profit}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở báo cáo | report.view |
| Xuất báo cáo | report.export → WM-SHELL-05 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xuất báo cáo | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Mở báo cáo lãi/lỗ | [WM-RPT-02](../wm/WM-RPT-02.md) Doanh thu - chi phí - lãi/lỗ | `/reports/profit` | action |
| KPI Doanh thu → báo cáo | [WM-RPT-02](../wm/WM-RPT-02.md) Doanh thu - chi phí - lãi/lỗ | `/reports/profit` | action |
| KPI Chi phí → phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | action |
| KPI Lãi/lỗ → lãi/lỗ theo đơn | [WM-RPT-03](../wm/WM-RPT-03.md) Lãi/lỗ theo đơn | `/reports/profit?view=orders` | action |
| KPI Công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | action |
| KPI Công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | action |
| KPI COD chưa nộp | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Mở sổ thu chi | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | action |
| Mở báo cáo doanh thu - chi phí | [WM-RPT-02](../wm/WM-RPT-02.md) Doanh thu - chi phí - lãi/lỗ | `/reports/profit` | action |
| Mở lãi/lỗ theo đơn | [WM-RPT-03](../wm/WM-RPT-03.md) Lãi/lỗ theo đơn | `/reports/profit?view=orders` | action |
| Mở công nợ khách | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Mở báo cáo công nợ khách | [WM-RPT-06](../wm/WM-RPT-06.md) Công nợ khách | `/reports/customer-debt` | action |
| Mở nhà cung cấp | [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | `/suppliers/:supplierId` | action |
| Mở công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | action |
| Mở COD tài xế | [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | action |
| Mở báo cáo COD tài xế | [WM-RPT-07](../wm/WM-RPT-07.md) COD tài xế | `/reports/cod` | action |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Tổng quan | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Vận hành | [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | `/dashboard/operations` | nav |
| Sidebar: Tài chính | [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | `/dashboard/finance` | nav |
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
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Chuyển sang Tháng này |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Chuyển sang Tháng này |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Chuyển sang Tháng này |
| [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | Mở dashboard tài chính |

## Components (design system)

`SegmentedControl`, `Button`, `PageHeader`, `KpiCard`, `Banner`, `BarChart`, `DataTable`, `LineChart`, `StatusBadge`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `dashboardSummary(filter: {range, finance: true})`
- `reportProfit(filter: {groupBy: MONTH})`
- `reportCustomerDebt(filter)`
- `reportCodHeld(filter)`

## Trạng thái UI

- **loading**: Skeleton KPI + chart
- **no_data**: Chart rỗng + 'Chưa có dữ liệu trong kỳ'
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Doanh thu ≠ tiền đã thu; COD tài xế nộp không phải doanh thu.
- Mỗi chart có DataTable bên cạnh (accessibility, đối chiếu số).
- Dùng cùng công thức với WM-RPT-02/03 và tab Tài chính đơn.
- Operation chỉ xem nếu có finance.view (⚠️).
