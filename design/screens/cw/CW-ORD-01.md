# CW-ORD-01 — Lịch sử đơn hàng

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Đơn hàng & công nợ |
| Route | `/orders` |
| Pattern | `list` |
| Roles | customer |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/CW-ORD-01.html](../../mockups/CW-ORD-01.html) · canvas artboard `CW-ORD-01.dc.html` |

## Mục đích

Đơn nhà xe đã tạo cho khách (từ booking hoặc đặt điện thoại): trạng thái, tuyến, tổng tiền, đã thanh toán, còn phải trả.

## Dữ liệu hiển thị

- `code`
- `createdAt`
- `merchant.name`
- `routeSummary`
- `status`
- `totalAmount`
- `paidAmount`
- `remainingAmount`
- `dueDate`
- `booking.code?`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở đơn | customer (own, merchant exposes history) → CW-ORD-02 |
| Mở booking gốc | customer → CW-BOOK-03 |
| Xem bảng kê | → CW-DEBT-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click mã đơn → chi tiết | [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | `/orders/:orderId` | action |
| Mở booking gốc | [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | `/bookings/:bookingId` | action |
| Xem bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | action |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | Xem đơn với nhà xe này |
| [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | Mở lịch sử đơn hàng |
| [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | Mở lịch sử đơn hàng |
| [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | Mở lịch sử đơn hàng |
| [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | Xem đơn còn phải trả |

## Components (design system)

`StatusBadge`, `DueIndicator`, `Button`, `PageHeader`, `SummaryStrip`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `IconButton`, `DataTable`, `CustomerShell`, `Logo`

## API (GraphQL)

- `myOrders(filter: {status, dateRange, keyword}, first, after)`
- `myDebtSummary`

## Trạng thái UI

- **loading**: DataTable skeleton
- **empty**: EmptyState 'Chưa có đơn hàng' + 'Gửi yêu cầu vận chuyển'
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Không hiển thị đơn Nháp và đơn merchant chưa mở cho khách.
- Cột tiền căn phải, tabular-nums; đơn Chờ xác nhận chưa tính còn phải trả.
- Customer principal tách khỏi merchant user; mọi query scope theo customerId của phiên (không thấy dữ liệu khách khác).
