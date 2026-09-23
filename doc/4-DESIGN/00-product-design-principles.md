# Product Design Principles — BTA

> Design direction cho Web Merchant, App Tài xế, và App Merchant tương lai.  
> Dựa trên BRD, scope phase 1, danh sách màn hình và architecture hiện có.

## 1. Bối cảnh sản phẩm

BTA là nền tảng SaaS đa nhà xe cho doanh nghiệp vận tải. Phase 1 gồm:

- **Web Merchant:** màn hình vận hành chính cho chủ nhà xe, operation, kế toán.
- **App Tài xế:** nhận chuyến, cập nhật trạng thái, chụp POD, nhập COD, gửi GPS.
- **API/Database:** multi-tenant, audit đầy đủ, phục vụ web/app.

Phase sau có:

- **App Merchant:** bản mobile rút gọn cho chủ/operation/kế toán.
- **Web Khách hàng:** tìm nhà xe, tạo booking, xem lịch sử/công nợ.

## 2. Người dùng chính

### 2.1. Chủ nhà xe / Giám đốc

Cần nhìn nhanh:

- Lãi/lỗ, doanh thu, chi phí.
- Công nợ khách hàng, công nợ nhà cung cấp.
- COD tài xế đang giữ.
- Bảng lương chờ duyệt.
- Sự cố vận hành.

Thiết kế cần giúp họ ra quyết định nhanh, không cần đọc quá nhiều chữ.

### 2.2. Operation

Cần thao tác nhiều nhất:

- Tạo đơn.
- Điều phối xe/tài xế.
- Cập nhật trạng thái thay tài xế khi cần.
- Theo dõi POD, COD, GPS, sự cố.
- Thêm chi phí, ghi chú, chứng từ.

Thiết kế cần nhanh, dày thông tin, dễ scan, ít bước, ít modal không cần thiết.

### 2.3. Kế toán

Cần độ tin cậy:

- Phiếu thu/chi.
- Phân bổ tiền vào đơn.
- Công nợ khách hàng/NCC/tài xế.
- Bảng kê PDF snapshot.
- Bảng lương.
- Export Excel/PDF.

Thiết kế cần thể hiện rõ nguồn tiền, trạng thái tiền, audit và số liệu snapshot.

### 2.4. Tài xế

Cần đơn giản, dễ dùng ngoài hiện trường:

- Biết chuyến nào cần chạy.
- Xem điểm lấy/trả, liên hệ, ghi chú hàng, COD.
- Cập nhật trạng thái.
- Chụp POD/chứng từ.
- Nhập COD thực thu.
- Báo sự cố.

Thiết kế cần ít chữ, nút lớn, tương phản tốt, dùng được khi vội hoặc ngoài trời.

## 3. Tính cách giao diện

Giao diện BTA nên có cảm giác:

- **Chuyên nghiệp:** giống công cụ vận hành doanh nghiệp, không giống mạng xã hội hay app lifestyle.
- **Bình tĩnh:** màu trung tính, trạng thái rõ, không dùng animation phô.
- **Chính xác:** tiền, mã đơn, trạng thái, ngày giờ nổi bật đúng mức.
- **Thực dụng:** thao tác phổ biến đi thẳng vào việc, không trang trí.
- **Đáng tin:** luôn cho biết ai sửa, sửa lúc nào, lý do gì với dữ liệu nhạy cảm.

Không nên có:

- Gradient lớn, background minh họa, blob/orb, bokeh.
- Card lồng card, dashboard trang trí quá nhiều.
- Palette sặc sỡ hoặc quá nhiều màu ngang nhau.
- Typography quá to kiểu landing page.
- Copywriting marketing trong màn hình nghiệp vụ.

## 4. Nguyên tắc UX cốt lõi

### 4.1. Dense but calm

Web Merchant cần dày thông tin nhưng không rối. Ưu tiên:

- Table có cột rõ, row height vừa phải.
- Filter bar gọn.
- Detail dùng tab.
- Summary strip cho tiền/trạng thái.
- Drawer cho timeline, chứng từ, form phụ.

