# DA-NOTI-01 — Thông báo

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Hôm nay & lịch chuyến |
| Route | `DriverNotificationsRoute` |
| Pattern | `list` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-NOTI-01.html](../../mockups/DA-NOTI-01.html) · canvas artboard `DA-NOTI-01.dc.html` |

## Mục đích

Chuyến mới, thay đổi chuyến, yêu cầu xử lý, cảnh báo COD; mở chuyến/điểm liên quan.

## Dữ liệu hiển thị

- `type`
- `title`
- `body`
- `createdAt`
- `read`
- `target{tripId|stopId}`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở thông báo | driver |
| Đọc hết | driver |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến mới được giao | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở điểm dừng cần xử lý | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | action |
| Mở khoản COD | [DA-MONEY-01](../da/DA-MONEY-01.md) Thưởng & khoản ứng của tôi | `DriverMoneyRoute` | action |
| Mở chuyến thay đổi | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở chuyến có sự cố | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Bottom nav: Hôm nay | [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | `DriverHomeRoute` | nav |
| Bottom nav: Chuyến | [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | `DriverJobListRoute` | nav |
| Bottom nav: Thông báo | [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | `DriverNotificationsRoute` | nav |
| Bottom nav: Tài khoản | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | nav |

## Điều hướng đến (incoming)

- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.

## Components (design system)

`NotificationItem`, `SegmentedControl`, `Button`, `MobileHeader`, `BottomNav`

## API (GraphQL)

- `notifications(filter: {recipient: me})`
- `markNotificationRead(id)`
- `markAllNotificationsRead`

## Trạng thái UI

- **empty**: 'Chưa có thông báo'
- **loading**: Skeleton rows
- **error**: Nói rõ lỗi gì, có thử lại được không.
- **offline**: Banner nhỏ + SyncStatus; thao tác được xếp hàng đợi, không mất dữ liệu.

## Ghi chú implement

- Push notification mở thẳng route đích.
- Không hiển thị cảnh báo tài chính công ty.
