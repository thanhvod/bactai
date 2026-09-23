import { Injectable } from '@nestjs/common';
import { isUnpaidSupplierExpense, supplierSchema } from '@bta/shared';
import { num } from '@bta/db';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { businessRule, notFound, reasonRequired } from '../../common/errors/app-error';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { CatalogsService } from '../catalogs/catalogs.service';
import { EXPENSE_ITEM_INCLUDE, daysBetween, toExpenseItem, todayDate } from '../drivers/master-helpers';
import type { SupplierFilter, SupplierInput } from './suppliers.types';

const UNPAID_WHERE = { status: 'ACTIVE' as const, paidStatus: 'UNPAID' as const, paidBy: 'COMPANY' as const };

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly catalogs: CatalogsService,
  ) {}

  /** Công nợ NCC = Σ phiếu chi gắn NCC còn hiệu lực, chưa trả, công ty chi (isUnpaidSupplierExpense). */
  private async payables(ids: string[]) {
    const rows = await this.prisma.db.expense.findMany({
      where: { supplierId: { in: ids }, ...UNPAID_WHERE },
      select: { supplierId: true, amount: true, expenseDate: true, paidStatus: true, status: true, paidBy: true },
    });
    const today = todayDate();
    const map = new Map<string, { total: number; unpaidCount: number; oldestDays: number; aging: { d0_15: number; d16_30: number; d31_60: number; d60p: number } }>();
    for (const id of ids) map.set(id, { total: 0, unpaidCount: 0, oldestDays: 0, aging: { d0_15: 0, d16_30: 0, d31_60: 0, d60p: 0 } });
    for (const e of rows) {
      if (!isUnpaidSupplierExpense(e as any)) continue;
      const p = map.get(e.supplierId!)!;
      const amt = num(e.amount);
      const days = Math.max(daysBetween(e.expenseDate, today), 0);
      p.total += amt;
      p.unpaidCount += 1;
      p.oldestDays = Math.max(p.oldestDays, days);
      if (days <= 15) p.aging.d0_15 += amt;
      else if (days <= 30) p.aging.d16_30 += amt;
      else if (days <= 60) p.aging.d31_60 += amt;
      else p.aging.d60p += amt;
    }
    return map;
  }

  private async decorate(rows: any[]) {
    const ids = rows.map((r) => r.id);
    const [labels, payables, counts] = await Promise.all([
      this.catalogs.labels(rows.map((r) => r.typeId)),
      this.payables(ids),
      this.prisma.db.expense.groupBy({ by: ['supplierId'], where: { supplierId: { in: ids }, status: 'ACTIVE' }, _count: true }),
    ]);
    return rows.map((r) => {
      const p = payables.get(r.id)!;
      return {
        ...r,
        contacts: Array.isArray(r.contacts) ? r.contacts : [],
        type: r.typeId ? { id: r.typeId, name: labels.get(r.typeId) ?? '' } : null,
        expenseCount: (counts.find((c: any) => c.supplierId === r.id) as any)?._count ?? 0,
        payableAmount: p.total,
        payable: p,
      };
    });
  }

  async list(filter: SupplierFilter = {}, page: { first?: number; after?: string | null }, sort?: string | null) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.typeId) where.typeId = filter.typeId;
    if (filter.hasDebt) where.expenses = { some: { ...UNPAID_WHERE } };
    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }, { taxCode: { contains: q } }];
    }
    const orderBy = sort === 'code' ? { code: 'asc' as const } : sort === '-createdAt' ? { createdAt: 'desc' as const } : { name: 'asc' as const };
    const { take, skip } = pageParams(page);
    const [rows, total] = await Promise.all([
      this.prisma.db.supplier.findMany({ where, orderBy: [{ status: 'asc' }, orderBy], take, skip }),
      this.prisma.db.supplier.count({ where }),
    ]);
    return toConnection(await this.decorate(rows), total, skip, take);
  }

  async get(id: string) {
    const s = await this.prisma.db.supplier.findFirst({ where: { id } });
    if (!s) throw notFound('nhà cung cấp');
    const [view] = await this.decorate([s]);
    const [expenses, transports] = await Promise.all([
      this.prisma.db.expense.findMany({ where: { supplierId: id }, include: EXPENSE_ITEM_INCLUDE, orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }], take: 20 }),
      this.prisma.db.externalTransportInfo.findMany({ where: { supplierId: id }, include: { order: { select: { code: true } }, trip: { select: { code: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    const labels = await this.catalogs.labels(expenses.map((e) => e.categoryId));
    return {
      ...view,
      recentExpenses: expenses.map((e) => toExpenseItem(e, labels)),
      externalTransports: transports.map((t) => ({ ...t, orderCode: t.order?.code ?? null, tripCode: t.trip?.code ?? null, agreedAmount: t.agreedAmount === null ? null : num(t.agreedAmount) })),
    };
  }

  private toData(data: ReturnType<typeof supplierSchema.parse>) {
    return {
      name: data.name,
      typeId: data.typeId,
      taxCode: data.taxCode,
      address: data.address,
      bankName: data.bankName,
      bankAccountNo: data.bankAccountNo,
      paymentTerms: data.paymentTerms,
      contacts: data.contacts ?? undefined,
      note: data.note,
    };
  }

  async create(input: SupplierInput) {
    const data = parse(supplierSchema, input);
    const s = await this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('SUPPLIER', tx);
      const s = await tx.supplier.create({ data: { ...this.toData(data), code, status: 'ACTIVE' } as any });
      await this.audit.log({ entityType: 'SUPPLIER', entityId: s.id, category: 'CREATE', action: 'supplier.create', summary: `Tạo nhà cung cấp ${s.code} · ${s.name}` }, tx);
      return s;
    });
    return this.get(s.id);
  }

  async update(id: string, input: SupplierInput) {
    const before = await this.prisma.db.supplier.findFirst({ where: { id } });
    if (!before) throw notFound('nhà cung cấp');
    const data = parse(supplierSchema, input);
    if (data.status === 'INACTIVE' && before.status !== 'INACTIVE') throw businessRule('Dùng thao tác "Ngừng giao dịch" để đổi trạng thái');
    const next = this.toData(data);
    await this.prisma.tx(async (tx) => {
      await tx.supplier.update({ where: { id }, data: next as any });
      const d = diffFields(before as any, next as any);
      if (d.changed.length) await this.audit.log({ entityType: 'SUPPLIER', entityId: id, category: 'UPDATE', action: 'supplier.update', summary: `Cập nhật NCC (${d.changed.join(', ')})`, before: d.before, after: d.after }, tx);
    });
    return this.get(id);
  }

  async deactivate(id: string, reason: string | null | undefined) {
    const s = await this.prisma.db.supplier.findFirst({ where: { id } });
    if (!s) throw notFound('nhà cung cấp');
    const r = (reason ?? '').trim();
    if (r.length < 5) throw reasonRequired();
    await this.prisma.tx(async (tx) => {
      await tx.supplier.update({ where: { id }, data: { status: 'INACTIVE', deactivateReason: r } });
      await this.audit.log({ entityType: 'SUPPLIER', entityId: id, category: 'SENSITIVE', sensitive: true, action: 'supplier.deactivate', summary: `Ngừng giao dịch NCC ${s.name}`, reason: r, before: { status: s.status }, after: { status: 'INACTIVE' } }, tx);
    });
    return this.get(id);
  }

  async activate(id: string) {
    const s = await this.prisma.db.supplier.findFirst({ where: { id } });
    if (!s) throw notFound('nhà cung cấp');
    await this.prisma.tx(async (tx) => {
      await tx.supplier.update({ where: { id }, data: { status: 'ACTIVE', deactivateReason: null } });
      await this.audit.log({ entityType: 'SUPPLIER', entityId: id, category: 'UPDATE', action: 'supplier.activate', summary: `Kích hoạt lại NCC ${s.name}`, before: { status: s.status }, after: { status: 'ACTIVE' } }, tx);
    });
    return this.get(id);
  }

  async options(activeOnly = true) {
    const rows = await this.prisma.db.supplier.findMany({ where: activeOnly ? { status: 'ACTIVE' } : {}, orderBy: [{ status: 'asc' }, { name: 'asc' }] });
    const labels = await this.catalogs.labels(rows.map((r) => r.typeId));
    return rows.map((r) => ({ id: r.id, code: r.code, name: r.name, typeName: r.typeId ? labels.get(r.typeId) ?? null : null, status: r.status }));
  }
}
