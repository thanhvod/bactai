# Data Model (ERD) — Bản nháp phase 1

> Suy ra từ 4 tài liệu nghiệp vụ (02→05). Ngày lập: 2026-08-21
> Trạng thái: Chờ duyệt. Đây là mức khái niệm — tên bảng/cột chính xác sẽ chốt khi viết schema (Prisma/TypeORM).

## Nguyên tắc chung

- **Multi-tenant:** mọi bảng nghiệp vụ đều có `merchant_id`. Mọi query bắt buộc lọc theo tenant.
- **Tiền tệ:** VND, lưu số nguyên (không thập phân).
- **Không xóa cứng** dữ liệu nghiệp vụ — dùng soft delete / trạng thái.
- **Status history dùng chung:** một bảng `status_history` ghi mọi thay đổi trạng thái (entity, từ → sang, ai, lúc nào, lý do) — đáp ứng yêu cầu "operation sửa tự do nhưng lưu history".
- **Audit/timeline dùng chung:** ngoài status history, các thao tác nhạy cảm và thay đổi nghiệp vụ quan trọng cần ghi `activity_log` / `audit_log`.
- **Mã tự động theo tenant:** các chứng từ chính có mã tự động theo merchant, dùng sequence riêng từng loại chứng từ.
- **Danh mục merchant tự định nghĩa** (loại chi phí, add-on, lý do tạm dừng, lý do giảm trừ, loại hàng): chung một pattern bảng danh mục có `merchant_id`, seed sẵn giá trị mặc định khi tạo merchant.

## Sơ đồ quan hệ (mức khái niệm)

```mermaid
erDiagram
    MERCHANT ||--o{ USER : "nhân viên"
    MERCHANT ||--o{ DRIVER : ""
    MERCHANT ||--o{ VEHICLE : ""
    MERCHANT ||--o{ CUSTOMER : ""
    MERCHANT ||--o{ SUPPLIER : ""
    MERCHANT ||--o{ ORDER : ""
    MERCHANT ||--o{ NUMBER_SEQUENCE : ""
    MERCHANT ||--o{ NOTIFICATION : ""

    CUSTOMER ||--o{ ORDER : "đặt"
    CUSTOMER ||--o{ CUSTOMER_LOCATION : "dia chi thuong dung"
    ORDER ||--o{ ORDER_STOP : "điểm lấy/trả"
    ORDER ||--o{ CARGO_LINE : "hàng hóa"
    ORDER ||--o{ ORDER_ADDON : "dịch vụ cộng thêm"
    ORDER ||--o{ TRIP : "1..n chuyến"
    ORDER ||--o{ INCIDENT : "su co"
    ORDER ||--o{ ACTIVITY_LOG : "timeline"

    TRIP }o--|| VEHICLE : "xe"
    TRIP }o--|| DRIVER : "tài xế"
    TRIP ||--o{ TRIP_LOCATION : "lộ trình GPS"
    TRIP ||--o{ TRIP_STOP_ASSIGN : "phụ trách điểm"
    TRIP ||--o{ INCIDENT : "su co"
    ORDER_STOP ||--o{ TRIP_STOP_ASSIGN : ""
    ORDER_STOP ||--o{ ATTACHMENT : "ảnh POD"

    EXPENSE }o--o| SUPPLIER : "NCC (tùy chọn)"
    EXPENSE }o--o| ORDER : "thuê xe ngoài"
    EXPENSE }o--o| TRIP : "chi phí chuyến"
    EXPENSE }o--o| VEHICLE : "vật tư xe"
    EXPENSE }o--o| DRIVER : "hoàn ứng / ứng lương"

    PAYMENT_IN }o--o| CUSTOMER : "khách trả"
    PAYMENT_IN }o--o| DRIVER : "tài xế nộp COD"
    PAYMENT_IN ||--o{ PAYMENT_ALLOCATION : "phân bổ"
    PAYMENT_ALLOCATION }o--|| ORDER : "vào đơn"
    DEBT_STATEMENT ||--o{ DEBT_STATEMENT_LINE : "snapshot"
    DEBT_STATEMENT }o--|| CUSTOMER : "bang ke"

    DRIVER ||--o{ PAYROLL_LINE : ""
    PAYROLL ||--o{ PAYROLL_LINE : ""
    PAYROLL_LINE ||--o{ PAYROLL_LINE_ITEM : "thưởng/ứng/giảm trừ"
```

