# DA-POD-01 — Chụp POD

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Trạng thái · POD · COD · Sự cố |
| Route | `DriverPodCaptureRoute(stopId)` |
| Pattern | `mobile` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-POD-01.html](../../mockups/DA-POD-01.html) · canvas artboard `DA-POD-01.dc.html` |

## Mục đích

Chụp/chọn nhiều ảnh POD, xem trạng thái upload, retry; gắn đúng điểm trả.

## Dữ liệu hiển thị

- `stopId`
- `category`
- `photos[{localPath, status: uploaded|uploading|failed|queued, progress}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Chụp / Thư viện | Upload POD own trip |
| Thử lại | driver |
| Xong | gắn ảnh vào stop |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | back |
| Lưu POD → về điểm dừng | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | Chụp POD |
| [DA-SYNC-01](../da/DA-SYNC-01.md) Đồng bộ offline | Mở POD lỗi |

## Components (design system)

`PodCapture`, `Button`, `AttachmentCapture`, `SegmentedControl`, `Banner`, `MobileHeader`, `PrimaryBottomAction`

## API (GraphQL)

- `POST /uploads/presign`
- `POST /uploads/confirm (category: POD, entity: ORDER_STOP)`

## Trạng thái UI

- **offline**: Ảnh lưu local, trạng thái 'Chờ mạng', tự upload khi có kết nối
- **error**: Thumbnail viền danger + Thử lại
- **permission**: Chưa cấp quyền camera → màn giải thích + mở cài đặt
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Nén ảnh trước khi upload (≤ 10 MB).
- POD không được gắn nhầm stop: stopId cố định từ route.
