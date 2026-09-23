# WM-SHELL-04 — Import wizard

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khung chung |
| Route | `(dialog) từ danh sách khách/xe/tài xế` |
| Pattern | `dialog` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-SHELL-04.html](../../mockups/WM-SHELL-04.html) · canvas artboard `WM-SHELL-04.dc.html` |
| Overlay trên | [WM-CUS-01](./WM-CUS-01.md) (drawer/modal, không cần route riêng) |

## Mục đích

Import Excel khách hàng/xe/tài xế: Upload → Map cột → Kiểm tra lỗi → Xác nhận. Không ghi dữ liệu trước khi xác nhận.

## Dữ liệu hiển thị

- `entityType`
- `fileName`
- `totalRows`
- `validRows`
- `warningRows`
- `errorRows`
- `rows[{line, values, errors[], warnings[]}]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tải file lỗi | create permission của entity |
| Xác nhận nhập | customer.create | vehicle.create | driver.create |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Hủy import | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | action |
| Xác nhận import 45 dòng → danh sách khách | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | action |
| Đóng | [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | `/customers` | action |
| Mở khách hàng | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tạo khách | [WM-CUS-03](../wm/WM-CUS-03.md) Form khách hàng | `/customers/new · /customers/:customerId/edit` | action |
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
| Merchant switcher | [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | nav |
| Quick search (Ctrl K) | [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | `(dialog) Ctrl K` | nav |
| Chuông thông báo | [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | `(popover) — từ chuông topbar` | nav |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | Import xe từ Excel |
| [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | Import xe từ Excel |
| [WM-CUS-01](../wm/WM-CUS-01.md) Danh sách khách hàng | Import khách hàng từ Excel |
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Import tài xế từ Excel |

## Components (design system)

`SummaryStrip`, `Select`, `FormField`, `RadioGroup`, `SegmentedControl`, `Button`, `DataTable`, `ImportWizard`, `Stepper`, `Dialog`, `IconButton`, `StatusBadge`, `PageHeader`, `FilterBar`, `TextField`, `FilterChip`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `startImport(input: {entityType, fileKey, mapping})`
- `importPreview(sessionId, filter)`
- `commitImport(sessionId, skipErrors)`

## Trạng thái UI

- **uploading**: Progress trong bước 1
- **validating**: Skeleton bảng + 'Đang kiểm tra 48 dòng…'
- **all_valid**: Banner success, bỏ qua bước lọc lỗi
- **commit_error**: Banner danger, giữ session để thử lại
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Lỗi = chặn dòng (SĐT/MST sai, thiếu trường bắt buộc, trùng MST/biển số); cảnh báo = vẫn nhập (tên gần giống, trường trống dùng mặc định).
- Import tenant-safe; audit log ghi số dòng nhập.
