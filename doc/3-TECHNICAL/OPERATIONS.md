# OPERATIONS — Vận hành, backup, triển khai

> Ngày lập: 2026-09-23 · Phạm vi: HARD-004 (backup/restore, index, dữ liệu vận hành) + checklist go-live.
> Production chạy trên **AWS** (D-015).

## 1. Thành phần chạy production

| Thành phần | Cách chạy | Ghi chú |
|---|---|---|
| API | `node apps/api/dist/main.js` (build: `npm run build -w @bta/api`) | Cổng `PORT`; `AUTH_DEV_BYPASS` **phải = false** (API từ chối khởi động nếu bật ở production). |
| Web Merchant / Web Khách hàng | Static files `apps/web/dist`, `apps/customer-web/dist` sau Nginx | Nginx proxy `/graphql`, `/uploads/`, `/files/`, `/driver/`, `/customer/`, `/health` → API. **Không** proxy prefix `/driver` trần (trùng route web `/drivers`). |
| PostgreSQL | Managed hoặc cài trên VPS | Migration: `npx prisma migrate deploy` (packages/db). |
| Object storage | S3/R2 (`STORAGE_DRIVER=s3`) | Dev dùng `local`. Bucket bật versioning nếu chi phí cho phép. |
| Chromium (PDF) | `npx playwright install chromium` hoặc `CHROMIUM_PATH` | Dùng cho bảng kê công nợ, mẫu in. |
| Job định kỳ | Chạy trong tiến trình API (D-010) | Cảnh báo COD/quá hạn 30 phút/lần, dọn GPS hằng ngày. Nhiều instance API → chỉ bật `SCHEDULER_ENABLED=true` ở 1 instance. |

Biến môi trường: `apps/api/.env.example`. Secret (`DRIVER_JWT_SECRET`, `CUSTOMER_JWT_SECRET`, `STORAGE_SIGNING_SECRET`, S3 key) sinh ngẫu nhiên ≥ 32 ký tự, không commit.

## 1b. Kiến trúc AWS đề xuất (D-015)

| Dịch vụ AWS | Dùng cho | Ghi chú |
|---|---|---|
| RDS PostgreSQL 16 (Multi-AZ khi có tải thật) | Database | Bật automated backup 14 ngày + snapshot trước migrate. |
| EC2 (1 máy t3.medium giai đoạn đầu) hoặc ECS Fargate | API (Node 20) + Nginx | API cần Chromium cho PDF → image/AMI có Chromium hoặc `CHROMIUM_PATH`. |
| S3 + CloudFront | Web Merchant, Web Khách hàng (static) | Build `apps/web/dist`, `apps/customer-web/dist`. |
| S3 (bucket riêng, private) | Chứng từ, POD, PDF, file export | `STORAGE_DRIVER=s3`, bật versioning; CORS cho phép `PUT` từ domain web + app. |
| SNS (SMS) | OTP Web Khách hàng (D-013b) | `SMS_DRIVER=sns`. Cần: thoát SMS sandbox, đăng ký Sender ID tại Việt Nam, đặt spend limit hằng tháng. |
| Secrets Manager / SSM Parameter Store | JWT/OTP/storage secret, DATABASE_URL | Không để secret trong image. |
| CloudWatch | Log API (`x-request-id`), alarm `/health` | |
| ACM + Route 53 | HTTPS, domain | |

IAM role của API: `s3:PutObject/GetObject/HeadObject` trên bucket chứng từ, `sns:Publish` (SMS). Không cấp quyền rộng hơn.

## 2. Backup & restore

### Backup

- **PostgreSQL:** `pg_dump -Fc -d "$DATABASE_URL" -f bta-$(date +%F).dump` mỗi ngày (cron 02:00), giữ 14 bản ngày + 8 bản tuần + 12 bản tháng; copy ra storage khác vùng.
- **Object storage:** bật versioning/lifecycle ở S3/R2; file chứng từ không bị xóa cứng (attachment chỉ đổi status `DELETED`).
- **Trước mỗi lần migrate production:** backup thủ công và ghi mã bản dump vào log triển khai.

### Restore (diễn tập mỗi quý)

1. Tạo DB trống: `createdb bta_restore`.
2. `pg_restore -d bta_restore --no-owner bta-YYYY-MM-DD.dump`.
3. Trỏ một API staging tới `bta_restore`, chạy `npx prisma migrate status` (phải "up to date").
4. Kiểm: đăng nhập, mở 1 đơn có POD (file tải được), số công nợ 1 khách khớp báo cáo trước sự cố.
5. Ghi thời gian khôi phục thực tế (RTO) vào log diễn tập.

## 3. Dữ liệu tăng nhanh

| Bảng | Tăng theo | Chính sách |
|---|---|---|
| `trip_locations` | GPS 15–30s/chuyến đang chạy | Giữ `gpsRetentionDays` (mặc định 180, cài đặt WM-SET-01); job dọn hằng ngày. Vị trí cuối lưu ở `trips.lastLat/lastLng`. |
| `activity_logs`, `status_histories` | Mọi thao tác | Giữ vĩnh viễn (audit). Khi > 20 triệu dòng: partition theo tháng. |
| `notifications` | Sự kiện | Có thể xóa bản đã đọc > 180 ngày (chưa tự động). |
| `idempotency_keys` | Mutation app offline | Có thể xóa > 30 ngày (chưa tự động). |

Index composite theo `merchantId` + cột lọc chính đã khai trong `packages/db/prisma/schema.prisma` (theo ARCHITECTURE §26.2).

## 4. Checklist go-live

- [ ] AWS (D-015): RDS, S3 chứng từ + CORS, CloudFront web, SNS SMS (thoát sandbox, Sender ID), domain + HTTPS (ACM).
- [ ] `AUTH_DEV_BYPASS=false`, secret production, `API_PUBLIC_URL` đúng domain.
- [ ] Firebase: thêm domain web production vào Authorized domains (Web Merchant Google login).
- [ ] Chromium cài trên server (xuất PDF bảng kê).
- [ ] Secret production: `USER_JWT_SECRET`, `OTP_SECRET` (cùng các secret khác).
- [ ] Backup tự động chạy + diễn tập restore lần đầu.
- [ ] Tạo merchant thật + admin (self-service `/onboarding/merchant` hoặc seed riêng); **không** chạy seed demo trên production.
- [ ] App tài xế: build release với `API_URL` production; tắt cleartext HTTP; kiểm GPS nền trên máy Android (Xiaomi/Oppo) + iPhone thật (D-016).
- [ ] Theo dõi log `x-request-id`; cảnh báo khi `/health` trả `degraded`.
