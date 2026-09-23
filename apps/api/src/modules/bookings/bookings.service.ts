import { Injectable } from '@nestjs/common';
import { BOOKING_STATUS, bookingSchema, labelOf, type BookingStatus } from '@bta/shared';
import { AuditService } from '../../common/audit/audit.service';
import { currentPrincipal, currentStore, runWithStore } from '../../common/context/request-context';
import { businessRule, forbidden, notFound } from '../../common/errors/app-error';
import { paginate } from '../../common/graphql/pagination';
import { NotifyService } from '../../common/notifications/notify.service';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import type { BookingFilter, BookingInput } from '../customer-portal/portal.types';

/** Chạy fn trong scope một merchant (khách hàng thao tác booking không có merchant context sẵn). */
export function inMerchant<T>(merchantId: string, fn: () => Promise<T>): Promise<T> {
  const s = currentStore();
  return runWithStore({ ...(s ?? { requestId: 'x', principal: null }), merchantId }, fn);
}

/**
 * Booking (phase 3): yêu cầu vận chuyển từ khách, KHÔNG tự thành đơn — operation tiếp nhận rồi tạo đơn
 * (createOrder với bookingId, module orders).
 */
@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly notify: NotifyService,
  ) {}

  async view(b: any) {
    const full = b.notes && b.merchant ? b : await this.prisma.raw.booking.findUniqueOrThrow({ where: { id: b.id }, include: { notes: { orderBy: { createdAt: 'asc' } }, merchant: true, order: true, customer: true, account: true } });
    const history = await this.prisma.raw.statusHistory.findMany({ where: { entityType: 'BOOKING', entityId: full.id }, orderBy: { changedAt: 'asc' } });
    return {
      ...full,
      merchantName: full.merchant.name,
      stops: (full.stops as any[]) ?? [],
      orderId: full.order?.id ?? null,
      orderCode: full.order?.code ?? null,
      customerName: full.customer?.name ?? null,
      accountName: full.account?.fullName ?? null,
      accountEmail: full.account?.email ?? null,
      statusHistory: history.map((h) => ({ fromStatus: h.fromStatus, toStatus: h.toStatus, reason: h.reason, actorName: h.actorName, changedAt: h.changedAt })),
      orderAdjustments: full.order ? { freightAmount: Number(full.order.freightAmount), dueDate: full.order.dueDate, note: 'Đơn do nhà xe tạo từ yêu cầu, có thể điều chỉnh giá/điểm/hàng.' } : null,
    };
  }

  private include = { notes: { orderBy: { createdAt: 'asc' as const } }, merchant: true, order: true, customer: true, account: true };

  // ---------- Phía khách hàng ----------

  async createAsCustomer(accountId: string, input: BookingInput) {
    const d = parse(bookingSchema, input);
    const m = await this.prisma.raw.merchant.findFirst({ where: { id: d.merchantId, status: 'ACTIVE', publicProfile: true } });
    if (!m) throw notFound('nhà xe');
    const linked = await this.prisma.raw.customer.findFirst({ where: { merchantId: m.id, portalAccountId: accountId, status: 'ACTIVE' } });
    const booking = await inMerchant(m.id, () =>
      this.prisma.tx(async (tx) => {
        const code = await this.numbering.next('BOOKING', tx);
        const { merchantId: _m, stops, ...rest } = d;
        const b = await tx.booking.create({ data: { ...rest, code, accountId, customerId: linked?.id ?? null, stops: stops as any, status: 'SUBMITTED' } as any });
        await this.audit.statusChange({ entityType: 'BOOKING', entityId: b.id, from: null, to: 'SUBMITTED' }, tx);
        await this.audit.log({ entityType: 'BOOKING', entityId: b.id, category: 'CREATE', action: 'booking.create', summary: `Khách gửi yêu cầu ${code}` }, tx);
        return b;
      }),
    );
    await this.notify.toUsersWithPermission('booking.manage', { type: 'BOOKING_NEW', title: `Yêu cầu vận chuyển mới ${booking.code}`, body: `${d.cargoName} · ${d.contactName} ${d.contactPhone}`, entityType: 'BOOKING', entityId: booking.id, severity: 'info' }, { merchantId: m.id });
    return this.view({ id: booking.id });
  }

  private async ownBooking(accountId: string, id: string) {
    const b = await this.prisma.raw.booking.findFirst({ where: { id, accountId }, include: this.include });
    if (!b) throw notFound('booking');
    return b;
  }

  async myBookings(accountId: string, filter: BookingFilter = {}, page: { first?: number; after?: string | null }) {
    const where: any = { accountId };
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.keyword) where.OR = [{ code: { contains: filter.keyword, mode: 'insensitive' } }, { cargoName: { contains: filter.keyword, mode: 'insensitive' } }];
    if (filter.dateFrom || filter.dateTo) where.createdAt = { ...(filter.dateFrom ? { gte: new Date(filter.dateFrom) } : {}), ...(filter.dateTo ? { lte: new Date(`${filter.dateTo}T23:59:59+07:00`) } : {}) };
    const conn = await paginate(this.prisma.raw.booking as any, { where, orderBy: { createdAt: 'desc' }, include: this.include }, page);
    return { ...conn, nodes: await Promise.all(conn.nodes.map((b) => this.view(b))) };
  }

  async myBooking(accountId: string, id: string) {
    return this.view(await this.ownBooking(accountId, id));
  }

  async updateAsCustomer(accountId: string, id: string, input: BookingInput) {
    const b = await this.ownBooking(accountId, id);
    if (b.status !== 'SUBMITTED') throw businessRule('Chỉ sửa được khi yêu cầu đang chờ tiếp nhận');
    const d = parse(bookingSchema, { ...input, merchantId: b.merchantId });
    const { merchantId: _m, stops, ...rest } = d;
    await inMerchant(b.merchantId, async () => {
      await this.prisma.db.booking.update({ where: { id }, data: { ...rest, stops: stops as any } as any });
      await this.audit.log({ entityType: 'BOOKING', entityId: id, category: 'UPDATE', action: 'booking.update', summary: `Khách sửa yêu cầu ${b.code}` });
    });
    await this.notify.toUsersWithPermission('booking.manage', { type: 'BOOKING_UPDATED', title: `Khách sửa yêu cầu ${b.code}`, entityType: 'BOOKING', entityId: id }, { merchantId: b.merchantId });
    return this.myBooking(accountId, id);
  }

  async cancelAsCustomer(accountId: string, id: string, reason: string) {
    const b = await this.ownBooking(accountId, id);
    if (b.status !== 'SUBMITTED') throw businessRule('Chỉ hủy được khi yêu cầu đang chờ tiếp nhận');
    if (!reason?.trim()) throw businessRule('Vui lòng nhập lý do hủy');
    await this.setStatus(b.merchantId, id, 'CANCELLED', { cancelReason: reason.trim(), cancelledAt: new Date() }, reason.trim());
    await this.notify.toUsersWithPermission('booking.manage', { type: 'BOOKING_UPDATED', title: `Khách hủy yêu cầu ${b.code}`, body: reason, entityType: 'BOOKING', entityId: id }, { merchantId: b.merchantId });
    return this.myBooking(accountId, id);
  }

  async addNote(bookingId: string, body: string) {
    const p = currentPrincipal();
    if (!p) throw forbidden();
    const text = body?.trim();
    if (!text) throw businessRule('Nội dung ghi chú trống');
    let b;
    if (p.type === 'CUSTOMER') b = await this.ownBooking(p.accountId, bookingId);
    else if (p.type === 'USER') {
      b = await this.prisma.db.booking.findFirst({ where: { id: bookingId } });
      if (!b) throw notFound('booking');
    } else throw forbidden();
    await this.prisma.raw.bookingNote.create({ data: { bookingId, authorType: p.type, authorId: p.type === 'USER' ? p.membershipId : p.accountId, authorName: p.name, body: text } });
    if (p.type === 'USER') await this.notify.toCustomerAccount(b.accountId, { type: 'BOOKING_UPDATED', title: `Nhà xe phản hồi yêu cầu ${b.code}`, body: text, entityType: 'BOOKING', entityId: bookingId }, b.merchantId);
    else await this.notify.toUsersWithPermission('booking.manage', { type: 'BOOKING_UPDATED', title: `Khách ghi chú yêu cầu ${b.code}`, body: text, entityType: 'BOOKING', entityId: bookingId }, { merchantId: b.merchantId });
    return this.view({ id: bookingId });
  }

  // ---------- Phía nhà xe ----------

  async list(filter: BookingFilter = {}, page: { first?: number; after?: string | null }) {
    const where: any = {};
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.keyword) where.OR = [{ code: { contains: filter.keyword, mode: 'insensitive' } }, { cargoName: { contains: filter.keyword, mode: 'insensitive' } }, { contactName: { contains: filter.keyword, mode: 'insensitive' } }, { contactPhone: { contains: filter.keyword } }];
    const conn = await paginate(this.prisma.db.booking as any, { where, orderBy: { createdAt: 'desc' }, include: this.include }, page);
    return { ...conn, nodes: await Promise.all(conn.nodes.map((b) => this.view(b))) };
  }

  async get(id: string) {
    const b = await this.prisma.db.booking.findFirst({ where: { id }, include: this.include });
    if (!b) throw notFound('booking');
    return this.view(b);
  }

  async accept(id: string, customerId?: string | null) {
    const b = await this.prisma.db.booking.findFirst({ where: { id } });
    if (!b) throw notFound('booking');
    if (b.status !== 'SUBMITTED') throw businessRule('Yêu cầu không ở trạng thái chờ tiếp nhận');
    const p = currentPrincipal();
    if (customerId) {
      const c = await this.prisma.db.customer.findFirst({ where: { id: customerId } });
      if (!c) throw notFound('khách hàng');
      if (!c.portalAccountId) await this.prisma.db.customer.update({ where: { id: c.id }, data: { portalAccountId: b.accountId } });
    }
    await this.setStatus(b.merchantId, id, 'ACCEPTED', { acceptedAt: new Date(), acceptedByUserId: p?.type === 'USER' ? p.membershipId : null, ...(customerId ? { customerId } : {}) });
    await this.notify.toCustomerAccount(b.accountId, { type: 'BOOKING_UPDATED', title: `Yêu cầu ${b.code} đã được tiếp nhận`, entityType: 'BOOKING', entityId: id, severity: 'info' }, b.merchantId);
    return this.get(id);
  }

  async reject(id: string, reason: string) {
    const b = await this.prisma.db.booking.findFirst({ where: { id } });
    if (!b) throw notFound('booking');
    if (!['SUBMITTED', 'ACCEPTED'].includes(b.status)) throw businessRule('Không thể từ chối yêu cầu ở trạng thái hiện tại');
    if (!reason?.trim() || reason.trim().length < 5) throw businessRule('Nhập lý do từ chối (≥ 5 ký tự)');
    await this.setStatus(b.merchantId, id, 'REJECTED', { rejectReason: reason.trim() }, reason.trim());
    await this.notify.toCustomerAccount(b.accountId, { type: 'BOOKING_UPDATED', title: `Yêu cầu ${b.code} bị từ chối`, body: reason, entityType: 'BOOKING', entityId: id, severity: 'warning' }, b.merchantId);
    return this.get(id);
  }

  /** Dùng bởi module orders khi tạo đơn từ booking. */
  async markConverted(bookingId: string, orderCode: string) {
    const b = await this.prisma.db.booking.findFirst({ where: { id: bookingId } });
    if (!b) return;
    await this.setStatus(b.merchantId, bookingId, 'CONVERTED', { convertedAt: new Date() });
    await this.notify.toCustomerAccount(b.accountId, { type: 'ORDER_UPDATED', title: `Yêu cầu ${b.code} đã được tạo thành đơn ${orderCode}`, entityType: 'BOOKING', entityId: bookingId, severity: 'success' }, b.merchantId);
  }

  private async setStatus(merchantId: string, id: string, to: BookingStatus, data: Record<string, unknown>, reason?: string) {
    await inMerchant(merchantId, async () => {
      const b = await this.prisma.db.booking.findFirstOrThrow({ where: { id } });
      await this.prisma.tx(async (tx) => {
        await tx.booking.update({ where: { id }, data: { status: to, ...data } as any });
        await this.audit.statusChange({ entityType: 'BOOKING', entityId: id, from: b.status, to, reason }, tx);
        await this.audit.log({ entityType: 'BOOKING', entityId: id, category: 'STATUS', action: `booking.${to.toLowerCase()}`, summary: `${labelOf(BOOKING_STATUS, b.status)} → ${labelOf(BOOKING_STATUS, to)}`, reason }, tx);
      });
    });
  }
}
