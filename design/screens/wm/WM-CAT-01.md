# WM-CAT-01 — Danh mục dùng chung

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Cài đặt |
| Route | `/settings/catalogs` |
| Pattern | `list` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-CAT-01.html](../../mockups/WM-CAT-01.html) · canvas artboard `WM-CAT-01.dc.html` |

## Mục đích

CRUD danh mục theo merchant: loại chi phí, dịch vụ thêm, loại hàng, lý do tạm dừng, lý do giảm trừ, loại chứng từ, loại sự cố.

## Dữ liệu hiển thị

- `type`
- `code`
- `name`
- `appliesTo`
- `isDefault`
- `usageCount`
- `active`
- `sortOrder`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Thêm mục | Manage catalogs — admin, operation; accountant nếu được cấp |
| Sửa | như trên |
| Bật/tắt hoạt động | như trên; mục đã dùng chỉ ngừng, không xóa |
| Kéo sắp xếp | như trên |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở form phiếu chi dùng danh mục | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
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
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Mở danh mục lý do giảm trừ |
| [WM-PAYROLL-03](../wm/WM-PAYROLL-03.md) Tạo bảng lương | Mở danh mục lý do giảm trừ |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Mở danh mục lý do giảm trừ |

## Components (design system)

`SegmentedControl`, `StatusBadge`, `Switch`, `Button`, `Menu`, `IconButton`, `TextField`, `FormField`, `Select`, `FilterBar`, `FilterChip`, `DataTable`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `catalogItems(type)`
- `createCatalogItem(input)`
- `updateCatalogItem(id, input)`
- `deactivateCatalogItem(id)`
- `reorderCatalogItems(type, ids)`

## Trạng thái UI

- **loading**: Skeleton list + table
- **empty**: EmptyState 'Chưa có mục nào' + nút Thêm mục
- **validation**: Mã duy nhất trong loại, tên bắt buộc
- **read-only**: Kế toán không được cấp: ẩn Thêm/Sửa, switch disabled
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Danh mục chọn qua ?type= (expense|addon|cargo|pause_reason|deduction_reason|attachment_type|incident_type).
- Seed mặc định khi tạo merchant; inactive không hiện trong form mới nhưng dữ liệu cũ vẫn hiển thị label.
- Nơi dùng: loại chi phí WM-EXP-03, dịch vụ thêm WM-ORD-03/06, loại hàng WM-ORD-05, lý do tạm dừng DA-STATUS-02, lý do giảm trừ WM-PAYROLL-04, loại chứng từ WM-SHELL-06, loại sự cố WM-INC-01/DA-INC-01.
