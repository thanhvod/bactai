# MA-CUS-01 — Khách hàng

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Khách hàng |
| Route | `MerchantCustomerListRoute` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-CUS-01.html](../../mockups/MA-CUS-01.html) · canvas artboard `MA-CUS-01.dc.html` |

## Mục đích

Tìm khách, xem công nợ/quá hạn/số dư; gọi khách, mở chi tiết.

## Dữ liệu hiển thị

- `code`
- `name`
- `phone`
- `debtAmount`
- `overdueAmount`
- `creditBalance`
- `creditLimitWarning`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở chi tiết khách | customer.view |
| Gọi khách (vuốt/giữ) | tel: |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | back |
| Mở chi tiết khách | [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | `MerchantCustomerDetailRoute(customerId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | Lối tắt khách hàng |
| [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | Mở danh sách khách hàng |
| [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | Quay lại |
| [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | KPI nợ quá hạn → khách hàng |
| [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | Mở danh sách khách hàng |

## Components (design system)

`MobileHeader`, `SearchField`, `FilterChip`, `StatusBadge`

## API (GraphQL)

- `customers(filter: {search, debtStatus}, first, after){debtSummary}`

## Trạng thái UI

- **loading**: Skeleton
- **empty**: EmptyState 'Không tìm thấy khách'
- **error**: Banner danger + Thử lại
