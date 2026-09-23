# WM-SHELL-06 — Attachment viewer

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Khung chung |
| Route | `(drawer) ?attachment=:id` |
| Pattern | `drawer` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×1000 |
| Mockup | [../../mockups/WM-SHELL-06.html](../../mockups/WM-SHELL-06.html) · canvas artboard `WM-SHELL-06.dc.html` |
| Overlay trên | [WM-ORD-02](./WM-ORD-02.md) (drawer/modal, không cần route riêng) |

## Mục đích

Xem ảnh/PDF chứng từ (POD, hóa đơn, phiếu xuất kho, ảnh sự cố), metadata, tải xuống, chuyển trước/sau.

## Dữ liệu hiển thị

- `fileName`
- `category`
- `entity{type, id, code}`
- `uploadedBy`
- `capturedAt`
- `uploadedAt`
- `mime`
- `size`
- `gps?`
- `note`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tải xuống | view permission của entity |
| Xóa chứng từ | attachment.delete — sensitive → WM-SHELL-08 |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở điểm dừng | [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | `/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)` | action |
| Mở chuyến | [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | `/trips/:tripId` | action |
| Xóa chứng từ (sensitive) | [WM-SHELL-08](../wm/WM-SHELL-08.md) Sensitive action modal | `(modal)` | action |
| Đóng | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Xem chứng từ Bien-ban-lay-hang_KhoCanTho.jpg | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Xem chứng từ Phieu-xuat-kho_PX-0923.pdf | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Xem chứng từ Su-co_ket-xe_QL1A.jpg | [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | `(drawer) ?attachment=:id` | action |
| Mở Timeline drawer | [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | `(drawer) ?timeline=1` | action |
| In/chia sẻ đơn | [WM-ORD-09](../wm/WM-ORD-09.md) In/chia sẻ đơn | `/orders/:orderId/print` | action |
| Sửa đơn | [WM-ORD-03](../wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | action |
| Tạo chuyến từ đơn | [WM-TRIP-02](../wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | action |
| Menu: Hủy đơn / sửa giá (sensitive) | [WM-ORD-08](../wm/WM-ORD-08.md) Hủy/sửa nhạy cảm đơn | `(modal)` | action |
| Mở khách hàng | [WM-CUS-02](../wm/WM-CUS-02.md) Chi tiết khách hàng | `/customers/:customerId` | action |
| Tab Tổng quan | [WM-ORD-02](../wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | action |
| Tab Điểm dừng | [WM-ORD-04](../wm/WM-ORD-04.md) Điểm lấy/trả (tab) | `/orders/:orderId?tab=stops` | action |
| Tab Hàng hóa | [WM-ORD-05](../wm/WM-ORD-05.md) Hàng hóa (tab) | `/orders/:orderId?tab=cargo` | action |
| Tab Tài chính | [WM-ORD-07](../wm/WM-ORD-07.md) Tài chính đơn (tab) | `/orders/:orderId?tab=finance` | action |
| Breadcrumb Đơn hàng | [WM-ORD-01](../wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | nav |
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
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Xem chứng từ Bien-ban-lay-hang_KhoCanTho.jpg |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Xem chứng từ Phieu-xuat-kho_PX-0923.pdf |
| [WM-SHELL-06](../wm/WM-SHELL-06.md) Attachment viewer | Xem chứng từ Su-co_ket-xe_QL1A.jpg |
| [WM-SHELL-07](../wm/WM-SHELL-07.md) Timeline drawer | Mở chứng từ POD |
| [WM-TRIP-01](../wm/WM-TRIP-01.md) Chi tiết chuyến | Xem ảnh POD |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Xem ảnh POD điểm lấy |
| [WM-STOP-01](../wm/WM-STOP-01.md) Chi tiết điểm dừng | Mở attachment viewer |
| [WM-INC-01](../wm/WM-INC-01.md) Chi tiết sự cố | Xem ảnh sự cố |
| [WM-PAY-02](../wm/WM-PAY-02.md) Chi tiết phiếu thu | Xem chứng từ UNC_VCB_180926.pdf |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Xem chứng từ bien_lai_BOT_1.jpg |
| [WM-EXP-02](../wm/WM-EXP-02.md) Chi tiết phiếu chi | Xem chứng từ bien_lai_BOT_2.jpg |
| [WM-DEBT-04](../wm/WM-DEBT-04.md) Chi tiết bảng kê công nợ | Xem chứng từ CN-202609-0003.pdf |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Xem chứng từ Dang-kiem-51C12345.pdf |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Xem chứng từ Bao-hiem-TNDS-2026.pdf |
| [WM-VEH-02](../wm/WM-VEH-02.md) Chi tiết xe | Xem chứng từ Cavet-xe.jpg |

## Components (design system)

`IconButton`, `Button`, `StatusBadge`, `DescriptionList`, `Textarea`, `FormField`, `AttachmentViewer`, `Drawer`, `AttachmentList`, `EntityHeader`, `SummaryStrip`, `Breadcrumb`, `Tabs`, `AppShell`, `Sidebar`, `Logo`, `Topbar`, `QuickSearch`, `NotificationBell`

## API (GraphQL)

- `attachments(entity)`
- `attachment(id){signedUrl}`

## Trạng thái UI

- **loading**: Skeleton khung ảnh
- **pdf**: Hiện trình xem PDF nhiều trang
- **unsupported**: Icon file + nút Tải xuống
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Signed URL ngắn hạn; không lộ file key.
- Mũi tên trái/phải chuyển chứng từ cùng entity.
