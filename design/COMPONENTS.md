# BTA — Component catalogue (design system BTA)

Mọi màn hình trong `design/mockups/` được ghép từ các component dưới đây. Tên component trùng tên trong design system BTA
và trong mục **Components** của từng spec `design/screens/<platform>/<ID>.md`. Bảng "component nào dùng ở màn nào" nằm ở
[`COMPONENT-USAGE.md`](COMPONENT-USAGE.md), được build tự sinh.

Quy ước implement:

- **Web** (`apps/web`, `apps/customer-web`): React + Vite + Tailwind + shadcn/Radix, icon `lucide-react`, form `react-hook-form` + `zod`.
  Token: `design/tokens/tokens.css` và `design/tokens/tailwind.preset.cjs`. Component đặt trong `libs/ui` (hoặc `@bta/shadcn`), mỗi component một file.
- **Flutter** (`apps/driver-app`, app merchant): token `design/tokens/bta_tokens.dart` (`BtaColors`, `BtaText`, `BtaSpace`, `btaTheme()`),
  icon `lucide_icons_flutter`, widget chung trong `@bta/flutter-ui`.
- Kích thước: control web 36px, row table 44px (compact 40px), tap target mobile 48dp, bo góc 4/6/8px, padding trang 24px.

## 1. Khung & điều hướng

| Component | Web / Flutter | Props chính | Ghi chú |
|---|---|---|---|
| `AppShell` | web | `children`, `activeNav`, `activeChild?` | Sidebar 260px + Topbar 56px + main padding 24px, gap 16px. |
| `Sidebar` | web | `items[{icon,label,to,badge?,children?}]`, `active` | Mục active: nền `primary-soft`, chữ `primary`. Nhóm có con (Dashboard, Điều phối, Thu chi & Công nợ, Cài đặt) mở sub-nav khi active. Merchant switcher ở đầu → `/select-merchant`. |
| `Topbar` | web | `user`, `role`, `unreadCount` | QuickSearch (Ctrl K) · trợ giúp · NotificationBell · user menu. |
| `QuickSearch` | web | `open`, `query`, `groups[{type, items}]` | Command palette (`WM-SHELL-03`), điều hướng tới detail entity. Phím tắt Ctrl/⌘ K. |
| `NotificationBell` / `NotificationList` | web | `items[{type, title, entityRef, time, read}]` | `WM-SHELL-02`. Mỗi item mở entity liên quan. |
| `Breadcrumb` | web | `items[{label, to?}]` | Trên mọi detail/form. |
| `PageHeader` | web | `title`, `subtitle?`, `actions`, `breadcrumb?` | Primary action bên phải; secondary trong `Menu`. |
| `Tabs` | web | `items`, `value`, `counts?` | Detail dùng `?tab=`. Tab bị tràn → cuộn ngang. |
| `SegmentedControl` | cả hai | `items`, `value` | Chuyển Danh sách · Bảng · Lịch (điều phối), bộ lọc app. |
| `CustomerShell` | web | `active`, `loggedIn` | Top nav cho Web Khách hàng. |
| `BottomNav` | Flutter | `tabs[{icon,label,route}]`, `index`, `badges?` | Tài xế 4 tab: Hôm nay · Chuyến · Thông báo · Tài khoản. Merchant 5 tab. |
| `MobileHeader` | Flutter | `title`, `subtitle?`, `onBack?`, `actions?` | Cao ≥ 60dp, nút back 44dp. |
| `PrimaryBottomAction` | Flutter | `label`, `icon?`, `onPressed`, `secondary?` | Nút chính full width 48dp ở đáy màn. |
| `Logo` | cả hai | `withText` | Logo tạm: xe tải trắng trên ô `primary`. |

## 2. Dữ liệu & hiển thị

