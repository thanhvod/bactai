# Nghiệp vụ: Đơn hàng & Chi phí

> Ghi theo mô tả của chủ dự án. Ngày cập nhật: 2026-08-21
> Trạng thái: Đã qua 2 vòng hỏi — các mục đánh dấu **[ĐỀ XUẤT]** là do AI thiết kế, chờ chủ dự án xác nhận.

## 1. Nguồn đơn hàng — đơn bắt đầu từ đâu

- Khách hàng liên hệ qua nhiều kênh: **gọi điện**, **booking qua web/app**...
- Dù đến từ kênh nào, **nhân viên operation là người tạo đơn hàng** trong hệ thống.
- Booking từ web/app của khách không tự động thành đơn — operation tiếp nhận và tạo/chuyển thành đơn hàng.

**Hệ quả thiết kế:** Booking (yêu cầu từ khách) và Order (đơn hàng) là 2 thực thể tách biệt; đơn hàng luôn qua tay operation. Đơn tạo trực tiếp (khách gọi điện) không cần booking đi trước.

## 2. Giá cước

- **Nhân viên operation quyết định giá cước cho từng đơn**, không có công thức tính tự động (không theo km/tấn/điểm cố định).
- **Giá cước tính chung cho cả đơn (order)** — kể cả khi đơn tách nhiều xe, không báo giá theo từng xe.
- Tổng tiền thu khách = **giá cước (nhập tay) + các dịch vụ cộng thêm (add-on services, xem mục 7)**.

**Hệ quả thiết kế:** Phase đầu không cần pricing engine. (Gợi ý giá theo lịch sử tuyến — nice-to-have sau này.)

## 3. Quan hệ Đơn hàng ↔ Chuyến xe

- Thông thường **1 đơn = 1 xe**.
- Có trường hợp **1 đơn = nhiều xe** (hàng lớn tách ra nhiều xe chạy).
- **Chốt: làm trường hợp tổng quát — 1 đơn có 1..n chuyến xe (trip), mỗi chuyến gắn 1 xe + 1 tài xế.**

**Hệ quả thiết kế:**
- Tách 2 thực thể: **Order** (đơn hàng — hợp đồng với khách, giá cước, công nợ) và **Trip** (chuyến xe — xe nào, tài xế nào, chạy điểm nào).
- Chi phí phát sinh gắn theo **Trip** (mỗi xe phát sinh cầu đường, bồi dưỡng riêng); giá cước và tiền thu khách gắn theo **Order**.
- Điểm lấy/trả hàng khai trên Order; mỗi Trip được phân công phụ trách điểm nào.
- Trường hợp phổ biến (1 đơn 1 xe) UI phải làm thật nhanh gọn — không bắt operation thao tác nhiều bước chỉ vì model tổng quát.

## 4. Vòng đời đơn hàng *(tạm chốt 2026-08-21)*

Nguyên tắc đã chốt với chủ dự án:
- **Operation được quyền update status thủ công** (không ép máy trạng thái khóa cứng chuyển bước).
- **Mọi thay đổi trạng thái đều lưu history**: ai đổi, lúc nào, từ trạng thái nào sang trạng thái nào, lý do/ghi chú.

### 4.1. Trạng thái Đơn hàng (Order)

| Trạng thái | Ý nghĩa |
|---|---|
| Nháp | Operation đang nhập, chưa chốt với khách |
| Chờ xác nhận | Đã báo giá, chờ khách chốt |
| Đã xác nhận | Khách đồng ý giá, chờ xếp xe |
| Đã xếp xe | Đã gán đủ xe + tài xế cho các chuyến |
| Đang thực hiện | Ít nhất 1 chuyến đã bắt đầu chạy |
| Hoàn thành | Tất cả chuyến xong, đủ xác nhận trả hàng |
| Đã hủy | Hủy đơn (lưu lý do; chi phí đã phát sinh vẫn giữ lại để quyết toán) |

### 4.2. Trạng thái Chuyến xe (Trip)

| Trạng thái | Ý nghĩa |
|---|---|
| Đã lên lịch | Có xe + tài xế + thời gian dự kiến |
| Đang đến điểm lấy | Xe xuất phát đi lấy hàng |
| Đang lấy hàng | Tại điểm lấy |
| Đang vận chuyển | Hàng trên xe, đang di chuyển |
| **Tạm dừng** | Xe dừng giữa chừng — kèm **lý do**: giờ cấm tải, nghỉ đêm, chờ phà, hư xe, kẹt xe... Hết dừng thì quay lại trạng thái trước đó |
| Đang trả hàng | Tại điểm trả |
| Hoàn thành | Trả xong hết các điểm được phân công |
| Đã hủy | Chuyến bị hủy (đơn có thể vẫn chạy tiếp bằng xe khác) |

- "Tạm dừng" thiết kế là **trạng thái + lý do (danh mục lý do có thể thêm mới)**, không đẻ ra nhiều trạng thái riêng cho từng tình huống.
- Danh mục lý do tạm dừng gợi ý sẵn: giờ cấm tải, nghỉ đêm/nghỉ luật lái xe, chờ phà/chờ cầu, sự cố xe, kẹt xe, chờ bốc xếp.

### 4.3. Trạng thái từng điểm dừng (Stop)

