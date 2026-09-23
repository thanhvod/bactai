# BTA — Screen index

Sinh tự động bởi `python3 design/tools/build.py`. Không sửa tay.

## Web Merchant (phase 1)

Stack: React + Vite + Tailwind + shadcn/Radix (apps/web)

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
