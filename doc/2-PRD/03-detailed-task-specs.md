# PRD — Detailed Task Specs cho Claude Code

> Nguồn: `01-danh-sach-man-hinh.md`, `02-implementation-breakdown.md`, toàn bộ BRD/TECHNICAL/DESIGN.
> Ngày lập: 2026-09-23
> Mục tiêu: biến master backlog thành task spec đủ chi tiết để Claude Code implement từng phần, gồm user story, chức năng trong màn hình, backend/API/data cần có, acceptance testing và dependency.

## 1. Cách đọc

Tài liệu này đi sâu hơn `02-implementation-breakdown.md`.

- `02-implementation-breakdown.md`: roadmap, phase, dependency, song song.
- `03-detailed-task-specs.md`: task spec chi tiết để giao implement.

Mỗi task bên dưới có:

- **Platform:** backend, web, driver app, merchant app, customer web.
- **Screens:** mã màn hình trong `01-danh-sach-man-hinh.md`.
- **User story:** người dùng nào cần gì, vì sao.
- **Chức năng trong màn hình:** các thành phần UI/action bắt buộc.
- **Backend/API/Data:** dữ liệu/API cần có để màn hình chạy thật.
- **Acceptance tests:** test theo hành vi người dùng, không chỉ test code.
- **Dependencies:** task phải xong trước.
- **Parallelizable:** task có thể làm song song với nhóm nào.

## 2. Quy tắc acceptance testing chung

Áp dụng cho mọi task có UI/API:

- Dữ liệu nghiệp vụ luôn lọc theo `merchant_id` hoặc principal phù hợp.
- Màn hình có loading, empty, error, no-permission state.
- Form tiền dùng VND integer, hiển thị có phân tách hàng nghìn, không dùng float.
- Thao tác nhạy cảm phải kiểm tra permission, bắt nhập lý do, ghi audit.
- Trạng thái đổi thủ công phải ghi status history.
- Không xóa cứng dữ liệu nghiệp vụ; hủy/cancel/reversal thay vì delete nếu đã phát sinh giao dịch.
- Backend/API phải có validation và lỗi trả về đủ rõ để UI hiển thị.
- Nếu task dùng mock data trong UI, phải có adapter rõ để thay bằng API thật.
- Test phải có ít nhất happy path, validation/error path, permission/tenant path nếu task có API.

## 3. P0 — Product/Technical Decisions

### P0-001 — Chốt open decisions phase 1

- **Platform:** Product, backend, mobile, operations.
- **Screens:** Không có màn hình trực tiếp.
- **User story:** Là đội triển khai, tôi cần các quyết định mở được chốt trước khi code để tránh mỗi module tự giả định khác nhau.
- **Chức năng cần chốt:**
  - Driver auth: Firebase hay credential riêng.
  - Background jobs: BullMQ/Redis ngay phase 1 hay abstraction inline trước.
  - Hosting dev/prod: VPS Docker Compose hay managed services.
  - GPS retention: giữ raw GPS bao lâu, có downsample không.
  - Payroll approved: sửa bằng adjustment hay hủy duyệt/tạo lại.
- **Backend/API/Data:**
  - Cập nhật decision log hoặc PRD.
  - Nếu có quyết định ảnh hưởng schema/API, ghi rõ tác động.
- **Acceptance tests:**
  - Mỗi quyết định có trạng thái `chốt`, ngày chốt, hệ quả kỹ thuật.
  - Không còn task nào ghi "chưa chốt" ở phần driver auth, job, GPS retention, payroll edit.
- **Dependencies:** Không.
- **Parallelizable:** P0-002.

### P0-002 — Audit repo và baseline implementation

- **Platform:** All.
- **Screens:** Không có màn hình trực tiếp.
- **User story:** Là dev lead, tôi cần biết codebase đã có gì để không scaffold trùng và không phá thay đổi đang tồn tại.
- **Chức năng cần kiểm tra:**
  - Apps: `apps/api`, `apps/web`, `apps/driver-app`.
  - Packages: `db`, `shared`, `shadcn`, `ui`, Flutter packages.
  - Scripts: dev/build/test/lint/codegen/migration/seed.
  - Các module đã có resolver/page/schema.
- **Backend/API/Data:** Không bắt buộc code mới, chủ yếu audit.
- **Acceptance tests:**
  - Có ghi chú baseline: cái gì đã chạy, cái gì lỗi, cái gì lệch docs.
  - Có danh sách command đã thử và kết quả.
  - Không revert/xóa file ngoài scope.
- **Dependencies:** Không.
- **Parallelizable:** P0-001.

## 4. P1 — Foundation SaaS

### FDN-001 — Monorepo, build scripts và dev environment

- **Platform:** Backend, Web, Driver App, shared packages.
- **Screens:** Không có màn hình end-user; ảnh hưởng toàn bộ.
- **User story:** Là developer, tôi cần workspace chạy ổn định để các team/task phát triển song song.
- **Chức năng cần có:**
  - Command chạy API dev port `2001`.
  - Command chạy Web dev port `2002`.
  - Command build/lint/test cho từng app/package.
  - Docker Compose hoặc hướng dẫn DB/MinIO local nếu đã dùng.
  - Project graph/Nx target rõ.
- **Backend/API/Data:**
  - PostgreSQL local connection config.
  - MinIO/S3 local config placeholder.
  - Env example không chứa secret.
- **Acceptance tests:**
  - Fresh clone hoặc clean install chạy được install/build.
  - `api` start không crash khi thiếu data seed; trả health check.
  - `web` start mở được shell hoặc login page.
  - `driver-app` phân tích/build tối thiểu theo Flutter tooling.
- **Dependencies:** P0-002.
- **Parallelizable:** WEB-DS-001, FLT-DS-001 nếu baseline đã chạy.

### FDN-002 — Shared constants, status và validation base

- **Platform:** Backend, Web, Driver App.
- **Screens:** Dùng gián tiếp trên mọi màn status/badge/form.
- **User story:** Là developer, tôi cần một nguồn sự thật cho status, role, permission, type và helper tiền để không lệch giữa API/web/app.
- **Chức năng cần có:**
  - Constants cho `OrderStatus`, `TripStatus`, `StopStatus`.
  - Constants cho payment, expense, payroll, debt statement, incident.
  - Role: admin, operation, accountant, driver, customer.
  - Sensitive permission keys.
  - Money/date/status label helpers.
  - Zod schema base hoặc validation helpers nếu dùng chung.
- **Backend/API/Data:**
  - API dùng shared constants trong resolver/service.
  - Web/Flutter mapping label/status badge dùng cùng tên/status.
- **Acceptance tests:**
  - Không còn hard-code status string mới trong module được implement.
  - Status label tiếng Việt hiển thị đúng cho order/trip/stop.
  - Permission key dùng thống nhất ở backend guard và UI.
