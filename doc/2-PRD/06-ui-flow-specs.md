# PRD — UI Flow Specs

> Ngày lập: 2026-09-23
> Mục tiêu: mô tả các luồng UI nghiệp vụ lớn để Claude Design dựng prototype/wireflow và Claude Code hiểu thứ tự màn hình/action.

## 1. Flow notation

- `Screen` là mã màn hình trong `01-danh-sach-man-hinh.md`.
- `Action` là thao tác chính của user.
- `System` là phản hồi backend/UI.
- `Guard` là permission/validation.

## 2. FLOW-AUTH-MERCHANT — Merchant login/onboarding

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | User | WM-AUTH-01 | Click Google login |
| 2 | System | WM-AUTH-01 | Firebase returns ID token |
| 3 | System | API | Verify token and lookup merchant memberships |
| 4a | System | WM-DASH-01 | If exactly one merchant, enter dashboard |
| 4b | System | WM-AUTH-03 | If multiple merchants, show merchant selector |
| 4c | System | WM-AUTH-04 | If no merchant, show pending/create option |
| 5 | User | WM-AUTH-02 | If creating merchant, enter company/contact info |
| 6 | System | API | Create merchant, seed catalogs, assign admin role |
| 7 | System | WM-DASH-01 | Open dashboard |

Acceptance:

- Login has no email/password form.
- Invalid token shows clear error.
- No cross-tenant data after merchant switch.

## 3. FLOW-MASTER-DATA — CRUD danh mục nền

Applies to customer, driver, vehicle, supplier.

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | User | List screen | Search/filter records |
| 2 | User | List screen | Click create |
| 3 | User | Form screen | Fill required fields |
| 4 | System | API | Validate uniqueness/required fields |
| 5 | System | Detail screen | Open created detail |
| 6 | User | Detail screen | Edit / add attachments / view timeline |

Special cases:

- Customer has address book and debt tabs.
- Driver has salary history and app account.
- Vehicle plate unique per merchant.
- Supplier links to expense/debt.

Acceptance:

- Inactive records cannot be selected in new transactions.
- Existing historical references still display inactive record label.

## 4. FLOW-ORDER-ONE-TRUCK — Tạo đơn 1 xe nhanh

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | Operation | WM-ORD-01 | Click "Tạo đơn" |
| 2 | Operation | WM-ORD-03 | Select customer or create quick customer |
| 3 | Operation | WM-ORD-03 | Select pickup/dropoff from customer address book or enter manually |
| 4 | Operation | WM-ORD-03 | Enter cargo quick line, freight amount, due date, COD expected if any |
| 5 | Operation | WM-ORD-03 | Add add-on services if needed |
| 6 | System | API | Create order code DH, stops, cargo, addons |
| 7 | System | WM-ORD-02 | Open order detail |
| 8 | Operation | WM-TRIP-02 | Create trip from order, default assign all stops |
| 9 | Operation | WM-TRIP-02 | Select vehicle, driver, planned time |
| 10 | System | API | Check overlap warnings |
| 11 | Operation | WM-TRIP-02 | Save trip; override warning with reason if allowed |
| 12 | System | WM-DISPATCH-01 | Trip appears in dispatch |
| 13 | System | DA-HOME-01 | Driver sees assigned job |

Acceptance:

- Common one-truck order does not force user through complex multi-trip flow.
- Trip assignment can be completed from order detail.
- Warning is soft but audited when overridden.

## 5. FLOW-ORDER-MULTI-TRUCK — Đơn nhiều xe

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | Operation | WM-ORD-03 | Create order with all stops/cargo and total freight |
| 2 | Operation | WM-ORD-02 | Open Trips tab |
| 3 | Operation | WM-TRIP-02 | Create Trip A, select stops subset |
| 4 | Operation | WM-TRIP-02 | Create Trip B, select remaining/subset stops |
| 5 | System | WM-ORD-02 | Trips tab shows coverage of stops |
| 6 | Operation | WM-ORD-02 | Verify all required stops assigned |

Acceptance:

- Freight remains on order, not split by trip.
- Costs/driver bonuses can be per trip.
- Order completion requires all trips/stops completed unless manually overridden.

