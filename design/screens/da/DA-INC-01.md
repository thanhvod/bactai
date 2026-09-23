# DA-INC-01 — Báo sự cố

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Trạng thái · POD · COD · Sự cố |
| Route | `DriverIncidentReportRoute(tripId)` |
| Pattern | `form` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-INC-01.html](../../mockups/DA-INC-01.html) · canvas artboard `DA-INC-01.dc.html` |

## Mục đích

Gửi sự cố (loại, mức độ, mô tả, ảnh) cho operation; lưu offline được.

## Dữ liệu hiển thị

- `type`
- `severity: LOW|MEDIUM|HIGH`
- `description`
- `attachments[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Gửi sự cố | Report incident for own trip |
| Đính kèm chứng từ khác | → DA-ATT-01 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Đính kèm chứng từ khác | [DA-ATT-01](../da/DA-ATT-01.md) Upload chứng từ | `DriverAttachmentUploadRoute(entity)` | action |
| Chỉ tạm dừng chuyến | [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | `DriverPauseTripRoute(tripId)` | action |
| Quay lại | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | back |
| Gửi sự cố → về chuyến | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Xem/báo sự cố |
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Báo sự cố |
| [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | Báo sự cố |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Xem/báo sự cố |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Báo sự cố |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Chuyển sang báo sự cố |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Xem/báo sự cố |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Báo sự cố |
| [DA-SYNC-01](../da/DA-SYNC-01.md) Đồng bộ offline | Mở sự cố đã gửi |

## Components (design system)

`FilterChip`, `Select`, `FormField`, `Textarea`, `AttachmentCapture`, `Banner`, `MobileHeader`, `PrimaryBottomAction`, `Button`

## API (GraphQL)

- `catalogItems(type: INCIDENT_TYPE)`
- `driverReportIncident(input: {tripId, orderId, type, severity, description, attachmentIds})`
- `POST /uploads/presign`

## Trạng thái UI

- **validation**: Thiếu loại/mô tả → lỗi inline
- **offline**: Sự cố + ảnh vào hàng đợi, tự gửi khi có mạng
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Sự cố là bản ghi riêng (incidents) — không đổi trạng thái chuyến. Muốn dừng xe → DA-STATUS-02.
- Operation thấy trên WM-DISPATCH-05 / WM-INC-01.
