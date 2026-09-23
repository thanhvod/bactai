# DA-SYNC-01 — Đồng bộ offline

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Đồng bộ & GPS |
| Route | `DriverSyncRoute` |
| Pattern | `list` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-SYNC-01.html](../../mockups/DA-SYNC-01.html) · canvas artboard `DA-SYNC-01.dc.html` |

## Mục đích

Hàng đợi trạng thái/COD/POD/GPS/sự cố chưa gửi; retry và xem lỗi.

## Dữ liệu hiển thị

- `items[{type, entityLabel, capturedAt, status: pending|failed|done, attempts, error}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Thử lại tất cả | driver |
| Thử lại mục lỗi | driver |
| Mở mục | driver |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến của mục trạng thái | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở COD đã nhập | [DA-COD-01](../da/DA-COD-01.md) Nhập COD thực thu | `DriverCodInputRoute(stopId)` | action |
| Mở POD lỗi | [DA-POD-01](../da/DA-POD-01.md) Chụp POD | `DriverPodCaptureRoute(stopId)` | action |
| Mở trạng thái GPS | [DA-GPS-01](../da/DA-GPS-01.md) Theo dõi vị trí nền | `DriverGpsPermissionRoute` | action |
| Mở sự cố đã gửi | [DA-INC-01](../da/DA-INC-01.md) Báo sự cố | `DriverIncidentReportRoute(tripId)` | action |
| Quay lại | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | back |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | Mở hàng đợi đồng bộ |
| [DA-GPS-01](../da/DA-GPS-01.md) Theo dõi vị trí nền | Mở hàng đợi GPS |
| [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | Đồng bộ dữ liệu |

## Components (design system)

`SyncQueue`, `StatusBadge`, `Button`, `OfflineBanner`, `Banner`, `MobileHeader`, `PrimaryBottomAction`

## API (GraphQL)

- `local: syncQueue (drift/sqlite)`
- `replay: driverUpdateTripStatus / driverUpdateStopStatus / driverSubmitCod / uploads / gps batch / driverReportIncident`

## Trạng thái UI

- **empty**: 'Tất cả dữ liệu đã đồng bộ' + thời điểm
- **offline**: OfflineBanner (mockup)
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Gửi theo thứ tự ghi nhận (FIFO) với idempotencyKey.
- Không cho đăng xuất mất dữ liệu: cảnh báo khi còn mục chờ.
