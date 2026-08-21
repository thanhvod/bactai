# Bàn giao packages/db + packages/shared (từ phiên BA → phiên code)

Ngày: 2026-08-21. Nguồn: phiên BA (thread tài liệu) — các file này là bản sao đúng nội dung
đã bị xóa khỏi repo lúc ~18:02 theo yêu cầu chủ dự án ("phần nào bạn sinh ra thì xóa đi").
Không có backup nào khác (chưa từng commit git); bản này tái tạo từ ngữ cảnh phiên BA.

## Nội dung

- `db/schema.prisma` — schema đầy đủ theo docs/07-data-model.md, ĐÃ `prisma validate` hợp lệ với Prisma 6.2 + PostgreSQL 16
- `db/seed.ts` — seed 1 merchant demo + danh mục mặc định + 3 user (admin/op/kế toán, mk `123456`) + tài xế/xe/khách demo
- `db/index.ts` — PrismaClient singleton
- `shared/status.ts` — nhãn tiếng Việt cho mọi enum trạng thái (khớp schema)
- `shared/catalog-defaults.ts` — danh mục mặc định seed khi tạo merchant mới
- `shared/index.ts`

## Ghi chú thiết kế cần giữ khi chuyển sang kiến trúc mới (Nx/GraphQL)

1. **Tiền VND = BigInt** (đơn tiền tỷ không vỡ Int4). Bản cũ patch `BigInt.prototype.toJSON` ở API bootstrap; với GraphQL cần scalar tương ứng (an toàn < 2^53 → serialize number).
2. **Password hash format** trong seed: `scrypt:<salt>:<hash>` (node:crypto scryptSync 64 bytes) — auth service phải verify cùng format, hoặc đổi cả hai sang bcrypt/argon2.
3. **Thuê xe ngoài luôn gắn `orderId`** — schema để optional, enforce ở tầng service (docs/03).
4. `PaymentInKind.DRIVER_COD_REMIT` là thu hồi phải thu, **không phải doanh thu** — mọi báo cáo doanh thu phải loại kind này (docs/04 mục 3.2).
5. Cảnh báo gần-trùng lịch dùng `Merchant.scheduleWarnHours` + index `(merchantId, vehicleId/driverId, plannedStartAt)` trên `Trip`.
6. Seed danh mục lấy từ `shared/catalog-defaults.ts` — cũng là thứ chạy khi merchant mới đăng ký (không chỉ dev seed).
