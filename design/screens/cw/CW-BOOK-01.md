# CW-BOOK-01 — Tạo booking/yêu cầu vận chuyển

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Booking |
| Route | `/bookings/new` |
| Pattern | `form` |
| Roles | customer |
| Kích thước mockup | 1440×1200 |
| Mockup | [../../mockups/CW-BOOK-01.html](../../mockups/CW-BOOK-01.html) · canvas artboard `CW-BOOK-01.dc.html` |

## Mục đích

Khách gửi yêu cầu vận chuyển: điểm lấy/trả, hàng hóa, thời gian, ghi chú, liên hệ. Không phải đơn hàng, không có giá.

## Dữ liệu hiển thị

- `merchantId`
- `stops[{type, addressId?, addressSnapshot, contact}]`
- `cargo{name, weightTon, packages, vehicleTypeHint, fragile}`
- `services{loadingAtPickup, loadingAtDrop}`
- `pickupFrom`
- `deliverBefore`
- `flexibility`
- `note`
- `contact{name, phone}`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Gửi yêu cầu | customer · booking.create → CW-BOOK-03 (status Chờ tiếp nhận) |
| Chọn từ địa chỉ thường dùng | customer → CW-ADDR-01 picker |
| Hủy | → CW-MER-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xem hồ sơ nhà xe | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | action |
| Đổi nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | action |
| Chọn từ địa chỉ thường dùng | [CW-ADDR-01](../cw/CW-ADDR-01.md) Địa chỉ thường dùng | `/addresses` | action |
| Hủy → quay lại hồ sơ nhà xe | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | action |
| Gửi yêu cầu → Chi tiết booking | [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | `/bookings/:bookingId` | action |
| Breadcrumb Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Breadcrumb BTA Demo Transport | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | nav |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | Gửi yêu cầu → Tạo booking |
| [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | Gửi yêu cầu vận chuyển |
| [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | Tạo booking |
| [CW-ADDR-01](../cw/CW-ADDR-01.md) Địa chỉ thường dùng | Dùng địa chỉ cho booking |

## Components (design system)

`Button`, `StatusBadge`, `EntityPicker`, `FormField`, `TextField`, `Select`, `Checkbox`, `Textarea`, `DescriptionList`, `PageHeader`, `Breadcrumb`, `Banner`, `CustomerShell`, `Logo`

## API (GraphQL)

- `publicMerchant(id)`
- `myAddresses`
- `createBooking(input)`

## Trạng thái UI

- **validation**: Inline danger: thiếu điểm lấy/trả, tên hàng, thời gian lấy, SĐT liên hệ
- **loading**: Nút Gửi yêu cầu loading
- **error**: Banner danger 'Không gửi được yêu cầu' giữ nguyên dữ liệu đã nhập
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Booking KHÔNG tự thành order; operation tiếp nhận và convert ở WM-ORD-03 (có thể sửa giá/điểm/hàng).
- Lưu snapshot địa chỉ vào booking; sửa sổ địa chỉ sau đó không đổi booking.
- Mã tự sinh BK-YYYYMM-0001 theo merchant.
- Picker địa chỉ mở CW-ADDR-01 ở chế độ chọn (drawer/modal).
