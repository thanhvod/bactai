# WM-PAYROLL-05 — Duyệt bảng lương

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Lương |
| Route | `/payroll/:payrollId/approve` |
| Pattern | `dialog` |
| Roles | admin |
| Kích thước mockup | 1440×1180 |
| Mockup | [../../mockups/WM-PAYROLL-05.html](../../mockups/WM-PAYROLL-05.html) · canvas artboard `WM-PAYROLL-05.dc.html` |
| Overlay trên | [WM-PAYROLL-02](./WM-PAYROLL-02.md) (drawer/modal, không cần route riêng) |

## Mục đích

Giám đốc/Admin xem tóm tắt tổng tiền và thay đổi so với kỳ trước, rồi duyệt (ghi chú tùy chọn) hoặc trả về (lý do bắt buộc).

## Dữ liệu hiển thị

- `totals vs previous period`
- `changes[] (giảm trừ, lương cố định thay đổi, cảnh báo)`
- `approver`
- `note/reason`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Duyệt bảng lương | payroll.approve (admin) — ghi chú tùy chọn |
| Trả về | payroll.return (admin) — lý do bắt buộc |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Đóng dialog | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Trả về (lý do bắt buộc) → Nháp | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Duyệt → Đã duyệt | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Đóng | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Xuất bảng lương / phiếu lương | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Trả về (sensitive, lý do bắt buộc) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Duyệt bảng lương | [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | `/payroll/:payrollId/approve` | action |
| Tab Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Click dòng → chi tiết dòng lương | [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | `/payroll/:payrollId/lines/:lineId` | action |
| Mở chi tiết dòng lương | [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | `/payroll/:payrollId/lines/:lineId` | action |
| Mở COD tài xế đang giữ | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Mở chuyến đang chạy | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở lịch sử lương cố định | [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | `/drivers/:driverId/salary-history (tab Lương/ứng)` | action |
| Mở phiếu chi ứng lương | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở danh mục lý do giảm trừ | [WM-CAT-01](../wm/WM-CAT-01.md) Danh mục dùng chung | `/settings/catalogs` | action |
| Mở Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Breadcrumb Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
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
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Duyệt bảng lương |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Duyệt bảng lương |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Duyệt bảng lương |
| [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | Banner: Xem và duyệt |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Duyệt bảng lương |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Duyệt bảng lương |

## Components (design system)

`DataTable`, `DescriptionList`, `TextField`, `FormField`, `Textarea`, `Button`, `Dialog`, `IconButton`, `EntityHeader`, `StatusBadge`, `SummaryStrip`, `Breadcrumb`, `Stepper`, `Tabs`, `WarningPanel`, `Timeline`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `payroll(id){totals, previousTotals, changes[]}`
- `approvePayroll(id, reason?)`
- `returnPayroll(id, reason)`

## Trạng thái UI

- **validation**: Trả về khi chưa nhập lý do → lỗi inline 'Nhập lý do trả về'
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Duyệt trên App Merchant (MA-PAYROLL-01) ghi audit giống web.
- Sau duyệt: status Đã duyệt, thông báo kế toán.
