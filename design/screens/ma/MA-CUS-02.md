# MA-CUS-02 — Chi tiết khách

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Khách hàng |
| Route | `MerchantCustomerDetailRoute(customerId)` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×940 |
| Mockup | [../../mockups/MA-CUS-02.html](../../mockups/MA-CUS-02.html) · canvas artboard `MA-CUS-02.dc.html` |

## Mục đích

Công nợ, đơn gần đây, địa chỉ, số dư; gọi khách và tạo đơn nhanh cho khách.

## Dữ liệu hiển thị

- `name`
- `code`
- `phone`
- `debtAmount`
- `overdueAmount`
- `creditLimit`
- `debtDays`
- `creditBalance`
- `recentOrders[]`
- `locations[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Gọi khách | tel: |
| Tạo đơn | order.create → MA-ORD-03 với customerId |
| Công nợ chi tiết trên web | debt.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [MA-CUS-01](../ma/MA-CUS-01.md) Khách hàng | `MerchantCustomerListRoute` | back |
| Mở công nợ khách trên Web Merchant | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Mở đơn DH-202609-0001 | [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | `MerchantOrderDetailRoute(orderId)` | action |
| Mở đơn DH-202609-0009 | [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | `MerchantOrderDetailRoute(orderId)` | action |
| Mở đơn DH-202608-0009 | [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | `MerchantOrderDetailRoute(orderId)` | action |
| Tạo đơn cho khách | [MA-ORD-03](../ma/MA-ORD-03.md) Tạo nhanh đơn | `MerchantQuickOrderCreateRoute` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | Mở khách hàng |
| [MA-CUS-01](../ma/MA-CUS-01.md) Khách hàng | Mở chi tiết khách |
| [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | Mở khách Công ty Gạo Miền Tây |
| [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | Mở khách Vật liệu Xây dựng Phú Mỹ |

## Components (design system)

`IconButton`, `MobileHeader`, `StatusBadge`, `Button`, `PrimaryBottomAction`

## API (GraphQL)

- `customer(id){debtSummary, locations, recentOrders(first: 5)}`

## Trạng thái UI

- **loading**: Skeleton
- **error**: Không tìm thấy / không có quyền
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Tạo đơn truyền customerId → form Tạo nhanh đơn điền sẵn khách.
- Trang cuộn; mockup cao 940.
