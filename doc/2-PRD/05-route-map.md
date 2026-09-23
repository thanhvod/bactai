# PRD — Route Map & Navigation Hierarchy

> Ngày lập: 2026-09-23
> Mục tiêu: định nghĩa route/navigation cho từng platform để Claude Design dựng flow nhất quán và Claude Code implement route không lệch màn hình.

## 1. Quy ước route

- Web Merchant dùng path tiếng Anh, ngắn, ổn định; label UI tiếng Việt.
- Dynamic segment dùng `:id`.
- Detail page dùng tabs qua query `?tab=` hoặc nested tab state, không nhất thiết nested route nếu implementation muốn đơn giản.
- Các modal/drawer như upload, timeline, sensitive action không cần route riêng trừ khi cần deep link.
- App mobile dùng route name ổn định, có thể map sang Flutter Navigator/GoRouter.

## 2. Web Merchant navigation hierarchy

### 2.1. Sidebar top-level

| Thứ tự | Nhóm | Route | Screens |
|---:|---|---|---|
| 1 | Dashboard | `/` | WM-DASH-01 |
| 2 | Đơn hàng | `/orders` | WM-ORD-* |
| 3 | Điều phối | `/dispatch` | WM-DISPATCH-*, WM-TRIP-*, WM-STOP-* |
| 4 | Khách hàng | `/customers` | WM-CUS-* |
| 5 | Tài xế | `/drivers` | WM-DRV-* |
| 6 | Xe | `/vehicles` | WM-VEH-* |
| 7 | Nhà cung cấp | `/suppliers` | WM-SUP-* |
| 8 | Thu chi & Công nợ | `/finance` | WM-FIN-*, WM-PAY-*, WM-EXP-*, WM-DEBT-*, WM-COD-*, WM-ADV-* |
| 9 | Lương | `/payroll` | WM-PAYROLL-* |
| 10 | Báo cáo | `/reports` | WM-RPT-* |
| 11 | Cài đặt | `/settings` | WM-ORG-*, WM-USER-*, WM-RBAC-*, WM-SET-*, WM-CAT-* |

### 2.2. Auth routes

| Route | Screen | Notes |
|---|---|---|
| `/login` | WM-AUTH-01 | Google login only |
| `/onboarding/merchant` | WM-AUTH-02 | Hoàn tất/tạo merchant |
| `/select-merchant` | WM-AUTH-03 | User thuộc nhiều merchant |
| `/access-pending` | WM-AUTH-04 | Chưa thuộc merchant hoặc chờ mời |

### 2.3. Dashboard routes

| Route | Screen | Tabs/Query |
|---|---|---|
| `/` | WM-DASH-01 | overview |
| `/dashboard/operations` | WM-DASH-02 | optional if split from main dashboard |
| `/dashboard/finance` | WM-DASH-03 | optional if split from main dashboard |

### 2.4. Master data routes

| Route | Screen | Notes |
|---|---|---|
| `/customers` | WM-CUS-01 | list |
| `/customers/new` | WM-CUS-03 | create |
| `/customers/:customerId` | WM-CUS-02 | detail |
| `/customers/:customerId/edit` | WM-CUS-03 | edit |
| `/customers/:customerId/locations` | WM-CUS-04 | can be tab inside detail |
| `/drivers` | WM-DRV-01 | list |
| `/drivers/new` | WM-DRV-03 | create |
| `/drivers/:driverId` | WM-DRV-02 | detail |
| `/drivers/:driverId/edit` | WM-DRV-03 | edit |
| `/drivers/:driverId/salary-history` | WM-DRV-04 | can be tab/modal |
| `/vehicles` | WM-VEH-01 | list |
| `/vehicles/new` | WM-VEH-03 | create |
| `/vehicles/:vehicleId` | WM-VEH-02 | detail |
| `/vehicles/:vehicleId/edit` | WM-VEH-03 | edit |
| `/suppliers` | WM-SUP-01 | list |
| `/suppliers/new` | WM-SUP-03 | create |
| `/suppliers/:supplierId` | WM-SUP-02 | detail |
| `/suppliers/:supplierId/edit` | WM-SUP-03 | edit |

### 2.5. Order/dispatch routes

