# Implementation guide — từ design package tới code

Tài liệu cho Claude Code / Orca. Mỗi task UI nên trích dẫn **screen ID** (ví dụ `WM-ORD-02`) và đọc spec `design/screens/<platform>/<ID>.md`
+ mockup `design/mockups/<ID>.html` trước khi code.

## 1. Thứ tự dựng

1. **Token**: copy `design/tokens/tokens.css` vào global CSS của `apps/web`; dùng `tailwind.preset.cjs` làm preset; Flutter dùng `bta_tokens.dart` và `btaTheme()`.
   Font Inter (web: `@fontsource-variable/inter` hoặc file woff2 của design system; Flutter: bundle Inter).
2. **Primitive** (shadcn/Radix): Button, IconButton, TextField, Textarea, Select, DateField, Checkbox, RadioGroup, Switch, Tabs, SegmentedControl,
   Dialog, Drawer (Sheet), Popover, Menu (DropdownMenu), Toast, Tooltip, Skeleton.
3. **Component nghiệp vụ** (danh sách + props: [COMPONENTS.md](COMPONENTS.md)): AppShell, Sidebar, Topbar, QuickSearch, NotificationList, PageHeader,
   Breadcrumb, FilterBar, DataTable, Pagination, StatusBadge, MoneyInput/MoneyCell, KpiCard, SummaryStrip, EntityHeader, DescriptionList, DueIndicator,
   EntityPicker, Timeline + AuditDiff, AttachmentList/Viewer/Uploader, SensitiveActionModal, WarningPanel, Banner, EmptyState, BarChart, LineChart.
4. **Template** (một lần, dùng lại): List page, Detail page có tabs, Create/edit form theo section, Drawer form, Finance allocation, Dashboard.
5. **Màn hình** theo thứ tự ưu tiên (doc/2-PRD/01 §9): Go-live (auth, dashboard, master data, orders, trips/dispatch, POD/COD, attachment, timeline;
   app tài xế login → home → trip → stop → status → POD → COD → sync) → Finance → Debt statement → Payroll → Reports/Settings → App Merchant → Web Khách hàng.

## 2. Router

- **Web**: dùng `spec/routes.web.ts` (ID → path). Detail tab dùng query `?tab=` (các màn `WM-ORD-04/05/07`, `WM-CUS-04/05/06`… là tab của detail, route
  ghi `?tab=` trong spec). Drawer/modal (`pattern: drawer|dialog`, có `overlayOf`) **không có route riêng** — mở trên màn nền `overlayOf`.
- **Flutter**: route name trong `spec/routes.mobile.dart` (khớp `doc/2-PRD/05-route-map.md` §3–4, ví dụ `DriverTripDetailRoute(tripId)`), dùng GoRouter.
  BottomNav là `StatefulShellRoute` với 4 tab (tài xế) / 5 tab (merchant).
- **Mọi liên kết** giữa màn nằm trong `spec/navigation.json`. Với mỗi màn, bảng "Điều hướng đi" trong spec liệt kê trigger → màn đích → route.
  Khi implement một màn, phải wire đủ các edge `kind: action` và `back` của màn đó. Edge `nav` do AppShell/BottomNav xử lý.
  Kiểm tra nhanh: `jq '.edges[] | select(.from=="WM-ORD-02")' design/spec/navigation.json`.

## 3. Shell theo platform

| Platform | Shell | Chi tiết |
|---|---|---|
| Web Merchant | `AppShell` | Sidebar 260px (11 nhóm, sub-nav cho Dashboard/Điều phối/Thu chi & Công nợ/Cài đặt, badge cảnh báo), Topbar 56px (QuickSearch Ctrl K → `WM-SHELL-03`, chuông → `WM-SHELL-02`, merchant switcher → `WM-AUTH-03`, user menu). |
| App Tài xế | `Scaffold` + `BottomNav` | Hôm nay · Chuyến · Thông báo · Tài khoản; `MobileHeader` mỗi màn; `PrimaryBottomAction` cho hành động chính. |
| App Merchant | `Scaffold` + `BottomNav` | Tổng quan · Đơn/Chuyến · Tài chính · Báo cáo · Tài khoản. |
| Web Khách hàng | `CustomerShell` | Top nav: Tìm nhà xe · Booking của tôi · Đơn hàng · Bảng kê; chuông; menu tài khoản. |

