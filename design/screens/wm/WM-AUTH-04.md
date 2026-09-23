# WM-AUTH-04 — Không có quyền / chờ mời

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Auth & onboarding |
| Route | `/access-pending` |
| Pattern | `auth` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-AUTH-04.html](../../mockups/WM-AUTH-04.html) · canvas artboard `WM-AUTH-04.dc.html` |

## Mục đích

Tài khoản Google chưa thuộc merchant nào: hướng dẫn nhờ admin mời hoặc tạo nhà xe mới.

## Dữ liệu hiển thị

- `user.email`
- `pendingInvitations[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Kiểm tra lại lời mời | refetch me → WM-AUTH-03/WM-DASH-01 nếu đã có |
| Tạo nhà xe mới | nếu merchant self-service bật → WM-AUTH-02 |
| Đăng nhập tài khoản khác | logout → WM-AUTH-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Đăng xuất | [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | `/login` | action |
| Đã có lời mời → chọn merchant | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | action |
| Tạo merchant | [WM-AUTH-02](../wm/WM-AUTH-02.md) Tạo/hoàn tất merchant | `/onboarding/merchant` | action |
| Logout → đăng nhập lại | [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | `/login` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | Sau đăng nhập: chưa có merchant |

## Components (design system)

`Button`, `AuthScreen`, `Logo`

## API (GraphQL)

- `me{memberships, pendingInvitations}`

## Trạng thái UI

- **has_invite**: Có lời mời chờ: hiện danh sách lời mời + nút Chấp nhận
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- User chưa mapping merchant không được vào dashboard (guard route).
