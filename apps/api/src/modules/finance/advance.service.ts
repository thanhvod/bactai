import { Injectable } from '@nestjs/common';
import { COST_EXPENSE_KINDS, MIN_REASON_LENGTH, reconcileAdvanceSchema, todayDbDate, tripAdvanceReconcile } from '@bta/shared';
import { num } from '@bta/db';
import { AuditService } from '../../common/audit/audit.service';
import { currentPrincipal } from '../../common/context/request-context';
import { businessRule, notFound, reasonRequired } from '../../common/errors/app-error';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService, type DbClient } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { CatalogsService } from '../catalogs/catalogs.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { EXPENSE_INCLUDE, expenseView, vnDayEnd, vnDayStart } from './finance.helpers';
import type { ReconcileTripAdvanceInput, TripAdvanceFilter } from './finance.types';

/**
 * Tạm ứng chuyến (FIN-007, doc/1-BRD/09 §2.7):
 * trước chuyến công ty đưa tiền (expense TRIP_ADVANCE) → tài xế chi (expense paidBy DRIVER_ADVANCE) →
 * đối soát: dư thì tài xế nộp lại (phiếu thu DRIVER_ADVANCE_RETURN), thiếu thì công ty hoàn (expense DRIVER_REIMBURSEMENT).
 */
