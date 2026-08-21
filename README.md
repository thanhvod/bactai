# BTA — SaaS quản lý vận tải đa nhà xe

Monorepo Nx: **NestJS + GraphQL + Prisma** (api) · **React + Vite** (web) · **Flutter** (driver-app).

- Nghiệp vụ & quyết định: xem [docs/](docs/) (đánh số — nguồn sự thật)
- Kiến trúc: [docs/08-kien-truc.md](docs/08-kien-truc.md)
- Quy ước code cho AI/dev: [CLAUDE.md](CLAUDE.md)

## Chạy dev

```bash
npm install
docker compose up -d          # Postgres :5433 + MinIO :9400
cp .env.example packages/db/.env
cd packages/db && npx prisma migrate dev && npm run seed && cd ../..
npx nx serve @bta/api             # http://localhost:2001/graphql
npx nx serve @bta/web             # http://localhost:2002
npx nx run driver-app:run         # Flutter (cần thiết bị/simulator)
```

> Node >= 20.19 khuyến nghị (một số dep của Vite 8 yêu cầu; 20.17 chạy được nhưng có warning).
