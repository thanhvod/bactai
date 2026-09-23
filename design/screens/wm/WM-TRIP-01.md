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
| Mở phiếu chi | [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | `/finance/expenses/:expenseId` | action |
| Mở tạm ứng chuyến | [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | `/finance/trip-advances` | action |
| Thêm chi phí chuyến | [WM-EXP-03](../wm/WM-EXP-03.md) Tạo phiếu chi | `/finance/expenses/new` | action |
| Xem ảnh POD | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Mở COD tài xế | [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | `/finance/cod` | action |
| Tạm dừng chuyến (nhập lý do) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Hủy chuyến (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở chi tiết điểm dừng | [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | `/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)` | action |
| Mở xe | [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | `/vehicles/:vehicleId` | action |
| Mở tài xế | [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | `/drivers/:driverId` | action |
| Mở chuyến kế tiếp | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Đổi xe/tài xế | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Mở bản đồ vị trí xe | [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | `/dispatch/map` | action |
| Mở chi tiết sự cố | [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | `/dispatch/incidents/:incidentId` | action |
| Báo sự cố mới | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | action |
| Mở Timeline | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| In phiếu điều xe | [WM-SHELL-05](../wm/WM-SHELL-05.md) Export/print preview | `(page) …/export · …/print` | action |
| Sửa chuyến / đổi xe, tài xế | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Menu: Hủy chuyến (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Mở đơn hàng | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Mở khách hàng | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Breadcrumb Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Breadcrumb Bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | nav |
| Sidebar: Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
| Sidebar: Điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Bảng điều phối | [WM-DISPATCH-01](../wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | nav |
| Sidebar: Lịch xe/tài xế | [WM-DISPATCH-02](../wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | nav |
| Sidebar: Cảnh báo lịch | [WM-DISPATCH-03](../wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | nav |
| Sidebar: Vị trí xe | [WM-DISPATCH-04](../wm/WM-DISPATCH-04.md) Theo dõi vị trí | `/dispatch/map` | nav |
| Sidebar: Sự cố | [WM-DISPATCH-05](../wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | nav |
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
| [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | Mở chuyến |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở chuyến |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở chuyến chưa gán xe |
| [WM-SHELL-02](../wm/WM-SHELL-02.md) Trung tâm thông báo | Mở chuyến có sự cố |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Kết quả chuyến → chi tiết chuyến |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở chuyến |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở chuyến chưa gán xe |
| [WM-SHELL-03](../wm/WM-SHELL-03.md) Tìm kiếm nhanh | Mở chuyến có sự cố |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Mở chuyến |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Mở chuyến |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở chuyến |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở chuyến chưa gán xe |
| [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | Mở chuyến có sự cố |
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Mở chuyến |
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Mở chuyến cảnh báo |
| [WM-DASH-02](../wm/WM-DASH-02.md) Dashboard vận hành | Mở chuyến hiện tại |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Mở chuyến kế tiếp |
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
| [WM-PAY-03](../wm/WM-PAY-03.md) Tạo phiếu thu | Mở chuyến |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Mở chuyến |
| [WM-COD-01](../wm/WM-COD-01.md) COD tài xế đang giữ | Mở chuyến |
| [WM-ADV-01](../wm/WM-ADV-01.md) Tạm ứng chuyến & đối soát | Mở chuyến |
| [WM-VEH-01](../wm/WM-VEH-01.md) Danh sách xe | Mở chuyến hiện tại |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Mở chuyến hiện tại |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Mở chuyến |
| [WM-VEH-03](../wm/WM-VEH-03.md) Form xe | Mở chuyến hiện tại |
| [WM-DRV-01](../wm/WM-DRV-01.md) Danh sách tài xế | Mở chuyến hiện tại |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Mở chuyến |
| [WM-DRV-02](../wm/WM-DRV-02.md) Chi tiết tài xế | Mở chuyến hiện tại |
| [WM-DRV-04](../wm/WM-DRV-04.md) Lịch sử lương cố định | Mở chuyến hiện tại |
| [WM-DRV-05](../wm/WM-DRV-05.md) Sổ công nợ tài xế | Mở chuyến hiện tại |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Mở chuyến |
| [WM-DRV-06](../wm/WM-DRV-06.md) COD tài xế đang giữ | Mở chuyến hiện tại |
| [WM-PAYROLL-02](../wm/WM-PAYROLL-02.md) Chi tiết bảng lương | Mở chuyến đang chạy |
| [WM-PAYROLL-03](../wm/WM-PAYROLL-03.md) Tạo bảng lương | Mở chuyến có thưởng |
| [WM-PAYROLL-04](../wm/WM-PAYROLL-04.md) Chi tiết dòng lương tài xế | Mở chuyến có thưởng |
| [WM-PAYROLL-05](../wm/WM-PAYROLL-05.md) Duyệt bảng lương | Mở chuyến đang chạy |

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
