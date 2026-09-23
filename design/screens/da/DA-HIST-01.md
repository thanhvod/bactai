# DA-HIST-01 — Lịch sử chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Tài khoản & tiền |
| Route | `DriverHistoryRoute` |
| Pattern | `list` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-HIST-01.html](../../mockups/DA-HIST-01.html) · canvas artboard `DA-HIST-01.dc.html` |

## Mục đích

Xem lại chuyến đã hoàn thành/hủy với POD, COD, thưởng.

## Dữ liệu hiển thị

- `code`
- `completedAt`
- `route`
- `status`
- `podCount`
- `codSummary`
- `bonus`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở chuyến (chỉ xem) | own trip |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến CX-202609-0009 (chỉ xem) | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở chuyến CX-202609-0008 (chỉ xem) | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở chuyến CX-202609-0007 (chỉ xem) | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Quay lại | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | back |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-MONEY-01](../da/DA-MONEY-01.md) Thưởng & khoản ứng của tôi | Xem lịch sử chuyến |
| [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | Lịch sử chuyến |

## Components (design system)

`SegmentedControl`, `TripCard`, `StatusBadge`, `MobileHeader`

## API (GraphQL)

- `driverJobs(filter: {status: [COMPLETED, CANCELLED], period})`

## Trạng thái UI

- **empty**: 'Chưa có chuyến trong tháng'
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.
- **offline**: Banner nhỏ + SyncStatus; thao tác được xếp hàng đợi, không mất dữ liệu.

## Ghi chú implement

- Mở DA-TRIP-01 ở chế độ read-only.
