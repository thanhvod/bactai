# WM-ORG-01 — Hồ sơ nhà xe

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Cài đặt |
| Route | `/settings/company` |
| Pattern | `form` |
| Roles | admin |
| Kích thước mockup | 1440×1020 |
| Mockup | [../../mockups/WM-ORG-01.html](../../mockups/WM-ORG-01.html) · canvas artboard `WM-ORG-01.dc.html` |

## Mục đích

Xem/sửa thông tin doanh nghiệp, địa chỉ, liên hệ và logo của merchant; dữ liệu in trên chứng từ.

## Dữ liệu hiển thị

- `code`
- `displayName`
- `legalName`
- `taxCode`
- `businessType`
- `address{line, province, district}`
- `yardName`
- `representative{name, title}`
- `phone`
- `dispatchHotline`
- `email`
- `logo{url, size, updatedAt}`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu thay đổi | Manage merchant profile/settings — admin |
| Đổi/xóa logo | admin |
| Xem mẫu in | view |
| Xem lịch sử | admin → WM-SHELL-07 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở preview mẫu in | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Mở Timeline hồ sơ nhà xe | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
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
| [WM-SHELL-01](../wm/WM-SHELL-01.md) Layout chính | Hồ sơ nhà xe |

## Components (design system)

`TextField`, `FormField`, `Select`, `Logo`, `Button`, `AttachmentUploader`, `Timeline`, `PageHeader`, `Breadcrumb`, `AppShell`, `Sidebar`, `Topbar`, `QuickSearch`, `NotificationBell`, `IconButton`

## API (GraphQL)

- `me{merchant}`
- `merchant(id)`
- `updateMerchantProfile(input)`
- `uploadAttachment(entityType: MERCHANT, kind: LOGO)`

## Trạng thái UI

- **loading**: Skeleton form 2 cột
- **error**: Banner danger 'Không lưu được hồ sơ' + giữ dữ liệu đã nhập
- **validation**: Tên nhà xe, địa chỉ, tỉnh, người đại diện, SĐT bắt buộc; MST 10 hoặc 13 số
- **no-permission**: Operation/Kế toán: form read-only, ẩn nút Lưu, banner 'Chỉ Admin được sửa hồ sơ nhà xe'
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Mã merchant do hệ thống cấp, không sửa.
- Logo PNG/JPG ≤ 2 MB, crop vuông; dùng ở header chứng từ (WM-SHELL-05, WM-ORD-09).
- Sửa hồ sơ ghi audit_log (before/after).