## Mô tả thực thể chính

### Tổ chức & con người

| Thực thể | Nội dung chính | Ghi chú nghiệp vụ |
|---|---|---|
| `merchant` | Thông tin nhà xe, settings (kỳ lương, ngưỡng cảnh báo lịch) | Tenant gốc (D-001) |
| `user` | Nhân viên merchant: email, mật khẩu, vai trò | Role tối thiểu: admin/giám đốc, operation, kế toán. Giám đốc có quyền duyệt bảng lương |
| `driver` | Hồ sơ tài xế + tài khoản app + **lương cố định** | Lương cố định lưu kèm lịch sử thay đổi (`driver_salary_history`) để kỳ cũ tính đúng |
| `customer` | Khách hàng của merchant, hạn mức nợ, số ngày công nợ mặc định | Số dư (credit) suy từ payment chưa phân bổ; cảnh báo mềm khi vượt hạn mức |
| `customer_location` | Địa chỉ/kho/điểm giao nhận thường dùng, người liên hệ, SĐT, ghi chú, tọa độ | Khi tạo order có thể chọn nhanh rồi snapshot vào `order_stop` |
| `supplier` | NCC (vận tải thuê ngoài / vật tư) | Công nợ = tổng expense chưa trả |
| `vehicle` | Xe: biển số, loại, tải trọng | Lịch sử chạy suy từ trip |
| `number_sequence` | Loại chứng từ, prefix/format, counter theo merchant | Sinh mã order/trip/payment/expense/payroll/debt statement |
| `permission_policy` / RBAC | Quyền thao tác nhạy cảm theo role | Có thể bắt lý do khi sửa/hủy dữ liệu nhạy cảm |

### Đơn hàng & vận hành

| Thực thể | Nội dung chính | Ghi chú nghiệp vụ |
|---|---|---|
| `order` | Khách, **giá cước nhập tay (chung cả đơn)**, hạn thanh toán (nhập tay), trạng thái, người tạo | Tổng thu khách = giá cước + Σ addon. Trạng thái theo 02/mục 4.1 |
| `order_stop` | Loại (lấy/trả), thứ tự, địa chỉ, liên hệ, **tiền thu hộ COD dự kiến** và **COD thực thu (tài xế nhập trên app lúc nhận tiền)**, trạng thái, giờ thực tế | Ảnh POD gắn theo stop; COD thực thu đổ vào sổ công nợ tài xế (tiền đang giữ) |
| `cargo_line` | Tên hàng (bắt buộc duy nhất), loại, khối lượng/thể tích/kiện, tính chất, ghi chú | Mục đích ghi chú — không validate chặt (02/mục 6) |
| `order_addon` | Dịch vụ cộng thêm: danh mục + số tiền | Tiền THU thêm của khách (02/mục 7.1) |
| `trip` | Xe + tài xế + thời gian dự kiến, trạng thái, **thưởng tài xế (nhập tay)**, đã nhận việc chưa | 1 đơn có 1..n trip; cảnh báo gần-trùng lịch tính trên bảng này |
| `external_transport_info` | Thông tin thuê xe ngoài: NCC/chành, biển số, tài xế ngoài, SĐT, giá thuê, ghi chú | Expense thuê xe ngoài vẫn gắn order để tính lãi/lỗ; bảng này giữ thông tin vận hành |
| `trip_stop_assign` | Trip nào phụ trách stop nào | Chỉ cần thiết khi đơn nhiều xe; đơn 1 xe gán tất cả stop tự động |
| `trip_location` | Tọa độ GPS theo chuyến: lat/lng, thời điểm, độ chính xác | App gửi định kỳ khi chuyến đang chạy (batch, buffer offline); bảng ghi nhiều — cần partition/dọn định kỳ |
| `status_history` | entity_type, entity_id, từ → sang, lý do, user, thời điểm | Dùng chung cho order/trip/stop; lý do tạm dừng chọn từ danh mục |
| `activity_log` / `audit_log` | entity_type, entity_id, action, payload trước/sau, người thực hiện, lý do, thời điểm | Timeline nghiệp vụ; bắt buộc cho sửa giá, sửa tiền, sửa COD, hủy/sửa dữ liệu nhạy cảm |
| `attachment` | File/ảnh gắn theo entity | POD, chứng từ hàng hóa, hóa đơn chi phí, biên nhận, ảnh sự cố |
| `incident` | Sự cố order/trip: loại, mức độ, mô tả, trạng thái xử lý, người phụ trách | Gắn attachment để lưu ảnh/chứng từ sự cố |

