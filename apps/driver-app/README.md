# App Tài xế (driver_app)

Flutter, clean architecture (`lib/features/<feature>/{data,domain,presentation}`), state = Cubit (flutter_bloc), router = go_router (route name khớp `design/spec/routes.mobile.dart`).

## Chạy

```bash
# API thật (mặc định). Emulator Android: 10.0.2.2; máy thật: IP LAN của máy chạy API
flutter run --dart-define=API_URL=http://10.0.2.2:2001
# Dữ liệu mẫu, không cần API
flutter run --dart-define=USE_MOCK=true
```

Tài xế seed: `0900000001` / `0900000002`, mật khẩu `Taixe123`. Đăng nhập SĐT + mật khẩu do nhà xe cấp (D-009); quên mật khẩu = liên hệ nhà xe reset.

Máy thật dùng HTTP trong LAN: thêm IP LAN vào `android/app/src/main/res/xml/network_security_config.xml` (dev); production dùng HTTPS.

## Màn hình (DA-*)

| Màn | File |
|---|---|
| DA-AUTH-01/02/03 | `features/auth/presentation/pages/*` |
| DA-HOME-01, DA-JOB-01, DA-JOB-02 | `features/jobs/presentation/pages/{home,job_list,job_calendar}_page.dart` |
| DA-TRIP-01, DA-STOP-01/02 | `features/field/presentation/pages/{trip_detail,stop_list,stop_detail}_page.dart` |
| DA-STATUS-01/02 | `features/field/presentation/pages/status_pages.dart` |
| DA-COD-01 | `features/field/presentation/pages/cod_input_page.dart` |
| DA-POD-01, DA-ATT-01, DA-INC-01 | `features/field/presentation/pages/upload_pages.dart` |
| DA-GPS-01 | `features/gps/presentation/pages/gps_page.dart` |
| DA-SYNC-01 | `features/sync/presentation/pages/sync_page.dart` |
| DA-NOTI-01 | `features/notifications/presentation/pages/notifications_page.dart` |
| DA-MONEY-01 | `features/money/presentation/pages/money_page.dart` |
| DA-HIST-01 | `features/history/presentation/pages/history_page.dart` |
| DA-PROFILE-01 | `features/profile/presentation/pages/*` |

## Offline

- Mọi thao tác hiện trường đi qua `FieldRepository` (`features/field/data/field_repository.dart`): online gọi API ngay; **lỗi mạng** → xếp vào `OfflineQueue` (sqflite) với `clientRequestId`, UI cập nhật lạc quan + chip "Chờ đồng bộ". Lỗi nghiệp vụ (thiếu quyền, thiếu lý do) hiện ngay, không xếp hàng.
- `clientRequestId` = `idempotencyKey` backend → gửi lại không ghi trùng. Trạng thái/điểm dừng gửi kèm `actualAt` = lúc bấm.
- `SyncCubit` tự replay khi có mạng lại, mỗi phút một lần nếu còn mục chờ, và khi app về foreground. Mục lỗi nghiệp vụ ở DA-SYNC-01 để thử lại hoặc bỏ.
- Chuyến/danh sách đã tải được cache (`shared_preferences`) để mở khi mất mạng.
- Ảnh POD/chứng từ được chép vào thư mục app (`pending_uploads/`) trước khi upload nên không mất khi offline.
- Sự cố báo lúc offline: ảnh được gửi vào chứng từ của **chuyến** (category INCIDENT_PHOTO), sự cố gửi không kèm ảnh.

## GPS chạy nền (D-016)

Ghi vị trí khi có chuyến đang chạy — **kể cả khi app ở nền hoặc bị vuốt tắt** — tự dừng khi hết chuyến.

**Kiến trúc** (`lib/core/gps/`):

| File | Vai trò |
|---|---|
| `gps_tracker_engine.dart` | Lõi thuần Dart: nhận điểm → bộ đệm bền vững → gom lô 30s / 20 điểm → `POST /driver/gps/batch` với `clientRequestId` cố định theo lô (gửi lại không trùng). Mất mạng giữ lại; hết phiên giữ lại; lỗi nghiệp vụ (chuyến đóng > 6h) bỏ lô. 5 phút hỏi `driverJobs(bucket: RUNNING)`: hết chuyến → gửi nốt rồi dừng; offline → giữ nguyên. |
| `gps_buffer.dart` | Bộ đệm sqflite riêng (`bta_gps_buffer.db`) — sống sót khi service/app bị hệ điều hành dừng. |
| `http_gps_clients.dart` | HTTP cho tiến trình nền: token đọc lại từ secure storage mỗi lần, 401 → refresh; nếu UI đã xoay vòng refresh token thì dùng phiên mới (không đăng xuất nhầm). |
| `tracking_store.dart` | SharedPreferences dùng chung UI ↔ nền: chuyến đang ghi, lần gửi cuối, số điểm chờ, lỗi. |
| `background_gps_controller.dart` | Android: `flutter_background_service` (foreground service, isolate riêng). iOS: engine trong tiến trình app + significant-location-change (native `AppDelegate.swift`). |

UI (`GpsCubit`) chỉ bật/tắt dịch vụ theo trạng thái chuyến (Home, chi tiết chuyến, cập nhật trạng thái) và đọc tình trạng; màn DA-GPS-01 hướng dẫn cấp quyền.

**Hành vi thực tế**