- **Dependencies:** FDN-001.
- **Parallelizable:** WEB-DS-001, FLT-DS-001.

### FDN-003 — Prisma schema foundation

- **Platform:** Backend/API/Database.
- **Screens:** Nền cho Settings, Timeline, Attachment, mọi detail screen.
- **User story:** Là backend dev, tôi cần data model nền để tất cả nghiệp vụ có tenant, audit, mã tự động và chứng từ.
- **Chức năng cần có:**
  - `merchants`, `users`, `roles`, `permissions`, `user_roles`.
  - `number_sequences`.
  - `activity_logs`, `status_histories`.
  - `attachments`.
  - `catalogs` hoặc pattern catalog chung.
  - Seed merchant demo, roles, permissions, catalog defaults.
- **Backend/API/Data:**
  - Prisma schema + migration.
  - Seed script.
  - Index cơ bản cho `merchant_id`, `entity_type/entity_id`.
- **Acceptance tests:**
  - Migration chạy được từ DB trống.
  - Seed tạo đủ merchant demo + admin user mapping placeholder.
  - Tất cả bảng nghiệp vụ nền có `merchant_id` hoặc có lý do rõ nếu không.
  - Soft delete/status field có ở entity cần thiết.
- **Dependencies:** FDN-001, FDN-002.
- **Parallelizable:** WEB-DS-001.

### FDN-004 — Auth, tenant context và tenant guard

- **Platform:** Backend/API, Web Merchant.
- **Screens:** WM-AUTH-01, WM-AUTH-02, WM-AUTH-03, WM-AUTH-04.
- **User story:** Là merchant user, tôi muốn đăng nhập Google và chỉ thấy dữ liệu nhà xe của mình.
- **Chức năng trong màn hình:**
  - Login chỉ có Google button.
  - Loading/error khi Firebase login hoặc API verify fail.
  - Nếu user chưa thuộc merchant: hiển thị chờ mời/tạo merchant nếu được phép.
  - Nếu user có nhiều merchant: màn chọn merchant.
  - User menu hiển thị merchant hiện tại.
- **Backend/API/Data:**
  - Verify Firebase ID token.
  - Mapping Firebase UID/email -> user/merchant role.
  - Request context gồm `merchantId`, `userId`, roles/permissions.
  - Repository/prisma helper enforce tenant.
- **Acceptance tests:**
  - User merchant A không query được customer/order merchant B.
  - Token invalid/expired trả lỗi auth rõ.
  - User chưa mapping merchant không vào dashboard.
  - Switching merchant đổi tenant context.
- **Dependencies:** FDN-003.
- **Parallelizable:** WEB-DS-001.

### FDN-005 — RBAC và sensitive action framework

- **Platform:** Backend, Web Merchant, App Merchant sau này.
- **Screens:** WM-RBAC-01, WM-SHELL-08.
- **User story:** Là admin, tôi muốn kiểm soát ai được thao tác dữ liệu nhạy cảm và mọi override có lý do.
- **Chức năng trong màn hình:**
  - Role matrix theo action.
  - Sensitive action modal có tiêu đề, nội dung thay đổi, cảnh báo, ô lý do.
  - Disable/hide action nếu user không có quyền.
  - No-permission state rõ.
- **Backend/API/Data:**
  - Permission constants và guard/decorator.
  - Required reason validation.
  - Audit log action, actor, reason, before/after.
- **Acceptance tests:**
  - Operation không có quyền sửa giá sau xác nhận thì bị chặn.
  - Admin có quyền sửa nhưng không nhập lý do thì bị reject.
  - Action thành công ghi audit đầy đủ.
  - UI không cho bấm action nếu thiếu quyền.
- **Dependencies:** FDN-004.
- **Parallelizable:** FDN-006, FDN-007.

### FDN-006 — Numbering service

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-SET-02, tất cả màn tạo chứng từ.
- **User story:** Là operation/kế toán, tôi muốn chứng từ có mã tự động để đối chiếu qua Zalo/email/kế toán.
- **Chức năng trong màn hình:**
  - Settings xem format mã theo loại chứng từ.
  - Màn tạo order/trip/payment/expense/payroll/debt statement hiển thị mã sau khi tạo.
  - Không cho user sửa mã trừ khi có permission riêng nếu sau này cần.
- **Backend/API/Data:**
  - `number_sequences` theo merchant + document type + period.
  - Transaction/locking chống trùng mã.
  - Default format: `DH`, `CX`, `PT`, `PC`, `BL`, `CN`.
- **Acceptance tests:**
  - Tạo 10 order đồng thời không trùng mã.
  - Hai merchant tạo order cùng tháng có counter riêng.
  - Mã đúng format `DH-YYYYMM-0001`.
- **Dependencies:** FDN-003.
- **Parallelizable:** FDN-005, FDN-007.

### FDN-007 — Timeline, audit và status history

- **Platform:** Backend, Web Merchant, App Merchant.
- **Screens:** WM-SHELL-07, entity detail tabs/timeline.
- **User story:** Là operation/kế toán/giám đốc, tôi muốn biết ai đã thay đổi gì, khi nào, vì sao.
- **Chức năng trong màn hình:**
  - Timeline drawer/panel theo entity.
  - Filter loại event: status, money change, attachment, note, sensitive action.
  - Hiển thị actor, time, action, reason, before/after summary.
- **Backend/API/Data:**
  - `activity_logs`, `status_histories`.
  - Query timeline by entity.
  - Helpers domain gọi khi create/update/status/sensitive action.
- **Acceptance tests:**
  - Đổi trip status tạo status history.
  - Sửa COD tạo audit có before/after/reason.
  - Timeline của order hiển thị event từ order và optional child trip/stop nếu API hỗ trợ.
- **Dependencies:** FDN-003, FDN-004.
- **Parallelizable:** FDN-006, FDN-008.

### FDN-008 — Attachment upload foundation

- **Platform:** Backend, Web Merchant, Driver App, App Merchant.
- **Screens:** WM-SHELL-06, DA-POD-01, DA-ATT-01.
- **User story:** Là operation/tài xế/kế toán, tôi muốn upload và xem chứng từ đúng entity.
- **Chức năng trong màn hình:**
  - Upload POD, hóa đơn, phiếu xuất kho, biên nhận, ảnh sự cố.
  - Attachment viewer xem ảnh/PDF, metadata, tải xuống.
  - Entity detail hiển thị tab/chip số lượng chứng từ.
- **Backend/API/Data:**
  - Presigned upload URL.
  - Attachment metadata: merchant, entity type/id, file key, mime, size, uploadedBy, category.
  - Permission check khi attach/view.
- **Acceptance tests:**
  - Tài xế upload POD stop A, web thấy đúng stop A.
  - User merchant khác không xem được file metadata.
  - Upload fail hiển thị error và không tạo metadata mồ côi.
