# WM-EXP-03 — Tạo phiếu chi

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/expenses/new` |
| Pattern | `form` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×1320 |
| Mockup | [../../mockups/WM-EXP-03.html](../../mockups/WM-EXP-03.html) · canvas artboard `WM-EXP-03.dc.html` |

## Mục đích

Ghi khoản chi: chi phí chuyến, thuê xe ngoài, vật tư xe, hoàn ứng, ứng lương, tạm ứng chuyến, chi khác; gắn đối tượng theo loại.

## Dữ liệu hiển thị

- `category`
- `subCategory`
- `tripId`
- `orderId`
- `vehicleId`
- `driverId`
- `supplierId`
- `amount`
- `date`
- `paidBy(COMPANY|DRIVER|ADVANCE)`
- `reimburseDriver`
- `status`
- `note`
- `attachments[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu phiếu chi | expense.create |
| Lưu & tạo tiếp | expense.create |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Hủy tạo phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | action |
| Lưu → chi tiết phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
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
| [WM-ORD-06](../wm/WM-ORD-06.md) Add-on & giá bán (drawer) | Tạo phiếu chi gắn đơn |
| [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | Tạo phiếu chi gắn đơn |
| [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | Tạo phiếu chi gắn đơn |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Tạo phiếu chi gắn đơn |
| [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | Tạo phiếu chi gắn đơn |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Thêm chi phí chuyến |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Phiếu chi · Chi phí/NCC |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Phiếu chi · Tạm ứng chuyến |
| [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | Tạo phiếu chi |
| [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | Tạo phiếu chi NCC |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Thêm phiếu chi cho chuyến |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Tạo phiếu chi tạm ứng chuyến |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Tạo phiếu chi gắn xe |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Thêm chi phí xe |
| [WM-SUP-02](../wm/WM-SUP-02.md) Chi tiết NCC | Tạo phiếu chi cho NCC |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Tạo phiếu chi hoàn ứng |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Tạo phiếu chi hoàn ứng cho tài xế |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Tạo phiếu chi hoàn ứng cho tài xế |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Tạo phiếu chi hoàn ứng |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Tạo phiếu chi hoàn ứng cho tài xế |
| [WM-CAT-01](../wm/WM-CAT-01.md) Danh mục dùng chung | Mở form phiếu chi dùng danh mục |

## Components (design system)

`RadioGroup`, `EntityPicker`, `FormField`, `TextField`, `Select`, `MoneyInput`, `DateField`, `Checkbox`, `StatusBadge`, `AttachmentUploader`, `AttachmentList`, `IconButton`, `Button`, `DataTable`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `trips`
- `orders`
- `vehicles`
- `drivers`
- `suppliers`
- `catalogItems(type: EXPENSE_CATEGORY)`
- `createExpense(input)`

## Trạng thái UI

- **validation**: Trường bắt buộc đổi theo loại (bảng 'Trường gắn theo loại chi'); Thuê xe ngoài bắt buộc đơn + NCC
- **prefill**: Từ WM-ORD-07 / WM-TRIP-01 / WM-SUP-02 / WM-ADV-01: điền sẵn đơn/chuyến/NCC/loại
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Mockup ở loại Chi phí chuyến, tài xế chi trước (seed PC-202609-0001).
- Chọn chuyến tự điền đơn, xe, tài xế (read-only).
- Tạm ứng chuyến → xuất hiện ở WM-ADV-01; ứng lương → trừ bảng lương kỳ.
