# CW-HOME-01 — Trang khám phá

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Tìm nhà xe |
| Route | `/` |
| Pattern | `list` |
| Roles | customer, guest |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/CW-HOME-01.html](../../mockups/CW-HOME-01.html) · canvas artboard `CW-HOME-01.dc.html` |

## Mục đích

Tìm nhà xe theo tuyến, dịch vụ, loại xe; mở hồ sơ hoặc gửi yêu cầu ngay.

## Dữ liệu hiển thị

- `merchant.name`
- `serviceAreas[]`
- `services[]`
- `vehicleTypes[]`
- `intakeHours`
- `relationship (đã hợp tác, số đơn)`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tìm nhà xe | public |
| Xem hồ sơ | public → CW-MER-01 |
| Gửi yêu cầu | customer (chưa đăng nhập → CW-AUTH-01) → CW-BOOK-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở hồ sơ nhà xe BTA Demo Transport | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | action |
| Xem hồ sơ nhà xe | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | action |
| Gửi yêu cầu → Tạo booking | [CW-BOOK-01](../cw/CW-BOOK-01.md) Tạo booking/yêu cầu vận chuyển | `/bookings/new` | action |
| Mở hồ sơ nhà xe | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | action |
| Mở booking gần đây | [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | `/bookings/:bookingId` | action |
| Xem tất cả booking | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | action |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | Đăng nhập thành công → Trang khám phá |
| [CW-AUTH-01](../cw/CW-AUTH-01.md) Đăng nhập/đăng ký khách | Tiếp tục không đăng nhập |
| [CW-BOOK-01](../cw/CW-BOOK-01.md) Tạo booking/yêu cầu vận chuyển | Đổi nhà xe |

## Components (design system)

`Select`, `FormField`, `TextField`, `Button`, `StatusBadge`, `PageHeader`, `CustomerShell`, `Logo`

## API (GraphQL)

- `publicMerchants(filter: {from, to, service, vehicleType, keyword}, first, after)`
- `myBookings(first: 3)`

## Trạng thái UI

- **loading**: Skeleton 3 dòng kết quả
- **empty**: EmptyState 'Chưa có nhà xe phù hợp tuyến này' + nút Xóa bộ lọc
- **error**: Banner danger 'Không tải được danh sách nhà xe' + Thử lại

## Ghi chú implement

- Chỉ merchant bật hồ sơ công khai (publish) mới hiện.
- Không có quảng cáo/xếp hạng sao; sắp xếp mặc định 'Đã hợp tác trước'.
- Khối 'Yêu cầu gần đây' chỉ hiện khi đã đăng nhập.
