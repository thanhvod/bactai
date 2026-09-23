# WM-CUS-05 — Công nợ khách

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khách hàng |
| Route | `/customers/:customerId?tab=debt` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1120 |
| Mockup | [../../mockups/WM-CUS-05.html](../../mockups/WM-CUS-05.html) · canvas artboard `WM-CUS-05.dc.html` |

## Mục đích

Tổng nợ, quá hạn, số dư, tuổi nợ, đơn còn nợ (DueIndicator), lịch sử phiếu thu/phân bổ; ghi nhận thanh toán, phân bổ, tạo bảng kê.

## Dữ liệu hiển thị

- `orderDate`
- `orderCode`
- `routeSummary`
- `totalAmount`
- `allocatedAmount`
- `remainingAmount`
- `dueDate`
- `overdueDays`
- `statementCode`
- `aging{current, d1_15, d16_30, d30plus}`
- `payments[{code, date, method, amount, allocations[], unallocated, status}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Ghi nhận thanh toán | payment.create → WM-PAY-03 (prefill khách) |
| Phân bổ | payment.allocate (admin/accountant) → WM-PAY-04 |
| Tạo bảng kê | debtStatement.create (admin/accountant) → WM-DEBT-03 |
| Xuất Excel | customer.debt.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xuất công nợ khách | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Tạo bảng kê công nợ | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | action |
| Phân bổ phiếu thu vào đơn | [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | `/finance/payments/:paymentId/allocate` | action |
| Tạo phiếu thu khách trả | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Mở đơn còn nợ | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở bảng kê | [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | `/finance/debt-statements/:statementId` | action |
| Mở phiếu thu | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Mở đơn được phân bổ | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Sửa khách hàng | [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | `/customers/new · /customers/:customerId/edit` | action |
| Tạo phiếu thu cho khách | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Tạo đơn cho khách | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Menu: Ngừng hoạt động khách (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Tab Tổng quan | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tab Đơn hàng | [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | `/customers/:customerId?tab=orders` | action |
| Tab Địa chỉ/liên hệ | [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | `/customers/:customerId/locations (tab)` | action |
| Breadcrumb Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
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
| [MA-CUS-02](../ma/MA-CUS-02.md) Chi tiết khách | Mở công nợ khách trên Web Merchant |
| [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | Xem công nợ khách |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Thông báo nợ quá hạn → công nợ khách |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở công nợ khách |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở công nợ khách |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở công nợ khách |
| [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | Mở công nợ khách |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Mở công nợ khách Vật liệu Xây dựng Phú Mỹ |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Mở công nợ khách Bao bì Hưng Lợi |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Mở công nợ khách Công ty Gạo Miền Tây |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | Mở công nợ khách Vật liệu Xây dựng Phú Mỹ |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | Mở công nợ khách Bao bì Hưng Lợi |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | Mở công nợ khách Công ty Gạo Miền Tây |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Mở công nợ khách |
| [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | Mở công nợ khách |
| [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | Mở công nợ khách |
| [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | Mở công nợ khách |
| [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | Mở công nợ khách hiện tại |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Mở tab Công nợ |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Tab Công nợ |
| [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | Tab Công nợ |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Click KPI Còn lại → công nợ khách |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Tab Công nợ |
| [WM-RPT-06](../wm/WM-RPT-06.md) Công nợ khách | Mở công nợ khách |

## Components (design system)

`Button`, `SummaryStrip`, `DueIndicator`, `StatusBadge`, `DataTable`, `Checkbox`, `WarningPanel`, `EntityHeader`, `IconButton`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `customerDebt(filter:{customerId})`
- `payments(filter:{customerId})`
- `customer(id){creditBalance, creditLimit}`

## Trạng thái UI

- **empty**: Không còn nợ → EmptyState 'Khách không còn công nợ' + lịch sử thanh toán vẫn hiện
- **loading**: Skeleton bảng
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Còn nợ = tổng thu khách − tổng phân bổ; overdueDays = hôm nay − dueDate khi còn nợ.
- Số dư khách = tổng phiếu thu − tổng phân bổ; không tự trừ vào đơn.
- Chọn nhiều đơn (checkbox) → Tạo bảng kê / Phân bổ với các đơn đã chọn.
- Doanh thu ≠ phiếu thu: màn này chỉ hiện công nợ và dòng tiền phân bổ.
