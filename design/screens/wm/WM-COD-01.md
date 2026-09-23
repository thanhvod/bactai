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
| Mở tài chính đơn | WM-ORD-07 | | action |
| Mở chuyến | WM-TRIP-01 | | action |
| Mở điểm dừng | WM-STOP-01 | | action |
| Mở sổ công nợ tài xế | WM-DRV-05 | | action |
| Tạo phiếu thu COD cho tài xế | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Mở danh sách tài xế | WM-DRV-01 | | action |
| Mở phiếu thu COD | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Mở danh sách phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | action |
| Xuất COD đang giữ | WM-SHELL-05 | | action |
| Tạo phiếu thu COD từ khoản đã chọn | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| KPI đã nộp → phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | action |
| Mở cài đặt ngưỡng COD | WM-SET-01 | | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Sổ thu chi | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | nav |
| Sidebar: Phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | nav |
| Sidebar: Công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | nav |
| Sidebar: Công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | nav |
| Sidebar: Bảng kê công nợ | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | nav |
| Sidebar: COD tài xế | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | nav |
| Sidebar: Tạm ứng chuyến | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | KPI COD → COD tài xế đang giữ |
| [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | Mở danh sách COD tài xế đang giữ |

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
