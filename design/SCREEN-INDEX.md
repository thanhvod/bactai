# BTA — Screen index

Sinh tự động bởi `python3 design/tools/build.py`. Không sửa tay.

## Web Merchant (phase 1)

Stack: React + Vite + Tailwind + shadcn/Radix (apps/web)

### Auth & onboarding

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-AUTH-01](screens/wm/WM-AUTH-01.md) | Đăng nhập Google | `/login` | auth | WM-AUTH-03, WM-AUTH-04, WM-DASH-01 |
| [WM-AUTH-02](screens/wm/WM-AUTH-02.md) | Tạo/hoàn tất merchant | `/onboarding/merchant` | auth | WM-AUTH-01, WM-DASH-01 |
| [WM-AUTH-03](screens/wm/WM-AUTH-03.md) | Chọn merchant | `/select-merchant` | auth | WM-AUTH-01, WM-AUTH-02, WM-DASH-01 |
| [WM-AUTH-04](screens/wm/WM-AUTH-04.md) | Không có quyền / chờ mời | `/access-pending` | auth | WM-AUTH-01, WM-AUTH-02, WM-AUTH-03 |

### Khung chung

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-SHELL-01](screens/wm/WM-SHELL-01.md) | Layout chính | `(layout) /*` | page | WM-AUTH-01, WM-AUTH-03, WM-ORG-01, WM-SET-01, WM-SHELL-02, WM-SHELL-03, WM-USER-02 |
| [WM-SHELL-02](screens/wm/WM-SHELL-02.md) | Trung tâm thông báo | `(popover) — từ chuông topbar` | drawer | WM-COD-01, WM-CUS-05, WM-DASH-01, WM-DASH-02, WM-DASH-03, WM-DEBT-01, WM-DISPATCH-01, WM-DISPATCH-03, WM-DISPATCH-05, WM-DRV-06, WM-INC-01, WM-ORD-01, WM-ORD-02, WM-ORD-03, WM-PAY-03, WM-PAYROLL-01, WM-PAYROLL-02, WM-PAYROLL-05, WM-SET-01, WM-TRIP-01, WM-TRIP-02, WM-VEH-02 |
| [WM-SHELL-03](screens/wm/WM-SHELL-03.md) | Tìm kiếm nhanh | `(dialog) Ctrl K` | dialog | WM-COD-01, WM-CUS-02, WM-CUS-05, WM-DASH-02, WM-DASH-03, WM-DEBT-01, WM-DISPATCH-01, WM-DISPATCH-03, WM-DISPATCH-05, WM-DRV-02, WM-DRV-06, WM-EXP-02, WM-INC-01, WM-ORD-01, WM-ORD-02, WM-ORD-03, WM-PAY-02, WM-PAY-03, WM-PAYROLL-01, WM-PAYROLL-02, WM-PAYROLL-05, WM-TRIP-01, WM-TRIP-02, WM-VEH-02 |
| [WM-SHELL-04](screens/wm/WM-SHELL-04.md) | Import wizard | `(dialog) từ danh sách khách/xe/tài xế` | dialog | WM-CUS-01, WM-CUS-02, WM-CUS-03 |
| [WM-SHELL-05](screens/wm/WM-SHELL-05.md) | Export/print preview | `(page) …/export · …/print` | page | WM-DEBT-04 |
| [WM-SHELL-06](screens/wm/WM-SHELL-06.md) | Attachment viewer | `(drawer) ?attachment=:id` | drawer | WM-CUS-02, WM-ORD-02, WM-ORD-03, WM-ORD-04, WM-ORD-05, WM-ORD-07, WM-ORD-08, WM-ORD-09, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08, WM-STOP-01, WM-TRIP-01, WM-TRIP-02 |
| [WM-SHELL-07](screens/wm/WM-SHELL-07.md) | Timeline drawer | `(drawer) ?timeline=1` | drawer | WM-CUS-02, WM-EXP-02, WM-EXP-03, WM-INC-01, WM-ORD-02, WM-ORD-03, WM-ORD-04, WM-ORD-05, WM-ORD-06, WM-ORD-07, WM-ORD-08, WM-ORD-09, WM-PAY-03, WM-PAY-04, WM-SHELL-06, WM-SHELL-07, WM-TRIP-01, WM-TRIP-02 |
| [WM-SHELL-08](screens/wm/WM-SHELL-08.md) | Sensitive action modal | `(modal)` | dialog | WM-CUS-02, WM-EXP-02, WM-EXP-03, WM-ORD-02, WM-ORD-03, WM-ORD-04, WM-ORD-05, WM-ORD-06, WM-ORD-07, WM-ORD-08, WM-ORD-09, WM-PAY-03, WM-PAY-04, WM-SHELL-07, WM-TRIP-02 |

