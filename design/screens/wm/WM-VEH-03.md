# WM-VEH-03 — Form xe

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Xe |
| Route | `/vehicles/new · /vehicles/:vehicleId/edit` |
| Pattern | `drawer` |
| Roles | admin, operation |
| Kích thước mockup | 1440×1000 |
| Mockup | [../../mockups/WM-VEH-03.html](../../mockups/WM-VEH-03.html) · canvas artboard `WM-VEH-03.dc.html` |
| Overlay trên | [WM-VEH-01](./WM-VEH-01.md) (drawer/modal, không cần route riêng) |

## Mục đích

Tạo/sửa xe: biển số, loại, tải trọng, thông tin kỹ thuật, trạng thái.

## Dữ liệu hiển thị

- `plate`
- `type`
- `capacityTons`
- `brandModel`
- `year`
- `chassisNo`
- `engineNo`
- `boxSize`
- `fuelNorm`
- `registrationExpiresAt`
- `insuranceExpiresAt`
- `status`
- `note`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Lưu xe | vehicle.create / vehicle.update |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Hủy → danh sách xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | action |
| Lưu → chi tiết xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Đóng | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | action |
| Mở chuyến hiện tại | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Mở chi tiết xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Import xe từ Excel | WM-SHELL-04 | | action |
| Xuất danh sách xe | WM-SHELL-05 | | action |
| Thêm xe | [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | `/vehicles/new · /vehicles/:vehicleId/edit` | action |
| Mở phiếu chi xe | WM-EXP-01 | | action |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
| Sidebar: Xe | [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | `/vehicles` | nav |
| Sidebar: Nhà cung cấp | [WM-SUP-01](../wm/WM-SUP-01.md) Danh sách NCC | `/suppliers` | nav |
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
| [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | Thêm xe |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Sửa xe |
| [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | Thêm xe |

## Components (design system)

`TextField`, `FormField`, `Select`, `DateField`, `RadioGroup`, `Textarea`, `Button`, `Drawer`, `IconButton`, `StatusBadge`, `Menu`, `PageHeader`, `KpiCard`, `FilterBar`, `FilterChip`, `Pagination`, `DataTable`, `Checkbox`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `catalogItems(type: VEHICLE_TYPE)`
- `createVehicle(input)`
- `updateVehicle(id, input)`

## Trạng thái UI

- **validation**: Biển số trùng trong merchant → lỗi inline danger (CONFLICT)
- **saving**: Nút Lưu loading
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Biển số unique theo merchant; chuẩn hóa in hoa, bỏ khoảng trắng khi so sánh.
- Xe Bảo dưỡng/Ngừng sử dụng không hiện trong picker WM-TRIP-02.
