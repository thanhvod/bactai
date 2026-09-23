# Nghiệp vụ: Công nợ & Đối soát

> Ghi theo mô tả của chủ dự án. Ngày cập nhật: 2026-08-21
> Trạng thái: Đã qua vòng 1 — còn câu hỏi mở ở cuối.

## Nguyên tắc chung

Tinh thần: **đơn giản, operation chủ động thao tác thủ công** — hệ thống ghi nhận, tính số dư và cảnh báo; không có luồng tự động phức tạp.

## 1. Công nợ khách hàng (phải thu)

### 1.1. Cách khách thanh toán

- Khách có thể **trả theo từng đơn**, hoặc **trả bớt một số tiền bất kỳ** (không khớp đơn nào).
- **Operation tự trừ**: khi nhận tiền, operation có thao tác **mark (phân bổ) số tiền vào từng đơn** cụ thể.

**Hệ quả thiết kế:**
- Thực thể **Phiếu thu / Payment** (số tiền, ngày, hình thức, ghi chú) tách khỏi đơn hàng.
- Mỗi payment có các **dòng phân bổ** vào đơn — do operation chỉ định thủ công, một payment phân bổ được cho nhiều đơn.
- Số đã thu của đơn = tổng các dòng phân bổ vào đơn đó. Còn lại = tổng tiền đơn − đã thu.
- **Hạn thanh toán của đơn: operation tự nhập tay theo từng đơn** (không có công thức mặc định theo khách).

### 1.1b. Số dư khách hàng *(chốt 2026-08-21)*

- Có phần **quản lý số dư cho từng khách hàng**: tiền khách trả dư hoặc chưa phân bổ hết được ghi vào **số dư (credit)** của khách.
- Operation dùng số dư này để trừ dần vào các đơn sau (thao tác phân bổ như bình thường, nguồn tiền là số dư).
- Màn hình khách hàng hiển thị: tổng công nợ, số dư đang treo, lịch sử thu/phân bổ.

### 1.2. Theo dõi quá hạn

- Chỉ cần **theo dõi + cảnh báo (warning) đơn giản trong app** (dashboard, badge trên danh sách đơn/khách nợ) — không cần push/email.
- **Không tính lãi/phạt chậm trả.**

### 1.3. Đối chiếu công nợ

- Hệ thống **export bảng kê công nợ ra file PDF**.
- **Operation tự gửi cho khách** qua kênh riêng (Zalo, email...) — hệ thống không cần gửi tự động, không cần luồng khách ký xác nhận online.
- **Không có mẫu sẵn — tự thiết kế.** Cột dự kiến: ngày đơn, mã đơn, tuyến (điểm đi → điểm đến), tổng tiền, đã thu, còn lại, hạn thanh toán, số ngày quá hạn; chốt kỳ theo khoảng thời gian chọn tùy ý.

## 2. Công nợ nhà cung cấp (phải trả)

Chủ dự án chốt cách hiểu đơn giản: **cả 2 loại NCC đều quy về "khoản chi tiền"**:

- **Thuê xe ngoài (chành, xe thuê):** là **1 dịch vụ** — nhà xe chi tiền cho khoản đó. Không cần luồng đối soát chuyến phức tạp riêng với chành.
- **Vật tư (xăng dầu, lốp, sửa chữa, ắc quy...):** cũng là **1 dạng chi tiền**.

**Hệ quả thiết kế:**
- Model chung: **Khoản chi (Expense)** — loại chi (danh mục), số tiền, ngày, **nhà cung cấp** (tùy chọn), trạng thái **đã trả / chưa trả**.
- Công nợ NCC = tổng các khoản chi gắn NCC đó mà chưa trả. Trả tiền NCC = ghi phiếu chi, mark vào các khoản.
- Khoản chi gắn được vào **đơn hàng / chuyến / xe**: riêng **thuê xe ngoài luôn gắn vào order** để lên chi phí và tính lãi đơn; vật tư gắn theo xe (tùy chọn).
- Đây chính là phần "Quản lý thu chi" trong BRD — thu chi, công nợ NCC và chi phí phát sinh trên chuyến dùng chung một sổ.

---

## Câu hỏi mở

- [x] Hạn thanh toán của đơn → **operation tự nhập tay theo từng đơn** (2026-08-21)
- [x] Tiền trả dư / chưa phân bổ → **quản lý số dư (credit) theo khách hàng** (2026-08-21)
- [x] Bảng kê PDF → **không có mẫu sẵn, tự thiết kế** theo cột đề xuất ở mục 1.3 (2026-08-21)
- [x] Warning quá hạn → **warning đơn giản trong app**, không cần push/email (2026-08-21)
- [x] Thuê xe ngoài → **luôn gắn vào order** để lên chi phí (2026-08-21)

*(Mảng công nợ & đối soát tạm khép.)*
