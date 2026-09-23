# PRD — Handoff Readiness Review

> Ngày review: 2026-09-23
> Mục tiêu: rà toàn bộ tài liệu để biết đã đủ giao cho Claude Design dựng design system/UI flows và Claude Code implement hay chưa.

## 1. Kết luận ngắn

Hiện tài liệu **đã đủ nền business/product/technical/design direction** và đã bổ sung các handoff packet chính để giao việc cho Claude Design/Claude Code. Việc còn lại trước khi code thật là chốt một số open decisions ở P0 và duy trì PRD khi implementation phát sinh thay đổi.

Trạng thái:

| Mục tiêu | Mức sẵn sàng | Nhận xét |
|---|---:|---|
| Giao Claude Design dựng design system | 90% | Đã có principles, design system, web/driver UI guide, route map và UI flow specs. |
| Giao Claude Design dựng UI flows | 90% | Đã có screen inventory, route map và flow-by-flow specs. |
| Giao Claude Code implement backend | 88% | Đã có architecture, task specs, API contract map, permission matrix, seed scenarios. Cần chốt open decisions trước phần liên quan. |
| Giao Claude Code implement Web Merchant | 92% | Đã có screen list, detailed specs, design rules, route map, permission matrix. |
| Giao Claude Code implement Driver App | 85% | Đã có driver UI guide/specs, route map, API map. Cần chốt driver auth trước code thật. |
| Giao Claude Code implement App Merchant | 78% | Đã có màn hình, route map, task phase 2. Có thể kế thừa design language từ Web/Driver; sẽ cần refine khi bắt đầu phase 2. |
| Giao Claude Code implement Web Khách hàng | 78% | Đã có màn hình, route map, booking flow, task phase 3. Cần chốt customer auth/public profile trước code thật. |

## 2. Những phần đã đủ

### 2.1. Business source

Đã đủ để hiểu business:

- SaaS đa nhà xe, multi-tenant.
- Order/Trip/Stop rõ.
- Operation chủ động thao tác thủ công.
- COD, công nợ, lương, điều phối, thuê xe ngoài đã có rule.
- Chức năng bổ sung như audit, attachment, debt statement snapshot, import/export đã được chốt.

Nguồn: `doc/1-BRD`.

### 2.2. Product screen inventory

Đã có danh sách màn hình cho:

- Web Merchant: `WM-*`
- Driver App: `DA-*`
- App Merchant: `MA-*`
- Web Khách hàng: `CW-*`

Nguồn: `doc/2-PRD/01-danh-sach-man-hinh.md`.

### 2.3. Implementation roadmap

Đã có:

- Phase P0-P9.
- Workstream song song.
- Dependency map.
- Task breakdown.
- Definition of Done toàn sản phẩm.

Nguồn: `doc/2-PRD/02-implementation-breakdown.md`.

### 2.4. Detailed task specs

Đã có task detail gồm:

- User story.
- Chức năng màn hình.
- Backend/API/Data.
- Acceptance tests.
- Dependencies.

Nguồn: `doc/2-PRD/03-detailed-task-specs.md`.

### 2.5. Technical architecture

Đã có:

- Monorepo architecture.
- Backend modules.
- GraphQL/REST split.
- Multi-tenant, RBAC, audit.
- Data model groups.
- Flow diagrams.
- Reports/export/GPS architecture.

Nguồn: `doc/3-TECHNICAL/ARCHITECTURE.md`.

### 2.6. Design direction

Đã có:

- Product design principles.
- Design system rules.
- Web Merchant UI patterns.
- Driver App UI patterns.
- Claude Code UI handoff.

Nguồn: `doc/4-DESIGN`.

## 3. Những phần còn thiếu để giao Claude Design tốt hơn

### D-GAP-001 — Route map và navigation hierarchy

Trạng thái: **Đã bổ sung** tại `doc/2-PRD/05-route-map.md`.

Cần bổ sung:

