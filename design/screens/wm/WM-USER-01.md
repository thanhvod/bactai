# WM-USER-01 — Danh sách nhân viên

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Cài đặt |
| Route | `/settings/users` |
| Pattern | `list` |
| Roles | admin |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-USER-01.html](../../mockups/WM-USER-01.html) · canvas artboard `WM-USER-01.dc.html` |

## Mục đích

Tìm/lọc nhân viên merchant theo vai trò/trạng thái; mời nhân viên; khóa/mở tài khoản.

## Dữ liệu hiển thị

- `name`
- `email`
- `role`
- `status (ACTIVE|INVITED|LOCKED)`
- `lastLoginAt`
- `joinedAt`
- `invitedBy`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mời nhân viên | Manage users/roles — admin → WM-USER-03 |
| Khóa / Mở khóa | admin; không tự khóa chính mình; confirm dialog |
| Gửi lại lời mời | admin; chỉ trạng thái Chờ chấp nhận |
| Vai trò & quyền | admin → WM-RBAC-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở ma trận vai trò | [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | `/settings/roles` | action |
| Mời nhân viên | [WM-USER-03](../wm/WM-USER-03.md) Mời/tạo nhân viên | `/settings/users/new (drawer)` | action |
| Click tên nhân viên → chi tiết | [WM-USER-02](../wm/WM-USER-02.md) Chi tiết nhân viên | `/settings/users/:userId` | action |
| Breadcrumb Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Hồ sơ nhà xe | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Nhân viên | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | nav |
| Sidebar: Vai trò & quyền | [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | `/settings/roles` | nav |
| Sidebar: Cài đặt vận hành | [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | `/settings/operations` | nav |
| Sidebar: Mã tự động | [WM-SET-02](../wm/WM-SET-02.md) Cấu hình mã tự động | `/settings/numbering` | nav |
| Sidebar: Danh mục | [WM-CAT-01](../wm/WM-CAT-01.md) Danh mục dùng chung | `/settings/catalogs` | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-USER-03](../wm/WM-USER-03.md) Mời/tạo nhân viên | Hủy → quay lại danh sách |
| [WM-USER-03](../wm/WM-USER-03.md) Mời/tạo nhân viên | Gửi lời mời → danh sách (Chờ chấp nhận) |
| [WM-USER-03](../wm/WM-USER-03.md) Mời/tạo nhân viên | Đóng |
| [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | Xem nhân viên vai trò Admin |
| [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | Xem nhân viên vai trò Operation |
| [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | Xem nhân viên vai trò Kế toán |
| [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | Mở danh sách nhân viên |

## Components (design system)

`SummaryStrip`, `Button`, `PageHeader`, `Breadcrumb`, `FilterBar`, `TextField`, `FilterChip`, `StatusBadge`, `Menu`, `IconButton`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `merchantUsers(filter{role, status, search}, first, after)`
- `lockMerchantUser(id)`
- `unlockMerchantUser(id)`
- `resendInvite(id)`

## Trạng thái UI

- **loading**: DataTable skeleton rows
- **empty**: EmptyState 'Chưa có nhân viên khác' + nút 'Mời nhân viên'
- **error**: Banner danger + Thử lại
- **no-permission**: Non-admin truy cập URL → trang không có quyền

## Ghi chú implement

- Khóa user: chặn API ngay (revoke session); giữ dữ liệu/lịch sử.
- Không cho khóa Admin cuối cùng của merchant.
- Row click hoặc tên → /settings/users/:userId.
