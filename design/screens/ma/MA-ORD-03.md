# MA-ORD-03 — Tạo nhanh đơn

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Đơn & chuyến |
| Route | `MerchantQuickOrderCreateRoute` |
| Pattern | `form` |
| Roles | admin, operation |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-ORD-03.html](../../mockups/MA-ORD-03.html) · canvas artboard `MA-ORD-03.dc.html` |

## Mục đích

Tạo order tối thiểu: khách, điểm đi/đến, giá cước, ghi chú hàng, hạn thanh toán. Phần chi tiết chỉnh trên web.

## Dữ liệu hiển thị

- `customerId`
- `pickupLocation`
- `dropoffLocation`
- `freightAmount`
- `cargoNote`
- `dueDate`
- `status (DRAFT|CONFIRMED)`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo đơn | order.create (accountant chỉ khi được cấp) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Hủy tạo đơn | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | back |
| Tạo đơn → chi tiết đơn | [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | `MerchantOrderDetailRoute(orderId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | Lối tắt tạo nhanh đơn |
| [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | Tạo nhanh đơn |
| [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | Tạo đơn cho khách |

## Components (design system)

`MobileHeader`, `EntityPicker`, `FormField`, `MoneyInput`, `DateField`, `Textarea`, `RadioGroup`, `Banner`, `PrimaryBottomAction`, `Button`

## API (GraphQL)

- `customers(filter: {search})`
- `customerLocations(customerId)`
- `createOrder(input)`

## Trạng thái UI

- **validation**: Lỗi inline dưới field (khách, điểm đi, điểm đến, giá cước > 0, hạn TT)
- **warning**: Khách nợ quá hạn / vượt hạn mức = dòng cảnh báo vàng, không chặn
- **submitting**: Nút 'Tạo đơn' loading, chặn double-submit
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Hạn thanh toán gợi ý = hôm nay + customer.debtDays.
- Điểm đi/đến chọn từ sổ địa chỉ khách hoặc nhập mới (bottom sheet).
- Sau tạo → MerchantOrderDetailRoute(orderId) thay thế route hiện tại.
