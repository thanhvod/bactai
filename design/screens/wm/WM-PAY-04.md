# WM-PAY-04 — Phân bổ payment

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/payments/:paymentId/allocate` |
| Pattern | `form` |
| Roles | admin, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-PAY-04.html](../../mockups/WM-PAY-04.html) · canvas artboard `WM-PAY-04.dc.html` |

## Mục đích

Phân bổ thủ công một phiếu thu vào nhiều đơn còn nợ của cùng khách; phần còn lại thành số dư khách.

## Dữ liệu hiển thị

- `payment.amount`
- `payment.allocatedAmount`
- `remaining`
- `orders[{code, status, orderDate, dueDate, total, paid, remaining}]`
- `lines[{orderId, amount}]`
- `creditPreview`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xác nhận phân bổ | payment.allocate — admin/kế toán |
| Tự điền theo hạn cũ nhất | client-side |
| Hủy | — |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Hủy phân bổ → chi tiết phiếu | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Xác nhận phân bổ → chi tiết phiếu | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Mở tài chính đơn | WM-ORD-07 | | action |
| Mở đơn nháp | WM-ORD-02 | | action |
| Mở công nợ khách | WM-CUS-05 | | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Breadcrumb Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | nav |
| Breadcrumb PT-202609-0002 | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | nav |
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
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | Phân bổ phiếu thu |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Phân bổ vào đơn |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Empty state: phân bổ |
| [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | Mở phân bổ payment |

## Components (design system)

`Button`, `PageHeader`, `Breadcrumb`, `SummaryStrip`, `StatusBadge`, `DueIndicator`, `MoneyInput`, `TextField`, `Switch`, `DataTable`, `WarningPanel`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `payment(id)`
- `customerDebt(filter: {customerId, openOnly})`
- `allocatePayment(input: {paymentId, lines[{orderId, amount}]})`

## Trạng thái UI

- **validation**: Tổng phân bổ > còn lại của phiếu → lỗi inline, chặn lưu; dòng > còn nợ đơn → lỗi inline
- **warning**: WarningPanel: khách có nhiều đơn quá hạn (gợi ý phân bổ đơn cũ); đơn đã đủ tiền bị khóa ô nhập
- **empty**: Khách không có đơn còn nợ → EmptyState 'Toàn bộ tiền sẽ vào số dư khách'
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Allocation không vượt khách/merchant (backend reject TENANT_SCOPE_VIOLATION/BUSINESS_RULE_VIOLATION).
- Số dư khách = tổng phiếu thu − tổng phân bổ; preview cập nhật khi nhập.
- Sau lưu quay về WM-PAY-02; WM-CUS-05 và WM-ORD-07 phản ánh ngay.
