# WM-USER-03 — Mời/tạo nhân viên

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Cài đặt |
| Route | `/settings/users/new (drawer)` |
| Pattern | `drawer` |
| Roles | admin |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-USER-03.html](../../mockups/WM-USER-03.html) · canvas artboard `WM-USER-03.dc.html` |
| Overlay trên | [WM-USER-01](./WM-USER-01.md) (drawer/modal, không cần route riêng) |

## Mục đích

Mời nhân viên bằng email Google với vai trò Admin/Operation/Kế toán và quyền cấp thêm tùy chọn.

## Dữ liệu hiển thị

- `email`
- `name`
- `phone`
- `role`
- `extraPermissions[]`
- `note`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Gửi lời mời | Manage users/roles — admin → WM-USER-01 (trạng thái Chờ chấp nhận) |
| Hủy | → WM-USER-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xem ma trận quyền | [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | `/settings/roles` | action |
| Hủy → quay lại danh sách | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | action |
| Gửi lời mời → danh sách (Chờ chấp nhận) | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | action |
| Đóng | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | action |
| Mở ma trận vai trò | [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | `/settings/roles` | action |
| Mời nhân viên | [WM-USER-03](../wm/WM-USER-03.md) Mời/tạo nhân viên | `/settings/users/new (drawer)` | action |
| Click tên nhân viên → chi tiết | [WM-USER-02](../wm/WM-USER-02.md) Chi tiết nhân viên | `/settings/users/:userId` | action |
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
| [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | Mời nhân viên |
| [WM-USER-03](../wm/WM-USER-03.md) Mời/tạo nhân viên | Mời nhân viên |

## Components (design system)

`Checkbox`, `TextField`, `FormField`, `RadioGroup`, `Textarea`, `Banner`, `Button`, `Drawer`, `IconButton`, `SummaryStrip`, `PageHeader`, `Breadcrumb`, `FilterBar`, `FilterChip`, `StatusBadge`, `Menu`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `inviteMerchantUser(input{email, name, phone, role, extraPermissions[], note})`

## Trạng thái UI

- **validation**: Email bắt buộc, đúng định dạng, chưa là thành viên merchant (lỗi inline 'Email đã thuộc nhà xe')
- **submitting**: Nút Gửi lời mời loading, khóa form
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Đăng nhập chỉ Google (D-006): user mới đăng nhập bằng email được mời thì được gắn vào merchant.
- Lời mời hết hạn 7 ngày; gửi lại từ WM-USER-01.
