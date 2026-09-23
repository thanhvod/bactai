import { Injectable } from '@nestjs/common';
import { RECEIVABLE_ORDER_STATUSES, TRIP_STATUS, labelOf, orderDebt, type OrderStatus } from '@bta/shared';
import { num } from '@bta/db';
import { z } from 'zod';
import { businessRule, notFound } from '../../common/errors/app-error';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { parse } from '../../common/validation/zod';
import type { CustomerAddressInput, CustomerProfileInput, MyOrderFilter, PublicMerchantFilter } from './portal.types';

const addressSchema = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(500),
  usage: z.enum(['PICKUP', 'DROPOFF', 'BOTH', 'DOCUMENTS']).default('BOTH'),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  contactName: z.string().trim().max(200).optional().nullable(),
  contactPhone: z.string().trim().max(30).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
  isDefaultPickup: z.boolean().optional(),
});

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email('Email không hợp lệ').max(200).optional().nullable().or(z.literal('')),
  companyName: z.string().trim().max(300).optional().nullable(),
  taxCode: z.string().trim().max(50).optional().nullable(),
  billingAddress: z.string().trim().max(500).optional().nullable(),
  contactTitle: z.string().trim().max(100).optional().nullable(),
  notificationPrefs: z.any().optional(),
});

/**
 * Web Khách hàng (phase 3). Principal CUSTOMER không có merchant context → dùng prisma.raw và luôn lọc
 * theo các hồ sơ Customer đã liên kết (portalAccountId = account) — khách chỉ thấy dữ liệu của mình.
 */
