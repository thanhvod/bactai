# Quy ước module (clean architecture)

Mỗi domain 1 module (08-kien-truc.md mục 2). Cấu trúc trong module:

```
<domain>/
├── domain/           # entity + rule nghiệp vụ thuần — KHÔNG import framework/Prisma
├── application/      # use-case (service), interface repository
├── infrastructure/   # Prisma repository implementation
├── presentation/     # GraphQL resolver + input/object types
└── <domain>.module.ts
```

- Multi-tenant: mọi query qua Prisma extension tự áp `merchantId` từ JWT — không tin field từ client (D-001).
- Đổi trạng thái order/trip/stop: luôn ghi `status_history` (use-case chung).
- Tiền VND: BigInt (xem main.ts + README-handoff trong packages/db).