- **Dependencies:** FDN-003, FDN-004.
- **Parallelizable:** WEB-DS-002.

## 5. P2 — Master Data Task Specs

### MD-001 — Merchant settings

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-SET-01.
- **User story:** Là admin, tôi muốn cấu hình kỳ lương, ngưỡng cảnh báo lịch, ngưỡng COD và mặc định công nợ để hệ thống cảnh báo đúng cách vận hành của nhà xe.
- **Chức năng trong màn hình:**
  - Form kỳ lương: theo tháng hoặc ngày bắt đầu/kết thúc tùy merchant.
  - Ngưỡng gần overlap lịch, mặc định ví dụ 2 giờ.
  - Ngưỡng COD theo số tiền và số ngày.
  - Số ngày công nợ mặc định, hạn mức mặc định nếu có.
  - Save/cancel, validation, audit.
- **Backend/API/Data:**
  - Merchant settings table/fields.
  - Query/update settings mutation.
  - Audit khi sửa.
- **Acceptance tests:**
  - Lưu settings và reload vẫn giữ đúng.
  - Ngưỡng overlap được DIS-002 dùng.
  - Ngưỡng COD được FIN-006 dùng.
  - User không phải admin không sửa được.
- **Dependencies:** FDN-004, FDN-005, WEB-DS-001.
- **Parallelizable:** MD-002..MD-007.

### MD-002 — User, role và permission management

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-USER-01, WM-USER-02, WM-USER-03, WM-RBAC-01.
- **User story:** Là admin, tôi muốn quản lý nhân viên, role và quyền để phân tách operation/kế toán/giám đốc.
- **Chức năng trong màn hình:**
  - Danh sách nhân viên: search, filter role/status.
  - Detail: thông tin user, role, timeline.
  - Invite/create user placeholder.
  - Khóa/mở user.
  - Ma trận quyền theo role.
- **Backend/API/Data:**
  - User CRUD scoped merchant.
  - Role assignment.
  - Permission query cho UI.
- **Acceptance tests:**
  - Admin tạo operation user, operation login chỉ thấy quyền operation.
  - Khóa user thì không truy cập API được.
  - Role change có audit.
  - Kế toán không chỉnh RBAC được.
- **Dependencies:** FDN-004, FDN-005.
- **Parallelizable:** MD-003..MD-007.

### MD-003 — Customer và customer locations

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-CUS-01, WM-CUS-02, WM-CUS-03, WM-CUS-04, WM-CUS-05, WM-CUS-06.
- **User story:** Là operation/kế toán, tôi muốn quản lý khách hàng, địa chỉ thường dùng, hạn mức và công nợ để tạo đơn nhanh và theo dõi tiền.
- **Chức năng trong màn hình:**
  - List customer: search tên/SĐT/MST, filter cảnh báo nợ.
  - Detail tabs: tổng quan, đơn hàng, công nợ, số dư, địa chỉ, liên hệ, chứng từ, timeline.
  - Form customer: tên, loại cá nhân/doanh nghiệp, MST, liên hệ, hạn mức nợ, ngày công nợ mặc định.
  - Address book: kho/địa chỉ, người liên hệ, SĐT, ghi chú, tọa độ optional.
  - Tạo order nhanh từ customer.
- **Backend/API/Data:**
  - Customer CRUD.
  - Customer location CRUD.
  - Debt summary placeholder nếu finance chưa xong.
- **Acceptance tests:**
  - Tạo customer + 2 địa chỉ, order form chọn được địa chỉ.
  - Hạn mức nợ lưu và FIN-004 dùng được.
  - Xóa mềm customer đã có order bị chặn hoặc chuyển inactive.
  - Import/export stub không phá list.
- **Dependencies:** FDN-004, FDN-007, WEB-DS-002.
- **Parallelizable:** MD-004..MD-007.

### MD-004 — Driver profile, salary history và app account

- **Platform:** Backend, Web Merchant, Driver App auth dependency.
- **Screens:** WM-DRV-01, WM-DRV-02, WM-DRV-03, WM-DRV-04, WM-DRV-05, WM-DRV-06.
- **User story:** Là operation, tôi muốn quản lý tài xế, lương cố định và tài khoản app để giao chuyến và tính lương đúng kỳ.
- **Chức năng trong màn hình:**
  - List driver: trạng thái, chuyến hiện tại, COD đang giữ placeholder.
  - Detail tabs: hồ sơ, tài khoản app, lương cố định, lịch sử lái, công nợ, bảng lương, chứng từ.
  - Salary history: amount, effective date, reason.
  - Create/reset app account theo driver auth decision.
- **Backend/API/Data:**
  - Driver CRUD.
  - Driver salary history.
  - Driver account table/auth mapping.
- **Acceptance tests:**
  - Lương cố định thay đổi ngày 15 không làm kỳ trước đổi sai.
  - Driver inactive không chọn được khi tạo trip mới.
  - Driver app login chỉ thấy trip assigned cho mình.
- **Dependencies:** FDN-004, P0-001 driver auth.
- **Parallelizable:** MD-003, MD-005, MD-006.

### MD-005 — Vehicle management

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-VEH-01, WM-VEH-02, WM-VEH-03.
- **User story:** Là operation, tôi muốn quản lý xe để điều phối và xem lịch sử chạy/chi phí.
- **Chức năng trong màn hình:**
  - List vehicle: biển số, loại xe, tải trọng, trạng thái, chuyến hiện tại.
  - Detail tabs: hồ sơ, lịch sử chạy placeholder, chi phí vật tư placeholder, chứng từ, timeline.
  - Form: biển số, loại, tải trọng, thông tin kỹ thuật, trạng thái.
- **Backend/API/Data:**
  - Vehicle CRUD.
  - Unique plate per merchant.
- **Acceptance tests:**
  - Không tạo trùng biển số trong cùng merchant.
  - Xe inactive không chọn được khi tạo trip.
  - Xe merchant A không hiện ở merchant B.
- **Dependencies:** FDN-004, WEB-DS-001.
- **Parallelizable:** MD-003, MD-004, MD-006.

### MD-006 — Supplier management

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-SUP-01, WM-SUP-02, WM-SUP-03.
- **User story:** Là kế toán/operation, tôi muốn quản lý NCC để gắn chi phí, thuê xe ngoài và công nợ phải trả.
- **Chức năng trong màn hình:**
  - List supplier: tên, loại NCC, công nợ placeholder, liên hệ.
  - Detail tabs: hồ sơ, liên hệ, khoản chi placeholder, thuê xe ngoài placeholder, chứng từ, timeline.
  - Form: tên, loại, MST, liên hệ, ghi chú.
- **Backend/API/Data:**
  - Supplier CRUD.
  - Supplier type catalog hoặc enum.
