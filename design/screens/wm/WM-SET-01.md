# WM-SET-01 — Cài đặt vận hành

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Cài đặt |
| Route | `/settings/operations` |
| Pattern | `form` |
| Roles | admin |
| Kích thước mockup | 1440×1040 |
| Mockup | [../../mockups/WM-SET-01.html](../../mockups/WM-SET-01.html) · canvas artboard `WM-SET-01.dc.html` |

## Mục đích

Cấu hình kỳ lương, ngưỡng gần trùng lịch, ngưỡng COD (tiền/ngày), công nợ mặc định cho merchant.

## Dữ liệu hiển thị

- `payrollPeriod{type: MONTHLY|CUSTOM, startDay}`
- `nearOverlapHours (2)`
- `defaultTripHours`
- `overlapWarnVehicle`
- `overlapWarnDriver`
- `codWarningAmount (5.000.000)`
- `codWarningDays (2)`
- `codDashboardAlert`
- `defaultDebtDays (15)`
- `defaultCreditLimit`
- `warnOverLimit`
- `warnOverdue`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu cài đặt | Manage merchant profile/settings — admin |
| Bật/tắt Switch | admin; áp dụng ngay (mutation riêng từng switch, toast) |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Xem bảng lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | action |
| Mở cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | action |
| Mở COD tài xế đang giữ | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Mở công nợ khách | [WM-DEBT-01](../wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | action |
| Mở Timeline cài đặt | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Breadcrumb Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Khách hàng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | nav |
| Sidebar: Tài xế | [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | `/drivers` | nav |
| Sidebar: Xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | nav |
| Sidebar: Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
| Sidebar: Thu chi & Công nợ | [WM-FIN-01](../wm/WM-FIN-01.md) Sổ thu chi | `/finance` | nav |
| Sidebar: Lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | nav |
| Sidebar: Báo cáo | [WM-RPT-01](../wm/WM-RPT-01.md) Trung tâm báo cáo | `/reports` | nav |
| Sidebar: Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Hồ sơ nhà xe | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Nhân viên | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | nav |
| Sidebar: Vai trò & quyền | [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | `/settings/roles` | nav |
| Sidebar: Cài đặt vận hành | [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | `/settings/operations` | nav |
| Sidebar: Mã tự động | [WM-SET-02](../wm/WM-SET-02.md) Cấu hình mã tự động | `/settings/numbering` | nav |
| Sidebar: Danh mục | [WM-CAT-01](../wm/WM-CAT-01.md) Danh mục dùng chung | `/settings/catalogs` | nav |
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-SHELL-01](../wm/WM-SHELL-01.md) Layout chính | Cài đặt vận hành |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Cài đặt ngưỡng cảnh báo |
| [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | Mở cài đặt vận hành |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Mở cài đặt ngưỡng COD |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Mở cài đặt vận hành |
| [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | Mở cài đặt kỳ lương |
| [WM-PAYROLL-03](../wm/WM-PAYROLL-03.md) Tạo bảng lương | Mở cài đặt kỳ lương |

## Components (design system)

`RadioGroup`, `Select`, `FormField`, `TextField`, `Switch`, `MoneyInput`, `Timeline`, `Button`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `merchantSettings`
- `updateMerchantSettings(input)`

## Trạng thái UI

- **dirty**: Save bar hiện số thay đổi chưa lưu; rời trang → confirm
- **validation**: Ngưỡng > 0; ngày bắt đầu kỳ 1–28
- **no-permission**: Non-admin: read-only
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Ngưỡng overlap dùng bởi DIS-002 (WM-DISPATCH-*); ngưỡng COD dùng bởi FIN-006 (WM-COD-01).
- Seed M-DEMO-A: kỳ lương tháng, 2 giờ, 5.000.000 đ / 2 ngày, 15 ngày.
- Sửa ghi audit_log.
