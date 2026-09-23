import { Injectable } from '@nestjs/common';
import { customerLocationSchema, customerSchema, formatVnd, type CustomerInput as CustomerInputData } from '@bta/shared';
import { big, num } from '@bta/db';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { assertSensitive, hasPermission } from '../../common/auth/sensitive';
import { businessRule, forbidden, notFound } from '../../common/errors/app-error';
import { FinanceCalcService } from '../../common/finance/finance-calc.service';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { CatalogsService } from '../catalogs/catalogs.service';
import type { CustomerFilter, CustomerInput, CustomerLocationInput } from './customers.types';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly finance: FinanceCalcService,
    private readonly catalogs: CatalogsService,
  ) {}

  /** Map Prisma row → CustomerView, gắn debtSummary/credit/warnings (tính chung FinanceCalcService). */
  private async decorate<T extends { id: string; groupId: string | null; creditLimit: bigint | null; portalAccountId: string | null }>(rows: T[]) {
    const ids = rows.map((r) => r.id);
    const [debts, counts, groups] = await Promise.all([
      this.finance.customerDebtSummaries(ids),
      this.prisma.db.order.groupBy({ by: ['customerId'], where: { customerId: { in: ids } }, _count: true }),
      this.catalogs.labels(rows.map((r) => r.groupId)),
    ]);
    return rows.map((r) => {
      const d = debts.get(r.id)!;
      const warnings: string[] = [];
      if (d.overLimit) warnings.push(`Vượt hạn mức nợ (${d.limitUsagePct}%)`);
      if (d.overdueOrders) warnings.push(`${d.overdueOrders} đơn quá hạn, tối đa ${d.maxOverdueDays} ngày`);
      return {
        ...r,
        creditLimit: r.creditLimit === null ? null : num(r.creditLimit),
        groupName: r.groupId ? groups.get(r.groupId) ?? null : null,
        hasPortalAccount: !!r.portalAccountId,
        orderCount: (counts.find((c: any) => c.customerId === r.id) as any)?._count ?? 0,
        debtSummary: d,
        creditBalance: d.creditBalance,
        warnings,
      };
    });
  }

  async list(filter: CustomerFilter = {}, page: { first?: number; after?: string | null }) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.groupId) where.groupId = filter.groupId;
    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { taxCode: { contains: q } },
      ];
    }
    const { take, skip } = pageParams(page);
    if (filter.debtStatus) {
      // Lọc theo công nợ: cần tính trên toàn tập rồi phân trang trong bộ nhớ (số khách/merchant nhỏ).
      const all = await this.decorate(await this.prisma.db.customer.findMany({ where, orderBy: { name: 'asc' } }));
      const f = all.filter((c) =>
        filter.debtStatus === 'OVERDUE' ? c.debtSummary.overdueOrders > 0
        : filter.debtStatus === 'OVER_LIMIT' ? c.debtSummary.overLimit
        : filter.debtStatus === 'HAS_DEBT' ? c.debtSummary.remaining > 0
        : filter.debtStatus === 'HAS_CREDIT' ? c.creditBalance > 0
        : true,
      );
      return toConnection(f.slice(skip, skip + take), f.length, skip, take);
    }
    const [rows, total] = await Promise.all([
      this.prisma.db.customer.findMany({ where, orderBy: [{ status: 'asc' }, { name: 'asc' }], take, skip }),
      this.prisma.db.customer.count({ where }),
    ]);
    return toConnection(await this.decorate(rows), total, skip, take);
  }

  async get(id: string) {
    const c = await this.prisma.db.customer.findFirst({ where: { id } });
    if (!c) throw notFound('khách hàng');
    const [view] = await this.decorate([c]);
    return { ...view, locations: await this.locations(id, true) };
  }

  private toData(data: CustomerInputData) {
    return {
      ...data,
      creditLimit: data.creditLimit === undefined ? undefined : data.creditLimit === null ? null : big(data.creditLimit),
      primaryContact: data.primaryContact ?? undefined,
    };
  }

  async create(input: CustomerInput) {
    const data = parse(customerSchema, input);
    return this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('CUSTOMER', tx);
      const c = await tx.customer.create({ data: { ...this.toData(data), code, status: data.status ?? 'ACTIVE' } as any });
      await this.audit.log({ entityType: 'CUSTOMER', entityId: c.id, category: 'CREATE', action: 'customer.create', summary: `Tạo khách hàng ${c.code} · ${c.name}` }, tx);
      return c;
    }).then((c) => this.get(c.id));
  }

  async update(id: string, input: CustomerInput) {
    const before = await this.prisma.db.customer.findFirst({ where: { id } });
    if (!before) throw notFound('khách hàng');
    const data = parse(customerSchema, input);
    if (data.status === 'INACTIVE' && before.status !== 'INACTIVE') throw businessRule('Dùng thao tác "Ngừng hoạt động" để đổi trạng thái');
    const next = this.toData(data);
    await this.prisma.tx(async (tx) => {
      await tx.customer.update({ where: { id }, data: { ...next, status: undefined } as any });
      const d = diffFields(before as any, next as any);
      if (d.changed.length) {
        const moneyChange = d.changed.includes('creditLimit');
        await this.audit.log({
          entityType: 'CUSTOMER', entityId: id, category: moneyChange ? 'MONEY' : 'UPDATE', action: 'customer.update',
          summary: `Cập nhật khách hàng (${d.changed.join(', ')})${moneyChange ? ` · hạn mức ${formatVnd(num(before.creditLimit))} → ${formatVnd(next.creditLimit ? num(next.creditLimit) : 0)}` : ''}`,
          before: d.before, after: d.after,
        }, tx);
      }
    });
    return this.get(id);
  }

  /** Ngừng hoạt động: khách đã có đơn = thao tác nhạy cảm (quyền customer.deactivate + lý do). */
  async deactivate(id: string, reason: string | null | undefined) {
    const c = await this.prisma.db.customer.findFirst({ where: { id } });
    if (!c) throw notFound('khách hàng');
    const orders = await this.prisma.db.order.count({ where: { customerId: id } });
    let r = (reason ?? '').trim();
    if (orders > 0) r = assertSensitive('customer.deactivate', reason);
    else if (!hasPermission('customer.deactivate') && !hasPermission('customer.edit')) throw forbidden();
    await this.prisma.tx(async (tx) => {
      await tx.customer.update({ where: { id }, data: { status: 'INACTIVE', deactivateReason: r || null } });
      await this.audit.log({ entityType: 'CUSTOMER', entityId: id, category: 'SENSITIVE', sensitive: orders > 0, action: 'customer.deactivate', summary: `Ngừng hoạt động khách hàng ${c.name}`, reason: r, before: { status: c.status }, after: { status: 'INACTIVE' } }, tx);
    });
    return this.get(id);
  }

  async activate(id: string) {
    const c = await this.prisma.db.customer.findFirst({ where: { id } });
    if (!c) throw notFound('khách hàng');
    await this.prisma.tx(async (tx) => {
      await tx.customer.update({ where: { id }, data: { status: 'ACTIVE', deactivateReason: null } });
      await this.audit.log({ entityType: 'CUSTOMER', entityId: id, category: 'UPDATE', action: 'customer.activate', summary: `Kích hoạt lại khách hàng ${c.name}`, before: { status: c.status }, after: { status: 'ACTIVE' } }, tx);
    });
    return this.get(id);
  }

  // ---------- Sổ địa chỉ (WM-CUS-04) ----------

  async locations(customerId: string, includeInactive = false) {
    const rows = await this.prisma.db.customerLocation.findMany({
      where: { customerId, ...(includeInactive ? {} : { active: true }) },
      orderBy: [{ active: 'desc' }, { isDefault: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { stops: true } } },
    });
    return rows.map(({ _count, ...l }) => ({ ...l, usedInOrders: _count.stops }));
  }

  async createLocation(customerId: string, input: CustomerLocationInput) {
    const c = await this.prisma.db.customer.findFirst({ where: { id: customerId } });
    if (!c) throw notFound('khách hàng');
    const data = parse(customerLocationSchema, input);
    const loc = await this.prisma.tx(async (tx) => {
      if (data.isDefault) await tx.customerLocation.updateMany({ where: { customerId }, data: { isDefault: false } });
      const l = await tx.customerLocation.create({ data: { ...data, customerId } as any });
      await this.audit.log({ entityType: 'CUSTOMER', entityId: customerId, category: 'UPDATE', action: 'customer.location.create', summary: `Thêm địa chỉ "${l.name}"` }, tx);
      return l;
    });
    return { ...loc, usedInOrders: 0 };
  }

  async updateLocation(id: string, input: CustomerLocationInput) {
    const before = await this.prisma.db.customerLocation.findFirst({ where: { id } });
    if (!before) throw notFound('địa chỉ');
    const data = parse(customerLocationSchema, input);
    await this.prisma.tx(async (tx) => {
      if (data.isDefault) await tx.customerLocation.updateMany({ where: { customerId: before.customerId, id: { not: id } }, data: { isDefault: false } });
      await tx.customerLocation.update({ where: { id }, data: data as any });
      const d = diffFields(before as any, data as any);
      if (d.changed.length) await this.audit.log({ entityType: 'CUSTOMER', entityId: before.customerId, category: 'UPDATE', action: 'customer.location.update', summary: `Sửa địa chỉ "${data.name}"`, before: d.before, after: d.after }, tx);
    });
    return (await this.locations(before.customerId, true)).find((l) => l.id === id)!;
  }

  /** Địa chỉ đã dùng trong đơn chỉ ẩn khỏi picker (active=false) — đơn cũ giữ snapshot. */
  async deleteLocation(id: string, reason?: string | null) {
    const loc = await this.prisma.db.customerLocation.findFirst({ where: { id }, include: { _count: { select: { stops: true } } } });
    if (!loc) throw notFound('địa chỉ');
    const used = loc._count.stops > 0;
    const r = used ? (reason ?? '').trim() : null;
    if (used && (!r || r.length < 5)) throw businessRule('Địa chỉ đã dùng trong đơn: cần nhập lý do ẩn khỏi sổ địa chỉ');
    await this.prisma.tx(async (tx) => {
      await tx.customerLocation.update({ where: { id }, data: { active: false, isDefault: false } });
      await this.audit.log({ entityType: 'CUSTOMER', entityId: loc.customerId, category: used ? 'SENSITIVE' : 'UPDATE', sensitive: used, action: 'customer.location.delete', summary: `Ẩn địa chỉ "${loc.name}"`, reason: r }, tx);
    });
    return true;
  }

  /** Cảnh báo mềm khi tạo đơn: vượt hạn mức / có đơn quá hạn (09 §2.12). */
  async creditCheck(customerId: string, additionalAmount = 0) {
    const s = (await this.finance.customerDebtSummaries([customerId])).get(customerId);
    if (!s) throw notFound('khách hàng');
    const settings = await this.prisma.db.merchantSettings.findFirst({});
    const projected = s.remaining + additionalAmount;
    const limit = s.creditLimit ?? (settings?.defaultCreditLimit ? num(settings.defaultCreditLimit) : null);
    const warnings: string[] = [];
    const overLimit = !!limit && projected > limit;
    if (overLimit && settings?.warnOverLimit !== false) warnings.push(`Công nợ sau đơn này ${formatVnd(projected)} vượt hạn mức ${formatVnd(limit)}`);
    if (s.overdueOrders > 0 && settings?.warnOverdue !== false) warnings.push(`Khách có ${s.overdueOrders} đơn quá hạn (tối đa ${s.maxOverdueDays} ngày, ${formatVnd(s.overdueAmount)})`);
    return { overLimit, currentDebt: s.remaining, projectedDebt: projected, creditLimit: limit, overdueOrders: s.overdueOrders, warnings };
  }
}
