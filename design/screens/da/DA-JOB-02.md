# DA-JOB-02 — Lịch chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Hôm nay & lịch chuyến |
| Route | `DriverJobCalendarRoute` |
| Pattern | `mobile` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-JOB-02.html](../../mockups/DA-JOB-02.html) · canvas artboard `DA-JOB-02.dc.html` |

## Mục đích

Xem công việc theo lịch tháng/tuần; chọn ngày → danh sách chuyến ngày đó.

## Dữ liệu hiển thị

- `daysWithTrips{date, statuses[]}`
- `selectedDay.trips[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Chọn ngày | driver |
| Mở chuyến | own trip |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xem dạng danh sách | [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | `DriverJobListRoute` | action |
| Chọn ngày → mở chuyến CX-202609-0001 | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Chọn ngày → mở chuyến CX-202609-0002 | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Quay lại | [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | `DriverJobListRoute` | back |
| Bottom nav: Hôm nay | [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | `DriverHomeRoute` | nav |
| Bottom nav: Chuyến | [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | `DriverJobListRoute` | nav |
| Bottom nav: Thông báo | [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | `DriverNotificationsRoute` | nav |
| Bottom nav: Tài khoản | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | Mở lịch chuyến |

## Components (design system)

`Calendar`, `IconButton`, `Button`, `SegmentedControl`, `TripCard`, `StatusBadge`, `MobileHeader`, `BottomNav`

## API (GraphQL)

- `driverJobs(filter: {from, to})`

## Trạng thái UI

- **empty**: Ngày không có chuyến → 'Không có chuyến ngày này'
- **loading**: Calendar skeleton
- **error**: Nói rõ lỗi gì, có thử lại được không.
- **offline**: Banner nhỏ + SyncStatus; thao tác được xếp hàng đợi, không mất dữ liệu.

## Ghi chú implement

- Chấm màu theo trạng thái chuyến trong ngày (accent đang chạy, neutral sắp tới, success hoàn thành, danger hủy).
- Ô ngày 48dp; mặc định chọn hôm nay.
