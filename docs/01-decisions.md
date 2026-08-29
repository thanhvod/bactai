# Quyết định dự án (Decision Log)

> Ghi nhận các quyết định đã chốt với chủ dự án. Mỗi quyết định có ngày và lý do; nếu thay đổi thì ghi đè kèm ngày mới, không xóa lịch sử.

## D-001 — Mô hình sản phẩm: SaaS đa nhà xe (multi-tenant)

- **Ngày:** 2026-08-21
- **Quyết định:** Xây dựng nền tảng SaaS cho nhiều nhà xe (merchant) đăng ký sử dụng. Khách hàng cuối có thể tìm kiếm nhà xe và đặt chuyến trên nền tảng.
- **Hệ quả kỹ thuật:** Data model phải tách tenant (theo merchant) ngay từ đầu — mọi bảng nghiệp vụ đều gắn với merchant. Auth phân biệt 3 loại người dùng: merchant (chủ + nhân viên có phân quyền), tài xế, khách hàng.

## D-002 — Thứ tự build các sản phẩm *(sửa 2026-08-21)*

- **Quyết định hiện hành (2026-08-21, khi chốt mảng điều phối):**
  1. **Phase 1: Web Merchant + App Tài xế** — làm app tài xế ngay từ đầu để giao việc, cập nhật trạng thái, chụp POD qua app.
  2. **Phase 2: App Merchant** — bản rút gọn từ web.
  3. **Phase 3: Web Khách hàng** (kèm luồng booking online).
- **Hệ quả:** API cho app tài xế nằm trong scope phase 1. Operation vẫn update được trạng thái thay tài xế trên web (dự phòng khi tài xế không dùng app).
- *Lịch sử: bản đầu (2026-08-21 sáng) xếp App Tài xế sau App Merchant; chủ dự án đổi lại "phase đầu làm app luôn" khi bàn mảng điều phối.*

## D-003 — Tech stack *(sửa 2026-08-21 chiều, buổi chốt kiến trúc)*

- **Quyết định hiện hành:**
  - **API:** NestJS + **GraphQL**, modular, **clean architecture**, TypeScript
  - **Web (merchant):** **ReactJS + Vite** — hướng micro front-end; phase 1 modular theo domain, tách runtime sau (D-005)
  - **Mobile (tài xế, sau này merchant):** **Flutter**, clean architecture
  - **Database:** PostgreSQL
  - Share types/validation/UI qua packages chung trong monorepo.
- **Chi tiết:** [08-kien-truc.md](08-kien-truc.md) (đã viết lại theo quyết định này).
- *Lịch sử: bản nháp đầu ghi Next.js + React Native/Expo — ghi nhầm phía AI, chủ dự án xác nhận mobile luôn là Flutter, web đi React+Vite. Khung code pnpm+Turborepo dựng theo bản cũ đã bỏ, dựng lại theo Nx.*

## D-005 — Kiến trúc monorepo, tham khảo app-claude *(2026-08-21)*

- **Quyết định:**
  - **Tool monorepo:** Nx (giống repo tham khảo `/Users/vod/Documents/WES/app-claude`).
  - **ORM:** Prisma.
  - **UI web:** **shadcn** (Radix/Tailwind) là hệ chính — layout/sidebar/form dùng shadcn.
  - **Clone từ app-claude:** `packages/shadcn`, `packages/flutter-component`, `packages/flutter-ui`; *(bổ sung 2026-08-23)* thêm `packages/ui` (`@bta/ui` — wrap MUI) theo yêu cầu chủ dự án để dùng khi cần, đảo lại quyết định "không clone ui" ban đầu.
  - **Scope package:** `@bta/*`.
  - **Micro front-end:** phase 1 modular theo domain (libs trong monorepo), khi cần mới nâng module federation.
- **Chi tiết:** [08-kien-truc.md](08-kien-truc.md).

## D-006 — Đăng nhập Web Merchant: Google qua Firebase Auth *(2026-08-23)*

- **Quyết định:** Trang `/login` của web merchant chỉ có **1 phương thức duy nhất: Google login** (Firebase Authentication, project `bac-tai-app`). Không có form email/mật khẩu.
- **Hệ quả:** API sẽ xác thực bằng **Firebase ID token** từ client (thay cho JWT tự phát email/mật khẩu ở đề xuất cũ); mapping user Firebase ↔ nhân viên merchant + role xử lý ở backend. Đăng nhập app tài xế (SĐT/mật khẩu hay cũng Firebase?) — **chưa chốt**.
- Firebase web config đặt tại `apps/web/.env` (`VITE_FIREBASE_*`, có `.env.example` mẫu — config này là public key, không phải secret).

## D-004 — Nguồn kiến thức nghiệp vụ

- **Ngày:** 2026-08-21
- **Ghi nhận:** Chủ dự án nắm rõ quy trình thực tế của cả 4 mảng nghiệp vụ và sẽ mô tả chi tiết: (1) đơn hàng & chi phí, (2) công nợ & đối soát, (3) lương tài xế, (4) điều phối & thuê xe ngoài. Mỗi mảng sẽ được ghi thành tài liệu nghiệp vụ riêng trong `docs/`.