### Dashboard

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-DASH-01](screens/wm/WM-DASH-01.md) | Dashboard tổng quan | `/` | dashboard | WM-COD-01, WM-CUS-05, WM-DASH-02, WM-DASH-03, WM-DEBT-01, WM-DISPATCH-01, WM-DISPATCH-03, WM-DISPATCH-05, WM-DRV-06, WM-INC-01, WM-ORD-01, WM-ORD-02, WM-ORD-03, WM-PAY-03, WM-PAYROLL-01, WM-PAYROLL-02, WM-PAYROLL-05, WM-TRIP-01, WM-TRIP-02, WM-VEH-02 |
| [WM-DASH-02](screens/wm/WM-DASH-02.md) | Dashboard vận hành | `/dashboard/operations` | dashboard | WM-DISPATCH-01, WM-DISPATCH-02, WM-DISPATCH-03, WM-DISPATCH-04, WM-DRV-01, WM-DRV-02, WM-INC-01, WM-ORD-02, WM-TRIP-01, WM-TRIP-02, WM-VEH-01, WM-VEH-02 |
| [WM-DASH-03](screens/wm/WM-DASH-03.md) | Dashboard tài chính | `/dashboard/finance` | dashboard | WM-COD-01, WM-CUS-05, WM-DEBT-01, WM-DEBT-02, WM-DRV-06, WM-EXP-01, WM-FIN-01, WM-RPT-02, WM-RPT-03, WM-RPT-06, WM-RPT-07, WM-SHELL-05, WM-SUP-02 |

### Đơn hàng

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-ORD-01](screens/wm/WM-ORD-01.md) | Danh sách đơn hàng | `/orders` | list | WM-ORD-02, WM-ORD-03, WM-SHELL-05 |
| [WM-ORD-02](screens/wm/WM-ORD-02.md) | Chi tiết đơn hàng | `/orders/:orderId` | detail | WM-CUS-02, WM-DISPATCH-01, WM-DRV-02, WM-INC-01, WM-ORD-03, WM-ORD-04, WM-ORD-05, WM-ORD-07, WM-ORD-08, WM-ORD-09, WM-SHELL-07, WM-TRIP-01, WM-TRIP-02 |
| [WM-ORD-03](screens/wm/WM-ORD-03.md) | Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | form | WM-CUS-04, WM-CUS-05, WM-ORD-01, WM-ORD-02 |
| [WM-ORD-04](screens/wm/WM-ORD-04.md) | Điểm lấy/trả (tab) | `/orders/:orderId?tab=stops` | detail | WM-CUS-02, WM-ORD-02, WM-ORD-03, WM-ORD-05, WM-ORD-07, WM-ORD-08, WM-ORD-09, WM-SHELL-07, WM-STOP-01, WM-TRIP-02 |
| [WM-ORD-05](screens/wm/WM-ORD-05.md) | Hàng hóa (tab) | `/orders/:orderId?tab=cargo` | detail | WM-CUS-02, WM-ORD-02, WM-ORD-03, WM-ORD-04, WM-ORD-07, WM-ORD-08, WM-ORD-09, WM-SHELL-07, WM-TRIP-02 |
| [WM-ORD-06](screens/wm/WM-ORD-06.md) | Add-on & giá bán (drawer) | `/orders/:orderId?tab=finance (drawer)` | drawer | WM-CUS-02, WM-EXP-02, WM-EXP-03, WM-ORD-02, WM-ORD-03, WM-ORD-04, WM-ORD-05, WM-ORD-06, WM-ORD-07, WM-ORD-08, WM-ORD-09, WM-PAY-03, WM-PAY-04, WM-SHELL-07, WM-TRIP-02 |
| [WM-ORD-07](screens/wm/WM-ORD-07.md) | Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | detail | WM-CUS-02, WM-EXP-02, WM-EXP-03, WM-ORD-02, WM-ORD-03, WM-ORD-04, WM-ORD-05, WM-ORD-06, WM-ORD-08, WM-ORD-09, WM-PAY-03, WM-PAY-04, WM-SHELL-07, WM-TRIP-02 |
| [WM-ORD-08](screens/wm/WM-ORD-08.md) | Hủy/sửa nhạy cảm đơn | `(modal)` | dialog | WM-CUS-02, WM-EXP-02, WM-EXP-03, WM-ORD-02, WM-ORD-03, WM-ORD-04, WM-ORD-05, WM-ORD-06, WM-ORD-07, WM-ORD-08, WM-ORD-09, WM-PAY-03, WM-PAY-04, WM-SHELL-07, WM-TRIP-02 |
| [WM-ORD-09](screens/wm/WM-ORD-09.md) | In/chia sẻ đơn | `/orders/:orderId/print` | page | WM-ORD-02 |

