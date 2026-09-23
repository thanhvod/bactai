# WM-DRV-05 — Sổ công nợ tài xế

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Tài xế |
| Route | `/drivers/:driverId?tab=ledger` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1180 |
| Mockup | [../../mockups/WM-DRV-05.html](../../mockups/WM-DRV-05.html) · canvas artboard `WM-DRV-05.dc.html` |

## Mục đích

Sổ đối chiếu 2 chiều: công ty nợ tài xế (chi phí tài xế ứng trả) và tài xế giữ/nợ công ty (COD chưa nộp, tạm ứng, ứng lương) + lịch sử đối soát.

## Dữ liệu hiển thị

- `companyOwesDriver`
- `reimbursableExpenses[]`
- `codHeld`
- `tripAdvances[]`
- `wageAdvances[]`
- `entries[{date, docCode, description, companyOwes, driverOwes, runningBalance, status}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo phiếu chi hoàn ứng | expense.create → WM-EXP-03 (prefill tài xế + khoản chưa hoàn) |
| Ghi nhận nộp COD | payment.create DRIVER_COD_REMITTANCE (admin/accountant) → WM-PAY-03 |
| Đối soát tạm ứng | → WM-ADV-01 |
| Xuất Excel | driver.ledger.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Tạo phiếu chi hoàn ứng | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Mở phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Tạo phiếu thu tài xế nộp COD | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Mở COD tài xế đang giữ | [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | action |
| Mở phiếu chi tạm ứng | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở đối soát tạm ứng | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | action |
| Mở chứng từ | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Xuất sổ công nợ tài xế | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Chuyển sang COD đang giữ | [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | `/drivers/:driverId?tab=ledger&view=cod` | action |
| Mở COD tài xế (tài chính) | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Sửa tài xế | [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | `/drivers/new · /drivers/:driverId/edit` | action |
| Tạo phiếu chi hoàn ứng cho tài xế | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
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
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Mở sổ công nợ tài xế Trần Minh Lái |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | Mở sổ công nợ tài xế Trần Minh Lái |
| [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | Mở sổ công nợ tài xế |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Mở sổ công nợ tài xế |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Mở sổ công nợ tài xế |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Mở sổ công nợ tài xế |
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Click KPI → sổ công nợ tài xế |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Mở sổ công nợ tài xế |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Tab Công nợ |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Tab Công nợ |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Chuyển sang Sổ công nợ |
| [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | Mở sổ công nợ tài xế |

## Components (design system)

`Button`, `StatusBadge`, `DataTable`, `Banner`, `SegmentedControl`, `EntityHeader`, `IconButton`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `driverLedger(driverId)`
- `expenses(filter:{driverId, paidBy: DRIVER})`
- `payments(filter:{driverId, type: DRIVER_COD_REMITTANCE})`

## Trạng thái UI

- **empty**: Không có phát sinh → 'Công nợ tài xế đang cân bằng'
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Hoàn ứng không chờ kỳ lương: tạo phiếu chi bất kỳ lúc nào.
- COD tài xế nộp là thu hồi phải thu, không phải doanh thu.
- Số dư ròng chỉ tham khảo; hai chiều tất toán bằng chứng từ riêng.
