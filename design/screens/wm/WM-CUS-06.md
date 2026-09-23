# WM-CUS-06 — Lịch sử đơn khách

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khách hàng |
| Route | `/customers/:customerId?tab=orders` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1180 |
| Mockup | [../../mockups/WM-CUS-06.html](../../mockups/WM-CUS-06.html) · canvas artboard `WM-CUS-06.dc.html` |

## Mục đích

Danh sách đơn theo khách với tổng tiền/đã thu/còn lại; lọc thời gian/trạng thái.

## Dữ liệu hiển thị

- `code`
- `orderDate`
- `routeSummary`
- `status`
- `totalAmount`
- `paidAmount`
- `remainingAmount`
- `dueDate`
- `overdueDays`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Mở đơn | order.view → WM-ORD-02 |
| Tạo đơn | order.create → WM-ORD-03 |
| Xuất Excel | order.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở chi tiết đơn | WM-ORD-02 | | action |
| Click KPI Còn lại → công nợ khách | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Xuất lịch sử đơn | WM-SHELL-05 | | action |
| Tạo đơn cho khách | WM-ORD-03 | | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Sửa khách hàng | [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | `/customers/new · /customers/:customerId/edit` | action |
| Tạo phiếu thu cho khách | WM-PAY-03 | | action |
| Menu: Ngừng hoạt động khách (sensitive) | WM-SHELL-08 | | action |
| Tab Tổng quan | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tab Công nợ | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
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
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Mở lịch sử đơn khách |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Tab Đơn hàng |
| [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | Tab Đơn hàng |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Tab Đơn hàng |

## Components (design system)

`StatusBadge`, `DueIndicator`, `FilterBar`, `TextField`, `FilterChip`, `KpiCard`, `Pagination`, `IconButton`, `Button`, `DataTable`, `EntityHeader`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `orders(filter:{customerId, dateRange, status}, sort, first, after)`
- `orderTotals(filter)`

## Trạng thái UI

- **empty**: Khách chưa có đơn → EmptyState + Tạo đơn
- **filtered-empty**: Không có đơn trong khoảng thời gian
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Tổng (KPI + total row) tính trên toàn bộ kết quả lọc từ server, không cộng trang hiện tại.
- Đơn đã hủy tổng thu = 0.
