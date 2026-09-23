# MA-COD-01 — COD tài xế

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Tài chính & lương |
| Route | `MerchantCodRoute` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-COD-01.html](../../mockups/MA-COD-01.html) · canvas artboard `MA-COD-01.dc.html` |

## Mục đích

COD đang giữ theo tài xế; gọi nhắc và ghi nhận nộp COD nếu có quyền.

## Dữ liệu hiển thị

- `driver{name, phone, vehicle}`
- `codCollected`
- `codRemitted`
- `codHeld`
- `oldestHeldAt`
- `overThreshold`
- `upcomingCodExpected`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Gọi tài xế | tel: |
| Ghi nhận nộp COD | payment.create COD remittance — admin, accountant (operation ẩn) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | `MerchantFinanceRoute` | back |
| Mở chuyến sắp thu COD | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | KPI COD → COD tài xế |
| [MA-NOTI-01](../ma/MA-NOTI-01.md) Thông báo | Mở COD tài xế |
| [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | KPI COD → COD tài xế |

## Components (design system)

`MobileHeader`, `Banner`, `StatusBadge`, `Button`

## API (GraphQL)

- `driverCodHeld(filter)`
- `driverLedger(driverId)`
- `createPaymentIn(input: {type: DRIVER_COD_REMITTANCE})`

## Trạng thái UI

- **empty**: EmptyState 'Không tài xế nào đang giữ COD'
- **loading**: Skeleton
- **error**: Banner danger + Thử lại

## Ghi chú implement

- COD held = Σ stop.codActual − Σ payment_in DRIVER_COD_REMITTANCE (khớp WM-COD-01).
- Bottom sheet 'Ghi nhận nộp COD': số tiền (mặc định = đang giữ, ≤ đang giữ), hình thức (tiền mặt/chuyển khoản), ngày nộp, ghi chú → tạo PT-… loại tài xế nộp COD.
- Ngưỡng cảnh báo từ merchant settings: 5.000.000 đ / 2 ngày.
