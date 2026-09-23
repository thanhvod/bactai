# CW-ADDR-01 — Địa chỉ thường dùng

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Tài khoản |
| Route | `/addresses` |
| Pattern | `list` |
| Roles | customer |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/CW-ADDR-01.html](../../mockups/CW-ADDR-01.html) · canvas artboard `CW-ADDR-01.dc.html` |

## Mục đích

Sổ địa chỉ kho/điểm lấy/trả với người liên hệ, SĐT, ghi chú; thêm/sửa trong drawer; dùng khi tạo booking.

## Dữ liệu hiển thị

- `name`
- `address`
- `geo?`
- `usage (pickup|drop|both)`
- `contactName`
- `contactPhone`
- `note`
- `isDefaultPickup`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Thêm địa chỉ | customer → drawer |
| Sửa (menu dòng) | customer → drawer |
| Xóa địa chỉ | customer; confirm dialog |
| Lưu địa chỉ | customer → danh sách |
| Tạo yêu cầu vận chuyển | → CW-BOOK-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Đóng drawer | [CW-ADDR-01](../cw/CW-ADDR-01.md) Địa chỉ thường dùng | `/addresses` | action |
| Lưu địa chỉ → danh sách | [CW-ADDR-01](../cw/CW-ADDR-01.md) Địa chỉ thường dùng | `/addresses` | action |
| Đóng | [CW-ADDR-01](../cw/CW-ADDR-01.md) Địa chỉ thường dùng | `/addresses` | action |
| Dùng địa chỉ cho booking | [CW-BOOK-01](../cw/CW-BOOK-01.md) Tạo booking/yêu cầu vận chuyển | `/bookings/new` | action |
| Breadcrumb Hồ sơ khách hàng | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-BOOK-01](../cw/CW-BOOK-01.md) Tạo booking/yêu cầu vận chuyển | Chọn từ địa chỉ thường dùng |
| [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | Mở địa chỉ thường dùng |
| [CW-ADDR-01](../cw/CW-ADDR-01.md) Địa chỉ thường dùng | Đóng drawer |
| [CW-ADDR-01](../cw/CW-ADDR-01.md) Địa chỉ thường dùng | Lưu địa chỉ → danh sách |
| [CW-ADDR-01](../cw/CW-ADDR-01.md) Địa chỉ thường dùng | Đóng |

## Components (design system)

`TextField`, `FormField`, `Textarea`, `MapView`, `RadioGroup`, `Checkbox`, `Button`, `Drawer`, `IconButton`, `StatusBadge`, `Menu`, `PageHeader`, `Breadcrumb`, `FilterBar`, `FilterChip`, `Pagination`, `DataTable`, `CustomerShell`, `Logo`

## API (GraphQL)

- `myAddresses`
- `createMyAddress(input)`
- `updateMyAddress(id, input)`
- `deleteMyAddress(id)`

## Trạng thái UI

- **loading**: DataTable skeleton
- **empty**: EmptyState 'Chưa có địa chỉ thường dùng' + 'Thêm địa chỉ'
- **validation**: Inline danger: thiếu tên/địa chỉ/SĐT
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Mockup vẽ drawer 'Sửa địa chỉ' mở trên danh sách (dòng Kho Thuận An được chọn).
- Khi mở từ CW-BOOK-01, trang ở chế độ chọn: click dòng → điền vào điểm lấy/trả và quay lại form.
- Booking lưu snapshot địa chỉ; sửa/xóa ở đây không ảnh hưởng booking/đơn đã gửi.
