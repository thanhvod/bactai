import { Injectable } from '@nestjs/common';
import {
  RECEIVABLE_ORDER_STATUSES,
  agingSummary,
  codHeldItemsFifo,
  codWarning,
  creditLimitCheck,
  customerCredit,
  driverLedgerSummary,
  orderDebt,
  orderProfit,
  type AgingKey,
  type DriverLedgerSummary,
  type ExpenseKind,
  type OrderDebt,
  type OrderProfit,
  type OrderStatus,
} from '@bta/shared';
import { num } from '@bta/db';
import { PrismaService } from '../prisma/prisma.service';

export interface OrderDebtRow extends OrderDebt {
  orderId: string;
  code: string;
  customerId: string;
  status: OrderStatus;
  orderDate: Date;
  dueDate: Date | null;
  routeSummary: string | null;
}

export interface CustomerDebtSummary {
  customerId: string;
  receivable: number;
  paid: number;
  remaining: number;
  overdueAmount: number;
  maxOverdueDays: number;
  openOrders: number;
  overdueOrders: number;
  creditBalance: number;
  creditLimit: number | null;
  overLimit: boolean;
  limitUsagePct: number | null;
  aging: Record<AgingKey, number>;
}

export interface DriverCodItem {
  stopId: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  tripId: string | null;
  tripCode: string | null;
  stopSequence: number;
  stopName: string | null;
  address: string;
  codExpected: number;
  codActual: number;
  collectedAt: Date;
  remitted: number;
  held: number;
  daysHeld: number;
}

/**
 * Tính toán tài chính dùng chung cho mọi module (công nợ, lãi/lỗ, sổ tài xế) — gọi công thức @bta/shared
 * trên dữ liệu gốc để order detail, công nợ, dashboard, báo cáo không lệch số.
 */
@Injectable()
export class FinanceCalcService {
  constructor(private readonly prisma: PrismaService) {}

  async orderDebts(where: Record<string, unknown>, asOf = new Date()): Promise<OrderDebtRow[]> {
    const orders = await this.prisma.db.order.findMany({
      where,
      select: {
        id: true, code: true, customerId: true, status: true, orderDate: true, dueDate: true, routeSummary: true, freightAmount: true,
        addons: { select: { amount: true } },
        allocations: { where: { payment: { status: 'ACTIVE' } }, select: { amount: true } },
      },
      orderBy: [{ orderDate: 'asc' }, { code: 'asc' }],
    });
    return orders.map((o) => ({
      orderId: o.id, code: o.code, customerId: o.customerId, status: o.status as OrderStatus, orderDate: o.orderDate, dueDate: o.dueDate, routeSummary: o.routeSummary,
      ...orderDebt({ status: o.status as OrderStatus, freightAmount: o.freightAmount, addons: o.addons, dueDate: o.dueDate }, o.allocations, asOf),
    }));
  }

  async orderDebtMap(orderIds: string[]): Promise<Map<string, OrderDebtRow>> {
    if (!orderIds.length) return new Map();
    const rows = await this.orderDebts({ id: { in: orderIds } });
    return new Map(rows.map((r) => [r.orderId, r]));
  }

  async customerCredits(customerIds: string[]): Promise<Map<string, number>> {
    if (!customerIds.length) return new Map();
    const payments = await this.prisma.db.paymentIn.findMany({
      where: { customerId: { in: customerIds }, type: 'CUSTOMER_PAYMENT' },
      select: { customerId: true, amount: true, status: true, allocations: { select: { amount: true } } },
    });
    const map = new Map<string, number>();
    for (const id of customerIds) map.set(id, customerCredit(payments.filter((p) => p.customerId === id) as any));
    return map;
  }

  async customerDebtSummaries(customerIds: string[], asOf = new Date()): Promise<Map<string, CustomerDebtSummary>> {
    if (!customerIds.length) return new Map();
    const [debts, credits, customers] = await Promise.all([
      this.orderDebts({ customerId: { in: customerIds }, status: { in: RECEIVABLE_ORDER_STATUSES } }, asOf),
      this.customerCredits(customerIds),
      this.prisma.db.customer.findMany({ where: { id: { in: customerIds } }, select: { id: true, creditLimit: true } }),
    ]);
    const map = new Map<string, CustomerDebtSummary>();
    for (const c of customers) {
      const rows = debts.filter((d) => d.customerId === c.id);
      const open = rows.filter((r) => r.remaining > 0);
      const remaining = rows.reduce((s, r) => s + r.remaining, 0);
      const overdue = open.filter((r) => r.overdueDays > 0);
      const limit = c.creditLimit === null ? null : num(c.creditLimit);
      const check = creditLimitCheck(remaining, limit);
      map.set(c.id, {
        customerId: c.id,
        receivable: rows.reduce((s, r) => s + r.receivable, 0),
        paid: rows.reduce((s, r) => s + r.paid, 0),
        remaining,
        overdueAmount: overdue.reduce((s, r) => s + r.remaining, 0),
        maxOverdueDays: overdue.reduce((m, r) => Math.max(m, r.overdueDays), 0),
        openOrders: open.length,
        overdueOrders: overdue.length,
        creditBalance: credits.get(c.id) ?? 0,
        creditLimit: limit,
        overLimit: check.overLimit,
        limitUsagePct: check.usagePct,
        aging: agingSummary(open),
      });
    }
    return map;
  }

