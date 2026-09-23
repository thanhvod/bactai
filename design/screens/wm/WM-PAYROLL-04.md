# WM-PAYROLL-04 — Chi tiết dòng lương tài xế

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Lương |
| Route | `/payroll/:payrollId/lines/:lineId` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1240 |
| Mockup | [../../mockups/WM-PAYROLL-04.html](../../mockups/WM-PAYROLL-04.html) · canvas artboard `WM-PAYROLL-04.dc.html` |

## Mục đích

Các khoản cấu thành lương của một tài xế, drilldown chuyến/đơn/phiếu chi; thêm giảm trừ có lý do; in phiếu lương.

## Dữ liệu hiển thị

- `driver`
- `baseSalarySnapshot`
- `items[] (BASE|BONUS|ADVANCE|DEDUCTION)`
- `net`
- `excluded[] (chi phí chi trước, tạm ứng chuyến)`
- `disputes[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Thêm giảm trừ | payroll.line.update (admin, operation) — chỉ khi Nháp; lý do bắt buộc |
| In phiếu lương | payroll.export (admin, accountant) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở tài xế | WM-DRV-02 | | action |
| In phiếu lương | WM-SHELL-05 | | action |
| Quay lại chi tiết bảng lương | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | action |
| Mở lịch sử lương cố định | WM-DRV-04 | | action |
| Mở chuyến có thưởng | WM-TRIP-01 | | action |
| Mở đơn hàng | WM-ORD-02 | | action |
| Mở phiếu chi ứng lương | WM-EXP-02 | | action |
| Mở phiếu chi tài xế chi trước | WM-EXP-02 | | action |
| Mở đối soát tạm ứng chuyến | WM-ADV-01 | | action |
| Mở sổ công nợ tài xế | WM-DRV-05 | | action |
| Breadcrumb Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
| Breadcrumb BL-202609-0001 | [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | `/payroll/:payrollId` | nav |
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
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Click dòng → chi tiết dòng lương |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Mở chi tiết dòng lương |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Click dòng → chi tiết dòng lương |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Mở chi tiết dòng lương |

## Components (design system)

`EntityHeader`, `StatusBadge`, `Button`, `SummaryStrip`, `DataTable`, `Banner`, `Select`, `FormField`, `MoneyInput`, `Textarea`, `Timeline`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `payrollLine(id){items[{type, description, sourceRef, date, amount}]}`
- `addPayrollDeduction(lineId, input{reasonId, amount, refId, note})`
- `driverLedger(driverId)`

## Trạng thái UI

- **readonly**: Chờ duyệt/Đã duyệt/Đã trả: form giảm trừ disabled + banner giải thích
- **loading**: Skeleton
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Mỗi khoản thưởng link chuyến (WM-TRIP-01) và đơn (WM-ORD-02); ứng lương link phiếu chi (WM-EXP-02).
- Giảm trừ dùng danh mục lý do (WM-CAT-01), ghi Timeline.
