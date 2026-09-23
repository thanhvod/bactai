# WM-RBAC-01 — Vai trò & phân quyền

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Cài đặt |
| Route | `/settings/roles` |
| Pattern | `report` |
| Roles | admin |
| Kích thước mockup | 1440×2300 |
| Mockup | [../../mockups/WM-RBAC-01.html](../../mockups/WM-RBAC-01.html) · canvas artboard `WM-RBAC-01.dc.html` |

## Mục đích

Ma trận quyền theo vai trò (admin/operation/kế toán) × thao tác, đánh dấu thao tác nhạy cảm cần lý do.

## Dữ liệu hiển thị

- `group (Dữ liệu nền|Đơn & điều phối|Tài chính|Lương)`
- `action`
- `admin|operation|accountant: ALLOWED|DENIED|GRANTABLE`
- `requiresReason`
- `grantedUserCount`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Cấp quyền cho nhân viên | admin → WM-USER-02 |
| Xem hộp xác nhận lý do | → WM-SHELL-08 |
| Xem nhân viên theo vai trò | → WM-USER-01?role= |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xem nhân viên vai trò Admin | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | action |
| Xem nhân viên vai trò Operation | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | action |
| Xem nhân viên vai trò Kế toán | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | action |
| Xem mẫu Sensitive action modal | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Cấp quyền cho nhân viên → chi tiết nhân viên | [WM-USER-02](../wm/WM-USER-02.md) Chi tiết nhân viên | `/settings/users/:userId` | action |
| Mở danh sách nhân viên | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | action |
| Breadcrumb Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
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
| Sidebar: Hồ sơ nhà xe | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Nhân viên | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | nav |
| Sidebar: Vai trò & quyền | [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | `/settings/roles` | nav |
| Sidebar: Cài đặt vận hành | [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | `/settings/operations` | nav |
| Sidebar: Mã tự động | [WM-SET-02](../wm/WM-SET-02.md) Cấu hình mã tự động | `/settings/numbering` | nav |
| Sidebar: Danh mục | [WM-CAT-01](../wm/WM-CAT-01.md) Danh mục dùng chung | `/settings/catalogs` | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | Mở ma trận vai trò |
| [WM-USER-02](../wm/WM-USER-02.md) Chi tiết nhân viên | Xem quyền của vai trò → ma trận |
| [WM-USER-03](../wm/WM-USER-03.md) Mời/tạo nhân viên | Xem ma trận quyền |
| [WM-USER-03](../wm/WM-USER-03.md) Mời/tạo nhân viên | Mở ma trận vai trò |

## Components (design system)

`PermissionMatrix`, `StatusBadge`, `DataTable`, `Button`, `PageHeader`, `Breadcrumb`, `Banner`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `roles{key, name, userCount}`
- `permissionMatrix{action, group, admin, operation, accountant, requiresReason}`

## Trạng thái UI

- **loading**: Skeleton table
- **no-permission**: Chỉ Admin truy cập; Kế toán không chỉnh RBAC (MD-002)
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Nguồn: doc/2-PRD/08-permission-matrix.md §3,4,6,7,10. ✅ = checkbox checked, ❌ = ô trống, ⚠ = checkbox indeterminate + badge 'Cần cấp thêm'.
- Phase 1 vai trò cố định (read-only); ô GRANTABLE bật cho từng user ở WM-USER-02.
- Thao tác 'Cần lý do' luôn mở SensitiveActionModal (WM-SHELL-08) và ghi audit reason.
- Backend là nguồn enforce cuối cùng; UI chỉ ẩn/disable.
