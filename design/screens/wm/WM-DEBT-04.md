# WM-DEBT-04 — Chi tiết bảng kê công nợ

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/debt-statements/:statementId` |
| Pattern | `detail` |
| Roles | admin, accountant |
| Kích thước mockup | 1440×1060 |
| Mockup | [../../mockups/WM-DEBT-04.html](../../mockups/WM-DEBT-04.html) · canvas artboard `WM-DEBT-04.dc.html` |

## Mục đích

Dòng snapshot các đơn (ngày, mã, tuyến, tổng, đã thu, còn lại, hạn, quá hạn); chốt, đánh dấu đã gửi, tải PDF, hủy.

## Dữ liệu hiển thị

- `code`
- `customer`
- `period`
- `status`
- `lines[{orderDate, orderCode, route, total, paid, remaining, dueDate, overdueDays}]`
- `totals`
- `finalizedAt`
- `finalizedBy`
- `pdfAttachment`
- `diffVsCurrent[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tải PDF | finance.view → WM-SHELL-05 |
| Đánh dấu đã gửi | debtStatement.finalize — admin/kế toán |
| Hủy bảng kê | debtStatement.cancel — sensitive, lý do bắt buộc (WM-SHELL-08) |
| Chốt (khi Nháp) | debtStatement.finalize |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Hủy bảng kê đã chốt (sensitive, cần lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Tải PDF bảng kê | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Mở công nợ khách | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Mở công nợ khách hiện tại | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Mở tài chính đơn (dữ liệu hiện tại) | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Xem chứng từ CN-202609-0003.pdf | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Breadcrumb Bảng kê công nợ | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | nav |
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
| [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | Quay lại chi tiết bảng kê |
| [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | Click mã bảng kê → chi tiết |
| [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | Tạo bảng kê nháp → chi tiết |
| [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | Mở bảng kê |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Mở bảng kê |

## Components (design system)

`Button`, `StatusBadge`, `EntityHeader`, `Breadcrumb`, `Banner`, `SummaryStrip`, `DataTable`, `DescriptionList`, `AttachmentList`, `IconButton`, `Timeline`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `debtStatement(id){lines, pdf}`
- `finalizeDebtStatement(id)`
- `markDebtStatementSent(id)`
- `cancelDebtStatement(id, reason)`

## Trạng thái UI

- **draft**: Banner info 'Nháp — số liệu theo dữ liệu hiện tại' + nút Chốt bảng kê
- **finalized**: Banner primary khóa 'Đã chốt snapshot … — không thay đổi khi đơn/phiếu thay đổi'
- **cancelled**: Banner danger + lý do hủy; PDF vẫn xem được, gắn nhãn Đã hủy
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Lines là snapshot (debt_statement_lines), không join lại order khi hiển thị.
- PDF tải lại đúng bản đã chốt.
- Khối 'Khác biệt so với dữ liệu hiện tại' chỉ tham khảo.
