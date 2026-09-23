import { OrdersService } from '../orders/orders.service';
import { Injectable } from '@nestjs/common';
import {
  AGING_BUCKETS,
  COST_EXPENSE_KINDS,
  RECEIVABLE_ORDER_STATUSES,
  TRIP_RUNNING_STATUSES,
  addDays,
  formatVnd,
  isUnpaidSupplierExpense,
  isoDate,
  startOfVnDay,
  toDbDate,
  vnParts,
  type AgingKey,
  type OrderProfit,
  type PaidStatus,
} from '@bta/shared';
import { num } from '@bta/db';
import { FinanceCalcService } from '../../common/finance/finance-calc.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import type { ReportFilter } from './reports.types';

type ProfitAgg = {
  key: string; label: string; sublabel?: string | null; entityId?: string | null; status?: string | null;
  freight: number; addons: number; revenue: number; tripCost: number; outsourcedCost: number; otherCost: number; cost: number; profit: number;
  margin: number | null; orderCount: number; isProvisional: boolean; _orders: Set<string>;
};

const emptyAgg = (key: string, label: string, extra: Partial<ProfitAgg> = {}): ProfitAgg => ({
  key, label, freight: 0, addons: 0, revenue: 0, tripCost: 0, outsourcedCost: 0, otherCost: 0, cost: 0, profit: 0, margin: null, orderCount: 0, isProvisional: false, _orders: new Set(), ...extra,
});

function finishAgg(a: ProfitAgg) {
  a.profit = a.revenue - a.cost;
  a.margin = a.revenue > 0 ? Math.round((a.profit / a.revenue) * 1000) / 10 : null;
  a.orderCount = a._orders.size;
  const { _orders, ...rest } = a;
  return rest;
}