@Injectable()
export class AdvanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly catalogs: CatalogsService,
    private readonly attachments: AttachmentsService,
  ) {}

  async compute(tripId: string, db: DbClient = this.prisma.db) {
    const d = db as any;
    const [advances, spent, costs, returned, reimbursed] = await Promise.all([
      d.expense.findMany({ where: { tripId, kind: 'TRIP_ADVANCE', status: 'ACTIVE' }, include: EXPENSE_INCLUDE, orderBy: { expenseDate: 'asc' } }),
      d.expense.findMany({ where: { tripId, paidBy: 'DRIVER_ADVANCE', status: 'ACTIVE' }, select: { amount: true } }),
      d.expense.findMany({ where: { tripId, kind: { in: COST_EXPENSE_KINDS }, status: 'ACTIVE' }, select: { amount: true } }),
      d.paymentIn.findMany({ where: { tripId, type: 'DRIVER_ADVANCE_RETURN', status: 'ACTIVE' }, select: { amount: true } }),
      d.expense.findMany({ where: { tripId, kind: 'DRIVER_REIMBURSEMENT', status: 'ACTIVE' }, select: { amount: true } }),
    ]);
    const r = tripAdvanceReconcile({ advances, spentFromAdvance: spent, returned, reimbursed });
    return { ...r, actualCost: costs.reduce((s: number, c: any) => s + num(c.amount), 0), advanceRows: advances };
  }

  /** Cập nhật số liệu dòng đối soát (nếu có). Nếu đã RECONCILED mà lệch khác 0 → mở lại OPEN. */
  async refresh(tripId: string | null | undefined, db: DbClient = this.prisma.db) {
    if (!tripId) return;
    const d = db as any;
    const row = await d.tripAdvanceReconciliation.findFirst({ where: { tripId } });
    const c = await this.compute(tripId, db);
    if (!row) {
      if (c.advanceAmount > 0) {
        await d.tripAdvanceReconciliation.create({ data: { tripId, status: 'OPEN', advanceAmount: c.advanceAmount, actualCost: c.actualCost, differenceAmount: c.difference } });
      }
      return;
    }
    const reopen = row.status === 'RECONCILED' && c.difference !== 0 && row.resolution !== 'WRITE_OFF';
    await d.tripAdvanceReconciliation.update({
      where: { id: row.id },
      data: { advanceAmount: c.advanceAmount, actualCost: c.actualCost, differenceAmount: c.difference, ...(reopen ? { status: 'OPEN', resolution: null, resolvedAt: null } : {}) },
    });
  }

  async list(filter: TripAdvanceFilter = {}) {
    const where: any = { OR: [{ expenses: { some: { kind: 'TRIP_ADVANCE', status: 'ACTIVE' } } }, { advanceReconcile: { isNot: null } }] };
    if (filter.driverId) where.driverId = filter.driverId;
    if (filter.tripId) where.id = filter.tripId;
    if (filter.dateFrom || filter.dateTo) {
      where.plannedStartAt = { ...(filter.dateFrom ? { gte: vnDayStart(filter.dateFrom) } : {}), ...(filter.dateTo ? { lte: vnDayEnd(filter.dateTo) } : {}) };
    }
    const trips = await this.prisma.db.trip.findMany({
      where,
      include: { order: { select: { id: true, code: true } }, driver: { select: { id: true, code: true, name: true } }, advanceReconcile: true },
      orderBy: { plannedStartAt: 'desc' },
      take: 300,
    });
    const views = await Promise.all(trips.map((t) => this.view(t)));
    return filter.status ? views.filter((v) => v.status === filter.status) : views;
  }

  private async view(t: any) {
    const c = await this.compute(t.id);
    const rec = t.advanceReconcile;
    const cats = await this.catalogs.labels(c.advanceRows.map((a: any) => a.categoryId));
    const counts = await this.attachments.counts('EXPENSE', c.advanceRows.map((a: any) => a.id));
    return {
      tripId: t.id, tripCode: t.code, tripStatus: t.status, plannedStartAt: t.plannedStartAt, orderId: t.order.id, orderCode: t.order.code,
      driver: t.driver ? { id: t.driver.id, code: t.driver.code, name: t.driver.name } : null,
      advanceAmount: c.advanceAmount, spentFromAdvance: c.spentFromAdvance, actualCost: c.actualCost, returned: c.returned, reimbursed: c.reimbursed,
      difference: c.difference, status: rec?.status ?? 'OPEN', resolution: rec?.resolution ?? null, resolvedAt: rec?.resolvedAt ?? null,
      reason: rec?.reason ?? null, note: rec?.note ?? null,
      advances: c.advanceRows.map((a: any) => expenseView(a, cats, counts)),
    };
  }

  async get(tripId: string) {
    const t = await this.prisma.db.trip.findFirst({
      where: { id: tripId },
      include: { order: { select: { id: true, code: true } }, driver: { select: { id: true, code: true, name: true } }, advanceReconcile: true },
    });
    if (!t) throw notFound('chuyến');
    return this.view(t);
  }

  async reconcile(input: ReconcileTripAdvanceInput) {
    const data = parse(reconcileAdvanceSchema, input);
    const trip = await this.prisma.db.trip.findFirst({ where: { id: data.tripId }, include: { order: true, driver: true } });
    if (!trip) throw notFound('chuyến');
    if (!trip.driverId) throw businessRule('Chuyến chưa có tài xế nên không đối soát tạm ứng');
    const c = await this.compute(trip.id);
    if (c.advanceAmount <= 0) throw businessRule('Chuyến chưa có khoản tạm ứng');
    const reason = (data.reason ?? '').trim();
    const needReason = (amount: number, expected: number) => {
      if (amount !== expected && reason.length < MIN_REASON_LENGTH) throw reasonRequired();
    };
    const p = currentPrincipal();
    const userId = p?.type === 'USER' ? p.membershipId : undefined;

    return this.prisma.tx(async (tx) => {
      let summary = '';
      if (data.resolution === 'DRIVER_RETURNS') {
        if (c.difference <= 0) throw businessRule('Tài xế không còn tiền tạm ứng phải nộp lại');
        const amount = data.amount ?? c.difference;
        needReason(amount, c.difference);
        if (amount <= 0) throw businessRule('Số tiền phải > 0');
        const code = await this.numbering.next('PAYMENT_IN', tx);
        await tx.paymentIn.create({
          data: { code, type: 'DRIVER_ADVANCE_RETURN', driverId: trip.driverId, tripId: trip.id, amount: BigInt(amount), receivedAt: new Date(), method: 'CASH', note: data.note ?? `Nộp lại tạm ứng chuyến ${trip.code}`, createdByUserId: userId } as any,
        });
        summary = `Tài xế nộp lại tạm ứng ${amount.toLocaleString('vi-VN')} đ (${code})`;
      } else if (data.resolution === 'COMPANY_REIMBURSES') {
        if (c.difference >= 0) throw businessRule('Chi phí chưa vượt tạm ứng, không cần hoàn thêm');
        const amount = data.amount ?? -c.difference;
        needReason(amount, -c.difference);
        if (amount <= 0) throw businessRule('Số tiền phải > 0');
        const code = await this.numbering.next('EXPENSE', tx);
        await tx.expense.create({
          data: { code, kind: 'DRIVER_REIMBURSEMENT', amount: BigInt(amount), expenseDate: todayDbDate(), paidBy: 'COMPANY', paidStatus: 'PAID', paidAt: new Date(), tripId: trip.id, orderId: trip.orderId, driverId: trip.driverId, description: `Hoàn thêm chi phí vượt tạm ứng chuyến ${trip.code}`, note: data.note, createdByUserId: userId } as any,
        });
        summary = `Công ty hoàn thêm ${amount.toLocaleString('vi-VN')} đ cho tài xế (${code})`;
      } else if (data.resolution === 'MATCHED') {
        if (c.difference !== 0) throw businessRule('Tạm ứng chưa khớp chi phí — chọn nộp lại / hoàn thêm');
        summary = 'Tạm ứng khớp chi phí';
      } else {
        // WRITE_OFF: chấp nhận chênh lệch, không phát sinh chứng từ — thao tác nhạy cảm.
        if (reason.length < MIN_REASON_LENGTH) throw reasonRequired();
        summary = `Chốt đối soát, bỏ qua chênh lệch ${c.difference.toLocaleString('vi-VN')} đ`;
      }
      const after = await this.compute(trip.id, tx);
      await tx.tripAdvanceReconciliation.upsert({
        where: { tripId: trip.id },
        create: { tripId: trip.id, status: 'RECONCILED', resolution: data.resolution, advanceAmount: after.advanceAmount, actualCost: after.actualCost, differenceAmount: after.difference, resolvedAt: new Date(), resolvedByUserId: userId, reason: reason || null, note: data.note } as any,
        update: { status: 'RECONCILED', resolution: data.resolution, advanceAmount: after.advanceAmount, actualCost: after.actualCost, differenceAmount: after.difference, resolvedAt: new Date(), resolvedByUserId: userId, reason: reason || null, note: data.note },
      });
      const sensitive = !!reason;
      await this.audit.log(
        {
          entityType: 'TRIP', entityId: trip.id, parent: { type: 'ORDER', id: trip.orderId }, category: sensitive ? 'SENSITIVE' : 'MONEY', sensitive,
          action: 'tripAdvance.reconcile', summary: `Đối soát tạm ứng ${trip.code}: ${summary}`, reason: reason || null,
          before: { advance: c.advanceAmount, spent: c.spentFromAdvance, difference: c.difference }, after: { difference: after.difference, resolution: data.resolution },
        },
        tx,
      );
    }).then(() => this.get(trip.id));
  }
}
