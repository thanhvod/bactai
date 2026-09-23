# WM-PAY-03 — Tạo phiếu thu

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Thu chi & Công nợ |
| Route | `/finance/payments/new` |
| Pattern | `form` |
| Roles | admin, accountant, operation |
| Kích thước mockup | 1440×1320 |
| Mockup | [../../mockups/WM-PAY-03.html](../../mockups/WM-PAY-03.html) · canvas artboard `WM-PAY-03.dc.html` |

## Mục đích

Ghi nhận tiền vào: khách trả, tài xế nộp COD (chọn khoản COD cần đối trừ) hoặc thu khác.

## Dữ liệu hiển thị

- `type(CUSTOMER_PAYMENT|DRIVER_COD_REMITTANCE|OTHER)`
- `customerId|driverId|payerName`
- `amount`
- `receivedAt`
- `method`
- `receivedBy`
- `note`
- `codItems[{stopId, amount}]`
- `attachments[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu phiếu thu | payment.create; DRIVER_COD_REMITTANCE cần quyền Record driver COD remittance (admin/kế toán) |
| Lưu & tạo tiếp | payment.create |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở sổ công nợ tài xế | WM-DRV-05 | | action |
| Mở tài chính đơn | WM-ORD-07 | | action |
| Mở chuyến | WM-TRIP-01 | | action |
| Mở điểm dừng | WM-STOP-01 | | action |
| Mở danh sách COD tài xế đang giữ | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Mở phân bổ payment | [WM-PAY-04](../wm/WM-PAY-04.md) Phân bổ payment | `/finance/payments/:paymentId/allocate` | action |
| Hủy tạo phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | action |
| Lưu → chi tiết phiếu thu | [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Breadcrumb Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Sổ thu chi | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | nav |
| Sidebar: Phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | nav |
| Sidebar: Công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | nav |
| Sidebar: Công nợ NCC | [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | `/finance/supplier-debt` | nav |
| Sidebar: Bảng kê công nợ | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | nav |
| Sidebar: COD tài xế | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | nav |
| Sidebar: Tạm ứng chuyến | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Phiếu thu · Khách trả |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Phiếu thu · Tài xế nộp COD |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Phiếu thu · Thu khác |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | Tạo phiếu thu |
| [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | Ghi nhận thanh toán cho khách |
| [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | Ghi thu đơn quá hạn |
| [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | Tạo phiếu thu khách trả |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Tạo phiếu thu COD cho tài xế |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Tạo phiếu thu COD từ khoản đã chọn |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Xác nhận đối soát → phiếu thu hoàn tạm ứng |

## Components (design system)

`RadioGroup`, `EntityPicker`, `FormField`, `StatusBadge`, `MoneyInput`, `DataTable`, `Checkbox`, `DateField`, `SegmentedControl`, `Select`, `Textarea`, `AttachmentUploader`, `AttachmentList`, `IconButton`, `Button`, `Banner`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `customers`
- `drivers`
- `driverCodHeld(filter: {driverId})`
- `createPaymentIn(input)`

## Trạng thái UI

- **validation**: Số tiền > 0; COD: tổng 'Nộp lần này' = số tiền, mỗi dòng ≤ còn giữ (lỗi inline danger)
- **prefill**: Từ WM-COD-01: type=DRIVER_COD_REMITTANCE, driverId, các khoản đã chọn; từ WM-DEBT-01/WM-CUS-05: type=CUSTOMER_PAYMENT, customerId
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Mockup ở trạng thái loại = Tài xế nộp COD (từ WM-COD-01).
- Loại Khách trả: EntityPicker khách, không có bảng COD; sau lưu → WM-PAY-02 để phân bổ (WM-PAY-04), phần chưa phân bổ vào số dư khách.
- Panel 'Sau khi lưu' luôn nói rõ: COD nộp lại không đổi doanh thu, không đổi công nợ khách.
- react-hook-form + zod; MoneyInput số nguyên VND.
