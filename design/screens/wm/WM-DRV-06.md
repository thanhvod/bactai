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
| Mở đơn | WM-ORD-02 | | action |
| Mở chuyến | WM-TRIP-01 | | action |
| Mở điểm dừng | WM-STOP-01 | | action |
| Xuất COD tài xế | WM-SHELL-05 | | action |
| Tạo phiếu thu COD nộp lại (2 mục) | WM-PAY-03 | | action |
| Mở phiếu thu COD | WM-PAY-02 | | action |
| Chuyển sang Sổ công nợ | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Mở cài đặt vận hành | WM-SET-01 | | action |
| Mở COD tài xế (tài chính) | WM-COD-01 | | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Sửa tài xế | [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | `/drivers/new · /drivers/:driverId/edit` | action |
| Tạo phiếu thu tài xế nộp COD | WM-PAY-03 | | action |
| Menu: Ngừng hoạt động tài xế (sensitive) | WM-SHELL-08 | | action |
| Mở chuyến hiện tại | WM-TRIP-01 | | action |
| Tab Tổng quan | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Tab Lương/ứng | [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | action |
| Breadcrumb Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Sidebar: Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Mở COD tài xế đang giữ |
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Click KPI COD → COD tài xế đang giữ |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Mở COD tài xế đang giữ |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Chuyển sang COD đang giữ |

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
