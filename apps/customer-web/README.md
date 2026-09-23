# @bta/customer-web — Web Khách hàng (phase 3, CW-*)

React + Vite 6 + Tailwind, dùng `@bta/shadcn` và `@bta/shared` (alias tới source). Port **2003**, proxy `/graphql`, `/customer`, `/files`, `/uploads` → API (`VITE_API_URL`, mặc định `http://localhost:2001`).

```bash
npm run dev -w @bta/customer-web       # http://localhost:2003
npm run codegen -w @bta/customer-web   # khi apps/api/schema.gql đổi
npm run build -w @bta/customer-web
npm test -w @bta/customer-web
```

- Auth (D-013b): đăng nhập/đăng ký bằng **SĐT + OTP SMS**, không mật khẩu, không đặt lại qua email. REST `POST /customer/auth/otp/request {phone}` → `POST /customer/auth/otp/verify {phone, code}` (SĐT mới tự tạo tài khoản; `profileIncomplete` → màn bổ sung họ tên), `refresh`, `logout`. Token `cus.…` lưu localStorage (`src/lib/session.ts`); `src/lib/apollo.ts` tự refresh 1 lần khi `UNAUTHENTICATED`.
- Dev: API chạy `SMS_DRIVER=log` trả `devCode` — màn nhập mã hiện "Mã dev: xxxxxx" khi chạy `vite` dev (không hiện ở bản build). Mã cũng in trong log API.
- Hồ sơ: SĐT là định danh (chỉ đọc); email tùy chọn.
- Operations GraphQL: `src/graphql/operations.ts` (typed qua `src/gql`).
- Màn hình: `src/features/*` theo spec `design/screens/cw/CW-*.md`; route ở `src/app/routes.ts` (khớp `design/spec/routes.web.ts`).
- Khám phá (`/`) và hồ sơ nhà xe xem được khi chưa đăng nhập; gửi yêu cầu → `/login?returnUrl=`.
