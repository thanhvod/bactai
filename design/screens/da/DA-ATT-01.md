# DA-ATT-01 — Upload chứng từ

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Trạng thái · POD · COD · Sự cố |
| Route | `DriverAttachmentUploadRoute(entity)` |
| Pattern | `form` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-ATT-01.html](../../mockups/DA-ATT-01.html) · canvas artboard `DA-ATT-01.dc.html` |

## Mục đích

Gửi thêm chứng từ (phiếu giao, biên nhận, hóa đơn phí, ảnh sự cố) gắn vào chuyến/điểm/sự cố.

## Dữ liệu hiển thị

- `entity{type, id, label}`
- `category`
- `files[{name, size, status, progress}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Chụp ảnh / Thư viện / PDF | Upload chứng từ for own trip |
| Thử lại | driver |
| Lưu chứng từ | driver |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | back |
| Lưu chứng từ → về chuyến | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Upload chứng từ chuyến |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Upload chứng từ chuyến |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Upload chứng từ chuyến |
| [DA-INC-01](../da/DA-INC-01.md) Báo sự cố | Đính kèm chứng từ khác |

## Components (design system)

`Select`, `FormField`, `FilterChip`, `Button`, `StatusBadge`, `MobileHeader`, `PrimaryBottomAction`

## API (GraphQL)

- `POST /uploads/presign`
- `POST /uploads/confirm (entityType, entityId, category)`

## Trạng thái UI

- **offline**: File vào hàng đợi
- **error**: Dòng lỗi + Thử lại
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Loại chứng từ: POD, Phiếu giao hàng, Biên nhận, Hóa đơn phí, Ảnh sự cố, Khác.
- JPG/PNG/PDF ≤ 10 MB.
