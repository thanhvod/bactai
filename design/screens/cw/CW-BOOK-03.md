# CW-BOOK-03 — Chi tiết booking

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Booking |
| Route | `/bookings/:bookingId` |
| Pattern | `detail` |
| Roles | customer |
| Kích thước mockup | 1440×1320 |
| Mockup | [../../mockups/CW-BOOK-03.html](../../mockups/CW-BOOK-03.html) · canvas artboard `CW-BOOK-03.dc.html` |

## Mục đích

Nội dung yêu cầu, trao đổi ghi chú với nhà xe, timeline trạng thái và đơn liên kết khi đã tạo (DH-202609-0012).

## Dữ liệu hiển thị

- `code`
- `status`
- `merchant`
- `stops[]`
- `cargo`
- `pickupFrom`
- `deliverBefore`
- `contact`
- `note`
- `notes[{author, side, body, at}]`
- `statusHistory[]`
- `order{code}`
- `adjustments (yêu cầu → đơn)`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xem đơn | customer (own) → CW-ORD-02 |
| Gửi ghi chú | customer (own) |
| Sửa yêu cầu | chỉ khi Chờ tiếp nhận → CW-BOOK-01 (edit mode) |
| Hủy yêu cầu | chỉ khi Chờ tiếp nhận; dialog nhập lý do |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở hồ sơ nhà xe | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | action |
| Xem đơn hàng đã tạo | [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | `/orders/:orderId` | action |
| Mở đơn liên kết | [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | `/orders/:orderId` | action |
| Mở lịch sử đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | action |
| Mở đơn từ timeline | [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | `/orders/:orderId` | action |
| Breadcrumb Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | Mở booking gần đây |
| [CW-BOOK-01](../cw/CW-BOOK-01.md) Tạo booking/yêu cầu vận chuyển | Gửi yêu cầu → Chi tiết booking |
| [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | Click mã booking → chi tiết |
| [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | Mở booking gốc |
| [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | Mở booking gốc |
| [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | Thông báo: Mở booking |

## Components (design system)

`StatusBadge`, `Button`, `Stepper`, `Banner`, `DataTable`, `DescriptionList`, `AuditDiff`, `Textarea`, `FormField`, `Timeline`, `Breadcrumb`, `CustomerShell`, `Logo`

## API (GraphQL)

- `myBooking(id){stops, cargo, contact, status, statusHistory, notes, order{id, code}, orderAdjustments}`
- `addBookingNote(bookingId, body)`
- `updateBooking(id, input)`
- `cancelBooking(id, reason)`

## Trạng thái UI

- **loading**: Skeleton
- **error**: Không tìm thấy / không phải booking của mình → EmptyState + về CW-BOOK-02
- **pending**: Banner info 'Chờ nhà xe tiếp nhận', nút Sửa/Hủy enabled, không có đơn liên kết
- **cancelled**: Banner neutral lý do hủy + người hủy
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Mockup vẽ trạng thái Đã tạo đơn: Sửa/Hủy disabled kèm giải thích.
- Khối 'Nhà xe điều chỉnh khi tạo đơn' so sánh yêu cầu với đơn (thời gian, giá) — chỉ field customer-safe.
- Ghi chú nội bộ của nhà xe không hiện; chỉ note có side=customer_visible.
