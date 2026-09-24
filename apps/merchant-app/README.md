# App Merchant (Flutter, phase 2 — MA-*)

App mobile rút gọn cho chủ nhà xe / operation / kế toán. Dùng `bta_flutter_ui` (token + widget) và `bta_flutter_core` (ApiConfig, lưu trữ an toàn, ApiException).

## Chạy

```bash
flutter run --dart-define=API_URL=http://<lan-ip>:2001 --dart-define=WEB_URL=http://<lan-ip>:2002
```

- **Đăng nhập (D-014): số điện thoại + mật khẩu** qua `POST /merchant/auth/login` → token `usr.<jwt>` + refresh token (lưu secure storage). Gặp `UNAUTHENTICATED` → tự gọi `/merchant/auth/refresh` 1 lần rồi gửi lại; refresh bị từ chối → về màn đăng nhập.
- Mật khẩu do admin cấp ở Web Merchant (Cài đặt → Nhân viên → "Cấp / đặt lại mật khẩu app", mật khẩu tạm) hoặc nhân viên tự đặt ở menu tài khoản trên web. Mật khẩu tạm → app bắt đổi mật khẩu trước khi vào. Đổi mật khẩu thêm ở Tài khoản.
- Seed dev: `0911000001` (admin), `0911000002` (operation), `0911000003` (kế toán), mật khẩu `Nhanvien123`.
- Đã bỏ đăng nhập dev bằng email và đường Google/Firebase (không còn phụ thuộc `firebase_*`, `google_sign_in`). OTP làm sau.
- Sau đăng nhập gọi `me`: 0 nhà xe → báo chờ mời; 1 nhà xe → vào thẳng; nhiều → chọn nhà xe. `merchantId` lưu secure storage, gửi header `x-merchant-id`.

## Cấu trúc

```
lib/core/api/merchant_graphql_client.dart   # POST /graphql, Bearer + x-merchant-id, lỗi → ApiException(code)
lib/core/auth/                              # AuthController (phiên SĐT + mật khẩu, refresh), session store, MerchantAuthApi (REST /merchant/auth/*)
lib/core/router/                            # go_router: redirect theo phiên + 5 tab (route name theo design/spec/routes.mobile.dart)
lib/core/permissions.dart                   # key quyền giống @bta/shared + luật đổi trạng thái cần lý do
lib/data/                                   # MerchantRepository (interface) + GraphqlMerchantRepository
lib/models/models.dart                      # parse JSON (Money = int VND)
lib/features/<màn>/                         # MA-HOME/NOTI/ORD/TRIP/MAP/CUS/FIN/COD/PAYROLL/RPT/PROFILE
```

Quyền chỉ ẩn/disable ở app; backend là nơi enforce (tạo đơn `order.create`, đổi trạng thái `trip.status.update`, hủy `trip.cancel`, lùi `status.reverse`, duyệt/trả về lương `payroll.approve`/`payroll.return`, ghi nhận nộp COD `cod.remittance.record`).

## Test

```bash
flutter analyze
flutter test                                              # unit + widget (repository mock)
API_E2E=1 flutter test test/api_integration_test.dart     # đọc dữ liệu thật từ API localhost:2001 (không ghi DB)
```

## Push notification FCM (D-017)

Không dùng `google-services.json` / `GoogleService-Info.plist`: Firebase khởi tạo từ `--dart-define`. Thiếu cấu hình → push tắt êm (log `[push] Tắt push FCM — thiếu cấu hình: ...`), app vẫn chạy.

| dart-define | Giá trị |
|---|---|
| `FIREBASE_API_KEY` | API key app Android/iOS trong Firebase console (Project settings → Your apps) |
| `FIREBASE_APP_ID_ANDROID` | App ID Android, dạng `1:208916047118:android:...` |
| `FIREBASE_APP_ID_IOS` | App ID iOS, dạng `1:208916047118:ios:...` |
| `FIREBASE_MESSAGING_SENDER_ID` | `208916047118` (mặc định) |
| `FIREBASE_PROJECT_ID` | `bac-tai-app` (mặc định) |
| `FIREBASE_IOS_BUNDLE_ID` | `vn.bta.merchantApp` |

Ví dụ:

```bash
flutter run --dart-define=API_URL=http://<ip-máy>:2001 \
  --dart-define=FIREBASE_API_KEY=... --dart-define=FIREBASE_APP_ID_ANDROID=1:208916047118:android:... \
  --dart-define=FIREBASE_APP_ID_IOS=1:208916047118:ios:... --dart-define=FIREBASE_IOS_BUNDLE_ID=vn.bta.merchantApp
```

**Setup Firebase console (project `bac-tai-app`, làm 1 lần):**
1. Project settings → Your apps → Add app **Android**, package name `vn.bta.merchant_app` → lấy App ID + API key (bỏ qua bước tải google-services.json).
2. Add app **iOS**, bundle id `vn.bta.merchantApp` → lấy App ID.
3. iOS: Apple Developer → Keys → tạo **APNs Auth Key (.p8)** → Firebase → Cloud Messaging → Apple app configuration → upload key (Key ID, Team ID). Trong Xcode bật capability **Push Notifications** cho target Runner (`UIBackgroundModes: remote-notification` đã có trong Info.plist).
4. API: đặt `FIREBASE_SERVICE_ACCOUNT` (service account JSON của project) trong `apps/api/.env` để server gửi được push.

**Hành vi:** sau đăng nhập app xin quyền thông báo (Android 13+ / iOS), lấy FCM token và gọi `registerPushToken`; token đổi thì đăng ký lại; đăng xuất gọi `unregisterPushToken` trước khi xóa phiên. Android dùng channel `bta_default` (importance high), icon `@drawable/ic_stat_notify`; khi app đang mở, Android hiện local notification, iOS hiện banner hệ thống. Bấm thông báo: TRIP/ORDER/PAYROLL/CUSTOMER → màn chi tiết; COD tài xế → màn COD; sự cố, booking, khác → Thông báo. Push thuộc nhà xe khác mà người dùng là thành viên → tự đổi nhà xe trước. Push khi app đang mở → Tổng quan + Thông báo tải lại.

**Test push nhanh:** chạy app (debug), đăng nhập, xem log dòng `[push] Đã đăng ký FCM token: <token>` → Firebase console → Messaging → **Send test message** → dán token. Hoặc tạo sự kiện thật (web giao chuyến / gửi duyệt bảng lương) để API gửi push có `data` điều hướng.
