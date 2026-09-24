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

## D-007 — Bổ sung chức năng vận hành thực tế *(2026-09-23)*

- **Quyết định:** Chọn bổ sung toàn bộ nhóm chức năng đề xuất để giảm rủi ro vận hành thật: mã tự động, timeline/audit, chứng từ, cảnh báo COD tài xế giữ, chốt bảng kê công nợ, quyền sửa dữ liệu nhạy cảm, tạm ứng chuyến, sự cố chuyến, thông báo nội bộ, import/export Excel, mẫu in/chia sẻ nhanh, hạn mức công nợ khách, sổ địa chỉ/liên hệ thường dùng, và thông tin thuê xe ngoài tối thiểu.
- **Hệ quả nghiệp vụ:** Các chức năng này là requirement đã chọn, nhưng triển khai theo phase; không bắt buộc tất cả nằm trong go-live đầu tiên.
- **Chi tiết:** [09-bo-sung-chuc-nang.md](09-bo-sung-chuc-nang.md).

## D-008 — Làm mới hoàn toàn codebase theo docs mới *(2026-09-23)*

- **Quyết định:** Implement lại từ đầu theo `doc/` (BRD/PRD/TECHNICAL/DESIGN) và `design/`. **Không tái sử dụng code cũ** (commit trước `a3ca078`), không tham chiếu schema/module cũ.
- **Phạm vi:** Làm đầy đủ toàn bộ feature trong backlog `doc/2-PRD/02-implementation-breakdown.md` (P0→P9: Web Merchant, App Tài xế, App Merchant, Web Khách hàng).

## D-009 — Đăng nhập App Tài xế: SĐT + mật khẩu do merchant cấp *(2026-09-23)* — chốt O-001

- **Quyết định:** Tài xế đăng nhập bằng **số điện thoại + mật khẩu** do operation/admin tạo/reset trên Web Merchant. Không dùng Firebase phone/OTP (tránh chi phí OTP).
- **Hệ quả kỹ thuật:** API tự phát JWT access token ngắn hạn + refresh token cho principal `driver`; mật khẩu hash (scrypt); SĐT unique theo merchant; "quên mật khẩu" = liên hệ nhà xe để reset (không gửi OTP). App Merchant (phase 2) dùng Google/Firebase như web.

## D-010 — Background job: chạy inline sau abstraction *(2026-09-23)* — chốt O-002

- **Quyết định:** Phase 1 chạy PDF/export/import inline trong API, qua interface `JobRunner` để sau này thay bằng BullMQ/Redis mà không đổi use-case.

## D-011 — Môi trường dev không dùng Docker *(2026-09-23)*

- **Quyết định:** Dev dùng **PostgreSQL cài local** (host `localhost:5432`, DB `bta`, test DB `bta_test`, user `bta`). Không có MinIO: storage có adapter `local` (lưu file trên đĩa, upload/download qua URL ký ngắn hạn của API) và adapter `s3` cho production — cùng một interface presigned.

## D-012 — Sửa bảng lương sau duyệt *(2026-09-23)* — chốt O-005

- **Quyết định:** Trước khi chi trả, admin **trả về nháp kèm lý do** để sửa rồi duyệt lại. Sau khi đã đánh dấu **đã chi trả** thì không sửa bảng lương; chênh lệch được điều chỉnh bằng dòng điều chỉnh ở **kỳ lương sau**.

## D-013 — Đăng nhập Web Khách hàng *(2026-09-23)* — ~~đề xuất email + mật khẩu~~ → **thay bởi D-013b**

- **Đề xuất đang implement:** khách đăng ký/đăng nhập bằng **email (hoặc SĐT) + mật khẩu**, không OTP (cùng lý do chi phí như D-009). Quên mật khẩu = link đặt lại gửi email (dev: in link ra log API; production cần cấu hình SMTP).
- **Liên kết khách ↔ nhà xe:** tài khoản khách là toàn nền tảng; khi operation chuyển booking thành đơn và chọn khách hàng của nhà xe, hệ thống gắn `customer.portalAccountId` (nếu trống). Khách chỉ thấy đơn/bảng kê của các hồ sơ khách đã liên kết, và chỉ chứng từ được đánh dấu chia sẻ, bảng kê đã chốt/đã gửi được chia sẻ.
- **Hồ sơ nhà xe công khai:** chỉ merchant bật `publicProfile` mới xuất hiện ở trang khám phá.


