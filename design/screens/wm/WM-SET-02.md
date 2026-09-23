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
| Mở danh sách Đơn hàng | WM-ORD-01 | | action |
| Mở danh sách Điều phối | WM-DISPATCH-01 | | action |
| Mở danh sách Phiếu thu | WM-PAY-01 | | action |
| Mở danh sách Phiếu chi | WM-EXP-01 | | action |
| Mở danh sách Bảng lương | WM-PAYROLL-01 | | action |
| Mở danh sách Bảng kê | WM-DEBT-03 | | action |
| Mở Timeline cấu hình mã | WM-SHELL-07 | | action |
| Breadcrumb Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | WM-DISPATCH-01 | | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | WM-VEH-01 | | nav |
| Sidebar: Nhà cung cấp | WM-SUP-01 | | nav |
| Sidebar: Thu chi & Công nợ | WM-FIN-01 | | nav |
| Sidebar: Lương | WM-PAYROLL-01 | | nav |
| Sidebar: Báo cáo | WM-RPT-01 | | nav |
| Sidebar: Cài đặt | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Hồ sơ nhà xe | [WM-ORG-01](../wm/WM-ORG-01.md) Hồ sơ nhà xe | `/settings/company` | nav |
| Sidebar: Nhân viên | [WM-USER-01](../wm/WM-USER-01.md) Danh sách nhân viên | `/settings/users` | nav |
| Sidebar: Vai trò & quyền | [WM-RBAC-01](../wm/WM-RBAC-01.md) Vai trò & phân quyền | `/settings/roles` | nav |
| Sidebar: Cài đặt vận hành | [WM-SET-01](../wm/WM-SET-01.md) Cài đặt vận hành | `/settings/operations` | nav |
| Sidebar: Mã tự động | [WM-SET-02](../wm/WM-SET-02.md) Cấu hình mã tự động | `/settings/numbering` | nav |
| Sidebar: Danh mục | [WM-CAT-01](../wm/WM-CAT-01.md) Danh mục dùng chung | `/settings/catalogs` | nav |
| Merchant switcher | WM-AUTH-03 | | nav |
| Quick search (Ctrl K) | WM-SHELL-03 | | nav |
| Chuông thông báo | WM-SHELL-02 | | nav |

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
- Bảng kê dùng tiền tố BK theo design system (BRD 09 gợi ý CN-; chốt BK- trên UI).
