# CW-ORD-02 — Chi tiết đơn khách

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Đơn hàng & công nợ |
| Route | `/orders/:orderId` |
| Pattern | `detail` |
| Roles | customer |
| Kích thước mockup | 1440×1080 |
| Mockup | [../../mockups/CW-ORD-02.html](../../mockups/CW-ORD-02.html) · canvas artboard `CW-ORD-02.dc.html` |

## Mục đích

Theo dõi đơn customer-safe: trạng thái, tiến trình chuyến, điểm lấy/trả, POD được chia sẻ, tiền phải trả/đã trả, tải chứng từ.

## Dữ liệu hiển thị

- `code`
- `status`
- `merchant`
- `booking.code?`
- `trip{code, plate, vehicleType, driverName, status, lastUpdateAt}`
- `stops[{type, place, contact, plannedAt, actualAt, status}]`
- `cargo`
- `pricingLines[freight, addons]`
- `totalAmount`
- `paidAmount`
- `remainingAmount`
- `dueDate`
- `sharedAttachments[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tải phiếu giao hàng / chứng từ | customer · chỉ attachment shared=true |
| Xem bảng kê | → CW-DEBT-01 |
| Liên hệ nhà xe | → CW-MER-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở hồ sơ nhà xe | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | action |
| Mở booking gốc | [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | `/bookings/:bookingId` | action |
| Xem bảng kê chứa đơn | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | action |
| Liên hệ nhà xe | [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | `/merchants/:merchantId` | action |
| Mở bảng kê chứa đơn | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | action |
| Breadcrumb Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | Mở đơn đã tạo từ booking |
| [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | Xem đơn hàng đã tạo |
| [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | Mở đơn liên kết |
| [CW-BOOK-03](../cw/CW-BOOK-03.md) Chi tiết booking | Mở đơn từ timeline |
| [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | Click mã đơn → chi tiết |
| [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | Mở đơn trong bảng kê |
| [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | Thông báo: Mở đơn |
| [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | Thông báo: Xem POD |

## Components (design system)

`StatusBadge`, `Button`, `SummaryStrip`, `Stepper`, `DescriptionList`, `DataTable`, `DueIndicator`, `AttachmentList`, `IconButton`, `Breadcrumb`, `CustomerShell`, `Logo`

## API (GraphQL)

- `myOrder(id){status, stops, cargo, tripProgress, pricingLines, paidAmount, dueDate, statement{code}, sharedAttachments}`
- `attachmentDownloadUrl(id)`

## Trạng thái UI

- **loading**: Skeleton header + panels
- **error**: Không phải đơn của mình → EmptyState 403
- **empty**: Chưa có chứng từ chia sẻ → dòng muted

## Ghi chú implement

- Mockup vẽ DH-202609-0008 (đang trả hàng, có POD điểm lấy) vì DH-202609-0012 còn Chờ xác nhận; cùng layout.
- Không lộ: chi phí, lãi/lỗ, COD tài xế, ghi chú nội bộ, SĐT tài xế.
- Mã chuyến hiển thị text, không link (khách không có màn hình chuyến).