@Injectable()
export class PortalService {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService) {}

  private async links(accountId: string) {
    return this.prisma.raw.customer.findMany({ where: { portalAccountId: accountId }, include: { merchant: true } });
  }

  async me(accountId: string) {
    const [account, links] = await Promise.all([this.prisma.raw.customerAccount.findUniqueOrThrow({ where: { id: accountId } }), this.links(accountId)]);
    const counts = await this.prisma.raw.order.groupBy({ by: ['customerId'], where: { customerId: { in: links.map((l) => l.id) } }, _count: true });
    return {
      account,
      merchantLinks: links.map((l) => ({
        merchantId: l.merchantId, merchantName: l.merchant.name, customerCode: l.code, paymentTermDays: l.defaultDebtDays,
        orderCount: (counts.find((c: any) => c.customerId === l.id) as any)?._count ?? 0,
      })),
    };
  }

  async updateProfile(accountId: string, input: CustomerProfileInput) {
    const d = parse(profileSchema, input);
    // SĐT là định danh đăng nhập (OTP) — không đổi ở đây.
    const email = d.email ? d.email.toLowerCase() : null;
    if (email) {
      const dup = await this.prisma.raw.customerAccount.findFirst({ where: { email, id: { not: accountId } } });
      if (dup) throw businessRule('Email đã được dùng cho tài khoản khác');
    }
    await this.prisma.raw.customerAccount.update({ where: { id: accountId }, data: { ...d, email } as any });
    return this.me(accountId);
  }

  // ---------- Địa chỉ ----------
  addresses(accountId: string) {
    return this.prisma.raw.customerAddress.findMany({ where: { accountId }, orderBy: [{ isDefaultPickup: 'desc' }, { name: 'asc' }] });
  }

  async createAddress(accountId: string, input: CustomerAddressInput) {
    const d = parse(addressSchema, input);
    if (d.isDefaultPickup) await this.prisma.raw.customerAddress.updateMany({ where: { accountId }, data: { isDefaultPickup: false } });
    return this.prisma.raw.customerAddress.create({ data: { ...d, accountId } as any });
  }

  async updateAddress(accountId: string, id: string, input: CustomerAddressInput) {
    const a = await this.prisma.raw.customerAddress.findFirst({ where: { id, accountId } });
    if (!a) throw notFound('địa chỉ');
    const d = parse(addressSchema, input);
    if (d.isDefaultPickup) await this.prisma.raw.customerAddress.updateMany({ where: { accountId, id: { not: id } }, data: { isDefaultPickup: false } });
    return this.prisma.raw.customerAddress.update({ where: { id }, data: d as any });
  }

  /** Booking lưu snapshot địa chỉ nên xóa ở sổ không ảnh hưởng booking/đơn đã gửi. */
  async deleteAddress(accountId: string, id: string) {
    const a = await this.prisma.raw.customerAddress.findFirst({ where: { id, accountId } });
    if (!a) throw notFound('địa chỉ');
    await this.prisma.raw.customerAddress.delete({ where: { id } });
    return true;
  }

  // ---------- Khám phá nhà xe ----------
  private async merchantView(m: any, accountId: string | null) {
    const [vehicles, types, rel] = await Promise.all([
      this.prisma.raw.vehicle.count({ where: { merchantId: m.id, status: 'ACTIVE' } }),
      this.prisma.raw.catalogItem.findMany({ where: { merchantId: m.id, type: 'VEHICLE_TYPE', active: true }, orderBy: { sortOrder: 'asc' } }),
      accountId ? this.prisma.raw.customer.findFirst({ where: { merchantId: m.id, portalAccountId: accountId } }) : null,
    ]);
    let logoUrl: string | null = null;
    if (m.logoAttachmentId) {
      const a = await this.prisma.raw.attachment.findUnique({ where: { id: m.logoAttachmentId } });
      if (a?.status === 'READY') logoUrl = await this.storage.adapter.presignGet(a.storageKey, a.fileName);
    }
    return {
      ...m, logoUrl, vehicleCount: vehicles, vehicleTypes: types.map((t) => t.name), hasRelationship: !!rel,
      myOrderCount: rel ? await this.prisma.raw.order.count({ where: { customerId: rel.id } }) : 0,
    };
  }

  async publicMerchants(filter: PublicMerchantFilter = {}, page: { first?: number; after?: string | null }, accountId: string | null) {
    const where: any = { status: 'ACTIVE', publicProfile: true };
    const and: any[] = [];
    if (filter.keyword) and.push({ OR: [{ name: { contains: filter.keyword, mode: 'insensitive' } }, { intro: { contains: filter.keyword, mode: 'insensitive' } }] });
    if (filter.area) and.push({ OR: [{ serviceAreas: { has: filter.area } }, { province: { contains: filter.area, mode: 'insensitive' } }] });
    if (filter.service) and.push({ services: { has: filter.service } });
    if (filter.vehicleType) and.push({ catalogItems: { some: { type: 'VEHICLE_TYPE', active: true, name: { contains: filter.vehicleType, mode: 'insensitive' } } } });
    if (and.length) where.AND = and;
    const { take, skip } = pageParams(page);
    const [rows, total] = await Promise.all([this.prisma.raw.merchant.findMany({ where, orderBy: { name: 'asc' }, take, skip }), this.prisma.raw.merchant.count({ where })]);
    return toConnection(await Promise.all(rows.map((m) => this.merchantView(m, accountId))), total, skip, take);
  }

  async publicMerchant(id: string, accountId: string | null) {
    const m = await this.prisma.raw.merchant.findFirst({ where: { id, status: 'ACTIVE', publicProfile: true } });
    if (!m) throw notFound('nhà xe');
    return this.merchantView(m, accountId);
  }

  // ---------- Đơn hàng & công nợ của khách ----------
  private async orderWhere(accountId: string, filter: MyOrderFilter = {}) {
    const links = (await this.links(accountId)).filter((l) => l.shareOrderHistory);
    const where: any = { customerId: { in: links.map((l) => l.id) }, status: { not: 'DRAFT' } };
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.keyword) where.OR = [{ code: { contains: filter.keyword, mode: 'insensitive' } }, { routeSummary: { contains: filter.keyword, mode: 'insensitive' } }];
    if (filter.dateFrom || filter.dateTo) where.orderDate = { ...(filter.dateFrom ? { gte: new Date(filter.dateFrom) } : {}), ...(filter.dateTo ? { lte: new Date(filter.dateTo) } : {}) };
    return where;
  }

  private orderInclude = {
    merchant: true, booking: true, addons: true,
    allocations: { where: { payment: { status: 'ACTIVE' as const } } },
  };

  private toMyOrder(o: any) {
    const debt = orderDebt({ status: o.status as OrderStatus, freightAmount: o.freightAmount, addons: o.addons, dueDate: o.dueDate }, o.allocations);
    return {
      id: o.id, code: o.code, status: o.status, orderDate: o.orderDate, merchantName: o.merchant.name, merchantId: o.merchantId, routeSummary: o.routeSummary,
      bookingCode: o.booking?.code ?? null, bookingId: o.booking?.id ?? null,
      totalAmount: debt.total, paidAmount: debt.paid, remainingAmount: Math.max(debt.remaining, 0), dueDate: o.dueDate, overdueDays: debt.overdueDays,
    };
  }

  async myOrders(accountId: string, filter: MyOrderFilter = {}, page: { first?: number; after?: string | null }) {
    const where = await this.orderWhere(accountId, filter);
    const all = (await this.prisma.raw.order.findMany({ where, include: this.orderInclude, orderBy: { orderDate: 'desc' } })).map((o) => this.toMyOrder(o));
    const list = filter.unpaidOnly ? all.filter((o) => o.remainingAmount > 0) : all;
    const { take, skip } = pageParams(page);
    return toConnection(list.slice(skip, skip + take), list.length, skip, take);
  }

  async myOrder(accountId: string, id: string) {
    const where = await this.orderWhere(accountId);
    const o = await this.prisma.raw.order.findFirst({
      where: { ...where, id },
      include: { ...this.orderInclude, stops: { orderBy: { sequence: 'asc' } }, cargoLines: true, trips: { where: { status: { not: 'CANCELLED' } }, include: { vehicle: true, driver: true } }, statementLines: { include: { statement: true } } },
    });
    if (!o) throw notFound('đơn hàng');
    const stopIds = o.stops.map((s) => s.id);
    const tripIds = o.trips.map((t) => t.id);
    const atts = await this.prisma.raw.attachment.findMany({
      where: { merchantId: o.merchantId, status: 'READY', sharedWithCustomer: true, OR: [{ entityType: 'ORDER', entityId: o.id }, { entityType: 'ORDER_STOP', entityId: { in: stopIds } }, { entityType: 'TRIP', entityId: { in: tripIds } }] },
      orderBy: { createdAt: 'desc' },
    });
    const vt = await this.prisma.raw.catalogItem.findMany({ where: { id: { in: o.trips.map((t) => t.vehicle?.typeId).filter(Boolean) as string[] } } });
    const statement = o.statementLines.map((l) => l.statement).find((s) => ['FINALIZED', 'SENT'].includes(s.status) && s.sharedWithCustomer);
    return {
      ...this.toMyOrder(o),
      stops: o.stops.map((s) => ({ type: s.type, place: s.locationName, address: s.address, contactName: s.contactName, plannedAt: s.plannedAt, actualAt: s.completedAt ?? s.arrivedAt, status: s.status })),
      cargo: o.cargoLines.map((c) => [c.name, c.weightKg ? `${c.weightKg} kg` : null, c.quantity ? `${c.quantity} ${c.packagingUnit ?? ''}`.trim() : null].filter(Boolean).join(' · ')),
      trips: o.trips.map((t) => ({ code: t.code, plate: t.vehicle?.plate ?? null, vehicleType: vt.find((v) => v.id === t.vehicle?.typeId)?.name ?? null, driverName: t.driver?.name ?? null, status: t.status, statusLabel: labelOf(TRIP_STATUS, t.status), lastUpdateAt: t.updatedAt })),
      pricingLines: [{ label: 'Giá cước', amount: num(o.freightAmount) }, ...o.addons.map((a) => ({ label: a.name, amount: num(a.amount) }))],
      sharedAttachments: await Promise.all(atts.map(async (a) => ({ id: a.id, fileName: a.fileName, category: a.category, createdAt: a.createdAt, url: await this.storage.adapter.presignGet(a.storageKey, a.fileName) }))),
      statementCode: statement?.code ?? null,
    };
  }

  async myDebtSummary(accountId: string) {
    const where = await this.orderWhere(accountId);
    const orders = (await this.prisma.raw.order.findMany({ where: { ...where, status: { in: RECEIVABLE_ORDER_STATUSES } }, include: this.orderInclude })).map((o) => this.toMyOrder(o));
    return {
      total: orders.reduce((s, o) => s + o.totalAmount, 0),
      paid: orders.reduce((s, o) => s + o.paidAmount, 0),
      remaining: orders.reduce((s, o) => s + o.remainingAmount, 0),
      overdue: orders.filter((o) => o.overdueDays > 0).reduce((s, o) => s + o.remainingAmount, 0),
      openOrders: orders.filter((o) => o.remainingAmount > 0).length,
    };
  }

  private async statementView(s: any, withLines: boolean) {
    let pdfUrl: string | null = null;
    if (s.pdfAttachmentId) {
      const a = await this.prisma.raw.attachment.findUnique({ where: { id: s.pdfAttachmentId } });
      if (a?.status === 'READY') pdfUrl = await this.storage.adapter.presignGet(a.storageKey, a.fileName, false);
    }
    return {
      id: s.id, code: s.code, merchantName: s.merchant.name, periodFrom: s.periodFrom, periodTo: s.periodTo, sentAt: s.sentAt, orderCount: s.lineCount,
      total: num(s.totalAmount), paid: num(s.paidAmount), remaining: num(s.remainingAmount), status: s.status, pdfUrl,
      lines: withLines ? s.lines.map((l: any) => ({ orderDate: l.orderDate, orderCode: l.orderCode, orderId: l.orderId, route: l.route, total: num(l.totalAmount), paid: num(l.paidAmount), remaining: num(l.remainingAmount), dueDate: l.dueDate, overdueDays: l.overdueDays })) : undefined,
    };
  }

  /** Chỉ bảng kê đã chốt/đã gửi và được chia sẻ. */
  async myDebtStatements(accountId: string) {
    const links = await this.links(accountId);
    const rows = await this.prisma.raw.debtStatement.findMany({
      where: { customerId: { in: links.map((l) => l.id) }, status: { in: ['FINALIZED', 'SENT'] }, sharedWithCustomer: true },
      include: { merchant: true }, orderBy: { periodTo: 'desc' },
    });
    return Promise.all(rows.map((s) => this.statementView(s, false)));
  }

  async myDebtStatement(accountId: string, id: string) {
    const links = await this.links(accountId);
    const s = await this.prisma.raw.debtStatement.findFirst({
      where: { id, customerId: { in: links.map((l) => l.id) }, status: { in: ['FINALIZED', 'SENT'] }, sharedWithCustomer: true },
      include: { merchant: true, lines: { orderBy: { sequence: 'asc' } } },
    });
    if (!s) throw notFound('bảng kê');
    return this.statementView(s, true);
  }
}
