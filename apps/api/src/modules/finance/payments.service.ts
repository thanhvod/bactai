import { Injectable } from '@nestjs/common';
import { allocatePaymentSchema, formatVnd, isReceivableStatus, paymentInSchema, type OrderStatus, type PaymentInType } from '@bta/shared';
import { big, num } from '@bta/db';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { assertPermission, assertSensitive, hasPermission } from '../../common/auth/sensitive';
// Lưu ý: tenant-guard chỉ tự thêm merchantId ở create cấp 1 — nested create phải truyền merchantId.
import { currentMerchantId, currentPrincipal } from '../../common/context/request-context';
import { businessRule, forbidden, notFound, validationError } from '../../common/errors/app-error';
import { FinanceCalcService } from '../../common/finance/finance-calc.service';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { IdempotencyService } from '../../common/idempotency/idempotency.service';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService, type Tx } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { AttachmentsService } from '../attachments/attachments.service';
import { AdvanceService } from './advance.service';
import { isNotRevenue, paymentTypeLabel, vnDayEnd, vnDayStart } from './finance.helpers';
import type { AllocatePaymentInput, AllocationLineInput, PaymentFilter, PaymentInInput, UpdatePaymentInInput } from './finance.types';

const PAYMENT_INCLUDE = {
  customer: { select: { id: true, code: true, name: true } },
  driver: { select: { id: true, code: true, name: true } },
  trip: { select: { id: true, code: true } },
  allocations: { include: { order: { select: { id: true, code: true } } }, orderBy: { createdAt: 'asc' as const } },
  codItems: { include: { stop: { select: { id: true, locationName: true, order: { select: { code: true } } } } } },
} as const;

/**
 * Phiếu thu (FIN-002) & phân bổ (FIN-003).
 * Doanh thu KHÔNG lấy từ phiếu thu: doanh thu = giá cước + add-on trên đơn.
 * Phiếu DRIVER_COD_REMITTANCE (tài xế nộp COD) và DRIVER_ADVANCE_RETURN là thu hồi tiền công ty, không phải doanh thu.
 */
