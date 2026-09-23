# WM-RPT-07 — COD tài xế

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Báo cáo |
| Route | `/reports/cod` |
| Pattern | `report` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1100 |
| Mockup | [../../mockups/WM-RPT-07.html](../../mockups/WM-RPT-07.html) · canvas artboard `WM-RPT-07.dc.html` |

## Mục đích

COD đã thu, đã nộp, đang giữ theo tài xế/đơn/tuổi giữ; tạo phiếu thu COD.

## Dữ liệu hiển thị

- `driver`
- `codCollected`
- `codRemitted`
- `codHeld`
- `heldDays`
- `orders[]`
- `remittancePayments[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo phiếu thu COD | payment.create (admin, accountant) — loại Tài xế nộp COD |
| Xuất Excel | report.export |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở COD tài xế đang giữ | [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | action |
| Tạo phiếu thu COD | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Mở đơn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở phiếu thu COD | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| KPI Đang giữ → COD tài xế đang giữ | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Mở COD tài xế đang giữ | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Xuất Excel | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Breadcrumb Báo cáo | [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | `/reports` | nav |
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
| [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | Mở báo cáo COD tài xế |
| [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | Mở báo cáo COD tài xế |

## Components (design system)

`StatusBadge`, `Button`, `DataTable`, `Banner`, `KpiCard`, `PageHeader`, `Breadcrumb`, `FilterBar`, `TextField`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `reportCodHeld(filter{dateRange, driverId})`

## Trạng thái UI

- **loading**: Skeleton KPI + chart + bảng
- **empty**: EmptyState 'Không có dữ liệu trong khoảng thời gian đã chọn' + đổi khoảng thời gian
- **error**: Banner danger 'Không tải được báo cáo' + Thử lại

## Ghi chú implement

- Filter (date range, khách/xe/tài xế) lưu vào query string để chia sẻ link.
- Breadcrumb quay về /reports. Xuất Excel mở WM-SHELL-05 với cùng filter.
- Report query dùng chung công thức với màn nghiệp vụ (order finance, driver ledger) — không có công thức riêng.
- Số đang giữ phải bằng sổ công nợ tài xế. Phiếu thu COD không phải doanh thu.
