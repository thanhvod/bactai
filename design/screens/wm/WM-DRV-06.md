# WM-DRV-06 — COD tài xế đang giữ

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Tài xế |
| Route | `/drivers/:driverId?tab=ledger&view=cod` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1180 |
| Mockup | [../../mockups/WM-DRV-06.html](../../mockups/WM-DRV-06.html) · canvas artboard `WM-DRV-06.dc.html` |

## Mục đích

COD tài xế đang giữ theo điểm dừng/đơn/chuyến, tuổi nợ, cảnh báo vượt ngưỡng; chọn mục để ghi nhận tài xế nộp COD.

## Dữ liệu hiển thị

- `collectedAt`
- `orderCode`
- `tripCode`
- `stop{sequence, name, address}`
- `codExpected`
- `codActual`
- `remitted`
- `held`
- `ageDays`
- `thresholds{amount: 5000000, days: 2}`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Ghi nhận nộp COD | payment.create DRIVER_COD_REMITTANCE (admin/accountant) → WM-PAY-03 prefill các mục đã chọn |
| Xuất Excel | driver.ledger.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở đơn | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở điểm dừng | [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | `/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)` | action |
| Xuất COD tài xế | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Tạo phiếu thu COD nộp lại (2 mục) | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Mở phiếu thu COD | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Chuyển sang Sổ công nợ | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Mở cài đặt vận hành | [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | `/settings/operations` | action |
| Mở COD tài xế (tài chính) | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Sửa tài xế | [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | `/drivers/new · /drivers/:driverId/edit` | action |
| Tạo phiếu thu tài xế nộp COD | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Menu: Ngừng hoạt động tài xế (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở chuyến hiện tại | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Tab Tổng quan | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Tab Lương/ứng | [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | action |
| Breadcrumb Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
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
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở COD tài xế đang giữ |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở COD tài xế đang giữ |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở COD tài xế đang giữ |
| [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | Mở COD tài xế |
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Mở COD tài xế đang giữ |
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Click KPI COD → COD tài xế đang giữ |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Mở COD tài xế đang giữ |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Chuyển sang COD đang giữ |
| [WM-RPT-05](../wm/WM-RPT-05.md) Hiệu suất tài xế | Mở COD tài xế đang giữ |
| [WM-RPT-07](../wm/WM-RPT-07.md) COD tài xế | Mở COD tài xế đang giữ |

## Components (design system)

`StatusBadge`, `DataTable`, `Checkbox`, `Button`, `SegmentedControl`, `FilterBar`, `TextField`, `FilterChip`, `WarningPanel`, `EntityHeader`, `IconButton`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `driverCodHeld(filter:{driverId, status})`
- `payments(filter:{driverId, type: DRIVER_COD_REMITTANCE})`

## Trạng thái UI

- **empty**: Không giữ COD → EmptyState 'Tài xế không giữ COD'
- **loading**: Skeleton bảng
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- COD held = Σ stop.codActual − Σ phiếu thu DRIVER_COD_REMITTANCE.
- Cảnh báo khi tổng giữ > ngưỡng tiền hoặc khoản giữ quá ngưỡng ngày (WM-SET-01).
- Operation xem được nhưng không ghi nhận nộp COD (nút ẩn).