### Điều phối

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-TRIP-01](screens/wm/WM-TRIP-01.md) | Chi tiết chuyến | `/trips/:tripId` | detail | WM-ADV-01, WM-COD-01, WM-CUS-02, WM-DISPATCH-04, WM-DISPATCH-05, WM-DRV-02, WM-EXP-02, WM-EXP-03, WM-INC-01, WM-ORD-02, WM-SHELL-05, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08, WM-STOP-01, WM-TRIP-01, WM-TRIP-02, WM-VEH-02 |
| [WM-TRIP-02](screens/wm/WM-TRIP-02.md) | Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | form | WM-DISPATCH-02, WM-DISPATCH-03, WM-ORD-02, WM-TRIP-01 |
| [WM-STOP-01](screens/wm/WM-STOP-01.md) | Chi tiết điểm dừng | `/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)` | drawer | WM-CUS-02, WM-DRV-02, WM-ORD-02, WM-SHELL-05, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08, WM-STOP-01, WM-TRIP-01, WM-TRIP-02, WM-VEH-02 |
| [WM-DISPATCH-01](screens/wm/WM-DISPATCH-01.md) | Bảng điều phối | `/dispatch` | board | WM-DISPATCH-02, WM-DISPATCH-03, WM-DISPATCH-04, WM-DISPATCH-05, WM-INC-01, WM-ORD-02, WM-TRIP-01, WM-TRIP-02 |
| [WM-DISPATCH-02](screens/wm/WM-DISPATCH-02.md) | Lịch xe/tài xế | `/dispatch/calendar` | board | WM-DISPATCH-01, WM-DISPATCH-03, WM-TRIP-01, WM-TRIP-02 |
| [WM-DISPATCH-03](screens/wm/WM-DISPATCH-03.md) | Cảnh báo lịch | `/dispatch/conflicts` | list | WM-DISPATCH-02, WM-SET-01, WM-SHELL-08, WM-TRIP-01, WM-TRIP-02 |
| [WM-DISPATCH-04](screens/wm/WM-DISPATCH-04.md) | Theo dõi vị trí | `/dispatch/map` | page | WM-DISPATCH-01, WM-TRIP-01, WM-VEH-02 |
| [WM-DISPATCH-05](screens/wm/WM-DISPATCH-05.md) | Sự cố vận hành | `/dispatch/incidents` | list | WM-INC-01, WM-ORD-02, WM-SHELL-05, WM-TRIP-01 |
| [WM-INC-01](screens/wm/WM-INC-01.md) | Chi tiết sự cố | `/dispatch/incidents/:incidentId` | detail | WM-DRV-02, WM-ORD-02, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08, WM-TRIP-01, WM-VEH-02 |

