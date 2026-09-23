# MA-PROFILE-01 — Tài khoản & cài đặt nhẹ

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Merchant (phase 2) — Flutter (apps/merchant-app, phase 2) |
| Module | Báo cáo & tài khoản |
| Route | `MerchantProfileRoute` |
| Pattern | `page` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/MA-PROFILE-01.html](../../mockups/MA-PROFILE-01.html) · canvas artboard `MA-PROFILE-01.dc.html` |

## Mục đích

Hồ sơ, nhà xe đang dùng, đổi nhà xe, thông báo đẩy, đăng xuất.

## Dữ liệu hiển thị

- `user{name, email, avatar}`
- `currentMembership{merchant, role}`
- `memberships[]`
- `pushEnabled`
- `appVersion`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Đổi nhà xe | selectMerchant — bottom sheet danh sách nhà xe |
| Đăng xuất | session |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Mở thông báo | [MA-NOTI-01](../ma/MA-NOTI-01.md) Thông báo | `MerchantNotificationsRoute` | action |
| Mở Web Merchant | WM-DASH-01 | | action |
| Đăng xuất | [MA-AUTH-01](../ma/MA-AUTH-01.md) Đăng nhập | `MerchantLoginRoute` | action |
| Bottom nav: Tổng quan | [MA-HOME-01](../ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | nav |
| Bottom nav: Đơn/Chuyến | [MA-ORD-01](../ma/MA-ORD-01.md) Danh sách đơn | `MerchantOrderListRoute` | nav |
| Bottom nav: Tài chính | [MA-FIN-01](../ma/MA-FIN-01.md) Tài chính nhanh | `MerchantFinanceRoute` | nav |
| Bottom nav: Báo cáo | [MA-RPT-01](../ma/MA-RPT-01.md) Báo cáo tóm tắt | `MerchantReportsRoute` | nav |
| Bottom nav: Tài khoản | [MA-PROFILE-01](../ma/MA-PROFILE-01.md) Tài khoản & cài đặt nhẹ | `MerchantProfileRoute` | nav |

## Điều hướng đến (incoming)

- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.

## Components (design system)

`MobileHeader`, `StatusBadge`, `ListRow`, `Switch`, `BottomNav`

## API (GraphQL)

- `me`
- `selectMerchant(merchantId)`
- `updateNotificationPreference(input)`

## Trạng thái UI

- **loading**: Skeleton
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Đổi nhà xe reset toàn bộ cache/bloc và về MerchantHomeRoute.
- Đăng xuất: xoá token + FCM token, về MerchantLoginRoute.
