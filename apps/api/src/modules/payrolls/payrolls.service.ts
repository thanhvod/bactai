import { Injectable } from '@nestjs/common';
import {
  MIN_REASON_LENGTH,
  PAYROLL_EDITABLE_STATUSES,
  PAYROLL_STATUS,
  TRIP_RUNNING_STATUSES,
  formatVnd,
  generatePayrollSchema,
  labelOf,
  payrollDeductionSchema,
  payrollLineTotals,
  payrollPeriodFor,
  salaryForPeriod,
  toDbDate,
  type PayrollItemType,
  type PayrollPeriodType,
  type PayrollStatus,
} from '@bta/shared';
import { big, num } from '@bta/db';
import { AuditService } from '../../common/audit/audit.service';
import { assertPermission, assertSensitive, hasPermission } from '../../common/auth/sensitive';
import { currentPrincipal } from '../../common/context/request-context';
import { businessRule, conflict, forbidden, notFound, reasonRequired } from '../../common/errors/app-error';
import { FinanceCalcService } from '../../common/finance/finance-calc.service';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NotifyService } from '../../common/notifications/notify.service';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService, type Tx } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { CatalogsService } from '../catalogs/catalogs.service';
import type { GeneratePayrollInput, PayrollFilter, PayrollItemInput } from './payrolls.types';

/** Ngày thuần (cột @db.Date) — lưu 00:00 UTC để không lệch ngày. */
export const dbDate = (iso: string) => toDbDate(iso);
const dayStart = (iso: string) => new Date(`${iso}T00:00:00+07:00`);
const dayEnd = (iso: string) => new Date(`${iso}T23:59:59.999+07:00`);

interface DraftItem {
  type: PayrollItemType;
  amount: number;
  description: string;
  tripId?: string | null;
  expenseId?: string | null;
  itemDate?: Date | null;
  sourceRef?: string | null;
  reasonId?: string | null;
  note?: string | null;
}

interface DraftLine {
  driverId: string;
  driverName: string;
  driverCode: string;
  baseSalary: number;
  salaryEffectiveFrom: Date | null;
  items: DraftItem[];
  anomalies: string[];
  excluded: { code: string; kind: string; description: string; amount: number; date: Date | null; reason: string }[];
}

