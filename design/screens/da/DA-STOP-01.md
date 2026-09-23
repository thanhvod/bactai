# DA-STOP-01 — Danh sách điểm dừng

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Chuyến & điểm dừng |
| Route | `DriverStopListRoute(tripId)` |
| Pattern | `list` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-STOP-01.html](../../mockups/DA-STOP-01.html) · canvas artboard `DA-STOP-01.dc.html` |

## Mục đích

Stops theo thứ tự với loại lấy/trả, địa chỉ, liên hệ, COD, trạng thái; gọi/chỉ đường nhanh.

## Dữ liệu hiển thị

- `sequence`
- `type`
- `location.name`
- `location.address`
- `contact.name`
- `contact.phone`
- `plannedAt`
- `arrivedAt`
- `completedAt`
- `codExpected`
- `status`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở điểm dừng | own trip |
| Gọi | tel: contact.phone |
| Chỉ đường | mở app bản đồ theo lat/lng |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chi tiết điểm Kho Cần Thơ | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | action |
| Mở chi tiết điểm Kho Bình Dương | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | action |
| Quay lại | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | back |
| Mở điểm tiếp theo | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Mở danh sách điểm dừng |
| [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | Quay lại |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Mở danh sách điểm dừng |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Mở danh sách điểm dừng |

## Components (design system)

`StopCard`, `StatusBadge`, `Button`, `MoneyText`, `MobileHeader`, `PrimaryBottomAction`

## API (GraphQL)

- `driverTrip(id){stops}`

## Trạng thái UI

- **offline**: Hiển thị dữ liệu cache gần nhất + OfflineBanner; thao tác ghi vào hàng đợi (DA-SYNC-01).
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Stop status: Chưa đến · Đã đến · Hoàn thành · Bỏ qua.
- Gọi/Chỉ đường dùng url_launcher (tel:/geo:).
