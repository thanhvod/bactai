# BTA — Nền tảng quản lý vận tải đa nhà xe

Monorepo Nx + npm workspaces. Tài liệu nghiệp vụ/sản phẩm: `doc/` (BRD → PRD → TECHNICAL → DESIGN), thiết kế màn hình: `design/`.

| Thành phần | Đường dẫn | Stack | Cổng dev |
|---|---|---|---|
| API | `apps/api` | NestJS 11 + GraphQL (code-first) + Prisma | 2001 |
| Web Merchant | `apps/web` | React 19 + Vite 6 + Tailwind + shadcn | 2002 |
| Web Khách hàng | `apps/customer-web` | React 19 + Vite 6 | 2003 |
| App Tài xế | `apps/driver-app` | Flutter (Bloc/Cubit, offline queue) | — |
| App Merchant | `apps/merchant-app` | Flutter | — |
| Dùng chung | `packages/shared` (trạng thái, quyền, công thức tiền, zod) · `packages/db` (Prisma schema, migration, seed) · `packages/shadcn` (design system web) · `packages/flutter-ui` · `packages/flutter-core` | | |

## Chạy lần đầu (không cần Docker — D-011)

```bash
# 1. PostgreSQL local: tạo role + DB (một lần)
psql -h localhost -U postgres -c "CREATE ROLE bta LOGIN PASSWORD 'bta' CREATEDB;"
psql -h localhost -U postgres -c "CREATE DATABASE bta OWNER bta;"
psql -h localhost -U postgres -c "CREATE DATABASE bta_test OWNER bta;"

# 2. Cài đặt + build package dùng chung
npm install
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run build -w @bta/shared && npm run build -w @bta/db

# 3. Migration + dữ liệu demo (doc/3-TECHNICAL/SEED-SCENARIOS.md)
npm run db:migrate
npm run db:seed

# 4. Chạy
npm run dev:api            # http://localhost:2001/graphql
npm run dev:web            # http://localhost:2002
npm run dev:customer-web   # http://localhost:2003
```

Tài khoản demo (dev bật `AUTH_DEV_BYPASS=true`, màn đăng nhập có khối "Đăng nhập dev"):

- Web: `admin@bta-demo.test` (giám đốc), `operation@bta-demo.test`, `accountant@bta-demo.test`, `admin@tenant-b.test` (merchant khác — kiểm tra tách dữ liệu).
- App tài xế: `0900000001` / `0900000002`, mật khẩu `Taixe123`.
- App Merchant (D-014): `0911000001` (admin) / `0911000002` (operation) / `0911000003` (kế toán), mật khẩu `Nhanvien123`.
- Web Khách hàng (D-013b): nhập SĐT bất kỳ → mã OTP in ra log API (dev `SMS_DRIVER=log`) và hiện gợi ý trên màn dev.

App Flutter: `cd apps/driver-app && flutter run --dart-define=API_URL=http://<ip-máy>:2001` (xem README từng app).

## Kiểm thử

```bash
npm test -w @bta/shared          # công thức tiền/lương/lịch
npm test -w @bta/db              # enum Prisma ↔ @bta/shared
npm test -w @bta/api             # e2e GraphQL/REST trên DB bta_test (seed lại mỗi file)
npm test -w @bta/web && npm test -w @bta/customer-web
npm run e2e -w @bta/web          # Playwright: API 2021 + web 2022 trên DB bta_e2e
# Flutter: flutter analyze && flutter test trong từng package/app
```

CI: `.github/workflows/ci.yml`.

## Quy ước chính

- Mọi bảng nghiệp vụ có `merchantId`; API tự lọc tenant (Prisma extension) — xem `apps/api/src/modules/README.md`.
- Tiền VND lưu `BigInt`, GraphQL scalar `Money`; công thức tiền **chỉ** ở `packages/shared/src/finance.ts` + `FinanceCalcService`.
- Doanh thu = giá cước + add-on. Phiếu thu không phải doanh thu; tài xế nộp COD là thu hồi.
- Thao tác nhạy cảm: permission + lý do + audit (`doc/2-PRD/08-permission-matrix.md`).
- Ngày `@db.Date` ghi bằng `toDbDate()`.

Vận hành, backup, deploy: `doc/3-TECHNICAL/OPERATIONS.md`. Tình trạng triển khai: `doc/3-TECHNICAL/IMPLEMENTATION-STATUS.md`.
