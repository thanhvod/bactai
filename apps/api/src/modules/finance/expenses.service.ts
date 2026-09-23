import { Injectable } from '@nestjs/common';
import { EXPENSE_KIND, expenseSchema, formatVnd, type ExpenseInput as ExpenseData, type ExpenseKind } from '@bta/shared';
import { big, num } from '@bta/db';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { assertSensitive, hasPermission } from '../../common/auth/sensitive';
import { currentPrincipal } from '../../common/context/request-context';
import { businessRule, forbidden, notFound, validationError } from '../../common/errors/app-error';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService, type Tx } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { AttachmentsService } from '../attachments/attachments.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { AdvanceService } from './advance.service';
import { EXPENSE_INCLUDE, dateOnly, expenseView } from './finance.helpers';
import type { ExpenseFilter, ExpenseInput, MarkExpensePaidInput } from './finance.types';

const DRIVER_FLOW_KINDS: ExpenseKind[] = ['DRIVER_REIMBURSEMENT', 'SALARY_ADVANCE', 'TRIP_ADVANCE', 'SALARY_PAYMENT'];

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly catalogs: CatalogsService,
    private readonly attachments: AttachmentsService,
    private readonly advances: AdvanceService,
  ) {}

  private userId() {
    const p = currentPrincipal();
    return p?.type === 'USER' ? p.membershipId : undefined;
  }

  assertCanView() {
    if (!hasPermission('finance.view') && !hasPermission('expense.create')) throw forbidden('Bạn không có quyền xem phiếu chi');
  }

  async views(rows: any[]) {
    const [cats, counts] = await Promise.all([
      this.catalogs.labels(rows.map((r) => r.categoryId)),
      this.attachments.counts('EXPENSE', rows.map((r) => r.id)),
    ]);
    return rows.map((r) => expenseView(r, cats, counts));
  }

  buildWhere(filter: ExpenseFilter = {}) {
    const where: any = {};
    if (filter.kind?.length) where.kind = { in: filter.kind };
    for (const k of ['categoryId', 'supplierId', 'orderId', 'vehicleId', 'driverId', 'paidBy', 'paidStatus', 'status'] as const) if (filter[k]) where[k] = filter[k];
    if (filter.tripId) where.tripId = filter.tripId;
    if (filter.orderId) {
      delete where.orderId;
      where.OR = [{ orderId: filter.orderId }, { trip: { orderId: filter.orderId } }];
    }
    if (filter.dateFrom || filter.dateTo) where.expenseDate = { ...(filter.dateFrom ? { gte: dateOnly(filter.dateFrom) } : {}), ...(filter.dateTo ? { lte: dateOnly(filter.dateTo) } : {}) };
    if (filter.search) {
      const q = filter.search.trim();
      const s = [{ code: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { supplier: { name: { contains: q, mode: 'insensitive' } } }, { driver: { name: { contains: q, mode: 'insensitive' } } }];
      where.AND = [...(where.AND ?? []), { OR: s }];
    }
    return where;
  }

  async list(filter: ExpenseFilter = {}, page: { first?: number; after?: string | null }) {
    this.assertCanView();
    const where = this.buildWhere(filter);
    const { take, skip } = pageParams(page);
    const [rows, total, sum] = await Promise.all([
      this.prisma.db.expense.findMany({ where, include: EXPENSE_INCLUDE, orderBy: [{ expenseDate: 'desc' }, { code: 'desc' }], take, skip }),
      this.prisma.db.expense.count({ where }),
      this.prisma.db.expense.aggregate({ where: { ...where, status: filter.status ?? 'ACTIVE' }, _sum: { amount: true } }),
    ]);
    return { ...toConnection(await this.views(rows), total, skip, take), totalAmount: num(sum._sum.amount) };
  }

  async get(id: string) {
    const e = await this.prisma.db.expense.findFirst({ where: { id }, include: EXPENSE_INCLUDE });
    if (!e) throw notFound('phiếu chi');
    return (await this.views([e]))[0];
  }

  /** Chuẩn hóa + kiểm tra luật nghiệp vụ phiếu chi (doc/1-BRD/03 §2, 04 §3, 09 §2.7). */
  private async normalize(input: ExpenseInput, db: Tx | typeof this.prisma.db) {
    const data = parse(expenseSchema, input) as ExpenseData;
    const d = db as any;
    const kind = data.kind as ExpenseKind;
    let { orderId, tripId, vehicleId, driverId, supplierId } = data;
    if (tripId) {
      const trip = await d.trip.findFirst({ where: { id: tripId }, select: { orderId: true, vehicleId: true, driverId: true } });
      if (!trip) throw notFound('chuyến');
      if (orderId && orderId !== trip.orderId) throw businessRule('Chuyến không thuộc đơn hàng đã chọn');
      orderId = trip.orderId;
      vehicleId = vehicleId ?? trip.vehicleId;
      driverId = driverId ?? trip.driverId;
    }
    if (orderId && !(await d.order.count({ where: { id: orderId } }))) throw notFound('đơn hàng');
    if (supplierId) {
      const s = await d.supplier.findFirst({ where: { id: supplierId }, select: { status: true } });
      if (!s) throw notFound('nhà cung cấp');
    }
    if (vehicleId && !(await d.vehicle.count({ where: { id: vehicleId } }))) throw notFound('xe');
    if (driverId && !(await d.driver.count({ where: { id: driverId } }))) throw notFound('tài xế');
    if (data.categoryId) {
      const c = await d.catalogItem.findFirst({ where: { id: data.categoryId, type: 'EXPENSE_CATEGORY' } });
      if (!c) throw validationError([{ field: 'categoryId', message: 'Loại chi phí không hợp lệ' }]);
    }

    const paidBy = data.paidBy ?? 'COMPANY';
    const issues: { field: string; message: string }[] = [];
    if (kind === 'EXTERNAL_TRANSPORT' && !orderId) issues.push({ field: 'orderId', message: 'Thuê xe ngoài phải gắn đơn hàng' });
    if ((paidBy === 'DRIVER' || paidBy === 'DRIVER_ADVANCE') && !driverId) issues.push({ field: 'driverId', message: 'Chọn tài xế đã chi' });
    if (paidBy === 'DRIVER_ADVANCE' && !tripId) issues.push({ field: 'tripId', message: 'Chi từ tạm ứng phải gắn chuyến' });
    if (kind === 'TRIP_ADVANCE' && (!tripId || !driverId)) issues.push({ field: 'tripId', message: 'Tạm ứng chuyến phải gắn chuyến có tài xế' });
    if ((kind === 'SALARY_ADVANCE' || kind === 'DRIVER_REIMBURSEMENT' || kind === 'SALARY_PAYMENT') && !driverId) issues.push({ field: 'driverId', message: 'Chọn tài xế' });
    if (DRIVER_FLOW_KINDS.includes(kind) && paidBy !== 'COMPANY') issues.push({ field: 'paidBy', message: `${EXPENSE_KIND[kind].label} phải do công ty chi` });
    if (data.paidStatus === 'UNPAID' && paidBy !== 'COMPANY') issues.push({ field: 'paidStatus', message: 'Chỉ phiếu công ty chi mới có trạng thái chưa trả' });
    if (data.paidStatus === 'UNPAID' && !supplierId) issues.push({ field: 'supplierId', message: 'Phiếu chưa trả cần chọn nhà cung cấp (công nợ NCC)' });
    if (issues.length) throw validationError(issues);

    const paidStatus = paidBy === 'COMPANY' ? data.paidStatus ?? 'PAID' : 'PAID';
    return {
      kind,
      categoryId: data.categoryId ?? null,
      amount: big(data.amount),
      expenseDate: dateOnly(data.expenseDate),
      paidBy,
      reimbursable: paidBy === 'DRIVER' ? data.reimbursable ?? true : false,
      paidStatus,
      supplierId: supplierId ?? null,
      orderId: orderId ?? null,
      tripId: tripId ?? null,
      vehicleId: vehicleId ?? null,
      driverId: driverId ?? null,
      description: data.description ?? null,
      note: data.note ?? null,
    };
  }

  async create(input: ExpenseInput) {
    // attachmentIds: chứng từ được presign SAU khi tạo phiếu (entityType EXPENSE) nên ở đây chỉ bỏ qua.
    const id = await this.prisma.tx(async (tx) => {
      const data = await this.normalize(input, tx);
      const code = await this.numbering.next('EXPENSE', tx);
      const e = await tx.expense.create({ data: { ...data, code, paidAt: data.paidStatus === 'PAID' && data.paidBy === 'COMPANY' ? new Date() : null, createdByUserId: this.userId() } as any });
      await this.audit.log(
        {
          entityType: 'EXPENSE', entityId: e.id, parent: e.orderId ? { type: 'ORDER', id: e.orderId } : undefined, category: 'MONEY', action: 'expense.create',
          summary: `Tạo phiếu chi ${code} · ${EXPENSE_KIND[e.kind as ExpenseKind].label} ${formatVnd(num(e.amount))}`,
        },
        tx,
      );
      if (e.tripId) {
        await this.audit.log({ entityType: 'TRIP', entityId: e.tripId, category: 'MONEY', action: 'expense.create', summary: `Thêm chi phí ${code} ${formatVnd(num(e.amount))}` }, tx);
        await this.advances.refresh(e.tripId, tx);
      }
      return e.id;
    });
    return this.get(id);
  }

  async update(id: string, input: ExpenseInput, reason: string) {
    const r = assertSensitive('expense.update', reason);
    const before = await this.prisma.db.expense.findFirst({ where: { id } });
    if (!before) throw notFound('phiếu chi');
    if (before.status === 'CANCELLED') throw businessRule('Phiếu chi đã hủy, không sửa được');
    await this.assertNotDeducted(id);
    await this.prisma.tx(async (tx) => {
      const data = await this.normalize(input, tx);
      const paidAt = data.paidStatus === 'PAID' && data.paidBy === 'COMPANY' ? before.paidAt ?? new Date() : before.paidStatus === 'PAID' && data.paidStatus === 'UNPAID' ? null : before.paidAt;
      await tx.expense.update({ where: { id }, data: { ...data, paidAt } as any });
      const d = diffFields(before as any, data as any);
      await this.audit.log(
        {
          entityType: 'EXPENSE', entityId: id, parent: before.orderId ? { type: 'ORDER', id: before.orderId } : undefined, category: 'SENSITIVE', sensitive: true,
          action: 'expense.update', summary: `Sửa phiếu chi ${before.code} (${d.changed.join(', ') || 'không đổi'})`, reason: r, before: d.before, after: d.after,
        },
        tx,
      );
      await this.advances.refresh(before.tripId, tx);
      if (data.tripId !== before.tripId) await this.advances.refresh(data.tripId, tx);
    });
    return this.get(id);
  }

  private async assertNotDeducted(expenseId: string) {
    const used = await this.prisma.db.payrollLineItem.findFirst({ where: { expenseId, line: { payroll: { status: { in: ['APPROVED', 'PAID'] } } } }, include: { line: { include: { payroll: true } } } });
    if (used) throw businessRule(`Phiếu chi đã được trừ vào bảng lương ${used.line.payroll.code} (đã duyệt) — điều chỉnh ở kỳ lương sau`);
  }

  async cancel(id: string, reason: string) {
    const r = assertSensitive('expense.update', reason);
    const e = await this.prisma.db.expense.findFirst({ where: { id } });
    if (!e) throw notFound('phiếu chi');
    if (e.status === 'CANCELLED') throw businessRule('Phiếu chi đã hủy');
    await this.assertNotDeducted(id);
    await this.prisma.tx(async (tx) => {
      await tx.expense.update({ where: { id }, data: { status: 'CANCELLED', cancelReason: r, cancelledAt: new Date() } });
      await this.audit.log(
        {
          entityType: 'EXPENSE', entityId: id, parent: e.orderId ? { type: 'ORDER', id: e.orderId } : undefined, category: 'SENSITIVE', sensitive: true,
          action: 'expense.cancel', summary: `Hủy phiếu chi ${e.code} ${formatVnd(num(e.amount))}`, reason: r, before: { status: e.status }, after: { status: 'CANCELLED' },
        },
        tx,
      );
      await this.advances.refresh(e.tripId, tx);
    });
    return this.get(id);
  }

  /** Trả NCC: đánh dấu phiếu chi công ty chưa trả → đã trả. */
  async markPaid(ids: string[], input: MarkExpensePaidInput = {}) {
    if (!ids.length) throw validationError([{ field: 'ids', message: 'Chọn phiếu chi' }]);
    const rows = await this.prisma.db.expense.findMany({ where: { id: { in: ids } } });
    if (rows.length !== ids.length) throw notFound('phiếu chi');
    const bad = rows.find((e) => e.status !== 'ACTIVE' || e.paidStatus !== 'UNPAID' || e.paidBy !== 'COMPANY');
    if (bad) throw businessRule(`Phiếu ${bad.code} không ở trạng thái chưa trả`);
    const paidAt = input.paidAt ?? new Date();
    const method = input.method && ['BANK_TRANSFER', 'CASH', 'OTHER'].includes(input.method) ? input.method : 'BANK_TRANSFER';
    await this.prisma.tx(async (tx) => {
      for (const e of rows) {
        await tx.expense.update({ where: { id: e.id }, data: { paidStatus: 'PAID', paidAt, paidMethod: method as any, note: input.note ? [e.note, input.note].filter(Boolean).join('\n') : e.note } });
        await this.audit.log({ entityType: 'EXPENSE', entityId: e.id, category: 'MONEY', action: 'expense.markPaid', summary: `Đã trả ${e.code} ${formatVnd(num(e.amount))}`, before: { paidStatus: 'UNPAID' }, after: { paidStatus: 'PAID', paidMethod: method } }, tx);
      }
    });
    return Promise.all(ids.map((id) => this.get(id)));
  }
}
