# MA-ORD-01 — Danh sách đơn

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Đơn & chuyến |
| Route | `MerchantOrderListRoute` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-ORD-01.html](../../mockups/MA-ORD-01.html) · canvas artboard `MA-ORD-01.dc.html` |

## Mục đích

Tìm/lọc đơn, xem trạng thái và công nợ; điểm vào tạo nhanh đơn và chi tiết đơn. Segmented Đơn/Chuyến trong tab Đơn/Chuyến.

## Dữ liệu hiển thị

- `code`
- `customer.name`
- `routeSummary`
- `status`
- `remainingAmount`
- `dueDate`
- `overdueDays`
- `warnings[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo nhanh (FAB) | order.create — ẩn nếu không có quyền |
| Mở chi tiết | order.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở danh sách khách hàng | [MA-CUS-01](../ma/MA-CUS-01.md) Khách hàng | `MerchantCustomerListRoute` | action |
| Chuyển sang Chuyến | [MA-TRIP-01](../ma/MA-TRIP-01.md) Danh sách chuyến | `MerchantTripListRoute` | action |
| Mở chi tiết đơn | [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | `MerchantOrderDetailRoute(orderId)` | action |
| Tạo nhanh đơn | [MA-ORD-03](../ma/MA-ORD-03.md) Tạo nhanh đơn | `MerchantQuickOrderCreateRoute` | action |
| Bottom nav: Tổng quan | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | nav |
| Bottom nav: Đơn/Chuyến | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | nav |
| Bottom nav: Tài chính | [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | `MerchantFinanceRoute` | nav |
| Bottom nav: Báo cáo | [MA-RPT-01](../ma/MA-RPT-01.md) Báo cáo tóm tắt | `MerchantReportsRoute` | nav |
| Bottom nav: Tài khoản | [MA-PROFILE-01](../ma/MA-PROFILE-01.md) Tài khoản & cài đặt nhẹ | `MerchantProfileRoute` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | KPI đơn chưa xếp xe → danh sách đơn |
| [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | Quay lại |
| [MA-ORD-03](../ma/MA-ORD-03.md) Tạo nhanh đơn | Hủy tạo đơn |
| [MA-TRIP-01](../ma/MA-TRIP-01.md) Danh sách chuyến | Chuyển sang Đơn |

## Components (design system)

`IconButton`, `MobileHeader`, `SegmentedControl`, `SearchField`, `FilterChip`, `StatusBadge`, `FloatingActionButton`, `BottomNav`

## API (GraphQL)

- `orders(filter: {search, status, warning}, sort, first, after)`

## Trạng thái UI

- **loading**: Skeleton card
- **empty**: EmptyState 'Không có đơn phù hợp' + Xoá bộ lọc
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Infinite scroll (first: 20, cursor).
- Chip map sang filter.status / filter.warning như WM-ORD-01.
- Tab Đơn/Chuyến giữ state bộ lọc riêng từng segment.