- **Acceptance tests:**
  - NCC chọn được trong expense/thuê xe ngoài task sau.
  - Inactive supplier không chọn trong form mới.
  - Sửa supplier có audit.
- **Dependencies:** FDN-004, WEB-DS-001.
- **Parallelizable:** MD-003..MD-005.

### MD-007 — Catalog management

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-CAT-01.
- **User story:** Là admin/operation, tôi muốn tự quản lý danh mục nghiệp vụ để phù hợp từng nhà xe.
- **Chức năng trong màn hình:**
  - Tabs/group danh mục: loại chi phí, add-on, loại hàng, lý do tạm dừng, lý do giảm trừ, loại chứng từ, loại sự cố.
  - Add/edit/deactivate item.
  - Seed default khi tạo merchant.
- **Backend/API/Data:**
  - Generic catalog table hoặc per-domain tables.
  - `merchant_id`, type, code/name, active, sortOrder.
- **Acceptance tests:**
  - Merchant A thêm loại chi phí không hiện ở merchant B.
  - Inactive item không hiện trong form mới nhưng dữ liệu cũ vẫn hiển thị label.
  - Catalog defaults có sau seed merchant.
- **Dependencies:** FDN-003, FDN-004.
- **Parallelizable:** MD-001..MD-006.

## 6. P3 — Order + Dispatch Task Specs

### ORD-001 — Order core API và Web list/create/detail

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-ORD-01, WM-ORD-02, WM-ORD-03.
- **User story:** Là operation, tôi muốn tạo order với khách hàng, giá cước nhập tay và hạn thanh toán để bắt đầu quản lý đơn vận chuyển.
- **Chức năng trong màn hình:**
  - Order list: mã đơn, khách, tuyến tóm tắt, trạng thái, tổng tiền, đã thu/còn nợ placeholder, hạn thanh toán, warning.
  - Create/edit: chọn khách, giá cước, hạn thanh toán, ghi chú nội bộ, trạng thái nháp/chờ xác nhận.
  - Detail header: mã, trạng thái, khách, tổng tiền, action đổi trạng thái/hủy/sửa.
  - Tabs placeholder: stops, cargo, trips, finance, attachments, timeline.
- **Backend/API/Data:**
  - `orders`: merchant, code, customer, freight_amount, payment_due_date, status, notes.
  - GraphQL CRUD + filters.
  - Numbering service.
  - Status history.
- **Acceptance tests:**
  - Tạo order sinh mã `DH-YYYYMM-0001`.
  - Order list filter theo status/customer/date.
  - Sửa giá sau xác nhận yêu cầu permission + reason.
  - Hủy order giữ lại dữ liệu và ghi reason/history.
- **Dependencies:** FDN-006, FDN-007, MD-003.
- **Parallelizable:** ORD-002 after API contract.

### ORD-002 — Stops, cargo, add-on services

- **Platform:** Backend, Web Merchant, Driver App later.
- **Screens:** WM-ORD-04, WM-ORD-05, WM-ORD-06, WM-STOP-01.
- **User story:** Là operation, tôi muốn khai nhiều điểm lấy/trả, hàng hóa và add-on để phản ánh đúng đơn vận chuyển thực tế.
- **Chức năng trong màn hình:**
  - Stop manager: thêm/sửa/xóa/sắp xếp điểm lấy/trả.
  - Stop fields: loại, địa chỉ, liên hệ, SĐT, COD dự kiến, ghi chú, status.
  - Chọn từ customer address book và snapshot vào order stop.
  - Cargo lines: tên hàng bắt buộc, loại hàng, khối lượng/thể tích/số kiện, đặc tính, ghi chú.
  - Add-ons: chọn dịch vụ, số tiền, ghi chú; cộng vào tổng thu khách.
- **Backend/API/Data:**
  - `order_stops`, `cargo_lines`, `order_addons`.
  - Stop status history.
  - Total receivable calculation = freight + add-ons.
- **Acceptance tests:**
  - Order có 2 điểm lấy, 3 điểm trả lưu đúng thứ tự.
  - Cargo chỉ bắt buộc tên hàng; các field khác optional.
  - Add-on tăng tổng tiền thu khách nhưng không tạo expense.
  - Xóa/bỏ qua stop đã có POD/COD bị chặn hoặc cần action nhạy cảm.
- **Dependencies:** ORD-001, MD-003, MD-007.
- **Parallelizable:** ORD-003 UI, DIS-001 after schema.

### DIS-001 — Trip core, assign vehicle/driver và stop assignment

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-TRIP-01, WM-TRIP-02.
- **User story:** Là operation, tôi muốn tách order thành một hoặc nhiều trip, gán xe và tài xế cho từng trip.
- **Chức năng trong màn hình:**
  - Create trip từ order.
  - Chọn xe, tài xế, thời gian dự kiến.
  - Chọn stops mà trip phụ trách; nếu đơn 1 xe thì auto assign all stops.
  - Nhập thưởng tài xế theo trip/order.
  - Detail trip hiển thị order, xe, tài xế, stops, status, chi phí placeholder, POD/COD placeholder.
- **Backend/API/Data:**
  - `trips`, `trip_stop_assignments`.
  - Driver bonus amount.
  - Trip status history.
- **Acceptance tests:**
  - Một order tạo được nhiều trip.
  - Trip A/B có stop assignment riêng.
  - Driver/vehicle inactive không chọn được.
  - Trip detail link ngược order/driver/vehicle.
- **Dependencies:** ORD-002, MD-004, MD-005.
- **Parallelizable:** DIS-002, DIS-003.

### DIS-002 — Overlap/gần-overlap warning

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-DISPATCH-02, WM-DISPATCH-03, WM-TRIP-02.
- **User story:** Là operation, tôi muốn được cảnh báo khi xe/tài xế bị trùng hoặc quá sát lịch, nhưng vẫn có thể override nếu có quyền.
- **Chức năng trong màn hình:**
  - Warning panel khi chọn xe/tài xế/time.
  - Hiển thị trip đang conflict: mã chuyến, thời gian, order, tài xế/xe.
  - Override button mở SensitiveActionModal nếu cần.
- **Backend/API/Data:**
  - Query overlap theo vehicle và driver.
  - Near-overlap threshold từ merchant settings.
  - Audit override.
- **Acceptance tests:**
  - Trip 08:00-10:00 và trip 09:30-11:00 báo overlap.
  - Trip cách nhau dưới threshold báo near-overlap.
  - Warning không chặn save nếu user có quyền override + reason.
  - Thiếu quyền override thì không save được conflict.
- **Dependencies:** DIS-001, MD-001.
- **Parallelizable:** DIS-003.

### DIS-003 — Dispatch board và status operation

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-DISPATCH-01, WM-TRIP-01, WM-DISPATCH-04.
- **User story:** Là operation, tôi muốn theo dõi chuyến theo ngày/trạng thái và cập nhật thay tài xế khi cần.
- **Chức năng trong màn hình:**
  - Dispatch board theo ngày/status.
  - Filters: date, status, driver, vehicle.
  - Quick action đổi status.
  - Mở trip detail.
  - Last known location placeholder nếu GPS chưa xong.
