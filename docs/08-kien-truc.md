# Kiến trúc kỹ thuật

> Cụ thể hóa D-003 + D-005 ([01-decisions.md](01-decisions.md)). Ngày lập: 2026-08-21 — **viết lại cùng ngày** sau buổi chốt kiến trúc với chủ dự án (bản cũ đề xuất pnpm+Turborepo/Next.js/Expo/REST đã bị thay thế).
> Repo tham khảo pattern: `/Users/vod/Documents/WES/app-claude` (Nx, NestJS+GraphQL+Prisma, React+Vite, Flutter).
> Trạng thái: **Hướng chính đã chốt với chủ dự án (2026-08-21).** Chi tiết nhỏ còn mở ghi ở cuối.

## 1. Cấu trúc monorepo (Nx)

**Tool: Nx** — giống app-claude để tái dùng pattern, generator và kinh nghiệm vận hành. Scope package: **`@bta/*`**.

```
code/
├── apps/
│   ├── api/             # NestJS + GraphQL + Prisma — backend duy nhất, clean architecture
│   ├── web/             # React + Vite — Web Merchant (modular theo domain, sẵn sàng tách micro-FE)
│   └── driver-app/      # Flutter — App Tài xế, clean architecture
├── packages/
│   ├── shadcn/            # @bta/shadcn — clone từ app-claude (Radix/Tailwind + Toast...)
│   ├── flutter-component/ # clone từ app-claude
│   ├── flutter-ui/        # clone từ app-claude
│   ├── graphql/           # @bta/graphql — Apollo Client + queries/mutations + codegen hooks
│   ├── db/                # @bta/db — Prisma schema + migrations + seed (theo 07-data-model.md)
│   ├── shared/            # @bta/shared — types, constants (bộ trạng thái, danh mục mặc định), zod schemas
│   ├── i18n/              # @bta/i18n — tiếng Việt trước, cấu trúc sẵn en
│   ├── routing/           # @bta/routing — path constants cho web (không hard-code URL)
│   └── config/            # tsconfig/eslint/prettier dùng chung
└── docs/
```

**Không clone `packages/ui` (MUI)** — hệ UI web là shadcn duy nhất (D-005).

**Port dev (tránh đụng app-claude 1001–1004 khi chạy song song):** `api` → **2001**, `web` → **2002**.

## 2. Backend — NestJS + GraphQL, clean architecture

- **GraphQL code-first** (decorator NestJS, generate `schema.gql`).
- **Module theo domain:** auth, merchants, users, drivers, vehicles, customers, suppliers, orders, trips (điều phối), expenses, payments, payrolls, catalogs (danh mục), reports, locations (GPS).
- **Layer trong mỗi module (clean architecture):**
  - `domain/` — entity + rule nghiệp vụ thuần, không phụ thuộc framework/Prisma
  - `application/` — use-case (service), interface repository
  - `infrastructure/` — Prisma repository implementation
  - `presentation/` — GraphQL resolver + input/object types
- **Multi-tenant enforcement tập trung:** guard đọc `merchant_id` từ JWT → Prisma client extension tự áp filter mọi query — không tin field từ client (D-001).
- **Ngoài GraphQL, giữ REST cho 2 chỗ đặc thù:** upload ảnh qua **presigned URL** (POD, chứng từ) và **GPS ingest batch** (app gom tọa độ 15–30s/lần khi chuyến chạy, buffer offline gửi bù).
- Audit: mọi đổi trạng thái ghi `status_history` (interceptor/use-case chung).

## 3. Web Merchant — React + Vite, modular (micro-FE-ready)

Chốt: **modular trước, tách runtime sau** — 1 app host, chưa module federation ở phase 1.

