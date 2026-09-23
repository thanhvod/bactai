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
