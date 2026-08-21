# Scope Phase 1 — Web Merchant + App Tài xế

> Tổng hợp từ BRD ([00-brd.md](00-brd.md)) và 4 tài liệu nghiệp vụ (02→05). Ngày lập: 2026-08-21
> Trạng thái: Chờ chủ dự án duyệt.

## Sản phẩm trong phase 1

| Sản phẩm | Vai trò |
|---|---|
| **Web Merchant** | Toàn bộ nghiệp vụ: đơn hàng, điều phối, thu chi, công nợ, lương, báo cáo |
| **App Tài xế** (Flutter) | Nhận việc, cập nhật trạng thái chuyến, chụp POD |
| **API + Database** | NestJS + GraphQL + PostgreSQL, multi-tenant, dùng chung cho mọi client |

Ngoài scope phase 1: App Merchant (phase 2), Web Khách hàng + booking online (phase 3), pricing engine, chấm công tự động, tính lãi phạt quá hạn, gửi email/push cho khách.

## A. Web Merchant

### A1. Tài khoản & tổ chức
- Đăng ký merchant mới (self-service — nền tảng SaaS), đăng nhập, quên mật khẩu
- Thông tin nhà xe: doanh nghiệp, liên hệ
- Quản lý nhân viên: CRUD, phân quyền theo vai trò (tối thiểu: admin/giám đốc, operation, kế toán — xem quyền duyệt bảng lương)
- Cài đặt merchant: kỳ lương, ngưỡng cảnh báo gần-trùng lịch, các danh mục (loại chi phí, add-on service, lý do tạm dừng, lý do giảm trừ lương, loại hàng...)

### A2. Danh mục nền
- Khách hàng: CRUD, lịch sử đơn, công nợ, số dư
- Nhà cung cấp: CRUD, các khoản chi liên quan, công nợ phải trả
- Xe: CRUD, lịch sử chạy (từ trip), chi phí vật tư theo xe
- Tài xế: CRUD, lương cố định (lưu lịch sử thay đổi), tài khoản đăng nhập app, lịch sử lái, sổ công nợ tài xế

### A3. Đơn hàng (lõi)
- Tạo đơn: khách hàng, giá cước (nhập tay, tính chung cả đơn), hạn thanh toán (nhập tay), nhiều điểm lấy/trả (kèm thu hộ COD theo điểm), dòng hàng hóa (ghi chú là chính), add-on services
- Danh sách + chi tiết + tìm kiếm/lọc đơn
- Trạng thái 3 tầng: Order / Trip / Stop theo [02-nghiep-vu-don-hang.md](02-nghiep-vu-don-hang.md) mục 4; operation sửa status tự do, mọi thay đổi lưu history
- Hủy đơn thủ công, giữ chi phí đã phát sinh
- Chi phí phát sinh trên chuyến: loại, số tiền, ai chi trước, hoàn tài xế hay không
- Thưởng tài xế theo đơn: operation điền tay theo từng trip
- Lãi/lỗ đơn = (giá cước + add-on) − (chi phí các chuyến + thuê xe ngoài gắn đơn)

### A4. Điều phối
- Gán xe + tài xế cho từng trip (thủ công, chọn từ danh sách) — giao là tài xế nhận, không có bước xác nhận
- Warning trùng / gần-trùng lịch cho cả xe và tài xế (mềm, không chặn; ngưỡng setting)
- Theo dõi trạng thái chuyến do tài xế cập nhật + vị trí xe đang chạy (từ GPS app)

### A5. Thu chi & công nợ
- Sổ thu chi chung: phiếu thu / phiếu chi, danh mục tự định nghĩa
- Phiếu chi gắn được: NCC, đơn/chuyến (thuê xe ngoài luôn gắn đơn), xe (vật tư), tài xế (hoàn ứng, ứng lương)
- Phiếu thu loại "tài xế nộp COD" đánh dấu **phải thu — không phải doanh thu**
- Công nợ khách: phân bổ phiếu thu vào từng đơn (thủ công), số dư khách (tiền trả dư), ngày quá hạn + warning trong app
- Xuất bảng kê công nợ khách ra **PDF** (mẫu tự thiết kế)
- Công nợ NCC: tổng khoản chi chưa trả theo NCC
- Công nợ tài xế: 2 chiều (công ty nợ hoàn ứng ↔ tài xế giữ COD/ứng lương)

### A6. Lương tài xế
- Bảng lương theo kỳ (kỳ setting theo merchant): lương cố định + thưởng các order + trừ ứng + giảm trừ (kèm lý do)
- Luồng duyệt: operation tạo → giám đốc duyệt → chi trả
- Báo cáo trả lương cho kế toán xem

### A7. Báo cáo & dashboard
- Dashboard: hoạt động xe/tài xế hiện tại (chuyến đang chạy, trạng thái), cảnh báo công nợ quá hạn
- Báo cáo theo khoảng thời gian: doanh thu (giá cước + add-on), chi phí, lãi lỗ theo đơn/khách/xe/tài xế, công nợ

## B. App Tài xế

- Đăng nhập (tài khoản do merchant tạo), quên mật khẩu, sửa thông tin cá nhân
- Danh sách công việc theo lịch (giao là nhận — không có nút xác nhận ở phase 1)
- Chi tiết chuyến: đơn, điểm lấy/trả, hàng hóa, ghi chú, số tiền thu hộ tại điểm
- Cập nhật trạng thái chuyến/điểm (bao gồm tạm dừng + lý do)
- Chụp ảnh POD theo điểm trả, hoàn thành chuyến
- **Nhập số tiền COD thực thu tại điểm ngay lúc nhận tiền** → ghi vào sổ công nợ tài xế (tiền đang giữ)
- **GPS tracking: tự động ghi nhận vị trí khi có chuyến đang chạy** (chốt — phase 1)
- Xem thưởng theo đơn và các khoản ứng của mình *(đề xuất — tránh tranh cãi lương)*

## C. Nền tảng kỹ thuật phase 1

- Monorepo Nx TypeScript (D-003, D-005): React+Vite (web) + NestJS+GraphQL (API) + Flutter (app) + PostgreSQL — chi tiết [08-kien-truc.md](08-kien-truc.md)
- Multi-tenant theo merchant_id trên mọi bảng nghiệp vụ (D-001)
- Auth: JWT/session, 3 loại principal (nhân viên merchant theo role, tài xế, [khách hàng — phase 3])
- Upload ảnh (POD, chứng từ) — object storage
- Xuất PDF bảng kê công nợ
- Hạ tầng nhận GPS: app gửi tọa độ định kỳ khi chuyến đang chạy (có buffer offline), lưu lộ trình theo chuyến, xem lại trên chi tiết chuyến + vị trí hiện tại trên dashboard
- Audit/history cho status và các thay đổi quan trọng

---

## Chờ duyệt / chốt nốt

- [ ] Duyệt tổng thể scope phase 1 này
- [x] GPS tracking → **phase 1, trên app tài xế** (2026-08-21)
- [x] Nút "nhận việc" → **phase 1 không cần, giao là nhận** (2026-08-21)
