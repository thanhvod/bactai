# DA-GPS-01 — Theo dõi vị trí nền

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Đồng bộ & GPS |
| Route | `DriverGpsPermissionRoute` |
| Pattern | `mobile` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-GPS-01.html](../../mockups/DA-GPS-01.html) · canvas artboard `DA-GPS-01.dc.html` |

## Mục đích

Trạng thái quyền vị trí & tracking; cảnh báo khi tắt quyền làm chuyến không gửi được vị trí.

## Dữ liệu hiển thị

- `permission: always|whileInUse|denied`
- `preciseLocation`
- `batteryOptimization`
- `activeTrip`
- `lastSentAt`
- `bufferedPoints`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở cài đặt vị trí | OS settings |
| Kiểm tra lại | driver |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến đang chạy | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở hàng đợi GPS | [DA-SYNC-01](../da/DA-SYNC-01.md) Đồng bộ offline | `DriverSyncRoute` | action |
| Quay lại | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | back |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Trạng thái GPS của chuyến |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Trạng thái GPS của chuyến |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Trạng thái GPS của chuyến |
| [DA-SYNC-01](../da/DA-SYNC-01.md) Đồng bộ offline | Mở trạng thái GPS |
| [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | Vị trí & GPS |

## Components (design system)

`Banner`, `StatusBadge`, `IconButton`, `Button`, `MobileHeader`, `PrimaryBottomAction`

## API (GraphQL)

- `POST /driver/gps/batch`
- `local: permission_handler + background location service`

## Trạng thái UI

- **ok**: Quyền 'Luôn cho phép' → Banner success 'Đang gửi vị trí'
- **off**: Banner danger (mockup)
- **no-trip**: Không có chuyến đang chạy → 'Không theo dõi vị trí'
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.
- **offline**: Banner nhỏ + SyncStatus; thao tác được xếp hàng đợi, không mất dữ liệu.

## Ghi chú implement

- Chỉ tracking khi có chuyến đang chạy (từ Bắt đầu đi lấy đến Hoàn thành). Không gửi GPS ngoài chuyến.
- GPS buffer offline, gửi bù theo batch; backend kiểm tra driver sở hữu trip.