| Trạng thái | Ý nghĩa |
|---|---|
| Chưa đến | Mặc định |
| Đã đến | Xe có mặt tại điểm |
| Hoàn thành | Lấy/trả xong tại điểm — kèm ảnh POD (khi có app tài xế), giờ thực tế |
| Bỏ qua | Điểm bị hủy/đổi giữa chừng (lưu lý do) |

## 5. Hủy / thay đổi đơn giữa chừng

- Hủy đơn **có xảy ra**, xử lý **thủ công**: operation update status trực tiếp.
- Không cần luồng phê duyệt hủy — chỉ cần **lưu history đầy đủ** (mục 4).
- Chi phí đã phát sinh trước khi hủy: giữ lại trên đơn/chuyến để quyết toán (hoàn ứng tài xế, tính lỗ đơn hủy).

## 6. Thông tin hàng hóa *(tạm chốt 2026-08-21)*

**Mục đích chính là ghi chú/tham khảo** — không dùng để tính giá hay tính tải trọng tự động. Vì vậy: nhập tự do là chính, không validate chặt, không bắt buộc field nào ngoài tên hàng.

Khai theo **dòng hàng (cargo line)** — 1 đơn có thể nhiều dòng, mỗi dòng gắn được (không bắt buộc) với điểm lấy và điểm trả cụ thể:

- **Tên/mô tả hàng** (text tự do) + **loại hàng** (danh mục merchant tự định nghĩa: nông sản, sắt thép, bao bì...)
- **Khối lượng** (kg/tấn) và/hoặc **thể tích** (m³/khối)
- **Số lượng + đơn vị đóng gói**: kiện, pallet, thùng, bao, cây, cuộn...
- **Tính chất đặc biệt** (chọn nhiều): dễ vỡ, hàng lạnh, quá khổ/quá tải, hóa chất/nguy hiểm
- **Giá trị hàng khai báo** (tùy chọn — phục vụ bồi thường/bảo hiểm)
- **Yêu cầu xe** (mức đơn hàng): loại xe (tải thùng, mui bạt, xe lạnh, đầu kéo cont 20/40...), tải trọng tối thiểu
- **Ghi chú** + đính kèm hình/chứng từ (phiếu xuất kho...)

Mọi field đều **không bắt buộc** trừ tên hàng — thực tế nhiều đơn chỉ cần ghi "10 tấn gạo" là đủ; UI cho nhập nhanh 1 dòng.

## 7. Add-on services (dịch vụ cộng thêm) & Chi phí phát sinh

**Đã chốt:** các khoản thu thêm của khách được model thành **add-on service**, tách biệt với chi phí công ty chi ra.

### 7.1. Add-on service — tiền THU của khách

- Merchant tự định nghĩa danh mục dịch vụ cộng thêm: bốc xếp, nâng hạ, giao đêm, phí chờ/lưu ca, thêm điểm, đóng kiện...
- Trên đơn, operation thêm từng dòng add-on kèm giá → **cộng vào tổng tiền thu khách** (cùng giá cước).

### 7.2. Chi phí phát sinh — tiền CHI của công ty/tài xế

- Gắn theo **chuyến (trip)**: cầu đường, bốc xếp, phí chành, bồi dưỡng...
- Mỗi khoản ghi: loại (danh mục), số tiền, **ai chi trước** (tài xế / công ty), có hoàn lại tài xế không.
- Thông thường: tài xế chi trước → công ty hoàn lại; giá cước đã bao gồm nên **không tự cộng vào tiền khách**.

### 7.3. Quan hệ giữa hai bên

Một sự việc có thể sinh cả 2 bút toán độc lập — ví dụ bốc xếp: thu khách 500k (add-on) và chi cho đội bốc xếp 300k (chi phí). Hai dòng này **không link cứng** với nhau; lợi nhuận đơn = (giá cước + tổng add-on) − (tổng chi phí các chuyến + tiền thuê xe ngoài nếu có).

## 8. Thanh toán & thu hộ

- **A. Khách chuyển khoản cho công ty** (operation theo dõi) — hình thức chính.
- **B. Tài xế thu hộ (COD)** — có nhưng **hạn chế sử dụng**, vì công ty không muốn tài xế giữ tiền.
- Nếu thu hộ: hệ thống theo dõi số tiền tài xế đang giữ và bước nộp về công ty (chi tiết đối soát → mảng công nợ).

## 9. Hoàn thành đơn hàng

- **Thủ công (phase chưa có app tài xế):** tài xế báo xong → operation đánh dấu hoàn thành trên web.
- **Khi có app tài xế:** tài xế xác nhận trên app + **chụp hình POD** theo điểm trả.
- Hành động hoàn thành làm được từ cả 2 phía; ảnh POD optional ở mức hệ thống nhưng model chuẩn bị sẵn chỗ lưu theo Stop.

---

## Câu hỏi mở còn lại

- [x] Bộ trạng thái Order / Trip / Stop → **tạm chốt như mục 4** (2026-08-21)
- [x] Field hàng hóa → **mục đích chính là ghi chú**, nhập tự do, không validate chặt (2026-08-21)
- [x] Đơn nhiều xe → **giá cước tính chung cho cả order**, không báo giá theo xe (2026-08-21)

*(Mảng đơn hàng & chi phí tạm khép. Câu hỏi mới phát sinh sẽ bổ sung vào đây.)*
