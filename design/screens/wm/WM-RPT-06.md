# WM-RPT-06 — Công nợ khách

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Báo cáo |
| Route | `/reports/customer-debt` |
| Pattern | `report` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-RPT-06.html](../../mockups/WM-RPT-06.html) · canvas artboard `WM-RPT-06.dc.html` |

## Mục đích

Tuổi nợ theo khách (0–15 / 16–30 / 31–60 / >60 ngày), quá hạn, hạn mức, số dư có; tạo bảng kê.

## Dữ liệu hiển thị

- `customer`
- `creditLimit`
- `totalDebt`
- `aging{d0_15, d16_30, d31_60, d60p}`
- `overdue`
- `creditBalance`
- `warnings[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo bảng kê | debtStatement.create (admin, accountant) |
| Xuất Excel | report.export |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở công nợ khách | WM-CUS-05 | | action |
| Tạo bảng kê cho khách | WM-DEBT-03 | | action |
| KPI Quá hạn → công nợ khách tổng hợp | WM-DEBT-01 | | action |
| Mở công nợ khách tổng hợp | WM-DEBT-01 | | action |
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
| [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | Mở báo cáo Công nợ khách |

## Components (design system)

`StatusBadge`, `DataTable`, `KpiCard`, `Button`, `PageHeader`, `Breadcrumb`, `FilterBar`, `TextField`, `FilterChip`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `reportCustomerDebt(filter{dateRange, customerId, overdueOnly})`

## Trạng thái UI

- **loading**: Skeleton KPI + chart + bảng
- **empty**: EmptyState 'Không có dữ liệu trong khoảng thời gian đã chọn' + đổi khoảng thời gian
- **error**: Banner danger 'Không tải được báo cáo' + Thử lại

## Ghi chú implement

- Filter (date range, khách/xe/tài xế) lưu vào query string để chia sẻ link.
- Breadcrumb quay về /reports. Xuất Excel mở WM-SHELL-05 với cùng filter.
- Report query dùng chung công thức với màn nghiệp vụ (order finance, driver ledger) — không có công thức riêng.
- Tuổi nợ tính từ ngày hoàn thành đơn; quá hạn theo hạn thanh toán từng đơn.
- Chart: tối đa 4 series, màu chart-1..chart-4 theo thứ tự cố định; luôn có bảng dữ liệu đi kèm; tooltip hiển thị số tiền đầy đủ.
