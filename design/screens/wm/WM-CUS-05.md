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
| Xuất công nợ khách | WM-SHELL-05 | | action |
| Tạo bảng kê công nợ | WM-DEBT-03 | | action |
| Phân bổ phiếu thu vào đơn | WM-PAY-04 | | action |
| Tạo phiếu thu khách trả | WM-PAY-03 | | action |
| Mở đơn còn nợ | WM-ORD-02 | | action |
| Mở bảng kê | WM-DEBT-04 | | action |
| Mở phiếu thu | WM-PAY-02 | | action |
| Mở đơn được phân bổ | WM-ORD-02 | | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Sửa khách hàng | [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | `/customers/new · /customers/:customerId/edit` | action |
| Tạo phiếu thu cho khách | WM-PAY-03 | | action |
| Tạo đơn cho khách | WM-ORD-03 | | action |
| Menu: Ngừng hoạt động khách (sensitive) | WM-SHELL-08 | | action |
| Tab Tổng quan | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tab Đơn hàng | [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | `/customers/:customerId?tab=orders` | action |
| Tab Địa chỉ/liên hệ | [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | `/customers/:customerId/locations (tab)` | action |
| Breadcrumb Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
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
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Mở tab Công nợ |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Tab Công nợ |
| [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | Tab Công nợ |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Click KPI Còn lại → công nợ khách |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Tab Công nợ |

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
