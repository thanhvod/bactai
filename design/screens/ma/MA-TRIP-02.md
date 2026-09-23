# MA-TRIP-02 — Chi tiết chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Đơn & chuyến |
| Route | `MerchantTripDetailRoute(tripId)` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×1000 |
| Mockup | [../../mockups/MA-TRIP-02.html](../../mockups/MA-TRIP-02.html) · canvas artboard `MA-TRIP-02.dc.html` |

## Mục đích

Xe, tài xế, điểm dừng, trạng thái, POD/COD, sự cố; gọi tài xế, xem POD, cập nhật trạng thái thay tài xế.

## Dữ liệu hiển thị

- `code`
- `status`
- `plannedStart/End`
- `lastLocation{lat, lng, at, address}`
- `vehicle`
- `driver{name, phone}`
- `stops[]`
- `incidents[open]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Gọi tài xế | tel: driver.phone |
| Xem POD (full screen) | trip.view |
| Cập nhật trạng thái thay tài xế | trip.status.update (admin, operation) — bottom sheet |
| Tạm dừng / hủy / lùi trạng thái | sensitive — lý do bắt buộc |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [MA-TRIP-01](../ma/MA-TRIP-01.md) Danh sách chuyến | `MerchantTripListRoute` | back |
| Xem xe trên bản đồ | [MA-MAP-01](../ma/MA-MAP-01.md) Theo dõi xe | `MerchantMapRoute` | action |
| Mở đơn của chuyến | [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | `MerchantOrderDetailRoute(orderId)` | action |
| Mở sự cố trên Web Merchant | WM-INC-01 | | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | KPI sự cố → chi tiết chuyến có sự cố |
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | Mở chuyến CX-202609-0001 |
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | Mở chuyến CX-202609-0003 |
| [MA-NOTI-01](../ma/MA-NOTI-01.md) Thông báo | Mở chuyến có sự cố |
| [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | Mở chuyến CX-202609-0001 |
| [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | Xem chuyến của đơn |
| [MA-TRIP-01](../ma/MA-TRIP-01.md) Danh sách chuyến | Mở chi tiết chuyến |
| [MA-MAP-01](../ma/MA-MAP-01.md) Theo dõi xe | Mở chuyến của xe 51C-123.45 |
| [MA-MAP-01](../ma/MA-MAP-01.md) Theo dõi xe | Mở chuyến của xe 51D-678.90 |
| [MA-COD-01](../ma/MA-COD-01.md) COD tài xế | Mở chuyến sắp thu COD |

## Components (design system)

`MobileHeader`, `StatusBadge`, `WarningPanel`, `Button`, `PrimaryBottomAction`

## API (GraphQL)

- `trip(id){status, vehicle, driver, stops{status, pod, codExpected, codActual}, incidents, lastLocation}`
- `updateTripStatus(id, status, reason?)`
- `updateStopStatus(id, status, reason?)`

## Trạng thái UI

- **loading**: Skeleton
- **error**: Không tìm thấy / không có quyền
- **conflict**: Tài xế vừa cập nhật → toast 'Trạng thái đã thay đổi' + tải lại
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Bottom sheet 'Cập nhật trạng thái thay tài xế': radio trạng thái kế tiếp hợp lệ (Đang vận chuyển → Đang trả hàng → Hoàn thành), chọn điểm dừng, ghi chú; Tạm dừng/Hủy/lùi trạng thái yêu cầu Lý do (bắt buộc); nút 'Xác nhận cập nhật'. Ghi activity 'cập nhật thay tài xế' + người thực hiện.
- Accountant: ẩn nút cập nhật trạng thái.
- Chạm ảnh POD mở viewer toàn màn hình.
- Trang cuộn; mockup cao 1000.