| Component | Props chính | Ghi chú |
|---|---|---|
| `DataTable` | `columns[{key,label,align,width}]`, `rows`, `selectable?`, `loading?`, `empty?`, `totalRow?`, `onRowClick?` | Header sticky nền `surface-muted`, row 44px, hover nhẹ, cột tiền phải + `tabular-nums`, row đang chọn `accent-soft`. Màn hẹp cuộn ngang. Bulk action chỉ hiện khi chọn row. |
| `Pagination` | `page`, `pageSize`, `total` | Cursor pagination (`first`, `after`) theo API contract. |
| `FilterBar` + `FilterChip` | `search`, `chips`, `dateRange?`, `selects?`, `onAdvanced` | Nền `surface-muted`. Filter nâng cao mở `Drawer`. |
| `StatusBadge` | `label`, `tone`, `icon?`, `outline?` | Tone theo bảng trạng thái (Order/Trip/Tài chính). Luôn có chữ. "Đã chốt" có icon khóa; "Đã hủy" tài chính dùng outline đỏ. |
| `KpiCard` | `label`, `value`, `sub?`, `tone?`, `to?` | Chỉ dùng cho KPI; click → màn chi tiết. Không đổ bóng. |
| `SummaryStrip` | `items[{label, value, tone?}]` | Dải tiền/trạng thái dưới EntityHeader. |
| `EntityHeader` | `code`, `status`, `subtitle`, `metrics`, `primaryAction`, `menu` | Header của detail page. |
| `DescriptionList` | `items[{label, value}]`, `columns` | Label `text-muted` 12px. |
| `PartnerCard` | `name`, `code`, `lines` | Hover/picker khách hàng & NCC. |
| `DueIndicator` | `dueDate`, `overdueDays`, `paid` | "Quá hạn N ngày" (danger) / "còn hạn". |
| `Timeline` | `entries[{time, actor, action, reason?, tone}]` | Có trên mọi entity quan trọng (tab hoặc `WM-SHELL-07`). |
| `AuditDiff` | `label`, `before`, `after` | Diff đủ hiểu, không JSON thô. |
| `AttachmentList` / `AttachmentViewer` / `AttachmentUploader` | `items[{name,kind,meta}]` / `file` / `accept, maxSize` | Viewer drawer 720px (`WM-SHELL-06`). Uploader kéo thả (web) / camera-gallery (app). |
| `BarChart` / `LineChart` | `labels`, `series[{name, values, colorToken}]` | Màu series cố định `chart-1…4`, 1 trục Y, legend khi ≥ 2 series, luôn kèm `DataTable`. |
| `MapView` / `LocationList` | `pins[{lat,lng,label,status}]` | Mockup dùng nền bản đồ trung tính; implement bằng map SDK. |
| `DispatchBoard` / `ScheduleView` | `columns` / `rows[{resource, blocks}]` | Trùng lịch: viền warning, không chặn. |
| `PaymentAllocation` | `payment`, `openOrders`, `allocations` | Tổng phiếu · đã phân bổ · còn lại; phần dư thành số dư khách. |
| `PermissionMatrix` | `roles`, `actions`, `grants` | Quyền ✓ / ✗ / cần cấp thêm; hành động nhạy cảm đánh dấu "Cần lý do". |
| `PrintSheet` | `template`, `data` | Preview A4 cho phiếu giao, phiếu điều xe, bảng kê, bảng lương. |
| `Stepper` (`ImportWizard`) | `steps`, `active` | Upload → Map cột → Kiểm tra lỗi → Xác nhận. |
| `Skeleton` | `w`, `h` | Loading detail. |
| `EmptyState` | `icon`, `message`, `action?` | Nói thẳng việc tiếp theo. |

## 3. Form

| Component | Props chính | Ghi chú |
|---|---|---|
| `FormField` | `label`, `required`, `hint?`, `error?` | Label 13px `text-muted`; lỗi chặn = inline `danger`. |
| `TextField`, `Textarea`, `Select`, `DateField`, `Checkbox`, `RadioGroup`, `Switch` | chuẩn | Viền `border-control` (≥3:1), cao 36px, focus ring 2px `primary`. |
| `MoneyInput` | `value:int`, `onChange` | Số nguyên VND, dấu chấm nghìn, hậu tố `đ`, căn phải. |
| `EntityPicker` | `type: customer|driver|vehicle|supplier|order|trip`, `value`, `allowCreate?` | Search + recent + metadata; bản ghi ngừng hoạt động hiển thị nhưng không chọn được. |
| `LineItemsEditor` | `rows`, `columns` | Hàng hóa, dịch vụ thêm, điểm dừng (kéo sắp xếp). |

## 4. Overlay & cảnh báo

| Component | Props chính | Ghi chú |
|---|---|---|
| `Drawer` | `title`, `width: 480|560|720`, `footer` | Form phụ, timeline, attachment, filter nâng cao. `shadow-dialog`. |
| `Dialog` | `title`, `footer`, `danger?` | Confirm, form ngắn. Không dùng cho form dài. |
| `SensitiveActionModal` | `action`, `affected`, `warning`, `reason (required)`, `onConfirm` | Bắt buộc cho: sửa giá sau xác nhận, hủy đơn/chuyến, đổi trạng thái ngược, sửa đơn hoàn thành, sửa/hủy phiếu thu/chi, sửa COD, hủy bảng kê, trả về/hủy duyệt bảng lương, override trùng lịch. Ghi `audit_log`. |
| `WarningPanel` | `title`, `items`, `action?` | Cảnh báo mềm (trùng lịch, vượt hạn mức, COD quá hạn) — cho tiếp tục. |
| `Banner` | `tone`, `message`, `action?` | Đã chốt snapshot, offline, GPS tắt, lỗi tải. |
| `Popover` / `Menu` | `items` | Row action, user menu. `shadow-popover`. |
| `Toast` | `message`, `tone` | Sau mỗi thao tác lưu. |

## 5. App tài xế / app merchant (Flutter)

| Widget | Props chính | Ghi chú |
|---|---|---|
| `TripCard` | `trip`, `onTap` | Mã chuyến, tuyến, giờ, xe, trạng thái, COD cần thu, badge sync. |
| `StopCard` | `stop`, `onTap` | Loại lấy/trả, địa chỉ (16sp), liên hệ, COD, trạng thái. |
| `SyncStatus` / `SyncQueue` | `state: ok|pending|offline`, `pendingCount` / `items` | Không làm tài xế mất dữ liệu; retry từng mục. |
| `BottomSheet` / `ReasonBottomSheet` | `title`, `reasons`, `note` | Xác nhận nhanh trạng thái, lý do tạm dừng, sửa COD. |
| `PodCapture` | `photos`, `uploadState` | Camera/gallery, nhiều ảnh, trạng thái upload/queue/lỗi. |
| `CodInput` | `expected`, `actual`, `note` | Xác nhận khi khác dự kiến; sửa sau khi lưu cần lý do. |
| `DriverWallet` | `bonuses`, `advances`, `codHeld` | Không hiển thị tài chính công ty. |
| `ListRow` | `icon`, `label`, `value?`, `onTap` | Màn tài khoản/cài đặt, cao ≥ 56dp. |
