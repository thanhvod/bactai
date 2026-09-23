# MA-ORD-02 — Chi tiết đơn

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Đơn & chuyến |
| Route | `MerchantOrderDetailRoute(orderId)` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×1220 |
| Mockup | [../../mockups/MA-ORD-02.html](../../mockups/MA-ORD-02.html) · canvas artboard `MA-ORD-02.dc.html` |

## Mục đích

Xem nhanh một đơn: tổng quan, điểm dừng, chuyến, tài chính tóm tắt, chứng từ. Sửa chi tiết mở trên web.

## Dữ liệu hiển thị

- `code`
- `status`
- `warnings[]`
- `customer{id, name, phone}`
- `stops[]`
- `cargoSummary`
- `trips[]`
- `financeSummary{totalAmount, allocatedAmount, remainingAmount, dueDate, expenseAmount, profitEstimate}`
- `attachments[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Gọi khách | tel: customer.phone |
| Xem chuyến | trip.view |
| Xác nhận đơn (khi Chờ xác nhận) | order.update |
| Mở trên web để chỉnh | deep link /orders/:orderId |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | back |
| Mở khách hàng | [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | `MerchantCustomerDetailRoute(customerId)` | action |
| Mở chuyến CX-202609-0001 | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |
| Mở tài chính nhanh | [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | `MerchantFinanceRoute` | action |
| Mở đơn trên Web Merchant | WM-ORD-02 | | action |
| Xem chuyến của đơn | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-NOTI-01](../ma/MA-NOTI-01.md) Thông báo | Mở đơn quá hạn |
| [MA-NOTI-01](../ma/MA-NOTI-01.md) Thông báo | Mở đơn chờ xác nhận |
| [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | Mở chi tiết đơn |
| [MA-ORD-03](../ma/MA-ORD-03.md) Tạo nhanh đơn | Tạo đơn → chi tiết đơn |
| [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | Mở đơn của chuyến |
| [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | Mở đơn DH-202609-0001 |
| [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | Mở đơn DH-202609-0009 |
| [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | Mở đơn DH-202608-0009 |

## Components (design system)

`IconButton`, `MobileHeader`, `StatusBadge`, `ListRow`, `Banner`, `Button`, `PrimaryBottomAction`

## API (GraphQL)

- `order(id){status, customer, stops, cargoLines, trips, financeSummary, attachments}`

## Trạng thái UI

- **loading**: Skeleton header + sections
- **error**: Không tìm thấy / không có quyền → EmptyState + Quay lại
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Trang cuộn; mockup cao 1220 thể hiện toàn bộ nội dung.
- Đổi trạng thái nhẹ (Chờ xác nhận → Đã xác nhận) hiện ở bottom bar thay 'Xem chuyến' khi đơn chưa xác nhận.
- Sửa giá / hủy đơn là sensitive — chỉ làm trên web (WM-ORD-08).
