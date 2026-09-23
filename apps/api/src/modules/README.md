# API modules — quy ước

Backend là modular monolith NestJS + GraphQL code-first. Mỗi domain một thư mục `src/modules/<domain>/`:

```
<domain>/
  <domain>.types.ts      # @ObjectType / @InputType (GraphQL) — tiền dùng MoneyScalar, enum để String hoặc GqlEnums.X
  <domain>.service.ts    # use-case: validate (zod từ @bta/shared qua parse()), quyền nhạy cảm, transaction, audit
  <domain>.resolver.ts   # mỏng: @RequirePermission + gọi service
  <domain>.controller.ts # chỉ khi cần REST (upload, GPS, auth app)
  <domain>.module.ts
  domain/*.ts            # (tùy) logic thuần không phụ thuộc Nest/Prisma + *.spec.ts
```

Đăng ký module: thêm vào `src/modules/index.ts`. Module mẫu tham khảo: `customers/`.

## Bắt buộc

- **Tenant:** dùng `this.prisma.db` (tenant-guard tự thêm `merchantId` vào where/data). Chỉ dùng `this.prisma.raw` khi cố ý đi xuyên tenant (auth, notify) và tự lọc.
- **Transaction:** `this.prisma.tx(async (tx) => { ... })`; truyền `tx` vào `audit.log(..., tx)`, `audit.statusChange(..., tx)`, `numbering.next(docType, tx)`.
- **Mã chứng từ:** `NumberingService.next('ORDER' | 'TRIP' | ...)`.
- **Audit:** mọi tạo/sửa/hủy/đổi trạng thái/tiền → `AuditService.log` (timeline) và `statusChange` (status history). Sửa nhạy cảm: `category: 'SENSITIVE', sensitive: true, reason, before, after` (dùng `diffFields`).
- **Quyền:** resolver `@RequirePermission('x.y')`; thao tác nhạy cảm trong service: `const r = assertSensitive('order.cancel', reason)` (ném FORBIDDEN / SENSITIVE_REASON_REQUIRED). Danh sách quyền: `@bta/shared` `PERMISSIONS`.
- **Principal:** mặc định resolver chỉ cho USER đã chọn merchant. Tài xế: `@Auth('DRIVER')`; nhiều loại: `@Auth('USER','DRIVER')`; không cần merchant: `@NoMerchant()`; công khai: `@Public()`. Lấy principal: `currentPrincipal()` hoặc `@CurrentPrincipal()`.
- **Tiền:** DB `BigInt`, GraphQL `MoneyScalar` (serialize bigint → number). Công thức tiền **chỉ** qua `FinanceCalcService` / `@bta/shared` finance.ts — không tự cộng trừ lại ở module khác.
- **Lỗi:** `notFound()`, `businessRule(msg)`, `conflict()`, `forbidden()`, `validationError()` từ `common/errors/app-error`.
- **Phân trang:** `PageArgs` + `ConnectionType(X)` + `paginate()` / `pageParams()+toConnection()`.
- **Cảnh báo mềm:** trả `warnings` trong payload, không chặn (trừ khi thiếu quyền override).
- **Idempotency** (mutation từ app offline, payment): `IdempotencyService.run(clientRequestId, action, fn)`.
- **Notification:** `NotifyService.toDriver / toUsersWithPermission / toCustomerAccount`.
- **Không xóa cứng** dữ liệu nghiệp vụ đã phát sinh giao dịch — dùng status CANCELLED/INACTIVE.

## Test

`src/test/helpers.ts`: `gql(USERS.operation, query, vars)`, `gqlOk`, `errorCode`, `driverToken()`, `prisma()`. File `*.e2e.ts` chạy trên DB `bta_test` (migrate + seed ở global-setup). Unit test logic thuần: `*.spec.ts`. Chạy: `npm test -w @bta/api`.

Lưu ý test dùng chung DB đã seed: test tạo dữ liệu riêng của mình, không giả định số lượng tuyệt đối của bảng.

## Ngày (`@db.Date`)

Ghi cột `@db.Date` bằng `toDbDate('YYYY-MM-DD')` / `todayDbDate()` từ `@bta/shared` (UTC 00:00 của ngày lịch VN). Không dùng `new Date('...T00:00+07:00')` — sẽ lệch lùi 1 ngày.

## Create lồng (nested create)

Tenant-guard chỉ tự thêm `merchantId` cho create ở cấp 1. Create lồng (`order.create({ data: { stops: { create: [...] } } })`) phải tự truyền `merchantId` cho từng dòng con.

## Tên type GraphQL

Tên `@ObjectType/@InputType` là toàn cục — đặt tiền tố theo module khi tên dễ trùng (vd. `DriverCodItemView`, `SupplierDebtAgingView`).
