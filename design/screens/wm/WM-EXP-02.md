# WM-EXP-02 — Chi tiết phiếu chi

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/expenses/:expenseId` |
| Pattern | `detail` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×1180 |
| Mockup | [../../mockups/WM-EXP-02.html](../../mockups/WM-EXP-02.html) · canvas artboard `WM-EXP-02.dc.html` |

## Mục đích

Thông tin chi, đối tượng gắn, ai chi trước, hoàn tài xế, chứng từ, audit; đánh dấu đã trả.

## Dữ liệu hiển thị

- `code`
- `category`
- `subCategory`
- `amount`
- `date`
- `paidBy`
- `reimburseDriver`
- `status`
- `order`
- `trip`
- `vehicle`
- `driver`
- `supplier`
- `attachments[]`
- `audit[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đánh dấu đã trả | expense.markPaid — admin/kế toán |
| Sửa | expense.update — sensitive, lý do (operation ⚠️) |
| Hủy phiếu | expense.cancel — sensitive, lý do |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Sửa phiếu chi (sensitive, cần lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Hủy phiếu chi (sensitive, cần lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở tài chính đơn | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Mở chi tiết xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Mở sổ công nợ tài xế | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Mở Nguyễn Văn Tài | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Xem chứng từ bien_lai_BOT_1.jpg | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Xem chứng từ bien_lai_BOT_2.jpg | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Mở Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Tab Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Breadcrumb Phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | nav |
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
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Mở phiếu chi |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | Mở phiếu chi |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Mở phiếu chi |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Kết quả phiếu chi → chi tiết phiếu chi |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Mở phiếu chi |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Mở phiếu chi |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở phiếu chi |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Mở chi tiết phiếu chi |
| [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | Click mã phiếu → chi tiết |
| [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | KPI hoàn tài xế → PC-202609-0001 |
| [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | Lưu → chi tiết phiếu chi |
| [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | Trả NCC → đánh dấu phiếu chi đã trả |
| [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | Mở phiếu chi NCC |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Mở phiếu chi tạm ứng |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Mở phiếu chi |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Mở phiếu chi |
| [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | Mở phiếu chi |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Mở phiếu chi tạm ứng |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Mở phiếu chi |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Mở phiếu chi tạm ứng |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Mở chứng từ |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Mở phiếu chi ứng lương |
| [WM-PAYROLL-03](../wm/WM-PAYROLL-03.md) Tạo bảng lương | Mở phiếu chi ứng lương |
| [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | Mở phiếu chi ứng lương |
| [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | Mở phiếu chi tài xế chi trước |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Mở phiếu chi ứng lương |

## Components (design system)

`Button`, `StatusBadge`, `EntityHeader`, `Breadcrumb`, `SummaryStrip`, `DescriptionList`, `DataTable`, `Banner`, `DateField`, `FormField`, `SegmentedControl`, `Select`, `PartnerCard`, `AttachmentList`, `IconButton`, `Timeline`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `expense(id){links, attachments}`
- `markExpensePaid(id, input)`
- `updateExpense(id, input, reason)`
- `cancelExpense(id, reason)`
- `activityLogs(entityType: EXPENSE, entityId)`

## Trạng thái UI

- **loading**: Skeleton
- **error**: Không tìm thấy / không có quyền
- **paid**: Ẩn form hoàn tiền, hiện 'Đã trả 23/09/2026 · hình thức · người chi'
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Seed PC-202609-0001: phí cầu đường 800.000 đ, tài xế chi trước → công ty nợ tài xế (WM-DRV-05).
- Đánh dấu đã trả giảm công nợ tài xế/NCC; không đổi lãi/lỗ đơn (chi phí đã ghi nhận khi tạo).
