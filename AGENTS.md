# CLAUDE.md / AGENTS.md — BTA Monorepo

> **BTA** — SaaS quản lý vận tải đa nhà xe (multi-tenant). `docs/` đánh số là nguồn sự thật nghiệp vụ; đọc trước khi code. Triết lý: đơn giản, operation nhập tay, hệ thống ghi nhận + cộng dồn + cảnh báo.

## Cấu trúc Monorepo (Nx)

```
apps/
  api/             # NestJS + GraphQL (code-first) + Prisma — backend duy nhất, clean architecture
  web/             # React + Vite — Web Merchant, modular theo domain (micro-FE-ready)
  driver-app/      # Flutter — App Tài xế, clean architecture (data/domain/presentation + Bloc)

packages/
  shadcn/            # @bta/shadcn — hệ UI web duy nhất (Radix/Tailwind). KHÔNG dùng MUI
  flutter-ui/        # design system Flutter (package: flutter_ui)
  flutter-component/ # component Flutter cấp cao (package: flutter_component)
  db/                # @bta/db — Prisma schema + migrations + seed (theo docs/07)
  shared/            # @bta/shared — types, nhãn trạng thái VN, danh mục mặc định, zod
```

## Lệnh thường dùng

```bash
docker compose up -d                 # Postgres (5433!) + MinIO (9400/9401)
npx nx serve @bta/api                # API — port 2001, GraphQL tại /graphql
npx nx serve @bta/web                # Web merchant — port 2002
npx nx run driver-app:run            # Flutter app (flutter run)
npx nx run-many -t build typecheck   # Build + typecheck toàn bộ
cd packages/db && npx prisma migrate dev && npm run seed
```

⚠️ **Postgres dev map ra port 5433** — máy host có sẵn Postgres chiếm 5432. `DATABASE_URL` xem `.env.example`.

## Quy ước quan trọng

- **Multi-tenant:** mọi bảng nghiệp vụ có `merchantId`; guard đọc từ JWT, Prisma extension áp filter — không tin field từ client (docs/01 D-001).
- **Clean architecture API:** mỗi module domain/application/infrastructure/presentation — xem `apps/api/src/modules/README.md`.
- **Tiền VND = BigInt.** Đổi trạng thái luôn ghi `status_history`. Phiếu thu `DRIVER_COD_REMIT` KHÔNG phải doanh thu (docs/04 mục 3.2).
- **UI web chỉ dùng `@bta/shadcn`**; Flutter chỉ dùng `flutter_ui`/`flutter_component`.
- Kiến trúc chi tiết: `docs/08-kien-truc.md`. Quyết định: `docs/01-decisions.md`.
