# WM-SHELL-01 — Layout chính

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khung chung |
| Route | `(layout) /*` |
| Pattern | `page` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-SHELL-01.html](../../mockups/WM-SHELL-01.html) · canvas artboard `WM-SHELL-01.dc.html` |

## Mục đích

AppShell: sidebar module, topbar (tìm nhanh, chuông, user menu), vùng PageHeader → Toolbar → nội dung. Menu tài khoản đang mở.

## Dữ liệu hiển thị

- `user.name`
- `user.email`
- `currentMerchant{name, code}`
- `role`
- `memberships.count`
- `navBadges{dispatch, finance, payroll}`
- `unreadCount`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đổi nhà xe | → WM-AUTH-03 |
| Hồ sơ nhà xe | settings.manage (admin) |
| Tài khoản của tôi | self |
| Đăng xuất | logout, clear cache |
| Ctrl K | → WM-SHELL-03 |
| Chuông | → WM-SHELL-02 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở tìm kiếm nhanh | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | action |
| Mở thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | action |
| Đổi nhà xe | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | action |
| Hồ sơ nhà xe | WM-ORG-01 | | action |
| Tài khoản của tôi | WM-USER-02 | | action |
| Cài đặt vận hành | WM-SET-01 | | action |
| Đăng xuất | [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | `/login` | action |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Tổng quan | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Vận hành | [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | `/dashboard/operations` | nav |
| Sidebar: Tài chính | [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | `/dashboard/finance` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.

## Components (design system)

`Skeleton`, `Button`, `TextField`, `StatusBadge`, `Menu`, `Popover`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `me{user, currentMerchant, memberships, permissions}`
- `notifications(filter: {unread: true}){totalCount}`
- `navBadges (counts cảnh báo)`

## Trạng thái UI

- **loading**: Skeleton trong vùng nội dung, shell không nhấp nháy
- **no_permission**: Mục sidebar ẩn theo permission; truy cập trực tiếp route → EmptyState 'Bạn không có quyền xem trang này'
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Sidebar 260px, mục đang mở dùng primary-soft + primary text.
- Badge sidebar: danger cho tiền quá hạn, warning cho việc chờ xử lý.
- Ẩn/disable action theo permission nhưng backend vẫn guard.
