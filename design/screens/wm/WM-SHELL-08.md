# WM-SHELL-08 — Sensitive action modal

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khung chung |
| Route | `(modal)` |
| Pattern | `dialog` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1040 |
| Mockup | [../../mockups/WM-SHELL-08.html](../../mockups/WM-SHELL-08.html) · canvas artboard `WM-SHELL-08.dc.html` |
| Overlay trên | [WM-ORD-07](./WM-ORD-07.md) (drawer/modal, không cần route riêng) |

## Mục đích

Khung dùng chung cho thao tác nhạy cảm: nội dung thay đổi, dữ liệu bị ảnh hưởng, cảnh báo, lý do bắt buộc.

## Dữ liệu hiển thị

- `action`
- `entity`
- `affected[]`
- `before/after`
- `requiredPermission`
- `reason`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xác nhận | permission riêng theo action + reason ≥ 5 ký tự |
| Quay lại | đóng modal, không đổi dữ liệu |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Xác nhận hủy phiếu | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Đóng | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở drawer giá cước/add-on | [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | `/orders/:orderId?tab=finance (drawer)` | action |
| Tạo phiếu thu | [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | action |
| Phân bổ từ phiếu có sẵn | [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | `/finance/payments/:paymentId/allocate` | action |
| Mở phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Tạo phiếu chi gắn đơn | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| In/chia sẻ đơn | [WM-ORD-09](../wm/WM-ORD-09.md) In/chia sẻ đơn | `/orders/:orderId/print` | action |
| Sửa đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Tạo chuyến từ đơn | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Menu: Hủy đơn / sửa giá (sensitive) | [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | `(modal)` | action |
| Mở khách hàng | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tab Tổng quan | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Tab Điểm dừng | [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | `/orders/:orderId?tab=stops` | action |
| Tab Hàng hóa | [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | `/orders/:orderId?tab=cargo` | action |
| Breadcrumb Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
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
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Xóa chứng từ (sensitive) |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Tạm dừng chuyến (nhập lý do) |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Hủy chuyến (sensitive) |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Menu: Hủy chuyến (sensitive) |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Sửa COD thực thu (sensitive, nhập lý do) |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Bỏ qua điểm (nhập lý do) |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Menu: Hủy chuyến (sensitive) |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Tạm dừng chuyến (nhập lý do) |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Hủy chuyến (sensitive) |
| [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | Override cảnh báo (sensitive) |
| [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | Đóng sự cố (nhập ghi chú) |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Sửa phiếu thu (sensitive, cần lý do) |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Hủy phiếu thu (sensitive, cần lý do) |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Sửa phiếu chi (sensitive, cần lý do) |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Hủy phiếu chi (sensitive, cần lý do) |
| [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | Hủy bảng kê đã chốt (sensitive, cần lý do) |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Điều chỉnh đối soát (sensitive, cần lý do) |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Menu: Ngừng sử dụng xe (sensitive) |
| [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | Menu: Ngừng giao dịch (sensitive) |
| [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | Ngừng hoạt động |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Menu: Ngừng hoạt động khách (sensitive) |
| [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | Xóa địa chỉ (sensitive nếu đã dùng) |
| [WM-CUS-04](../wm/WM-CUS-04.md) Sổ địa chỉ/liên hệ | Menu: Ngừng hoạt động khách (sensitive) |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Menu: Ngừng hoạt động khách (sensitive) |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Menu: Ngừng hoạt động khách (sensitive) |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Menu: Ngừng hoạt động tài xế (sensitive) |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Menu: Ngừng hoạt động tài xế (sensitive) |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Menu: Ngừng hoạt động tài xế (sensitive) |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Menu: Ngừng hoạt động tài xế (sensitive) |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Trả về (sensitive, lý do bắt buộc) |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Trả về (sensitive, lý do bắt buộc) |
| [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | Xem mẫu Sensitive action modal |

## Components (design system)

`DescriptionList`, `AuditDiff`, `SensitiveActionModal`, `Banner`, `Textarea`, `FormField`, `Button`, `Dialog`, `IconButton`, `DataTable`, `EmptyState`, `StatusBadge`, `EntityHeader`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `cancelExpense(id, reason)`
- `cancelTrip(id, reason)`
- `updatePayment(id, input, reason)`
- `deleteAttachment(id, reason)`

## Trạng thái UI

- **no_permission**: Nút xác nhận disabled + inline 'Bạn cần quyền … — liên hệ Admin'
- **validation**: Lý do trống → lỗi inline danger
- **error**: Banner danger trong modal, giữ lý do đã nhập
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Backend reject nếu thiếu reason; ghi audit_log {actor, action, reason, before, after}.
- Ví dụ trong mockup: hủy phiếu chi PC-202609-0001 trên tab Tài chính của DH-202609-0001.
