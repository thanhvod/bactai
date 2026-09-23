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
| Mở dashboard tài chính | WM-DASH-03 | | action |
| Mở báo cáo Hiệu suất xe | [WM-RPT-04](../wm/WM-RPT-04.md) Hiệu suất xe | `/reports/vehicles` | action |
| Mở báo cáo Hiệu suất tài xế | [WM-RPT-05](../wm/WM-RPT-05.md) Hiệu suất tài xế | `/reports/drivers` | action |
| Mở báo cáo Doanh thu – chi phí – lãi/lỗ | [WM-RPT-02](../wm/WM-RPT-02.md) Doanh thu - chi phí - lãi/lỗ | `/reports/profit` | action |
| Mở báo cáo Lãi/lỗ theo đơn | [WM-RPT-03](../wm/WM-RPT-03.md) Lãi/lỗ theo đơn | `/reports/profit?view=orders` | action |
| Mở báo cáo Công nợ khách | [WM-RPT-06](../wm/WM-RPT-06.md) Công nợ khách | `/reports/customer-debt` | action |
| Mở báo cáo COD tài xế | [WM-RPT-07](../wm/WM-RPT-07.md) COD tài xế | `/reports/cod` | action |
| Mở báo cáo Báo cáo bảng lương | [WM-RPT-08](../wm/WM-RPT-08.md) Báo cáo bảng lương | `/reports/payroll` | action |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
| Sidebar: Báo cáo | [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | `/reports` | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.

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
