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
| Mở cài đặt kỳ lương | WM-SET-01 | | action |
| Mở tài xế | WM-DRV-02 | | action |
| Mở lịch sử lương cố định | WM-DRV-04 | | action |
| Mở chuyến có thưởng | WM-TRIP-01 | | action |
| Mở phiếu chi ứng lương | WM-EXP-02 | | action |
| Mở danh mục lý do giảm trừ | WM-CAT-01 | | action |
| Mở tạm ứng chuyến & đối soát | WM-ADV-01 | | action |
| Hủy tạo bảng lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | action |
| Tạo → chi tiết bảng lương | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Breadcrumb Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
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
