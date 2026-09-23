# BTA — Screen index

Sinh tự động bởi `python3 design/tools/build.py`. Không sửa tay.

## App Tài xế (phase 1)

Stack: Flutter + Bloc/Cubit (apps/driver-app)

### Đăng nhập

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [DA-AUTH-01](screens/da/DA-AUTH-01.md) | Splash/kiểm tra phiên | `DriverSplashRoute` | auth | DA-AUTH-02, DA-HOME-01 |
| [DA-AUTH-02](screens/da/DA-AUTH-02.md) | Đăng nhập tài xế | `DriverLoginRoute` | auth | DA-AUTH-03, DA-HOME-01 |
| [DA-AUTH-03](screens/da/DA-AUTH-03.md) | Quên mật khẩu | `DriverForgotPasswordRoute` | auth | DA-AUTH-02 |

### Hôm nay & lịch chuyến

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [DA-HOME-01](screens/da/DA-HOME-01.md) | Trang chủ công việc | `DriverHomeRoute` | mobile | DA-JOB-01, DA-MONEY-01, DA-PROFILE-01, DA-SYNC-01, DA-TRIP-01 |
| [DA-JOB-01](screens/da/DA-JOB-01.md) | Danh sách chuyến | `DriverJobListRoute` | list | DA-JOB-02, DA-TRIP-01 |
| [DA-JOB-02](screens/da/DA-JOB-02.md) | Lịch chuyến | `DriverJobCalendarRoute` | mobile | DA-JOB-01, DA-TRIP-01 |
| [DA-NOTI-01](screens/da/DA-NOTI-01.md) | Thông báo | `DriverNotificationsRoute` | list | DA-MONEY-01, DA-STOP-02, DA-TRIP-01 |

### Chuyến & điểm dừng

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [DA-TRIP-01](screens/da/DA-TRIP-01.md) | Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | detail | DA-ATT-01, DA-COD-01, DA-GPS-01, DA-INC-01, DA-STATUS-01, DA-STATUS-02, DA-STOP-01, DA-STOP-02 |
| [DA-STOP-01](screens/da/DA-STOP-01.md) | Danh sách điểm dừng | `DriverStopListRoute(tripId)` | list | DA-STOP-02 |
| [DA-STOP-02](screens/da/DA-STOP-02.md) | Chi tiết điểm dừng | `DriverStopDetailRoute(stopId)` | detail | DA-COD-01, DA-INC-01, DA-POD-01, DA-TRIP-01 |

### Trạng thái · POD · COD · Sự cố

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [DA-STATUS-01](screens/da/DA-STATUS-01.md) | Cập nhật trạng thái chuyến | `DriverStatusUpdateRoute(tripId)` | dialog | DA-ATT-01, DA-COD-01, DA-GPS-01, DA-INC-01, DA-STATUS-01, DA-STATUS-02, DA-STOP-01, DA-STOP-02, DA-TRIP-01 |
| [DA-STATUS-02](screens/da/DA-STATUS-02.md) | Tạm dừng chuyến | `DriverPauseTripRoute(tripId)` | dialog | DA-ATT-01, DA-COD-01, DA-GPS-01, DA-INC-01, DA-STATUS-01, DA-STATUS-02, DA-STOP-01, DA-STOP-02, DA-TRIP-01 |
| [DA-POD-01](screens/da/DA-POD-01.md) | Chụp POD | `DriverPodCaptureRoute(stopId)` | mobile | DA-STOP-02 |
| [DA-COD-01](screens/da/DA-COD-01.md) | Nhập COD thực thu | `DriverCodInputRoute(stopId)` | form | DA-STOP-02 |
| [DA-INC-01](screens/da/DA-INC-01.md) | Báo sự cố | `DriverIncidentReportRoute(tripId)` | form | DA-ATT-01, DA-STATUS-02, DA-TRIP-01 |
| [DA-ATT-01](screens/da/DA-ATT-01.md) | Upload chứng từ | `DriverAttachmentUploadRoute(entity)` | form | DA-TRIP-01 |

### Đồng bộ & GPS

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [DA-GPS-01](screens/da/DA-GPS-01.md) | Theo dõi vị trí nền | `DriverGpsPermissionRoute` | mobile | DA-SYNC-01, DA-TRIP-01 |
| [DA-SYNC-01](screens/da/DA-SYNC-01.md) | Đồng bộ offline | `DriverSyncRoute` | list | DA-COD-01, DA-GPS-01, DA-INC-01, DA-POD-01, DA-TRIP-01 |

### Tài khoản & tiền

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [DA-MONEY-01](screens/da/DA-MONEY-01.md) | Thưởng & khoản ứng của tôi | `DriverMoneyRoute` | mobile | DA-HIST-01, DA-TRIP-01 |
| [DA-HIST-01](screens/da/DA-HIST-01.md) | Lịch sử chuyến | `DriverHistoryRoute` | list | DA-TRIP-01 |
| [DA-PROFILE-01](screens/da/DA-PROFILE-01.md) | Hồ sơ cá nhân | `DriverProfileRoute` | mobile | DA-AUTH-02, DA-GPS-01, DA-HIST-01, DA-MONEY-01, DA-SYNC-01 |

## Flows

- [FLOW-AUTH-MERCHANT](flows/FLOW-AUTH-MERCHANT.md) — Đăng nhập & onboarding merchant
- [FLOW-MASTER-DATA](flows/FLOW-MASTER-DATA.md) — CRUD dữ liệu nền (khách, tài xế, xe, NCC)
- [FLOW-ORDER-ONE-TRUCK](flows/FLOW-ORDER-ONE-TRUCK.md) — Tạo đơn 1 xe nhanh → điều phối → tài xế
- [FLOW-ORDER-MULTI-TRUCK](flows/FLOW-ORDER-MULTI-TRUCK.md) — Đơn nhiều xe
- [FLOW-DRIVER-FIELD](flows/FLOW-DRIVER-FIELD.md) — Tài xế: trạng thái, POD, COD (có offline)
- [FLOW-PAUSE-INCIDENT](flows/FLOW-PAUSE-INCIDENT.md) — Tạm dừng chuyến & báo sự cố
- [FLOW-PAYMENT-ALLOCATION](flows/FLOW-PAYMENT-ALLOCATION.md) — Khách thanh toán & phân bổ
- [FLOW-COD-REMITTANCE](flows/FLOW-COD-REMITTANCE.md) — COD tài xế: thu tại điểm → nộp lại
- [FLOW-EXPENSE-PROFIT](flows/FLOW-EXPENSE-PROFIT.md) — Chi phí, tạm ứng & lãi/lỗ đơn
- [FLOW-DEBT-STATEMENT](flows/FLOW-DEBT-STATEMENT.md) — Chốt bảng kê công nợ
- [FLOW-PAYROLL](flows/FLOW-PAYROLL.md) — Tạo & duyệt bảng lương
- [FLOW-BOOKING-CUSTOMER](flows/FLOW-BOOKING-CUSTOMER.md) — Booking khách hàng → đơn (phase 3)
- [FLOW-MERCHANT-MOBILE](flows/FLOW-MERCHANT-MOBILE.md) — App Merchant: theo dõi & duyệt nhanh (phase 2)
