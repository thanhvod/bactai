# PRD — ORCA Code Handoff Packet

> Ngày lập: 2026-09-23
> Mục tiêu: gói hướng dẫn ngắn gọn để giao ORCA Code bắt đầu implementation mà không phải tự lần mò toàn bộ tài liệu.

## 1. Kết luận readiness

**Có thể đưa ORCA Code vào làm ngay**, nhưng nên bắt đầu từ nhóm P0/P1 trước.

Trạng thái theo nhóm:

| Nhóm | Ready? | Ghi chú |
|---|---:|---|
| Repo audit / baseline | ✅ | Có thể giao ngay task P0-002 |
| Workspace/shared constants | ✅ | Có thể giao FDN-001, FDN-002 sau audit |
| Web design system / shell | ✅ | Có thể giao WEB-DS-001/002 |
| Flutter design foundation | ✅ | Có thể giao FLT-DS-001 |
| Backend auth/tenant/RBAC | ⚠️ | Web merchant auth đã chốt Google/Firebase; driver/customer auth còn cần quyết định trước phần liên quan |
| Order/dispatch backend/web | ✅ | Có thể làm sau Foundation + Master Data |
| Driver App real integration | ⚠️ | Cần chốt driver auth trước DRV-API-001 |
| Finance/payroll/report | ✅ | Có specs, nhưng phụ thuộc order/dispatch/master data |
| App Merchant | ⚠️ | Specs đủ mức phase 2; nên làm sau Phase 1 API stable |
| Web Khách hàng | ⚠️ | Specs đủ mức phase 3; cần chốt customer auth/public profile trước code thật |

## 2. ORCA Code phải đọc trước

### Nếu làm bất kỳ task nào

1. `doc/2-PRD/00-prd.md`
2. `doc/2-PRD/02-implementation-breakdown.md`
3. `doc/2-PRD/03-detailed-task-specs.md`
4. `doc/2-PRD/09-parallel-execution-plan.md`
5. `doc/3-TECHNICAL/ARCHITECTURE.md`

### Nếu task có UI

Đọc thêm:

1. `doc/2-PRD/01-danh-sach-man-hinh.md`
2. `doc/2-PRD/05-route-map.md`
3. `doc/2-PRD/06-ui-flow-specs.md`
4. `doc/4-DESIGN/00-product-design-principles.md`
5. `doc/4-DESIGN/01-design-system.md`
6. `doc/4-DESIGN/02-web-merchant-ui.md` nếu Web Merchant
7. `doc/4-DESIGN/03-driver-app-ui.md` nếu Driver App

### Nếu task có API/backend

Đọc thêm:

1. `doc/2-PRD/07-api-contract-map.md`
2. `doc/2-PRD/08-permission-matrix.md`
3. `doc/3-TECHNICAL/SEED-SCENARIOS.md`

## 3. Những open decisions cần chốt trước một số task

Không block mọi việc, nhưng block các task liên quan:

| Decision | Block task |
|---|---|
| Driver auth dùng Firebase hay credential riêng | MD-004 app account details, DRV-API-001, Driver App login |
| Customer auth phase 3 | CW-001, CW-003, CW-004 |
| Job queue BullMQ/Redis hay inline abstraction | PDF/export/import/background jobs |
| GPS retention | GPS cleanup/downsample policy, không block GPS MVP |
| Payroll approved edit rule | PAY-002/PAY-003 behavior after approval |
| Production hosting target | Deploy/ops tasks, không block local implementation |

## 4. Task nên giao đầu tiên cho ORCA Code

### Recommended first task: P0-002

Giao ORCA audit repo trước khi code:

```text
Bạn thực hiện task P0-002 — Audit repo hiện tại và xác định baseline cho BTA.

Đọc trước:
- doc/2-PRD/02-implementation-breakdown.md
- doc/2-PRD/03-detailed-task-specs.md
- doc/2-PRD/09-parallel-execution-plan.md
- doc/3-TECHNICAL/ARCHITECTURE.md

Scope:
- Kiểm tra apps/packages hiện có: api, web, driver-app, db, shared, shadcn, ui.
- Kiểm tra package manager, Nx config, scripts build/test/lint.
- Chạy các command an toàn để xác định baseline.
- Ghi lại phần đã xong, phần lỗi, phần lệch với docs.

Non-goals:
- Không sửa code nghiệp vụ.
- Không xóa/revert thay đổi.
- Không chạy migration destructive.

Acceptance:
- Có báo cáo baseline rõ.
- Có danh sách command đã chạy và kết quả.
- Có đề xuất task tiếp theo nên làm.
```

### Sau P0-002, task tốt để chạy song song

- FDN-001 — Monorepo/build scripts.
- FDN-002 — Shared constants.
- WEB-DS-001 — Web design system foundation.
- FLT-DS-001 — Flutter design foundation.

## 5. ORCA Code guardrails

ORCA Code phải tuân thủ:

- Không tự đổi business rule trong BRD/PRD.
- Không hard-code tenant/status/permission ngoài shared constants.
- API phải enforce tenant.
- Sensitive action phải permission + reason + audit.
- Tiền VND lưu integer.
- UI phải có loading/empty/error/no-permission state.
- Không nhầm doanh thu với phiếu thu hoặc COD remittance.
- Không xóa cứng dữ liệu nghiệp vụ đã phát sinh giao dịch.
- Không sửa Prisma schema nếu task không được đánh dấu schema owner.
- Nếu task dùng mock data, phải có adapter rõ để thay bằng API thật.

## 6. Ownership reminder

Trước khi ORCA bắt đầu mỗi task, copy thêm block này:

```text
Ownership:
- You may edit: <paths>
- Do not edit: <paths>
- Schema changes allowed: yes/no
- Codegen allowed: yes/no

Merge assumptions:
- Base includes tasks: <task IDs>
- Parallel tasks likely touching nearby files: <task IDs>
```

Nguồn ownership: `doc/2-PRD/09-parallel-execution-plan.md`.

## 7. Definition of Done cho ORCA task

Một task ORCA xong khi:

- Scope đúng task, không lan sang module khác.
- Build/typecheck/test/lint phù hợp đã chạy hoặc nêu rõ vì sao không chạy.
- Nếu đổi schema: có migration/seed update.
- Nếu đổi API: contract rõ, tenant/permission đúng.
- Nếu đổi UI: đủ loading/empty/error/no-permission.
- Nếu action nhạy cảm: có reason + audit.
- Có ghi chú kết quả và follow-up nếu còn blocker.

## 8. Kết luận thực tế

Đưa ORCA Code được rồi, nhưng **đừng giao thẳng full product implementation ngay**.

Thứ tự an toàn:

1. P0-002 audit repo.
2. P0-001 chốt decisions còn mở song song với audit.
3. P1 Foundation.
4. P2 Master Data.
5. P3/P4 Order + Driver App MVP.
6. P5/P6 Finance + Payroll + Reports.
7. P7 hardening.
8. P8/P9 app merchant/customer web.

