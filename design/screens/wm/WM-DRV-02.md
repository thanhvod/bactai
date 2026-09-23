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
| Mở chuyến | WM-TRIP-01 | | action |
| Mở đơn | WM-ORD-02 | | action |
| Mở lịch xe/tài xế | WM-DISPATCH-02 | | action |
| Mở bảng lương | WM-PAYROLL-02 | | action |
| Mở lịch sử lương cố định | [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | action |
| Mở tạm ứng chuyến & đối soát | WM-ADV-01 | | action |
| Tạo phiếu chi hoàn ứng | WM-EXP-03 | | action |
| Mở sổ công nợ tài xế | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Mở Timeline | WM-SHELL-07 | | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Tạo phiếu chi hoàn ứng cho tài xế | WM-EXP-03 | | action |
| Menu: Ngừng hoạt động tài xế (sensitive) | WM-SHELL-08 | | action |
| Mở chuyến hiện tại | WM-TRIP-01 | | action |
| Tab Công nợ | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Tab Lương/ứng | [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | action |
| Breadcrumb Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
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

| Từ | Trigger |
|---|---|
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Click tên tài xế → chi tiết |
| [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | Hủy → chi tiết tài xế |
| [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | Lưu → chi tiết tài xế |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Tab Tổng quan |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Tab Tổng quan |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Tab Tổng quan |

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
