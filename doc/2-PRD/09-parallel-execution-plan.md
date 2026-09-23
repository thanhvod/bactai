# PRD — Parallel Execution & Ownership Plan

> Ngày lập: 2026-09-23
> Mục tiêu: giúp chạy nhiều Claude Code task song song mà giảm conflict, đặc biệt ở Prisma schema, shared constants, generated GraphQL và UI component nền.

## 1. Nguyên tắc ownership

- Mỗi task chỉ sửa module được giao.
- Schema changes phải được serialize theo phase hoặc thông qua task owner.
- Shared constants là dependency chung, không tự thêm enum riêng trong feature.
- UI shared components do design-system owner quản lý.
- Generated files chỉ update bởi task được giao codegen.
- Nếu task cần sửa ngoài ownership, phải ghi rõ trong PR/task note.

## 2. Branch naming

| Type | Pattern | Example |
|---|---|---|
| Foundation | `codex/fdn-<id>-<slug>` | `codex/fdn-003-prisma-foundation` |
| Master data | `codex/md-<id>-<slug>` | `codex/md-003-customers` |
| Order/dispatch | `codex/ord-<id>-<slug>` | `codex/ord-002-stops-cargo-addons` |
| Driver app | `codex/drv-<id>-<slug>` | `codex/drv-act-003-cod-input` |
| Finance | `codex/fin-<id>-<slug>` | `codex/fin-003-payment-allocation` |
| Payroll/report | `codex/pay-<id>-<slug>` | `codex/pay-001-payroll-generation` |
| Design | `codex/design-<slug>` | `codex/design-web-shell` |

## 3. Schema ownership

Only these tasks should modify Prisma schema by default:

| Phase | Schema owner tasks | Notes |
|---|---|---|
| P1 | FDN-003 | Tenant/auth/audit/attachment/catalog base |
| P2 | MD-003, MD-004, MD-005, MD-006, MD-007 | Master data only |
| P3 | ORD-001, ORD-002, DIS-001, DIS-005, DIS-006 | Order/dispatch only |
| P4 | DRV-API-001, GPS-001 | Driver auth/job/GPS only |
| P5 | FIN-001, FIN-002, FIN-003, FIN-006, FIN-007 | Finance only |
| P6 | PAY-001, PDF-001 | Payroll/debt statement only |
| P8 | MA tasks should avoid schema unless mobile-specific device/session table needed |
| P9 | CW-001, CW-003 | Customer auth/booking only |

Rule:

- Do not let two schema owner tasks in the same table group run unmerged at the same time.
- If unavoidable, create one "schema contract" branch first, then feature branches build on it.

## 4. Module ownership by path

| Area | Primary paths | Owner tasks |
|---|---|---|
| Shared constants | `packages/shared` | FDN-002 |
| Prisma schema/seed | `packages/db` | Schema owner tasks |
| API auth/tenant | `apps/api/src/modules/auth`, common guards | FDN-004/005 |
| API catalogs/master data | `apps/api/src/modules/{customers,drivers,vehicles,suppliers,catalogs}` | MD tasks |
| API orders/trips | `apps/api/src/modules/{orders,trips,dispatch}` | ORD/DIS tasks |
| API finance | `apps/api/src/modules/finance` | FIN tasks |
| API payroll/reports | `apps/api/src/modules/{payrolls,reports}` | PAY/RPT tasks |
| Web shell/design system | `apps/web/src/app/layout`, shared components | WEB-DS tasks |
| Web pages master data | `apps/web/src/app/pages/*customer*`, etc. | MD tasks |
| Web order/dispatch | `apps/web/src/app/pages/*order*`, dispatch/trip pages | ORD/DIS tasks |
| Driver app | `apps/driver-app/lib` | DRV/GPS tasks |
| App Merchant | future app path | MA tasks |
| Customer Web | future app path | CW tasks |

## 5. Recommended merge order

### Wave 1

1. FDN-001.
2. FDN-002.
3. FDN-003.
4. FDN-004.
5. FDN-005/006/007/008 can merge after FDN-004.
6. WEB-DS-001/002 and FLT-DS-001 can merge once compile stable.

### Wave 2

1. MD schema changes in this order: MD-007 catalogs, MD-003 customers, MD-004 drivers, MD-005 vehicles, MD-006 suppliers.
2. MD APIs.
3. MD Web screens.

### Wave 3

1. ORD-001.
2. ORD-002.
3. DIS-001.
4. DIS-004 status service.
5. DIS-002 overlap and DIS-003 UI.
6. DIS-005/006.

### Wave 4

1. DRV-API-001.
2. DRV-UI-001/002.
3. DRV-ACT-001.
4. DRV-ACT-002/003/004.
5. GPS-001/002/003.

### Wave 5

1. FIN-001 and FIN-002 schema/API.
2. FIN-003 allocation.
3. FIN-004/005/006.
4. FIN-007/008.

### Wave 6

1. PAY-001.
2. PAY-002/003.
3. PDF-001.
4. RPT-001/002.
5. IMP/EXP.

## 6. Parallel-safe task groups

Can run in parallel after dependencies:

- WEB-DS-001 and FDN-003.
- FLT-DS-001 and Web design system.
- MD-003/004/005/006 UI if API contracts fixed.
- ORD-003 UI mock and DIS-001 backend.
- Driver App UI mock and Web order/dispatch backend.
- FIN-001 and FIN-002.
- FIN-004/005/006 after base finance.
- MA-002 and MA-003 after MA-001.
- CW-001 and CW-002 after customer auth/public profile decisions.

## 7. High-risk conflict areas

| Area | Risk | Mitigation |
|---|---|---|
| Prisma schema | migration conflicts | serialize schema owner tasks |
| Shared status constants | enum drift | FDN-002 owns changes; feature requests additions |
| GraphQL generated types | churn | one codegen owner per wave |
| Web DataTable/Form components | inconsistent API | WEB-DS owner reviews usage |
| Finance formulas | inconsistent reports | central finance calculation service |
| Driver offline queue | duplicated local logic | DRV-ACT-001 owns queue abstraction |
| Permission checks | UI/backend mismatch | use `08-permission-matrix.md` and shared constants |

## 8. Claude Code task prompt additions

Every task should include:

```text
Ownership:
- You may edit: <paths>
- Do not edit: <paths>
- Schema changes allowed: yes/no
- Codegen allowed: yes/no

Merge assumptions:
- Base branch includes: <task ids>
- Parallel tasks likely touching nearby files: <task ids>
```

