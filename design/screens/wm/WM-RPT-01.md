# WM-RPT-01 — Trung tâm báo cáo

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Báo cáo |
| Route | `/reports` |
| Pattern | `dashboard` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1060 |
| Mockup | [../../mockups/WM-RPT-01.html](../../mockups/WM-RPT-01.html) · canvas artboard `WM-RPT-01.dc.html` |

## Mục đích

Danh sách báo cáo theo nhóm Vận hành / Tài chính / Lương, kèm số tóm tắt theo khoảng thời gian.

## Dữ liệu hiển thị

- `group`
- `report`
- `headlineMetric`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở báo cáo | report.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở dashboard tài chính | [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | `/dashboard/finance` | action |
| Mở báo cáo Hiệu suất xe | [WM-RPT-04](../wm/WM-RPT-04.md) Hiệu suất xe | `/reports/vehicles` | action |
| Mở báo cáo Hiệu suất tài xế | [WM-RPT-05](../wm/WM-RPT-05.md) Hiệu suất tài xế | `/reports/drivers` | action |
| Mở báo cáo Doanh thu – chi phí – lãi/lỗ | [WM-RPT-02](../wm/WM-RPT-02.md) Doanh thu - chi phí - lãi/lỗ | `/reports/profit` | action |
| Mở báo cáo Lãi/lỗ theo đơn | [WM-RPT-03](../wm/WM-RPT-03.md) Lãi/lỗ theo đơn | `/reports/profit?view=orders` | action |
| Mở báo cáo Công nợ khách | [WM-RPT-06](../wm/WM-RPT-06.md) Công nợ khách | `/reports/customer-debt` | action |
| Mở báo cáo COD tài xế | [WM-RPT-07](../wm/WM-RPT-07.md) COD tài xế | `/reports/cod` | action |
| Mở báo cáo Báo cáo bảng lương | [WM-RPT-08](../wm/WM-RPT-08.md) Báo cáo bảng lương | `/reports/payroll` | action |
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
| [MA-RPT-01](../ma/MA-RPT-01.md) Báo cáo tóm tắt | Mở trung tâm báo cáo trên Web Merchant |

## Components (design system)

`ReportCard`, `Button`, `PageHeader`, `FilterBar`, `TextField`, `FilterChip`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `reportSummary(filter{dateRange})`

## Trạng thái UI

- **loading**: Skeleton KPI + chart + bảng
- **empty**: EmptyState 'Không có dữ liệu trong khoảng thời gian đã chọn' + đổi khoảng thời gian
- **error**: Banner danger 'Không tải được báo cáo' + Thử lại

## Ghi chú implement

- Thẻ báo cáo ẩn theo quyền (kế toán không thấy báo cáo lương nếu không được cấp).
