# CW-PROFILE-01 — Hồ sơ khách hàng

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Tài khoản |
| Route | `/profile` |
| Pattern | `form` |
| Roles | customer |
| Kích thước mockup | 1440×1200 |
| Mockup | [../../mockups/CW-PROFILE-01.html](../../mockups/CW-PROFILE-01.html) · canvas artboard `CW-PROFILE-01.dc.html` |

## Mục đích

Cập nhật thông tin doanh nghiệp, người liên hệ, bảo mật và cài đặt thông báo.

## Dữ liệu hiển thị

- `companyName`
- `taxCode`
- `billingAddress`
- `phone`
- `contact{name, title, email, phone}`
- `notificationPrefs{booking, order, statement, sms}`
- `merchantLinks[{merchant, customerCode, paymentTermDays}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu thay đổi | customer (own) |
| Đổi mật khẩu | customer |
| Đăng xuất | → CW-AUTH-01 |
| Quản lý địa chỉ | → CW-ADDR-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Đăng xuất | [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | `/login` | action |
| Xem thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | action |
| Mở hồ sơ nhà xe | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | action |
| Xem công nợ | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | action |
| Mở địa chỉ thường dùng | [CW-ADDR-01](../cw/CW-ADDR-01.md) Địa chỉ thường dùng | `/addresses` | action |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | Mở cài đặt thông báo trong hồ sơ |

## Components (design system)

`TextField`, `FormField`, `Button`, `Switch`, `PageHeader`, `CustomerShell`, `Logo`

## API (GraphQL)

- `me{customer, contact, notificationPrefs, merchantLinks}`
- `updateCustomerProfile(input)`
- `changeCustomerPassword(old, new)`
- `updateNotificationPrefs(input)`
- `logout`

## Trạng thái UI

- **validation**: Inline danger: email/SĐT sai định dạng
- **loading**: Skeleton form
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Sửa hồ sơ không đổi thông tin customer phía merchant; nhà xe nhận thông báo để cập nhật nếu cần.
