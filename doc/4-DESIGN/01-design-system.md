# Design System — BTA

> Dùng cho Web Merchant React/Vite/shadcn và Flutter Driver App.  
> Mục tiêu: chuyên nghiệp, dễ dùng, không màu mè, phù hợp phần mềm vận tải và tài chính vận hành.

## 1. Design Tokens

### 1.1. Color philosophy

Nền tảng màu nên trung tính, sáng, sạch. Màu chỉ dùng để:

- Nhận diện primary action.
- Phân biệt trạng thái.
- Cảnh báo nghiệp vụ.
- Hiển thị data/tài chính.

Không dùng màu để trang trí.

### 1.2. Core palette

| Token | Hex | Dùng cho |
|---|---:|---|
| `background` | `#F7F8FA` | Nền app web |
| `surface` | `#FFFFFF` | Panel, table, drawer, dialog |
| `surface-muted` | `#F1F4F7` | Header table, filter bar, section nền nhẹ |
| `border` | `#DDE3EA` | Border mặc định |
| `border-strong` | `#C3CCD6` | Border vùng cần tách rõ |
| `text` | `#17202A` | Text chính |
| `text-muted` | `#5B6673` | Text phụ |
| `text-subtle` | `#84909D` | Metadata |
| `primary` | `#0F766E` | Primary action, active nav |
| `primary-hover` | `#115E59` | Hover primary |
| `accent` | `#2563EB` | Link, selected row, info action |
| `success` | `#15803D` | Hoàn thành, đã thu, đã trả |
| `warning` | `#B45309` | Cảnh báo mềm, quá hạn nhẹ |
| `danger` | `#B91C1C` | Hủy, lỗi, quá hạn nghiêm trọng |
| `info` | `#1D4ED8` | Đang xử lý, đang chạy |

### 1.3. Status palette

#### Order

| Trạng thái | Token | Visual |
|---|---|---|
| Nháp | neutral | Badge xám |
| Chờ xác nhận | warning | Badge vàng nâu |
| Đã xác nhận | info | Badge xanh dương |
| Đã xếp xe | primary | Badge teal |
| Đang thực hiện | accent | Badge xanh dương nổi hơn |
| Hoàn thành | success | Badge xanh lá |
| Đã hủy | danger | Badge đỏ |

#### Trip

| Trạng thái | Token | Visual |
|---|---|---|
| Đã lên lịch | neutral/info | Badge xám xanh |
| Đang đến điểm lấy | info | Badge xanh |
| Đang lấy hàng | info | Badge xanh |
| Đang vận chuyển | accent | Badge xanh dương |
| Tạm dừng | warning | Badge vàng nâu, có lý do |
| Đang trả hàng | primary | Badge teal |
| Hoàn thành | success | Badge xanh lá |
| Đã hủy | danger | Badge đỏ |

#### Finance

| Trạng thái | Token | Visual |
|---|---|---|
| Đã thu/đã trả | success | Badge xanh |
| Còn nợ | warning | Badge vàng |
| Quá hạn | danger | Badge đỏ |
| Chưa phân bổ | info | Badge xanh |
| Đã chốt snapshot | primary | Badge teal |
| Đã hủy | neutral/danger | Badge outline đỏ |

### 1.4. Tailwind CSS variables đề xuất

```css
:root {
  --background: 247 248 250;
  --foreground: 23 32 42;
  --card: 255 255 255;
  --card-foreground: 23 32 42;
  --muted: 241 244 247;
  --muted-foreground: 91 102 115;
  --border: 221 227 234;
  --input: 221 227 234;
  --primary: 15 118 110;
  --primary-foreground: 255 255 255;
  --accent: 37 99 235;
  --accent-foreground: 255 255 255;
  --success: 21 128 61;
  --warning: 180 83 9;
  --danger: 185 28 28;
  --info: 29 78 216;
  --ring: 15 118 110;
  --radius: 8px;
}
```

## 2. Typography

### 2.1. Font

Web:

