# WM-ADV-01 — Tạm ứng chuyến & đối soát

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/trip-advances` |
| Pattern | `list` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×1130 |
| Mockup | [../../mockups/WM-ADV-01.html](../../mockups/WM-ADV-01.html) · canvas artboard `WM-ADV-01.dc.html` |

## Mục đích

Theo dõi tạm ứng theo chuyến, chi phí thực tế, tài xế còn nộp/được hoàn; đối soát sau chuyến.

## Dữ liệu hiển thị

- `trip`
- `order`
- `driver`
- `advanceExpense`
- `advanceAmount`
- `actualCost`
- `difference`
- `resolution`
- `status`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo tạm ứng | expense.create (category=TRIP_ADVANCE) |
| Xác nhận đối soát | Trip advance reconciliation — admin/operation/kế toán |
| Điều chỉnh | sensitive — lý do bắt buộc (WM-SHELL-08) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở tài chính đơn | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở phiếu chi tạm ứng | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở sổ công nợ tài xế | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Thêm phiếu chi cho chuyến | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Đóng đối soát | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | action |
| Điều chỉnh đối soát (sensitive, cần lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Xác nhận đối soát → phiếu thu hoàn tạm ứng | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Đóng | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | action |
| Tạo phiếu chi tạm ứng chuyến | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
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
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở tạm ứng chuyến |
| [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | KPI tạm ứng → đối soát |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Đóng đối soát |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Đóng |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Mở tạm ứng chuyến & đối soát |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Mở tạm ứng chuyến & đối soát |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Mở đối soát tạm ứng |
| [WM-PAYROLL-03](../wm/WM-PAYROLL-03.md) Tạo bảng lương | Mở tạm ứng chuyến & đối soát |
| [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | Mở đối soát tạm ứng chuyến |

## Components (design system)

`StatusBadge`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `IconButton`, `Button`, `DataTable`, `DescriptionList`, `RadioGroup`, `FormField`, `Drawer`, `PageHeader`, `Breadcrumb`, `KpiCard`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `tripAdvances(filter)`
- `expenses(filter: {tripId})`
- `reconcileTripAdvance(input: {tripId, resolution, reason?})`

## Trạng thái UI

- **loading**: Skeleton
- **empty**: EmptyState 'Chưa có tạm ứng chuyến'
- **running**: Chuyến chưa hoàn thành: chênh lệch tạm tính, khóa nút xác nhận
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Panel đối soát là Drawer (mở khi chọn dòng); mockup hiển thị cạnh danh sách.
- Chênh lệch dương → tài xế nộp lại (phiếu thu Thu khác · hoàn tạm ứng, không phải doanh thu) hoặc trừ lương; âm → công ty hoàn (phiếu chi Hoàn ứng).
- API tripAdvances/reconcileTripAdvance chưa có trong 07-api-contract-map — cần bổ sung.
