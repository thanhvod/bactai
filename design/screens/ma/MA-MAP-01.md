# MA-MAP-01 — Theo dõi xe

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Đơn & chuyến |
| Route | `MerchantMapRoute` |
| Pattern | `page` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-MAP-01.html](../../mockups/MA-MAP-01.html) · canvas artboard `MA-MAP-01.dc.html` |

## Mục đích

Vị trí cuối (last known) của xe đang chạy trên bản đồ + danh sách xe.

## Dữ liệu hiển thị

- `vehicle.plate`
- `trip.code`
- `driver.name`
- `tripStatus`
- `lastLocation{lat, lng, at, address}`
- `warnings[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Chạm xe / pin → chi tiết chuyến | trip.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [MA-TRIP-01](../ma/MA-TRIP-01.md) Danh sách chuyến | `MerchantTripListRoute` | back |
| Mở chuyến của xe 51C-123.45 | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |
| Mở chuyến của xe 51D-678.90 | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | Lối tắt bản đồ xe |
| [MA-TRIP-01](../ma/MA-TRIP-01.md) Danh sách chuyến | Mở bản đồ theo dõi xe |
| [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | Xem xe trên bản đồ |

## Components (design system)

`MobileHeader`, `MapView`, `FilterChip`, `StatusBadge`

## API (GraphQL)

- `vehicleLastLocations(filter: {running: true})`
- `trips(filter: {status: RUNNING})`

## Trạng thái UI

- **stale**: Vị trí > 15 phút: badge 'Mất tín hiệu' màu warning
- **empty**: Không có xe đang chạy
- **error**: Không tải được bản đồ → vẫn hiện danh sách
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.

## Ghi chú implement

- Map SDK (google_maps_flutter); không realtime, refresh 60s hoặc pull-to-refresh.
- Chip 'Tất cả xe' hiện cả xe rảnh (không mở chuyến).
