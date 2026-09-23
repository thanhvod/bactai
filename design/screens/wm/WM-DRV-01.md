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
| Mở chuyến hiện tại | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở COD tài xế đang giữ | [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | action |
| Click KPI → lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | action |
| Click KPI COD → COD tài xế đang giữ | [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | action |
| Click KPI → sổ công nợ tài xế | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Import tài xế từ Excel | [WM-SHELL-04](../wm/WM-SHELL-04.md) Import wizard | `(dialog) từ danh sách khách/xe/tài xế` | action |
| Xuất danh sách tài xế | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Tạo tài xế | [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | `/drivers/new · /drivers/:driverId/edit` | action |
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
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Danh sách tài xế |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Mở danh sách tài xế |

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
