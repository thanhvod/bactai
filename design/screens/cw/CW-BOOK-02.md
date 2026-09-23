# CW-BOOK-02 — Danh sách booking

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Booking |
| Route | `/bookings` |
| Pattern | `list` |
| Roles | customer |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/CW-BOOK-02.html](../../mockups/CW-BOOK-02.html) · canvas artboard `CW-BOOK-02.dc.html` |

## Mục đích

Theo dõi các yêu cầu đã gửi: Chờ tiếp nhận / Đang xử lý / Đã tạo đơn / Đã hủy, và đơn liên kết.

## Dữ liệu hiển thị

- `code`
- `merchant.name`
- `pickup.name`
- `drop.name`
- `pickupFrom`
- `cargoSummary`
- `status`
- `order.code?`
- `createdAt`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo yêu cầu mới | customer → CW-BOOK-01 |
| Mở booking | customer (own) → CW-BOOK-03 |
| Mở đơn liên kết | customer (own) → CW-ORD-02 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click mã booking → chi tiết | [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | `/bookings/:bookingId` | action |
| Mở đơn đã tạo từ booking | [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | `/orders/:orderId` | action |
| Tạo booking | [CW-BOOK-01](../cw/CW-BOOK-01.md) Tạo booking/yêu cầu vận chuyển | `/bookings/new` | action |
| Mở lịch sử đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | action |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | Xem tất cả booking |
| [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | Xem booking đang chờ |

## Components (design system)

`StatusBadge`, `Button`, `PageHeader`, `Banner`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `IconButton`, `DataTable`, `CustomerShell`, `Logo`

## API (GraphQL)

- `myBookings(filter: {status, dateRange, keyword}, first, after)`

## Trạng thái UI

- **loading**: DataTable skeleton
- **empty**: EmptyState 'Bạn chưa gửi yêu cầu nào' + nút 'Tìm nhà xe'
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Status tone: Chờ tiếp nhận=warning, Đang xử lý=info, Đã tạo đơn=success, Đã hủy=neutral outline.
- Customer principal tách khỏi merchant user; mọi query scope theo customerId của phiên (không thấy dữ liệu khách khác).
