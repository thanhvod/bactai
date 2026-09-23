import { Injectable } from '@nestjs/common';
import { EXPENSE_KIND, RECEIVABLE_ORDER_STATUSES, diffVnDays, formatVnd, type ExpenseKind } from '@bta/shared';
import { num } from '@bta/db';
import { assertPermission, hasPermission } from '../../common/auth/sensitive';
import { currentMerchantId, currentPrincipal } from '../../common/context/request-context';
import { forbidden, notFound } from '../../common/errors/app-error';
import { FinanceCalcService } from '../../common/finance/finance-calc.service';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NotifyService } from '../../common/notifications/notify.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdvanceService } from './advance.service';
import { ExpensesService } from './expenses.service';
import { EXPENSE_INCLUDE, dateOnly, isNotRevenue, paymentTypeLabel, vnDayEnd, vnDayStart } from './finance.helpers';
import type { CustomerDebtFilter, DriverCodHeldFilter, FinanceLedgerFilter, SupplierDebtFilter } from './finance.types';
import { PaymentsService } from './payments.service';

function asOfDate(asOf?: string) {
  return asOf ? vnDayEnd(asOf) : new Date();
}

@Injectable()
export class DebtService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly finance: FinanceCalcService,
    private readonly expenses: ExpensesService,
    private readonly payments: PaymentsService,
    private readonly advances: AdvanceService,
    private readonly notify: NotifyService,
  ) {}

  // ---------------- FIN-004 công nợ khách ----------------

  async customerDebt(filter: CustomerDebtFilter = {}) {
    const asOf = asOfDate(filter.asOf);
    const customers = await this.prisma.db.customer.findMany({
      where: {
        ...(filter.customerId ? { id: filter.customerId } : {}),
        ...(filter.search ? { OR: [{ name: { contains: filter.search, mode: 'insensitive' } }, { code: { contains: filter.search, mode: 'insensitive' } }, { phone: { contains: filter.search } }] } : {}),
      },
      select: { id: true, code: true, name: true, phone: true },
      orderBy: { name: 'asc' },
    });
    if (filter.customerId && !customers.length) throw notFound('khách hàng');
    const summaries = await this.finance.customerDebtSummaries(customers.map((c) => c.id), asOf);
    let rows = customers.map((c) => ({ customer: { id: c.id, code: c.code, name: c.name }, phone: c.phone, ...summaries.get(c.id)! }));
    if (!filter.customerId) rows = rows.filter((r) => r.remaining !== 0 || r.creditBalance > 0);
    if (filter.overdueOnly) rows = rows.filter((r) => r.overdueOrders > 0);
    if (filter.overLimit) rows = rows.filter((r) => r.overLimit);
    if (filter.hasCredit) rows = rows.filter((r) => r.creditBalance > 0);
    rows.sort((a, b) => b.overdueAmount - a.overdueAmount || b.remaining - a.remaining);

    let orders: any[] = [];
    if (filter.customerId) {
      const debts = await this.finance.orderDebts({ customerId: filter.customerId, status: { in: RECEIVABLE_ORDER_STATUSES } }, asOf);
      const open = filter.openOnly === false ? debts : debts.filter((d) => d.remaining > 0);
      const lines = await this.prisma.db.debtStatementLine.findMany({
        where: { orderId: { in: open.map((d) => d.orderId) }, statement: { status: { in: ['FINALIZED', 'SENT'] } } },
        select: { orderId: true, statement: { select: { code: true, createdAt: true } } },
      });
      orders = open.map((d) => {
        const st = lines.filter((l) => l.orderId === d.orderId).sort((a, b) => b.statement.createdAt.getTime() - a.statement.createdAt.getTime())[0];
        return { orderId: d.orderId, code: d.code, customerId: d.customerId, status: d.status, orderDate: d.orderDate, routeSummary: d.routeSummary, total: d.receivable, allocated: d.paid, remaining: d.remaining, dueDate: d.dueDate, overdueDays: d.overdueDays, statementCode: st?.statement.code ?? null };
      });
    }
    const sum = (k: 'receivable' | 'paid' | 'remaining' | 'overdueAmount' | 'creditBalance') => rows.reduce((s, r) => s + r[k], 0);
    return {
      rows,
      orders,
      totals: { receivable: sum('receivable'), paid: sum('paid'), remaining: sum('remaining'), overdueAmount: sum('overdueAmount'), creditBalance: sum('creditBalance'), customerCount: rows.length },
    };
  }

  // ---------------- FIN-005 công nợ NCC ----------------

  async supplierDebt(filter: SupplierDebtFilter = {}) {
    const asOf = asOfDate(filter.asOf);
    const rows = await this.prisma.db.expense.findMany({
      where: {
        supplierId: filter.supplierId ? filter.supplierId : { not: null },
        status: 'ACTIVE', paidStatus: 'UNPAID', paidBy: 'COMPANY',
        expenseDate: { lte: asOf },
      },
      include: EXPENSE_INCLUDE,
      orderBy: { expenseDate: 'asc' },
    });
    const views = await this.expenses.views(rows);
    const bySupplier = new Map<string, any>();
    for (const e of views) {
      const key = e.supplierId as string;
      if (!bySupplier.has(key)) bySupplier.set(key, { supplier: e.supplier, unpaidTotal: 0, aging: { d0_15: 0, d16_30: 0, d31_60: 0, d60p: 0 }, oldestDays: 0, unpaidCount: 0, expenses: [] });
      const r = bySupplier.get(key);
      const days = Math.max(diffVnDays(e.expenseDate, asOf), 0);
      r.unpaidTotal += e.amount;
      r.unpaidCount += 1;
      r.oldestDays = Math.max(r.oldestDays, days);
      r.aging[days <= 15 ? 'd0_15' : days <= 30 ? 'd16_30' : days <= 60 ? 'd31_60' : 'd60p'] += e.amount;
      r.expenses.push(e);
    }
    if (filter.supplierId && !bySupplier.size) {
      const s = await this.prisma.db.supplier.findFirst({ where: { id: filter.supplierId } });
      if (!s) throw notFound('nhà cung cấp');
      bySupplier.set(s.id, { supplier: { id: s.id, code: s.code, name: s.name }, unpaidTotal: 0, aging: { d0_15: 0, d16_30: 0, d31_60: 0, d60p: 0 }, oldestDays: 0, unpaidCount: 0, expenses: [] });
    }
    const list = [...bySupplier.values()].sort((a, b) => b.unpaidTotal - a.unpaidTotal);
    return { rows: list, total: list.reduce((s, r) => s + r.unpaidTotal, 0) };
  }

  // ---------------- FIN-006 sổ tài xế & COD ----------------

  /** USER cần driverLedger.view; DRIVER chỉ xem sổ của chính mình. */
  resolveDriverId(driverId?: string | null): string {
    const p = currentPrincipal();
    if (p?.type === 'DRIVER') return p.driverId;
    if (p?.type !== 'USER') throw forbidden();
    assertPermission('driverLedger.view');
    if (!driverId) throw notFound('tài xế');
    return driverId;
  }

  async driverLedger(driverIdInput?: string | null) {
    const driverId = this.resolveDriverId(driverIdInput);
    const driver = await this.prisma.db.driver.findFirst({ where: { id: driverId } });
    if (!driver) throw notFound('tài xế');
    const summary = (await this.finance.driverLedgers([driverId])).get(driverId)!;

    const [stops, payments, expenses, deductions, trips] = await Promise.all([
      this.prisma.db.orderStop.findMany({
        where: { codActual: { gt: 0 }, assignments: { some: { trip: { driverId, status: { not: 'CANCELLED' } } } } },
        select: { id: true, locationName: true, address: true, codActual: true, codCollectedAt: true, completedAt: true, updatedAt: true, order: { select: { code: true } } },
      }),
      this.prisma.db.paymentIn.findMany({ where: { driverId, status: 'ACTIVE', type: { in: ['DRIVER_COD_REMITTANCE', 'DRIVER_ADVANCE_RETURN'] } }, orderBy: { receivedAt: 'asc' } }),
      this.prisma.db.expense.findMany({ where: { driverId, status: 'ACTIVE' }, include: EXPENSE_INCLUDE, orderBy: { expenseDate: 'asc' } }),
      this.prisma.db.payrollLineItem.findMany({
        where: { type: 'ADVANCE', expense: { driverId }, line: { payroll: { status: { in: ['APPROVED', 'PAID'] } } } },
        include: { line: { include: { payroll: { select: { code: true, approvedAt: true, updatedAt: true } } } } },
      }),
      this.prisma.db.trip.findMany({
        where: { driverId, status: { not: 'CANCELLED' }, driverBonusAmount: { gt: 0 } },
        include: { order: { select: { code: true } } },
        orderBy: { plannedStartAt: 'desc' },
        take: 50,
      }),
    ]);

    // Quy ước: driverOwes tăng số tài xế nợ công ty; companyOwes giảm số đó (tài xế đã nộp/chi, công ty nợ lại).
    type E = { date: Date; kind: string; docCode: string | null; refId: string | null; description: string; driverOwes: number; companyOwes: number };
    const entries: E[] = [];
    for (const s of stops) entries.push({ date: s.codCollectedAt ?? s.completedAt ?? s.updatedAt, kind: 'COD_COLLECTED', docCode: s.order.code, refId: s.id, description: `Thu COD tại ${s.locationName ?? s.address}`, driverOwes: num(s.codActual), companyOwes: 0 });
    for (const p of payments) {
      entries.push({
        date: p.receivedAt, kind: p.type === 'DRIVER_COD_REMITTANCE' ? 'COD_REMITTED' : 'ADVANCE_RETURN', docCode: p.code, refId: p.id,
        description: p.type === 'DRIVER_COD_REMITTANCE' ? 'Nộp COD về công ty' : 'Nộp lại tiền tạm ứng dư', driverOwes: 0, companyOwes: num(p.amount),
      });
    }
    for (const e of expenses) {
      const amt = num(e.amount);
      const base = { date: e.expenseDate, docCode: e.code, refId: e.id };
      const label = e.description ?? EXPENSE_KIND[e.kind as ExpenseKind].label;
      if (e.kind === 'TRIP_ADVANCE') entries.push({ ...base, kind: 'TRIP_ADVANCE', description: `Tạm ứng chuyến ${e.trip?.code ?? ''}`.trim(), driverOwes: amt, companyOwes: 0 });
      else if (e.kind === 'SALARY_ADVANCE') entries.push({ ...base, kind: 'SALARY_ADVANCE', description: `Ứng lương: ${label}`, driverOwes: amt, companyOwes: 0 });
      else if (e.kind === 'DRIVER_REIMBURSEMENT') entries.push({ ...base, kind: 'REIMBURSEMENT', description: `Công ty hoàn ứng: ${label}`, driverOwes: amt, companyOwes: 0 });
      else if (e.paidBy === 'DRIVER_ADVANCE') entries.push({ ...base, kind: 'ADVANCE_SPENT', description: `Chi từ tạm ứng: ${label}`, driverOwes: 0, companyOwes: amt });
      else if (e.paidBy === 'DRIVER' && e.reimbursable && EXPENSE_KIND[e.kind as ExpenseKind].isCost) entries.push({ ...base, kind: 'DRIVER_PAID', description: `Tài xế chi trước: ${label}`, driverOwes: 0, companyOwes: amt });
    }
    for (const d of deductions) entries.push({ date: d.line.payroll.approvedAt ?? d.line.payroll.updatedAt, kind: 'SALARY_DEDUCTED', docCode: d.line.payroll.code, refId: d.expenseId, description: `Trừ ứng lương vào bảng lương`, driverOwes: 0, companyOwes: num(d.amount) });
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = 0;
    const withBalance = entries.map((e) => {
      running += e.driverOwes - e.companyOwes;
      return { ...e, runningBalance: running };
    });

    const expViews = await this.expenses.views(expenses);
    const codRemittances = await this.payments.views(
      await this.prisma.db.paymentIn.findMany({
        where: { driverId, type: 'DRIVER_COD_REMITTANCE' },
        include: {
          customer: { select: { id: true, code: true, name: true } }, driver: { select: { id: true, code: true, name: true } }, trip: { select: { id: true, code: true } },
          allocations: { include: { order: { select: { id: true, code: true } } } },
          codItems: { include: { stop: { select: { id: true, locationName: true, order: { select: { code: true } } } } } },
        },
        orderBy: { receivedAt: 'desc' },
        take: 50,
      }),
    );
    return {
      driver: { id: driver.id, code: driver.code, name: driver.name },
      phone: driver.phone,
      ...summary,
      entries: withBalance.reverse(),
      codItems: summary.codItems,
      tripBonuses: trips.map((t) => ({ tripId: t.id, tripCode: t.code, orderCode: t.order.code, date: t.actualEndAt ?? t.plannedStartAt, amount: num(t.driverBonusAmount), status: t.status })),
      salaryAdvances: expViews.filter((e) => e.kind === 'SALARY_ADVANCE').reverse(),
      reimbursableExpenses: expViews.filter((e) => e.paidBy === 'DRIVER' && e.reimbursable).reverse(),
      tripAdvances: await this.advances.list({ driverId }),
      codRemittances,
    };
  }

  async driverCodHeld(filter: DriverCodHeldFilter = {}) {
    const p = currentPrincipal();
    if (p?.type === 'DRIVER') filter = { ...filter, driverId: p.driverId };
    else assertPermission('driverLedger.view');
    const drivers = await this.prisma.db.driver.findMany({ where: filter.driverId ? { id: filter.driverId } : {}, select: { id: true, code: true, name: true, phone: true } });
    const [ledgers, settings] = await Promise.all([this.finance.driverLedgers(drivers.map((d) => d.id)), this.prisma.db.merchantSettings.findFirst({})]);
    let rows = drivers
      .map((d) => {
        const l = ledgers.get(d.id)!;
        return {
          driver: { id: d.id, code: d.code, name: d.name }, phone: d.phone, codCollected: l.codCollected, codRemitted: l.codRemitted, codHeld: l.codHeld,
          oldestHeldAt: l.oldestHeldAt, daysHeld: l.daysHeld, overAmount: l.overAmount, overDays: l.overDays, items: l.codItems,
        };
      })
      .filter((r) => filter.driverId || r.codCollected > 0);
    if (filter.warningOnly) rows = rows.filter((r) => r.overAmount || r.overDays);
    rows.sort((a, b) => b.codHeld - a.codHeld);
    return { rows, totalHeld: rows.reduce((s, r) => s + r.codHeld, 0), codWarningAmount: num(settings?.codWarningAmount ?? 5_000_000n), codWarningDays: settings?.codWarningDays ?? 2 };
  }

  // ---------------- FIN-008 lãi/lỗ đơn ----------------

  async orderFinance(orderId: string) {
    const order = await this.prisma.db.order.findFirst({ where: { id: orderId }, include: { addons: { select: { amount: true } } } });
    if (!order) throw notFound('đơn hàng');
    const [profit, debt, allocations, expenses] = await Promise.all([
      this.finance.orderProfits([orderId]).then((m) => m.get(orderId)!),
      this.finance.orderDebtMap([orderId]).then((m) => m.get(orderId)!),
      this.prisma.db.paymentAllocation.findMany({ where: { orderId, payment: { status: 'ACTIVE' } }, include: { payment: { select: { id: true, code: true, receivedAt: true, method: true } } }, orderBy: { createdAt: 'asc' } }),
      this.prisma.db.expense.findMany({ where: { OR: [{ orderId }, { trip: { orderId } }] }, include: EXPENSE_INCLUDE, orderBy: { expenseDate: 'asc' } }),
    ]);
    const addonTotal = order.addons.reduce((s, a) => s + num(a.amount), 0);
    return {
      orderId, code: order.code, status: order.status, freightAmount: num(order.freightAmount), addonTotal, totalAmount: debt.total, receivable: debt.receivable,
      paidAmount: debt.paid, remainingAmount: debt.remaining, dueDate: order.dueDate, overdueDays: debt.overdueDays,
      ...profit,
      allocations: allocations.map((a) => ({ id: a.id, paymentId: a.payment.id, paymentCode: a.payment.code, orderId, orderCode: order.code, amount: num(a.amount), createdAt: a.createdAt, receivedAt: a.payment.receivedAt, method: a.payment.method })),
      expenses: await this.expenses.views(expenses),
    };
  }

  // ---------------- WM-FIN-01 sổ thu chi ----------------

  async financeLedger(filter: FinanceLedgerFilter = {}, page: { first?: number; after?: string | null }) {
    if (!hasPermission('finance.view')) throw forbidden('Bạn không có quyền xem sổ thu chi');
    const q = filter.search?.trim();
    const payWhere: any = {};
    const expWhere: any = {};
    if (filter.status) payWhere.status = expWhere.status = filter.status;
    if (filter.dateFrom || filter.dateTo) {
      payWhere.receivedAt = { ...(filter.dateFrom ? { gte: vnDayStart(filter.dateFrom) } : {}), ...(filter.dateTo ? { lte: vnDayEnd(filter.dateTo) } : {}) };
      expWhere.expenseDate = { ...(filter.dateFrom ? { gte: dateOnly(filter.dateFrom) } : {}), ...(filter.dateTo ? { lte: dateOnly(filter.dateTo) } : {}) };
    }
    if (q) {
      payWhere.OR = [{ code: { contains: q, mode: 'insensitive' } }, { payerName: { contains: q, mode: 'insensitive' } }, { customer: { name: { contains: q, mode: 'insensitive' } } }, { driver: { name: { contains: q, mode: 'insensitive' } } }];
      expWhere.OR = [{ code: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { supplier: { name: { contains: q, mode: 'insensitive' } } }, { driver: { name: { contains: q, mode: 'insensitive' } } }];
    }
    const [pays, exps] = await Promise.all([
      filter.direction === 'OUT' ? [] : this.prisma.db.paymentIn.findMany({ where: payWhere, include: { customer: { select: { name: true } }, driver: { select: { name: true } }, trip: { select: { code: true } }, allocations: { include: { order: { select: { code: true } } } } } }),
      filter.direction === 'IN' ? [] : this.prisma.db.expense.findMany({ where: expWhere, include: EXPENSE_INCLUDE }),
    ]);
    const users = await this.prisma.db.merchantUser.findMany({ select: { id: true, name: true } });
    const uname = (id?: string | null) => (id ? users.find((u) => u.id === id)?.name ?? null : null);
    const entries = [
      ...pays.map((p: any) => ({
        id: p.id, code: p.code, date: p.receivedAt, direction: 'IN', type: p.type, typeLabel: paymentTypeLabel(p.type),
        counterpart: p.customer?.name ?? p.driver?.name ?? p.payerName ?? '—',
        links: [p.trip?.code, ...p.allocations.map((a: any) => a.order.code)].filter(Boolean).join(', '),
        status: p.status, amount: num(p.amount), notRevenue: isNotRevenue(p.type), cashMoved: true, createdByName: uname(p.createdByUserId),
      })),
      ...exps.map((e: any) => ({
        id: e.id, code: e.code, date: e.expenseDate, direction: 'OUT', type: e.kind, typeLabel: EXPENSE_KIND[e.kind as ExpenseKind].label,
        counterpart: e.supplier?.name ?? e.driver?.name ?? '—',
        links: [e.order?.code, e.trip?.code, e.vehicle?.plate].filter(Boolean).join(', '),
        status: e.status, amount: num(e.amount), notRevenue: false, cashMoved: e.paidBy === 'COMPANY' && e.paidStatus === 'PAID', createdByName: uname(e.createdByUserId),
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.code.localeCompare(a.code));

    const activeIn = pays.filter((p: any) => p.status === 'ACTIVE');
    const activeOut = exps.filter((e: any) => e.status === 'ACTIVE');
    const sumP = (f: (p: any) => boolean) => activeIn.filter(f).reduce((s: number, p: any) => s + num(p.amount), 0);
    const summary = {
      cashIn: sumP(() => true),
      customerReceipts: sumP((p) => p.type === 'CUSTOMER_PAYMENT'),
      codRemittances: sumP((p) => p.type === 'DRIVER_COD_REMITTANCE'),
      advanceReturns: sumP((p) => p.type === 'DRIVER_ADVANCE_RETURN'),
      otherIn: sumP((p) => p.type === 'OTHER'),
      cashOut: activeOut.filter((e: any) => e.paidBy === 'COMPANY' && e.paidStatus === 'PAID').reduce((s: number, e: any) => s + num(e.amount), 0),
      unpaidOut: activeOut.filter((e: any) => e.paidStatus === 'UNPAID').reduce((s: number, e: any) => s + num(e.amount), 0),
      driverPaidOut: activeOut.filter((e: any) => e.paidBy !== 'COMPANY').reduce((s: number, e: any) => s + num(e.amount), 0),
    };
    const { take, skip } = pageParams(page);
    return { ...toConnection(entries.slice(skip, skip + take), entries.length, skip, take), summary };
  }

  // ---------------- Cảnh báo (P7 sẽ lên lịch qua JobRunner) ----------------

  private async recentlyNotified(type: 'COD_HELD_WARNING' | 'ORDER_OVERDUE', entityId: string) {
    return this.prisma.raw.notification.count({ where: { merchantId: currentMerchantId(), type, entityId, createdAt: { gte: new Date(Date.now() - 86_400_000) } } });
  }

  /** Tài xế giữ COD vượt ngưỡng tiền/ngày → COD_HELD_WARNING cho người xem sổ tài xế (không lặp trong 24h). */
  async scanCodWarnings(): Promise<number> {
    const drivers = await this.prisma.db.driver.findMany({ select: { id: true, name: true } });
    const ledgers = await this.finance.driverLedgers(drivers.map((d) => d.id));
    let n = 0;
    for (const d of drivers) {
      const l = ledgers.get(d.id)!;
      if (!(l.overAmount || l.overDays)) continue;
      if (await this.recentlyNotified('COD_HELD_WARNING', d.id)) continue;
      await this.notify.toUsersWithPermission('driverLedger.view', {
        type: 'COD_HELD_WARNING', title: `Tài xế ${d.name} đang giữ COD ${formatVnd(l.codHeld)}`,
        body: `${l.overAmount ? 'Vượt ngưỡng số tiền' : ''}${l.overAmount && l.overDays ? ', ' : ''}${l.overDays ? `giữ ${l.daysHeld} ngày` : ''}.`,
        entityType: 'DRIVER', entityId: d.id, severity: 'warning',
      });
      n++;
    }
    return n;
  }

  /** Đơn quá hạn thanh toán còn nợ → ORDER_OVERDUE cho người xem công nợ (không lặp trong 24h). */
  async scanOverdueOrders(): Promise<number> {
    const debts = await this.finance.orderDebts({ status: { in: RECEIVABLE_ORDER_STATUSES }, dueDate: { lt: new Date() } });
    let n = 0;
    for (const d of debts.filter((x) => x.remaining > 0 && x.overdueDays > 0)) {
      if (await this.recentlyNotified('ORDER_OVERDUE', d.orderId)) continue;
      await this.notify.toUsersWithPermission('debt.view', {
        type: 'ORDER_OVERDUE', title: `Đơn ${d.code} quá hạn ${d.overdueDays} ngày`, body: `Còn nợ ${formatVnd(d.remaining)}.`,
        entityType: 'ORDER', entityId: d.orderId, severity: 'danger',
      });
      n++;
    }
    return n;
  }
}
