# CW-NOTI-01 — Thông báo khách

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Tài khoản |
| Route | `/notifications` |
| Pattern | `list` |
| Roles | customer |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/CW-NOTI-01.html](../../mockups/CW-NOTI-01.html) · canvas artboard `CW-NOTI-01.dc.html` |

## Mục đích

Thông báo booking được tiếp nhận/tạo đơn, đơn cập nhật, bảng kê mới; mỗi dòng mở màn hình chi tiết tương ứng.

## Dữ liệu hiển thị

- `type (booking | order | statement)`
- `title`
- `body`
- `createdAt`
- `readAt`
- `target{kind, id}`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở booking | → CW-BOOK-03 |
| Mở đơn | → CW-ORD-02 |
| Xem bảng kê | → CW-DEBT-01 |
| Đánh dấu tất cả đã đọc | customer |
| Cài đặt nhận thông báo | → CW-PROFILE-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Thông báo: Mở đơn | [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | `/orders/:orderId` | action |
| Thông báo: Mở booking | [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | `/bookings/:bookingId` | action |
| Thông báo: Xem bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | action |
| Thông báo: Xem POD | [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | `/orders/:orderId` | action |
| Mở cài đặt thông báo trong hồ sơ | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | action |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | Xem thông báo |

## Components (design system)

`Button`, `PageHeader`, `SegmentedControl`, `CustomerShell`, `Logo`

## API (GraphQL)

- `myNotifications(filter: {unread}, first, after)`
- `markNotificationsRead(ids | all)`

## Trạng thái UI

- **loading**: Skeleton 5 dòng
- **empty**: EmptyState 'Chưa có thông báo'
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Chỉ gửi loại khách đã bật trong hồ sơ.
- Chấm xanh + nền accent-soft = chưa đọc; click dòng đánh dấu đã đọc.