| Route | Screen | Notes |
|---|---|---|
| `/orders` | WM-ORD-01 | list |
| `/orders/new` | WM-ORD-03 | create |
| `/orders/:orderId` | WM-ORD-02 | detail tabs |
| `/orders/:orderId/edit` | WM-ORD-03 | edit |
| `/orders/:orderId/print` | WM-ORD-09 | print/export preview |
| `/orders/:orderId/stops/:stopId` | WM-STOP-01 | stop detail, can be drawer |
| `/dispatch` | WM-DISPATCH-01 | board |
| `/dispatch/calendar` | WM-DISPATCH-02 | vehicle/driver timeline |
| `/dispatch/conflicts` | WM-DISPATCH-03 | warning review |
| `/dispatch/map` | WM-DISPATCH-04 | last known location/map |
| `/dispatch/incidents` | WM-DISPATCH-05 | incident list |
| `/dispatch/incidents/:incidentId` | WM-INC-01 | incident detail |
| `/trips/:tripId` | WM-TRIP-01 | trip detail |
| `/orders/:orderId/trips/new` | WM-TRIP-02 | create trip from order |
| `/trips/:tripId/edit` | WM-TRIP-02 | edit trip |

### 2.6. Finance routes

| Route | Screen | Notes |
|---|---|---|
| `/finance` | WM-FIN-01 | finance home / ledger |
| `/finance/payments` | WM-PAY-01 | payment list |
| `/finance/payments/new` | WM-PAY-03 | create payment |
| `/finance/payments/:paymentId` | WM-PAY-02 | detail |
| `/finance/payments/:paymentId/allocate` | WM-PAY-04 | allocation |
| `/finance/expenses` | WM-EXP-01 | expense list |
| `/finance/expenses/new` | WM-EXP-03 | create expense |
| `/finance/expenses/:expenseId` | WM-EXP-02 | detail |
| `/finance/customer-debt` | WM-DEBT-01 | customer AR |
| `/finance/supplier-debt` | WM-DEBT-02 | supplier AP |
| `/finance/debt-statements` | WM-DEBT-03 | statement list |
| `/finance/debt-statements/:statementId` | WM-DEBT-04 | statement detail |
| `/finance/cod` | WM-COD-01 | COD held |
| `/finance/trip-advances` | WM-ADV-01 | advance reconciliation |

### 2.7. Payroll/report/settings routes

| Route | Screen |
|---|---|
| `/payroll` | WM-PAYROLL-01 |
| `/payroll/new` | WM-PAYROLL-03 |
| `/payroll/:payrollId` | WM-PAYROLL-02 |
| `/payroll/:payrollId/lines/:lineId` | WM-PAYROLL-04 |
| `/payroll/:payrollId/approve` | WM-PAYROLL-05 |
| `/reports` | WM-RPT-01 |
| `/reports/profit` | WM-RPT-02 / WM-RPT-03 |
| `/reports/vehicles` | WM-RPT-04 |
| `/reports/drivers` | WM-RPT-05 |
| `/reports/customer-debt` | WM-RPT-06 |
| `/reports/cod` | WM-RPT-07 |
| `/reports/payroll` | WM-RPT-08 |
| `/settings/company` | WM-ORG-01 |
| `/settings/users` | WM-USER-01 |
| `/settings/users/new` | WM-USER-03 |
| `/settings/users/:userId` | WM-USER-02 |
| `/settings/roles` | WM-RBAC-01 |
| `/settings/operations` | WM-SET-01 |
| `/settings/numbering` | WM-SET-02 |
| `/settings/catalogs` | WM-CAT-01 |

## 3. Driver App navigation

### 3.1. Bottom navigation

| Tab | Route name | Screens |
|---|---|---|
| Hôm nay | `DriverHomeRoute` | DA-HOME-01 |
| Lịch chuyến | `DriverJobsRoute` | DA-JOB-01, DA-JOB-02 |
| Thông báo | `DriverNotificationsRoute` | DA-NOTI-01 |
| Tài khoản | `DriverProfileRoute` | DA-PROFILE-01, DA-SYNC-01, DA-GPS-01 |

### 3.2. Driver App route stack

