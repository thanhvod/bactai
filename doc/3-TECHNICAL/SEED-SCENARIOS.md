# TECHNICAL — Demo Seed Scenarios

> Ngày lập: 2026-09-23
> Mục tiêu: định nghĩa dữ liệu seed để test UI, E2E, tenant isolation và các trạng thái nghiệp vụ quan trọng.

## 1. Seed principles

- Có ít nhất 2 merchant để test tenant isolation.
- Merchant demo chính phải có dữ liệu đủ cho dashboard, order, dispatch, finance, payroll, driver app.
- Dữ liệu seed phải deterministic: mã, ngày tương đối hoặc fixed date rõ.
- Không dùng dữ liệu thật nhạy cảm.
- Tiền VND lưu integer.

## 2. Merchants

### Merchant A — BTA Demo Transport

- Code: `M-DEMO-A`
- Name: `BTA Demo Transport`
- Settings:
  - Payroll period: monthly.
  - Near overlap threshold: 2 hours.
  - COD warning amount: 5,000,000 VND.
  - COD warning days: 2 days.
  - Default customer debt days: 15.

### Merchant B — Tenant Isolation Transport

- Code: `M-DEMO-B`
- Minimal data only.
- Purpose: prove merchant A user cannot see merchant B data.

## 3. Users and roles

Merchant A:

| Email | Role | Purpose |
|---|---|---|
| `admin@bta-demo.test` | admin | approve payroll, settings |
| `operation@bta-demo.test` | operation | create order/dispatch |
| `accountant@bta-demo.test` | accountant | finance/payroll export |

Merchant B:

| Email | Role |
|---|---|
| `admin@tenant-b.test` | admin |

## 4. Customers

Merchant A:

| Code | Name | Debt limit | Default debt days | Notes |
|---|---|---:|---:|---|
| `CUS-A-001` | Công ty Gạo Miền Tây | 100,000,000 | 15 | Has overdue debt |
| `CUS-A-002` | Kho Thép An Phát | 200,000,000 | 20 | Multi-stop orders |
| `CUS-A-003` | Bao bì Hưng Lợi | 50,000,000 | 7 | Has credit balance |

Customer locations:

- Gạo Miền Tây:
  - Kho Cần Thơ, contact Anh Nam.
  - Kho Bình Dương, contact Chị Hạnh.
- Thép An Phát:
  - Nhà máy Long An.
  - Công trình Quận 7.
  - Công trình Thủ Đức.

## 5. Drivers

| Code | Name | Phone | Fixed salary | Status | Notes |
|---|---|---|---:|---|---|
| `DRV-A-001` | Nguyễn Văn Tài | `0900000001` | 10,000,000 | active | Has active trip |
| `DRV-A-002` | Trần Minh Lái | `0900000002` | 11,000,000 | active | Has COD held |
| `DRV-A-003` | Phạm Văn Dự | `0900000003` | 9,500,000 | inactive | Should not be selectable |

Salary history:

- DRV-A-001: 9,000,000 old, 10,000,000 current.
- DRV-A-002: 11,000,000 current.

## 6. Vehicles

| Code | Plate | Type | Capacity | Status |
|---|---|---|---:|---|
| `VEH-A-001` | `51C-123.45` | Tải thùng | 8 tấn | active |
| `VEH-A-002` | `51D-678.90` | Mui bạt | 15 tấn | active |
| `VEH-A-003` | `51H-111.22` | Xe lạnh | 5 tấn | maintenance |

## 7. Suppliers

| Code | Name | Type | Notes |
|---|---|---|---|
| `SUP-A-001` | Chành Xe Miền Trung | transport | external transport |
| `SUP-A-002` | Xăng dầu Minh Phát | fuel | vehicle expense |
| `SUP-A-003` | Gara Đại Lộc | repair | maintenance |

## 8. Orders and trips

### Order 1 — Simple active one-truck order