### Khách hàng

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-CUS-01](screens/wm/WM-CUS-01.md) | Danh sách khách hàng | `/customers` | list | WM-CUS-02, WM-CUS-03, WM-DEBT-01, WM-ORD-03, WM-PAY-03, WM-SHELL-04, WM-SHELL-05, WM-SHELL-08 |
| [WM-CUS-02](screens/wm/WM-CUS-02.md) | Chi tiết khách hàng | `/customers/:customerId` | detail | WM-CUS-03, WM-CUS-04, WM-CUS-05, WM-CUS-06, WM-DEBT-03, WM-DEBT-04, WM-ORD-02, WM-ORD-03, WM-PAY-03, WM-SHELL-07, WM-SHELL-08 |
| [WM-CUS-03](screens/wm/WM-CUS-03.md) | Form khách hàng | `/customers/new · /customers/:customerId/edit` | form | WM-CUS-02, WM-CUS-04 |
| [WM-CUS-04](screens/wm/WM-CUS-04.md) | Sổ địa chỉ/liên hệ | `/customers/:customerId/locations (tab)` | detail | WM-CUS-02, WM-CUS-03, WM-CUS-05, WM-CUS-06, WM-ORD-03, WM-PAY-03, WM-SHELL-07, WM-SHELL-08 |
| [WM-CUS-05](screens/wm/WM-CUS-05.md) | Công nợ khách | `/customers/:customerId?tab=debt` | detail | WM-CUS-02, WM-CUS-03, WM-CUS-04, WM-CUS-06, WM-DEBT-03, WM-DEBT-04, WM-ORD-02, WM-ORD-03, WM-PAY-02, WM-PAY-03, WM-PAY-04, WM-SHELL-05, WM-SHELL-07, WM-SHELL-08 |
| [WM-CUS-06](screens/wm/WM-CUS-06.md) | Lịch sử đơn khách | `/customers/:customerId?tab=orders` | detail | WM-CUS-02, WM-CUS-03, WM-CUS-04, WM-CUS-05, WM-ORD-02, WM-ORD-03, WM-PAY-03, WM-SHELL-05, WM-SHELL-07, WM-SHELL-08 |

### Tài xế

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-DRV-01](screens/wm/WM-DRV-01.md) | Danh sách tài xế | `/drivers` | list | WM-DISPATCH-02, WM-DRV-02, WM-DRV-03, WM-DRV-05, WM-DRV-06, WM-SHELL-04, WM-SHELL-05, WM-TRIP-01 |
| [WM-DRV-02](screens/wm/WM-DRV-02.md) | Chi tiết tài xế | `/drivers/:driverId` | detail | WM-ADV-01, WM-DISPATCH-02, WM-DRV-03, WM-DRV-04, WM-DRV-05, WM-EXP-03, WM-ORD-02, WM-PAYROLL-02, WM-SHELL-07, WM-SHELL-08, WM-TRIP-01 |
| [WM-DRV-03](screens/wm/WM-DRV-03.md) | Form tài xế | `/drivers/new · /drivers/:driverId/edit` | form | WM-DRV-02, WM-DRV-04 |
| [WM-DRV-04](screens/wm/WM-DRV-04.md) | Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | detail | WM-ADV-01, WM-DRV-02, WM-DRV-03, WM-DRV-05, WM-EXP-02, WM-EXP-03, WM-PAYROLL-01, WM-PAYROLL-02, WM-PAYROLL-04, WM-SHELL-07, WM-SHELL-08, WM-TRIP-01 |
| [WM-DRV-05](screens/wm/WM-DRV-05.md) | Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | detail | WM-ADV-01, WM-COD-01, WM-DRV-02, WM-DRV-03, WM-DRV-04, WM-DRV-06, WM-EXP-02, WM-EXP-03, WM-PAY-03, WM-SHELL-05, WM-SHELL-07, WM-SHELL-08, WM-TRIP-01 |
| [WM-DRV-06](screens/wm/WM-DRV-06.md) | COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | detail | WM-COD-01, WM-DRV-02, WM-DRV-03, WM-DRV-04, WM-DRV-05, WM-ORD-02, WM-PAY-02, WM-PAY-03, WM-SET-01, WM-SHELL-05, WM-SHELL-07, WM-SHELL-08, WM-STOP-01, WM-TRIP-01 |

### Xe

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-VEH-01](screens/wm/WM-VEH-01.md) | Danh sách xe | `/vehicles` | list | WM-EXP-01, WM-SHELL-04, WM-SHELL-05, WM-TRIP-01, WM-VEH-02, WM-VEH-03 |
| [WM-VEH-02](screens/wm/WM-VEH-02.md) | Chi tiết xe | `/vehicles/:vehicleId` | detail | WM-DISPATCH-02, WM-DRV-02, WM-EXP-02, WM-EXP-03, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08, WM-SUP-02, WM-TRIP-01, WM-VEH-03 |
| [WM-VEH-03](screens/wm/WM-VEH-03.md) | Form xe | `/vehicles/new · /vehicles/:vehicleId/edit` | drawer | WM-EXP-01, WM-SHELL-04, WM-SHELL-05, WM-TRIP-01, WM-VEH-01, WM-VEH-02, WM-VEH-03 |

