# DA-JOB-01 — Danh sách chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Hôm nay & lịch chuyến |
| Route | `DriverJobListRoute` |
| Pattern | `list` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-JOB-01.html](../../mockups/DA-JOB-01.html) · canvas artboard `DA-JOB-01.dc.html` |

## Mục đích

Danh sách chuyến được giao theo ngày/trạng thái, filter đơn giản.

## Dữ liệu hiển thị

- `code`
- `routeSummary`
- `plannedWindow`
- `status`
- `vehicle.plate`
- `codExpected`
- `pendingSyncCount`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở chuyến | own trip |
| Xem lịch | driver |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến CX-202609-0001 | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở chuyến CX-202609-0002 | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở chuyến sắp tới CX-202609-0010 | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở lịch chuyến | [DA-JOB-02](../da/DA-JOB-02.md) Lịch chuyến | `DriverJobCalendarRoute` | action |
| Bottom nav: Hôm nay | [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | `DriverHomeRoute` | nav |
| Bottom nav: Chuyến | [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | `DriverJobListRoute` | nav |
| Bottom nav: Thông báo | [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | `DriverNotificationsRoute` | nav |
| Bottom nav: Tài khoản | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | Xem tất cả chuyến |
| [DA-JOB-02](../da/DA-JOB-02.md) Lịch chuyến | Xem dạng danh sách |
| [DA-JOB-02](../da/DA-JOB-02.md) Lịch chuyến | Quay lại |

## Components (design system)

`StatusBadge`, `MoneyText`, `TripCard`, `SegmentedControl`, `IconButton`, `Button`, `MobileHeader`, `BottomNav`

## API (GraphQL)

- `driverJobs(filter: {bucket: TODAY|UPCOMING|RUNNING|DONE})`

## Trạng thái UI

- **empty**: EmptyState theo filter, ví dụ 'Không có chuyến sắp tới'
- **loading**: Skeleton TripCard ×3
- **offline**: Hiển thị dữ liệu cache gần nhất + OfflineBanner; thao tác ghi vào hàng đợi (DA-SYNC-01).
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Filter: Hôm nay · Sắp tới · Đang chạy · Hoàn thành (SegmentedControl 48dp). Không filter phức tạp.
- Không có nút 'nhận việc'.
- Badge sync khi chuyến có mục chờ gửi.