- **Backend/API/Data:**
  - Trip list query optimized by date/status.
  - Status update mutation dùng DIS-004.
- **Acceptance tests:**
  - Trip mới tạo hiện trên board đúng ngày.
  - Operation đổi trip status ghi history.
  - Board reload/polling cập nhật status từ driver app.
- **Dependencies:** DIS-001, DIS-004.
- **Parallelizable:** Driver App UI mock.

### DIS-004 — Status update service order/trip/stop

- **Platform:** Backend, Web Merchant, Driver App.
- **Screens:** WM-ORD-02, WM-TRIP-01, WM-STOP-01, DA-STATUS-01, DA-STATUS-02.
- **User story:** Là operation/tài xế, tôi muốn cập nhật trạng thái linh hoạt theo thực tế nhưng hệ thống vẫn lưu đủ lịch sử.
- **Chức năng trong màn hình:**
  - Status selector/modal.
  - Lý do bắt buộc cho hủy, bỏ qua, tạm dừng, đổi ngược.
  - Tạm dừng lưu previous status để resume.
  - Stop status: chưa đến, đã đến, hoàn thành, bỏ qua.
- **Backend/API/Data:**
  - Generic status transition use case.
  - `status_histories`.
  - Permission check cho sensitive transition.
- **Acceptance tests:**
  - Driver mark stop completed, web thấy completed + actual time.
  - Trip pause with reason, resume về trạng thái trước.
  - Hủy order/trip bắt reason.
  - Đổi từ hoàn thành về đang vận chuyển cần permission.
- **Dependencies:** ORD-002, DIS-001, FDN-005, FDN-007.
- **Parallelizable:** Driver App status UI.

### DIS-005 — Incident management

- **Platform:** Backend, Web Merchant, Driver App.
- **Screens:** WM-DISPATCH-05, WM-INC-01, DA-INC-01.
- **User story:** Là tài xế/operation, tôi muốn ghi nhận sự cố chuyến/order kèm ảnh để xử lý và truy vết.
- **Chức năng trong màn hình:**
  - Incident list: trạng thái, mức độ, loại, order/trip, người phụ trách.
  - Incident detail: mô tả, ảnh/chứng từ, timeline, action update/close.
  - Driver report incident: loại, mô tả, ảnh.
- **Backend/API/Data:**
  - `incidents`: type, severity, description, status, assignee, order/trip refs.
  - Attachment link.
  - Notification event later.
- **Acceptance tests:**
  - Driver báo sự cố hư xe kèm ảnh, operation thấy trên web.
  - Operation đóng sự cố với ghi chú.
  - Incident linked order/trip detail hiển thị.
- **Dependencies:** FDN-008, ORD-001, DIS-001, MD-007.
- **Parallelizable:** Driver incident UI.

## 7. P4 — Driver App Task Specs

### DRV-API-001 — Driver auth và job API

- **Platform:** Backend, Driver App.
- **Screens:** DA-AUTH-01, DA-AUTH-02, DA-HOME-01, DA-JOB-01.
- **User story:** Là tài xế, tôi muốn đăng nhập và chỉ thấy chuyến được giao cho mình.
- **Chức năng trong màn hình:**
  - Splash kiểm tra session.
  - Login theo auth decision.
  - Home hiển thị chuyến hôm nay, chuyến đang chạy, cảnh báo sync/COD placeholder.
  - Job list theo ngày/status.
- **Backend/API/Data:**
  - Driver principal.
  - Query jobs by driver.
  - Trip detail query scoped driver.
- **Acceptance tests:**
  - Driver A không xem trip Driver B.
  - Driver inactive không login hoặc không thấy job mới.
  - Job list empty state nếu hôm nay không có chuyến.
- **Dependencies:** P0-001, MD-004, DIS-001.
- **Parallelizable:** DRV UI mock.

### DRV-UI-002 — Trip/Stop detail ngoài hiện trường

- **Platform:** Driver App.
- **Screens:** DA-TRIP-01, DA-STOP-01, DA-STOP-02.
- **User story:** Là tài xế, tôi muốn xem chuyến, điểm dừng, địa chỉ, liên hệ, hàng hóa và COD để chạy đúng việc.
- **Chức năng trong màn hình:**
  - Trip header: mã chuyến, trạng thái, order, xe.
  - Stop list theo thứ tự, badge lấy/trả/status.
  - Stop detail: địa chỉ, contact, phone call action, open map action, COD expected, notes.
  - Cargo summary.
  - Primary action theo status hiện tại.
- **Backend/API/Data:**
  - Trip detail query gồm stops/cargo/COD/POD status.
- **Acceptance tests:**
  - Tài xế mở trip offline gần nhất nếu đã cache.
  - Phone/map action dùng đúng dữ liệu stop.
  - COD expected hiển thị rõ tại điểm cần thu.
- **Dependencies:** DRV-API-001, ORD-002, DIS-001.
- **Parallelizable:** DRV-ACT-001.

### DRV-ACT-001 — Driver status update + offline queue

- **Platform:** Driver App, Backend, Web observe.
- **Screens:** DA-STATUS-01, DA-STATUS-02, DA-SYNC-01.
- **User story:** Là tài xế, tôi muốn cập nhật trạng thái nhanh ngoài hiện trường kể cả mạng yếu.
- **Chức năng trong màn hình:**
  - Status update action lớn.
  - Reason bottom sheet cho tạm dừng/bỏ qua/hủy.
  - Offline banner và sync queue.
  - Retry failed status updates.
- **Backend/API/Data:**
  - Status mutation from driver principal.
  - Idempotency key optional.
  - Audit actor driver.
- **Acceptance tests:**
  - Khi online, status update hiện ngay trên Web dispatch.
  - Khi offline, update vào queue; có mạng lại sync.
  - Failed sync hiển thị lỗi và retry.
- **Dependencies:** DIS-004, DRV-UI-002.
- **Parallelizable:** DRV-ACT-002, DRV-ACT-003.

### DRV-ACT-002 — POD capture

- **Platform:** Driver App, Backend, Web Merchant.
- **Screens:** DA-POD-01, WM-SHELL-06, WM-STOP-01.
- **User story:** Là tài xế, tôi muốn chụp POD tại điểm trả hàng để xác nhận hoàn thành.
- **Chức năng trong màn hình:**
  - Camera/gallery capture.
  - Preview ảnh, xóa/chụp lại.
  - Upload progress/retry.
  - Link ảnh với stop.
- **Backend/API/Data:**
  - Presigned upload.
  - Attachment metadata category POD.