  async orderProfits(orderIds: string[]): Promise<Map<string, OrderProfit>> {
    if (!orderIds.length) return new Map();
    const [orders, expenses] = await Promise.all([
      this.prisma.db.order.findMany({ where: { id: { in: orderIds } }, select: { id: true, status: true, freightAmount: true, addons: { select: { amount: true } } } }),
      this.prisma.db.expense.findMany({
        where: { OR: [{ orderId: { in: orderIds } }, { trip: { orderId: { in: orderIds } } }] },
        select: { orderId: true, kind: true, status: true, amount: true, trip: { select: { orderId: true } } },
      }),
    ]);
    const map = new Map<string, OrderProfit>();
    for (const o of orders) {
      const ex = expenses.filter((e) => (e.orderId ?? e.trip?.orderId) === o.id);
      map.set(o.id, orderProfit({ status: o.status as OrderStatus, freightAmount: o.freightAmount, addons: o.addons }, ex.map((e) => ({ kind: e.kind as ExpenseKind, status: e.status as any, amount: e.amount }))));
    }
    return map;
  }

  /** COD thực thu của tài xế: stop có codActual thuộc chuyến tài xế chạy (theo assignment). */
  private async codCollected(driverIds: string[]) {
    const stops = await this.prisma.db.orderStop.findMany({
      where: { codActual: { not: null, gt: 0 }, assignments: { some: { trip: { driverId: { in: driverIds }, status: { not: 'CANCELLED' } } } } },
      select: {
        id: true, sequence: true, locationName: true, address: true, codExpected: true, codActual: true, codCollectedAt: true, completedAt: true, updatedAt: true,
        order: { select: { id: true, code: true, customer: { select: { name: true } } } },
        assignments: { where: { trip: { driverId: { in: driverIds }, status: { not: 'CANCELLED' } } }, select: { trip: { select: { id: true, code: true, driverId: true } } } },
      },
    });
    return stops.map((s) => {
      const trip = s.assignments[0]?.trip ?? null;
      return {
        driverId: trip?.driverId as string,
        stopId: s.id, orderId: s.order.id, orderCode: s.order.code, customerName: s.order.customer.name, tripId: trip?.id ?? null, tripCode: trip?.code ?? null,
        stopSequence: s.sequence, stopName: s.locationName, address: s.address, codExpected: num(s.codExpected), codActual: num(s.codActual),
        amount: num(s.codActual), collectedAt: s.codCollectedAt ?? s.completedAt ?? s.updatedAt,
      };
    });
  }

  async driverLedgers(driverIds: string[]): Promise<Map<string, DriverLedgerSummary & { oldestHeldAt: Date | null; codItems: DriverCodItem[]; overAmount: boolean; overDays: boolean; daysHeld: number }>> {
    if (!driverIds.length) return new Map();
    const [collected, payments, expenses, payrollItems, settings] = await Promise.all([
      this.codCollected(driverIds),
      this.prisma.db.paymentIn.findMany({ where: { driverId: { in: driverIds }, status: 'ACTIVE', type: { in: ['DRIVER_COD_REMITTANCE', 'DRIVER_ADVANCE_RETURN'] } }, select: { driverId: true, type: true, amount: true } }),
      this.prisma.db.expense.findMany({ where: { driverId: { in: driverIds }, status: 'ACTIVE' }, select: { id: true, driverId: true, kind: true, paidBy: true, reimbursable: true, amount: true } }),
      this.prisma.db.payrollLineItem.findMany({ where: { type: 'ADVANCE', expenseId: { not: null }, line: { payroll: { status: { in: ['APPROVED', 'PAID'] } } } }, select: { expenseId: true } }),
      this.prisma.db.merchantSettings.findFirst({}),
    ]);
    const deducted = new Set(payrollItems.map((i) => i.expenseId));
    const map = new Map<string, any>();
    for (const id of driverIds) {
      const c = collected.filter((x) => x.driverId === id);
      const remits = payments.filter((p) => p.driverId === id && p.type === 'DRIVER_COD_REMITTANCE');
      const summary = driverLedgerSummary({
        codCollected: c,
        codRemittances: remits,
        advanceReturns: payments.filter((p) => p.driverId === id && p.type === 'DRIVER_ADVANCE_RETURN'),
        expenses: expenses.filter((e) => e.driverId === id).map((e) => ({ ...e, kind: e.kind as ExpenseKind, paidBy: e.paidBy as any, payrollDeducted: deducted.has(e.id) })),
      });
      const items = codHeldItemsFifo(c, summary.codRemitted);
      const oldest = items[0]?.collectedAt ?? null;
      const w = codWarning(summary.codHeld, oldest, { codWarningAmount: settings?.codWarningAmount ?? 5_000_000n, codWarningDays: settings?.codWarningDays ?? 2 });
      map.set(id, {
        ...summary,
        oldestHeldAt: oldest ? new Date(oldest) : null,
        codItems: items.map((i) => ({ ...i, collectedAt: new Date(i.collectedAt), daysHeld: codWarning(i.held, i.collectedAt, { codWarningAmount: 0, codWarningDays: 0 }).daysHeld })),
        ...w,
      });
    }
    return map;
  }
}