## 6. FLOW-DRIVER-FIELD — Driver status, POD, COD

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | Driver | DA-HOME-01 | Open active trip |
| 2 | Driver | DA-TRIP-01 | Review stops/cargo/notes/COD |
| 3 | Driver | DA-STATUS-01 | Update trip status: going to pickup |
| 4 | Driver | DA-STOP-02 | Mark arrived/completed pickup |
| 5 | Driver | DA-STATUS-01 | Update transporting/delivering |
| 6 | Driver | DA-STOP-02 | At delivery, enter COD if collected |
| 7 | Driver | DA-POD-01 | Capture POD |
| 8 | Driver | DA-STOP-02 | Mark stop completed |
| 9 | System | API | Update stop, attachment, COD, status history |
| 10 | Operation | WM-TRIP-01 / WM-ORD-02 | Sees status, POD, COD |

Offline branch:

- If offline, status/POD/COD/GPS go to local queue.
- DA-SYNC-01 shows pending and retry.
- On reconnect, sync in captured order if possible.

Acceptance:

- COD edit after save requires reason.
- POD attaches to correct stop.
- Driver cannot update another driver's trip.

## 7. FLOW-PAYMENT-ALLOCATION — Khách thanh toán và phân bổ

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | Accountant | WM-DEBT-01 / WM-CUS-05 | Open customer debt |
| 2 | Accountant | WM-PAY-03 | Create customer payment |
| 3 | System | WM-PAY-02 | Payment detail shows unallocated amount |
| 4 | Accountant | WM-PAY-04 | Allocate amount to open orders |
| 5 | System | API | Validate allocation amounts |
| 6 | System | WM-CUS-05 | Update customer debt and credit |

Acceptance:

- Payment can allocate to multiple orders.
- Unallocated amount becomes customer credit.
- Allocation cannot cross customer/merchant.

## 8. FLOW-COD-REMITTANCE — Tài xế nộp COD

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | Driver | DA-COD-01 | Enters COD actual at stop |
| 2 | System | WM-COD-01 | COD held appears for driver |
| 3 | Accountant | WM-COD-01 | Select driver COD item(s) |
| 4 | Accountant | WM-PAY-03 | Create payment type DRIVER_COD_REMITTANCE |
| 5 | System | API | Reduce driver COD held |
| 6 | System | WM-DRV-05 | Driver ledger updated |

Acceptance:

- COD remittance is not revenue.
- COD held warning clears/reduces after remittance.
- Payment has audit and receipt attachment if provided.

## 9. FLOW-DEBT-STATEMENT — Chốt bảng kê công nợ

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | Accountant | WM-DEBT-01 | Filter customer/date range |
| 2 | Accountant | WM-DEBT-03 | Create debt statement |
| 3 | System | WM-DEBT-04 | Preview statement lines |
| 4 | Accountant | WM-DEBT-04 | Finalize statement |
| 5 | System | API | Snapshot lines and render PDF |
| 6 | Accountant | WM-SHELL-05 | Download/share PDF manually |
| 7 | Accountant | WM-DEBT-04 | Mark sent if needed |

Acceptance:

- Finalized statement does not change when payment/order changes later.
- Cancel finalized statement requires reason.

## 10. FLOW-PAYROLL — Tạo và duyệt bảng lương

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | Operation | WM-PAYROLL-03 | Select payroll period |
| 2 | System | API | Generate driver lines from salary history, trip bonus, advances, deductions |
| 3 | Operation | WM-PAYROLL-02 | Review payroll detail |
| 4 | Operation | WM-PAYROLL-04 | Add deduction if needed |
| 5 | Operation | WM-PAYROLL-02 | Submit for approval |
| 6 | Director/Admin | WM-PAYROLL-05 or MA-PAYROLL-01 | Approve/return |
| 7 | Accountant | WM-SHELL-05 | Export payroll |
| 8 | Accountant | WM-PAYROLL-02 | Mark paid |

Acceptance:

- Payroll uses snapshot values.
- Only admin/director can approve.
- Return/cancel requires reason.

## 11. FLOW-BOOKING-CUSTOMER — Customer booking to order

| Step | Actor | Screen | Action/System |
|---:|---|---|---|
| 1 | Customer | CW-HOME-01 | Find merchant |
| 2 | Customer | CW-MER-01 | View merchant profile |
| 3 | Customer | CW-BOOK-01 | Submit booking request |
| 4 | System | CW-BOOK-03 | Booking created, status pending |
| 5 | Operation | Web Merchant booking inbox/future entry | Review booking |
| 6 | Operation | WM-ORD-03 | Convert booking to order; can edit price/stops/cargo |
| 7 | System | API | Link booking to order |
| 8 | Customer | CW-BOOK-03 / CW-ORD-02 | Sees booking converted/order created if visible |

Acceptance:

- Booking never auto-becomes order.
- Operation can edit before creating order.
- Customer only sees own booking/order.

