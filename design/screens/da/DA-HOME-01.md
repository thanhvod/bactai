# DA-HOME-01 — Trang chủ công việc

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Hôm nay & lịch chuyến |
| Route | `DriverHomeRoute` |
| Pattern | `mobile` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-HOME-01.html](../../mockups/DA-HOME-01.html) · canvas artboard `DA-HOME-01.dc.html` |

## Mục đích

Mở app là biết nên làm gì: chuyến đang chạy/tiếp theo, trạng thái đồng bộ, cảnh báo COD, chuyến hôm nay.

## Dữ liệu hiển thị

- `activeTrip{code, status, route, vehicle, plannedWindow, nextStop, codExpected, openIncident}`
- `todayTrips[]`
- `codReminder`
- `syncStatus`
- `unreadNotifications`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở chuyến đang chạy | own trip |
| Xem tất cả chuyến | driver |
| Mở hàng đợi đồng bộ | driver |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến đang chạy | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Cảnh báo COD → Thưởng & khoản ứng | [DA-MONEY-01](../da/DA-MONEY-01.md) Thưởng & khoản ứng của tôi | `DriverMoneyRoute` | action |
| Mở chuyến CX-202609-0002 (15:00) | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Mở hàng đợi đồng bộ | [DA-SYNC-01](../da/DA-SYNC-01.md) Đồng bộ offline | `DriverSyncRoute` | action |
| Xem tất cả chuyến | [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | `DriverJobListRoute` | action |
| Mở hồ sơ | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | action |
| Bottom nav: Hôm nay | [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | `DriverHomeRoute` | nav |
| Bottom nav: Chuyến | [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | `DriverJobListRoute` | nav |
| Bottom nav: Thông báo | [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | `DriverNotificationsRoute` | nav |
| Bottom nav: Tài khoản | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-AUTH-01](../da/DA-AUTH-01.md) Splash/kiểm tra phiên | Tự động: có phiên hợp lệ → Trang chủ |
| [DA-AUTH-02](../da/DA-AUTH-02.md) Đăng nhập tài xế | Đăng nhập thành công → Trang chủ |
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Quay lại |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Quay lại |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Quay lại |

## Components (design system)

`StatusBadge`, `MoneyText`, `Button`, `TripCard`, `SyncStatus`, `IconButton`, `MobileHeader`, `BottomNav`

## API (GraphQL)

- `driverMe`
- `driverJobs(filter: {date: today})`
- `local: syncQueue.count`

## Trạng thái UI

- **empty**: Không có chuyến hôm nay → EmptyState 'Hôm nay chưa có chuyến' + chuyến sắp tới gần nhất
- **loading**: Skeleton TripCard
- **offline**: Hiển thị dữ liệu cache gần nhất + OfflineBanner; thao tác ghi vào hàng đợi (DA-SYNC-01).
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Primary: có chuyến đang chạy → 'Mở chuyến đang chạy'; chỉ có chuyến sắp tới → 'Xem chuyến'.
- Không có nút nhận việc (phase 1: điều phối giao là tài xế nhận).
- Pull-to-refresh.
