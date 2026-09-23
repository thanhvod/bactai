# WM-RPT-03 — Lãi/lỗ theo đơn

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Báo cáo |
| Route | `/reports/profit?view=orders` |
| Pattern | `report` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1000 |
| Mockup | [../../mockups/WM-RPT-03.html](../../mockups/WM-RPT-03.html) · canvas artboard `WM-RPT-03.dc.html` |

## Mục đích

Lãi/lỗ từng đơn: doanh thu, chi phí chuyến/đơn, thuê ngoài; mở chi tiết đơn.

## Dữ liệu hiển thị

- `orderCode`
- `customer`
- `route`
- `status`
- `revenue`
- `tripOrderCost`
- `outsourcedCost`
- `profit`
- `margin`
- `isProvisional`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xuất Excel | report.export |
| Mở đơn | order.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click mã đơn → chi tiết đơn | WM-ORD-02 | | action |
| Xuất Excel | WM-SHELL-05 | | action |
| Breadcrumb Báo cáo | [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | `/reports` | nav |
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

| Từ | Trigger |
|---|---|
| [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | Mở báo cáo Lãi/lỗ theo đơn |
| [WM-RPT-02](../wm/WM-RPT-02.md) Doanh thu - chi phí - lãi/lỗ | Lãi/lỗ theo đơn của khách |

## Components (design system)

`StatusBadge`, `SummaryStrip`, `Pagination`, `IconButton`, `Button`, `DataTable`, `PageHeader`, `Breadcrumb`, `FilterBar`, `TextField`, `FilterChip`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `reportProfit(filter{dateRange, groupBy: ORDER, customerId, status})`

## Trạng thái UI

- **loading**: Skeleton KPI + chart + bảng
- **empty**: EmptyState 'Không có dữ liệu trong khoảng thời gian đã chọn' + đổi khoảng thời gian
- **error**: Banner danger 'Không tải được báo cáo' + Thử lại

## Ghi chú implement

- Filter (date range, khách/xe/tài xế) lưu vào query string để chia sẻ link.
- Breadcrumb quay về /reports. Xuất Excel mở WM-SHELL-05 với cùng filter.
- Report query dùng chung công thức với màn nghiệp vụ (order finance, driver ledger) — không có công thức riêng.
- Số lãi/lỗ phải bằng tab Tài chính đơn (WM-ORD-07). Tạm ứng chuyến chỉ tính khi đã đối soát.
