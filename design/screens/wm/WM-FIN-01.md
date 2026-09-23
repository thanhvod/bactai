# WM-FIN-01 — Sổ thu chi

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance` |
| Pattern | `list` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×1100 |
| Mockup | [../../mockups/WM-FIN-01.html](../../mockups/WM-FIN-01.html) · canvas artboard `WM-FIN-01.dc.html` |

## Mục đích

Sổ chung mọi phiếu thu/phiếu chi: loại, đối tượng, trạng thái, số tiền phiếu và dòng tiền vào/ra thực tế; điểm vào tạo phiếu.

## Dữ liệu hiển thị

- `code`
- `date`
- `direction(IN|OUT)`
- `type`
- `counterpart`
- `linkedEntities`
- `status`
- `amount`
- `cashIn`
- `cashOut`
- `createdBy`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo phiếu thu (menu: khách trả / tài xế nộp COD / thu khác) | payment.create |
| Tạo phiếu chi (menu: chi phí/NCC / tạm ứng chuyến) | expense.create |
| Xuất Excel | finance.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chi tiết phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở chi tiết phiếu thu | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Mở công nợ khách Vật liệu Xây dựng Phú Mỹ | WM-CUS-05 | | action |
| Mở sổ công nợ tài xế Trần Minh Lái | WM-DRV-05 | | action |
| Mở công nợ khách Bao bì Hưng Lợi | WM-CUS-05 | | action |
| Mở công nợ khách Công ty Gạo Miền Tây | WM-CUS-05 | | action |
| Phiếu thu · Khách trả | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Phiếu thu · Tài xế nộp COD | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Phiếu thu · Thu khác | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Phiếu chi · Chi phí/NCC | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Phiếu chi · Tạm ứng chuyến | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Xuất sổ thu chi | WM-SHELL-05 | | action |
| KPI tiền vào → danh sách phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | action |
| KPI tiền ra → phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | action |
| KPI chưa trả → công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | action |
| KPI chưa phân bổ → PT-202609-0002 | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Mở báo cáo doanh thu/chi phí/lãi lỗ | WM-RPT-02 | | action |
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

- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.

## Components (design system)

`StatusBadge`, `Menu`, `Popover`, `Button`, `PageHeader`, `KpiCard`, `FilterBar`, `TextField`, `FilterChip`, `Banner`, `Pagination`, `IconButton`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `payments(filter, sort, first, after)`
- `expenses(filter, sort, first, after)`

## Trạng thái UI

- **loading**: Skeleton KPI + DataTable skeleton rows
- **empty**: EmptyState 'Chưa có phiếu thu/chi trong kỳ' + nút Tạo phiếu
- **error**: Banner danger 'Không tải được sổ thu chi' + Thử lại
- **forbidden**: Operation chỉ xem một phần (08-permission ⚠️)

## Ghi chú implement

- Tiền vào/Tiền ra = dòng tiền thực; phiếu chi Chưa trả, tài xế chi trước hoặc chi từ tạm ứng hiện '—' ở cột Tiền ra.
- Phiếu thu Tài xế nộp COD hiển thị nhãn 'Thu hồi — không phải doanh thu'. Doanh thu chỉ lấy từ đơn (link báo cáo WM-RPT-02).
- Menu 'Tạo phiếu' truyền ?type=CUSTOMER_PAYMENT|DRIVER_COD_REMITTANCE|OTHER sang /finance/payments/new.
- Có thể gộp 2 query ở BFF; sort theo ngày giảm dần; cột tiền tabular-nums, căn phải.
