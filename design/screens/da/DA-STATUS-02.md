# DA-STATUS-02 — Tạm dừng chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Trạng thái · POD · COD · Sự cố |
| Route | `DriverPauseTripRoute(tripId)` |
| Pattern | `dialog` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-STATUS-02.html](../../mockups/DA-STATUS-02.html) · canvas artboard `DA-STATUS-02.dc.html` |
| Overlay trên | [DA-TRIP-01](./DA-TRIP-01.md) (drawer/modal, không cần route riêng) |

## Mục đích

ReasonBottomSheet: đặt chuyến Tạm dừng với lý do từ danh mục, ghi chú, ảnh tùy chọn.

## Dữ liệu hiển thị

- `reasonCode`
- `note`
- `photo?`
- `previousStatus`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xác nhận tạm dừng | Pause own trip with reason — reason required |
| Báo sự cố | chuyển sang DA-INC-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Chuyển sang báo sự cố | [DA-INC-01](../da/DA-INC-01.md) Báo sự cố | `DriverIncidentReportRoute(tripId)` | action |
| Hủy → về chuyến | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Xác nhận tạm dừng → chuyến Tạm dừng | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
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
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Tạm dừng chuyến |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Chọn Tạm dừng → chọn lý do |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Tạm dừng chuyến |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Tạm dừng chuyến |
| [DA-INC-01](../da/DA-INC-01.md) Báo sự cố | Chỉ tạm dừng chuyến |

## Components (design system)

`ReasonBottomSheet`, `Banner`, `FilterChip`, `FormField`, `Textarea`, `Button`, `BottomSheet`, `EntityHeader`, `StatusBadge`, `StopCard`, `MoneyText`, `ListRow`, `PrimaryBottomAction`, `IconButton`, `MobileHeader`

## API (GraphQL)

- `catalogItems(type: PAUSE_REASON)`
- `driverUpdateTripStatus(input: {status: PAUSED, reason, note, attachments?})`

## Trạng thái UI

- **validation**: Chưa chọn lý do → nút Xác nhận disabled
- **offline**: Vào hàng đợi
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Lý do: giờ cấm tải, nghỉ đêm, chờ phà, hư xe, kẹt xe, chờ bốc xếp.
- Tạm dừng là trạng thái trip, KHÔNG tạo incident. Tiếp tục → quay về previousStatus (Đang vận chuyển).
