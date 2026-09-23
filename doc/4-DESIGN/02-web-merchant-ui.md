# Web Merchant UI Guidelines

> Web Merchant là sản phẩm đầy đủ nhất cho doanh nghiệp vận tải: admin/giám đốc, operation, kế toán.  
> Stack đã chốt: React + Vite + Tailwind/shadcn, modular theo domain.

## 1. Information Architecture

Sidebar đề xuất:

```text
Dashboard
Đơn hàng
Điều phối
Tài chính
Bảng lương
Khách hàng
Tài xế
Xe
Nhà cung cấp
Báo cáo
Cài đặt
```

Topbar:

- Quick search theo mã đơn, mã chuyến, khách, tài xế, xe, phiếu thu/chi.
- Merchant switcher.
- Notification bell.
- User menu.

## 2. Global Shell

### 2.1. Desktop layout

```text
┌──────────────┬────────────────────────────────────────────┐
│ Sidebar      │ Topbar                                     │
│              ├────────────────────────────────────────────┤
│              │ Page header                                │
│              │ Filters / actions                          │
│              │ Table / detail / dashboard                 │
└──────────────┴────────────────────────────────────────────┘
```

Shell phải phục vụ thao tác lặp lại hằng ngày:

- Sidebar không quá cao chữ, icon line rõ.
- Active item dùng primary teal + background nhẹ.
- Notification badge dùng danger/warning tùy mức.
- Quick search luôn dễ thấy.

### 2.2. Page structure chuẩn

```text
PageHeader
  Title
  Subtitle optional
  Primary action
  Secondary action menu

Toolbar
  Search
  Quick filters
  Date range
  Advanced filter drawer

Main content
  Table / dashboard / detail
```

## 3. List Page Pattern

Dùng cho:

- Đơn hàng.
- Khách hàng.
- Tài xế.
- Xe.
- Nhà cung cấp.
- Phiếu thu/chi.
- Bảng lương.
- Bảng kê công nợ.

### 3.1. Required elements

- Search input.
- Filter chips.
- Sort.
- Table.
- Pagination/cursor load.
- Empty state.
- Row actions.
- Export nếu module có nhu cầu.

### 3.2. Table content rules

Ưu tiên hiển thị cột quyết định:

- Mã.
- Đối tượng chính.
- Trạng thái.
- Số tiền/công nợ nếu có.
- Ngày/hạn.
- Cảnh báo.
- Owner/actor nếu có.

Không nhồi mọi field vào table. Thông tin sâu nằm ở detail.

## 4. Detail Page Pattern

Dùng cho entity chính:

- Order.
- Trip.
- Customer.
- Driver.
- Vehicle.
- Supplier.
- Payment.
- Expense.
- Payroll.
- Debt statement.

### 4.1. Header

Header detail gồm:

- Mã entity.
- Tên/tuyến/đối tượng chính.
- Status badge.
- Summary metrics.
- Primary next action.
- Action menu.

Ví dụ order:

```text
DH-202609-0001     Công ty A | HCM -> Bình Dương      [Đang thực hiện]
Tổng thu 8.500.000 đ | Đã thu 3.000.000 đ | Còn nợ 5.500.000 đ | Quá hạn 2 ngày
```

### 4.2. Tabs chuẩn

Order:

- Tổng quan.
- Điểm dừng.
- Hàng hóa.
- Chuyến.
- Tài chính.
- Sự cố.
- Chứng từ.
- Timeline.

Trip:

- Tổng quan.
- Điểm dừng.
- Chi phí.
- POD/COD.
- GPS.
- Sự cố.
- Timeline.

Customer:

- Tổng quan.
- Đơn hàng.
- Công nợ.
- Số dư.
- Địa chỉ/liên hệ.
- Bảng kê.
- Chứng từ.
- Timeline.

Driver:

- Tổng quan.
- Lịch sử lái.
- Công nợ.
- Lương/ứng.
- Chứng từ.
- Timeline.

## 5. Module-Specific Guidelines

### 5.1. Dashboard

Dashboard không phải trang marketing. Nó là màn cảnh báo vận hành.

KPI đầu trang:

- Chuyến đang chạy.
- Đơn cần xử lý.
- Công nợ quá hạn.
- COD tài xế đang giữ.
- Sự cố mở.
- Bảng lương chờ duyệt.

Bố cục:

- Cột trái: vận hành hôm nay.
- Cột phải: cảnh báo tiền/sự cố.
- Bảng nhỏ quan trọng hơn chart lớn.

### 5.2. Order list

Cột đề xuất:

- Mã đơn.
- Khách hàng.
- Tuyến.
- Trạng thái.
- Tổng thu.
- Đã thu.
- Còn nợ.
- Hạn thanh toán.
- Cảnh báo.
- Ngày tạo.

Quick filters:

