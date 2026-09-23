# DA-PROFILE-01 — Hồ sơ cá nhân

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Tài khoản & tiền |
| Route | `DriverProfileRoute` |
| Pattern | `mobile` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-PROFILE-01.html](../../mockups/DA-PROFILE-01.html) · canvas artboard `DA-PROFILE-01.dc.html` |

## Mục đích

Thông tin tài xế, lối vào tiền/lịch sử/đồng bộ/GPS, đổi mật khẩu, đăng xuất.

## Dữ liệu hiển thị

- `name`
- `phone`
- `code`
- `merchant.name`
- `defaultVehicle`
- `status`
- `syncPendingCount`
- `gpsPermission`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đổi mật khẩu | tùy auth decision |
| Đăng xuất | cảnh báo nếu còn mục chưa đồng bộ |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Thưởng & khoản ứng của tôi | [DA-MONEY-01](../da/DA-MONEY-01.md) Thưởng & khoản ứng của tôi | `DriverMoneyRoute` | action |
| Lịch sử chuyến | [DA-HIST-01](../da/DA-HIST-01.md) Lịch sử chuyến | `DriverHistoryRoute` | action |
| Đồng bộ dữ liệu | [DA-SYNC-01](../da/DA-SYNC-01.md) Đồng bộ offline | `DriverSyncRoute` | action |
| Vị trí & GPS | [DA-GPS-01](../da/DA-GPS-01.md) Theo dõi vị trí nền | `DriverGpsPermissionRoute` | action |
| Đăng xuất → Đăng nhập | [DA-AUTH-02](../da/DA-AUTH-02.md) Đăng nhập tài xế | `DriverLoginRoute` | action |
| Bottom nav: Hôm nay | [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | `DriverHomeRoute` | nav |
| Bottom nav: Chuyến | [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | `DriverJobListRoute` | nav |
| Bottom nav: Thông báo | [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | `DriverNotificationsRoute` | nav |
| Bottom nav: Tài khoản | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | Mở hồ sơ |
| [DA-GPS-01](../da/DA-GPS-01.md) Theo dõi vị trí nền | Quay lại |
| [DA-SYNC-01](../da/DA-SYNC-01.md) Đồng bộ offline | Quay lại |
| [DA-MONEY-01](../da/DA-MONEY-01.md) Thưởng & khoản ứng của tôi | Quay lại |
| [DA-HIST-01](../da/DA-HIST-01.md) Lịch sử chuyến | Quay lại |

## Components (design system)

`ListRow`, `MobileHeader`, `BottomNav`

## API (GraphQL)

- `driverMe`
- `driverLogout`

## Trạng thái UI

- **offline**: Đăng xuất bị chặn khi còn mục chờ đồng bộ (confirm bottom sheet)
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Thông tin hồ sơ do nhà xe quản lý (WM-DRV-02); tài xế chỉ xem.
- Đổi mật khẩu phụ thuộc phương thức đăng nhập (chờ chốt).
