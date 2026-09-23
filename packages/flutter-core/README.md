# bta_flutter_core

Lõi kỹ thuật cho app Flutter BTA (không UI). Contract API giả định — đối chiếu `apps/api` khi API xong:

| Thành phần | Endpoint |
|---|---|
| `DriverAuthApi` | `POST /driver/auth/login {phone,password}` → `{accessToken, refreshToken, expiresIn, driver{id,code,name,phone,merchantId,merchantName,mustChangePassword}}`; `/driver/auth/refresh`, `/driver/auth/logout`, `/driver/auth/change-password` |
| `GraphqlClientFactory` | `POST /graphql`, `Authorization: Bearer <accessToken>`, tự refresh 1 lần khi 401/UNAUTHENTICATED; Money = int, DateTime = ISO |
| `UploadApi` | `POST /uploads/presign` → PUT bytes → `POST /uploads/confirm` |
| `GpsApi` | `POST /driver/gps/batch {clientRequestId, tripId, points[]}` |
| `OfflineQueue` | sqflite: TRIP_STATUS / STOP_STATUS / COD / UPLOAD / GPS_BATCH / INCIDENT, replay theo capturedAt, mỗi payload có `clientRequestId` |
| `ConnectivityWatcher` | connectivity_plus → stream online/offline |

`ApiConfig.fromEnvironment()` đọc `--dart-define=API_URL=http://<lan-ip>:2001` (mặc định Android emulator 10.0.2.2, iOS localhost).

```bash
flutter analyze && flutter test
```
