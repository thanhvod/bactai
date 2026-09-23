# WM-PAYROLL-03 — Tạo bảng lương

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Lương |
| Route | `/payroll/new` |
| Pattern | `form` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1300 |
| Mockup | [../../mockups/WM-PAYROLL-03.html](../../mockups/WM-PAYROLL-03.html) · canvas artboard `WM-PAYROLL-03.dc.html` |

## Mục đích

Chọn kỳ và tài xế, xem trước dữ liệu gốc (lịch sử lương, thưởng chuyến, ứng lương, giảm trừ) rồi tạo bảng lương nháp.

## Dữ liệu hiển thị

- `period{label, from, to}`
- `driverIds[]`
- `preview.lines[{driver, baseSalary, effectiveFrom, bonuses[], advances[], deductions[], netEstimate}]`
- `warnings[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo bảng lương nháp | payroll.generate (admin, operation) |
| Hủy | — |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở cài đặt kỳ lương | [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | `/settings/operations` | action |
| Mở tài xế | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Mở lịch sử lương cố định | [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | action |
| Mở chuyến có thưởng | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở phiếu chi ứng lương | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở danh mục lý do giảm trừ | [WM-CAT-01](../wm/WM-CAT-01.md) Danh mục dùng chung | `/settings/catalogs` | action |
| Mở tạm ứng chuyến & đối soát | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | action |
| Hủy tạo bảng lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | action |
| Tạo → chi tiết bảng lương | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Breadcrumb Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
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
| [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | Tạo bảng lương |

## Components (design system)

`Select`, `FormField`, `TextField`, `Checkbox`, `StatusBadge`, `DataTable`, `Button`, `WarningPanel`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `merchantSettings{payrollPeriod}`
- `drivers(filter{status})`
- `payrollPreview(input{period, driverIds})`
- `generatePayroll(input)`

## Trạng thái UI

- **validation**: Kỳ đã có bảng lương cho tài xế → lỗi inline dưới field Kỳ lương
- **empty**: Không có tài xế hoạt động → EmptyState + link Tài xế
- **loading**: Preview skeleton khi đổi kỳ/tài xế
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Kỳ lương lấy từ WM-SET-01 (tháng dương lịch, 5→5…).
- Tạm ứng chuyến và chi phí tài xế chi trước không vào bảng lương.
- Sau tạo → /payroll/:payrollId (Nháp).
