# WM-DRV-04 — Lịch sử lương cố định

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Tài xế |
| Route | `/drivers/:driverId/salary-history (tab Lương/ứng)` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1060 |
| Mockup | [../../mockups/WM-DRV-04.html](../../mockups/WM-DRV-04.html) · canvas artboard `WM-DRV-04.dc.html` |

## Mục đích

Các mốc lương cố định theo ngày hiệu lực, người sửa, lý do; thêm mốc lương mới mà kỳ cũ vẫn tính đúng.

## Dữ liệu hiển thị

- `effectiveFrom`
- `effectiveTo`
- `amount`
- `delta`
- `reason`
- `createdBy`
- `createdAt`
- `payrollsUsing[]`
- `payrollLines[{payrollCode, salarySnapshot, bonus, advances, net, status}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Thêm mốc lương (dialog) | driver.salary.manage (admin; operation ⚠️) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở bảng lương | WM-PAYROLL-02 | | action |
| Mở dòng lương tài xế | WM-PAYROLL-04 | | action |
| Mở danh sách bảng lương | WM-PAYROLL-01 | | action |
| Mở phiếu chi tạm ứng | WM-EXP-02 | | action |
| Mở tạm ứng chuyến & đối soát | WM-ADV-01 | | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| Sửa tài xế | [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | `/drivers/new · /drivers/:driverId/edit` | action |
| Tạo phiếu chi hoàn ứng cho tài xế | WM-EXP-03 | | action |
| Menu: Ngừng hoạt động tài xế (sensitive) | WM-SHELL-08 | | action |
| Mở chuyến hiện tại | WM-TRIP-01 | | action |
| Tab Tổng quan | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Tab Công nợ | [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | `/drivers/:driverId?tab=ledger` | action |
| Breadcrumb Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Sidebar: Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | WM-ORG-01 | | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Mở lịch sử lương cố định |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Tab Lương/ứng |
| [WM-DRV-03](../wm/WM-DRV-03.md) Form tài xế | Mở lịch sử lương cố định |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Tab Lương/ứng |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Tab Lương/ứng |

## Components (design system)

`MoneyInput`, `FormField`, `DateField`, `AuditDiff`, `Textarea`, `Banner`, `Button`, `StatusBadge`, `DataTable`, `Dialog`, `IconButton`, `EntityHeader`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `driver(id){salaryHistory}`
- `addDriverSalaryHistory(driverId, input{amount, effectiveFrom, reason})`
- `payrolls(filter:{driverId})`

## Trạng thái UI

- **validation**: Số tiền > 0; ngày hiệu lực bắt buộc, không trùng mốc đã có; lý do bắt buộc
- **empty**: Chưa có mốc lương → EmptyState + Thêm mốc lương
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Payroll lấy lương cố định theo mốc hiệu lực trong kỳ và lưu snapshot vào dòng lương; thêm mốc mới không tính lại bảng lương đã tạo.
- Quy tắc khi mốc rơi giữa kỳ (vd ngày 15) cần chốt cùng payroll; acceptance: kỳ trước không đổi.
- Dialog hiện diff trước/sau và kỳ lương bị ảnh hưởng.