- **Android:** foreground service `foregroundServiceType="location"`, `stopWithTask=false` → vuốt tắt app vẫn ghi; thông báo cố định "BTA · Đang ghi lộ trình chuyến CX-…" (nội dung: giờ gửi cuối, số điểm chờ mạng). Khởi động lại máy khi còn chuyến → service tự bật (BootReceiver của plugin), server báo hết chuyến thì tự tắt. Dừng khi: tài xế bấm "Buộc dừng", hoặc ROM hãng (Xiaomi/Oppo/Vivo/Realme…) diệt nền — app hướng dẫn tắt tối ưu pin và bật "Tự khởi động".
- **iOS:** app ở nền (khóa màn hình, mở app khác) → ghi liên tục (background location mode, chỉ báo xanh trên thanh trạng thái). App bị vuốt tắt hẳn → iOS chỉ đánh thức app khi **thay đổi vị trí đáng kể (~500m, vài phút/lần)**; khi được đánh thức, `main()` chạy lại và `GpsCubit.resume()` ghi tiếp. Đây là giới hạn của iOS, không khắc phục được bằng code.
- Cần quyền **"Luôn cho phép"**: app xin "Khi dùng app" trước, giải thích rồi mới xin "Luôn luôn" (Android 11+ chuyển sang trang Cài đặt). Chỉ có "Khi dùng app" thì vẫn ghi khi app mở/nền ngắn.

**Quyền đã khai báo**

- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`, `POST_NOTIFICATIONS` (Android 13+), `WAKE_LOCK`, `RECEIVE_BOOT_COMPLETED`, `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`.
- iOS (`Info.plist`): `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`, `NSLocationAlwaysUsageDescription`, `UIBackgroundModes: location, fetch`; `Podfile` bật macro `PERMISSION_LOCATION` cho permission_handler.
- Lưu ý Google Play: dùng `ACCESS_BACKGROUND_LOCATION` phải khai báo mục đích (Declaration form) + video minh họa; App Store: giải thích dùng vị trí nền trong ghi chú review.

**Test trên máy thật**

1. `flutter run --release --dart-define=API_URL=http://<ip-máy-chạy-API>:2001` (thêm IP vào `android/app/src/main/res/xml/network_security_config.xml` khi dev HTTP).
2. Đăng nhập tài xế `0900000001` / `Taixe123`, vào Tài khoản → Ghi lộ trình: cấp "Luôn cho phép", bật thông báo, tắt tối ưu pin.
3. Chuyển một chuyến sang "Đang đến điểm lấy" → Android hiện thông báo "Đang ghi lộ trình". Vuốt tắt app, đi bộ/chạy xe ≥ 5 phút.
4. Web Merchant → Điều phối → Bản đồ (`/dispatch/map`) hoặc chi tiết chuyến tab GPS: điểm vẫn cập nhật khi app đã tắt.
5. Tắt mạng 2–3 phút rồi bật lại: điểm bị trễ được gửi bù (không trùng). Hoàn thành chuyến → thông báo biến mất trong ≤ 5 phút (hoặc ngay khi hoàn thành trên app).
6. iPhone: lặp lại, để app ở nền → điểm dày; vuốt tắt hẳn → điểm thưa theo ~500m.

## Test

```bash
flutter analyze && flutter test
# Smoke test với API thật (chỉ đọc)
API_URL=http://localhost:2001 flutter test test/integration/api_smoke_test.dart
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
| `FIREBASE_IOS_BUNDLE_ID` | `vn.bta.driverApp` |

Ví dụ:

```bash
flutter run --dart-define=API_URL=http://<ip-máy>:2001 \
  --dart-define=FIREBASE_API_KEY=... --dart-define=FIREBASE_APP_ID_ANDROID=1:208916047118:android:... \
  --dart-define=FIREBASE_APP_ID_IOS=1:208916047118:ios:... --dart-define=FIREBASE_IOS_BUNDLE_ID=vn.bta.driverApp
```

**Setup Firebase console (project `bac-tai-app`, làm 1 lần):**
1. Project settings → Your apps → Add app **Android**, package name `vn.bta.driver_app` → lấy App ID + API key (bỏ qua bước tải google-services.json).
2. Add app **iOS**, bundle id `vn.bta.driverApp` → lấy App ID.
3. iOS: Apple Developer → Keys → tạo **APNs Auth Key (.p8)** → Firebase → Cloud Messaging → Apple app configuration → upload key (Key ID, Team ID). Trong Xcode bật capability **Push Notifications** cho target Runner (`UIBackgroundModes: remote-notification` đã có trong Info.plist).
4. API: đặt `FIREBASE_SERVICE_ACCOUNT` (service account JSON của project) trong `apps/api/.env` để server gửi được push.

**Hành vi:** sau đăng nhập app xin quyền thông báo (Android 13+ / iOS), lấy FCM token và gọi `registerPushToken`; token đổi thì đăng ký lại; đăng xuất gọi `unregisterPushToken` trước khi xóa phiên. Android dùng channel `bta_default` (importance high), icon `@drawable/ic_stat_notify`; khi app đang mở, Android hiện local notification, iOS hiện banner hệ thống. Bấm thông báo: chuyến (TRIP) → chi tiết chuyến; điểm dừng (ORDER_STOP) → điểm dừng; COD tài xế giữ → Thưởng & ứng; còn lại → Thông báo. Push chuyến mới/thay đổi khi app đang mở → tải lại danh sách chuyến + badge.

**Test push nhanh:** chạy app (debug), đăng nhập, xem log dòng `[push] Đã đăng ký FCM token: <token>` → Firebase console → Messaging → **Send test message** → dán token. Hoặc tạo sự kiện thật (web giao chuyến / gửi duyệt bảng lương) để API gửi push có `data` điều hướng.