- **Acceptance tests:**
  - POD upload từ app hiện trong web stop detail.
  - POD không gắn nhầm stop.
  - Mất mạng thì ảnh nằm pending queue.
- **Dependencies:** FDN-008, DRV-UI-002.
- **Parallelizable:** DRV-ACT-003.

### DRV-ACT-003 — COD input

- **Platform:** Driver App, Backend, Web Merchant.
- **Screens:** DA-COD-01, WM-COD-01, WM-DRV-05, WM-STOP-01.
- **User story:** Là tài xế, tôi muốn nhập COD thực thu tại điểm; kế toán muốn số này chảy vào công nợ tài xế.
- **Chức năng trong màn hình:**
  - Hiển thị COD dự kiến.
  - Nhập COD thực thu.
  - Ghi chú/chứng từ optional.
  - Nếu sửa COD đã lưu: bắt lý do.
- **Backend/API/Data:**
  - `order_stop.cod_actual_amount`.
  - Audit before/after khi sửa.
  - Driver ledger source for COD held.
- **Acceptance tests:**
  - Driver nhập COD 1.000.000, web COD held tăng đúng.
  - Sửa COD thành 900.000 không có lý do bị reject.
  - COD nộp lại sau này không tính doanh thu.
- **Dependencies:** ORD-002, FDN-005, FDN-007, DRV-UI-002.
- **Parallelizable:** DRV-ACT-002.

### GPS-001/002/003 — GPS ingest, sender và Web location

- **Platform:** Backend, Driver App, Web Merchant.
- **Screens:** DA-GPS-01, DA-SYNC-01, WM-DISPATCH-04.
- **User story:** Là operation, tôi muốn biết vị trí gần nhất của xe đang chạy; là tài xế, app chỉ tracking khi có chuyến đang chạy.
- **Chức năng trong màn hình:**
  - Driver app xin permission vị trí.
  - Hiển thị cảnh báo nếu permission tắt.
  - Sync queue cho GPS batch.
  - Web xem last known location, timestamp, trip link.
- **Backend/API/Data:**
  - REST GPS batch endpoint.
  - `trip_locations`: trip, driver, lat/lng, accuracy, capturedAt.
  - Validate driver owns trip.
- **Acceptance tests:**
  - App không gửi GPS khi không có trip running.
  - Batch GPS gửi bù sau offline.
  - Web hiển thị điểm mới nhất đúng trip.
  - Driver A không gửi GPS cho trip Driver B.
- **Dependencies:** DRV-API-001, DIS-001, DRV-ACT-001.
- **Parallelizable:** Finance tasks after P4 core.

## 8. P5 — Finance Task Specs

### FIN-001 — Expense/phiếu chi

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-FIN-01, WM-EXP-01, WM-EXP-02, WM-EXP-03.
- **User story:** Là kế toán/operation, tôi muốn ghi nhận mọi khoản chi và gắn đúng order/trip/xe/NCC/tài xế.
- **Chức năng trong màn hình:**
  - Expense list: mã, loại, số tiền, đối tượng, trạng thái trả, ngày.
  - Create: loại chi, số tiền, ngày, NCC/order/trip/vehicle/driver, ai chi trước, có hoàn tài xế không, chứng từ.
  - Detail: attachments, audit, action sửa/hủy/mark paid.
- **Backend/API/Data:**
  - `expenses`.
  - Links nullable tới supplier/order/trip/vehicle/driver.
  - Paid/unpaid/cancelled status.
- **Acceptance tests:**
  - Chi phí trip làm giảm lãi/lỗ order.
  - Expense NCC chưa trả xuất hiện trong supplier debt.
  - Expense tài xế chi trước xuất hiện trong driver ledger.
  - Sửa/xóa expense cần permission + reason.
- **Dependencies:** ORD/DIS, MD-004/005/006/007.
- **Parallelizable:** FIN-002.

### FIN-002 — Payment in/phiếu thu

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-PAY-01, WM-PAY-02, WM-PAY-03.
- **User story:** Là kế toán, tôi muốn ghi nhận tiền khách trả hoặc tài xế nộp COD mà không làm sai doanh thu.
- **Chức năng trong màn hình:**
  - Payment list: mã, loại, người nộp, số tiền, đã phân bổ, còn treo.
  - Create: loại thu, customer/driver, amount, date, method, note, chứng từ.
  - Detail: allocations, attachments, audit.
- **Backend/API/Data:**
  - `payment_in`.
  - Type: CUSTOMER_PAYMENT, DRIVER_COD_REMITTANCE, OTHER.
  - Revenue không lấy từ payment; revenue lấy từ order.
- **Acceptance tests:**
  - Payment khách trả chưa phân bổ tạo customer credit.
  - Driver COD remittance giảm COD held, không tăng doanh thu.
  - Sửa payment cần permission + reason.
- **Dependencies:** MD-003, MD-004, FDN-005.
- **Parallelizable:** FIN-001.

### FIN-003 — Payment allocation và customer credit

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-PAY-04, WM-CUS-05, WM-DEBT-01.
- **User story:** Là kế toán, tôi muốn phân bổ một phiếu thu vào nhiều order và giữ phần dư thành số dư khách.
- **Chức năng trong màn hình:**
  - Allocation modal/table hiển thị order còn nợ.
  - Nhập số phân bổ từng order.
  - Hiển thị remaining payment amount.
  - Validate không phân bổ quá số tiền còn lại hoặc quá nợ order trừ khi có rule credit rõ.
- **Backend/API/Data:**
  - `payment_allocations`.
  - Customer credit = total payment - allocations.
- **Acceptance tests:**
  - Payment 10tr phân bổ 6tr vào order A, 3tr vào order B, credit còn 1tr.
  - Order remaining cập nhật đúng.
  - Allocation khác customer bị reject.
- **Dependencies:** FIN-002, ORD-001/002.
- **Parallelizable:** FIN-004 after formula.

### FIN-004 — Customer debt

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-DEBT-01, WM-CUS-05.
- **User story:** Là kế toán, tôi muốn xem công nợ khách theo order, quá hạn, số dư và hạn mức để thu hồi công nợ.
- **Chức năng trong màn hình:**
  - Debt table by customer/order.
  - Columns: ngày đơn, mã đơn, tuyến, tổng tiền, đã thu, còn lại, hạn thanh toán, số ngày quá hạn.
  - Badge quá hạn/vượt hạn mức.
  - Action tạo payment hoặc bảng kê.
- **Backend/API/Data:**
  - Debt query using order total and allocations.
  - Overdue days.
  - Customer credit and credit limit warning.
- **Acceptance tests:**
  - Order 5tr, allocation 2tr => còn nợ 3tr.
  - Hôm nay sau due date 5 ngày => overdue 5.
  - Khách vượt hạn mức hiện warning nhưng không tự chặn tạo order.
- **Dependencies:** FIN-003, MD-003.
- **Parallelizable:** FIN-005, FIN-006.

