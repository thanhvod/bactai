# MA-TRIP-01 — Danh sách chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Đơn & chuyến |
| Route | `MerchantTripListRoute` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-TRIP-01.html](../../mockups/MA-TRIP-01.html) · canvas artboard `MA-TRIP-01.dc.html` |

## Mục đích

Theo dõi chuyến hôm nay / đang chạy / sắp chạy và cảnh báo lịch.

## Dữ liệu hiển thị

- `code`
- `order.code`
- `routeSummary`
- `vehicle.plate`
- `driver.name`
- `plannedStart`
- `plannedEnd`
- `status`
- `warnings[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở chi tiết chuyến | trip.view |
| Theo dõi xe | trip.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở bản đồ theo dõi xe | [MA-MAP-01](../ma/MA-MAP-01.md) Theo dõi xe | `MerchantMapRoute` | action |
| Chuyển sang Đơn | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | action |
| Mở chi tiết chuyến | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |
| Bottom nav: Tổng quan | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | nav |
| Bottom nav: Đơn/Chuyến | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | nav |
| Bottom nav: Tài chính | [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | `MerchantFinanceRoute` | nav |
| Bottom nav: Báo cáo | [MA-RPT-01](../ma/MA-RPT-01.md) Báo cáo tóm tắt | `MerchantReportsRoute` | nav |
| Bottom nav: Tài khoản | [MA-PROFILE-01](../ma/MA-PROFILE-01.md) Tài khoản & cài đặt nhẹ | `MerchantProfileRoute` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | KPI chuyến đang chạy → danh sách chuyến |
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | Xem tất cả chuyến |
| [MA-NOTI-01](../ma/MA-NOTI-01.md) Thông báo | Mở danh sách chuyến (cảnh báo lịch) |
| [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | Chuyển sang Chuyến |
| [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | Quay lại |
| [MA-MAP-01](../ma/MA-MAP-01.md) Theo dõi xe | Quay lại |

## Components (design system)

`IconButton`, `MobileHeader`, `SegmentedControl`, `FilterChip`, `StatusBadge`, `BottomNav`

## API (GraphQL)

- `trips(filter: {date, status, hasWarning}, sort: plannedStart, first, after)`

## Trạng thái UI

- **loading**: Skeleton card
- **empty**: EmptyState 'Không có chuyến trong ngày'
- **error**: Banner danger + Thử lại
