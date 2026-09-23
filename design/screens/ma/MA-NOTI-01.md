# MA-NOTI-01 — Thông báo

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Tổng quan & thông báo |
| Route | `MerchantNotificationsRoute` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-NOTI-01.html](../../mockups/MA-NOTI-01.html) · canvas artboard `MA-NOTI-01.dc.html` |

## Mục đích

Cảnh báo và việc cần duyệt/xử lý; chạm để mở đúng entity (đơn / chuyến / bảng lương / COD).

## Dữ liệu hiển thị

- `type`
- `title`
- `body`
- `entityType`
- `entityId`
- `createdAt`
- `readAt`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở thông báo → entity | quyền xem entity |
| Đọc tất cả | notification.read |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | back |
| Mở bảng lương chờ duyệt | [MA-PAYROLL-01](../ma/MA-PAYROLL-01.md) Duyệt bảng lương | `MerchantPayrollApprovalRoute` | action |
| Mở chuyến có sự cố | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |
| Mở COD tài xế | [MA-COD-01](../ma/MA-COD-01.md) COD tài xế | `MerchantCodRoute` | action |
| Mở danh sách chuyến (cảnh báo lịch) | [MA-TRIP-01](../ma/MA-TRIP-01.md) Danh sách chuyến | `MerchantTripListRoute` | action |
| Mở đơn quá hạn | [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | `MerchantOrderDetailRoute(orderId)` | action |
| Mở đơn chờ xác nhận | [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | `MerchantOrderDetailRoute(orderId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | Chuông thông báo |
| [MA-PROFILE-01](../ma/MA-PROFILE-01.md) Tài khoản & cài đặt nhẹ | Mở thông báo |

## Components (design system)

`MobileHeader`, `FilterChip`

## API (GraphQL)

- `notifications(filter, first, after)`
- `markNotificationRead(id)`
- `markAllNotificationsRead`

## Trạng thái UI

- **empty**: EmptyState 'Chưa có thông báo'
- **loading**: Skeleton 5 dòng
- **error**: Banner danger + Thử lại

## Ghi chú implement

- Deep link theo entityType: PAYROLL → MA-PAYROLL-01, TRIP/INCIDENT/OVERLAP → MA-TRIP-02 (hoặc danh sách nếu nhiều), ORDER → MA-ORD-02, COD → MA-COD-01.
- Push notification (FCM) mở cùng route; đánh dấu đã đọc khi mở.
