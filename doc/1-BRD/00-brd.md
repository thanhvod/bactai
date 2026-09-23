# BRD — Yêu cầu ban đầu (Business Requirements Document)

> Tài liệu ghi nhận yêu cầu thô từ khách hàng / chủ dự án.
> Ngày ghi nhận: 2026-08-21
> Trạng thái: Draft — đang thu thập yêu cầu

---

## 1. CHƯA ĐƯỢC PHÂN LOẠI

*Bất kỳ yêu cầu nào, đơn thuần nhập text vào đây.*

### Yêu cầu 1: App quản lý toàn bộ công ty (vận tải)

- **Quản lý đơn hàng**
  - Có thể có nhiều điểm lấy hàng, nhiều điểm trả hàng trên 1 đơn hàng.
  - Các chi phí phát sinh trên 1 đơn hàng: bốc xếp, phí cầu đường, phí chành, bồi dưỡng.

- **Công nợ khách hàng**
  - Theo dõi chi tiết công nợ: đã thu, chưa thu, số ngày quá hạn.
  - Xuất ra báo cáo chi tiết gửi khách hàng, để thu hồi và đối chiếu công nợ.

- **Công nợ nhà cung cấp**
  - Nhà cung cấp có 2 loại:
    1. **Nhà cung cấp dịch vụ vận tải**: mình thuê người ta chạy cho mình (thuê ngoài / chành).
    2. **Nhà cung cấp vật tư** cho công ty: sửa chữa, xăng dầu, lốp, ắc quy,... — các chi phí cấu thành vào lời lãi công ty, các khoản chi ngoài chi cho xe, bồi dưỡng/lót tay,...

- **Tính lương tài xế**
  - Chấm công + tính lương, ghi chú các khoản ứng tiền.
  - Tính lương cho tài xế trực tiếp trên app, kế toán chỉ cần coi trên báo cáo trả lương cho tài xế.
  - Lương = lương cứng + lương % (theo doanh thu/chuyến), trừ các khoản ứng lương tài xế.

- **App cho tài xế**
  - Nhận đơn trên app.
  - Chụp hình lên app xác nhận đã trả hàng xong.
  - Hoàn thành đơn hàng trên app.

### Yêu cầu 2: (chưa có)

---

## 2. ĐÃ ĐƯỢC PHÂN LOẠI

### 2.1. Web dành cho Nhà xe (Merchant) — Quản lý đầy đủ hoạt động kinh doanh

- **Tài khoản**
  - Đăng nhập
  - Đăng ký
  - Quên mật khẩu

- **Thông tin nhà xe**
  - Thông tin doanh nghiệp
  - Thông tin liên hệ

- **Quản lý nhân viên**
  - Phân quyền hoạt động nhân viên
  - Danh sách nhân viên
  - Tạo nhân viên mới
  - Sửa thông tin nhân viên
  - Thông tin chi tiết của nhân viên
  - Lịch sử làm việc

- **Quản lý xe**
  - Danh sách xe
  - Đăng ký xe mới
  - Thông tin chi tiết xe
  - Lịch sử chạy xe

- **Quản lý đặt hàng**
  - Danh sách đặt hàng
  - Thông tin chi tiết đặt hàng
  - Lên lịch chạy xe cho tài xế
  - Giao việc cho tài xế

- **Quản lý đơn hàng**
  - Tạo đơn hàng
    - Quản lý điểm lấy hàng: thêm một / nhiều điểm lấy hàng
    - Quản lý điểm trả hàng: thêm một / nhiều điểm trả hàng
    - Quản lý thu hộ theo điểm lấy hàng, trả hàng
  - Danh sách đơn hàng
  - Thông tin chi tiết đơn hàng
  - Quản lý chi phí phát sinh trên đơn hàng: cầu đường, bốc xếp, chành xe, bồi dưỡng
  - Quản lý thanh toán: lịch sử thanh toán, công nợ theo đơn hàng của khách hàng