- Primary: `Inter`, fallback `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Numeric/money table cells: dùng tabular numbers qua CSS `font-variant-numeric: tabular-nums`.

Flutter:

- Primary: `Inter` nếu bundle được.
- Fallback: platform default.

### 2.2. Scale

| Token | Size | Line height | Dùng cho |
|---|---:|---:|---|
| `display-sm` | 24 | 32 | Page title dashboard/detail |
| `heading-lg` | 20 | 28 | Section lớn |
| `heading-md` | 18 | 26 | Dialog/drawer title |
| `heading-sm` | 16 | 24 | Card/panel title |
| `body` | 14 | 22 | Text chính web |
| `body-sm` | 13 | 20 | Table/meta |
| `caption` | 12 | 18 | Badge, label phụ |

Không scale font theo viewport. Không dùng letter spacing âm.

## 3. Spacing, Radius, Shadow

### 3.1. Spacing scale

| Token | Px | Dùng cho |
|---|---:|---|
| `1` | 4 | Icon gap nhỏ |
| `2` | 8 | Badge, table cell compact |
| `3` | 12 | Field gap |
| `4` | 16 | Panel padding compact |
| `5` | 20 | Form section |
| `6` | 24 | Page content |
| `8` | 32 | Major layout gap |

### 3.2. Radius

| Token | Px | Dùng cho |
|---|---:|---|
| `sm` | 4 | Input, badge nhỏ |
| `md` | 6 | Button, table container |
| `lg` | 8 | Panel, dialog |

Không dùng bo góc lớn hơn 8px trừ khi component platform bắt buộc.

### 3.3. Shadow

Web nên dùng border là chính. Shadow chỉ dùng:

- Dropdown.
- Popover.
- Dialog.
- Sticky header nổi khi scroll.

Không dùng shadow dày cho card dashboard.

## 4. Layout Rules

### 4.1. Web shell

- Sidebar cố định/collapsible, width khoảng `260px`.
- Topbar height khoảng `56px`.
- Content max không nên bó quá hẹp; phần mềm vận hành cần dùng bề ngang.
- Page padding `24px` desktop, `16px` tablet.
- Table và detail cần dùng full width hợp lý.

### 4.2. Page header

Mỗi page nên có:

- Title rõ.
- Subtitle ngắn nếu cần.
- Primary action bên phải.
- Secondary actions trong menu hoặc icon buttons.

Ví dụ:

```text
Đơn hàng                       [Tạo đơn]
Tìm kiếm, lọc và theo dõi trạng thái đơn
```

### 4.3. Cards and panels

Chỉ dùng card cho:

- KPI item.
- Repeated item.
- Dialog/drawer panel.
- Mobile list item.

Không bọc cả page section trong nhiều card lồng nhau.

### 4.4. Responsive behavior

Web desktop là ưu tiên. Mobile web chỉ cần không vỡ layout, vì driver có app riêng.

- Table desktop: giữ dạng table.
- Tablet/small width: cho horizontal scroll thay vì ép text vỡ.
- Detail tabs: chuyển thành segmented/scrollable tabs.
- Drawer action: width `480-720px` tùy form.

## 5. Component System

### 5.1. Buttons

| Loại | Dùng cho |
|---|---|
| Primary | Hành động chính: tạo, lưu, xác nhận |
| Secondary | Hành động phụ |
| Ghost/Icon | Toolbar, table row action |
| Destructive | Hủy, xóa, thao tác rủi ro |

Quy tắc:

- Button chính luôn có label rõ.
- Icon button dùng lucide icon và tooltip.
- Không dùng button màu sặc sỡ cho mỗi module.
- Destructive action cần modal lý do nếu thuộc nhóm sensitive.

### 5.2. Inputs

Các input bắt buộc:

- Text input.
- Textarea.
- Select/combobox.
- Date/date range.
- Money input VND.
- Number input.
- Checkbox/switch.
- File/image upload.
- Address/contact picker.
- Entity picker.

Money input:

- Format `1.250.000 đ`.
- Align right trong table.
- Validate integer VND.
- Không dùng decimal.

### 5.3. Tables

Table là component lõi của Web Merchant.

Yêu cầu:

- Header sticky nếu list dài.
- Row hover nhẹ.
- Column tiền align right.
- Column trạng thái dùng badge.
- Column mã chứng từ/order dùng monospace nhẹ hoặc tabular number.
- Filter bar nằm trên table.
- Empty state rõ hành động tiếp theo.
- Bulk action chỉ hiện khi chọn row.

Density:

- Row height mặc định `44-48px`.
- Không quá thoáng kiểu landing dashboard.

### 5.4. Status badge

Badge dùng consistent:

- Filled nhẹ hoặc soft background.
- Text ngắn.
- Không dùng màu neon.
- Trạng thái hủy/quá hạn phải đủ nổi.

Badge có thể có icon nhỏ cho:

- Warning.
- Lock/snapshot.
- Sync pending.
- Attachment.

### 5.5. Tabs

Entity detail nên dùng tabs:

- Tổng quan.
- Điểm dừng/Chuyến/Hàng hóa tùy entity.
- Tài chính.
- Chứng từ.
- Timeline.

Tabs không dùng quá nhiều chữ; nếu nhiều tab, dùng overflow horizontal.

### 5.6. Drawer

Drawer dùng cho:

- Form tạo/sửa phụ.
- Timeline.
- Attachment viewer.
- Filter nâng cao.
- Entity picker.

Drawer giúp giữ người dùng trong ngữ cảnh list/detail.

### 5.7. Dialog

Dialog dùng cho:

- Confirm destructive.
- Sensitive action yêu cầu lý do.
- Short form ít field.

Không dùng dialog cho form dài như tạo order; dùng page hoặc drawer rộng.

### 5.8. Timeline

Timeline entry gồm:

- Actor.
- Action.
- Entity/status/money liên quan.
- Thời điểm.
- Reason nếu có.
- Link xem diff nếu là audit nhạy cảm.

Tone timeline nên nghiệp vụ, không quá kỹ thuật.

### 5.9. Attachment

Attachment component cần:

- Upload drag/drop web.
- Camera/gallery mobile.
- Loại chứng từ.
- Entity gắn.
- Preview ảnh/PDF.
- Metadata: người upload, thời điểm, dung lượng.
- Trạng thái upload/sync.

### 5.10. Sensitive action modal

Bắt buộc cho:

- Sửa giá sau xác nhận.
- Sửa/xóa phiếu thu/chi.
- Sửa COD.
- Hủy order/trip.
- Đổi trạng thái ngược.
- Sửa order hoàn thành.
- Duyệt/hủy duyệt bảng lương.

Modal phải hiển thị:

- Hành động sắp làm.
- Dữ liệu bị ảnh hưởng.
- Cảnh báo ngắn.
- Ô "Lý do".
- Nút xác nhận destructive nếu rủi ro.

## 6. Data Visualization

Dashboard dùng biểu đồ vừa đủ:

- KPI strip.
- Bar/line đơn giản theo thời gian.
- Donut hạn chế, chỉ dùng khi có ít nhóm.
- Table cảnh báo quan trọng hơn chart trang trí.

Không dùng chart 3D, gradient, animation phức tạp.

## 7. Empty, Loading, Error

### 7.1. Empty state

Nên có:

- Icon line đơn giản.
- Câu ngắn.
- Action tiếp theo nếu user có quyền.

Ví dụ:

- "Chưa có đơn hàng."
- "Tạo đơn đầu tiên"

### 7.2. Loading

Web:

- Skeleton cho table/detail.
- Spinner chỉ dùng trong button hoặc vùng nhỏ.

Mobile:

- Skeleton/list placeholder.
- Hiển thị sync pending rõ nhưng không làm người dùng hoảng.

### 7.3. Error

Error cần nói:

- Chuyện gì lỗi.
- Có thể thử lại không.
- Dữ liệu có được lưu offline không nếu ở app tài xế.

## 8. Accessibility

Web:

- Contrast đạt ít nhất WCAG AA.
- Focus ring rõ.
- Icon button có tooltip/aria-label.
- Table navigable bằng keyboard ở mức cơ bản.
- Không dùng màu là tín hiệu duy nhất; badge cần có text.

Mobile:

- Tap target tối thiểu 44-48dp.
- Text ngoài hiện trường không quá nhỏ.
- State quan trọng có cả màu, text, icon.
- COD/status action cần tránh bấm nhầm.

## 9. Implementation Notes

Web:

- UI chính: `@bta/shadcn` + Tailwind.
- Icon: lucide-react.
- Form: react-hook-form + zod.
- Data: Apollo Client generated hooks.
- `@bta/ui` MUI wrapper chỉ dùng khi cần, không làm lệch visual language.

Flutter:

- Dùng token tương đương trong `@bta/flutter-ui`.
- State management đề xuất Bloc/Cubit.
- Offline queue phải có UI status nhất quán.

