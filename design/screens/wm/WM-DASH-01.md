# WM-DASH-01 — Dashboard tổng quan

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Dashboard |
| Route | `/` |
| Pattern | `dashboard` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1180 |
| Mockup | [../../mockups/WM-DASH-01.html](../../mockups/WM-DASH-01.html) · canvas artboard `WM-DASH-01.dc.html` |

## Mục đích

Màn cảnh báo vận hành: 6 KPI, vận hành hôm nay (trái), cảnh báo tiền/sự cố (phải).

## Dữ liệu hiển thị

- `runningTrips`
- `ordersNeedAction`
- `overdueDebt`
- `codHeld`
- `openIncidents`
- `payrollPending`
- `todayTrips[]`
- `overdueOrders[]`
- `codHolders[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Click KPI | mở list đã lọc tương ứng |
| Tạo đơn | order.create |
| Ghi nhận nộp COD | payment.create (admin, accountant) |
| Duyệt bảng lương | payroll.approve (admin) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Chuyển sang 7 ngày | [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | `/dashboard/operations` | action |
| Chuyển sang Tháng này | [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | `/dashboard/finance` | action |
| Tạo đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| KPI Chuyến đang chạy → bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | action |
| KPI Đơn cần xử lý → đơn lọc sẵn | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | action |
| KPI Công nợ quá hạn → công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | action |
| KPI COD tài xế giữ → COD | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| KPI Sự cố mở → danh sách sự cố | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | action |
| KPI Bảng lương chờ duyệt → bảng lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | action |
| Mở đơn cần xử lý | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Xác nhận đơn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Tạo chuyến từ dashboard | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Mở chuyến chưa gán xe | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Gán xe/tài xế | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Xem tất cả đơn | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | action |
| Mở xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Mở dashboard vận hành | [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | `/dashboard/operations` | action |
| Xem cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | action |
| Mở công nợ khách | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Mở đơn quá hạn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Xem công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | action |
| Mở COD tài xế đang giữ | [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | action |
| Ghi nhận tài xế nộp COD | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Xem COD tài xế | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Mở sự cố | [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | `/dispatch/incidents/:incidentId` | action |
| Mở chuyến có sự cố | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Xem danh sách sự cố | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | action |
| Mở bảng lương | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Duyệt bảng lương | [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | `/payroll/:payrollId/approve` | action |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Tổng quan | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Vận hành | [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | `/dashboard/operations` | nav |
| Sidebar: Tài chính | [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | `/dashboard/finance` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Sidebar: Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | nav |
| Sidebar: Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
| Sidebar: Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
| Sidebar: Báo cáo | [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | `/reports` | nav |
| Sidebar: Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-PROFILE-01](../ma/MA-PROFILE-01.md) Tài khoản & cài đặt nhẹ | Mở Web Merchant |
| [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | Đăng nhập Google thành công (1 merchant) → Dashboard |
| [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | Sau đăng nhập: 1 merchant |
| [WM-AUTH-02](../wm/WM-AUTH-02.md) Tạo/hoàn tất merchant | Tạo merchant → Dashboard |
| [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | Chọn BTA Demo Transport → Dashboard |
| [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | Chọn Vận tải Hòa Bình Logistics → Dashboard |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Đóng thông báo |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Esc / click ngoài → đóng |

## Components (design system)

`SegmentedControl`, `Button`, `PageHeader`, `KpiCard`, `StatusBadge`, `DataTable`, `WarningPanel`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `dashboardSummary(filter: {range})`
- `trips(filter: {date: today..tomorrow})`
- `orders(filter: {needsAction: true})`

## Trạng thái UI

- **loading**: Skeleton KPI + bảng
- **empty**: Mỗi panel có EmptyState ngắn (vd 'Không có chuyến hôm nay')
- **polling**: Tự làm mới 60 giây
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Card theo role: Operation ẩn khối tiền chi tiết nếu không có finance.view; Kế toán ẩn nút Tạo đơn.
- KPI click → list đã filter (WM-ORD-01?filter=needsAction, WM-DEBT-01?overdue=1…).
- Bảng nhỏ quan trọng hơn chart lớn.
