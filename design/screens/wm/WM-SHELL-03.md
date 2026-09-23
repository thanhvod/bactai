# WM-SHELL-03 — Tìm kiếm nhanh

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khung chung |
| Route | `(dialog) Ctrl K` |
| Pattern | `dialog` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1180 |
| Mockup | [../../mockups/WM-SHELL-03.html](../../mockups/WM-SHELL-03.html) · canvas artboard `WM-SHELL-03.dc.html` |
| Overlay trên | [WM-DASH-01](./WM-DASH-01.md) (drawer/modal, không cần route riêng) |

## Mục đích

Command palette: tìm theo mã đơn, mã chuyến, khách, tài xế, xe, phiếu thu/chi và nhảy tới detail.

## Dữ liệu hiển thị

- `type`
- `id`
- `code/name`
- `subtitle`
- `status`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Enter / click kết quả | view permission của entity |
| Lọc phạm vi | chip loại |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Kết quả đơn → chi tiết đơn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Kết quả chuyến → chi tiết chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Kết quả khách → chi tiết khách | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Kết quả tài xế → chi tiết tài xế | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Kết quả xe → chi tiết xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Kết quả phiếu thu → chi tiết phiếu thu | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Kết quả phiếu chi → chi tiết phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Esc / click ngoài → đóng | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | back |
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
| [WM-SHELL-01](../wm/WM-SHELL-01.md) Layout chính | Mở tìm kiếm nhanh |

## Components (design system)

`CommandPalette`, `StatusBadge`, `SegmentedControl`, `Button`, `PageHeader`, `KpiCard`, `DataTable`, `WarningPanel`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `globalSearch(query, types[], first: 5 per type)`

## Trạng thái UI

- **empty_query**: Hiện mục mở gần đây
- **no_result**: EmptyState 'Không tìm thấy kết quả cho …'
- **loading**: Spinner trong ô tìm, debounce 250ms
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Kết quả nhóm theo loại, tối đa 5/nhóm; điều hướng bằng ↑↓, Enter, Esc.
- Chỉ trả kết quả trong merchant hiện tại.
