# WM-DEBT-03 — Danh sách bảng kê công nợ

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/debt-statements` |
| Pattern | `list` |
| Roles | admin, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-DEBT-03.html](../../mockups/WM-DEBT-03.html) · canvas artboard `WM-DEBT-03.dc.html` |

## Mục đích

Danh sách bảng kê theo khách/kỳ với tổng nợ snapshot và trạng thái Nháp/Đã chốt/Đã gửi/Đã hủy; tạo bảng kê.

## Dữ liệu hiển thị

- `code`
- `customer`
- `period`
- `lineCount`
- `totalAmount`
- `paidAmount`
- `remainingAmount`
- `status`
- `finalizedAt`
- `sentAt`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo nháp & xem trước | debtStatement.create — admin/kế toán |
| Tải PDF (đã chốt/đã gửi) | finance.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Click mã bảng kê → chi tiết | [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | `/finance/debt-statements/:statementId` | action |
| Tải PDF bảng kê | WM-SHELL-05 | | action |
| Tạo bảng kê nháp → chi tiết | [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | `/finance/debt-statements/:statementId` | action |
| Mở công nợ khách tổng hợp | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | action |
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
| [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | Tạo bảng kê cho khách |
| [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | Mở bảng kê công nợ |

## Components (design system)

`StatusBadge`, `Menu`, `IconButton`, `Button`, `EntityPicker`, `FormField`, `DateField`, `Select`, `PageHeader`, `Breadcrumb`, `FilterBar`, `TextField`, `FilterChip`, `Pagination`, `DataTable`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `debtStatements(filter)`
- `createDebtStatement(input: {customerId, from, to, scope})`

## Trạng thái UI

- **loading**: Skeleton
- **empty**: EmptyState 'Chưa có bảng kê' + form tạo
- **validation**: Khách + kỳ bắt buộc; đến ngày ≥ từ ngày
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Trạng thái Đã chốt có icon khóa.
- Bảng kê Nháp tính theo dữ liệu hiện tại; chỉ khi chốt mới snapshot.
