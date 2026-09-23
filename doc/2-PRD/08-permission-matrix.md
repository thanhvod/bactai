# PRD — Permission Matrix

> Ngày lập: 2026-09-23
> Mục tiêu: định nghĩa quyền theo role/action để UI và backend guard không lệch.

## 1. Roles

| Role | Mô tả |
|---|---|
| `admin` | Chủ nhà xe/giám đốc, toàn quyền merchant |
| `operation` | Nhân viên vận hành, tạo đơn, điều phối, cập nhật trạng thái |
| `accountant` | Kế toán, thu chi, công nợ, bảng lương view/export |
| `driver` | Tài xế, chỉ xem/cập nhật chuyến được giao |
| `customer` | Khách hàng cuối, chỉ xem booking/order/bảng kê của mình |

## 2. Permission principles

- Backend là nguồn enforce cuối cùng.
- UI có thể hide/disable nhưng không thay backend guard.
- Sensitive action cần permission riêng và reason.
- Read permission không tự kéo theo write permission.

## 3. Web Merchant permissions

| Action | admin | operation | accountant | Notes |
|---|---:|---:|---:|---|
| View dashboard | ✅ | ✅ | ✅ | Cards theo role |
| Manage merchant profile/settings | ✅ | ❌ | ❌ | Settings ảnh hưởng toàn merchant |
| Manage users/roles | ✅ | ❌ | ❌ | RBAC |
| Manage catalogs | ✅ | ✅ | ⚠️ | Accountant có thể view; edit tùy merchant |
| View customers | ✅ | ✅ | ✅ |  |
| Create/edit customers | ✅ | ✅ | ✅ | Kế toán cần update thông tin hóa đơn/liên hệ |
| Deactivate customer | ✅ | ⚠️ | ❌ | Sensitive nếu có order |
| View drivers | ✅ | ✅ | ✅ |  |
| Create/edit drivers | ✅ | ✅ | ❌ |  |
| Manage driver salary history | ✅ | ⚠️ | ❌ | Operation nếu được cấp |
| Create/reset driver app account | ✅ | ✅ | ❌ |  |
| View vehicles | ✅ | ✅ | ✅ |  |
| Create/edit vehicles | ✅ | ✅ | ❌ |  |
| View suppliers | ✅ | ✅ | ✅ |  |
| Create/edit suppliers | ✅ | ✅ | ✅ |  |

Legend: ✅ allowed, ❌ denied, ⚠️ allowed only if extra permission granted.

## 4. Order/dispatch permissions

| Action | admin | operation | accountant | Sensitive reason? |
|---|---:|---:|---:|---:|
| View orders/trips | ✅ | ✅ | ✅ | No |
| Create order | ✅ | ✅ | ⚠️ | No |
| Edit draft order | ✅ | ✅ | ⚠️ | No |
| Edit confirmed order price | ✅ | ⚠️ | ❌ | Yes |
| Cancel order | ✅ | ⚠️ | ❌ | Yes |
| Edit completed order | ✅ | ⚠️ | ❌ | Yes |
| Create/edit stops/cargo/add-ons | ✅ | ✅ | ⚠️ | Sometimes |
| Create trip | ✅ | ✅ | ❌ | No |
| Assign vehicle/driver | ✅ | ✅ | ❌ | No |
| Override overlap warning | ✅ | ⚠️ | ❌ | Yes |
| Update trip/stop status on web | ✅ | ✅ | ❌ | Reason if cancel/reverse/pause |
| Reverse completed status | ✅ | ⚠️ | ❌ | Yes |
| Manage incidents | ✅ | ✅ | ⚠️ | Close with note |

## 5. Driver permissions

| Action | driver |
|---|---:|
| View assigned trip/job | ✅ |
| View other driver's trip | ❌ |
| Update own trip/stop status | ✅ |
| Pause own trip with reason | ✅ |
| Upload POD/chứng từ for own trip | ✅ |
| Enter COD actual for own stop | ✅ |
| Edit COD actual after submit | ⚠️ reason required; backend may restrict by time/status |
| Report incident for own trip | ✅ |
| View own money/bonus/advance summary | ✅ |

## 6. Finance permissions

| Action | admin | operation | accountant | Sensitive reason? |
|---|---:|---:|---:|---:|
| View finance | ✅ | ⚠️ | ✅ | No |
| Create expense | ✅ | ✅ | ✅ | No |
| Edit/cancel expense | ✅ | ⚠️ | ✅ | Yes |
| Mark expense paid | ✅ | ❌ | ✅ | No |
| Create payment in | ✅ | ⚠️ | ✅ | No |
| Edit/cancel payment in | ✅ | ❌ | ✅ | Yes |
| Allocate payment | ✅ | ❌ | ✅ | No |
| View customer debt | ✅ | ✅ | ✅ | No |
| Create debt statement | ✅ | ❌ | ✅ | No |
| Finalize/cancel debt statement | ✅ | ❌ | ✅ | Cancel yes |
| View supplier debt | ✅ | ⚠️ | ✅ | No |
| View driver ledger/COD | ✅ | ✅ | ✅ | No |
| Record driver COD remittance | ✅ | ❌ | ✅ | No |
| Trip advance reconciliation | ✅ | ✅ | ✅ | Yes if adjustment |

## 7. Payroll permissions

| Action | admin | operation | accountant | Sensitive reason? |
|---|---:|---:|---:|---:|
| View payroll | ✅ | ✅ | ✅ | No |
| Generate payroll draft | ✅ | ✅ | ❌ | No |
| Edit payroll draft lines | ✅ | ✅ | ❌ | Yes for deductions |
| Submit payroll | ✅ | ✅ | ❌ | No |
| Approve payroll | ✅ | ❌ | ❌ | Optional note |
| Return/cancel approved payroll | ✅ | ❌ | ❌ | Yes |
| Mark payroll paid | ✅ | ❌ | ✅ | No |
| Export payroll | ✅ | ❌ | ✅ | No |

## 8. App Merchant permissions

App Merchant reuses merchant roles:

- Admin: dashboard, monitor order/trip, finance summary, approve payroll.
- Operation: dashboard, monitor order/trip, quick order, incident/status actions.
- Accountant: finance/COD/payroll export or approval visibility where allowed.

All App Merchant actions must call same backend permission checks as Web Merchant.

## 9. Customer Web permissions

| Action | customer |
|---|---:|
| View public merchant profile | ✅ |
| Create booking | ✅ |
| View own booking | ✅ |
| Cancel/edit own booking before accepted | ⚠️ business rule |
| View own order history | ✅ if merchant exposes |
| View POD/chứng từ | ✅ only if shared |
| Download debt statement | ✅ only if finalized and shared/sent |
| View other customer data | ❌ |

## 10. Sensitive action list

Always require reason:

- Edit confirmed order price.
- Cancel order/trip.
- Reverse completed status.
- Edit completed order.
- Edit/cancel payment.
- Edit/cancel expense.
- Edit COD actual after submit.
- Cancel debt statement.
- Return/cancel approved payroll.
- Override overlap warning.

