# WM-USER-02 — Chi tiết nhân viên

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Cài đặt |
| Route | `/settings/users/:userId` |
| Pattern | `detail` |
| Roles | admin |
| Kích thước mockup | 1440×1060 |
| Mockup | [../../mockups/WM-USER-02.html](../../mockups/WM-USER-02.html) · canvas artboard `WM-USER-02.dc.html` |

## Mục đích

Hồ sơ nhân viên, vai trò, quyền cấp thêm, merchant access và nhật ký hoạt động/audit.

## Dữ liệu hiển thị

- `name`
- `email`
- `phone`
- `title`
- `role`
- `extraPermissions[]`
- `memberships[{merchant, role, status, since}]`
- `lastLoginAt`
- `activity[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu thay đổi (hồ sơ, vai trò, quyền cấp thêm) | admin; đổi vai trò ghi audit |
| Khóa tài khoản | admin; confirm |
| Xem quyền của vai trò | → WM-RBAC-01 |
| Timeline | → WM-SHELL-07 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở Timeline nhân viên | WM-SHELL-07 | | action |
| Xem quyền của vai trò → ma trận | [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | `/settings/roles` | action |
| Mở Timeline đầy đủ | WM-SHELL-07 | | action |
| Breadcrumb Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Breadcrumb Nhân viên | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | nav |
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
| [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | Click tên nhân viên → chi tiết |
| [WM-USER-03](../wm/WM-USER-03.md) Mời/tạo nhân viên | Click tên nhân viên → chi tiết |
| [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | Cấp quyền cho nhân viên → chi tiết nhân viên |

## Components (design system)

`StatusBadge`, `Button`, `SummaryStrip`, `TextField`, `FormField`, `Checkbox`, `RadioGroup`, `DataTable`, `Timeline`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `merchantUser(id)`
- `updateMerchantUser(id, input)`
- `assignRole(userId, role)`
- `setUserExtraPermissions(userId, permissions[])`
- `lockMerchantUser(id)`
- `activityLogs(actorId, first)`

## Trạng thái UI

- **loading**: Skeleton header + panels
- **error**: Không tìm thấy nhân viên → EmptyState + quay lại danh sách
- **locked**: Banner danger 'Tài khoản đã khóa từ …' + nút Mở khóa
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Quyền cấp thêm = các ô 'Cần cấp thêm' (⚠ trong 08-permission-matrix) của vai trò hiện tại; đổi vai trò reset danh sách.
- Không cho hạ vai trò Admin cuối cùng.
- Email Google là định danh đăng nhập (Firebase), không sửa trực tiếp.
