# CW-MER-01 — Hồ sơ nhà xe

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Tìm nhà xe |
| Route | `/merchants/:merchantId` |
| Pattern | `detail` |
| Roles | customer, guest |
| Kích thước mockup | 1440×1120 |
| Mockup | [../../mockups/CW-MER-01.html](../../mockups/CW-MER-01.html) · canvas artboard `CW-MER-01.dc.html` |

## Mục đích

Xem thông tin công khai của nhà xe (giới thiệu, liên hệ, dịch vụ, loại xe, lưu ý) trước khi gửi yêu cầu.

## Dữ liệu hiển thị

- `name`
- `intro`
- `serviceAreas[]`
- `routes[]`
- `services[{name, description, note}]`
- `vehicleTypes[{type, capacity, fit}]`
- `contact{phone, email, address, hours}`
- `notes[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Gửi yêu cầu vận chuyển | customer → CW-BOOK-01?merchantId= |
| Gọi điều phối | public (tel:) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Gửi yêu cầu vận chuyển | [CW-BOOK-01](../cw/CW-BOOK-01.md) Tạo booking/yêu cầu vận chuyển | `/bookings/new` | action |
| Xem đơn với nhà xe này | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | action |
| Xem booking đang chờ | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | action |
| Xem bảng kê của nhà xe | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | action |
| Breadcrumb Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | Mở hồ sơ nhà xe BTA Demo Transport |
| [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | Xem hồ sơ nhà xe |
| [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | Mở hồ sơ nhà xe |
| [CW-BOOK-01](../cw/CW-BOOK-01.md) Tạo booking/yêu cầu vận chuyển | Xem hồ sơ nhà xe |
| [CW-BOOK-01](../cw/CW-BOOK-01.md) Tạo booking/yêu cầu vận chuyển | Hủy → quay lại hồ sơ nhà xe |
| [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | Mở hồ sơ nhà xe |
| [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | Mở hồ sơ nhà xe |
| [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | Liên hệ nhà xe |
| [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | Mở hồ sơ nhà xe |

## Components (design system)

`StatusBadge`, `Button`, `DataTable`, `DescriptionList`, `Banner`, `Breadcrumb`, `CustomerShell`, `Logo`

## API (GraphQL)

- `publicMerchant(id)`
- `myMerchantRelationship(merchantId)`

## Trạng thái UI

- **loading**: Skeleton header + panels
- **error**: Nhà xe không công khai / không tồn tại → EmptyState + quay lại Tìm nhà xe
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Khối 'Bạn và nhà xe này' chỉ hiện khi khách đã liên kết với merchant (customer record CUS-A-003).
- Không hiển thị giá cước cố định — giá do nhà xe xác nhận trên từng yêu cầu.