### Nhà cung cấp

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-SUP-01](screens/wm/WM-SUP-01.md) | Danh sách NCC | `/suppliers` | list | WM-DEBT-02, WM-EXP-01, WM-SHELL-05, WM-SUP-02, WM-SUP-03 |
| [WM-SUP-02](screens/wm/WM-SUP-02.md) | Chi tiết NCC | `/suppliers/:supplierId` | detail | WM-DEBT-02, WM-EXP-01, WM-EXP-02, WM-EXP-03, WM-ORD-02, WM-SHELL-07, WM-SHELL-08, WM-SUP-03 |
| [WM-SUP-03](screens/wm/WM-SUP-03.md) | Form NCC | `/suppliers/new · /suppliers/:supplierId/edit` | drawer | WM-DEBT-02, WM-EXP-01, WM-SHELL-05, WM-SUP-01, WM-SUP-02, WM-SUP-03 |

### Thu chi & Công nợ

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-FIN-01](screens/wm/WM-FIN-01.md) | Sổ thu chi | `/finance` | list | WM-CUS-05, WM-DEBT-02, WM-DRV-05, WM-EXP-01, WM-EXP-02, WM-EXP-03, WM-PAY-01, WM-PAY-02, WM-PAY-03, WM-RPT-02, WM-SHELL-05 |
| [WM-PAY-01](screens/wm/WM-PAY-01.md) | Danh sách phiếu thu | `/finance/payments` | list | WM-COD-01, WM-CUS-05, WM-DEBT-01, WM-DRV-05, WM-PAY-02, WM-PAY-03, WM-PAY-04, WM-SHELL-05 |
| [WM-PAY-02](screens/wm/WM-PAY-02.md) | Chi tiết phiếu thu | `/finance/payments/:paymentId` | detail | WM-CUS-02, WM-CUS-05, WM-PAY-04, WM-SHELL-05, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08 |
| [WM-PAY-03](screens/wm/WM-PAY-03.md) | Tạo phiếu thu | `/finance/payments/new` | form | WM-COD-01, WM-DRV-05, WM-ORD-07, WM-PAY-01, WM-PAY-02, WM-PAY-04, WM-STOP-01, WM-TRIP-01 |
| [WM-PAY-04](screens/wm/WM-PAY-04.md) | Phân bổ payment | `/finance/payments/:paymentId/allocate` | form | WM-CUS-05, WM-ORD-02, WM-ORD-07, WM-PAY-02 |
| [WM-EXP-01](screens/wm/WM-EXP-01.md) | Danh sách phiếu chi | `/finance/expenses` | list | WM-ADV-01, WM-DEBT-02, WM-EXP-02, WM-EXP-03, WM-SHELL-05 |
| [WM-EXP-02](screens/wm/WM-EXP-02.md) | Chi tiết phiếu chi | `/finance/expenses/:expenseId` | detail | WM-DRV-02, WM-DRV-05, WM-ORD-07, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08, WM-TRIP-01, WM-VEH-02 |
| [WM-EXP-03](screens/wm/WM-EXP-03.md) | Tạo phiếu chi | `/finance/expenses/new` | form | WM-EXP-01, WM-EXP-02 |
| [WM-DEBT-01](screens/wm/WM-DEBT-01.md) | Công nợ khách tổng hợp | `/finance/customer-debt` | list | WM-CUS-05, WM-DEBT-03, WM-ORD-07, WM-PAY-02, WM-PAY-03, WM-RPT-06, WM-SHELL-05 |
| [WM-DEBT-02](screens/wm/WM-DEBT-02.md) | Công nợ NCC | `/finance/supplier-debt` | list | WM-EXP-01, WM-EXP-02, WM-EXP-03, WM-ORD-07, WM-SHELL-05, WM-SUP-02, WM-VEH-02 |
| [WM-DEBT-03](screens/wm/WM-DEBT-03.md) | Danh sách bảng kê công nợ | `/finance/debt-statements` | list | WM-DEBT-01, WM-DEBT-04, WM-SHELL-05 |
| [WM-DEBT-04](screens/wm/WM-DEBT-04.md) | Chi tiết bảng kê công nợ | `/finance/debt-statements/:statementId` | detail | WM-CUS-05, WM-ORD-07, WM-SHELL-05, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08 |
| [WM-COD-01](screens/wm/WM-COD-01.md) | COD tài xế đang giữ | `/finance/cod` | list | WM-DRV-01, WM-DRV-05, WM-ORD-07, WM-PAY-01, WM-PAY-02, WM-PAY-03, WM-SET-01, WM-SHELL-05, WM-STOP-01, WM-TRIP-01 |
| [WM-ADV-01](screens/wm/WM-ADV-01.md) | Tạm ứng chuyến & đối soát | `/finance/trip-advances` | list | WM-ADV-01, WM-DRV-05, WM-EXP-02, WM-EXP-03, WM-ORD-07, WM-PAY-03, WM-SHELL-08, WM-TRIP-01 |