/** Khoảng ngày mặc định: đầu tháng hiện tại → hôm nay (giờ VN). */
export function resolveRange(f: { dateFrom?: string | null; dateTo?: string | null } = {}) {
  const now = new Date();
  const p = vnParts(now);
  const from = f.dateFrom ?? `${p.y}-${String(p.m).padStart(2, '0')}-01`;
  const to = f.dateTo ?? isoDate(now);
  return { from, to, fromDb: toDbDate(from), toDb: toDbDate(to), start: new Date(`${from}T00:00:00+07:00`), end: new Date(`${to}T23:59:59.999+07:00`) };
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly finance: FinanceCalcService,
    private readonly catalogs: CatalogsService,
    private readonly orders: OrdersService,
  ) {}

  // ---------------- Lãi/lỗ ----------------

  /**
   * Doanh thu = giá cước + add-on theo ngày đơn (không lấy phiếu thu). Đơn hủy: doanh thu 0, vẫn giữ chi phí.
   * groupBy VEHICLE/DRIVER: lãi/lỗ đơn chia đều cho các chuyến không hủy của đơn (giả định đơn nhiều xe chia theo số chuyến);
   * VEHICLE cộng thêm chi phí vật tư (VEHICLE_SUPPLY không gắn đơn/chuyến) theo ngày phiếu chi.
   */
  async profit(filter: ReportFilter = {}) {
    const r = resolveRange(filter);
    const groupBy = (filter.groupBy ?? 'MONTH').toUpperCase();
    const where: any = { orderDate: { gte: r.fromDb, lte: r.toDb } };
    if (filter.customerId) where.customerId = filter.customerId;
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.vehicleId || filter.driverId) {
      where.trips = { some: { ...(filter.vehicleId ? { vehicleId: filter.vehicleId } : {}), ...(filter.driverId ? { driverId: filter.driverId } : {}), status: { not: 'CANCELLED' } } };
    }
    const orders = await this.prisma.db.order.findMany({
      where,
      select: {
        id: true, code: true, status: true, orderDate: true, freightAmount: true, routeSummary: true,
        customer: { select: { id: true, name: true, code: true } },
        addons: { select: { amount: true } },
        trips: { where: { status: { not: 'CANCELLED' } }, select: { id: true, vehicleId: true, driverId: true, vehicle: { select: { plate: true } }, driver: { select: { name: true } } } },
      },
      orderBy: [{ orderDate: 'asc' }, { code: 'asc' }],
    });
    const profits = await this.finance.orderProfits(orders.map((o) => o.id));
    const groups = new Map<string, ProfitAgg>();
    const add = (key: string, label: string, o: (typeof orders)[number], p: OrderProfit, share = 1, extra: Partial<ProfitAgg> = {}) => {
      const g = groups.get(key) ?? emptyAgg(key, label, extra);
      const isRev = RECEIVABLE_ORDER_STATUSES.includes(o.status as any);
      const addonTotal = o.addons.reduce((s, a) => s + num(a.amount), 0);
      g.freight += Math.round((isRev ? num(o.freightAmount) : 0) * share);
      g.addons += Math.round((isRev ? addonTotal : 0) * share);
      g.revenue += Math.round(p.revenue * share);
      g.tripCost += Math.round(p.tripCost * share);
      g.outsourcedCost += Math.round(p.outsourcedCost * share);
      g.otherCost += Math.round(p.otherCost * share);
      g.cost += Math.round(p.cost * share);
      g.isProvisional ||= p.provisional && o.status !== 'CANCELLED';
      g._orders.add(o.id);
      groups.set(key, g);
    };
    const notes: string[] = ['Doanh thu = giá cước + dịch vụ cộng thêm theo ngày đơn; phiếu thu (kể cả tài xế nộp COD) không tính doanh thu.', 'Đơn chưa hoàn thành được đánh dấu tạm tính.'];
    for (const o of orders) {
      const p = profits.get(o.id)!;
      const date = o.orderDate;
      const iso = date.toISOString().slice(0, 10);
      switch (groupBy) {
        case 'DAY': add(iso, `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`, o, p); break;
        case 'WEEK': {
          const d = new Date(`${iso}T00:00:00Z`);
          const monday = new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 86_400_000).toISOString().slice(0, 10);
          add(monday, `Tuần từ ${monday.slice(8, 10)}/${monday.slice(5, 7)}`, o, p);
          break;
        }
        case 'CUSTOMER': add(o.customer.id, o.customer.name, o, p, 1, { entityId: o.customer.id, sublabel: o.customer.code }); break;
        case 'ORDER': add(o.id, o.code, o, p, 1, { entityId: o.id, sublabel: `${o.customer.name}${o.routeSummary ? ` · ${o.routeSummary}` : ''}`, status: o.status }); break;
        case 'VEHICLE':
        case 'DRIVER': {
          const trips = o.trips.filter((t) => (groupBy === 'VEHICLE' ? !filter.vehicleId || t.vehicleId === filter.vehicleId : !filter.driverId || t.driverId === filter.driverId));
          const all = o.trips.length;
          if (!all) {
            add('NONE', groupBy === 'VEHICLE' ? 'Chưa xếp xe / thuê ngoài' : 'Chưa gán tài xế', o, p);
            break;
          }
          for (const t of trips) {
            const id = groupBy === 'VEHICLE' ? t.vehicleId : t.driverId;
            const label = groupBy === 'VEHICLE' ? t.vehicle?.plate ?? 'Xe ngoài' : t.driver?.name ?? 'Tài xế ngoài';
            add(id ?? 'NONE', label, o, p, 1 / all, { entityId: id ?? null });
          }
          break;
        }
        default: add(iso.slice(0, 7), `Tháng ${iso.slice(5, 7)}/${iso.slice(0, 4)}`, o, p);
      }
    }
    if (groupBy === 'VEHICLE') {
      notes.push('Đơn nhiều xe: lãi/lỗ chia đều theo số chuyến. Chi phí vật tư xe (không gắn đơn/chuyến) cộng theo ngày phiếu chi.');
      const supplies = await this.prisma.db.expense.findMany({
        where: { status: 'ACTIVE', kind: { in: COST_EXPENSE_KINDS as any }, vehicleId: filter.vehicleId ?? { not: null }, orderId: null, tripId: null, expenseDate: { gte: r.fromDb, lte: r.toDb } },
        include: { vehicle: { select: { plate: true } } },
      });
      for (const e of supplies) {
        const g = groups.get(e.vehicleId!) ?? emptyAgg(e.vehicleId!, e.vehicle?.plate ?? '', { entityId: e.vehicleId });
        g.otherCost += num(e.amount);
        g.cost += num(e.amount);
        groups.set(e.vehicleId!, g);
      }
    }
    if (groupBy === 'DRIVER') notes.push('Đơn nhiều xe: lãi/lỗ chia đều theo số chuyến của đơn.');
    const rows = [...groups.values()].map(finishAgg);
    if (['MONTH', 'WEEK', 'DAY'].includes(groupBy)) rows.sort((a, b) => a.key.localeCompare(b.key));
    else rows.sort((a, b) => b.revenue - a.revenue);
    const totals = emptyAgg('TOTAL', 'Tổng cộng');
    for (const row of rows) {
      for (const k of ['freight', 'addons', 'revenue', 'tripCost', 'outsourcedCost', 'otherCost', 'cost'] as const) totals[k] += row[k];
      totals.isProvisional ||= row.isProvisional;
    }
    orders.forEach((o) => totals._orders.add(o.id));
    return { dateFrom: r.from, dateTo: r.to, groupBy, rows, totals: finishAgg(totals), notes };
  }

  // ---------------- Xe / tài xế ----------------

  private async tripRevenueShares(trips: { id: string; orderId: string }[]) {
    const orderIds = [...new Set(trips.map((t) => t.orderId))];
    const [profits, counts] = await Promise.all([
      this.finance.orderProfits(orderIds),
      this.prisma.db.trip.groupBy({ by: ['orderId'], where: { orderId: { in: orderIds }, status: { not: 'CANCELLED' } }, _count: true }),
    ]);
    const n = new Map(counts.map((c: any) => [c.orderId, c._count as number]));
    return new Map(trips.map((t) => [t.id, Math.round((profits.get(t.orderId)?.revenue ?? 0) / Math.max(n.get(t.orderId) ?? 1, 1))]));
  }

  async vehicles(filter: ReportFilter = {}) {
    const r = resolveRange(filter);
    const vehicles = await this.prisma.db.vehicle.findMany({
      where: { ...(filter.vehicleTypeId ? { typeId: filter.vehicleTypeId } : {}), ...(filter.status?.length ? { status: { in: filter.status as any } } : {}), ...(filter.vehicleId ? { id: filter.vehicleId } : {}) },
      orderBy: { plate: 'asc' },
    });
    const ids = vehicles.map((v) => v.id);
    const [trips, expenses, types] = await Promise.all([
      this.prisma.db.trip.findMany({ where: { vehicleId: { in: ids }, status: { not: 'CANCELLED' }, plannedStartAt: { gte: r.start, lte: r.end } }, select: { id: true, orderId: true, vehicleId: true, plannedStartAt: true } }),
      this.prisma.db.expense.findMany({
        where: { status: 'ACTIVE', kind: { in: COST_EXPENSE_KINDS as any }, expenseDate: { gte: r.fromDb, lte: r.toDb }, OR: [{ vehicleId: { in: ids } }, { trip: { vehicleId: { in: ids } } }] },
        select: { amount: true, vehicleId: true, tripId: true, trip: { select: { vehicleId: true } } },
      }),
      this.catalogs.labels(vehicles.map((v) => v.typeId)),
    ]);
    const shares = await this.tripRevenueShares(trips);
    const days = Math.max(Math.round((startOfVnDay(r.end).getTime() - startOfVnDay(r.start).getTime()) / 86_400_000) + 1, 1);
    return vehicles.map((v) => {
      const vt = trips.filter((t) => t.vehicleId === v.id);
      const activeDays = new Set(vt.map((t) => isoDate(t.plannedStartAt))).size;
      const revenue = vt.reduce((s, t) => s + (shares.get(t.id) ?? 0), 0);
      const tripCost = expenses.filter((e) => e.tripId && e.trip?.vehicleId === v.id).reduce((s, e) => s + num(e.amount), 0);
      const vehicleCost = expenses.filter((e) => !e.tripId && e.vehicleId === v.id).reduce((s, e) => s + num(e.amount), 0);
      return {
        vehicleId: v.id, plate: v.plate, type: v.typeId ? types.get(v.typeId) ?? null : null, status: v.status, tripCount: vt.length, activeDays,
        utilization: Math.round((activeDays / days) * 1000) / 10, revenue, vehicleCost, tripCost, grossProfit: revenue - tripCost - vehicleCost,
      };
    });
  }

  async drivers(filter: ReportFilter = {}) {
    const r = resolveRange(filter);
    const drivers = await this.prisma.db.driver.findMany({
      where: { ...(filter.status?.length ? { status: { in: filter.status as any } } : {}), ...(filter.driverId ? { id: filter.driverId } : {}) },
      orderBy: { name: 'asc' },
    });
    const ids = drivers.map((d) => d.id);
    const [trips, ledgers, incidents] = await Promise.all([
      this.prisma.db.trip.findMany({
        where: {
          driverId: { in: ids }, status: 'COMPLETED', ...(filter.vehicleId ? { vehicleId: filter.vehicleId } : {}),
          OR: [{ actualEndAt: { gte: r.start, lte: r.end } }, { actualEndAt: null, plannedStartAt: { gte: r.start, lte: r.end } }],
        },
        select: { id: true, orderId: true, driverId: true, driverBonusAmount: true, actualEndAt: true, plannedEndAt: true },
      }),
      this.finance.driverLedgers(ids),
      this.prisma.db.incident.groupBy({ by: ['driverId'], where: { driverId: { in: ids }, createdAt: { gte: r.start, lte: r.end } }, _count: true }),
    ]);
    const shares = await this.tripRevenueShares(trips);
    return drivers.map((d) => {
      const dt = trips.filter((t) => t.driverId === d.id);
      const measurable = dt.filter((t) => t.actualEndAt && t.plannedEndAt);
      const onTime = measurable.filter((t) => t.actualEndAt! <= t.plannedEndAt!).length;
      return {
        driverId: d.id, name: d.name, code: d.code, status: d.status, completedTrips: dt.length,
        onTimeRate: measurable.length ? Math.round((onTime / measurable.length) * 1000) / 10 : null,
        revenue: dt.reduce((s, t) => s + (shares.get(t.id) ?? 0), 0),
        bonusTotal: dt.reduce((s, t) => s + num(t.driverBonusAmount), 0),
        codHeld: ledgers.get(d.id)?.codHeld ?? 0,
        incidents: (incidents.find((i: any) => i.driverId === d.id) as any)?._count ?? 0,
      };
    });
  }

  // ---------------- Công nợ / COD / lương ----------------

  async customerDebt(filter: ReportFilter = {}) {
    const customers = await this.prisma.db.customer.findMany({ where: filter.customerId ? { id: filter.customerId } : {}, orderBy: { name: 'asc' }, select: { id: true, code: true, name: true } });
    const sums = await this.finance.customerDebtSummaries(customers.map((c) => c.id));
    const aging = { current: 0, d1_15: 0, d16_30: 0, d31_60: 0, d60p: 0 } as Record<AgingKey, number>;
    const rows = customers
      .map((c) => {
        const s = sums.get(c.id)!;
        const warnings: string[] = [];
        if (s.overLimit) warnings.push(`Vượt hạn mức (${s.limitUsagePct}%)`);
        if (s.overdueOrders) warnings.push(`${s.overdueOrders} đơn quá hạn`);
        return {
          customerId: c.id, code: c.code, name: c.name, creditLimit: s.creditLimit, receivable: s.receivable, paid: s.paid, totalDebt: s.remaining, overdue: s.overdueAmount,
          maxOverdueDays: s.maxOverdueDays, openOrders: s.openOrders, creditBalance: s.creditBalance,
          aging: { ...s.aging, d31_60: s.aging.d31_60, d60p: s.aging.d60p }, warnings,
        };
      })
      .filter((r) => (filter.overdueOnly ? r.overdue > 0 : r.totalDebt !== 0 || r.creditBalance > 0 || !!filter.customerId))
      .sort((a, b) => b.overdue - a.overdue || b.totalDebt - a.totalDebt);
    for (const r of rows) for (const b of AGING_BUCKETS) aging[b.key] += r.aging[b.key];
    return {
      rows,
      totalDebt: rows.reduce((s, r) => s + r.totalDebt, 0),
      totalOverdue: rows.reduce((s, r) => s + r.overdue, 0),
      totalCredit: rows.reduce((s, r) => s + r.creditBalance, 0),
      aging,
    };
  }

  async codHeld(filter: ReportFilter = {}) {
    const drivers = await this.prisma.db.driver.findMany({ where: filter.driverId ? { id: filter.driverId } : {}, orderBy: { name: 'asc' } });
    const ids = drivers.map((d) => d.id);
    const r = resolveRange(filter);
    const [ledgers, remits, settings] = await Promise.all([
      this.finance.driverLedgers(ids),
      this.prisma.db.paymentIn.findMany({
        where: { driverId: { in: ids }, type: 'DRIVER_COD_REMITTANCE', status: 'ACTIVE', ...(filter.dateFrom || filter.dateTo ? { receivedAt: { gte: r.start, lte: r.end } } : {}) },
        orderBy: { receivedAt: 'desc' },
      }),
      this.prisma.db.merchantSettings.findFirst({}),
    ]);
    const rows = drivers
      .map((d) => {
        const l = ledgers.get(d.id)!;
        return {
          driverId: d.id, name: d.name, code: d.code, phone: d.phone, codCollected: l.codCollected, codRemitted: l.codRemitted, codHeld: l.codHeld, heldDays: l.daysHeld,
          oldestHeldAt: l.oldestHeldAt, overAmount: l.overAmount, overDays: l.overDays, items: l.codItems,
          remittances: remits.filter((p) => p.driverId === d.id).map((p) => ({ id: p.id, code: p.code, receivedAt: p.receivedAt, amount: num(p.amount), method: p.method })),
        };
      })
      .filter((x) => x.codCollected > 0 || !!filter.driverId)
      .sort((a, b) => b.codHeld - a.codHeld);
    return {
      rows,
      totalHeld: rows.reduce((s, x) => s + x.codHeld, 0),
      overThresholdCount: rows.filter((x) => x.overAmount || x.overDays).length,
      thresholdAmount: num(settings?.codWarningAmount ?? 5_000_000n),
      thresholdDays: settings?.codWarningDays ?? 2,
    };
  }

  async payroll(filter: ReportFilter = {}) {
    const year = filter.year ?? vnParts(new Date()).y;
    const payrolls = await this.prisma.db.payroll.findMany({
      where: {
        periodFrom: { gte: toDbDate(`${year - 1}-12-01`), lte: toDbDate(`${year}-12-31`) },
        ...(filter.status?.length ? { status: { in: filter.status as any } } : { status: { not: 'CANCELLED' } }),
        ...(filter.driverId ? { lines: { some: { driverId: filter.driverId } } } : {}),
      },
      include: { lines: { orderBy: { driverName: 'asc' } } },
      orderBy: { periodFrom: 'asc' },
    });
    return payrolls.map((p) => {
      const lines = filter.driverId ? p.lines.filter((l) => l.driverId === filter.driverId) : p.lines;
      const sum = (k: 'baseSalary' | 'bonusTotal' | 'advanceTotal' | 'deductionTotal' | 'adjustmentTotal' | 'netAmount') => lines.reduce((s, l) => s + num(l[k]), 0);
      return {
        payrollId: p.id, payrollCode: p.code, period: p.periodLabel, status: p.status, driverCount: lines.length,
        salary: sum('baseSalary'), bonus: sum('bonusTotal'), advance: sum('advanceTotal'), deduction: sum('deductionTotal'), adjustment: sum('adjustmentTotal'), net: sum('netAmount'),
        paidAt: p.paidAt,
        byDriver: lines.map((l) => ({
          driverId: l.driverId, driverName: l.driverName, salary: num(l.baseSalary), bonus: num(l.bonusTotal), advance: num(l.advanceTotal), deduction: num(l.deductionTotal),
          adjustment: num(l.adjustmentTotal), net: num(l.netAmount),
        })),
      };
    });
  }

  // ---------------- Dashboard ----------------

  async supplierPayableTotal() {
    const ex = await this.prisma.db.expense.findMany({ where: { supplierId: { not: null }, status: 'ACTIVE', paidStatus: 'UNPAID' }, select: { supplierId: true, paidStatus: true, status: true, paidBy: true, amount: true } });
    return ex.filter((e) => isUnpaidSupplierExpense({ ...e, paidStatus: e.paidStatus as PaidStatus, status: e.status as any, paidBy: e.paidBy as any })).reduce((s, e) => s + num(e.amount), 0);
  }

  async dashboard(filter: { date?: string | null } = {}) {
    const dayIso = filter.date ?? isoDate(new Date());
    const dayStart = new Date(`${dayIso}T00:00:00+07:00`);
    const dayEnd = new Date(`${dayIso}T23:59:59.999+07:00`);
    const month = resolveRange({ dateFrom: `${dayIso.slice(0, 7)}-01`, dateTo: dayIso });
    const db = this.prisma.db;
    const [running, todayTripsRaw, needAction, newOrdersToday, openIncidents, payrollPending, warnings, customers, drivers, statusCounts, monthOrders, cashIn, supplierPayable] = await Promise.all([
      db.trip.count({ where: { status: { in: TRIP_RUNNING_STATUSES } } }),
      db.trip.findMany({
        where: { OR: [{ status: { in: TRIP_RUNNING_STATUSES } }, { plannedStartAt: { gte: dayStart, lte: dayEnd }, status: { not: 'CANCELLED' } }] },
        include: {
          order: { select: { code: true } }, vehicle: { select: { plate: true } }, driver: { select: { name: true } },
          scheduleWarnings: { where: { resolvedAt: null }, select: { id: true } }, incidents: { where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }, select: { id: true } },
        },
        orderBy: { plannedStartAt: 'asc' },
        take: 50,
      }),
      db.order.findMany({ where: { status: { in: ['DRAFT', 'PENDING_CONFIRMATION', 'CONFIRMED'] } }, select: { id: true, status: true, trips: { where: { status: { not: 'CANCELLED' } }, select: { vehicleId: true, driverId: true, isExternal: true } } } }),
      db.order.count({ where: { createdAt: { gte: dayStart, lte: dayEnd } } }),
      db.incident.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      db.payroll.count({ where: { status: 'SUBMITTED' } }),
      db.scheduleWarning.count({ where: { resolvedAt: null, trip: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } } }),
      db.customer.findMany({ select: { id: true } }),
      db.driver.findMany({ select: { id: true, name: true, phone: true } }),
      db.trip.groupBy({ by: ['status'], where: { OR: [{ status: { in: TRIP_RUNNING_STATUSES } }, { plannedStartAt: { gte: dayStart, lte: dayEnd } }] }, _count: true }),
      db.order.findMany({ where: { orderDate: { gte: month.fromDb, lte: month.toDb } }, select: { id: true } }),
      db.paymentIn.aggregate({ where: { status: 'ACTIVE', type: 'CUSTOMER_PAYMENT', receivedAt: { gte: month.start, lte: month.end } }, _sum: { amount: true } }),
      this.supplierPayableTotal(),
    ]);
    const unassigned = needAction.filter((o) => o.status === 'CONFIRMED' && !o.trips.some((t) => t.isExternal || (t.vehicleId && t.driverId))).length;
    const [debtSums, ledgers, profits, overdueRows] = await Promise.all([
      this.finance.customerDebtSummaries(customers.map((c) => c.id)),
      this.finance.driverLedgers(drivers.map((d) => d.id)),
      this.finance.orderProfits(monthOrders.map((o) => o.id)),
      this.finance.orderDebts({ status: { in: RECEIVABLE_ORDER_STATUSES }, dueDate: { lt: toDbDate(dayIso) } }),
    ]);
    const debtVals = [...debtSums.values()];
    const overdueCustomers = debtVals.filter((d) => d.overdueAmount > 0);
    const holders = drivers
      .map((d) => ({ d, l: ledgers.get(d.id)! }))
      .filter((x) => x.l.codHeld > 0)
      .sort((a, b) => b.l.codHeld - a.l.codHeld);
    const profitVals = [...profits.values()];
    const revenueMonth = profitVals.reduce((s, p) => s + p.revenue, 0);
    const costMonth = profitVals.reduce((s, p) => s + p.cost, 0);
    const customerNames = new Map(
      (await db.customer.findMany({ where: { id: { in: overdueRows.map((o) => o.customerId) } }, select: { id: true, name: true } })).map((c) => [c.id, c.name]),
    );
    return {
      date: dayIso,
      runningTrips: running,
      todayTrips: todayTripsRaw.filter((t) => t.plannedStartAt >= dayStart && t.plannedStartAt <= dayEnd).length,
      ordersNeedAction: await this.orders.countNeedsAction(),
      unassignedOrders: unassigned,
      newOrdersToday,
      overdueDebt: { amount: overdueCustomers.reduce((s, d) => s + d.overdueAmount, 0), count: overdueCustomers.length },
      codHeld: { amount: holders.reduce((s, x) => s + x.l.codHeld, 0), count: holders.length },
      codOverThreshold: holders.filter((x) => x.l.overAmount || x.l.overDays).length,
      openIncidents,
      payrollPending,
      scheduleWarnings: warnings,
      revenueMonth,
      costMonth,
      profitMonth: revenueMonth - costMonth,
      cashInMonth: num(cashIn._sum.amount),
      receivable: debtVals.reduce((s, d) => s + d.remaining, 0),
      supplierPayable,
      todayTripList: todayTripsRaw.map((t) => ({
        id: t.id, code: t.code, status: t.status, orderId: t.orderId, orderCode: t.order.code, routeSummary: t.routeSummary, vehiclePlate: t.vehicle?.plate ?? null,
        driverName: t.driver?.name ?? null, plannedStartAt: t.plannedStartAt, plannedEndAt: t.plannedEndAt, hasWarning: t.scheduleWarnings.length > 0,
        openIncident: t.incidents.length > 0, lastLocationAt: t.lastLocationAt,
      })),
      overdueOrders: overdueRows
        .filter((o) => o.remaining > 0 && o.overdueDays > 0)
        .sort((a, b) => b.overdueDays - a.overdueDays)
        .slice(0, 5)
        .map((o) => ({ orderId: o.orderId, code: o.code, customerId: o.customerId, customerName: customerNames.get(o.customerId) ?? '', remaining: o.remaining, overdueDays: o.overdueDays, dueDate: o.dueDate })),
      codHolders: holders.slice(0, 5).map((x) => ({ driverId: x.d.id, name: x.d.name, phone: x.d.phone, codHeld: x.l.codHeld, daysHeld: x.l.daysHeld, overThreshold: x.l.overAmount || x.l.overDays })),
      tripCountsByStatus: statusCounts.map((s: any) => ({ status: s.status, count: s._count })),
    };
  }

  async navBadges() {
    const db = this.prisma.db;
    const [incidents, warnings, payroll, customers, drivers] = await Promise.all([
      db.incident.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      db.scheduleWarning.count({ where: { resolvedAt: null, trip: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } } }),
      db.payroll.count({ where: { status: 'SUBMITTED' } }),
      db.customer.findMany({ select: { id: true } }),
      db.driver.findMany({ where: { status: 'ACTIVE' }, select: { id: true } }),
    ]);
    const [debts, ledgers] = await Promise.all([
      this.finance.customerDebtSummaries(customers.map((c) => c.id)),
      this.finance.driverLedgers(drivers.map((d) => d.id)),
    ]);
    const overdueCustomers = [...debts.values()].filter((d) => d.overdueAmount > 0).length;
    const codOver = [...ledgers.values()].filter((l) => l.overAmount || l.overDays).length;
    return { dispatch: incidents + warnings, finance: overdueCustomers + codOver, payroll, incidents, scheduleWarnings: warnings, overdueCustomers, codOverThreshold: codOver };
  }

  /** Trung tâm báo cáo (WM-RPT-01): headline từng báo cáo trong kỳ. */
  async summary(filter: ReportFilter = {}) {
    const r = resolveRange(filter);
    const [profit, debt, cod, payrollRows, vehicles, drivers] = await Promise.all([
      this.profit({ ...filter, groupBy: 'MONTH' }),
      this.customerDebt({}),
      this.codHeld({}),
      this.payroll({ year: Number(r.to.slice(0, 4)) }),
      this.prisma.db.trip.count({ where: { status: { not: 'CANCELLED' }, plannedStartAt: { gte: r.start, lte: r.end }, vehicleId: { not: null } } }),
      this.prisma.db.trip.count({ where: { status: 'COMPLETED', plannedStartAt: { gte: r.start, lte: r.end } } }),
    ]);
    const lastPayroll = payrollRows[payrollRows.length - 1];
    return [
      { key: 'profit', group: 'Tài chính', title: 'Doanh thu – chi phí – lãi/lỗ', headline: `Doanh thu ${formatVnd(profit.totals.revenue)} · lãi ${formatVnd(profit.totals.profit)}`, value: profit.totals.profit, route: '/reports/profit' },
      { key: 'profitByOrder', group: 'Tài chính', title: 'Lãi/lỗ theo đơn', headline: `${profit.totals.orderCount} đơn trong kỳ`, value: profit.totals.revenue, route: '/reports/profit?view=orders' },
      { key: 'customerDebt', group: 'Tài chính', title: 'Công nợ khách hàng', headline: `Còn phải thu ${formatVnd(debt.totalDebt)} · quá hạn ${formatVnd(debt.totalOverdue)}`, value: debt.totalDebt, route: '/reports/customer-debt' },
      { key: 'cod', group: 'Tài chính', title: 'COD tài xế', headline: `Đang giữ ${formatVnd(cod.totalHeld)} · ${cod.overThresholdCount} tài xế vượt ngưỡng`, value: cod.totalHeld, route: '/reports/cod' },
      { key: 'vehicles', group: 'Vận hành', title: 'Hiệu suất xe', headline: `${vehicles} chuyến có xe trong kỳ`, value: null, route: '/reports/vehicles' },
      { key: 'drivers', group: 'Vận hành', title: 'Hiệu suất tài xế', headline: `${drivers} chuyến hoàn thành trong kỳ`, value: null, route: '/reports/drivers' },
      { key: 'payroll', group: 'Lương', title: 'Báo cáo bảng lương', headline: lastPayroll ? `${lastPayroll.payrollCode} · thực lãnh ${formatVnd(lastPayroll.net)}` : 'Chưa có bảng lương trong năm', value: lastPayroll?.net ?? null, route: '/reports/payroll' },
    ];
  }

  /** dùng bởi export */
  static addDays = addDays;
}
