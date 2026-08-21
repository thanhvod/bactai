# Nghiệp vụ: Lương tài xế & Công nợ tài xế

> Ghi theo mô tả của chủ dự án. Ngày cập nhật: 2026-08-21
> Trạng thái: Đã chốt vòng 2 — mảng này tạm khép.

## Nguyên tắc chung

**Logic đơn giản, operation nhập tay là chính** — hệ thống cộng dồn và lên bảng lương, không có công thức tự động phức tạp, không chấm công máy móc.

## 1. Cấu trúc lương *(chốt 2026-08-21)*

Lương kỳ = **lương cố định** + **tổng thưởng theo order** − **các khoản ứng** − **các khoản giảm trừ**.

- **Lương cố định:** 1 con số set sẵn cho từng tài xế. Không phụ thuộc chấm công — nếu cần giảm (nghỉ, vi phạm...), **operation tự thêm khoản giảm trừ + lý do**.
- **Thưởng theo order:** operation vào từng đơn **điền 1 số tiền** thưởng cho tài xế. Không có công thức %.
- **Giảm trừ / phạt:** có — đền hàng hỏng, vi phạm, nghỉ... Operation thêm dòng giảm trừ với số tiền + lý do (danh mục lý do có thể tự thêm).
- **Ứng lương:** ghi nhận các khoản tài xế ứng trong kỳ, trừ vào bảng lương.

**Hệ quả thiết kế:**
- Hồ sơ tài xế: field lương cố định (lưu lịch sử thay đổi để kỳ cũ tính đúng).
- Trên đơn/chuyến: field tiền thưởng tài xế (mỗi tài xế một khoản riêng nếu đơn nhiều xe).
- Bảng lương gồm các dòng: lương cố định, từng khoản thưởng theo order, từng khoản ứng, từng khoản giảm trừ + lý do — kế toán chỉ xem, không tính tay.

## 2. Quy trình bảng lương *(chốt 2026-08-21)*

1. **Operation tạo bảng lương** cho kỳ.
2. **Giám đốc duyệt** — có bước phê duyệt, sau duyệt mới chi trả.

**Kỳ lương: cho phép setting theo từng công ty (merchant)** — ví dụ theo tháng dương lịch, từ 5 đến 5, v.v. Không hard-code.

## 3. Công nợ tài xế (sổ đối chiếu công ty ↔ tài xế) *(chốt 2026-08-21)*

Có phần riêng thể hiện **dòng tiền giữa công ty và tài xế**, độc lập với kỳ lương:

### 3.1. Công ty nợ tài xế — chi phí tài xế ứng trả

- Tài xế chi trước các chi phí chuyến (cầu đường, bốc xếp...).
- **Công ty hoàn lại bất kỳ thời điểm nào, không cần chờ kỳ lương** — chỉ đơn giản **tạo khoản chi** (dùng chung sổ thu chi, xem [03-nghiep-vu-cong-no.md](03-nghiep-vu-cong-no.md)).

### 3.2. Tài xế nợ công ty — tiền thu hộ của khách (COD)

- Tài xế thu tiền khách → đang giữ tiền của công ty.
- **Tài xế hoàn lại bất kỳ thời điểm nào** — công ty **tạo khoản thu** để ghi nhận.
- ⚠️ **Lưu ý kế toán quan trọng:** khoản thu này là **thu hồi khoản phải thu từ tài xế, KHÔNG phải doanh thu**. Doanh thu ghi nhận trên đơn hàng; tiền tài xế nộp về chỉ là chuyển tiền từ tay tài xế về công ty. Sổ thu chi phải phân biệt rõ loại phiếu thu này để báo cáo doanh thu không bị đếm trùng.

### 3.3. Màn hình công nợ tài xế

Mỗi tài xế có sổ đối chiếu: công ty còn nợ tài xế bao nhiêu (chi phí ứng chưa hoàn), tài xế còn giữ bao nhiêu (COD chưa nộp, ứng lương chưa trừ), lịch sử từng khoản.

---

## Câu hỏi mở

- [x] Thưởng theo order → **operation điền tay 1 số tiền** (2026-08-21)
- [x] Lương cố định & chấm công → **con số cố định, giảm trừ nhập tay + lý do, không chấm công** (2026-08-21)
- [x] Ứng lương / quy trình → **operation tạo bảng lương, giám đốc duyệt** (2026-08-21)
- [x] Kỳ lương → **setting theo từng merchant** (2026-08-21)
- [x] Hoàn ứng chi phí → **tạo khoản chi bất kỳ lúc nào, không chờ lương; COD tài xế nộp lại = khoản thu (phải thu, không phải doanh thu)** (2026-08-21)
- [x] Trừ/phạt khác → **có, thêm dạng khoản giảm trừ + lý do** (2026-08-21)

*(Mảng lương tài xế tạm khép.)*
