# Nghiệp vụ: Điều phối xe & tài xế

> Ghi theo mô tả của chủ dự án. Ngày cập nhật: 2026-08-21
> Trạng thái: Đã chốt vòng 1 — mảng này tạm khép.

## 1. Cách xếp xe *(chốt 2026-08-21)*

- **Thủ công, đơn giản:** operation vào chuyến (trip), chọn xe + tài xế từ danh sách.
- Không cần màn hình lịch (calendar) phức tạp ở phase đầu. (Có thể thêm view lịch sau này nếu cần — nice-to-have.)

## 2. Cảnh báo trùng lịch *(chốt 2026-08-21)*

- Hệ thống **warning khi lịch bị overlap hoặc GẦN overlap** — vì thực tế xe chạy hay trễ giờ, hai chuyến sát nhau vẫn rủi ro.
- **Warning mềm, không chặn**: operation vẫn được phép gán (họ tự quyết), hệ thống chỉ cảnh báo.
- Kiểm tra cho cả **xe** và **tài xế** (mỗi bên một lịch riêng vì tài xế không cố định xe).
- Khoảng "gần overlap" nên là **setting theo merchant** (ví dụ mặc định cách nhau dưới 2 giờ thì cảnh báo).

## 3. Quan hệ tài xế ↔ xe *(chốt 2026-08-21)*

- Tài xế **không cố định xe** — hôm nay chạy xe này, mai xe khác.
- Gán xe + tài xế theo **từng chuyến (trip)**, không gán cứng theo cặp.

## 4. Giao việc cho tài xế *(chốt 2026-08-21)*

- **App Tài xế làm ngay phase đầu** (thay đổi so với kế hoạch cũ — xem D-002 trong [01-decisions.md](01-decisions.md)).
- Operation gán chuyến → tài xế thấy công việc trên app (danh sách theo lịch, chi tiết đơn, điểm lấy/trả).
- **Phase 1 KHÔNG có nút "nhận việc": operation giao là mặc định tài xế nhận** — sau này cần thì tính sau *(chốt 2026-08-21)*.
- Tài xế cập nhật trạng thái chuyến trên app, chụp ảnh POD khi trả hàng, **nhập số tiền COD thực thu tại điểm ngay lúc nhận tiền**.
- **GPS tracking làm trên app tài xế (phase 1):** app tự động ghi nhận vị trí khi có chuyến đang chạy *(chốt 2026-08-21)*.

## 5. Lịch sử *(chốt 2026-08-21)*

Hai góc nhìn, cùng suy ra từ dữ liệu chuyến (trip) — không cần nhập gì thêm:

- **Lịch sử lái của tài xế:** các chuyến đã chạy (theo thời gian, đơn, xe, trạng thái, thưởng).
- **Lịch sử chạy của xe:** các chuyến xe đã chạy (theo thời gian, đơn, tài xế) + các khoản chi vật tư gắn vào xe.

*(Không yêu cầu quản lý km/odo, nhật ký bảo dưỡng, hạn đăng kiểm ở giai đoạn này.)*

---

## Câu hỏi mở

- [x] Nút "nhận việc" → **phase 1 không cần, giao là nhận; sau này tính sau** (2026-08-21)
- [x] GPS tracking → **làm trên app tài xế, thuộc phase 1** (2026-08-21)

*(Mảng điều phối tạm khép.)*
