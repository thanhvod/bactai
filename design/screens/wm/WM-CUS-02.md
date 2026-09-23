# WM-CUS-02 — Chi tiết khách hàng

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khách hàng |
| Route | `/customers/:customerId` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1280 |
| Mockup | [../../mockups/WM-CUS-02.html](../../mockups/WM-CUS-02.html) · canvas artboard `WM-CUS-02.dc.html` |

## Mục đích

Toàn bộ quan hệ với một khách: hồ sơ, đơn, công nợ, số dư, địa chỉ/liên hệ, bảng kê, chứng từ, timeline.

## Dữ liệu hiển thị

- `name`
- `legalName`
- `type`
- `taxCode`
- `phone`
- `invoiceEmail`
- `primaryContact`
- `billingAddress`
- `creditLimit`
- `defaultDebtDays`
- `debtSummary`
- `creditBalance`
- `recentOrders[]`
- `locations[]`
- `statements[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo đơn | order.create |
| Ghi nhận thanh toán | payment.create (admin/accountant; operation ⚠️) |
| Sửa | customer.update |
| Tạo bảng kê | debtStatement.create (admin/accountant) |
| Ngừng hoạt động | customer.deactivate — sensitive (WM-SHELL-08) |
| Timeline | customer.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Sửa khách hàng | [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | `/customers/new · /customers/:customerId/edit` | action |
| Mở đơn | WM-ORD-02 | | action |
| Mở lịch sử đơn khách | [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | `/customers/:customerId?tab=orders` | action |
| Mở sổ địa chỉ/liên hệ | [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | `/customers/:customerId/locations (tab)` | action |
| Mở tab Công nợ | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Tạo phiếu thu | WM-PAY-03 | | action |
| Tạo bảng kê công nợ | WM-DEBT-03 | | action |
| Mở bảng kê | WM-DEBT-04 | | action |
| Mở danh sách bảng kê | WM-DEBT-03 | | action |
| Mở Timeline | WM-SHELL-07 | | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Tạo phiếu thu cho khách | WM-PAY-03 | | action |
| Tạo đơn cho khách | WM-ORD-03 | | action |
| Menu: Ngừng hoạt động khách (sensitive) | WM-SHELL-08 | | action |
| Tab Đơn hàng | [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | `/customers/:customerId?tab=orders` | action |
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
| [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | Click tên khách → chi tiết |
| [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | Xem chi tiết |
| [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | Hủy → chi tiết khách |
| [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | Lưu → chi tiết khách |
| [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | Tab Tổng quan |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Tab Tổng quan |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Tab Tổng quan |

## Components (design system)

`DescriptionList`, `StatusBadge`, `DueIndicator`, `DataTable`, `WarningPanel`, `Button`, `Timeline`, `EntityHeader`, `IconButton`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `customer(id){locations, debtSummary, creditBalance}`
- `orders(filter:{customerId}, first: 5)`
- `debtStatements(filter:{customerId})`
- `activityLogs(entityType: CUSTOMER, entityId)`

## Trạng thái UI

- **loading**: Skeleton header + tabs
- **error**: Không tìm thấy khách / không có quyền → EmptyState + về danh sách
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Tabs dùng ?tab= (overview|orders|debt|credit|locations|statements|attachments|timeline).
- Tab Số dư: danh sách phiếu thu còn tiền chưa phân bổ (dùng lại bảng lịch sử ở WM-CUS-05, lọc unallocated>0).
- Tab Bảng kê: danh sách WM-DEBT-03 lọc theo khách; Chứng từ: AttachmentList → WM-SHELL-06.
- Header warning quá hạn lấy từ debtSummary.overdueDays lớn nhất.
