# WM-ORD-07 — Tài chính đơn (tab)

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Đơn hàng |
| Route | `/orders/:orderId?tab=finance` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1040 |
| Mockup | [../../mockups/WM-ORD-07.html](../../mockups/WM-ORD-07.html) · canvas artboard `WM-ORD-07.dc.html` |

## Mục đích

Tách 4 khối: doanh thu, dòng tiền đã phân bổ, chi phí, lãi/lỗ tạm tính. Không gộp.

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Ghi nhận thanh toán | payment.create |
| Phân bổ | payment.allocate |
| Thêm chi phí | expense.create |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở drawer giá cước/add-on | [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | `/orders/:orderId?tab=finance (drawer)` | action |
| Tạo phiếu thu | WM-PAY-03 | | action |
| Phân bổ từ phiếu có sẵn | WM-PAY-04 | | action |
| Mở phiếu chi | WM-EXP-02 | | action |
| Tạo phiếu chi gắn đơn | WM-EXP-03 | | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| In/chia sẻ đơn | [WM-ORD-09](../wm/WM-ORD-09.md) In/chia sẻ đơn | `/orders/:orderId/print` | action |
| Sửa đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Tạo chuyến từ đơn | WM-TRIP-02 | | action |
| Menu: Hủy đơn / sửa giá (sensitive) | [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | `(modal)` | action |
| Mở khách hàng | WM-CUS-02 | | action |
| Tab Tổng quan | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Tab Điểm dừng | [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | `/orders/:orderId?tab=stops` | action |
| Tab Hàng hóa | [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | `/orders/:orderId?tab=cargo` | action |
| Breadcrumb Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Tab Tài chính |
| [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | Tab Tài chính |
| [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | Tab Tài chính |
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Đóng drawer |
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Đóng |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Quay lại |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Đóng |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Tab Tài chính |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Đóng timeline |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Đóng |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Quay lại |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Xác nhận hủy phiếu |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Đóng |

## Components (design system)

`DataTable`, `Button`, `EmptyState`, `StatusBadge`, `EntityHeader`, `IconButton`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `order(id){financeSummary, allocations, expenses}`

## Trạng thái UI

- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Doanh thu ≠ phiếu thu. COD tài xế nộp không phải doanh thu.