- Hôm nay.
- Đang thực hiện.
- Chưa xếp xe.
- Còn nợ.
- Quá hạn.
- Có sự cố.

### 5.3. Create/edit order

Không dùng wizard dài nếu không cần. Nên dùng form theo section:

1. Khách hàng.
2. Điểm lấy/trả.
3. Hàng hóa.
4. Giá cước/add-on.
5. Hạn thanh toán/ghi chú.

Các section có thể collapse nhưng không che dữ liệu quan trọng.

Tối ưu case nhanh:

- Chọn khách -> chọn địa chỉ thường dùng.
- Tạo một điểm lấy, một điểm trả nhanh.
- Hàng hóa chỉ bắt buộc tên/mô tả.
- Giá cước nhập tay.
- Hạn thanh toán nhập tay hoặc gợi ý từ customer.

### 5.4. Order finance tab

Phải phân biệt rõ:

- Tổng thu order.
- Payment đã phân bổ.
- Còn nợ.
- Chi phí order/trip.
- Thuê xe ngoài.
- Lãi/lỗ tạm tính.

Không dùng chung một bảng gây lẫn giữa doanh thu và dòng tiền.

### 5.5. Dispatch board

View chính:

- Filter ngày.
- Filter tài xế/xe/trạng thái.
- List hoặc column theo trạng thái.
- Warning trùng/gần trùng nổi rõ nhưng không chặn.

Trip card/list item nên có:

- Mã chuyến.
- Mã đơn.
- Tuyến ngắn.
- Xe.
- Tài xế.
- Thời gian dự kiến.
- Status.
- Warning nếu có.

### 5.6. Schedule view

Timeline xe/tài xế cần đơn giản:

- Trục thời gian theo ngày.
- Row là xe hoặc tài xế.
- Block là trip.
- Overlap/gần overlap dùng warning outline.
- Click block mở trip detail.

Nếu chưa dựng calendar phức tạp, phase đầu có thể là list nhóm theo xe/tài xế.

### 5.7. Finance

Tài chính cần cực kỳ rõ:

- Phiếu thu.
- Phiếu chi.
- Phân bổ.
- Công nợ khách.
- Công nợ NCC.
- Công nợ tài xế.
- COD tài xế giữ.

Mỗi màn tiền phải có:

- Mã chứng từ.
- Số tiền.
- Ngày.
- Đối tượng.
- Trạng thái.
- Người tạo/sửa.
- Chứng từ.
- Timeline/audit.

### 5.8. Payment allocation

Allocation UI nên có:

- Tổng tiền phiếu thu.
- Đã phân bổ.
- Còn lại.
- Danh sách order còn nợ.
- Input số tiền phân bổ từng order.
- Preview số dư khách sau phân bổ.

Hiển thị warning nếu:

- Phân bổ vượt tiền phiếu thu.
- Order đã đủ tiền.
- Customer còn nhiều order quá hạn.

### 5.9. Payroll

Payroll detail cần table mạnh:

- Tài xế.
- Lương cố định snapshot.
- Thưởng.
- Ứng.
- Giảm trừ.
- Thực lãnh.
- Trạng thái/dữ liệu bất thường.

Action rõ:

- Tạo bảng lương.
- Gửi duyệt.
- Duyệt.
- Trả về.
- Đánh dấu đã trả.
- Export.

### 5.10. Settings

Settings không nên quá trang trí. Dùng form/table rõ:

- Cài đặt vận hành.
- RBAC/permission.
- Mã tự động.
- Danh mục.

Với permission nhạy cảm, dùng matrix table theo role/action.

## 6. Shared UI Patterns

### 6.1. Warning panel

Dùng cho:

- Overlap lịch.
- Vượt hạn mức nợ.
- COD quá hạn.
- Data import có cảnh báo.

Panel gồm:

- Icon warning.
- Tiêu đề ngắn.
- Danh sách cảnh báo.
- Action "Tiếp tục và ghi lý do" nếu được phép.

### 6.2. Entity picker

Picker dùng cho khách, tài xế, xe, NCC, order, trip:

- Search.
- Recent/selected.
- Key metadata.
- Create quick nếu user có quyền và context cho phép.

### 6.3. Audit diff

Diff chỉ cần đủ hiểu:

```text
Giá cước
Trước: 8.000.000 đ
Sau:   8.500.000 đ
Lý do: Khách thêm điểm trả hàng
```

Không cần expose JSON thô trong UI chính.

## 7. Claude Code UI Build Notes

Khi dựng Web Merchant:

- Tạo shell và tokens trước.
- Dựng component primitive theo shadcn.
- Sau đó dựng screen templates: list, detail, form, drawer, modal.
- Cuối cùng mới dựng màn hình cụ thể.

Không bắt đầu bằng dashboard đẹp mắt nếu chưa có table/form/detail pattern. Phần mềm này sống nhờ workflow, không nhờ hero.

