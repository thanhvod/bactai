# WM-SET-02 — Cấu hình mã tự động

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Cài đặt |
| Route | `/settings/numbering` |
| Pattern | `form` |
| Roles | admin |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-SET-02.html](../../mockups/WM-SET-02.html) · canvas artboard `WM-SET-02.dc.html` |

## Mục đích

Xem format và counter mã theo loại chứng từ; sửa tiền tố/định dạng nếu được phép.

## Dữ liệu hiển thị

- `docType (ORDER|TRIP|PAYMENT_IN|EXPENSE|PAYROLL|DEBT_STATEMENT)`
- `prefix`
- `separator`
- `datePart`
- `digits`
- `resetPeriod`
- `nextPreview`
- `issuedThisPeriod`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Sửa định dạng | admin |
| Lưu định dạng | admin; áp dụng cho chứng từ mới |
| Xem lịch sử | → WM-SHELL-07 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở danh sách Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | action |
| Mở danh sách Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | action |
| Mở danh sách Phiếu thu | [WM-PAY-01](../wm/WM-PAY-01.md) Danh sách phiếu thu | `/finance/payments` | action |
| Mở danh sách Phiếu chi | [WM-EXP-01](../wm/WM-EXP-01.md) Danh sách phiếu chi | `/finance/expenses` | action |
| Mở danh sách Bảng lương | [WM-PAYROLL-01](../wm/WM-PAYROLL-01.md) Danh sách bảng lương | `/payroll` | action |
| Mở danh sách Bảng kê | [WM-DEBT-03](../wm/WM-DEBT-03.md) Danh sách bảng kê công nợ | `/finance/debt-statements` | action |
| Mở Timeline cấu hình mã | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
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

- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.

## Components (design system)

`StatusBadge`, `IconButton`, `Button`, `DataTable`, `TextField`, `FormField`, `Select`, `WarningPanel`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `numberSequences{docType, prefix, pattern, resetPeriod, nextValue, issuedThisPeriod}`
- `updateNumberSequenceFormat(docType, input)`

## Trạng thái UI

- **validation**: Tiền tố 2–4 chữ in hoa, không trùng loại khác
- **error**: Banner danger nếu lưu lỗi
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- number_sequences theo merchant + docType + period; transaction/lock chống trùng (FDN-006).
- Không cho sửa/lùi counter. Mã đã cấp không đổi, không tái sử dụng.
- Bảng kê công nợ dùng tiền tố CN- theo BRD 09 §2.1 (BK- dành cho booking Web Khách hàng).