- **Quản lý thu chi**
  - Quản lý danh mục thu chi
  - Hóa đơn / Phiếu thu, chi

- **Báo cáo**
  - Dashboard báo cáo theo thời gian thực hoạt động của xe / tài xế
  - Báo cáo hoạt động kinh doanh theo từng chủ đề trong từng khoảng thời gian

- **Quản lý khách hàng**
  - Danh sách khách hàng
  - Thông tin chi tiết của khách hàng
  - Lịch sử đơn hàng / lịch sử sử dụng dịch vụ
  - Công nợ của khách hàng: theo đơn hàng, lịch sử thanh toán, công nợ, ngày đến hạn, quá hạn
  - Báo cáo công nợ, thu hồi công nợ, đối chiếu

- **Quản lý nhà cung cấp**
  - Tạo mới thông tin nhà cung cấp
  - Danh sách nhà cung cấp
  - Xem thông tin chi tiết của nhà cung cấp
  - Các dịch vụ sử dụng từ nhà cung cấp
  - Các hóa đơn mua hàng, sử dụng dịch vụ từ nhà cung cấp (link tới phần quản lý thu chi)
  - Công nợ nhà cung cấp

### 2.2. App dành cho Nhà xe (Merchant) — Quản lý nhanh hoạt động kinh doanh

- Sau khi hoàn thiện danh sách chức năng trên web, sẽ thu gọn 1 phiên bản cho app.

### 2.3. App dành cho Tài xế — Quản lý việc chạy xe

- **Tài khoản**
  - Đăng nhập
  - Đăng ký
  - Quên mật khẩu
  - Chỉnh sửa thông tin cá nhân

- **Lịch làm việc**
  - Xem danh sách công việc được giao theo lịch
  - Chi tiết công việc được giao
    - Xem thông tin đơn hàng, yêu cầu của khách
    - Xem thông tin lộ trình, đường đi, thời gian
    - Tự động ghi nhận vị trí lộ trình

*(Bổ sung từ phần chưa phân loại — cần xác nhận: nhận đơn trên app, chụp hình xác nhận trả hàng, hoàn thành đơn hàng trên app.)*

### 2.4. Web dành cho Khách hàng — Tìm kiếm, đặt xe, quản lý đơn hàng

- **Tài khoản**
  - Đăng nhập
  - Đăng ký
  - Quên mật khẩu
  - Chỉnh sửa thông tin cá nhân

- **Khám phá**
  - Tìm kiếm danh sách các merchant được liệt kê trong danh sách
  - Đặt lịch gọi xe theo yêu cầu

- **Lịch sử**
  - Danh sách các đơn hàng đã thực hiện trong quá khứ

---

## 3. Ghi chú / Câu hỏi mở (cần làm rõ với khách hàng)

> Các quyết định đã chốt xem tại [01-decisions.md](01-decisions.md).
> Nhóm chức năng bổ sung đã chọn xem tại [09-bo-sung-chuc-nang.md](09-bo-sung-chuc-nang.md).

- [x] Hệ thống là multi-tenant (nhiều nhà xe dùng chung nền tảng) hay chỉ cho 1 công ty vận tải? → **SaaS đa nhà xe** (D-001)
- [ ] "Đặt hàng" (booking) và "Đơn hàng" (order) khác nhau thế nào — booking từ khách hàng chuyển thành đơn hàng?
- [ ] Công thức lương %: tính theo doanh thu chuyến, theo đơn hàng, hay theo km?
- [ ] Thu hộ (COD) theo điểm: quy trình đối soát thu hộ với khách hàng như thế nào?
- [ ] Nhà cung cấp dịch vụ vận tải (thuê ngoài): đơn hàng giao cho xe thuê ngoài có quy trình khác xe nhà không?
- [ ] Chấm công tài xế: theo chuyến, theo ngày công, hay cả hai?
- [ ] Ghi nhận vị trí lộ trình tự động: yêu cầu tracking realtime hay chỉ ghi log điểm mốc?
