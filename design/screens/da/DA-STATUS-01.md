# DA-STATUS-01 — Cập nhật trạng thái chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Trạng thái · POD · COD · Sự cố |
| Route | `DriverStatusUpdateRoute(tripId)` |
| Pattern | `dialog` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-STATUS-01.html](../../mockups/DA-STATUS-01.html) · canvas artboard `DA-STATUS-01.dc.html` |
| Overlay trên | [DA-TRIP-01](./DA-TRIP-01.md) (drawer/modal, không cần route riêng) |

## Mục đích

Bottom sheet chọn trạng thái hợp lệ tiếp theo, ghi chú, lưu giờ thực tế.

## Dữ liệu hiển thị

- `currentStatus`
- `allowedNextStatuses[]`
- `note`
- `actualAt`
- `lastLocation`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xác nhận | Update own trip status |
| Chọn Tạm dừng | → DA-STATUS-02 (reason required) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Chọn Tạm dừng → chọn lý do | [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | `DriverPauseTripRoute(tripId)` | action |
| Hủy → về chuyến | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Xác nhận Đang trả hàng → mở điểm trả | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | action |
| Trạng thái GPS của chuyến | [DA-GPS-01](../da/DA-GPS-01.md) Theo dõi vị trí nền | `DriverGpsPermissionRoute` | action |
| Mở điểm Kho Cần Thơ | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | action |
| Mở điểm Kho Bình Dương | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | action |
| Mở danh sách điểm dừng | [DA-STOP-01](../da/DA-STOP-01.md) Danh sách điểm dừng | `DriverStopListRoute(tripId)` | action |
| Nhập COD | [DA-COD-01](../da/DA-COD-01.md) Nhập COD thực thu | `DriverCodInputRoute(stopId)` | action |
| Upload chứng từ chuyến | [DA-ATT-01](../da/DA-ATT-01.md) Upload chứng từ | `DriverAttachmentUploadRoute(entity)` | action |
| Xem/báo sự cố | [DA-INC-01](../da/DA-INC-01.md) Báo sự cố | `DriverIncidentReportRoute(tripId)` | action |
| Tạm dừng chuyến | [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | `DriverPauseTripRoute(tripId)` | action |
| Báo sự cố | [DA-INC-01](../da/DA-INC-01.md) Báo sự cố | `DriverIncidentReportRoute(tripId)` | action |
| Primary theo trạng thái: Đến điểm trả → xác nhận | [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | `DriverStatusUpdateRoute(tripId)` | action |
| Quay lại | [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | `DriverHomeRoute` | back |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Primary theo trạng thái: Đến điểm trả → xác nhận |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Primary theo trạng thái: Đến điểm trả → xác nhận |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Primary theo trạng thái: Đến điểm trả → xác nhận |

## Components (design system)

`RadioGroup`, `Textarea`, `FormField`, `Button`, `BottomSheet`, `EntityHeader`, `StatusBadge`, `StopCard`, `MoneyText`, `PrimaryBottomAction`, `IconButton`, `MobileHeader`

## API (GraphQL)

- `driverUpdateTripStatus(input: {tripId, status, note?, reason?, idempotencyKey})`

## Trạng thái UI

- **offline**: Lưu vào hàng đợi với idempotencyKey + actualAt tại máy; UI cập nhật lạc quan, badge 'chờ gửi'
- **error**: Server từ chối (trạng thái đã đổi từ web) → Banner danger + tải lại chuyến
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Chỉ hiện trạng thái hợp lệ tiếp theo; không cho lùi trạng thái (đổi ngược = operation, sensitive).
- Mỗi lần đổi tạo status_history (actor = driver).
