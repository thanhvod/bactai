# IMPLEMENTATION STATUS

> Cập nhật: 2026-09-23 · Nhánh `feat/rebuild-v2` (làm mới toàn bộ theo D-008).
> Đối chiếu backlog `doc/2-PRD/02-implementation-breakdown.md`.

## 1. Tổng quan theo wave

| Wave / Phase | Backend/API | Web | Mobile | Test |
|---|---|---|---|---|
| P0 Quyết định + baseline | D-008 → D-013 ghi trong `doc/1-BRD/01-decisions.md` | — | — | — |
| P1 Foundation (FDN-001..008, WEB-DS, FLT-DS) | ✅ auth 3 loại principal, tenant guard, RBAC + sensitive, numbering, audit/timeline, upload | ✅ design system, shell, auth | ✅ flutter-ui, flutter-core (offline queue) | core.e2e |
| P2 Master data (MD-001..007) | ✅ | ✅ | — | master-data.e2e |
| P3 Order + Dispatch (ORD, DIS) | ✅ | ✅ | — | orders.e2e, dispatch.e2e, Playwright order-flow |
| P4 Driver App (DRV, GPS) | ✅ | ✅ theo dõi vị trí | ✅ App Tài xế đủ DA-* | driver-app.e2e, flutter test |
| P5 Finance (FIN-001..008) | ✅ | ✅ | — | finance.e2e, Playwright thu tiền + phân bổ |
| P6 Payroll/PDF/Reports/Excel | ✅ PDF render Chromium thật | ✅ | — | payroll.e2e, reports.e2e, Playwright duyệt lương |
| P7 Hardening | ✅ scheduler cảnh báo + dọn GPS, CI, OPERATIONS.md | ✅ smoke 40 màn | ✅ | scheduler.e2e, Playwright smoke |
| P8 App Merchant (MA-*) | dùng API chung | — | ✅ đủ MA-* | flutter test |
| P9 Web Khách hàng + Booking (CW-*) | ✅ auth khách, khám phá, booking, đơn/bảng kê của khách | ✅ `apps/customer-web` + màn "Yêu cầu từ khách" ở Web Merchant | — | portal.e2e |

Số test (lần chạy cuối, 2026-09-24): API e2e 99, shared 9, db 37, web 17, customer-web 11, Playwright 12, Flutter: flutter-ui 7, flutter-core 9, driver-app 36, merchant-app 28. Build: API, web, customer-web, APK debug OK.

## 2. Giả định/đề xuất do đội code tự quyết — cần chủ dự án xác nhận

| # | Nội dung | Chỗ áp dụng |
|---|---|---|
| A1 | ~~D-013 email + mật khẩu~~ → **đã chốt D-013b: SĐT + OTP SMS**, không đặt lại mật khẩu qua email | customer-portal |
| A2 | ✅ **Đã xác nhận:** lưu chuyến trùng/gần trùng lịch **phải** nhập lý do (quyền `dispatch.override_warning`, operation mặc định chưa có — admin cấp thêm) | trips |
| A3 | Trạng thái đơn tự tiến theo chuyến (Đã xếp xe → Đang thực hiện → Hoàn thành), không tự lùi; operation vẫn đổi tay được | orders |
| A4 | Hoàn thành điểm trả khi chưa có POD/COD: chỉ cảnh báo trên web; app tài xế chặn nếu thiếu | trips / driver-app |
| A5 | "Đơn cần xử lý" = nháp, chờ xác nhận, đã xác nhận chưa có chuyến, hoặc đơn chưa hủy có cảnh báo | orders + dashboard |
| A6 | ✅ **Đã xác nhận:** thưởng bảng lương lấy từ chuyến **hoàn thành** trong kỳ có `driverBonusAmount > 0`; lương cố định = mốc hiệu lực tại ngày cuối kỳ | payrolls |
| A7 | Chênh lệch sau khi đã chi lương (D-012) nhập tay dòng "Điều chỉnh" ở kỳ sau | payrolls |
| A8 | Báo cáo lãi/lỗ theo xe/tài xế: đơn nhiều xe chia đều theo số chuyến | reports |
| A9 | Công nợ tài xế 2 chiều gồm: COD giữ, tạm ứng chuyến còn lại, ứng lương chưa trừ ↔ chi phí tài xế chi trước chưa hoàn | finance (`packages/shared/src/finance.ts`) |
| A10 | Đơn nháp/chờ xác nhận chưa phát sinh phải thu; đơn hủy doanh thu 0 nhưng giữ chi phí | shared finance |

## 3. Giới hạn đã biết / việc còn lại

- **GPS nền (D-016):** Android foreground service chạy cả khi vuốt tắt app; iOS khi app bị tắt hẳn chỉ cập nhật theo thay đổi vị trí đáng kể (~500m) — giới hạn của iOS.
- **App Merchant (D-014):** đăng nhập SĐT + mật khẩu; OTP làm sau.
- **Push notification (D-017):** FCM cho App Tài xế + App Merchant; Web Merchant/Web Khách hàng vẫn polling. Cần cấu hình Firebase (service account, app id, APNs) mới gửi thật.
- **SMS OTP (AWS SNS):** dev in mã ra log; production cần thoát SNS sandbox + đăng ký Sender ID.
- **Mobile:** các thao tác ghi đã test với API giả + e2e API; kiểm thử thiết bị thật do chủ dự án tự làm (D-018).
- Production AWS (D-015) — xem `OPERATIONS.md` §1b và checklist go-live.
