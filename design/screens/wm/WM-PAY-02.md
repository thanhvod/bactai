# WM-PAY-02 — Chi tiết phiếu thu

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/payments/:paymentId` |
| Pattern | `detail` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×1200 |
| Mockup | [../../mockups/WM-PAY-02.html](../../mockups/WM-PAY-02.html) · canvas artboard `WM-PAY-02.dc.html` |

## Mục đích

Thông tin thu, người nộp, phân bổ vào đơn, số dư khách phát sinh, chứng từ và audit.

## Dữ liệu hiển thị

- `code`
- `type`
- `payer`
- `amount`
- `receivedAt`
- `method`
- `bankAccount`
- `transferNote`
- `allocations[]`
- `unallocatedAmount`
- `creditLedger[]`
- `attachments[]`
- `audit[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Phân bổ vào đơn | payment.allocate |
| Sửa | payment.update — sensitive, lý do bắt buộc (WM-SHELL-08) |
| Hủy phiếu | payment.cancel — sensitive, lý do bắt buộc (WM-SHELL-08) |
| In phiếu thu | finance.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| In phiếu thu | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Sửa phiếu thu (sensitive, cần lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Hủy phiếu thu (sensitive, cần lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Phân bổ vào đơn | [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | `/finance/payments/:paymentId/allocate` | action |
| Mở khách hàng | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Empty state: phân bổ | [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | `/finance/payments/:paymentId/allocate` | action |
| Mở công nợ khách | [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | `/customers/:customerId?tab=debt` | action |
| Mở Bao bì Hưng Lợi | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Xem chứng từ UNC_VCB_180926.pdf | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Mở Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Tab Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Breadcrumb Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | nav |
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
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Kết quả phiếu thu → chi tiết phiếu thu |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Mở chi tiết phiếu thu |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | KPI chưa phân bổ → PT-202609-0002 |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | Click mã phiếu → chi tiết |
| [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | Lưu → chi tiết phiếu thu |
| [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | Hủy phân bổ → chi tiết phiếu |
| [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | Xác nhận phân bổ → chi tiết phiếu |
| [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | KPI số dư → phiếu chưa phân bổ |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Mở phiếu thu COD |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Mở phiếu thu |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Mở phiếu thu COD |
| [WM-RPT-07](../wm/WM-RPT-07.md) COD tài xế | Mở phiếu thu COD |

## Components (design system)

`Button`, `StatusBadge`, `EntityHeader`, `Breadcrumb`, `SummaryStrip`, `DescriptionList`, `Banner`, `EmptyState`, `DataTable`, `PartnerCard`, `AttachmentList`, `IconButton`, `Timeline`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `payment(id){allocations, attachments, customer{creditBalance}}`
- `activityLogs(entityType: PAYMENT_IN, entityId)`

## Trạng thái UI

- **loading**: Skeleton header + panels
- **error**: Không tìm thấy phiếu / không có quyền → EmptyState + quay lại danh sách
- **cancelled**: Banner danger 'Phiếu đã hủy' + lý do; ẩn hành động
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Seed PT-202609-0002: 3.000.000 đ chưa phân bổ → số dư khách Bao bì Hưng Lợi.
- Hủy phiếu đã phân bổ: gỡ allocation, còn nợ đơn tăng lại; ghi audit before/after.
- Với phiếu Tài xế nộp COD: thay khối 'Phân bổ vào đơn' bằng 'Khoản COD đã đối trừ'.
