# DA-COD-01 — Nhập COD thực thu

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Trạng thái · POD · COD · Sự cố |
| Route | `DriverCodInputRoute(stopId)` |
| Pattern | `form` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-COD-01.html](../../mockups/DA-COD-01.html) · canvas artboard `DA-COD-01.dc.html` |

## Mục đích

Ghi COD thực thu tại điểm; xác nhận khi khác dự kiến; sửa sau khi lưu phải có lý do (audit).

## Dữ liệu hiển thị

- `codExpected`
- `codActual`
- `note`
- `diffReason`
- `receiptPhoto?`
- `previousAmount (edit)`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu COD | Enter COD actual for own stop |
| Xác nhận lưu COD khác dự kiến | reason required |
| Sửa COD đã lưu | ⚠️ reason required; backend may restrict by time/status |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xác nhận COD khác dự kiến → về điểm dừng | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | action |
| Quay lại | [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | back |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | Nhập COD |
| [DA-STOP-02](../da/DA-STOP-02.md) Chi tiết điểm dừng | Nhập COD thực thu |
| [DA-STATUS-01](../da/DA-STATUS-01.md) Cập nhật trạng thái chuyến | Nhập COD |
| [DA-STATUS-02](../da/DA-STATUS-02.md) Tạm dừng chuyến | Nhập COD |
| [DA-SYNC-01](../da/DA-SYNC-01.md) Đồng bộ offline | Mở COD đã nhập |

## Components (design system)

`MoneyText`, `StatusBadge`, `MoneyInput`, `FormField`, `Button`, `Textarea`, `BottomSheet`, `MobileHeader`, `PrimaryBottomAction`

## API (GraphQL)

- `driverSubmitCod(input: {stopId, amount, note, reason?, attachments?})`

## Trạng thái UI

- **confirm**: Thực thu ≠ dự kiến → bottom sheet so sánh + lý do bắt buộc (mockup)
- **edit**: Sửa sau khi lưu: hiện diff Số cũ → Số mới (AuditDiff) + lý do bắt buộc, gửi audit
- **offline**: Vào hàng đợi; COD đang giữ cập nhật khi đồng bộ
- **validation**: Số âm/rỗng → lỗi inline
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- MoneyInput số nguyên VND, bàn phím số, font 28px.
- COD thực thu tăng 'COD đang giữ' của tài xế; nộp lại cho kế toán KHÔNG phải doanh thu.
- Sửa COD 12.000.000 → 11.500.000 không có lý do bị reject (DRV-ACT-003).