- Code: `DH-202609-0001`
- Customer: Gạo Miền Tây.
- Freight: 12,000,000.
- Add-on: bốc xếp 500,000.
- Stops:
  - Pickup: Kho Cần Thơ.
  - Dropoff: Kho Bình Dương, COD expected 12,500,000.
- Trip:
  - Code: `CX-202609-0001`.
  - Driver: Nguyễn Văn Tài.
  - Vehicle: `51C-123.45`.
  - Status: transporting.
  - Has GPS last known location.

### Order 2 — Multi-truck order

- Code: `DH-202609-0002`
- Customer: Kho Thép An Phát.
- Freight: 35,000,000.
- Stops:
  - Pickup: Nhà máy Long An.
  - Dropoff 1: Công trình Quận 7.
  - Dropoff 2: Công trình Thủ Đức.
- Trips:
  - Trip A assigned Driver 1, Vehicle 1, Dropoff 1.
  - Trip B assigned Driver 2, Vehicle 2, Dropoff 2.

### Order 3 — Completed unpaid overdue order

- Code: `DH-202608-0009`
- Customer: Gạo Miền Tây.
- Freight + add-ons: 20,000,000.
- Paid: 5,000,000.
- Remaining: 15,000,000.
- Due date: past by 10 days.
- Status: completed.
- Has POD.

### Order 4 — Cancelled with expense

- Code: `DH-202609-0004`
- Status: cancelled.
- Has trip expense 1,000,000.
- Purpose: test cancelled order retains cost.

## 9. Finance seed

Payments:

- `PT-202609-0001`: Customer payment 5,000,000 allocated to Order 3.
- `PT-202609-0002`: Customer payment 3,000,000 unallocated for Bao bì Hưng Lợi, creates credit.
- `PT-202609-0003`: Driver COD remittance 2,000,000 from Trần Minh Lái.

Expenses:

- `PC-202609-0001`: Toll expense 800,000 on Trip 1, driver paid first, reimbursable.
- `PC-202609-0002`: Fuel expense 2,500,000, supplier Xăng dầu Minh Phát, unpaid.
- `PC-202609-0003`: External transport cost 8,000,000 on Order 2, supplier Chành Xe Miền Trung.
- `PC-202609-0004`: Trip advance 2,000,000 to Nguyễn Văn Tài.

COD:

- Driver Trần Minh Lái has COD actual collected 7,500,000, remitted 2,000,000, held 5,500,000, over warning amount.

## 10. Payroll seed

Payroll draft:

- Code: `BL-202609-0001`.
- Period: September 2026.
- Status: submitted/pending approval.
- Driver lines:
  - Nguyễn Văn Tài: salary 10,000,000, bonus 1,500,000, advances 2,000,000, net 9,500,000.
  - Trần Minh Lái: salary 11,000,000, bonus 2,000,000, deductions 500,000, net 12,500,000.

## 11. Incidents and notifications

Incident:

- Trip 1 has incident "kẹt xe", severity medium, status open, one image attachment optional.

Notifications:

- Operation: overlap warning/action needed.
- Accountant: COD held over threshold.
- Admin: payroll pending approval.
- Driver: new assigned trip.

## 12. Attachments

Create placeholder metadata for:

- POD image on completed order.
- Expense receipt on toll expense.
- Incident image.
- Debt statement PDF once PDF task exists.

Files may be placeholder local fixtures in dev storage.

## 13. E2E scenarios enabled by seed

| Scenario | Uses seed |
|---|---|
| Tenant isolation | Merchant A/B users |
| Dashboard warnings | overdue debt, COD held, incident, payroll pending |
| Order detail | Order 1/2/3 |
| Driver app active trip | Trip 1 |
| Payment allocation | Order 3 |
| Supplier debt | unpaid fuel expense |
| Driver ledger | COD held + reimbursable toll |
| Payroll approval | Payroll draft |
| Incident handling | Trip 1 incident |