| Route name | Screen | Opened from |
|---|---|---|
| `DriverSplashRoute` | DA-AUTH-01 | app start |
| `DriverLoginRoute` | DA-AUTH-02 | splash/logout |
| `DriverForgotPasswordRoute` | DA-AUTH-03 | login |
| `DriverHomeRoute` | DA-HOME-01 | login/bottom nav |
| `DriverJobListRoute` | DA-JOB-01 | home/bottom nav |
| `DriverJobCalendarRoute` | DA-JOB-02 | job list |
| `DriverTripDetailRoute(tripId)` | DA-TRIP-01 | home/job list |
| `DriverStopListRoute(tripId)` | DA-STOP-01 | trip detail |
| `DriverStopDetailRoute(stopId)` | DA-STOP-02 | trip/stop list |
| `DriverStatusUpdateRoute(tripId)` | DA-STATUS-01 | trip detail |
| `DriverPauseTripRoute(tripId)` | DA-STATUS-02 | status update |
| `DriverPodCaptureRoute(stopId)` | DA-POD-01 | stop detail |
| `DriverCodInputRoute(stopId)` | DA-COD-01 | stop detail |
| `DriverIncidentReportRoute(tripId)` | DA-INC-01 | trip detail |
| `DriverAttachmentUploadRoute(entity)` | DA-ATT-01 | stop/trip/incident |
| `DriverSyncRoute` | DA-SYNC-01 | profile/offline banner |
| `DriverGpsPermissionRoute` | DA-GPS-01 | profile/trip running warning |
| `DriverMoneyRoute` | DA-MONEY-01 | profile/home |
| `DriverHistoryRoute` | DA-HIST-01 | profile |

## 4. App Merchant navigation

### 4.1. Bottom navigation

| Tab | Route name | Screens |
|---|---|---|
| Tổng quan | `MerchantHomeRoute` | MA-HOME-01 |
| Đơn/Chuyến | `MerchantOrdersRoute` | MA-ORD-*, MA-TRIP-* |
| Tài chính | `MerchantFinanceRoute` | MA-FIN-01, MA-COD-01 |
| Báo cáo | `MerchantReportsRoute` | MA-RPT-01 |
| Tài khoản | `MerchantProfileRoute` | MA-PROFILE-01 |

### 4.2. Route stack

| Route name | Screen |
|---|---|
| `MerchantLoginRoute` | MA-AUTH-01 |
| `MerchantHomeRoute` | MA-HOME-01 |
| `MerchantNotificationsRoute` | MA-NOTI-01 |
| `MerchantOrderListRoute` | MA-ORD-01 |
| `MerchantOrderDetailRoute(orderId)` | MA-ORD-02 |
| `MerchantQuickOrderCreateRoute` | MA-ORD-03 |
| `MerchantTripListRoute` | MA-TRIP-01 |
| `MerchantTripDetailRoute(tripId)` | MA-TRIP-02 |
| `MerchantMapRoute` | MA-MAP-01 |
| `MerchantCustomerListRoute` | MA-CUS-01 |
| `MerchantCustomerDetailRoute(customerId)` | MA-CUS-02 |
| `MerchantFinanceRoute` | MA-FIN-01 |
| `MerchantCodRoute` | MA-COD-01 |
| `MerchantPayrollApprovalRoute` | MA-PAYROLL-01 |
| `MerchantReportsRoute` | MA-RPT-01 |
| `MerchantProfileRoute` | MA-PROFILE-01 |

## 5. Web Khách hàng navigation

| Route | Screen | Notes |
|---|---|---|
| `/` | CW-HOME-01 | discovery/home |
| `/login` | CW-AUTH-01 | login/register |
| `/merchants/:merchantId` | CW-MER-01 | public profile |
| `/bookings/new` | CW-BOOK-01 | create booking |
| `/bookings` | CW-BOOK-02 | booking list |
| `/bookings/:bookingId` | CW-BOOK-03 | booking detail |
| `/orders` | CW-ORD-01 | order history |
| `/orders/:orderId` | CW-ORD-02 | order detail customer-safe |
| `/debt-statements` | CW-DEBT-01 | statements shared with customer |
| `/profile` | CW-PROFILE-01 | customer profile |
| `/addresses` | CW-ADDR-01 | customer address book |
| `/notifications` | CW-NOTI-01 | notifications |

## 6. Shared modal/drawer navigation

| Component | Deep link? | Used by |
|---|---|---|
| TimelineDrawer | No by default | All entity detail |
| AttachmentViewer | Optional query `?attachment=` later | All attachment tabs |
| SensitiveActionModal | No | Sensitive actions |
| EntityPicker | No | Forms |
| ImportWizard | Route `/settings/import` optional later | List pages |
| ExportPreview | Usually route or modal depending report | Reports/statements/payroll |