### Lương

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-PAYROLL-01](screens/wm/WM-PAYROLL-01.md) | Danh sách bảng lương | `/payroll` | list | WM-PAYROLL-02, WM-PAYROLL-03, WM-PAYROLL-05, WM-RPT-08, WM-SET-01, WM-SHELL-05 |
| [WM-PAYROLL-02](screens/wm/WM-PAYROLL-02.md) | Chi tiết bảng lương | `/payroll/:payrollId` | detail | WM-CAT-01, WM-COD-01, WM-DRV-04, WM-EXP-02, WM-PAYROLL-04, WM-PAYROLL-05, WM-SHELL-05, WM-SHELL-07, WM-SHELL-08, WM-TRIP-01 |
| [WM-PAYROLL-03](screens/wm/WM-PAYROLL-03.md) | Tạo bảng lương | `/payroll/new` | form | WM-ADV-01, WM-CAT-01, WM-DRV-02, WM-DRV-04, WM-EXP-02, WM-PAYROLL-01, WM-PAYROLL-02, WM-SET-01, WM-TRIP-01 |
| [WM-PAYROLL-04](screens/wm/WM-PAYROLL-04.md) | Chi tiết dòng lương tài xế | `/payroll/:payrollId/lines/:lineId` | detail | WM-ADV-01, WM-DRV-02, WM-DRV-04, WM-DRV-05, WM-EXP-02, WM-ORD-02, WM-PAYROLL-02, WM-SHELL-05, WM-TRIP-01 |
| [WM-PAYROLL-05](screens/wm/WM-PAYROLL-05.md) | Duyệt bảng lương | `/payroll/:payrollId/approve` | dialog | WM-CAT-01, WM-COD-01, WM-DRV-04, WM-EXP-02, WM-PAYROLL-02, WM-PAYROLL-04, WM-PAYROLL-05, WM-SHELL-05, WM-SHELL-07, WM-SHELL-08, WM-TRIP-01 |

### Báo cáo

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-RPT-01](screens/wm/WM-RPT-01.md) | Trung tâm báo cáo | `/reports` | dashboard | WM-DASH-03, WM-RPT-02, WM-RPT-03, WM-RPT-04, WM-RPT-05, WM-RPT-06, WM-RPT-07, WM-RPT-08 |
| [WM-RPT-02](screens/wm/WM-RPT-02.md) | Doanh thu - chi phí - lãi/lỗ | `/reports/profit` | report | WM-CUS-02, WM-RPT-03, WM-SHELL-05 |
| [WM-RPT-03](screens/wm/WM-RPT-03.md) | Lãi/lỗ theo đơn | `/reports/profit?view=orders` | report | WM-ORD-02, WM-SHELL-05 |
| [WM-RPT-04](screens/wm/WM-RPT-04.md) | Hiệu suất xe | `/reports/vehicles` | report | WM-SHELL-05, WM-VEH-02 |
| [WM-RPT-05](screens/wm/WM-RPT-05.md) | Hiệu suất tài xế | `/reports/drivers` | report | WM-DRV-02, WM-DRV-06, WM-INC-01, WM-SHELL-05 |
| [WM-RPT-06](screens/wm/WM-RPT-06.md) | Công nợ khách | `/reports/customer-debt` | report | WM-CUS-05, WM-DEBT-01, WM-DEBT-03, WM-SHELL-05 |
| [WM-RPT-07](screens/wm/WM-RPT-07.md) | COD tài xế | `/reports/cod` | report | WM-COD-01, WM-DRV-06, WM-ORD-02, WM-PAY-02, WM-PAY-03, WM-SHELL-05 |
| [WM-RPT-08](screens/wm/WM-RPT-08.md) | Báo cáo bảng lương | `/reports/payroll` | report | WM-DRV-02, WM-PAYROLL-02, WM-SHELL-05 |

