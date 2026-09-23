# BTA — Screen index

Sinh tự động bởi `python3 design/tools/build.py`. Không sửa tay.

## Web Merchant (phase 1)

Stack: React + Vite + Tailwind + shadcn/Radix (apps/web)

### Điều phối

| ID | Màn hình | Route | Pattern | Đi tới |
|---|---|---|---|---|
| [WM-TRIP-01](screens/wm/WM-TRIP-01.md) | Chi tiết chuyến | `/trips/:tripId` | detail | WM-ADV-01, WM-COD-01, WM-CUS-02, WM-DISPATCH-04, WM-DISPATCH-05, WM-DRV-02, WM-EXP-02, WM-EXP-03, WM-INC-01, WM-ORD-02, WM-SHELL-05, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08, WM-STOP-01, WM-TRIP-02, WM-VEH-02 |
| [WM-TRIP-02](screens/wm/WM-TRIP-02.md) | Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | form | WM-DISPATCH-02, WM-DISPATCH-03, WM-ORD-02, WM-TRIP-01 |
| [WM-STOP-01](screens/wm/WM-STOP-01.md) | Chi tiết điểm dừng | `/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)` | drawer | WM-CUS-02, WM-DRV-02, WM-ORD-02, WM-SHELL-05, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08, WM-STOP-01, WM-TRIP-01, WM-TRIP-02, WM-VEH-02 |
| [WM-DISPATCH-01](screens/wm/WM-DISPATCH-01.md) | Bảng điều phối | `/dispatch` | board | WM-DISPATCH-02, WM-DISPATCH-03, WM-DISPATCH-04, WM-DISPATCH-05, WM-INC-01, WM-ORD-02, WM-TRIP-01, WM-TRIP-02 |
| [WM-DISPATCH-02](screens/wm/WM-DISPATCH-02.md) | Lịch xe/tài xế | `/dispatch/calendar` | board | WM-DISPATCH-01, WM-DISPATCH-03, WM-TRIP-01, WM-TRIP-02 |
| [WM-DISPATCH-03](screens/wm/WM-DISPATCH-03.md) | Cảnh báo lịch | `/dispatch/conflicts` | list | WM-DISPATCH-02, WM-SET-01, WM-SHELL-08, WM-TRIP-01, WM-TRIP-02 |
| [WM-DISPATCH-04](screens/wm/WM-DISPATCH-04.md) | Theo dõi vị trí | `/dispatch/map` | page | WM-DISPATCH-01, WM-TRIP-01 |
| [WM-DISPATCH-05](screens/wm/WM-DISPATCH-05.md) | Sự cố vận hành | `/dispatch/incidents` | list | WM-INC-01, WM-ORD-02, WM-SHELL-05, WM-TRIP-01 |
| [WM-INC-01](screens/wm/WM-INC-01.md) | Chi tiết sự cố | `/dispatch/incidents/:incidentId` | detail | WM-DRV-02, WM-ORD-02, WM-SHELL-06, WM-SHELL-07, WM-SHELL-08, WM-TRIP-01, WM-VEH-02 |

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
