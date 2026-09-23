# BTA — Screen index

Sinh tự động bởi `python3 design/tools/build.py`. Không sửa tay.

## Web Merchant (phase 1)

Stack: React + Vite + Tailwind + shadcn/Radix (apps/web)

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
