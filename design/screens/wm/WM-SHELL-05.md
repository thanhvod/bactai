# WM-SHELL-05 — Export/print preview

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khung chung |
| Route | `(page) …/export · …/print` |
| Pattern | `page` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1120 |
| Mockup | [../../mockups/WM-SHELL-05.html](../../mockups/WM-SHELL-05.html) · canvas artboard `WM-SHELL-05.dc.html` |

## Mục đích

Xem trước PDF/Excel, chọn mẫu, tải hoặc in: bảng kê, bảng lương, phiếu giao hàng/điều xe, chi phí chuyến, COD.

## Dữ liệu hiển thị

- `template`
- `format`
- `paperSize`
- `options`
- `previewUrl`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tải PDF / Excel | quyền view/export theo tài liệu (payroll export: admin, accountant) |
| In | như trên |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại chi tiết bảng kê | WM-DEBT-04 | | action |
| Breadcrumb Thu chi & Công nợ | WM-FIN-01 | | nav |
| Breadcrumb Bảng kê công nợ | WM-DEBT-03 | | nav |
| Breadcrumb BK-202609-0001 | WM-DEBT-04 | | nav |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Sổ thu chi | WM-FIN-01 | | nav |
| Sidebar: Phiếu thu | WM-PAY-01 | | nav |
| Sidebar: Phiếu chi | WM-EXP-01 | | nav |
| Sidebar: Công nợ khách | WM-DEBT-01 | | nav |
| Sidebar: Công nợ NCC | WM-DEBT-02 | | nav |
| Sidebar: Bảng kê công nợ | WM-DEBT-03 | | nav |
| Sidebar: COD tài xế | WM-COD-01 | | nav |
| Sidebar: Tạm ứng chuyến | WM-ADV-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | Xuất Excel |
| [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | Xuất báo cáo |

## Components (design system)

`PrintSheet`, `Logo`, `DescriptionList`, `DataTable`, `RadioGroup`, `SegmentedControl`, `FormField`, `Select`, `Checkbox`, `Banner`, `Button`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `exportFile(input: {template, entityId, format, options})`
- `debtStatement(id){pdfSnapshotUrl}`

## Trạng thái UI

- **generating**: Skeleton trang A4 + 'Đang tạo file…'
- **error**: Banner danger + Thử lại
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Bảng kê đã chốt dùng PDF snapshot lưu trong debt_statement, không render lại.
- Tiền VND số nguyên, ngày dd/mm/yyyy trong file Excel.
