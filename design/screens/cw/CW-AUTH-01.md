# CW-AUTH-01 — Đăng nhập/đăng ký khách

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Đăng nhập |
| Route | `/login` |
| Pattern | `auth` |
| Roles | guest |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/CW-AUTH-01.html](../../mockups/CW-AUTH-01.html) · canvas artboard `CW-AUTH-01.dc.html` |

## Mục đích

Khách cuối đăng nhập hoặc đăng ký bằng email/SĐT; quên mật khẩu qua mã OTP. Social login chốt sau.

## Dữ liệu hiển thị

- `identifier (email | phone)`
- `password`
- `rememberMe`
- `register: fullName, companyName?, taxCode?`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đăng nhập | public → CW-HOME-01 (hoặc returnUrl) |
| Đăng ký | public; liên kết customer nhà xe sau OTP |
| Quên mật khẩu | public; gửi OTP email/SĐT |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Chuyển sang Đăng ký | [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | `/login` | action |
| Quên mật khẩu (gửi mã về email/SĐT) | [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | `/login` | action |
| Đăng nhập thành công → Trang khám phá | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | action |
| Chuyển tab Đăng ký | [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | `/login` | action |
| Tiếp tục không đăng nhập | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | action |
| Đăng nhập | [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | `/login` | action |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Đăng nhập | [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | `/login` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | Chuyển sang Đăng ký |
| [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | Quên mật khẩu (gửi mã về email/SĐT) |
| [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | Chuyển tab Đăng ký |
| [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | Đăng nhập |
| [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | Đăng xuất |

## Components (design system)

`SegmentedControl`, `TextField`, `FormField`, `Checkbox`, `Button`, `DescriptionList`, `CustomerShell`, `Logo`

## API (GraphQL)

- `customerLogin(identifier, password)`
- `registerCustomer(input)`
- `requestCustomerPasswordReset(identifier)`
- `resetCustomerPassword(token, password)`

## Trạng thái UI

- **loading**: Nút Đăng nhập loading, khóa form
- **error**: Inline danger 'Email/SĐT hoặc mật khẩu không đúng' dưới form; khóa 5 phút sau 5 lần sai
- **empty**: —

## Ghi chú implement

- Tab Đăng nhập / Đăng ký dùng ?mode=register.
- Sau đăng nhập quay về returnUrl (vd. từ 'Gửi yêu cầu' trên CW-MER-01).
- Trang khám phá và hồ sơ nhà xe xem được khi chưa đăng nhập; tạo booking yêu cầu đăng nhập.
