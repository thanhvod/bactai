# MA-RPT-01 — Báo cáo tóm tắt

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Báo cáo & tài khoản |
| Route | `MerchantReportsRoute` |
| Pattern | `report` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×900 |
| Mockup | [../../mockups/MA-RPT-01.html](../../mockups/MA-RPT-01.html) · canvas artboard `MA-RPT-01.dc.html` |

## Mục đích

Doanh thu, chi phí, lãi/lỗ, tiền đã thu, công nợ theo kỳ; xem sâu trên web.

## Dữ liệu hiển thị

- `revenue`
- `cost`
- `profit`
- `cashIn`
- `weeklySeries[]`
- `receivable`
- `overdue`
- `supplierPayable`
- `codHeld`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đổi kỳ | report.view |
| Xem sâu trên web | deep link /reports |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở trung tâm báo cáo trên Web Merchant | WM-RPT-01 | | action |
| Bottom nav: Tổng quan | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | nav |
| Bottom nav: Đơn/Chuyến | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | nav |
| Bottom nav: Tài chính | [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | `MerchantFinanceRoute` | nav |
| Bottom nav: Báo cáo | [MA-RPT-01](../ma/MA-RPT-01.md) Báo cáo tóm tắt | `MerchantReportsRoute` | nav |
| Bottom nav: Tài khoản | [MA-PROFILE-01](../ma/MA-PROFILE-01.md) Tài khoản & cài đặt nhẹ | `MerchantProfileRoute` | nav |

## Điều hướng đến (incoming)

- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.

## Components (design system)

`MobileHeader`, `SegmentedControl`, `BarChart`, `Button`, `BottomNav`

## API (GraphQL)

- `reportProfit(filter: {period})`
- `reportCustomerDebt(filter)`
- `reportCodHeld(filter)`
- `dashboardSummary(filter)`

## Trạng thái UI

- **loading**: Skeleton số + chart
- **empty**: Kỳ chưa có dữ liệu → số 0 + ghi chú
- **forbidden**: Operation không có finance.view → chỉ số vận hành
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Cùng công thức với báo cáo web (không tính lại trên client).
- Trang cuộn; mockup cao 900.
