# DA-MONEY-01 — Thưởng & khoản ứng của tôi

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Tài khoản & tiền |
| Route | `DriverMoneyRoute` |
| Pattern | `mobile` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-MONEY-01.html](../../mockups/DA-MONEY-01.html) · canvas artboard `DA-MONEY-01.dc.html` |

## Mục đích

Minh bạch khoản liên quan tới tài xế: thưởng chuyến, ứng lương, tạm ứng chuyến, COD đang giữ, lịch sử nộp COD.

## Dữ liệu hiển thị

- `tripBonuses[]`
- `salaryAdvances[]`
- `tripAdvances[]`
- `codHeld`
- `codRemittances[]`
- `reimbursable`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở chuyến | View own money/bonus/advance summary |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến có thưởng | [DA-TRIP-01](../da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | action |
| Xem lịch sử chuyến | [DA-HIST-01](../da/DA-HIST-01.md) Lịch sử chuyến | `DriverHistoryRoute` | action |
| Quay lại | [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | `DriverProfileRoute` | back |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | Cảnh báo COD → Thưởng & khoản ứng |
| [DA-NOTI-01](../da/DA-NOTI-01.md) Thông báo | Mở khoản COD |
| [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | Thưởng & khoản ứng của tôi |

## Components (design system)

`DriverWallet`, `MoneyText`, `Banner`, `MobileHeader`

## API (GraphQL)

- `driverLedger(driverId: me)`
- `driverJobs(filter: {bonus: true, period})`

## Trạng thái UI

- **empty**: Tháng chưa có khoản → EmptyState
- **offline**: Dữ liệu cache + thời điểm cập nhật
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Chỉ dữ liệu của chính tài xế — không hiển thị báo cáo/lợi nhuận công ty.
- Seed: thưởng 1.500.000 đ, tạm ứng 2.000.000 đ (PC-202609-0004), công ty nợ 800.000 đ phí cầu đường (PC-202609-0001).