### Cài đặt

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-ORG-01](screens/wm/WM-ORG-01.md) | Hồ sơ nhà xe | `/settings/company` | form | WM-SHELL-05, WM-SHELL-07 |
| [WM-USER-01](screens/wm/WM-USER-01.md) | Danh sách nhân viên | `/settings/users` | list | WM-RBAC-01, WM-USER-02, WM-USER-03 |
| [WM-USER-02](screens/wm/WM-USER-02.md) | Chi tiết nhân viên | `/settings/users/:userId` | detail | WM-RBAC-01, WM-SHELL-07 |
| [WM-USER-03](screens/wm/WM-USER-03.md) | Mời/tạo nhân viên | `/settings/users/new (drawer)` | drawer | WM-RBAC-01, WM-USER-01, WM-USER-02, WM-USER-03 |
| [WM-RBAC-01](screens/wm/WM-RBAC-01.md) | Vai trò & phân quyền | `/settings/roles` | report | WM-SHELL-08, WM-USER-01, WM-USER-02 |
| [WM-SET-01](screens/wm/WM-SET-01.md) | Cài đặt vận hành | `/settings/operations` | form | WM-COD-01, WM-DEBT-01, WM-DISPATCH-03, WM-PAYROLL-01, WM-SHELL-07 |
| [WM-SET-02](screens/wm/WM-SET-02.md) | Cấu hình mã tự động | `/settings/numbering` | form | WM-DEBT-03, WM-DISPATCH-01, WM-EXP-01, WM-ORD-01, WM-PAY-01, WM-PAYROLL-01, WM-SHELL-07 |
| [WM-CAT-01](screens/wm/WM-CAT-01.md) | Danh mục dùng chung | `/settings/catalogs` | list | WM-EXP-03 |

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

## App Merchant (phase 2)

Stack: Flutter (apps/merchant-app, phase 2)

### Đăng nhập

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [MA-AUTH-01](screens/ma/MA-AUTH-01.md) | Đăng nhập | `MerchantLoginRoute` | auth | MA-HOME-01 |

### Tổng quan & thông báo

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [MA-HOME-01](screens/ma/MA-HOME-01.md) | Tổng quan mobile | `MerchantHomeRoute` | dashboard | MA-COD-01, MA-CUS-01, MA-FIN-01, MA-MAP-01, MA-NOTI-01, MA-ORD-01, MA-ORD-03, MA-PAYROLL-01, MA-TRIP-01, MA-TRIP-02 |
| [MA-NOTI-01](screens/ma/MA-NOTI-01.md) | Thông báo | `MerchantNotificationsRoute` | list | MA-COD-01, MA-ORD-02, MA-PAYROLL-01, MA-TRIP-01, MA-TRIP-02 |

### Đơn & chuyến

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [MA-ORD-01](screens/ma/MA-ORD-01.md) | Danh sách đơn | `MerchantOrderListRoute` | list | MA-CUS-01, MA-ORD-02, MA-ORD-03, MA-TRIP-01 |
| [MA-ORD-02](screens/ma/MA-ORD-02.md) | Chi tiết đơn | `MerchantOrderDetailRoute(orderId)` | detail | MA-CUS-02, MA-FIN-01, MA-TRIP-02, WM-ORD-02 |
| [MA-ORD-03](screens/ma/MA-ORD-03.md) | Tạo nhanh đơn | `MerchantQuickOrderCreateRoute` | form | MA-ORD-02 |
| [MA-TRIP-01](screens/ma/MA-TRIP-01.md) | Danh sách chuyến | `MerchantTripListRoute` | list | MA-MAP-01, MA-ORD-01, MA-TRIP-02 |
| [MA-TRIP-02](screens/ma/MA-TRIP-02.md) | Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | detail | MA-MAP-01, MA-ORD-02, WM-INC-01 |
| [MA-MAP-01](screens/ma/MA-MAP-01.md) | Theo dõi xe | `MerchantMapRoute` | page | MA-TRIP-02 |

