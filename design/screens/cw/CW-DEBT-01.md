# CW-DEBT-01 — Bảng kê/công nợ của tôi

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Khách hàng (phase 3) — React + Vite (apps/customer-web, phase 3) |
| Module | Đơn hàng & công nợ |
| Route | `/debt-statements` |
| Pattern | `list` |
| Roles | customer |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/CW-DEBT-01.html](../../mockups/CW-DEBT-01.html) · canvas artboard `CW-DEBT-01.dc.html` |

## Mục đích

Bảng kê nhà xe đã chốt và gửi (snapshot), tổng còn phải trả, tải PDF để đối chiếu.

## Dữ liệu hiển thị

- `code (CN-YYYYMM-0001)`
- `periodFrom/To`
- `sentAt`
- `orderCount`
- `total`
- `paid`
- `remaining`
- `status`
- `lines[{orderDate, orderCode, route, total, paid, remaining, dueDate, overdueDays}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tải PDF | customer · chỉ statement Đã chốt/Đã gửi và shared |
| Mở đơn trong bảng kê | → CW-ORD-02 |
| Xem đơn còn phải trả | → CW-ORD-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở đơn trong bảng kê | [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | `/orders/:orderId` | action |
| Mở lịch sử đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | action |
| Xem đơn còn phải trả | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | action |
| Top nav: Tìm nhà xe | [CW-HOME-01](../cw/CW-HOME-01.md) Trang khám phá | `/` | nav |
| Top nav: Booking của tôi | [CW-BOOK-02](../cw/CW-BOOK-02.md) Danh sách booking | `/bookings` | nav |
| Top nav: Đơn hàng | [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | `/orders` | nav |
| Top nav: Bảng kê | [CW-DEBT-01](../cw/CW-DEBT-01.md) Bảng kê/công nợ của tôi | `/debt-statements` | nav |
| Chuông thông báo | [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | `/notifications` | nav |
| Menu tài khoản | [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | `/profile` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [CW-MER-01](../cw/CW-MER-01.md) Hồ sơ nhà xe | Xem bảng kê của nhà xe |
| [CW-ORD-01](../cw/CW-ORD-01.md) Lịch sử đơn hàng | Xem bảng kê |
| [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | Xem bảng kê chứa đơn |
| [CW-ORD-02](../cw/CW-ORD-02.md) Chi tiết đơn khách | Mở bảng kê chứa đơn |
| [CW-PROFILE-01](../cw/CW-PROFILE-01.md) Hồ sơ khách hàng | Xem công nợ |
| [CW-NOTI-01](../cw/CW-NOTI-01.md) Thông báo khách | Thông báo: Xem bảng kê |

## Components (design system)

`StatusBadge`, `Button`, `DataTable`, `Banner`, `PageHeader`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `CustomerShell`, `Logo`

## API (GraphQL)

- `myDebtStatements(filter, first, after)`
- `myDebtStatement(id){lines}`
- `debtStatementPdf(id)`
- `myDebtSummary`

## Trạng thái UI

- **loading**: Skeleton KPI + table
- **empty**: EmptyState 'Nhà xe chưa gửi bảng kê nào'
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Chi tiết bảng kê (statement detail) mở inline dưới dòng đã chọn — không có route riêng.
- Số liệu bảng kê là snapshot tại thời điểm chốt; KPI còn phải trả lấy dữ liệu hiện tại.
- Tiền trả trước chưa trừ = số dư (credit) khách, ví dụ PT-202609-0002 3.000.000 đ chưa phân bổ.