### FIN-005 — Supplier debt

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-DEBT-02, WM-SUP-02.
- **User story:** Là kế toán, tôi muốn xem nhà cung cấp còn phải trả dựa trên các expense chưa trả.
- **Chức năng trong màn hình:**
  - Supplier debt list.
  - Drilldown expense chưa trả.
  - Mark paid/create payment out flow nếu đã implement bằng expense paid status.
- **Backend/API/Data:**
  - Supplier debt = unpaid expenses linked supplier.
- **Acceptance tests:**
  - Expense NCC 3tr unpaid => supplier debt 3tr.
  - Mark paid => debt giảm.
  - Expense không có supplier không vào supplier debt.
- **Dependencies:** FIN-001, MD-006.
- **Parallelizable:** FIN-004, FIN-006.

### FIN-006 — Driver ledger và COD warning

- **Platform:** Backend, Web Merchant, Driver App data.
- **Screens:** WM-DRV-05, WM-DRV-06, WM-COD-01, WM-DASH-01.
- **User story:** Là operation/kế toán, tôi muốn biết tài xế đang giữ COD bao nhiêu, giữ bao lâu và công ty còn nợ tài xế khoản hoàn ứng nào.
- **Chức năng trong màn hình:**
  - COD held list theo tài xế/order/trip/stop.
  - Warning quá tiền/quá ngày theo merchant settings.
  - Driver ledger: công ty nợ tài xế, tài xế nợ công ty, lịch sử.
  - Action tạo payment type driver COD remittance.
- **Backend/API/Data:**
  - COD held = sum stop cod_actual - payment_in DRIVER_COD_REMITTANCE.
  - Reimbursable expenses driver paid.
  - Wage advance visibility.
- **Acceptance tests:**
  - Driver nhập COD 1tr, chưa nộp => COD held 1tr.
  - Tạo payment COD remittance 600k => held còn 400k.
  - COD giữ quá threshold hiện dashboard warning.
- **Dependencies:** DRV-ACT-003, FIN-001, FIN-002, MD-001.
- **Parallelizable:** FIN-007.

## 9. P6 — Payroll, Reports, Export Specs

### PAY-001/PAY-002/PAY-003 — Payroll lifecycle

- **Platform:** Backend, Web Merchant, App Merchant later.
- **Screens:** WM-PAYROLL-01, WM-PAYROLL-02, WM-PAYROLL-03, WM-PAYROLL-04, WM-PAYROLL-05, MA-PAYROLL-01.
- **User story:** Là operation, tôi muốn tạo bảng lương theo kỳ; là giám đốc, tôi muốn duyệt trước khi chi trả; là kế toán, tôi muốn export báo cáo trả lương.
- **Chức năng trong màn hình:**
  - Payroll list theo kỳ/status.
  - Create payroll: chọn kỳ, tài xế, generate.
  - Detail: line từng tài xế gồm lương cố định snapshot, thưởng trip/order, ứng, giảm trừ, thực lãnh.
  - Line detail drilldown link order/trip/expense.
  - Submit/approve/return/mark paid.
  - Export bảng lương/phiếu lương.
- **Backend/API/Data:**
  - `payrolls`, `payroll_lines`, `payroll_line_items`.
  - Snapshot salary/bonus/advance/deduction.
  - Approval permission admin.
- **Acceptance tests:**
  - Driver lương cố định 10tr, thưởng 2tr, ứng 1tr => thực lãnh 11tr.
  - Sau khi payroll created, đổi lương driver không làm line cũ đổi.
  - Operation tạo, admin duyệt; kế toán không duyệt nếu không có quyền.
  - Hủy duyệt/sửa sau duyệt theo decision đã chốt và có audit.
- **Dependencies:** MD-001, MD-004, DIS-001, FIN-001, FDN-005.
- **Parallelizable:** PDF-001 after finance.

### PDF-001 — Debt statement snapshot/PDF

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-DEBT-03, WM-DEBT-04, WM-SHELL-05.
- **User story:** Là kế toán, tôi muốn chốt bảng kê công nợ và xuất PDF gửi khách, không bị lệch khi dữ liệu sau đó thay đổi.
- **Chức năng trong màn hình:**
  - Create statement: chọn khách, kỳ/date range.
  - Preview lines.
  - Chốt snapshot.
  - Download PDF.
  - Status: draft, finalized, sent, cancelled.
- **Backend/API/Data:**
  - `debt_statements`, `debt_statement_lines`.
  - Snapshot amount fields.
  - PDF render HTML template.
- **Acceptance tests:**
  - Chốt statement xong, payment mới không làm line cũ đổi.
  - PDF tải lại đúng bản đã chốt.
  - Cancel statement ghi reason/audit.
- **Dependencies:** FIN-004.
- **Parallelizable:** Reports.

### RPT-001/RPT-002 — Dashboard và reports

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-DASH-01, WM-DASH-02, WM-DASH-03, WM-RPT-01..08.
- **User story:** Là giám đốc/operation/kế toán, tôi muốn thấy các chỉ số vận hành và tài chính quan trọng theo thời gian.
- **Chức năng trong màn hình:**
  - Dashboard cards: chuyến đang chạy, nợ quá hạn, COD held, sự cố mở, bảng lương chờ duyệt.
  - Reports: doanh thu/chi phí/lãi lỗ, lãi/lỗ theo đơn, công nợ, COD, payroll.
  - Date range, customer/driver/vehicle filters.
  - Click report row mở entity detail.
- **Backend/API/Data:**
  - Report query services reuse finance/order formulas.
  - No duplicated inconsistent formula.
- **Acceptance tests:**
  - Order profit report bằng order finance tab.
  - COD report bằng driver ledger.
  - Dashboard card click tới list đã filter.
- **Dependencies:** FIN-008, FIN-004/006, PAY.
- **Parallelizable:** Export/import.

### IMP-001/EXP-001 — Import/export Excel

- **Platform:** Backend, Web Merchant.
- **Screens:** WM-SHELL-04, WM-SHELL-05.
- **User story:** Là operation/kế toán, tôi muốn import dữ liệu nền và export dữ liệu đối chiếu ra Excel.
- **Chức năng trong màn hình:**
  - Import wizard: upload, map columns, preview, row errors, commit.
  - Export preview/download: orders, debt, payroll, COD held.
- **Backend/API/Data:**
  - Excel parser/generator.
  - Import job/session table optional.
  - Validation per row.
- **Acceptance tests:**
  - File khách hàng có lỗi SĐT/MST hiển thị lỗi theo dòng, chưa commit.
  - Commit valid rows tạo customer/vehicle/driver.
  - Export mở được bằng Excel, tiền/date format đúng.
  - Export tenant-safe.
- **Dependencies:** Master data/list APIs.
- **Parallelizable:** Reports.