@Injectable()
export class PayrollsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly notify: NotifyService,
    private readonly finance: FinanceCalcService,
    private readonly catalogs: CatalogsService,
  ) {}

  private me(): string | null {
    const p = currentPrincipal();
    return p?.type === 'USER' ? p.membershipId ?? null : null;
  }

  // ---------------- Kỳ lương & dựng dòng lương từ dữ liệu gốc ----------------

  async period(year: number, month: number) {
    const s = await this.prisma.db.merchantSettings.findFirst({});
    return payrollPeriodFor(year, month, (s?.payrollPeriodType ?? 'MONTHLY') as PayrollPeriodType, s?.payrollStartDay ?? 1);
  }

  /** Bảng lương không-hủy nào đè lên kỳ này (so khoảng ngày). */
  private async overlapping(from: string, to: string, exceptId?: string) {
    return this.prisma.db.payroll.findFirst({
      where: { status: { not: 'CANCELLED' }, periodFrom: { lte: dbDate(to) }, periodTo: { gte: dbDate(from) }, ...(exceptId ? { id: { not: exceptId } } : {}) },
    });
  }

  private async buildLines(period: { from: string; to: string }, driverIds?: string[] | null): Promise<DraftLine[]> {
    const start = dayStart(period.from);
    const end = dayEnd(period.to);
    const bonusTripWhere: any = {
      status: 'COMPLETED',
      driverBonusAmount: { gt: 0 },
      OR: [{ actualEndAt: { gte: start, lte: end } }, { actualEndAt: null, plannedStartAt: { gte: start, lte: end } }],
      payrollItems: { none: { type: 'BONUS', line: { payroll: { status: { not: 'CANCELLED' } } } } },
    };
    const drivers = await this.prisma.db.driver.findMany({
      where: driverIds?.length
        ? { id: { in: driverIds } }
        : { OR: [{ status: 'ACTIVE' }, { trips: { some: bonusTripWhere } }] },
      include: { salaryHistory: true },
      orderBy: { name: 'asc' },
    });
    const ids = drivers.map((d) => d.id);
    const [trips, advances, running, ledgers, excludedExpenses] = await Promise.all([
      this.prisma.db.trip.findMany({ where: { ...bonusTripWhere, driverId: { in: ids } }, include: { order: { select: { code: true } } }, orderBy: { plannedStartAt: 'asc' } }),
      this.prisma.db.expense.findMany({
        where: {
          driverId: { in: ids }, kind: 'SALARY_ADVANCE', status: 'ACTIVE', expenseDate: { lte: dbDate(period.to) },
          payrollItems: { none: { line: { payroll: { status: { not: 'CANCELLED' } } } } },
        },
        orderBy: { expenseDate: 'asc' },
      }),
      this.prisma.db.trip.groupBy({ by: ['driverId'], where: { driverId: { in: ids }, status: { in: TRIP_RUNNING_STATUSES } }, _count: true }),
      this.finance.driverLedgers(ids),
      this.prisma.db.expense.findMany({
        where: {
          driverId: { in: ids }, status: 'ACTIVE', expenseDate: { gte: dbDate(period.from), lte: dbDate(period.to) },
          OR: [{ kind: 'TRIP_ADVANCE' }, { paidBy: 'DRIVER', reimbursable: true }],
        },
        orderBy: { expenseDate: 'asc' },
      }),
    ]);
    return drivers.map((d) => {
      const salary = salaryForPeriod(d.salaryHistory.map((h) => ({ amount: h.amount, effectiveFrom: h.effectiveFrom })), period.to);
      const items: DraftItem[] = [];
      const anomalies: string[] = [];
      if (salary) items.push({ type: 'BASE', amount: salary.amount, description: 'Lương cố định', itemDate: null });
      else anomalies.push('Chưa có mức lương cố định');
      for (const t of trips.filter((t) => t.driverId === d.id)) {
        items.push({ type: 'BONUS', amount: num(t.driverBonusAmount), description: `Thưởng chuyến ${t.code} (đơn ${t.order.code})`, tripId: t.id, itemDate: t.actualEndAt ?? t.plannedStartAt, sourceRef: t.code });
      }
      for (const e of advances.filter((e) => e.driverId === d.id)) {
        items.push({ type: 'ADVANCE', amount: num(e.amount), description: `Ứng lương ${e.code}${e.description ? ` — ${e.description}` : ''}`, expenseId: e.id, itemDate: e.expenseDate, sourceRef: e.code });
      }
      if (d.status !== 'ACTIVE') anomalies.push('Tài xế đã ngừng hoạt động');
      const run = (running.find((r: any) => r.driverId === d.id) as any)?._count ?? 0;
      if (run) anomalies.push(`Còn ${run} chuyến đang chạy`);
      const ledger = ledgers.get(d.id);
      if (ledger && ledger.codHeld > 0) anomalies.push(`Đang giữ COD ${formatVnd(ledger.codHeld)}`);
      return {
        driverId: d.id,
        driverName: d.name,
        driverCode: d.code,
        baseSalary: salary?.amount ?? 0,
        salaryEffectiveFrom: salary ? new Date(salary.effectiveFrom) : null,
        items,
        anomalies,
        excluded: excludedExpenses
          .filter((e) => e.driverId === d.id)
          .map((e) => ({
            code: e.code, kind: e.kind, description: e.description ?? '', amount: num(e.amount), date: e.expenseDate,
            reason: e.kind === 'TRIP_ADVANCE' ? 'Tạm ứng chuyến — đối soát theo chuyến, không trừ lương' : 'Chi phí tài xế chi trước — hoàn qua phiếu chi, không cộng lương',
          })),
      };
    });
  }

  private lineView(l: DraftLine & { id?: string; payrollId?: string; note?: string | null }) {
    const t = payrollLineTotals(l.items);
    return {
      id: l.id ?? null, payrollId: l.payrollId ?? '', driverId: l.driverId, driverName: l.driverName, driverCode: l.driverCode,
      baseSalary: l.baseSalary, salaryEffectiveFrom: l.salaryEffectiveFrom,
      bonusTotal: t.bonus, advanceTotal: t.advance, deductionTotal: t.deduction, adjustmentTotal: t.adjustment, netAmount: t.net,
      anomalies: l.anomalies, note: l.note ?? null, excluded: l.excluded,
      items: l.items.map((i) => ({ ...i, id: null })),
    };
  }

  private totalsOf(lines: { baseSalary?: number; items: { type: PayrollItemType; amount: number | bigint }[] }[]) {
    const all = lines.map((l) => payrollLineTotals(l.items));
    const sum = (k: keyof (typeof all)[number]) => all.reduce((s, x) => s + x[k], 0);
    return { salary: sum('base'), bonus: sum('bonus'), advance: sum('advance'), deduction: sum('deduction'), adjustment: sum('adjustment'), net: sum('net'), driverCount: lines.length };
  }

  async preview(input: GeneratePayrollInput) {
    const data = parse(generatePayrollSchema, input);
    const period = await this.period(data.year, data.month);
    const lines = await this.buildLines(period, data.driverIds);
    const conflictP = await this.overlapping(period.from, period.to);
    const warnings: string[] = [];
    if (conflictP) warnings.push(`Kỳ này đã có bảng lương ${conflictP.code} (${labelOf(PAYROLL_STATUS, conflictP.status)})`);
    const anomalyCount = lines.filter((l) => l.anomalies.length).length;
    if (anomalyCount) warnings.push(`${anomalyCount} tài xế cần kiểm tra (COD đang giữ, chuyến đang chạy, chưa có lương...)`);
    return {
      periodFrom: period.from, periodTo: period.to, periodLabel: period.label,
      lines: lines.map((l) => this.lineView(l)), totals: this.totalsOf(lines), warnings, conflictPayrollCode: conflictP?.code ?? null,
    };
  }

  // ---------------- Ghi DB ----------------

  /** Tính lại tổng dòng + bảng lương từ items (snapshot lưu DB, không đọc lại dữ liệu gốc). */
  private async recalc(tx: Tx, payrollId: string) {
    const lines = await tx.payrollLine.findMany({ where: { payrollId }, include: { items: true } });
    for (const l of lines) {
      const t = payrollLineTotals(l.items.map((i) => ({ type: i.type as PayrollItemType, amount: i.amount })));
      await tx.payrollLine.update({
        where: { id: l.id },
        data: { baseSalary: big(t.base), bonusTotal: big(t.bonus), advanceTotal: big(t.advance), deductionTotal: big(t.deduction), adjustmentTotal: big(t.adjustment), netAmount: big(t.net) },
      });
    }
    const tot = this.totalsOf(lines.map((l) => ({ items: l.items.map((i) => ({ type: i.type as PayrollItemType, amount: i.amount })) })));
    await tx.payroll.update({
      where: { id: payrollId },
      data: { salaryTotal: big(tot.salary), bonusTotal: big(tot.bonus), advanceTotal: big(tot.advance), deductionTotal: big(tot.deduction), adjustmentTotal: big(tot.adjustment), netTotal: big(tot.net) },
    });
  }

  async generate(input: GeneratePayrollInput) {
    const data = parse(generatePayrollSchema, input);
    const period = await this.period(data.year, data.month);
    const existing = await this.overlapping(period.from, period.to);
    if (existing) throw conflict(`Kỳ ${period.label} đã có bảng lương ${existing.code} (${labelOf(PAYROLL_STATUS, existing.status)})`);
    const lines = await this.buildLines(period, data.driverIds);
    if (!lines.length) throw businessRule('Không có tài xế nào để tạo bảng lương');
    const me = this.me();
    const id = await this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('PAYROLL', tx);
      const p = await tx.payroll.create({
        data: { code, periodFrom: dbDate(period.from), periodTo: dbDate(period.to), periodLabel: period.label, status: 'DRAFT', note: data.note ?? null, createdByUserId: me } as any,
      });
      for (const l of lines) {
        const line = await tx.payrollLine.create({
          data: {
            payrollId: p.id, driverId: l.driverId, driverName: l.driverName, baseSalary: big(l.baseSalary), salaryEffectiveFrom: l.salaryEffectiveFrom,
            anomalies: l.anomalies.length ? l.anomalies : undefined,
          } as any,
        });
        if (l.items.length) {
          await tx.payrollLineItem.createMany({
            data: l.items.map((i) => ({
              lineId: line.id, type: i.type, amount: big(i.amount), description: i.description, tripId: i.tripId ?? null, expenseId: i.expenseId ?? null,
              itemDate: i.itemDate ?? null, createdByUserId: me,
            })) as any,
          });
        }
      }
      await this.recalc(tx, p.id);
      await this.audit.log({ entityType: 'PAYROLL', entityId: p.id, category: 'CREATE', action: 'payroll.generate', summary: `Tạo bảng lương ${code} · ${period.label} · ${lines.length} tài xế` }, tx);
      await this.audit.statusChange({ entityType: 'PAYROLL', entityId: p.id, from: null, to: 'DRAFT' }, tx);
      return p.id;
    });
    return this.get(id);
  }

  private async load(id: string) {
    const p = await this.prisma.db.payroll.findFirst({ where: { id } });
    if (!p) throw notFound('bảng lương');
    return p;
  }

  private assertEditable(status: string) {
    if (!PAYROLL_EDITABLE_STATUSES.includes(status as PayrollStatus)) {
      throw businessRule(status === 'PAID' ? 'Bảng lương đã chi trả không được sửa; chênh lệch điều chỉnh ở kỳ sau' : 'Chỉ sửa được bảng lương Nháp hoặc Bị trả về (cần trả về nháp trước)');
    }
  }

  async addItem(input: PayrollItemInput) {
    const data = parse(payrollDeductionSchema, input);
    const type = (data.type ?? 'DEDUCTION') as PayrollItemType;
    const line = await this.prisma.db.payrollLine.findFirst({ where: { id: data.lineId }, include: { payroll: true } });
    if (!line) throw notFound('dòng lương');
    const reason = type === 'DEDUCTION' ? assertSensitive('payroll.line.update', data.reason ?? data.note ?? data.description) : (assertPermission('payroll.line.update'), data.reason ?? null);
    this.assertEditable(line.payroll.status);
    if (type !== 'ADJUSTMENT' && data.amount <= 0) throw businessRule('Số tiền phải > 0');
    await this.prisma.tx(async (tx) => {
      await tx.payrollLineItem.create({
        data: { lineId: line.id, type, amount: big(data.amount), description: data.description, reasonId: data.reasonId ?? null, note: data.note ?? null, itemDate: new Date(), createdByUserId: this.me() } as any,
      });
      await this.recalc(tx, line.payrollId);
      await this.audit.log({
        entityType: 'PAYROLL', entityId: line.payrollId, category: type === 'DEDUCTION' ? 'SENSITIVE' : 'MONEY', sensitive: type === 'DEDUCTION',
        action: 'payroll.item.add', summary: `${type === 'DEDUCTION' ? 'Giảm trừ' : type === 'ADJUSTMENT' ? 'Điều chỉnh' : 'Thưởng'} ${formatVnd(data.amount)} cho ${line.driverName}: ${data.description}`,
        reason, after: { type, amount: data.amount, description: data.description },
      }, tx);
    });
    return this.line(line.id);
  }

  async removeItem(itemId: string, reason: string) {
    const item = await this.prisma.db.payrollLineItem.findFirst({ where: { id: itemId }, include: { line: { include: { payroll: true } } } });
    if (!item) throw notFound('khoản lương');
    const r = assertSensitive('payroll.line.update', reason);
    this.assertEditable(item.line.payroll.status);
    if (item.type === 'BASE') throw businessRule('Không gỡ lương cố định; đổi mức lương ở hồ sơ tài xế rồi tạo lại bảng lương');
    await this.prisma.tx(async (tx) => {
      await tx.payrollLineItem.delete({ where: { id: item.id } });
      await this.recalc(tx, item.line.payrollId);
      await this.audit.log({
        entityType: 'PAYROLL', entityId: item.line.payrollId, category: 'SENSITIVE', sensitive: true, action: 'payroll.item.remove',
        summary: `Gỡ khoản "${item.description}" (${formatVnd(num(item.amount))}) của ${item.line.driverName}`, reason: r,
        before: { type: item.type, amount: num(item.amount), description: item.description },
      }, tx);
    });
    return this.line(item.lineId);
  }

  private async transition(id: string, from: PayrollStatus[], to: PayrollStatus, data: Record<string, unknown>, log: { action: string; summary: string; reason?: string | null; sensitive?: boolean }) {
    const p = await this.load(id);
    if (!from.includes(p.status as PayrollStatus)) {
      throw businessRule(`Không thể chuyển bảng lương từ "${labelOf(PAYROLL_STATUS, p.status)}" sang "${labelOf(PAYROLL_STATUS, to)}"`);
    }
    await this.prisma.tx(async (tx) => {
      await tx.payroll.update({ where: { id }, data: { status: to, ...data } as any });
      await this.audit.statusChange({ entityType: 'PAYROLL', entityId: id, from: p.status, to, reason: log.reason ?? null }, tx);
      await this.audit.log({ entityType: 'PAYROLL', entityId: id, category: log.sensitive ? 'SENSITIVE' : 'STATUS', sensitive: !!log.sensitive, action: log.action, summary: log.summary, reason: log.reason ?? null, before: { status: p.status }, after: { status: to } }, tx);
    });
    return p;
  }

  async submit(id: string) {
    const p = await this.transition(id, ['DRAFT', 'RETURNED'], 'SUBMITTED', { submittedAt: new Date(), submittedByUserId: this.me() }, { action: 'payroll.submit', summary: 'Gửi duyệt bảng lương' });
    await this.notify.toUsersWithPermission('payroll.approve', {
      type: 'PAYROLL_SUBMITTED', title: `Bảng lương ${p.code} chờ duyệt`, body: `${p.periodLabel} · thực lãnh ${formatVnd(num(p.netTotal))}`, entityType: 'PAYROLL', entityId: id, severity: 'warning',
    }, { exceptMembershipId: this.me() });
    return this.get(id);
  }

  async approve(id: string, note?: string | null) {
    const p = await this.transition(id, ['SUBMITTED'], 'APPROVED', { approvedAt: new Date(), approvedByUserId: this.me(), approvalNote: note ?? null }, { action: 'payroll.approve', summary: `Duyệt bảng lương${note ? `: ${note}` : ''}`, reason: note ?? null });
    await this.notifyCreator(p, 'PAYROLL_APPROVED', `Bảng lương ${p.code} đã được duyệt`, note ?? null);
    return this.get(id);
  }

  /** D-012: trả về nháp (kể cả đã duyệt, trước khi chi) — bắt buộc lý do. */
  async returnPayroll(id: string, reason: string) {
    const r = assertSensitive('payroll.return', reason);
    const p = await this.transition(id, ['SUBMITTED', 'APPROVED'], 'RETURNED', { returnedAt: new Date(), returnedByUserId: this.me(), returnReason: r, approvedAt: null, approvedByUserId: null }, { action: 'payroll.return', summary: 'Trả về bảng lương', reason: r, sensitive: true });
    await this.notifyCreator(p, 'PAYROLL_RETURNED', `Bảng lương ${p.code} bị trả về`, r);
    return this.get(id);
  }

  async markPaid(id: string, paidAt?: Date | null) {
    // Không tự tạo phiếu chi SALARY_PAYMENT — kế toán ghi phiếu chi riêng nếu cần theo dõi dòng tiền.
    await this.transition(id, ['APPROVED'], 'PAID', { paidAt: paidAt ?? new Date(), paidByUserId: this.me() }, { action: 'payroll.markPaid', summary: 'Đánh dấu đã chi trả lương' });
    return this.get(id);
  }

  async cancel(id: string, reason: string) {
    if (!hasPermission('payroll.return') && !hasPermission('payroll.generate')) throw forbidden();
    const r = (reason ?? '').trim();
    if (r.length < MIN_REASON_LENGTH) throw reasonRequired();
    await this.transition(id, ['DRAFT', 'RETURNED', 'SUBMITTED'], 'CANCELLED', { cancelledAt: new Date(), cancelReason: r }, { action: 'payroll.cancel', summary: 'Hủy bảng lương', reason: r, sensitive: true });
    return this.get(id);
  }

  private async notifyCreator(p: { id: string; code: string; createdByUserId: string | null; submittedByUserId: string | null }, type: 'PAYROLL_APPROVED' | 'PAYROLL_RETURNED', title: string, body: string | null) {
    const ids = [...new Set([p.createdByUserId, p.submittedByUserId].filter(Boolean) as string[])].filter((x) => x !== this.me());
    await this.notify.toRecipients(ids.map((id) => ({ type: 'USER' as const, id })), { type, title, body, entityType: 'PAYROLL', entityId: p.id, severity: type === 'PAYROLL_APPROVED' ? 'success' : 'danger' });
  }

  // ---------------- Đọc ----------------

  private async userNames(ids: (string | null | undefined)[]) {
    const clean = [...new Set(ids.filter(Boolean) as string[])];
    if (!clean.length) return new Map<string, string>();
    const users = await this.prisma.db.merchantUser.findMany({ where: { id: { in: clean } }, select: { id: true, name: true } });
    return new Map(users.map((u) => [u.id, u.name]));
  }

  private headerView(p: any, names: Map<string, string>) {
    return {
      ...p,
      totals: {
        salary: num(p.salaryTotal), bonus: num(p.bonusTotal), advance: num(p.advanceTotal), deduction: num(p.deductionTotal), adjustment: num(p.adjustmentTotal), net: num(p.netTotal),
        driverCount: p._count?.lines ?? p.lines?.length ?? 0,
      },
      createdByName: names.get(p.createdByUserId) ?? null,
      submittedByName: names.get(p.submittedByUserId) ?? null,
      approvedByName: names.get(p.approvedByUserId) ?? null,
      paidByName: names.get(p.paidByUserId) ?? null,
      anomalyCount: (p.lines ?? []).filter((l: any) => Array.isArray(l.anomalies) && l.anomalies.length).length,
    };
  }

  async list(filter: PayrollFilter = {}, page: { first?: number; after?: string | null }) {
    const where: any = {};
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.year) where.periodFrom = { gte: dbDate(`${filter.year - 1}-12-01`), lte: dbDate(`${filter.year}-12-31`) };
    if (filter.driverId) where.lines = { some: { driverId: filter.driverId } };
    const { take, skip } = pageParams(page);
    const [rows, total] = await Promise.all([
      this.prisma.db.payroll.findMany({ where, orderBy: [{ periodFrom: 'desc' }, { createdAt: 'desc' }], take, skip, include: { _count: { select: { lines: true } }, lines: { select: { anomalies: true } } } }),
      this.prisma.db.payroll.count({ where }),
    ]);
    const names = await this.userNames(rows.flatMap((p) => [p.createdByUserId, p.submittedByUserId, p.approvedByUserId, p.paidByUserId]));
    return toConnection(rows.map((p) => this.headerView(p, names)), total, skip, take);
  }

  private async itemViews(items: any[]) {
    const reasons = await this.catalogs.labels(items.map((i) => i.reasonId));
    const names = await this.userNames(items.map((i) => i.createdByUserId));
    return items.map((i) => ({
      id: i.id, type: i.type, description: i.description, amount: num(i.amount), sourceRef: i.trip?.code ?? i.expense?.code ?? null, tripId: i.tripId, expenseId: i.expenseId,
      reasonId: i.reasonId, reasonName: i.reasonId ? reasons.get(i.reasonId) ?? null : null, itemDate: i.itemDate, note: i.note, createdByName: names.get(i.createdByUserId) ?? null,
    }));
  }

  private itemsInclude = { orderBy: [{ type: 'asc' as const }, { itemDate: 'asc' as const }, { createdAt: 'asc' as const }], include: { trip: { select: { code: true } }, expense: { select: { code: true } } } };

  async get(id: string) {
    const p = await this.prisma.db.payroll.findFirst({
      where: { id },
      include: { lines: { orderBy: { driverName: 'asc' }, include: { driver: { select: { code: true } }, items: this.itemsInclude } } },
    });
    if (!p) throw notFound('bảng lương');
    const names = await this.userNames([p.createdByUserId, p.submittedByUserId, p.approvedByUserId, p.paidByUserId]);
    const lines = await Promise.all(
      p.lines.map(async (l) => ({
        ...l, driverCode: l.driver.code, baseSalary: num(l.baseSalary), bonusTotal: num(l.bonusTotal), advanceTotal: num(l.advanceTotal),
        deductionTotal: num(l.deductionTotal), adjustmentTotal: num(l.adjustmentTotal), netAmount: num(l.netAmount),
        anomalies: (l.anomalies as string[] | null) ?? [], items: await this.itemViews(l.items),
      })),
    );
    const prev = await this.prisma.db.payroll.findFirst({
      where: { status: { not: 'CANCELLED' }, periodTo: { lt: p.periodFrom }, id: { not: p.id } },
      orderBy: { periodTo: 'desc' },
      include: { lines: true },
    });
    const changes: { kind: string; message: string; driverName?: string | null; amount?: number | null }[] = [];
    for (const l of lines) {
      const pl = prev?.lines.find((x) => x.driverId === l.driverId);
      if (prev && !pl) changes.push({ kind: 'NEW_DRIVER', message: `Tài xế mới trong kỳ: ${l.driverName}`, driverName: l.driverName });
      if (pl && num(pl.baseSalary) !== l.baseSalary) changes.push({ kind: 'SALARY_CHANGED', message: `Lương cố định ${l.driverName}: ${formatVnd(num(pl.baseSalary))} → ${formatVnd(l.baseSalary)}`, driverName: l.driverName, amount: l.baseSalary - num(pl.baseSalary) });
      for (const it of l.items.filter((i) => i.type === 'DEDUCTION' || i.type === 'ADJUSTMENT')) {
        changes.push({ kind: it.type, message: `${it.type === 'DEDUCTION' ? 'Giảm trừ' : 'Điều chỉnh'} ${l.driverName}: ${it.description}`, driverName: l.driverName, amount: it.amount });
      }
      for (const a of l.anomalies) changes.push({ kind: 'ANOMALY', message: `${l.driverName}: ${a}`, driverName: l.driverName });
    }
    for (const pl of prev?.lines ?? []) if (!lines.some((l) => l.driverId === pl.driverId)) changes.push({ kind: 'REMOVED_DRIVER', message: `Không còn trong kỳ này: ${pl.driverName}`, driverName: pl.driverName });
    return {
      ...this.headerView({ ...p, lines }, names),
      lines,
      previousCode: prev?.code ?? null,
      previousTotals: prev
        ? { salary: num(prev.salaryTotal), bonus: num(prev.bonusTotal), advance: num(prev.advanceTotal), deduction: num(prev.deductionTotal), adjustment: num(prev.adjustmentTotal), net: num(prev.netTotal), driverCount: prev.lines.length }
        : null,
      changes,
    };
  }

  async line(id: string) {
    const l = await this.prisma.db.payrollLine.findFirst({ where: { id }, include: { payroll: true, driver: { select: { code: true } }, items: this.itemsInclude } });
    if (!l) throw notFound('dòng lương');
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const excludedExpenses = await this.prisma.db.expense.findMany({
      where: { driverId: l.driverId, status: 'ACTIVE', expenseDate: { gte: dbDate(iso(l.payroll.periodFrom)), lte: dbDate(iso(l.payroll.periodTo)) }, OR: [{ kind: 'TRIP_ADVANCE' }, { paidBy: 'DRIVER', reimbursable: true }] },
      orderBy: { expenseDate: 'asc' },
    });
    return {
      ...l, driverCode: l.driver.code, baseSalary: num(l.baseSalary), bonusTotal: num(l.bonusTotal), advanceTotal: num(l.advanceTotal), deductionTotal: num(l.deductionTotal),
      adjustmentTotal: num(l.adjustmentTotal), netAmount: num(l.netAmount), anomalies: (l.anomalies as string[] | null) ?? [], items: await this.itemViews(l.items),
      payrollCode: l.payroll.code, payrollStatus: l.payroll.status, periodLabel: l.payroll.periodLabel,
      excluded: excludedExpenses.map((e) => ({
        code: e.code, kind: e.kind, description: e.description ?? '', amount: num(e.amount), date: e.expenseDate,
        reason: e.kind === 'TRIP_ADVANCE' ? 'Tạm ứng chuyến — đối soát theo chuyến, không trừ lương' : 'Chi phí tài xế chi trước — hoàn qua phiếu chi, không cộng lương',
      })),
    };
  }

  /** Dòng lương của một tài xế qua các kỳ (WM-DRV-04). */
  async driverLines(driverId: string) {
    const lines = await this.prisma.db.payrollLine.findMany({ where: { driverId, payroll: { status: { not: 'CANCELLED' } } }, include: { payroll: true }, orderBy: { payroll: { periodFrom: 'desc' } } });
    return lines.map((l) => ({
      ...l, baseSalary: num(l.baseSalary), bonusTotal: num(l.bonusTotal), advanceTotal: num(l.advanceTotal), deductionTotal: num(l.deductionTotal), adjustmentTotal: num(l.adjustmentTotal),
      netAmount: num(l.netAmount), anomalies: (l.anomalies as string[] | null) ?? [], items: [], payrollCode: l.payroll.code, payrollStatus: l.payroll.status, periodLabel: l.payroll.periodLabel,
    }));
  }
}