## 4. Quy tắc nghiệp vụ trên UI (không được sai)

- **Doanh thu ≠ phiếu thu.** Tổng thu đơn = giá cước + add-on. Phiếu thu là tiền vào, phân bổ thủ công vào đơn; phần dư = số dư khách.
  Phiếu thu loại "Tài xế nộp COD" là thu hồi, **không** tính doanh thu. Tab tài chính đơn tách 4 khối: doanh thu · dòng tiền đã phân bổ · chi phí · lãi/lỗ.
- **Cảnh báo mềm**: trùng/gần trùng lịch, vượt hạn mức nợ, COD giữ quá ngưỡng → `WarningPanel`, cho tiếp tục (override có quyền + lý do).
- **Sensitive action** (danh sách tại doc/2-PRD/08 §10) luôn qua `SensitiveActionModal`: hiển thị hành động, dữ liệu bị ảnh hưởng (AuditDiff), cảnh báo,
  **lý do bắt buộc**; ghi `audit_log` và hiện trong Timeline.
- **Snapshot**: bảng kê đã chốt và bảng lương dùng snapshot — banner `primary` có icon khóa.
- **Tài xế**: không có nút "nhận việc" (phase 1); tạm dừng (trạng thái chuyến) ≠ sự cố (bản ghi riêng); COD sửa sau khi lưu cần lý do; offline xếp hàng đợi.
- **Bản ghi ngừng hoạt động** (ví dụ tài xế DRV-A-003) vẫn hiện ở lịch sử nhưng không chọn được trong giao dịch mới.
- **Quyền**: UI ẩn/disable theo `spec/screens.json → actions[].guard` và doc/2-PRD/08; backend vẫn là nơi enforce.

## 5. Định dạng

Tiền số nguyên VND `1.250.000 đ`, căn phải, `tabular-nums`. Mã: `DH-202609-0001` (đơn), `CX-` (chuyến), `PT-` (phiếu thu), `PC-` (phiếu chi),
`BL-` (bảng lương), `BK-` (bảng kê). Ngày giờ `23/09/2026 14:30`. Tiếng Việt, viết hoa đầu câu, nút là động từ, không emoji.

## 6. Trạng thái UI bắt buộc

Mỗi màn có loading (Skeleton / DataTable loading), empty (EmptyState + action tiếp theo nếu có quyền), error (nói rõ lỗi, thử lại),
và với app tài xế: offline (Banner + SyncStatus, không mất dữ liệu). Chi tiết riêng từng màn trong mục "Trạng thái UI" của spec.

## 7. Definition of done cho một màn

- [ ] Layout, khoảng cách, màu, chữ khớp mockup `design/mockups/<ID>.html` (so screenshot ở cùng kích thước).
- [ ] Mọi edge `action`/`back` của màn trong `navigation.json` hoạt động.
- [ ] Dữ liệu và API theo mục "Dữ liệu hiển thị" / "API" của spec; tiền/ngày đúng định dạng.
- [ ] Guard quyền theo mục "Hành động & quyền"; sensitive action có modal lý do.
- [ ] Đủ trạng thái loading/empty/error (+ offline với app tài xế).
- [ ] A11y: focus ring 2px `primary`, icon button có `aria-label`/tooltip, tap target ≥ 48dp trên app, trạng thái luôn có chữ.

## 8. Prompt mẫu cho Claude Code / Orca

```
Implement WM-ORD-02 (Chi tiết đơn hàng) trong apps/web.
Đọc: design/IMPLEMENTATION-GUIDE.md, design/screens/wm/WM-ORD-02.md, design/mockups/WM-ORD-02.html,
design/COMPONENTS.md (EntityHeader, SummaryStrip, Tabs, DataTable, PartnerCard, Timeline).
Wire mọi edge trong design/spec/navigation.json có from = WM-ORD-02. Dùng token design/tokens/tokens.css.
```