### Tiền

| Thực thể | Nội dung chính | Ghi chú nghiệp vụ |
|---|---|---|
| `expense` (phiếu chi) | Danh mục, số tiền, ngày, NCC/đơn/chuyến/xe/tài xế (tùy loại), **ai chi trước** (tài xế/công ty), có hoàn tài xế không, **đã trả/chưa trả** | Một sổ cho tất cả: chi phí chuyến, thuê xe ngoài (luôn gắn order), vật tư, hoàn ứng, ứng lương, chi khác; dùng thêm loại tạm ứng chuyến |
| `payment_in` (phiếu thu) | Loại: **khách trả / tài xế nộp COD / thu khác**, số tiền, ngày | Loại "tài xế nộp COD" là **thu hồi phải thu — KHÔNG tính doanh thu** (04/mục 3.2) |
| `payment_allocation` | payment_in → order, số tiền | Operation phân bổ thủ công; phần chưa phân bổ = số dư khách |
| `debt_statement` | Bảng kê công nợ đã tạo/chốt/gửi/hủy, kỳ đối chiếu, customer, file PDF, tổng tiền snapshot | Lưu bản đã gửi khách để đối chiếu sau này |
| `debt_statement_line` | Snapshot từng order trong bảng kê: tổng tiền, đã thu, còn lại, hạn thanh toán, số ngày quá hạn | Không phụ thuộc dữ liệu order thay đổi sau khi chốt |
| `notification` | Người nhận, loại sự kiện, entity liên quan, trạng thái đọc | Phase đầu notification trong web/app |
| `payroll` | Kỳ (từ–đến), trạng thái: nháp → chờ duyệt → **giám đốc duyệt** → đã trả | Kỳ theo setting merchant |
| `payroll_line` | Mỗi tài xế 1 dòng: lương cố định (snapshot), tổng thưởng, tổng ứng, tổng giảm trừ, thực lãnh | |
| `payroll_line_item` | Từng khoản: thưởng (ref trip), ứng (ref expense), giảm trừ (số tiền + lý do) | Kế toán xem chi tiết, không tính tay |

### Các con số suy ra (không lưu bảng riêng, tính từ dữ liệu gốc)

- **Công nợ khách theo đơn** = tổng thu khách của đơn − Σ allocation vào đơn. Quá hạn = hôm nay − hạn thanh toán (khi còn nợ).
- **Số dư khách** = Σ payment_in của khách − Σ allocation của các payment đó.
- **Cảnh báo hạn mức khách** = tổng công nợ còn lại so với hạn mức nợ customer.
- **Công nợ NCC** = Σ expense gắn NCC, trạng thái chưa trả.
- **Công nợ tài xế 2 chiều** = (chi phí tài xế ứng chưa hoàn) ↔ (COD đã thu chưa nộp + ứng lương chưa trừ).
- **Cảnh báo COD tài xế giữ** = COD đã thu chưa nộp theo số tiền/số ngày cấu hình.
- **Lãi/lỗ đơn** = (giá cước + Σ addon) − (Σ expense gắn đơn và các trip của đơn).

---

## Câu hỏi mở về model

- [ ] Duyệt tổng thể ERD này trước khi viết schema thật
- [x] COD tài xế đã thu → **tài xế input số tiền trên app ngay lúc nhận tiền** (2026-08-21)
- [x] Bổ sung chức năng vận hành thực tế → **đã chọn toàn bộ nhóm đề xuất, triển khai theo phase** (2026-09-23)
- [ ] Booking (phase 3) sẽ thêm bảng `booking` tách riêng — đã dự phòng, chưa cần bàn
