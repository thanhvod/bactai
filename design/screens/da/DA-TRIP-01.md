# DA-TRIP-01 — Chi tiết chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Chuyến & điểm dừng |
| Route | `DriverTripDetailRoute(tripId)` |
| Pattern | `detail` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-TRIP-01.html](../../mockups/DA-TRIP-01.html) · canvas artboard `DA-TRIP-01.dc.html` |

## Mục đích

Xem chuyến: điểm lấy/trả, hàng, ghi chú, COD, chứng từ, sự cố; hành động chính theo trạng thái.

## Dữ liệu hiển thị

- `code`
- `status`
- `order.code`
- `route`
- `vehicle.plate`
- `plannedWindow`
- `stops[]`
- `cargoLines[]`
- `notes`
- `codExpected`
- `attachments.count`
- `incidents[]`
- `gps.lastSentAt`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Primary theo trạng thái | trip.status own: Đã lên lịch→Bắt đầu đi lấy; Đang đến điểm lấy→Đã đến điểm lấy; Đang lấy hàng→Bắt đầu vận chuyển; Đang vận chuyển→Đến điểm trả; Đang trả hàng→Hoàn thành điểm/chuyến; Tạm dừng→Tiếp tục chuyến |
| Tạm dừng | Pause own trip with reason |
| Báo sự cố | Report incident own trip |
| Nhập COD / Upload chứng từ | own stop |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
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
| [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | Mở chuyến đang chạy |
| [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | Mở chuyến CX-202609-0002 (15:00) |
| [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | Mở chuyến CX-202609-0001 |
| [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | Mở chuyến CX-202609-0002 |
| [DA-JOB-01](../da/DA-JOB-01.md) Danh sách chuyến | Mở chuyến sắp tới CX-202609-0010 |
| [DA-JOB-02](../da/DA-JOB-02.md) Lịch chuyến | Chọn ngày → mở chuyến CX-202609-0001 |
| [DA-JOB-02](../da/DA-JOB-02.md) Lịch chuyến | Chọn ngày → mở chuyến CX-202609-0002 |
| [DA-STOP-01](../da/DA-STOP-01.md) Danh sách điểm dừng | Quay lại |
| [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | Hoàn thành điểm → về chuyến |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Hủy → về chuyến |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Hủy → về chuyến |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Xác nhận tạm dừng → chuyến Tạm dừng |
| [DA-INC-01](../da/DA-INC-01.md) Báo sự cố | Quay lại |
| [DA-INC-01](../da/DA-INC-01.md) Báo sự cố | Gửi sự cố → về chuyến |
| [DA-ATT-01](../da/DA-ATT-01.md) Upload chứng từ | Quay lại |
| [DA-ATT-01](../da/DA-ATT-01.md) Upload chứng từ | Lưu chứng từ → về chuyến |
| [DA-GPS-01](../da/DA-GPS-01.md) Theo dõi vị trí nền | Mở chuyến đang chạy |
| [DA-SYNC-01](../da/DA-SYNC-01.md) Đồng bộ offline | Mở chuyến của mục trạng thái |
| [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | Mở chuyến mới được giao |
| [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | Mở chuyến thay đổi |
| [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | Mở chuyến có sự cố |
| [DA-MONEY-01](../da/DA-MONEY-01.md) Thưởng & khoản ứng của tôi | Mở chuyến có thưởng |
| [DA-HIST-01](../da/DA-HIST-01.md) Lịch sử chuyến | Mở chuyến CX-202609-0009 (chỉ xem) |
| [DA-HIST-01](../da/DA-HIST-01.md) Lịch sử chuyến | Mở chuyến CX-202609-0008 (chỉ xem) |
| [DA-HIST-01](../da/DA-HIST-01.md) Lịch sử chuyến | Mở chuyến CX-202609-0007 (chỉ xem) |

## Components (design system)

`EntityHeader`, `StatusBadge`, `StopCard`, `MoneyText`, `ListRow`, `Button`, `PrimaryBottomAction`, `IconButton`, `MobileHeader`

## API (GraphQL)

- `driverTrip(id)`

## Trạng thái UI

- **loading**: Skeleton header + sections
- **offline**: Mở được chuyến đã cache; thao tác vào hàng đợi
- **error**: Chuyến không thuộc tài xế → 'Bạn không có quyền xem chuyến này' + về Home
- **readonly**: Chuyến Hoàn thành/Đã hủy (mở từ lịch sử) → ẩn PrimaryBottomAction, chỉ xem
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Header: mã, trạng thái, tuyến, xe, giờ dự kiến. Sections: Điểm lấy/trả (StopCard) · Hàng hóa/ghi chú · COD · Chứng từ/POD · Sự cố.
- Tạm dừng (trạng thái) ≠ Sự cố (bản ghi riêng) — 2 nút tách biệt.
- Tài xế không xem/cập nhật chuyến của tài xế khác.
