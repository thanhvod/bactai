# BTA — Screen index

Sinh tự động bởi `python3 design/tools/build.py`. Không sửa tay.

## Web Merchant (phase 1)

Stack: React + Vite + Tailwind + shadcn/Radix (apps/web)

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
