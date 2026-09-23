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
| Quay lại chi tiết bảng kê | [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | `/finance/debt-statements/:statementId` | action |
| Breadcrumb Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Breadcrumb Bảng kê công nợ | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | nav |
| Breadcrumb CN-202609-0001 | [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | `/finance/debt-statements/:statementId` | nav |
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
| [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | Xuất Excel |
| [WM-DASH-03](../wm/WM-DASH-03.md) Dashboard tài chính | Xuất báo cáo |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | In phiếu điều xe |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | In phiếu điều xe |
| [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | Xuất danh sách sự cố |
| [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | Xuất sổ thu chi |
| [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | Xuất danh sách phiếu thu |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | In phiếu thu |
| [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | Xuất danh sách phiếu chi |
| [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | Xuất công nợ khách |
| [WM-DEBT-02](../wm/WM-DEBT-02.md) Công nợ NCC | Xuất công nợ NCC |
| [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | Tải PDF bảng kê |
| [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | Tải PDF bảng kê |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Xuất COD đang giữ |
| [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | Xuất danh sách xe |
| [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | Xuất danh sách xe |
| [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | Xuất danh sách NCC |
| [WM-SUP-03](../wm/WM-SUP-03.md) Form NCC | Xuất danh sách NCC |
| [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | Xuất danh sách khách |
| [WM-CUS-05](../wm/WM-CUS-05.md) Công nợ khách | Xuất công nợ khách |
| [WM-CUS-06](../wm/WM-CUS-06.md) Lịch sử đơn khách | Xuất lịch sử đơn |
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Xuất danh sách tài xế |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Xuất sổ công nợ tài xế |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Xuất COD tài xế |
| [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | Xuất Excel |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Xuất bảng lương / phiếu lương |
| [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | In phiếu lương |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Xuất bảng lương / phiếu lương |
| [WM-RPT-02](../wm/WM-RPT-02.md) Doanh thu - chi phí - lãi/lỗ | Xuất Excel |
| [WM-RPT-03](../wm/WM-RPT-03.md) Lãi/lỗ theo đơn | Xuất Excel |
| [WM-RPT-04](../wm/WM-RPT-04.md) Hiệu suất xe | Xuất Excel |
| [WM-RPT-05](../wm/WM-RPT-05.md) Hiệu suất tài xế | Xuất Excel |
| [WM-RPT-06](../wm/WM-RPT-06.md) Công nợ khách | Xuất Excel |
| [WM-RPT-07](../wm/WM-RPT-07.md) COD tài xế | Xuất Excel |
| [WM-RPT-08](../wm/WM-RPT-08.md) Báo cáo bảng lương | Xuất phiếu lương tài xế |
| [WM-RPT-08](../wm/WM-RPT-08.md) Báo cáo bảng lương | Xuất phiếu lương hàng loạt |
| [WM-RPT-08](../wm/WM-RPT-08.md) Báo cáo bảng lương | Xuất Excel |
| [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | Mở preview mẫu in |

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
