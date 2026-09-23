# WM-TRIP-01 — Chi tiết chuyến

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Điều phối |
| Route | `/trips/:tripId` |
| Pattern | `detail` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1440 |
| Mockup | [../../mockups/WM-TRIP-01.html](../../mockups/WM-TRIP-01.html) · canvas artboard `WM-TRIP-01.dc.html` |

## Mục đích

Trung tâm một chuyến: phân công xe/tài xế, điểm dừng được giao, trạng thái (cập nhật thay tài xế), chi phí, thưởng, POD/COD, GPS, sự cố, timeline.

## Dữ liệu hiển thị

- `code`
- `status`
- `order{code, customer}`
- `vehicle{plate, type}`
- `driver{name, phone}`
- `plannedStartAt`
- `plannedEndAt`
- `actualStartAt`
- `stops[{sequence, type, location, contact, codExpected, codActual, podCount, status, actualArrivedAt, actualCompletedAt}]`
- `expenses[]`
- `advances[]`
- `driverBonusAmount`
- `lastLocation{lat, lng, capturedAt, speed}`
- `incidents[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Cập nhật trạng thái thay tài xế | trip.status.update (Admin, Operation) |
| Tạm dừng / hủy / đổi ngược | trip.status.update — sensitive, lý do bắt buộc |
| Sửa chuyến / đổi xe, tài xế | trip.assign → WM-TRIP-02, check overlap |
| Thêm chi phí | expense.create → WM-EXP-03 |
| Báo sự cố | incident.manage |
| In phiếu điều xe | trip.view |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở phiếu chi | WM-EXP-02 | | action |
| Mở tạm ứng chuyến | WM-ADV-01 | | action |
| Thêm chi phí chuyến | WM-EXP-03 | | action |
| Xem ảnh POD | WM-SHELL-06 | | action |
| Mở COD tài xế | WM-COD-01 | | action |
| Tạm dừng chuyến (nhập lý do) | WM-SHELL-08 | | action |
| Hủy chuyến (sensitive) | WM-SHELL-08 | | action |
| Mở chi tiết điểm dừng | [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | `/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)` | action |
| Mở xe | WM-VEH-02 | | action |
| Mở tài xế | WM-DRV-02 | | action |
| Đổi xe/tài xế | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Mở bản đồ vị trí xe | [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | `/dispatch/map` | action |
| Mở chi tiết sự cố | [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | `/dispatch/incidents/:incidentId` | action |
| Báo sự cố mới | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | action |
| Mở Timeline | WM-SHELL-07 | | action |
| Mở Timeline drawer | WM-SHELL-07 | | action |
| In phiếu điều xe | WM-SHELL-05 | | action |
| Sửa chuyến / đổi xe, tài xế | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Menu: Hủy chuyến (sensitive) | WM-SHELL-08 | | action |
| Mở đơn hàng | WM-ORD-02 | | action |
| Mở khách hàng | WM-CUS-02 | | action |
| Breadcrumb Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Breadcrumb Bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Dashboard | WM-DASH-01 | | nav |
| Sidebar: Đơn hàng | WM-ORD-01 | | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | nav |
| Sidebar: Cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | nav |
| Sidebar: Vị trí xe | [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | `/dispatch/map` | nav |
| Sidebar: Sự cố | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | nav |
| Sidebar: Khách hàng | WM-CUS-01 | | nav |
| Sidebar: Tài xế | WM-DRV-01 | | nav |
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
| [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | Mở chuyến B |
| [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | Lưu chuyến (không cảnh báo) → chi tiết chuyến |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Mở chuyến |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Đóng drawer |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Đóng |
| [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | Mở chuyến từ thẻ |
| [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | Click block CX-202609-0001 |
| [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | Click block CX-202609-0002 |
| [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | Click block CX-202609-0003 |
| [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | Click block CX-202609-0007 |
| [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | Mở chuyến bị trùng |
| [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | Mở chuyến |
| [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | Override có lý do → lưu chuyến |
| [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | Mở chuyến từ danh sách vị trí |
| [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | Mở tab GPS của chuyến |
| [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | Mở chuyến chưa chạy |
| [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | Mở chuyến |
| [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | Mở chuyến liên quan |

## Components (design system)

`StatusBadge`, `DataTable`, `Button`, `DescriptionList`, `StatusStepper`, `Stepper`, `MapView`, `Timeline`, `EntityHeader`, `IconButton`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `trip(id)`
- `updateTripStatus(id, status, reason?)`
- `updateTrip(id, input, reason?)`
- `activityLogs(entityType: TRIP, entityId)`
- `tripLocations(tripId, last: 1)`

## Trạng thái UI

- **loading**: Skeleton header + tabs
- **error**: Không tìm thấy chuyến / không có quyền → EmptyState + quay lại bảng điều phối
- **offline driver**: Banner info 'App tài xế mất kết nối từ 10:50' khi lastSeen > 15 phút
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Tabs dùng ?tab= (overview|stops|expenses|podcod|gps|incidents|timeline); mockup vẽ tab Tổng quan gồm tóm tắt mọi tab.
- Tạm dừng lưu previous status để resume. Hủy chuyến/đổi ngược mở SensitiveActionModal (WM-SHELL-08).
- Tạm ứng chuyến không tính vào lãi/lỗ đến khi đối soát (WM-ADV-01). COD tài xế thu không phải doanh thu.
- Accountant chỉ xem; nút cập nhật trạng thái/sửa ẩn theo quyền.
