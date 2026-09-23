# DA-AUTH-02 — Đăng nhập tài xế

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Đăng nhập |
| Route | `DriverLoginRoute` |
| Pattern | `auth` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-AUTH-02.html](../../mockups/DA-AUTH-02.html) · canvas artboard `DA-AUTH-02.dc.html` |

## Mục đích

Tài xế đăng nhập bằng tài khoản do nhà xe cấp (SĐT + mật khẩu hoặc OTP).

## Dữ liệu hiển thị

- `phone`
- `password | otp`
- `rememberDevice`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đăng nhập | driver account active |
| Quên mật khẩu | public |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Quên mật khẩu | [DA-AUTH-03](../da/DA-AUTH-03.md) Quên mật khẩu | `DriverForgotPasswordRoute` | action |
| Đăng nhập thành công → Trang chủ | [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | `DriverHomeRoute` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [DA-AUTH-01](../da/DA-AUTH-01.md) Splash/kiểm tra phiên | Tự động: chưa đăng nhập / phiên hết hạn → Đăng nhập |
| [DA-AUTH-03](../da/DA-AUTH-03.md) Quên mật khẩu | Quay lại đăng nhập |
| [DA-AUTH-03](../da/DA-AUTH-03.md) Quên mật khẩu | Quay lại |
| [DA-AUTH-03](../da/DA-AUTH-03.md) Quên mật khẩu | Đặt lại xong → Đăng nhập |
| [DA-PROFILE-01](../da/DA-PROFILE-01.md) Hồ sơ cá nhân | Đăng xuất → Đăng nhập |

## Components (design system)

`Logo`, `SegmentedControl`, `TextField`, `FormField`, `Checkbox`, `Banner`, `PrimaryBottomAction`, `Button`

## API (GraphQL)

- `driverLogin(phone, password) | requestDriverOtp(phone) + verifyDriverOtp(phone, code) — chờ chốt auth`
- `driverMe`

## Trạng thái UI

- **validation**: SĐT sai định dạng → lỗi inline dưới field
- **error**: Sai mật khẩu / tài khoản bị khóa → Banner danger, không nói rõ trường nào sai
- **loading**: Nút Đăng nhập loading, disable form
- **offline**: Banner 'Cần có mạng để đăng nhập lần đầu'
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- PENDING DECISION: phương thức đăng nhập tài xế (mật khẩu hay OTP) chưa chốt — 04-handoff-readiness-review 'Cần chốt driver auth'. UI giữ tab Mật khẩu | Mã OTP; bỏ tab không dùng khi chốt.
- Web Merchant dùng Google login (D-006) — không áp dụng cho tài xế.
- Tài khoản tạo/reset từ WM-DRV-02 (createOrResetDriverAccount).
