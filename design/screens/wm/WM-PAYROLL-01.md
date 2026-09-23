# WM-PAYROLL-01 — Danh sách bảng lương

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Lương |
| Route | `/payroll` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-PAYROLL-01.html](../../mockups/WM-PAYROLL-01.html) · canvas artboard `WM-PAYROLL-01.dc.html` |

## Mục đích

Danh sách bảng lương theo kỳ và trạng thái; điểm vào tạo bảng lương và duyệt.

## Dữ liệu hiển thị

- `code`
- `period{from, to, label}`
- `status (DRAFT|SUBMITTED|APPROVED|PAID|RETURNED)`
- `driverCount`
- `totalNet`
- `createdBy/createdAt`
- `approvedBy/approvedAt`
- `paidAt/paidBy`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo bảng lương | payroll.generate (admin, operation) |
| Xuất Excel | payroll.export (admin, accountant) |
| Xem và duyệt | payroll.approve (admin) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click mã bảng lương → chi tiết | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| KPI Chờ duyệt → bảng lương | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Mở báo cáo bảng lương | [WM-RPT-08](../wm/WM-RPT-08.md) Báo cáo bảng lương | `/reports/payroll` | action |
| Xuất Excel | WM-SHELL-05 | | action |
| Tạo bảng lương | [WM-PAYROLL-03](../wm/WM-PAYROLL-03.md) Tạo bảng lương | `/payroll/new` | action |
| Banner: Xem và duyệt | [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | `/payroll/:payrollId/approve` | action |
| Mở cài đặt kỳ lương | WM-SET-01 | | action |
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
| [WM-PAYROLL-03](../wm/WM-PAYROLL-03.md) Tạo bảng lương | Hủy tạo bảng lương |

## Components (design system)

`StatusBadge`, `Menu`, `IconButton`, `Button`, `KpiCard`, `PageHeader`, `Banner`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `payrolls(filter{period, status, createdBy}, first, after)`

## Trạng thái UI

- **loading**: DataTable skeleton rows
- **empty**: EmptyState 'Chưa có bảng lương' + nút 'Tạo bảng lương kỳ này' (ẩn với kế toán)
- **error**: Banner danger 'Không tải được bảng lương' + Thử lại

## Ghi chú implement

- Chip trạng thái map filter.status. Kỳ lương hiển thị theo cài đặt merchant (WM-SET-01), không hard-code tháng.
- Banner chờ duyệt chỉ hiện với admin; operation thấy 'Đang chờ duyệt'.
- Tiền căn phải, tabular-nums.
