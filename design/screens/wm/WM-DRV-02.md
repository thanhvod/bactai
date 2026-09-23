# WM-DRV-02 — Chi tiết tài xế

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Tài xế |
| Route | `/drivers/:driverId` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1200 |
| Mockup | [../../mockups/WM-DRV-02.html](../../mockups/WM-DRV-02.html) · canvas artboard `WM-DRV-02.dc.html` |

## Mục đích

Quản lý tài xế end-to-end: hồ sơ, tài khoản app, lương cố định, lịch sử lái, công nợ, bảng lương, chứng từ, timeline.

## Dữ liệu hiển thị

- `profile{name, phone, idNumber, dob, address, emergencyContact}`
- `license{class, number, expiresAt}`
- `appAccount{status, lastLoginAt, device}`
- `currentSalary`
- `recentTrips[]`
- `ledgerSummary`
- `currentPayroll`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Sửa | driver.update (admin/operation) |
| Mời/đặt lại tài khoản app | driver.account.reset (admin/operation) — confirm dialog |
| Tạo phiếu chi hoàn ứng | expense.create → WM-EXP-03 |
| Ngừng hoạt động | driver.update — sensitive |
| Timeline | driver.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Sửa tài xế | [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | `/drivers/new · /drivers/:driverId/edit` | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở đơn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | action |
| Mở bảng lương | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Mở lịch sử lương cố định | [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | action |
| Mở tạm ứng chuyến & đối soát | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | action |
| Tạo phiếu chi hoàn ứng | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Mở sổ công nợ tài xế | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Mở Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Tạo phiếu chi hoàn ứng cho tài xế | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Menu: Ngừng hoạt động tài xế (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở chuyến hiện tại | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Tab Công nợ | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Tab Lương/ứng | [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | action |
| Breadcrumb Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
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
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Mở tài xế |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Kết quả tài xế → chi tiết tài xế |
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Mở tài xế |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở tài xế |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Mở tài xế |
| [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | Mở tài xế |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Mở Nguyễn Văn Tài |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Mở tài xế |
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Click tên tài xế → chi tiết |
| [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | Hủy → chi tiết tài xế |
| [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | Lưu → chi tiết tài xế |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Tab Tổng quan |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Tab Tổng quan |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Tab Tổng quan |
| [WM-PAYROLL-03](../wm/WM-PAYROLL-03.md) Tạo bảng lương | Mở tài xế |
| [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | Mở tài xế |
| [WM-RPT-05](../wm/WM-RPT-05.md) Hiệu suất tài xế | Mở chi tiết tài xế |
| [WM-RPT-08](../wm/WM-RPT-08.md) Báo cáo bảng lương | Mở tài xế |

## Components (design system)

`DescriptionList`, `StatusBadge`, `DataTable`, `Button`, `Timeline`, `EntityHeader`, `IconButton`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `driver(id){salaryHistory, appAccount, currentTrip}`
- `trips(filter:{driverId}, first: 5)`
- `driverLedger(driverId)`
- `createOrResetDriverAccount(driverId)`
- `activityLogs(entityType: DRIVER, entityId)`

## Trạng thái UI

- **loading**: Skeleton header + tabs
- **error**: Không tìm thấy tài xế → EmptyState + về danh sách
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Tabs ?tab= (overview|trips|ledger|salary|attachments|timeline).
- Primary action đổi theo dữ liệu: giữ COD → 'Ghi nhận nộp COD'; công ty nợ → 'Tạo phiếu chi hoàn ứng'.
- Phương thức đăng nhập app phụ thuộc quyết định driver auth (P0-001); UI chỉ hiện trạng thái + mời/đặt lại.
