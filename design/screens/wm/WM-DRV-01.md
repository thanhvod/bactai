# WM-DRV-01 — Danh sách tài xế

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Tài xế |
| Route | `/drivers` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-DRV-01.html](../../mockups/WM-DRV-01.html) · canvas artboard `WM-DRV-01.dc.html` |

## Mục đích

Tìm/lọc tài xế; thấy trạng thái, xe/chuyến hiện tại, tài khoản app, COD đang giữ và công nợ 2 chiều.

## Dữ liệu hiển thị

- `code`
- `name`
- `phone`
- `status`
- `currentTrip{code, status, vehiclePlate, route}`
- `appAccountStatus`
- `fixedSalary`
- `codHeld`
- `codOverThreshold`
- `companyOwesDriver`
- `driverOwesCompany`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Thêm tài xế | driver.create (admin/operation) |
| Import | driver.create → WM-SHELL-04 |
| Xuất Excel | driver.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click tên tài xế → chi tiết | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Mở chuyến hiện tại | WM-TRIP-01 | | action |
| Mở COD tài xế đang giữ | [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | action |
| Click KPI → lịch xe/tài xế | WM-DISPATCH-02 | | action |
| Click KPI COD → COD tài xế đang giữ | [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | action |
| Click KPI → sổ công nợ tài xế | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Import tài xế từ Excel | WM-SHELL-04 | | action |
| Xuất danh sách tài xế | WM-SHELL-05 | | action |
| Tạo tài xế | [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | `/drivers/new · /drivers/:driverId/edit` | action |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Sidebar: Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.

## Components (design system)

`StatusBadge`, `Menu`, `IconButton`, `Button`, `KpiCard`, `PageHeader`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `Banner`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `drivers(filter, sort, first, after){currentTrip, appAccount, ledgerSummary{codHeld, companyOwes, driverOwes}}`

## Trạng thái UI

- **loading**: DataTable skeleton
- **empty**: EmptyState 'Chưa có tài xế' + Thêm tài xế / Import
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Tài xế ngừng hoạt động (DRV-A-003) hiển thị mờ; không chọn được ở WM-TRIP-02.
- COD đang giữ vượt ngưỡng (merchant setting: 5.000.000 đ hoặc 2 ngày) → badge danger.
- Kế toán xem được, không có nút Thêm (driver.create chỉ admin/operation).