## 10. P8 — App Merchant Task Specs

### MA-001 — Merchant App foundation

- **Platform:** App Merchant, Backend.
- **Screens:** MA-AUTH-01, MA-HOME-01, MA-NOTI-01, MA-PROFILE-01.
- **User story:** Là chủ nhà xe/operation/kế toán, tôi muốn dùng mobile để xem nhanh tình trạng vận hành và việc cần xử lý.
- **Chức năng trong màn hình:**
  - Login/session.
  - Home cards: chuyến đang chạy, nợ quá hạn, COD held, payroll pending, incident.
  - Notification list link tới entity.
  - Profile/logout.
- **Backend/API/Data:** Reuse Web Merchant APIs with mobile-friendly queries.
- **Acceptance tests:**
  - Admin/operation/kế toán thấy card phù hợp role.
  - Notification mở đúng order/trip/payroll.
  - Permission giống Web Merchant.
- **Dependencies:** P7 APIs stable.
- **Parallelizable:** Customer Web discovery.

### MA-002 — Merchant App order/trip monitoring

- **Platform:** App Merchant.
- **Screens:** MA-ORD-01, MA-ORD-02, MA-ORD-03, MA-TRIP-01, MA-TRIP-02, MA-MAP-01.
- **User story:** Là chủ/operation, tôi muốn xem đơn/chuyến/POD/COD trên mobile và tạo nhanh đơn nếu cần.
- **Chức năng trong màn hình:**
  - Order list/detail.
  - Quick order create.
  - Trip list/detail.
  - Call driver/customer.
  - View POD/COD.
  - Last known location.
- **Acceptance tests:**
  - Mobile mở order/trip đúng dữ liệu web.
  - Quick order tạo được draft/order tối thiểu.
  - POD ảnh xem được.
- **Dependencies:** MA-001, P3/P4 APIs.
- **Parallelizable:** MA-003.

### MA-003 — Merchant App finance/payroll quick actions

- **Platform:** App Merchant.
- **Screens:** MA-FIN-01, MA-COD-01, MA-PAYROLL-01, MA-RPT-01.
- **User story:** Là giám đốc/kế toán, tôi muốn xem nhanh công nợ/COD và duyệt bảng lương trên mobile.
- **Chức năng trong màn hình:**
  - Finance summary.
  - COD held list.
  - Payroll pending approval.
  - Approve/return payroll with reason.
  - Mini reports.
- **Acceptance tests:**
  - User không có quyền duyệt không thấy approve.
  - Approve payroll trên mobile ghi audit giống web.
  - COD held số liệu khớp Web Merchant.
- **Dependencies:** MA-001, P5/P6 APIs.
- **Parallelizable:** MA-002.

## 11. P9 — Web Khách hàng Task Specs

### CW-001 — Customer auth/profile/address book

- **Platform:** Web Khách hàng, Backend.
- **Screens:** CW-AUTH-01, CW-PROFILE-01, CW-ADDR-01.
- **User story:** Là khách hàng, tôi muốn đăng nhập, quản lý hồ sơ và địa chỉ thường dùng để gửi booking nhanh.
- **Chức năng trong màn hình:**
  - Login/register/forgot password theo auth decision.
  - Profile cá nhân/doanh nghiệp.
  - Address book kho/điểm lấy/trả, contact, phone.
- **Backend/API/Data:**
  - Customer principal.
  - Customer-owned address book.
- **Acceptance tests:**
  - Customer A không thấy booking/order của Customer B.
  - Address book dùng được khi tạo booking.
- **Dependencies:** Customer auth decision, customer model.
- **Parallelizable:** CW-002.

### CW-002 — Merchant discovery/profile

- **Platform:** Web Khách hàng, Backend.
- **Screens:** CW-HOME-01, CW-MER-01.
- **User story:** Là khách hàng, tôi muốn tìm nhà xe và xem thông tin trước khi gửi booking.
- **Chức năng trong màn hình:**
  - Search/list merchant public.
  - Merchant profile: thông tin liên hệ, dịch vụ, ghi chú.
  - CTA tạo booking.
- **Backend/API/Data:**
  - Public merchant profile fields.
  - Publish/unpublish setting.
- **Acceptance tests:**
  - Merchant chưa public không hiện.
  - Search/filter trả đúng kết quả.
- **Dependencies:** Merchant public profile.
- **Parallelizable:** CW-001.

### CW-003 — Booking request và Web Merchant bridge

- **Platform:** Web Khách hàng, Web Merchant, Backend.
- **Screens:** CW-BOOK-01, CW-BOOK-02, CW-BOOK-03, WM-ORD-03 bridge.
- **User story:** Là khách hàng, tôi muốn gửi yêu cầu vận chuyển; là operation, tôi muốn tiếp nhận rồi tạo/chuyển thành order sau khi xác nhận.
- **Chức năng trong màn hình:**
  - Booking form: điểm lấy/trả, hàng hóa, thời gian, ghi chú, liên hệ.
  - Booking list/detail customer.
  - Web Merchant booking inbox hoặc entry point.
  - Convert booking to order: operation có thể sửa giá/điểm/hàng trước khi tạo order.
- **Backend/API/Data:**
  - `bookings`, booking stops/cargo/contact.
  - Booking status.
  - Link booking -> order optional.
- **Acceptance tests:**
  - Booking tạo xong không tự thành order.
  - Operation convert booking thành order, order link lại booking.
  - Customer thấy trạng thái booking được cập nhật.
- **Dependencies:** CW-001, ORD-001/002.
- **Parallelizable:** CW-004 after booking schema.

### CW-004 — Customer order history và debt statement visibility

- **Platform:** Web Khách hàng, Backend.
- **Screens:** CW-ORD-01, CW-ORD-02, CW-DEBT-01, CW-NOTI-01.
- **User story:** Là khách hàng, tôi muốn xem lịch sử đơn và tải bảng kê công nợ được nhà xe gửi.
- **Chức năng trong màn hình:**
  - Order history.
  - Order detail customer-safe fields.
  - Debt statement list/download.
  - Notification khi booking/order/statement cập nhật nếu bật.
- **Backend/API/Data:**
  - Customer-scoped order query.
  - Statement visibility/share flag.
- **Acceptance tests:**
  - Customer chỉ thấy order của mình.
  - Statement chưa gửi/không share không hiện.
  - PDF download đúng statement snapshot.
- **Dependencies:** CW-001, PDF-001.
- **Parallelizable:** CW-003.

## 12. Definition of Done cho detailed specs

Một task spec trong tài liệu này được xem là đủ để giao Claude Code khi có:

- User story rõ vai trò/ngữ cảnh.
- Screens hoặc API module liên quan.
- Chức năng màn hình/action cụ thể.
- Backend/API/Data cần nối.
- Acceptance tests đủ happy path, validation path, permission/tenant path.
- Dependencies rõ.

