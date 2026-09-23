# DA-AUTH-03 — Quên mật khẩu

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Đăng nhập |
| Route | `DriverForgotPasswordRoute` |
| Pattern | `auth` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-AUTH-03.html](../../mockups/DA-AUTH-03.html) · canvas artboard `DA-AUTH-03.dc.html` |

## Mục đích

Khôi phục mật khẩu qua SĐT + mã xác thực; hoặc nhờ nhà xe đặt lại.

## Dữ liệu hiển thị

- `phone`
- `otp`
- `newPassword`
- `resendCountdown`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Xác nhận & đặt lại mật khẩu | public, OTP hợp lệ |
| Quay lại đăng nhập | public |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quay lại đăng nhập | [DA-AUTH-02](../da/DA-AUTH-02.md) Đăng nhập tài xế | `DriverLoginRoute` | action |
| Quay lại | [DA-AUTH-02](../da/DA-AUTH-02.md) Đăng nhập tài xế | `DriverLoginRoute` | back |
| Đặt lại xong → Đăng nhập | [DA-AUTH-02](../da/DA-AUTH-02.md) Đăng nhập tài xế | `DriverLoginRoute` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-AUTH-02](../da/DA-AUTH-02.md) Đăng nhập tài xế | Quên mật khẩu |

## Components (design system)

`Stepper`, `FormField`, `TextField`, `Banner`, `MobileHeader`, `PrimaryBottomAction`, `Button`

## API (GraphQL)

- `requestDriverPasswordReset(phone)`
- `verifyDriverOtp(phone, code)`
- `resetDriverPassword(token, newPassword) — chờ chốt auth`

## Trạng thái UI

- **error**: Mã sai/hết hạn → lỗi inline dưới ô mã
- **loading**: Nút primary loading
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **offline**: Banner nhỏ + SyncStatus; thao tác được xếp hàng đợi, không mất dữ liệu.

## Ghi chú implement

- Stepper 3 bước: SĐT → mã → mật khẩu mới. Nếu chốt OTP-only thì màn này không cần (chỉ còn 'liên hệ nhà xe').
- OTP input 6 ô, tự nhảy ô, dán được.