- Web route path cho từng `WM-*`.
- Driver App navigation stack/bottom tabs cho từng `DA-*`.
- App Merchant route/bottom nav cho `MA-*`.
- Customer Web route map cho `CW-*`.
- Sidebar grouping và top-level navigation order.

Tác động nếu thiếu:

- Claude Design có thể dựng flow đúng screen nhưng sai navigation.
- Claude Code dễ đặt route không thống nhất.

Khuyến nghị còn lại: khi code route thật, đối chiếu path/route name với file này.

### D-GAP-002 — UI flow packet theo nghiệp vụ

Trạng thái: **Đã bổ sung** tại `doc/2-PRD/06-ui-flow-specs.md`.

Cần bổ sung các flow:

- Merchant onboarding/login.
- Master data CRUD.
- Tạo order 1 xe nhanh.
- Tạo order nhiều xe.
- Điều phối/gán xe tài xế.
- Driver status/POD/COD.
- Payment allocation.
- COD tài xế nộp lại.
- Debt statement snapshot/PDF.
- Payroll create/approve.
- Booking customer -> order.

Tác động nếu thiếu:

- Claude Design có thể thiết kế từng màn đúng nhưng thiếu continuity giữa màn.

Khuyến nghị còn lại: Claude Design dùng flow specs này để dựng prototype/wireflow.

### D-GAP-003 — Design deliverable checklist

Trạng thái: **Một phần đã có** trong `doc/4-DESIGN` và được bổ sung bằng route/flow specs. Nếu cần Figma handoff rất chặt, có thể thêm frame naming chi tiết hơn sau khi chọn design tool.

Cần bổ sung:

- Frame naming convention.
- Required desktop/mobile/tablet breakpoints.
- States cần thiết cho mỗi screen: loading, empty, error, no permission, warning, dirty form.
- Component inventory phải có.
- Prototype link/flow expectation nếu làm trong design tool.

Tác động nếu thiếu:

- Claude Design có thể output không nhất quán hoặc thiếu states.

Khuyến nghị:

- Tạo phần "Claude Design handoff packet" trong `doc/4-DESIGN` hoặc PRD.

## 4. Những phần còn thiếu để giao Claude Code implement tốt hơn

### C-GAP-001 — Open decisions vẫn cần chốt trước code thật

Các quyết định còn ảnh hưởng implementation:

- Auth App Tài xế.
- Auth Web Khách hàng.
- Job queue: BullMQ/Redis hay inline abstraction.
- GPS retention.
- Payroll sau duyệt sửa thế nào.
- Production hosting target.

Tác động nếu thiếu:

- Claude Code có thể tự chọn sai hướng và tạo technical debt.

Khuyến nghị:

- Chốt bằng task `P0-001` trước khi code các phần liên quan.

### C-GAP-002 — API contract stub theo task

Trạng thái: **Đã bổ sung cấp cao** tại `doc/2-PRD/07-api-contract-map.md`.

Cần bổ sung:

- GraphQL operation names.
- Input/output shape cấp cao.
- REST endpoints cho upload/GPS.
- Error codes convention.
- Pagination/filter/sort convention.

Tác động nếu thiếu:

- Web/mobile mock và backend dễ lệch contract.

Khuyến nghị còn lại: khi code GraphQL thật, generate schema và đối chiếu với map này.

### C-GAP-003 — Permission matrix đầy đủ

Trạng thái: **Đã bổ sung** tại `doc/2-PRD/08-permission-matrix.md`.

Cần bổ sung:

- Role x action matrix: admin, operation, accountant, driver, customer.
- Per-screen visibility.
- Sensitive action reason required.
- Who can approve/cancel/reverse.

Tác động nếu thiếu:

- UI/backend guard dễ lệch.

Khuyến nghị còn lại: shared permission constants phải sync với matrix này.

### C-GAP-004 — Demo seed scenarios

Trạng thái: **Đã bổ sung** tại `doc/3-TECHNICAL/SEED-SCENARIOS.md`.

Cần bổ sung seed cases:

- Merchant A/B để test tenant isolation.
- Customer có hạn mức, địa chỉ, nợ quá hạn.
- Order 1 xe.
- Order nhiều xe.
- Trip đang chạy.
- Driver có COD chưa nộp.
- Supplier có expense chưa trả.
- Payroll pending approval.
- Incident open.

Tác động nếu thiếu:

- UI khó test đủ states; E2E khó ổn định.

Khuyến nghị còn lại: seed script phải implement đủ scenario để test UI/E2E.

### C-GAP-005 — Branch/task ownership plan

Trạng thái: **Đã bổ sung** tại `doc/2-PRD/09-parallel-execution-plan.md`.

Cần bổ sung:

- Task nào được sửa file nào.
- Task nào chỉ làm backend.
- Task nào chỉ làm UI mock.
- Task nào có quyền sửa Prisma schema.
- Merge order.

Tác động nếu thiếu:

- Dễ conflict schema, shared constants, generated GraphQL.

Khuyến nghị còn lại: khi tạo task thật, copy ownership block vào prompt.

## 5. Có thể giao ngay chưa?

### 5.1. Có thể giao Claude Design ngay cho deliverable đầu tiên

Có thể giao ngay nếu scope là:

- Design system foundation.
- Web shell.
- Component library.
- 3 màn hình đại diện Web: dashboard, order list, order detail.
- 3 màn hình đại diện Driver App: home, trip detail, stop detail.

Nên đọc:

1. `doc/4-DESIGN/README.md`
2. `doc/4-DESIGN/00-product-design-principles.md`
3. `doc/4-DESIGN/01-design-system.md`
4. `doc/4-DESIGN/02-web-merchant-ui.md`
5. `doc/4-DESIGN/03-driver-app-ui.md`
6. `doc/2-PRD/01-danh-sach-man-hinh.md`
7. `doc/2-PRD/03-detailed-task-specs.md`

Có thể giao UI flows full product với rủi ro vừa phải vì route map/UI flow specs đã có; vẫn nên bắt đầu bằng Web Merchant core và Driver App field workflow.

### 5.2. Có thể giao Claude Code ngay cho foundation/backend/web shell

Có thể giao ngay các task:

- P0-002 audit repo.
- FDN-001 workspace/build scripts.
- FDN-002 shared constants.
- WEB-DS-001 web design system foundation.
- FLT-DS-001 Flutter design foundation.

Không nên giao ngay các task này trước khi chốt quyết định liên quan:

- Driver auth.
- Customer auth.
- GPS retention.
- Payroll approved edit rule.

## 6. Checklist trước khi giao Claude Design

Trước khi giao design flow lớn, cần có:

- [ ] Route map từng platform.
- [ ] UI flow specs cho 8-10 luồng chính.
- [ ] Frame naming convention.
- [ ] Breakpoint/states checklist.
- [ ] Component inventory frozen cho deliverable đầu.
- [ ] Priority: Web Merchant core trước, Driver App field workflow sau, App Merchant/Customer Web sau.

## 7. Checklist trước khi giao Claude Code

Trước khi giao implementation nhiều session song song, cần có:

- [ ] Open decisions P0-001 được chốt.
- [ ] Repo baseline P0-002 được audit.
- [ ] API contract naming convention.
- [ ] Permission matrix.
- [ ] Seed scenarios.
- [ ] Module ownership/branch plan.
- [ ] Quy định task nào được sửa Prisma schema.
- [ ] CI/test command rõ.

## 8. Việc nên làm tiếp theo

Các tài liệu handoff chính đã được bổ sung:

1. `05-route-map.md`
2. `06-ui-flow-specs.md`
3. `07-api-contract-map.md`
4. `08-permission-matrix.md`
5. `09-parallel-execution-plan.md`
6. `doc/3-TECHNICAL/SEED-SCENARIOS.md`

Việc tiếp theo nên làm là chạy P0:

1. Chốt open decisions.
2. Audit repo baseline.
3. Tạo task prompt đầu tiên cho Claude Design và Claude Code.