### 4.2. Warning mềm, không khóa cứng

BRD chốt nhiều quy trình là warning mềm:

- Trùng/gần trùng lịch xe/tài xế.
- Công nợ quá hạn.
- Khách vượt hạn mức.
- COD tài xế giữ quá lâu/quá số tiền.

UI phải phân biệt:

- **Warning:** cho phép tiếp tục.
- **Blocking error:** không thể lưu vì thiếu dữ liệu/hỏng định dạng/quyền không đủ.
- **Sensitive action:** cho phép nếu có quyền và nhập lý do.

### 4.3. Audit first

Các nơi có tiền hoặc trạng thái phải có đường vào timeline/audit:

- Order.
- Trip.
- Stop/COD.
- Payment.
- Expense.
- Payroll.
- Debt statement.

Timeline không phải tính năng phụ trang trí. Đây là nền để tránh tranh cãi.

### 4.4. One common mental model

Hầu hết module theo pattern:

```text
List -> Detail -> Action drawer/modal -> Timeline/Audit
```

Các entity lớn dùng tab:

- Tổng quan.
- Nghiệp vụ chính.
- Tài chính nếu có.
- Chứng từ.
- Timeline.

### 4.5. Fast common path

Trường hợp phổ biến nhất là **1 order = 1 xe = 1 tài xế**. UI tạo đơn/điều phối phải tối ưu cho case này:

- Tạo order nhanh.
- Tạo trip mặc định dễ hiểu.
- Nếu chỉ một trip, tự gán toàn bộ stop.
- Không ép user hiểu mô hình kỹ thuật nhiều trip/stop assignment ngay từ đầu.

### 4.6. Financial clarity

Doanh thu không đồng nghĩa phiếu thu. UI phải luôn giữ đúng:

- Doanh thu order = giá cước + add-on.
- Phiếu thu khách chỉ là tiền vào và có thể phân bổ.
- Tài xế nộp COD là thu hồi tiền công ty, không phải doanh thu.
- Công nợ khách/NCC/tài xế cần hiển thị theo ngữ cảnh riêng.

## 5. Navigation cấp cao

### 5.1. Web Merchant sidebar

Nhóm đề xuất:

1. Dashboard.
2. Đơn hàng.
3. Điều phối.
4. Tài chính.
5. Bảng lương.
6. Khách hàng.
7. Tài xế.
8. Xe.
9. Nhà cung cấp.
10. Báo cáo.
11. Cài đặt.

Topbar:

- Quick search.
- Chọn merchant nếu user thuộc nhiều tenant.
- Notification bell.
- User menu.

### 5.2. Driver App bottom navigation

Đề xuất 4 tab:

1. Hôm nay.
2. Chuyến.
3. Thông báo.
4. Tài khoản.

Các hành động chính của chuyến đặt trong màn chi tiết, không nhồi quá nhiều vào tab bar.

### 5.3. App Merchant future

App Merchant không thay Web Merchant. Nó nên tập trung:

- Tổng quan.
- Chuyến đang chạy.
- Công nợ/COD cảnh báo.
- Duyệt bảng lương.
- Xem order/trip/customer nhanh.

## 6. Content style

Ngôn ngữ chính là tiếng Việt, dùng thuật ngữ vận hành quen thuộc.

Ưu tiên label ngắn:

- "Đơn hàng", "Chuyến", "Công nợ", "Phiếu thu", "Phiếu chi".
- "Còn nợ", "Đã thu", "Quá hạn", "COD đang giữ".
- "Chứng từ", "Timeline", "Lý do sửa".

Tránh copy mơ hồ:

- Không dùng "Quản lý thông minh", "Tối ưu vượt trội", "Nâng tầm vận tải" trong app nghiệp vụ.
- Empty state nên nói thẳng việc tiếp theo: "Chưa có chuyến hôm nay", "Tạo đơn đầu tiên", "Chưa có khoản COD chưa nộp".

