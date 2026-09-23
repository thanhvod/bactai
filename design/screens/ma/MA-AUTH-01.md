# MA-AUTH-01 — Đăng nhập

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Đăng nhập |
| Route | `MerchantLoginRoute` |
| Pattern | `auth` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-AUTH-01.html](../../mockups/MA-AUTH-01.html) · canvas artboard `MA-AUTH-01.dc.html` |

## Mục đích

Đăng nhập App Merchant bằng Google (Firebase Auth) giống Web Merchant; chỉ user đã là thành viên merchant mới vào được.

## Dữ liệu hiển thị

- `me.user`
- `me.memberships[]`
- `me.permissions[]`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đăng nhập bằng Google | public |
| Sau login: 1 merchant → MerchantHomeRoute; nhiều merchant → chọn nhà xe | session |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Đăng nhập Google thành công → Tổng quan | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [MA-PROFILE-01](../ma/MA-PROFILE-01.md) Tài khoản & cài đặt nhẹ | Đăng xuất |

## Components (design system)

`GoogleSignInButton`, `Logo`

## API (GraphQL)

- `Firebase Google Sign-In (google_sign_in + firebase_auth)`
- `me`

## Trạng thái UI

- **loading**: Nút Google disabled + spinner trong nút
- **error**: Banner danger 'Không đăng nhập được' (tài khoản chưa thuộc nhà xe / huỷ đăng nhập / mất mạng)
- **offline**: Banner 'Không có kết nối' — không cho bấm đăng nhập
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Không có form email/mật khẩu (D-006).
- Lưu session bằng flutter_secure_storage; token refresh tự động.
- Banner lỗi (state error) hiện phía trên nút Google: 'Tài khoản … chưa thuộc nhà xe nào. Liên hệ admin để được mời.'
