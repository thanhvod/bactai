# MA-HOME-01 — Tổng quan mobile

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Tổng quan & thông báo |
| Route | `MerchantHomeRoute` |
| Pattern | `dashboard` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-HOME-01.html](../../mockups/MA-HOME-01.html) · canvas artboard `MA-HOME-01.dc.html` |

## Mục đích

Mở nhanh việc cần xử lý: chuyến đang chạy, nợ quá hạn, COD tài xế giữ, sự cố mở, bảng lương chờ duyệt, đơn chưa xếp xe.

## Dữ liệu hiển thị

- `runningTripCount`
- `overdueDebtAmount`
- `overdueCustomerCount`
- `codHeldAmount`
- `openIncidentCount`
- `pendingPayrollCount`
- `unassignedOrderCount`
- `runningTrips[{code, route, vehicle.plate, driver.name, status, openIncident}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| KPI → màn đã lọc tương ứng | theo quyền xem |
| Tạo nhanh đơn | order.create |
| Theo dõi xe | trip.view |
| Bảng lương chờ duyệt | payroll.view (duyệt: payroll.approve — admin) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Chuông thông báo | [MA-NOTI-01](../ma/MA-NOTI-01.md) Thông báo | `MerchantNotificationsRoute` | action |
| KPI chuyến đang chạy → danh sách chuyến | [MA-TRIP-01](../ma/MA-TRIP-01.md) Danh sách chuyến | `MerchantTripListRoute` | action |
| KPI nợ quá hạn → tài chính nhanh | [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | `MerchantFinanceRoute` | action |
| KPI COD → COD tài xế | [MA-COD-01](../ma/MA-COD-01.md) COD tài xế | `MerchantCodRoute` | action |
| KPI sự cố → chi tiết chuyến có sự cố | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |
| KPI bảng lương → duyệt bảng lương | [MA-PAYROLL-01](../ma/MA-PAYROLL-01.md) Duyệt bảng lương | `MerchantPayrollApprovalRoute` | action |
| KPI đơn chưa xếp xe → danh sách đơn | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | action |
| Lối tắt tạo nhanh đơn | [MA-ORD-03](../ma/MA-ORD-03.md) Tạo nhanh đơn | `MerchantQuickOrderCreateRoute` | action |
| Lối tắt bản đồ xe | [MA-MAP-01](../ma/MA-MAP-01.md) Theo dõi xe | `MerchantMapRoute` | action |
| Lối tắt khách hàng | [MA-CUS-01](../ma/MA-CUS-01.md) Khách hàng | `MerchantCustomerListRoute` | action |
| Mở chuyến CX-202609-0001 | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |
| Mở chuyến CX-202609-0003 | [MA-TRIP-02](../ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | action |
| Xem tất cả chuyến | [MA-TRIP-01](../ma/MA-TRIP-01.md) Danh sách chuyến | `MerchantTripListRoute` | action |
| Bottom nav: Tổng quan | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | nav |
| Bottom nav: Đơn/Chuyến | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | nav |
| Bottom nav: Tài chính | [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | `MerchantFinanceRoute` | nav |
| Bottom nav: Báo cáo | [MA-RPT-01](../ma/MA-RPT-01.md) Báo cáo tóm tắt | `MerchantReportsRoute` | nav |
| Bottom nav: Tài khoản | [MA-PROFILE-01](../ma/MA-PROFILE-01.md) Tài khoản & cài đặt nhẹ | `MerchantProfileRoute` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-AUTH-01](../ma/MA-AUTH-01.md) Đăng nhập | Đăng nhập Google thành công → Tổng quan |
| [MA-NOTI-01](../ma/MA-NOTI-01.md) Thông báo | Quay lại |
| [MA-CUS-01](../ma/MA-CUS-01.md) Khách hàng | Quay lại |
| [MA-PAYROLL-01](../ma/MA-PAYROLL-01.md) Duyệt bảng lương | Quay lại |

## Components (design system)

`IconButton`, `MobileHeader`, `KpiCard`, `StatusBadge`, `BottomNav`

## API (GraphQL)

- `dashboardSummary(filter: {date: today})`
- `trips(filter: {status: RUNNING}, first: 3)`
- `notifications(filter: {unread: true}){totalCount}`

## Trạng thái UI

- **loading**: Skeleton 6 KPI + 2 card
- **empty**: Không có chuyến đang chạy → EmptyState nhỏ 'Hôm nay chưa có chuyến chạy'
- **error**: Banner danger + Thử lại; pull-to-refresh

## Ghi chú implement

- Card theo role: operation ẩn 'Nợ quá hạn' nếu không có finance.view; accountant ẩn 'Đơn chưa xếp xe'; chỉ admin thấy CTA duyệt lương.
- KPI 'Sự cố mở' = 1 mở thẳng chuyến có sự cố; nếu > 1 mở MerchantTripListRoute(filter: incident).
- Pull-to-refresh; tự refresh khi quay lại foreground.