## D-013b — Web Khách hàng đăng nhập bằng SĐT + OTP *(2026-09-23, chủ dự án chốt)*

- **Quyết định:** khách hàng đăng ký/đăng nhập bằng **số điện thoại + mã OTP qua SMS**, không dùng mật khẩu. **Không làm đặt lại mật khẩu qua email.**
- **Hệ quả kỹ thuật:** OTP 6 số, hết hạn 5 phút, tối đa 5 lần nhập sai, gửi lại sau 60 giây, giới hạn số lần gửi/ngày theo SĐT. Nhà cung cấp SMS: **AWS SNS** (production, D-015); dev in mã ra log. Email khách là thông tin tùy chọn.

## D-014 — App Merchant đăng nhập bằng SĐT + mật khẩu *(2026-09-23)*

- **Quyết định:** App Merchant (phase 2) đăng nhập bằng **số điện thoại + mật khẩu**; đăng ký/đăng nhập OTP làm sau. Web Merchant giữ Google (D-006).
- **Hệ quả kỹ thuật:** tài khoản nhân viên (user account) có thêm SĐT (unique toàn hệ thống) + mật khẩu; admin đặt/đặt lại mật khẩu app cho nhân viên ở màn chi tiết nhân viên (WM-USER-02), nhân viên đổi mật khẩu trong app. Cùng một tài khoản dùng được cả web (Google, theo email) và app (SĐT).

## D-015 — Production chạy trên AWS *(2026-09-23)* — chốt O-003

- **Quyết định:** hạ tầng production dùng **AWS**: S3 (chứng từ, PDF), SNS (SMS OTP), PostgreSQL trên RDS; API/web chạy trên EC2 hoặc ECS (chốt chi tiết khi triển khai).

## D-016 — GPS app tài xế chạy nền *(2026-09-23)*

- **Quyết định:** app tài xế tự ghi vị trí khi có chuyến đang chạy, **kể cả khi app ở nền hoặc đã bị vuốt tắt**.
- **Hệ quả kỹ thuật:** Android dùng foreground service (thông báo cố định "Đang ghi lộ trình"), không dừng khi vuốt tắt app; iOS ghi liên tục khi app ở nền, khi app bị tắt hẳn chỉ còn cập nhật theo thay đổi vị trí đáng kể (~500m, giới hạn của iOS). Tài xế phải cấp quyền vị trí "Luôn cho phép"; app hướng dẫn tắt tối ưu pin trên Android.

## Xác nhận giả định implementation *(2026-09-23)*

- **A2 (trùng lịch):** lưu chuyến trùng/gần trùng lịch **bắt buộc nhập lý do** — giữ như đã làm.
- **A6 (bảng lương):** thưởng lấy từ chuyến hoàn thành trong kỳ; lương cố định theo mốc hiệu lực ngày cuối kỳ — **đúng**.

## D-017 — Push notification qua FCM *(2026-09-24)*

- **Quyết định:** làm luôn push notification bằng **Firebase Cloud Messaging** cho App Tài xế và App Merchant (không chờ sau phase 1). Notification vẫn lưu DB như cũ (hộp thư trong app/web); push là kênh báo thêm.
- **Hệ quả kỹ thuật:** bảng `device_tokens` (tài xế / tài khoản nhân viên, nhiều máy); API gửi qua `firebase-admin` bằng service account project `bac-tai-app` (biến `FIREBASE_SERVICE_ACCOUNT`), thiếu cấu hình thì tự bỏ qua push. App cấu hình Firebase qua `--dart-define`; iOS cần APNs key upload lên Firebase + capability Push Notifications. Web Merchant giữ polling.

## D-018 — Triển khai AWS không dùng Docker; test thiết bị do chủ dự án tự làm *(2026-09-24)*

- **Quyết định:** production AWS (D-015) chủ dự án tự setup, **không cần Dockerfile/IaC**. Kiểm thử trên thiết bị thật (GPS nền, push, POD) chủ dự án tự làm.
