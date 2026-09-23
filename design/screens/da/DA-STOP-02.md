# DA-STOP-02 — Chi tiết điểm dừng

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Chuyến & điểm dừng |
| Route | `DriverStopDetailRoute(stopId)` |
| Pattern | `detail` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-STOP-02.html](../../mockups/DA-STOP-02.html) · canvas artboard `DA-STOP-02.dc.html` |

## Mục đích

Tại điểm: địa chỉ lớn, liên hệ, COD, POD, giờ thực tế; đánh dấu đã đến/hoàn thành/bỏ qua.

## Dữ liệu hiển thị

- `type`
- `sequence`
- `location`
- `contact`
- `cargoSummary`
- `codExpected`
- `codActual`
- `podCount`
- `plannedAt`
- `arrivedAt`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đã đến | Update own stop status |
| Hoàn thành điểm | Update own stop status; điểm trả cần ≥1 POD, COD đã nhập nếu có COD dự kiến |
| Bỏ qua điểm | reason required (ReasonBottomSheet) |
| Nhập COD | Enter COD own stop |
| Chụp POD | Upload POD own trip |
| Gọi / Chỉ đường | driver |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Nhập COD thực thu | [DA-COD-01](../da/DA-COD-01.md) Nhập COD thực thu | `DriverCodInputRoute(stopId)` | action |
| Chụp POD | [DA-POD-01](../da/DA-POD-01.md) Chụp POD | `DriverPodCaptureRoute(stopId)` | action |
| Báo sự cố | [DA-INC-01](../da/DA-INC-01.md) Báo sự cố | `DriverIncidentReportRoute(tripId)` | action |
| Quay lại | [DA-STOP-01](../da/DA-STOP-01.md) Danh sách điểm dừng | `DriverStopListRoute(tripId)` | back |
| Hoàn thành điểm → về chuyến | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Mở điểm Kho Cần Thơ |
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Mở điểm Kho Bình Dương |
| [DA-STOP-01](../da/DA-STOP-01.md) Danh sách điểm dừng | Mở chi tiết điểm Kho Cần Thơ |
| [DA-STOP-01](../da/DA-STOP-01.md) Danh sách điểm dừng | Mở chi tiết điểm Kho Bình Dương |
| [DA-STOP-01](../da/DA-STOP-01.md) Danh sách điểm dừng | Mở điểm tiếp theo |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Xác nhận Đang trả hàng → mở điểm trả |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Mở điểm Kho Cần Thơ |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Mở điểm Kho Bình Dương |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Mở điểm Kho Cần Thơ |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Mở điểm Kho Bình Dương |
| [DA-POD-01](../da/DA-POD-01.md) Chụp POD | Quay lại |
| [DA-POD-01](../da/DA-POD-01.md) Chụp POD | Lưu POD → về điểm dừng |
| [DA-COD-01](../da/DA-COD-01.md) Nhập COD thực thu | Xác nhận COD khác dự kiến → về điểm dừng |
| [DA-COD-01](../da/DA-COD-01.md) Nhập COD thực thu | Quay lại |
| [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | Mở điểm dừng cần xử lý |

## Components (design system)

`StatusBadge`, `Button`, `MoneyText`, `MobileHeader`, `PrimaryBottomAction`

## API (GraphQL)

- `driverTrip(id){stop}`
- `driverUpdateStopStatus(input: {stopId, status, reason?, idempotencyKey})`

## Trạng thái UI

- **offline**: Hiển thị dữ liệu cache gần nhất + OfflineBanner; thao tác ghi vào hàng đợi (DA-SYNC-01).
- **validation**: Hoàn thành khi thiếu POD/COD → inline danger 'Cần chụp POD trước khi hoàn thành'
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Mockup ở thời điểm đã đến điểm trả (13:05), chưa nhập COD/POD.
- Địa chỉ 17px, COD 24px — đọc được ngoài trời.