@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly finance: FinanceCalcService,
    private readonly idempotency: IdempotencyService,
    private readonly attachments: AttachmentsService,
    private readonly advances: AdvanceService,
  ) {}

  private userId() {
    const p = currentPrincipal();
    return p?.type === 'USER' ? p.membershipId : undefined;
  }

  assertCanView() {
    if (!hasPermission('finance.view') && !hasPermission('payment.create') && !hasPermission('debt.view')) throw forbidden('Bạn không có quyền xem phiếu thu');
  }

  async views(rows: any[]) {
    const counts = await this.attachments.counts('PAYMENT_IN', rows.map((r) => r.id));
    const customerIds = [...new Set(rows.map((r) => r.customerId).filter(Boolean))] as string[];
    const credits = await this.finance.customerCredits(customerIds);
    return rows.map((p) => {
      const allocated = p.allocations.reduce((s: number, a: any) => s + num(a.amount), 0);
      const amount = num(p.amount);
      const payerLabel = p.customer?.name ?? p.driver?.name ?? p.payerName ?? '—';
      return {
        ...p,
        amount,
        typeLabel: paymentTypeLabel(p.type),
        notRevenue: isNotRevenue(p.type),
        customer: p.customer ? { id: p.customer.id, code: p.customer.code, name: p.customer.name } : null,
        driver: p.driver ? { id: p.driver.id, code: p.driver.code, name: p.driver.name } : null,
        trip: p.trip ? { id: p.trip.id, code: p.trip.code } : null,
        payerLabel,
        allocatedAmount: allocated,
        unallocatedAmount: p.type === 'CUSTOMER_PAYMENT' && p.status === 'ACTIVE' ? amount - allocated : 0,
        allocations: p.allocations.map((a: any) => ({ id: a.id, paymentId: p.id, paymentCode: p.code, orderId: a.orderId, orderCode: a.order.code, amount: num(a.amount), createdAt: a.createdAt, receivedAt: p.receivedAt, method: p.method })),
        codItems: p.codItems.map((c: any) => ({ stopId: c.stopId, orderCode: c.stop.order.code, stopName: c.stop.locationName, amount: num(c.amount) })),
        customerCreditBalance: p.customerId ? credits.get(p.customerId) ?? 0 : null,
        attachmentCount: counts.get(p.id) ?? 0,
      };
    });
  }

  async list(filter: PaymentFilter = {}, page: { first?: number; after?: string | null }) {
    this.assertCanView();
    const where: any = {};
    for (const k of ['type', 'method', 'customerId', 'driverId', 'status'] as const) if (filter[k]) where[k] = filter[k];
    if (filter.dateFrom || filter.dateTo) where.receivedAt = { ...(filter.dateFrom ? { gte: vnDayStart(filter.dateFrom) } : {}), ...(filter.dateTo ? { lte: vnDayEnd(filter.dateTo) } : {}) };
    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { payerName: { contains: q, mode: 'insensitive' } },
        { transferNote: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { driver: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }
    const { take, skip } = pageParams(page);
    if (filter.hasUnallocated) {
      const all = await this.views(await this.prisma.db.paymentIn.findMany({ where: { ...where, type: 'CUSTOMER_PAYMENT', status: 'ACTIVE' }, include: PAYMENT_INCLUDE, orderBy: { receivedAt: 'desc' } }));
      const f = all.filter((p) => p.unallocatedAmount > 0);
      return { ...toConnection(f.slice(skip, skip + take), f.length, skip, take), totalAmount: f.reduce((s, p) => s + p.unallocatedAmount, 0) };
    }
    const [rows, total, sum] = await Promise.all([
      this.prisma.db.paymentIn.findMany({ where, include: PAYMENT_INCLUDE, orderBy: [{ receivedAt: 'desc' }, { code: 'desc' }], take, skip }),
      this.prisma.db.paymentIn.count({ where }),
      this.prisma.db.paymentIn.aggregate({ where: { ...where, status: filter.status ?? 'ACTIVE' }, _sum: { amount: true } }),
    ]);
    return { ...toConnection(await this.views(rows), total, skip, take), totalAmount: num(sum._sum.amount) };
  }

  async get(id: string) {
    const p = await this.prisma.db.paymentIn.findFirst({ where: { id }, include: PAYMENT_INCLUDE });
    if (!p) throw notFound('phiếu thu');
    return (await this.views([p]))[0];
  }

  async create(input: PaymentInInput) {
    const { clientRequestId, ...rest } = input;
    return this.idempotency.run(clientRequestId, 'payment.create', () => this.doCreate(rest), (stored) => this.get(stored.id));
  }

  private async doCreate(input: Omit<PaymentInInput, 'clientRequestId'>) {
    const data = parse(paymentInSchema, input);
    const type = data.type as PaymentInType;
    const issues: { field: string; message: string }[] = [];
    if (type === 'CUSTOMER_PAYMENT' && !data.customerId) issues.push({ field: 'customerId', message: 'Chọn khách hàng' });
    if ((type === 'DRIVER_COD_REMITTANCE' || type === 'DRIVER_ADVANCE_RETURN') && !data.driverId) issues.push({ field: 'driverId', message: 'Chọn tài xế' });
    if (type === 'DRIVER_ADVANCE_RETURN' && !data.tripId) issues.push({ field: 'tripId', message: 'Chọn chuyến đã tạm ứng' });
    if (type === 'OTHER' && !data.payerName && !data.customerId && !data.driverId) issues.push({ field: 'payerName', message: 'Nhập người nộp' });
    if (data.allocations?.length && type !== 'CUSTOMER_PAYMENT') issues.push({ field: 'allocations', message: 'Chỉ phiếu khách trả mới phân bổ vào đơn' });
    if (issues.length) throw validationError(issues);
    if (type === 'DRIVER_COD_REMITTANCE') assertPermission('cod.remittance.record');
    if (data.allocations?.length) assertPermission('payment.allocate');

    if (data.customerId && !(await this.prisma.db.customer.count({ where: { id: data.customerId } }))) throw notFound('khách hàng');
    if (data.driverId && !(await this.prisma.db.driver.count({ where: { id: data.driverId } }))) throw notFound('tài xế');

    let codPlan: { stopId: string; amount: number }[] = [];
    if (type === 'DRIVER_COD_REMITTANCE') {
      const ledger = (await this.finance.driverLedgers([data.driverId!])).get(data.driverId!)!;
      if (data.amount > ledger.codHeld) throw businessRule(`Số nộp ${formatVnd(data.amount)} vượt COD tài xế đang giữ ${formatVnd(ledger.codHeld)}`);
      if (data.codStopIds?.length) {
        // Gắn phiếu nộp vào các điểm dừng được chọn theo thứ tự thu cũ nhất trước (FIFO), không vượt số còn giữ từng điểm.
        let left = data.amount;
        const chosen = ledger.codItems.filter((i) => data.codStopIds!.includes(i.stopId));
        if (chosen.length !== new Set(data.codStopIds).size) throw businessRule('Có điểm dừng không còn COD đang giữ');
        for (const i of chosen) {
          if (left <= 0) break;
          const amt = Math.min(left, i.held);
          codPlan.push({ stopId: i.stopId, amount: amt });
          left -= amt;
        }
      }
    }
    if (type === 'DRIVER_ADVANCE_RETURN') {
      const trip = await this.prisma.db.trip.findFirst({ where: { id: data.tripId! } });
      if (!trip) throw notFound('chuyến');
      if (trip.driverId !== data.driverId) throw businessRule('Chuyến không phải của tài xế này');
    }

    const id = await this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('PAYMENT_IN', tx);
      const p = await tx.paymentIn.create({
        data: {
          code, type, customerId: data.customerId ?? null, driverId: data.driverId ?? null, tripId: data.tripId ?? null, payerName: data.payerName ?? null,
          amount: big(data.amount), receivedAt: data.receivedAt, method: data.method, bankAccount: data.bankAccount ?? null, transferNote: data.transferNote ?? null,
          receivedBy: data.receivedBy ?? null, note: data.note ?? null, createdByUserId: this.userId(),
          codItems: codPlan.length ? { create: codPlan.map((c) => ({ merchantId: currentMerchantId(), stopId: c.stopId, amount: big(c.amount) })) } : undefined,
        } as any,
      });
      await this.audit.log(
        {
          entityType: 'PAYMENT_IN', entityId: p.id, category: 'MONEY', action: 'payment.create',
          summary: `Tạo phiếu thu ${code} · ${paymentTypeLabel(type)} ${formatVnd(data.amount)}${isNotRevenue(type) ? ' (thu hồi, không phải doanh thu)' : ''}`,
        },
        tx,
      );
      if (data.allocations?.length) await this.allocateLines(tx, p.id, data.allocations);
      if (type === 'DRIVER_ADVANCE_RETURN') await this.advances.refresh(data.tripId, tx);
      return p.id;
    });
    return this.get(id);
  }

  /** Phân bổ phiếu thu khách vào đơn (thủ công) — kiểm tra đơn cùng khách, không vượt còn nợ, không vượt phần chưa phân bổ. */
  private async allocateLines(tx: Tx, paymentId: string, rawLines: AllocationLineInput[]) {
    const p = await tx.paymentIn.findFirst({ where: { id: paymentId }, include: { allocations: true } });
    if (!p) throw notFound('phiếu thu');
    if (p.type !== 'CUSTOMER_PAYMENT') throw businessRule('Chỉ phiếu khách trả mới phân bổ vào đơn');
    if (p.status !== 'ACTIVE') throw businessRule('Phiếu thu đã hủy');
    const merged = new Map<string, number>();
    for (const l of rawLines) merged.set(l.orderId, (merged.get(l.orderId) ?? 0) + l.amount);
    const lines = [...merged.entries()].map(([orderId, amount]) => ({ orderId, amount }));
    const unallocated = num(p.amount) - p.allocations.reduce((s, a) => s + num(a.amount), 0);
    const total = lines.reduce((s, l) => s + l.amount, 0);
    if (total > unallocated) throw businessRule(`Tổng phân bổ ${formatVnd(total)} vượt số còn lại của phiếu ${formatVnd(unallocated)}`);
    const orders = await tx.order.findMany({ where: { id: { in: lines.map((l) => l.orderId) } }, select: { id: true, code: true, customerId: true, status: true } });
    const debts = await this.finance.orderDebtMap(lines.map((l) => l.orderId));
    for (const l of lines) {
      const o = orders.find((x) => x.id === l.orderId);
      if (!o) throw notFound('đơn hàng');
      if (o.customerId !== p.customerId) throw businessRule(`Đơn ${o.code} không thuộc khách của phiếu thu`);
      if (!isReceivableStatus(o.status as OrderStatus)) throw businessRule(`Đơn ${o.code} chưa phát sinh công nợ (trạng thái ${o.status})`);
      const remaining = debts.get(o.id)?.remaining ?? 0;
      if (l.amount > remaining) throw businessRule(`Phân bổ ${formatVnd(l.amount)} vượt số còn nợ của ${o.code} (${formatVnd(remaining)})`);
    }
    for (const l of lines) {
      const o = orders.find((x) => x.id === l.orderId)!;
      await tx.paymentAllocation.create({ data: { paymentId, orderId: l.orderId, amount: big(l.amount), createdByUserId: this.userId() } as any });
      await this.audit.log({ entityType: 'ORDER', entityId: l.orderId, category: 'MONEY', action: 'payment.allocate', summary: `Nhận phân bổ ${formatVnd(l.amount)} từ ${p.code}`, metadata: { paymentId } }, tx);
      await this.audit.log({ entityType: 'PAYMENT_IN', entityId: paymentId, category: 'MONEY', action: 'payment.allocate', summary: `Phân bổ ${formatVnd(l.amount)} vào ${o.code}`, metadata: { orderId: l.orderId } }, tx);
    }
  }

  async allocate(input: AllocatePaymentInput) {
    const data = parse(allocatePaymentSchema, input);
    const p = await this.prisma.db.paymentIn.findFirst({ where: { id: data.paymentId } });
    if (!p) throw notFound('phiếu thu');
    await this.prisma.tx((tx) => this.allocateLines(tx, data.paymentId, data.lines));
    const payment = await this.get(data.paymentId);
    return { payment, creditBalance: payment.customerCreditBalance ?? 0 };
  }

  /** Gỡ một dòng phân bổ (bút toán phân bổ, cho phép xóa kèm lý do + audit đầy đủ). */
  async unallocate(allocationId: string, reason: string) {
    const r = assertSensitive('payment.update', reason);
    const a = await this.prisma.db.paymentAllocation.findFirst({ where: { id: allocationId }, include: { order: { select: { code: true } }, payment: { select: { code: true } } } });
    if (!a) throw notFound('dòng phân bổ');
    await this.prisma.tx(async (tx) => {
      await tx.paymentAllocation.delete({ where: { id: allocationId } });
      const before = { paymentCode: a.payment.code, orderCode: a.order.code, amount: num(a.amount) };
      await this.audit.log({ entityType: 'PAYMENT_IN', entityId: a.paymentId, category: 'SENSITIVE', sensitive: true, action: 'payment.unallocate', summary: `Gỡ phân bổ ${formatVnd(num(a.amount))} khỏi ${a.order.code}`, reason: r, before }, tx);
      await this.audit.log({ entityType: 'ORDER', entityId: a.orderId, category: 'SENSITIVE', sensitive: true, action: 'payment.unallocate', summary: `Gỡ phân bổ ${formatVnd(num(a.amount))} từ ${a.payment.code}`, reason: r, before }, tx);
    });
    return this.get(a.paymentId);
  }

  async update(id: string, input: UpdatePaymentInInput, reason: string) {
    const r = assertSensitive('payment.update', reason);
    const before = await this.prisma.db.paymentIn.findFirst({ where: { id }, include: { allocations: true, codItems: true } });
    if (!before) throw notFound('phiếu thu');
    if (before.status === 'CANCELLED') throw businessRule('Phiếu thu đã hủy, không sửa được');
    const patch: any = {};
    for (const k of ['receivedAt', 'method', 'payerName', 'bankAccount', 'transferNote', 'receivedBy', 'note'] as const) if (input[k] !== undefined) patch[k] = input[k];
    if (input.method && !['BANK_TRANSFER', 'CASH', 'OTHER'].includes(input.method)) throw validationError([{ field: 'method', message: 'Hình thức không hợp lệ' }]);
    if (input.amount !== undefined) {
      if (!Number.isSafeInteger(input.amount) || input.amount <= 0) throw validationError([{ field: 'amount', message: 'Số tiền phải > 0' }]);
      const allocated = before.allocations.reduce((s, a) => s + num(a.amount), 0);
      const itemized = before.codItems.reduce((s, a) => s + num(a.amount), 0);
      if (input.amount < Math.max(allocated, itemized)) throw businessRule(`Không giảm số tiền thấp hơn đã phân bổ ${formatVnd(Math.max(allocated, itemized))}`);
      if (before.type === 'DRIVER_COD_REMITTANCE' && before.driverId) {
        const ledger = (await this.finance.driverLedgers([before.driverId])).get(before.driverId)!;
        if (input.amount > ledger.codHeld + num(before.amount)) throw businessRule('Số nộp vượt COD tài xế đang giữ');
      }
      patch.amount = big(input.amount);
    }
    await this.prisma.tx(async (tx) => {
      await tx.paymentIn.update({ where: { id }, data: patch });
      const d = diffFields(before as any, patch);
      await this.audit.log({ entityType: 'PAYMENT_IN', entityId: id, category: 'SENSITIVE', sensitive: true, action: 'payment.update', summary: `Sửa phiếu thu ${before.code} (${d.changed.join(', ') || 'không đổi'})`, reason: r, before: d.before, after: d.after }, tx);
      if (before.type === 'DRIVER_ADVANCE_RETURN') await this.advances.refresh(before.tripId, tx);
    });
    return this.get(id);
  }

  /** Hủy phiếu: KHÔNG xóa allocation rows — công thức công nợ chỉ tính phân bổ của phiếu ACTIVE nên tự vô hiệu. */
  async cancel(id: string, reason: string) {
    const r = assertSensitive('payment.update', reason);
    const p = await this.prisma.db.paymentIn.findFirst({ where: { id }, include: { allocations: { include: { order: { select: { code: true } } } } } });
    if (!p) throw notFound('phiếu thu');
    if (p.status === 'CANCELLED') throw businessRule('Phiếu thu đã hủy');
    await this.prisma.tx(async (tx) => {
      await tx.paymentIn.update({ where: { id }, data: { status: 'CANCELLED', cancelReason: r, cancelledAt: new Date() } });
      const voided = p.allocations.map((a) => ({ orderCode: a.order.code, amount: num(a.amount) }));
      await this.audit.log({
        entityType: 'PAYMENT_IN', entityId: id, category: 'SENSITIVE', sensitive: true, action: 'payment.cancel', summary: `Hủy phiếu thu ${p.code} ${formatVnd(num(p.amount))}`,
        reason: r, before: { status: 'ACTIVE', allocations: voided }, after: { status: 'CANCELLED' },
      }, tx);
      for (const a of p.allocations) {
        await this.audit.log({ entityType: 'ORDER', entityId: a.orderId, category: 'MONEY', action: 'payment.cancel', summary: `Phân bổ ${formatVnd(num(a.amount))} từ ${p.code} bị vô hiệu do hủy phiếu`, reason: r }, tx);
      }
      if (p.type === 'DRIVER_ADVANCE_RETURN') await this.advances.refresh(p.tripId, tx);
    });
    return this.get(id);
  }
}
