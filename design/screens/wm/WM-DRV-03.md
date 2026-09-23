# WM-DRV-03 — Form tài xế

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Tài xế |
| Route | `/drivers/new · /drivers/:driverId/edit` |
| Pattern | `form` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1120 |
| Mockup | [../../mockups/WM-DRV-03.html](../../mockups/WM-DRV-03.html) · canvas artboard `WM-DRV-03.dc.html` |

## Mục đích

Tạo/sửa tài xế: thông tin cá nhân, GPLX (nếu có), lương cố định + ngày hiệu lực, trạng thái, tài khoản app.

## Dữ liệu hiển thị

- `name`
- `phone`
- `code(auto)`
- `dob`
- `idNumber`
- `address`
- `emergencyContact`
- `license{class, number, expiresAt, photos[]}`
- `fixedSalary`
- `salaryEffectiveFrom`
- `salaryReason`
- `status`
- `appLoginEnabled`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu tài xế | driver.create | driver.update → WM-DRV-02 |
| Mời/đặt lại tài khoản app | driver.account.reset |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở lịch sử lương cố định | [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | action |
| Hủy → chi tiết tài xế | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Lưu → chi tiết tài xế | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Breadcrumb Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Breadcrumb Nguyễn Văn Tài | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | nav |
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
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Tạo tài xế |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Sửa tài xế |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Sửa tài xế |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Sửa tài xế |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Sửa tài xế |

## Components (design system)

`TextField`, `FormField`, `DateField`, `Select`, `AttachmentUploader`, `MoneyInput`, `Banner`, `RadioGroup`, `Switch`, `StatusBadge`, `Button`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `createDriver(input)`
- `updateDriver(id, input)`
- `addDriverSalaryHistory(driverId, input)`
- `createOrResetDriverAccount(driverId)`

## Trạng thái UI

- **validation**: Họ tên, SĐT bắt buộc; SĐT trùng trong merchant → lỗi inline; đổi lương mà thiếu lý do → lỗi inline
- **saving**: Nút Lưu loading
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Đổi lương trong form = addDriverSalaryHistory (mốc mới), không update đè.
- Quản lý lịch sử lương: admin; operation nếu được cấp (⚠️).
- Tạo mới: lương cố định + hiệu lực từ ngày vào làm.
