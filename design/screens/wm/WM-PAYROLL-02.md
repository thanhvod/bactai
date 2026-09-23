# WM-PAYROLL-02 — Chi tiết bảng lương

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Lương |
| Route | `/payroll/:payrollId` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1180 |
| Mockup | [../../mockups/WM-PAYROLL-02.html](../../mockups/WM-PAYROLL-02.html) · canvas artboard `WM-PAYROLL-02.dc.html` |

## Mục đích

Kiểm tra từng dòng lương tài xế (snapshot), cảnh báo dữ liệu; gửi duyệt, duyệt, trả về, đánh dấu đã trả, xuất.

## Dữ liệu hiển thị

- `code`
- `status`
- `period`
- `createdBy`
- `submittedAt`
- `approver`
- `totals{salary, bonus, advance, deduction, net}`
- `lines[]`
- `anomalies[] (COD giữ, chuyến đang chạy, tài xế ngừng hoạt động)`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Gửi duyệt | payroll.submit (admin, operation) — chỉ khi Nháp |
| Duyệt | payroll.approve (admin) → WM-PAYROLL-05 |
| Trả về / Hủy duyệt | payroll.return (admin) — sensitive, lý do bắt buộc |
| Đánh dấu đã trả | payroll.markPaid (admin, accountant) — chỉ khi Đã duyệt |
| Xuất | payroll.export (admin, accountant) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Xuất bảng lương / phiếu lương | WM-SHELL-05 | | action |
| Trả về (sensitive, lý do bắt buộc) | WM-SHELL-08 | | action |
| Duyệt bảng lương | [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | `/payroll/:payrollId/approve` | action |
| Tab Timeline | WM-SHELL-07 | | action |
| Click dòng → chi tiết dòng lương | [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | `/payroll/:payrollId/lines/:lineId` | action |
| Mở chi tiết dòng lương | [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | `/payroll/:payrollId/lines/:lineId` | action |
| Mở COD tài xế đang giữ | WM-COD-01 | | action |
| Mở chuyến đang chạy | WM-TRIP-01 | | action |
| Mở lịch sử lương cố định | WM-DRV-04 | | action |
| Mở phiếu chi ứng lương | WM-EXP-02 | | action |
| Mở danh mục lý do giảm trừ | WM-CAT-01 | | action |
| Mở Timeline | WM-SHELL-07 | | action |
| Breadcrumb Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
| Sidebar: Báo cáo | [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | `/reports` | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | Click mã bảng lương → chi tiết |
| [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | KPI Chờ duyệt → bảng lương |
| [WM-PAYROLL-03](../wm/WM-PAYROLL-03.md) Tạo bảng lương | Tạo → chi tiết bảng lương |
| [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | Quay lại chi tiết bảng lương |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Đóng dialog |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Trả về (lý do bắt buộc) → Nháp |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Duyệt → Đã duyệt |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Đóng |
| [WM-RPT-08](../wm/WM-RPT-08.md) Báo cáo bảng lương | Mở chi tiết bảng lương |
| [WM-RPT-08](../wm/WM-RPT-08.md) Báo cáo bảng lương | Mở bảng lương kỳ 09 |

## Components (design system)

`EntityHeader`, `Button`, `StatusBadge`, `SummaryStrip`, `Breadcrumb`, `Stepper`, `Tabs`, `DataTable`, `WarningPanel`, `DescriptionList`, `Timeline`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `payroll(id){lines{driver, baseSalary, bonusTotal, advanceTotal, deductionTotal, net, anomalies[]}}`
- `submitPayroll(id)`
- `returnPayroll(id, reason)`
- `markPayrollPaid(id)`
- `activityTimeline(entity: PAYROLL)`

## Trạng thái UI

- **loading**: Skeleton header + strip + bảng
- **error**: Không tìm thấy / không có quyền → EmptyState + quay lại danh sách
- **draft**: Nháp: hiện 'Gửi duyệt' primary; dòng lương cho thêm giảm trừ
- **approved**: Đã duyệt: 'Đánh dấu đã trả' primary; 'Hủy duyệt' trong menu (sensitive)
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Primary action đổi theo trạng thái: Nháp→Gửi duyệt; Chờ duyệt→Duyệt (admin); Đã duyệt→Đánh dấu đã trả.
- Giá trị là snapshot lúc tạo; đổi lương tài xế sau đó không làm thay đổi bảng lương.
- Cảnh báo dữ liệu là WarningPanel, không chặn duyệt. COD tài xế giữ không trừ vào lương.
