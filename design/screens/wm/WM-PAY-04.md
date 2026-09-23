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
| Mở tài chính đơn | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở đơn nháp | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở công nợ khách | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Breadcrumb Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | nav |
| Breadcrumb PT-202609-0002 | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | nav |
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
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Phân bổ từ phiếu có sẵn |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | Phân bổ từ phiếu có sẵn |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Phân bổ từ phiếu có sẵn |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Phân bổ từ phiếu có sẵn |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Phân bổ từ phiếu có sẵn |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | Phân bổ phiếu thu |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Phân bổ vào đơn |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Empty state: phân bổ |
| [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | Mở phân bổ payment |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Phân bổ phiếu thu vào đơn |

## Components (design system)

`Button`, `PageHeader`, `Breadcrumb`, `SummaryStrip`, `StatusBadge`, `MoneyInput`, `TextField`, `Switch`, `DataTable`, `WarningPanel`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

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
