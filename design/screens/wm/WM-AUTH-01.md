# WM-AUTH-01 — Đăng nhập Google

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Auth & onboarding |
| Route | `/login` |
| Pattern | `auth` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-AUTH-01.html](../../mockups/WM-AUTH-01.html) · canvas artboard `WM-AUTH-01.dc.html` |

## Mục đích

Đăng nhập Web Merchant bằng Firebase Google. Không có form email/mật khẩu (D-006).

## Dữ liệu hiển thị

- `firebaseIdToken`
- `me.memberships[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đăng nhập bằng Google | public |
| Điều hướng sau login | 1 merchant → WM-DASH-01; nhiều → WM-AUTH-03; không có → WM-AUTH-04 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Đăng nhập Google thành công (1 merchant) → Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | action |
| Sau đăng nhập: 1 merchant | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | action |
| Sau đăng nhập: nhiều merchant | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | action |
| Sau đăng nhập: chưa có merchant | [WM-AUTH-04](../wm/WM-AUTH-04.md) Không có quyền / chờ mời | `/access-pending` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-AUTH-02](../wm/WM-AUTH-02.md) Tạo/hoàn tất merchant | Đăng xuất |
| [WM-AUTH-02](../wm/WM-AUTH-02.md) Tạo/hoàn tất merchant | Hủy → logout |
| [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | Đăng xuất |
| [WM-AUTH-04](../wm/WM-AUTH-04.md) Không có quyền / chờ mời | Đăng xuất |
| [WM-AUTH-04](../wm/WM-AUTH-04.md) Không có quyền / chờ mời | Logout → đăng nhập lại |
| [WM-SHELL-01](../wm/WM-SHELL-01.md) Layout chính | Đăng xuất |

## Components (design system)

`Button`, `AuthScreen`, `Logo`

## API (GraphQL)

- `Firebase signInWithPopup(GoogleAuthProvider)`
- `me → memberships, permissions`

## Trạng thái UI

- **loading**: Nút disabled 'Đang xác thực với Google…' khi popup/verify đang chạy
- **error**: Inline danger dưới nút: token invalid/expired, popup bị chặn, API verify fail + Thử lại
- **session**: Đã có session hợp lệ → redirect thẳng theo memberships
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Không có đăng ký/mật khẩu; tài khoản mới đi qua WM-AUTH-04/WM-AUTH-02.
- Sau verify, backend map Firebase UID/email → user + merchant memberships.
- Giữ returnUrl để quay lại trang cũ sau khi đăng nhập.
