# BTA — Screen index

Sinh tự động bởi `python3 design/tools/build.py`. Không sửa tay.

## Web Merchant (phase 1)

Stack: React + Vite + Tailwind + shadcn/Radix (apps/web)

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