- Mỗi domain nghiệp vụ là **1 lib riêng trong monorepo**: orders, dispatch, finance (thu chi + công nợ), payroll, catalog (khách/xe/tài xế/NCC), reports. App host chỉ có shell (layout, auth, routing) và lazy-load từng domain.
- Ranh giới lib là ranh giới micro-FE tương lai — khi cần deploy riêng mới nâng lên module federation, không đổi cấu trúc code.
- **UI:** `@bta/shadcn` + Tailwind. **Form:** react-hook-form + zod (schema từ `@bta/shared`).
- **Data:** Apollo Client qua `@bta/graphql`; GraphQL codegen sinh typed hooks từ `schema.gql`.

## 4. App Tài xế — Flutter, clean architecture

- Layer chuẩn: `data/` (GraphQL datasource + model) → `domain/` (entity, use-case) → `presentation/` (Bloc + UI).
- **State management: Bloc** *(đề xuất — chốt khi dựng app)*.
- GraphQL client: `graphql_flutter` + codegen model.
- UI dùng chung `@bta/flutter-ui` + `@bta/flutter-component` (clone từ app-claude).
- Offline: buffer trạng thái/GPS/ảnh POD khi mất mạng, đẩy bù khi có mạng.

## 5. Các lựa chọn nền (giữ từ bản đề xuất trước — không đổi)

| Hạng mục | Chốt | Ghi chú |
|---|---|---|
| ORM | **Prisma** | Schema tại `@bta/db`, theo [07-data-model.md](07-data-model.md) |
| Validation | **zod** trong `@bta/shared` | Một nguồn schema cho API pipe + form web |
| Auth | **JWT access + refresh** | Nhân viên: email+mật khẩu; tài xế: SĐT+mật khẩu merchant cấp. Token chứa merchant_id + loại principal |
| Phân quyền | RBAC: **admin (giám đốc) / operation / kế toán** | Duyệt bảng lương chỉ admin |
| Upload ảnh | **S3-compatible** (dev: MinIO docker; prod: S3/R2) | Presigned URL |
| Xuất PDF | HTML template → **Playwright/Chromium** trên API | Bảng kê công nợ, tái dùng cho báo cáo |
| Realtime dashboard | **Polling 15–30s** phase 1 | Nâng WebSocket khi có nhu cầu thật |
| Ngôn ngữ | Tiếng Việt trước, i18n sẵn | `@bta/i18n` |

## 6. Môi trường & vận hành

- **Dev:** docker-compose (PostgreSQL + MinIO); seed 1 merchant mẫu + dữ liệu demo đủ chạy end-to-end.
- **CI:** GitHub Actions — lint + typecheck + test + build, dùng `nx affected` để chỉ chạy phần thay đổi.
- **Deploy (sơ bộ, chốt sau):** 1 VPS + Docker Compose (api + web + Postgres + MinIO); driver app build qua CI, phát hành store.

## 7. Thứ tự dựng khung

1. Khung Nx + `@bta/config` + CI
2. Clone 3 package từ app-claude → đổi scope `@bta/*`: shadcn, flutter-component, flutter-ui
3. `@bta/db`: Prisma schema theo ERD 07 + migration + seed *(dựng lại — bản cũ đã mất cùng khung Turborepo)*
4. `apps/api`: auth + multi-tenant guard + module danh mục nền (customer, vehicle, driver, supplier) — theo layer mục 2
5. `apps/web`: shell + đăng nhập + lib catalog (CRUD danh mục nền)
6. Lõi đơn hàng: order → trip → điều phối → trạng thái + history
7. Thu chi → công nợ → PDF bảng kê
8. Lương → duyệt bảng lương
9. `apps/driver-app` (Flutter): đăng nhập, danh sách việc, trạng thái, POD, COD
10. Dashboard + báo cáo

---

## Còn mở

- [x] GPS tracking → **vào phase 1** (chốt 2026-08-21, xem [06](06-scope-phase-1.md)) — dùng đường REST batch mục 2
- [ ] Bloc cho Flutter (đề xuất tạm) — chốt khi bắt đầu dựng driver-app
- [ ] Hosting/domain cụ thể — chốt trước khi go-live
