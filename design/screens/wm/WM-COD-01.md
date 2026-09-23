# WM-COD-01 — COD tài xế đang giữ

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/cod` |
| Pattern | `list` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×1000 |
| Mockup | [../../mockups/WM-COD-01.html](../../mockups/WM-COD-01.html) · canvas artboard `WM-COD-01.dc.html` |

## Mục đích

COD tài xế đã thu chưa nộp, nhóm theo tài xế, theo đơn/chuyến/điểm, tuổi giữ tiền và cảnh báo; chọn khoản → tạo phiếu thu COD.

## Dữ liệu hiển thị

- `driver`
- `heldTotal`
- `items[{order, customer, trip, stop, collectedAt, codActual, remitted, held, daysHeld}]`
- `warnings`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo phiếu thu COD | Record driver COD remittance — admin/kế toán → WM-PAY-03 |
| Xuất Excel | finance.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở tài chính đơn | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở điểm dừng | [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | `/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)` | action |
| Mở sổ công nợ tài xế | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Tạo phiếu thu COD cho tài xế | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Mở danh sách tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | action |
| Mở phiếu thu COD | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Mở danh sách phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | action |
| Xuất COD đang giữ | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Tạo phiếu thu COD từ khoản đã chọn | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| KPI đã nộp → phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | action |
| Mở cài đặt ngưỡng COD | [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | `/settings/operations` | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Sidebar: Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | nav |
| Sidebar: Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
| Sidebar: Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Sổ thu chi | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | nav |
| Sidebar: Phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | nav |
| Sidebar: Công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | nav |
| Sidebar: Công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | nav |
| Sidebar: Bảng kê công nợ | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | nav |
| Sidebar: COD tài xế | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | nav |
| Sidebar: Tạm ứng chuyến | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | nav |
| Sidebar: Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
| Sidebar: Báo cáo | [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | `/reports` | nav |
| Sidebar: Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Thông báo COD vượt ngưỡng → COD tài xế |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | KPI COD tài xế giữ → COD |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Xem COD tài xế |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | KPI COD tài xế giữ → COD |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Xem COD tài xế |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | KPI COD tài xế giữ → COD |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Xem COD tài xế |
| [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | KPI COD chưa nộp |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở COD tài xế |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | KPI COD → COD tài xế đang giữ |
| [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | Mở danh sách COD tài xế đang giữ |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Mở COD tài xế (tài chính) |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Mở COD tài xế (tài chính) |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Mở COD tài xế đang giữ |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Mở COD tài xế đang giữ |
| [WM-RPT-07](../wm/WM-RPT-07.md) COD tài xế | KPI Đang giữ → COD tài xế đang giữ |
| [WM-RPT-07](../wm/WM-RPT-07.md) COD tài xế | Mở COD tài xế đang giữ |
| [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | Mở COD tài xế đang giữ |

## Components (design system)

`StatusBadge`, `Checkbox`, `Button`, `DataTable`, `PageHeader`, `Breadcrumb`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `driverCodHeld(filter: {driverId, warningOnly})`
- `merchantSettings{codWarningAmount, codWarningDays}`

## Trạng thái UI

- **loading**: Skeleton
- **empty**: EmptyState 'Chưa có khoản COD chưa nộp'
- **error**: Banner danger + Thử lại

## Ghi chú implement

- COD held = Σ stop.cod_actual − Σ payment_in DRIVER_COD_REMITTANCE.
- Cảnh báo theo cài đặt merchant: 5.000.000 đ hoặc 2 ngày (WM-SET-01).
- Seed: Trần Minh Lái thu 7.500.000, đã nộp 2.000.000, còn giữ 5.500.000.
