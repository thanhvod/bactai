# MA-FIN-01 — Tài chính nhanh

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Tài chính & lương |
| Route | `MerchantFinanceRoute` |
| Pattern | `dashboard` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 390×940 |
| Mockup | [../../mockups/MA-FIN-01.html](../../mockups/MA-FIN-01.html) · canvas artboard `MA-FIN-01.dc.html` |

## Mục đích

Cảnh báo tiền: nợ khách quá hạn, COD tài xế đang giữ, bảng lương chờ duyệt, thu/chi gần đây.

## Dữ liệu hiển thị

- `overdueDebtTotal`
- `overdueByCustomer[]`
- `codHeldTotal`
- `receivableTotal`
- `recentPayments[]`
- `recentExpenses[]`
- `pendingPayroll`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở khách quá hạn | debt.view |
| COD tài xế | driver.ledger.view |
| Duyệt bảng lương | payroll.view |
| Sổ thu chi trên web | finance.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| KPI nợ quá hạn → khách hàng | [MA-CUS-01](../ma/MA-CUS-01.md) Khách hàng | `MerchantCustomerListRoute` | action |
| KPI COD → COD tài xế | [MA-COD-01](../ma/MA-COD-01.md) COD tài xế | `MerchantCodRoute` | action |
| Mở khách Công ty Gạo Miền Tây | [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | `MerchantCustomerDetailRoute(customerId)` | action |
| Mở khách Vật liệu Xây dựng Phú Mỹ | [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | `MerchantCustomerDetailRoute(customerId)` | action |
| Mở danh sách khách hàng | [MA-CUS-01](../ma/MA-CUS-01.md) Khách hàng | `MerchantCustomerListRoute` | action |
| Mở bảng lương chờ duyệt | [MA-PAYROLL-01](../ma/MA-PAYROLL-01.md) Duyệt bảng lương | `MerchantPayrollApprovalRoute` | action |
| Mở sổ thu chi trên Web Merchant | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | action |
| Bottom nav: Tổng quan | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | nav |
| Bottom nav: Đơn/Chuyến | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | nav |
| Bottom nav: Tài chính | [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | `MerchantFinanceRoute` | nav |
| Bottom nav: Báo cáo | [MA-RPT-01](../ma/MA-RPT-01.md) Báo cáo tóm tắt | `MerchantReportsRoute` | nav |
| Bottom nav: Tài khoản | [MA-PROFILE-01](../ma/MA-PROFILE-01.md) Tài khoản & cài đặt nhẹ | `MerchantProfileRoute` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | KPI nợ quá hạn → tài chính nhanh |
| [MA-ORD-02](../ma/MA-ORD-02.md) Chi tiết đơn | Mở tài chính nhanh |
| [MA-COD-01](../ma/MA-COD-01.md) COD tài xế | Quay lại |

## Components (design system)

`MobileHeader`, `KpiCard`, `StatusBadge`, `BottomNav`

## API (GraphQL)

- `customerDebt(filter: {overdue: true})`
- `driverCodHeld(filter)`
- `payments(first: 3)`
- `expenses(first: 3)`
- `payrolls(filter: {status: SUBMITTED})`

## Trạng thái UI

- **forbidden**: Operation không có finance.view → tab Tài chính chỉ hiện COD tài xế
- **loading**: Skeleton
- **error**: Banner danger + Thử lại
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Phiếu thu COD tài xế nộp hiển thị kèm 'không phải doanh thu'.
- Trang cuộn; mockup cao 940.