### Khách hàng

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [MA-CUS-01](screens/ma/MA-CUS-01.md) | Khách hàng | `MerchantCustomerListRoute` | list | MA-CUS-02 |
| [MA-CUS-02](screens/ma/MA-CUS-02.md) | Chi tiết khách | `MerchantCustomerDetailRoute(customerId)` | detail | MA-ORD-02, MA-ORD-03, WM-CUS-05 |

### Tài chính & lương

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [MA-FIN-01](screens/ma/MA-FIN-01.md) | Tài chính nhanh | `MerchantFinanceRoute` | dashboard | MA-COD-01, MA-CUS-01, MA-CUS-02, MA-PAYROLL-01, WM-FIN-01 |
| [MA-COD-01](screens/ma/MA-COD-01.md) | COD tài xế | `MerchantCodRoute` | list | MA-TRIP-02 |
| [MA-PAYROLL-01](screens/ma/MA-PAYROLL-01.md) | Duyệt bảng lương | `MerchantPayrollApprovalRoute` | detail | WM-PAYROLL-02 |

### Báo cáo & tài khoản

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [MA-RPT-01](screens/ma/MA-RPT-01.md) | Báo cáo tóm tắt | `MerchantReportsRoute` | report | WM-RPT-01 |
| [MA-PROFILE-01](screens/ma/MA-PROFILE-01.md) | Tài khoản & cài đặt nhẹ | `MerchantProfileRoute` | page | MA-AUTH-01, MA-NOTI-01, WM-DASH-01 |

## Web Khách hàng (phase 3)

Stack: React + Vite (apps/customer-web, phase 3)

### Đăng nhập

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [CW-AUTH-01](screens/cw/CW-AUTH-01.md) | Đăng nhập/đăng ký khách | `/login` | auth | CW-AUTH-01, CW-HOME-01 |

### Tìm nhà xe

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [CW-HOME-01](screens/cw/CW-HOME-01.md) | Trang khám phá | `/` | list | CW-BOOK-01, CW-BOOK-02, CW-BOOK-03, CW-MER-01 |
| [CW-MER-01](screens/cw/CW-MER-01.md) | Hồ sơ nhà xe | `/merchants/:merchantId` | detail | CW-BOOK-01, CW-BOOK-02, CW-DEBT-01, CW-ORD-01 |

### Booking

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [CW-BOOK-01](screens/cw/CW-BOOK-01.md) | Tạo booking/yêu cầu vận chuyển | `/bookings/new` | form | CW-ADDR-01, CW-BOOK-03, CW-HOME-01, CW-MER-01 |
| [CW-BOOK-02](screens/cw/CW-BOOK-02.md) | Danh sách booking | `/bookings` | list | CW-BOOK-01, CW-BOOK-03, CW-ORD-01, CW-ORD-02 |
| [CW-BOOK-03](screens/cw/CW-BOOK-03.md) | Chi tiết booking | `/bookings/:bookingId` | detail | CW-MER-01, CW-ORD-01, CW-ORD-02 |

### Đơn hàng & công nợ

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [CW-ORD-01](screens/cw/CW-ORD-01.md) | Lịch sử đơn hàng | `/orders` | list | CW-BOOK-03, CW-DEBT-01, CW-ORD-02 |
| [CW-ORD-02](screens/cw/CW-ORD-02.md) | Chi tiết đơn khách | `/orders/:orderId` | detail | CW-BOOK-03, CW-DEBT-01, CW-MER-01 |
| [CW-DEBT-01](screens/cw/CW-DEBT-01.md) | Bảng kê/công nợ của tôi | `/debt-statements` | list | CW-ORD-01, CW-ORD-02 |

### Tài khoản

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [CW-PROFILE-01](screens/cw/CW-PROFILE-01.md) | Hồ sơ khách hàng | `/profile` | form | CW-ADDR-01, CW-AUTH-01, CW-DEBT-01, CW-MER-01, CW-NOTI-01 |
| [CW-ADDR-01](screens/cw/CW-ADDR-01.md) | Địa chỉ thường dùng | `/addresses` | list | CW-ADDR-01, CW-BOOK-01 |
| [CW-NOTI-01](screens/cw/CW-NOTI-01.md) | Thông báo khách | `/notifications` | list | CW-BOOK-03, CW-DEBT-01, CW-ORD-02, CW-PROFILE-01 |

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
