import { Injectable } from '@nestjs/common';
import {
  EXPENSE_KIND,
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  RECEIVABLE_ORDER_STATUSES,
  STOP_STATUS,
  cargoLineSchema,
  createOrderSchema,
  formatVnd,
  isReverseTransition,
  labelOf,
  orderAddonSchema,
  orderPricingSchema,
  orderStopSchema,
  sumMoney,
  updateOrderSchema,
  type ExpenseKind,
  type OrderStatus,
} from '@bta/shared';
import { big, num } from '@bta/db';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { assertSensitive } from '../../common/auth/sensitive';
import { currentPrincipal } from '../../common/context/request-context';
import { AppError, businessRule, notFound, validationError } from '../../common/errors/app-error';
import { FinanceCalcService, type OrderDebtRow } from '../../common/finance/finance-calc.service';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NotifyService } from '../../common/notifications/notify.service';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService, type Tx } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { ActivityService } from '../activity/activity.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { CustomersService } from '../customers/customers.service';
import { addDaysIso, routeSummaryOf, toDbDate, todayIso, vnDayRange } from '../trips/dispatch-helpers';
import { OrderSyncService } from '../trips/order-sync.service';
import { TripScheduleService } from '../trips/trip-schedule.service';
import { TripStatusService } from '../trips/trip-status.service';
import { TripsService } from '../trips/trips.service';
import type {
  CargoLineInput,
  CreateOrderInput,
  OrderAddonInput,
  OrderFilter,
  OrderPricingInput,
  OrderStopInput,
  UpdateOrderInput,
} from './orders.types';

const LIST_INCLUDE = {
  customer: { select: { id: true, code: true, name: true, phone: true } },
  addons: { select: { amount: true } },
  stops: { select: { id: true, type: true, sequence: true, locationName: true, address: true, status: true, assignments: { select: { trip: { select: { status: true, vehicleId: true, driverId: true, isExternal: true } } } } } },
  trips: { select: { id: true, status: true, scheduleWarnings: { where: { resolvedAt: null }, select: { id: true } } } },
  incidents: { where: { status: { in: ['OPEN', 'IN_PROGRESS'] as any } }, select: { id: true } },
};

const SORTS: Record<string, any> = {
  ORDER_DATE_DESC: [{ orderDate: 'desc' }, { code: 'desc' }],
  ORDER_DATE_ASC: [{ orderDate: 'asc' }, { code: 'asc' }],
  DUE_DATE: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { code: 'asc' }],
  CODE: [{ code: 'desc' }],
};

function isPriceLocked(status: string) {
  return (RECEIVABLE_ORDER_STATUSES as string[]).includes(status);
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly finance: FinanceCalcService,
    private readonly catalogs: CatalogsService,
    private readonly customers: CustomersService,
    private readonly trips: TripsService,
    private readonly tripStatus: TripStatusService,
    private readonly schedule: TripScheduleService,
    private readonly orderSync: OrderSyncService,
    private readonly attachments: AttachmentsService,
    private readonly activity: ActivityService,
    private readonly notify: NotifyService,
  ) {}

  // ================= Views =================

  private decorate(rows: any[], debts: Map<string, OrderDebtRow>) {
    return rows.map((o) => {
      const d = debts.get(o.id);
      const addonTotal = sumMoney(o.addons.map((a: any) => a.amount));
      const warnings: string[] = [];
      if (d && d.overdueDays > 0) warnings.push(`Quá hạn ${d.overdueDays} ngày`);
      if (['CONFIRMED', 'DISPATCHED'].includes(o.status)) {
        const unassigned = o.stops.filter((s: any) => !s.assignments.some((a: any) => a.trip.status !== 'CANCELLED' && (a.trip.isExternal || (a.trip.vehicleId && a.trip.driverId))));
        if (unassigned.length) warnings.push(`${unassigned.length} điểm chưa xếp xe`);
      }
      if (o.incidents.length) warnings.push(`${o.incidents.length} sự cố đang mở`);
      if (o.trips.some((t: any) => t.scheduleWarnings.length)) warnings.push('Có chuyến trùng/gần trùng lịch');
      return {
        ...o,
        customer: o.customer,
        routeSummary: o.routeSummary ?? routeSummaryOf(o.stops),
        freightAmount: num(o.freightAmount),
        addonTotal,
        totalAmount: d?.total ?? num(o.freightAmount) + addonTotal,
        paidAmount: d?.paid ?? 0,
        remainingAmount: d?.remaining ?? 0,
        overdueDays: d?.overdueDays ?? 0,
        tripCount: o.trips.filter((t: any) => t.status !== 'CANCELLED').length,
        warnings,
        priceLocked: isPriceLocked(o.status),
        requiredCapacityTons: o.requiredCapacityTons,
      };
    });
  }

  private buildWhere(filter: OrderFilter) {
    const where: any = {};
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.customerId) where.customerId = filter.customerId;
    if (filter.dateFrom || filter.dateTo) {
      where.orderDate = {};
      if (filter.dateFrom) where.orderDate.gte = toDbDate(filter.dateFrom);
      if (filter.dateTo) where.orderDate.lte = toDbDate(filter.dateTo);
    }
    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { routeSummary: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { customer: { phone: { contains: q } } },
        { trips: { some: { code: { contains: q, mode: 'insensitive' } } } },
      ];
    }
    return where;
  }

  private async filtered(filter: OrderFilter, sort?: string | null) {
    const rows = await this.prisma.db.order.findMany({ where: this.buildWhere(filter), include: LIST_INCLUDE, orderBy: SORTS[sort ?? ''] ?? SORTS.ORDER_DATE_DESC });
    const debts = await this.finance.orderDebtMap(rows.map((r) => r.id));
    let items = this.decorate(rows, debts);
    if (filter.debtStatus === 'OVERDUE') items = items.filter((o) => o.overdueDays > 0);
    if (filter.debtStatus === 'HAS_DEBT') items = items.filter((o) => o.remainingAmount > 0);
    if (filter.debtStatus === 'PAID') items = items.filter((o) => isPriceLocked(o.status) && o.remainingAmount <= 0);
    if (filter.warning) items = items.filter((o) => o.warnings.length > 0);
    if (filter.needsAction) items = items.filter((o) => needsAction(o));
    return items;
  }

  async list(filter: OrderFilter = {}, page: { first?: number; after?: string | null }, sort?: string | null) {
    const { take, skip } = pageParams(page);
    if (filter.debtStatus || filter.warning || filter.needsAction) {
      const all = await this.filtered(filter, sort);
      return toConnection(all.slice(skip, skip + take), all.length, skip, take);
    }
    const where = this.buildWhere(filter);
    const [rows, total] = await Promise.all([
      this.prisma.db.order.findMany({ where, include: LIST_INCLUDE, orderBy: SORTS[sort ?? ''] ?? SORTS.ORDER_DATE_DESC, take, skip }),
      this.prisma.db.order.count({ where }),
    ]);
    const debts = await this.finance.orderDebtMap(rows.map((r) => r.id));
    return toConnection(this.decorate(rows, debts), total, skip, take);
  }

  /** Số đơn cần xử lý — định nghĩa duy nhất dùng cho danh sách đơn và dashboard. */
  async countNeedsAction(): Promise<number> {
    return (await this.filtered({ needsAction: true } as OrderFilter)).length;
  }

  async totals(filter: OrderFilter = {}) {
    const all = await this.filtered(filter);
    return {
      count: all.length,
      totalAmount: all.reduce((s, o) => s + (isPriceLocked(o.status) ? o.totalAmount : 0), 0),
      paidAmount: all.reduce((s, o) => s + o.paidAmount, 0),
      remainingAmount: all.reduce((s, o) => s + Math.max(o.remainingAmount, 0), 0),
      overdueAmount: all.reduce((s, o) => s + (o.overdueDays > 0 ? o.remainingAmount : 0), 0),
    };
  }

  async get(id: string) {
    const o = await this.prisma.db.order.findFirst({
      where: { id },
      include: {
        ...LIST_INCLUDE,
        addons: { orderBy: { createdAt: 'asc' } },
        stops: { orderBy: { sequence: 'asc' }, include: { assignments: { include: { trip: { select: { id: true, code: true, status: true, vehicleId: true, driverId: true, isExternal: true } } } } } },
        cargoLines: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        incidents: { select: { id: true, code: true, title: true, severity: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
        allocations: { where: { payment: { status: 'ACTIVE' } }, include: { payment: { select: { id: true, code: true, receivedAt: true } } }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!o) throw notFound('đơn hàng');
    const debts = await this.finance.orderDebtMap([o.id]);
    const openIncidents = o.incidents.filter((i: any) => i.status === 'OPEN' || i.status === 'IN_PROGRESS');
    const [base] = this.decorate([{ ...o, incidents: openIncidents }], debts);
    const stopIds = o.stops.map((s) => s.id);
    const [podCounts, profits, tripConn, externals, expensesRaw, credit] = await Promise.all([
      this.attachments.counts('ORDER_STOP', stopIds),
      this.finance.orderProfits([o.id]),
      this.trips.list({ orderId: o.id }, { first: 100 }),
      this.trips.externalTransports({ orderId: o.id }),
      this.prisma.db.expense.findMany({
        where: { OR: [{ orderId: o.id }, { trip: { orderId: o.id } }] },
        include: { trip: { select: { code: true } }, supplier: { select: { name: true } } },
        orderBy: { expenseDate: 'desc' },
      }),
      this.customers.creditCheck(o.customerId, 0).catch(() => null),
    ]);
    const labels = await this.catalogs.labels([...expensesRaw.map((e) => e.categoryId), ...o.cargoLines.map((c) => c.cargoTypeId), o.requiredVehicleTypeId]);
    const attachmentCount = (await this.attachments.listForOrder(o.id)).length;
    const d = debts.get(o.id)!;
    const p = profits.get(o.id)!;
    return {
      ...base,
      requiredVehicleTypeName: o.requiredVehicleTypeId ? labels.get(o.requiredVehicleTypeId) ?? null : null,
      stops: o.stops.map((s) => this.stopView(s, podCounts.get(s.id) ?? 0, o.code)),
      cargoLines: o.cargoLines.map((c) => ({ ...c, cargoTypeName: c.cargoTypeId ? labels.get(c.cargoTypeId) ?? null : null, declaredValue: c.declaredValue === null ? null : num(c.declaredValue) })),
      addons: o.addons.map((a: any) => ({ ...a, amount: num(a.amount) })),
      trips: tripConn.nodes,
      financeSummary: {
        freight: num(o.freightAmount),
        addonTotal: base.addonTotal,
        totalAmount: d.total,
        receivable: d.receivable,
        paidAmount: d.paid,
        remainingAmount: d.remaining,
        overdueDays: d.overdueDays,
        expenseTotal: p.cost,
        tripCost: p.tripCost,
        outsourcedCost: p.outsourcedCost,
        otherCost: p.otherCost,
        profit: p.profit,
        margin: p.margin,
        provisional: p.provisional,
        driverBonusTotal: tripConn.nodes.filter((t: any) => t.status !== 'CANCELLED').reduce((s: number, t: any) => s + t.driverBonusAmount, 0),
        allocations: o.allocations.map((a) => ({ id: a.id, paymentId: a.payment.id, paymentCode: a.payment.code, receivedAt: a.payment.receivedAt, amount: num(a.amount) })),
        expenses: expensesRaw.map((e) => ({
          ...e, amount: num(e.amount), categoryName: e.categoryId ? labels.get(e.categoryId) ?? null : null, tripCode: e.trip?.code ?? null,
          supplierName: e.supplier?.name ?? null, isCost: EXPENSE_KIND[e.kind as ExpenseKind].isCost,
        })),
      },
      incidents: o.incidents,
      externalTransports: externals,
      attachmentCount,
      customerWarnings: credit?.warnings ?? [],
    };
  }

  private stopView(s: any, podCount: number, orderCode?: string) {
    const trips = (s.assignments ?? []).filter((a: any) => a.trip && a.trip.status !== 'CANCELLED').map((a: any) => a.trip);
    return {
      ...s,
      codExpected: s.codExpected === null ? null : num(s.codExpected),
      codActual: s.codActual === null ? null : num(s.codActual),
      podCount,
      tripIds: trips.map((t: any) => t.id),
      tripCodes: trips.map((t: any) => t.code),
      orderCode: orderCode ?? null,
    };
  }

  async orderStop(id: string) {
    const s = await this.prisma.db.orderStop.findFirst({
      where: { id },
      include: { order: { select: { code: true } }, assignments: { include: { trip: { select: { id: true, code: true, status: true } } } } },
    });
    if (!s) throw notFound('điểm dừng');
    const [history, pods] = await Promise.all([this.activity.statusHistory('ORDER_STOP', id), this.attachments.list('ORDER_STOP', id, 'POD')]);
    return {
      ...this.stopView(s, pods.length, s.order.code),
      podAttachments: pods,
      statusHistory: history.map((h) => ({
        id: h.id, kind: 'STATUS', createdAt: h.changedAt, entityType: h.entityType, entityId: h.entityId, category: 'STATUS', action: 'status.change',
        summary: `${h.fromStatus ? `${labelOf(STOP_STATUS, h.fromStatus)} → ` : ''}${labelOf(STOP_STATUS, h.toStatus)}`,
        actorType: h.actorType, actorId: h.actorId, actorName: h.actorName, reason: h.reason ?? h.note, before: null, after: null, sensitive: false,
        fromStatus: h.fromStatus, toStatus: h.toStatus,
      })),
    };
  }

  // ================= Chuẩn hóa input =================

  /** Điểm dừng: nếu chọn từ sổ địa chỉ, lấy snapshot địa chỉ/liên hệ (vẫn cho sửa riêng từng đơn). */
  private async normalizeStop(input: OrderStopInput) {
    let merged: any = { ...input };
    if (input.locationId) {
      const loc = await this.prisma.db.customerLocation.findFirst({ where: { id: input.locationId } });
      if (!loc) throw validationError([{ field: 'stops.locationId', message: 'Địa chỉ không tồn tại' }]);
      merged = {
        locationName: loc.name, address: loc.address, province: loc.province, lat: loc.lat, lng: loc.lng,
        contactName: loc.contactName, contactPhone: loc.contactPhone,
        ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined && v !== null && v !== '')),
      };
    }
    return parse(orderStopSchema, merged);
  }

  private stopData(s: Awaited<ReturnType<OrdersService['normalizeStop']>>, sequence: number) {
    return {
      type: s.type, sequence, locationId: s.locationId ?? null, locationName: s.locationName ?? null, address: s.address, province: s.province ?? null,
      lat: s.lat ?? null, lng: s.lng ?? null, contactName: s.contactName ?? null, contactPhone: s.contactPhone ?? null, plannedAt: s.plannedAt ?? null,
      codExpected: s.codExpected === undefined || s.codExpected === null ? null : big(s.codExpected), note: s.note ?? null,
    };
  }

  private cargoData(c: ReturnType<typeof cargoLineSchema.parse>, sortOrder: number) {
    return {
      name: c.name, cargoTypeId: c.cargoTypeId ?? null, weightKg: c.weightKg ?? null, volumeM3: c.volumeM3 ?? null, quantity: c.quantity ?? null,
      packagingUnitId: c.packagingUnitId ?? null, packagingUnit: c.packagingUnit ?? null, properties: c.properties ?? [],
      declaredValue: c.declaredValue === undefined || c.declaredValue === null ? null : big(c.declaredValue),
      pickupStopId: c.pickupStopId ?? null, dropoffStopId: c.dropoffStopId ?? null, note: c.note ?? null, sortOrder,
    };
  }

  private checkStopCargoRefs(stopIds: Set<string>, cargo: { pickupStopId?: string | null; dropoffStopId?: string | null }[]) {
    for (const c of cargo) {
      if ((c.pickupStopId && !stopIds.has(c.pickupStopId)) || (c.dropoffStopId && !stopIds.has(c.dropoffStopId))) {
        throw validationError([{ field: 'cargoLines', message: 'Dòng hàng gắn điểm dừng không thuộc đơn' }]);
      }
    }
  }

  // ================= Create =================

  async create(input: CreateOrderInput) {
    const stops = await Promise.all(input.stops.map((s) => this.normalizeStop(s)));
    const data = parse(createOrderSchema, { ...input, stops, createTrip: undefined });
    if (!stops.some((s) => s.type === 'PICKUP') || !stops.some((s) => s.type === 'DROPOFF')) {
      throw validationError([{ field: 'stops', message: 'Cần ít nhất 1 điểm lấy và 1 điểm trả' }]);
    }
    const customer = await this.prisma.db.customer.findFirst({ where: { id: data.customerId } });
    if (!customer) throw notFound('khách hàng');
    if (customer.status !== 'ACTIVE') throw businessRule(`Khách hàng ${customer.name} đã ngừng hoạt động`);
    const settings = await this.prisma.db.merchantSettings.findFirst({});
    const orderDate = data.orderDate ?? todayIso();
    // Hạn thanh toán: operation nhập tay. Chỉ GỢI Ý khi không gửi field dueDate (undefined) = ngày đơn + số ngày công nợ mặc định.
    const dueDate =
      input.dueDate === undefined ? addDaysIso(orderDate, customer.defaultDebtDays ?? settings?.defaultDebtDays ?? 15) : data.dueDate ?? null;
    const status = (data.status ?? 'DRAFT') as OrderStatus;
    const addons = (data.addons ?? []).map((a) => parse(orderAddonSchema, a));
    const total = data.freightAmount + sumMoney(addons.map((a) => a.amount));

    // Pre-check lịch trước khi tạo đơn để không tạo đơn rồi mới lỗi trùng lịch
    const quick = input.createTrip;
    if (quick) {
      const w = await this.schedule.check({ vehicleId: quick.vehicleId, driverId: quick.driverId, plannedStartAt: quick.plannedStartAt, plannedEndAt: quick.plannedEndAt });
      if (w.length && !quick.overrideReason) {
        throw new AppError('BUSINESS_RULE_VIOLATION', `Lịch bị trùng/gần trùng: ${w.map(TripScheduleService.describe).join('; ')}`, {
          details: { warnings: w.map((x) => ({ ...x, id: null, overrideReason: null })) },
        });
      }
      if (w.length) assertSensitive('dispatch.override_warning', quick.overrideReason);
    }
    let booking: any = null;
    if (data.bookingId) {
      booking = await this.prisma.db.booking.findFirst({ where: { id: data.bookingId } });
      if (!booking) throw notFound('booking');
      if (booking.status === 'CONVERTED') throw businessRule('Booking đã được tạo đơn');
      if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') throw businessRule('Booking đã hủy/từ chối');
    }
    const p = currentPrincipal();
    const createdBy = p?.type === 'USER' ? p.membershipId ?? null : null;

    const order = await this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('ORDER', tx);
      const o = await tx.order.create({
        data: {
          code, customerId: customer.id, orderDate: toDbDate(orderDate)!, freightAmount: big(data.freightAmount), dueDate: toDbDate(dueDate), status,
          requiredVehicleTypeId: data.requiredVehicleTypeId ?? null, requiredCapacityTons: data.requiredCapacityTons ?? null,
          note: data.note ?? null, internalNote: data.internalNote ?? null, createdByUserId: createdBy, bookingId: booking?.id ?? null,
          routeSummary: routeSummaryOf(stops.map((s, i) => ({ ...s, sequence: i + 1 }))),
          confirmedAt: status === 'CONFIRMED' ? new Date() : null,
        } as any,
      });
      for (let i = 0; i < stops.length; i++) await tx.orderStop.create({ data: { ...this.stopData(stops[i], i + 1), orderId: o.id } as any });
      const cargo = (data.cargoLines ?? []).map((c) => parse(cargoLineSchema, c));
      for (let i = 0; i < cargo.length; i++) await tx.cargoLine.create({ data: { ...this.cargoData({ ...cargo[i], pickupStopId: null, dropoffStopId: null }, i), orderId: o.id } as any });
      for (const a of addons) await tx.orderAddon.create({ data: { orderId: o.id, serviceId: a.serviceId ?? null, name: a.name, amount: big(a.amount), note: a.note ?? null } as any });
      await this.audit.statusChange({ entityType: 'ORDER', entityId: o.id, from: null, to: status }, tx);
      await this.audit.log({
        entityType: 'ORDER', entityId: o.id, category: 'CREATE', action: 'order.create',
        summary: `Tạo đơn ${code} · ${customer.name} · tổng ${formatVnd(total)}`,
        after: { freightAmount: data.freightAmount, addons: addons.map((a) => ({ name: a.name, amount: a.amount })), dueDate, stops: stops.length },
      }, tx);
      if (booking) {
        await tx.booking.update({ where: { id: booking.id }, data: { status: 'CONVERTED', convertedAt: new Date(), customerId: customer.id } });
        if (!customer.portalAccountId) await tx.customer.update({ where: { id: customer.id }, data: { portalAccountId: booking.accountId } });
        await this.audit.statusChange({ entityType: 'BOOKING', entityId: booking.id, from: booking.status, to: 'CONVERTED', note: `Tạo đơn ${code}` }, tx);
      }
      return o;
    });
    if (booking) {
      await this.notify.toCustomerAccount(booking.accountId, { type: 'BOOKING_UPDATED', title: `Yêu cầu ${booking.code} đã được tạo đơn ${order.code}`, entityType: 'ORDER', entityId: order.id, severity: 'success' });
    }
    let trip: any = null;
    if (quick) {
      const res = await this.trips.create({
        orderId: order.id, vehicleId: quick.vehicleId, driverId: quick.driverId, plannedStartAt: quick.plannedStartAt, plannedEndAt: quick.plannedEndAt,
        driverBonusAmount: quick.driverBonusAmount, overrideReason: quick.overrideReason, stopIds: [],
      });
      trip = res.trip;
    }
    const credit = await this.customers.creditCheck(customer.id, isPriceLocked(status) ? 0 : total).catch(() => null);
    return { order: await this.get(order.id), warnings: credit?.warnings ?? [], trip };
  }

  // ================= Update =================

  private async loadForEdit(id: string) {
    const o = await this.prisma.db.order.findFirst({ where: { id }, include: { stops: true, cargoLines: true, addons: true, allocations: { select: { id: true } } } });
    if (!o) throw notFound('đơn hàng');
    if (o.status === 'CANCELLED') throw businessRule('Đơn đã hủy, không thể sửa');
    return o;
  }

  /** Đơn hoàn thành → order.completed.update + lý do; đổi giá khi đã xác nhận → order.price.update + lý do. */
  private sensitiveReason(order: { status: string }, priceChanged: boolean, reason: string | null | undefined): string | null {
    let r: string | null = null;
    if (order.status === 'COMPLETED') r = assertSensitive('order.completed.update', reason);
    if (priceChanged && isPriceLocked(order.status)) r = assertSensitive('order.price.update', reason);
    return r;
  }

  private stopRemovable(stop: any, podCount: number): string | null {
    if (stop.status !== 'NOT_ARRIVED') return `Điểm ${stop.sequence} đã ${labelOf(STOP_STATUS, stop.status).toLowerCase()} — dùng "Bỏ qua" thay vì xóa`;
    if (stop.codActual !== null) return `Điểm ${stop.sequence} đã có COD thực thu — dùng "Bỏ qua" thay vì xóa`;
    if (podCount > 0) return `Điểm ${stop.sequence} đã có POD — dùng "Bỏ qua" thay vì xóa`;
    return null;
  }

  async update(id: string, input: UpdateOrderInput, reason?: string | null) {
    const before = await this.loadForEdit(id);
    const stops = input.stops ? await Promise.all(input.stops.map((s) => this.normalizeStop(s))) : undefined;
    const data = parse(updateOrderSchema, { ...input, stops, reason: undefined });
    if (data.customerId && data.customerId !== before.customerId) {
      if (before.allocations.length) throw businessRule('Đơn đã có phân bổ thanh toán — không thể đổi khách hàng');
      const c = await this.prisma.db.customer.findFirst({ where: { id: data.customerId } });
      if (!c || c.status !== 'ACTIVE') throw businessRule('Khách hàng không hợp lệ hoặc đã ngừng hoạt động');
    }
    if (stops && (!stops.some((s) => s.type === 'PICKUP') || !stops.some((s) => s.type === 'DROPOFF'))) {
      throw validationError([{ field: 'stops', message: 'Cần ít nhất 1 điểm lấy và 1 điểm trả' }]);
    }
    const addons = data.addons?.map((a) => parse(orderAddonSchema, a));
    const priceBefore = { freightAmount: num(before.freightAmount), addons: before.addons.map((a) => ({ name: a.name, amount: num(a.amount) })) };
    const priceAfter = {
      freightAmount: data.freightAmount ?? priceBefore.freightAmount,
      addons: addons ? addons.map((a) => ({ name: a.name, amount: a.amount })) : priceBefore.addons,
    };
    const priceChanged = JSON.stringify(priceBefore) !== JSON.stringify(priceAfter);
    const r = this.sensitiveReason(before, priceChanged, reason);

    // kiểm tra xóa điểm dừng
    if (stops) {
      const keepIds = new Set(stops.filter((s) => s.id).map((s) => s.id!));
      for (const sid of keepIds) if (!before.stops.some((s) => s.id === sid)) throw validationError([{ field: 'stops.id', message: 'Điểm dừng không thuộc đơn' }]);
      const removed = before.stops.filter((s) => !keepIds.has(s.id));
      const pods = await this.attachments.counts('ORDER_STOP', removed.map((s) => s.id));
      for (const s of removed) {
        const msg = this.stopRemovable(s, pods.get(s.id) ?? 0);
        if (msg) throw businessRule(msg);
      }
    }

    await this.prisma.tx(async (tx) => {
      const orderData: any = {};
      for (const k of ['customerId', 'note', 'internalNote', 'requiredVehicleTypeId', 'requiredCapacityTons'] as const) if ((data as any)[k] !== undefined) orderData[k] = (data as any)[k];
      if (data.orderDate) orderData.orderDate = toDbDate(data.orderDate);
      if (input.dueDate !== undefined) orderData.dueDate = toDbDate(data.dueDate ?? null);
      if (data.freightAmount !== undefined) orderData.freightAmount = big(data.freightAmount);
      if (stops) {
        const keep = new Set(stops.filter((s) => s.id).map((s) => s.id!));
        const removed = before.stops.filter((s) => !keep.has(s.id)).map((s) => s.id);
        if (removed.length) {
          await tx.tripStopAssignment.deleteMany({ where: { stopId: { in: removed } } });
          await tx.cargoLine.updateMany({ where: { pickupStopId: { in: removed } }, data: { pickupStopId: null } });
          await tx.cargoLine.updateMany({ where: { dropoffStopId: { in: removed } }, data: { dropoffStopId: null } });
          await tx.orderStop.deleteMany({ where: { id: { in: removed } } });
        }
        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          if (s.id) await tx.orderStop.update({ where: { id: s.id }, data: this.stopData(s, i + 1) as any });
          else await tx.orderStop.create({ data: { ...this.stopData(s, i + 1), orderId: id } as any });
        }
        orderData.routeSummary = routeSummaryOf(stops.map((s, i) => ({ ...s, sequence: i + 1 })));
      }
      if (data.cargoLines) {
        const cargo = data.cargoLines.map((c) => parse(cargoLineSchema, c));
        const stopIdsNow = new Set((await tx.orderStop.findMany({ where: { orderId: id }, select: { id: true } })).map((s) => s.id));
        this.checkStopCargoRefs(stopIdsNow, cargo);
        const keep = new Set(cargo.filter((c) => c.id).map((c) => c.id!));
        await tx.cargoLine.deleteMany({ where: { orderId: id, id: { notIn: [...keep] } } });
        for (let i = 0; i < cargo.length; i++) {
          const c = cargo[i];
          if (c.id && before.cargoLines.some((x) => x.id === c.id)) await tx.cargoLine.update({ where: { id: c.id }, data: this.cargoData(c, i) as any });
          else await tx.cargoLine.create({ data: { ...this.cargoData(c, i), orderId: id } as any });
        }
      }
      if (addons) await this.replaceAddons(tx, id, before.addons, addons);
      await tx.order.update({ where: { id }, data: orderData });
      const general = diffFields(
        { customerId: before.customerId, note: before.note, internalNote: before.internalNote, dueDate: before.dueDate, orderDate: before.orderDate },
        { customerId: orderData.customerId ?? before.customerId, note: orderData.note ?? before.note, internalNote: orderData.internalNote ?? before.internalNote, dueDate: orderData.dueDate !== undefined ? orderData.dueDate : before.dueDate, orderDate: orderData.orderDate ?? before.orderDate },
      );
      const changedParts = [...general.changed, ...(stops ? ['stops'] : []), ...(data.cargoLines ? ['cargoLines'] : [])];
      if (changedParts.length) {
        await this.audit.log({
          entityType: 'ORDER', entityId: id, category: r && before.status === 'COMPLETED' ? 'SENSITIVE' : 'UPDATE', sensitive: before.status === 'COMPLETED',
          action: before.status === 'COMPLETED' ? 'order.completed.update' : 'order.update', reason: r,
          summary: `Sửa đơn ${before.code} (${changedParts.join(', ')})`, before: general.before, after: general.after,
        }, tx);
      }
      if (priceChanged) await this.logPrice(tx, before, priceBefore, priceAfter, r);
      await this.orderSync.sync(id, tx);
    });
    return this.get(id);
  }

  private async replaceAddons(tx: Tx, orderId: string, existing: any[], addons: ReturnType<typeof orderAddonSchema.parse>[]) {
    const keep = new Set(addons.filter((a) => a.id).map((a) => a.id!));
    await tx.orderAddon.deleteMany({ where: { orderId, id: { notIn: [...keep] } } });
    for (const a of addons) {
      const data = { serviceId: a.serviceId ?? null, name: a.name, amount: big(a.amount), note: a.note ?? null };
      if (a.id && existing.some((x) => x.id === a.id)) await tx.orderAddon.update({ where: { id: a.id }, data });
      else await tx.orderAddon.create({ data: { ...data, orderId } as any });
    }
  }

  private async logPrice(tx: Tx, order: { id: string; code: string; status: string }, before: any, after: any, reason: string | null) {
    const tb = before.freightAmount + sumMoney(before.addons.map((a: any) => a.amount));
    const ta = after.freightAmount + sumMoney(after.addons.map((a: any) => a.amount));
    const locked = isPriceLocked(order.status);
    await this.audit.log({
      entityType: 'ORDER', entityId: order.id, category: locked ? 'SENSITIVE' : 'MONEY', sensitive: locked, action: 'order.price.update', reason,
      summary: `Đổi giá đơn ${order.code}: tổng ${formatVnd(tb)} → ${formatVnd(ta)}`, before, after,
    }, tx);
  }

  async updatePricing(id: string, input: OrderPricingInput) {
    const before = await this.loadForEdit(id);
    const data = parse(orderPricingSchema, input);
    const addons = data.addons?.map((a) => parse(orderAddonSchema, a));
    const priceBefore = { freightAmount: num(before.freightAmount), addons: before.addons.map((a) => ({ name: a.name, amount: num(a.amount) })) };
    const priceAfter = { freightAmount: data.freightAmount, addons: addons ? addons.map((a) => ({ name: a.name, amount: a.amount })) : priceBefore.addons };
    const priceChanged = JSON.stringify(priceBefore) !== JSON.stringify(priceAfter);
    const r = this.sensitiveReason(before, priceChanged, data.reason);
    await this.prisma.tx(async (tx) => {
      const od: any = { freightAmount: big(data.freightAmount) };
      if (input.dueDate !== undefined) od.dueDate = toDbDate(data.dueDate ?? null);
      await tx.order.update({ where: { id }, data: od });
      if (addons) await this.replaceAddons(tx, id, before.addons, addons);
      if (priceChanged) await this.logPrice(tx, before, priceBefore, priceAfter, r);
      if (input.dueDate !== undefined && (before.dueDate?.toISOString() ?? null) !== (od.dueDate?.toISOString() ?? null)) {
        await this.audit.log({ entityType: 'ORDER', entityId: id, category: 'MONEY', action: 'order.dueDate.update', summary: `Đổi hạn thanh toán đơn ${before.code}`, before: { dueDate: before.dueDate }, after: { dueDate: od.dueDate } }, tx);
      }
    });
    return this.get(id);
  }

  // ---------- Mutations nhỏ theo tab ----------

  async createStop(orderId: string, input: OrderStopInput) {
    const o = await this.loadForEdit(orderId);
    if (o.status === 'COMPLETED') assertSensitive('order.completed.update', null);
    const s = await this.normalizeStop(input);
    await this.prisma.tx(async (tx) => {
      const seq = input.sequence ?? o.stops.length + 1;
      await tx.orderStop.updateMany({ where: { orderId, sequence: { gte: seq } }, data: { sequence: { increment: 1 } } });
      const created = await tx.orderStop.create({ data: { ...this.stopData(s, seq), orderId } as any });
      await this.refreshRoute(tx, orderId);
      await this.audit.log({ entityType: 'ORDER', entityId: orderId, category: 'UPDATE', action: 'order.stop.create', summary: `Thêm ${s.type === 'PICKUP' ? 'điểm lấy' : 'điểm trả'} "${s.locationName ?? s.address}"`, after: { stopId: created.id } }, tx);
    });
    return this.get(orderId);
  }

  async updateStop(id: string, input: OrderStopInput, reason?: string | null) {
    const stop = await this.prisma.db.orderStop.findFirst({ where: { id } });
    if (!stop) throw notFound('điểm dừng');
    const o = await this.loadForEdit(stop.orderId);
    const s = await this.normalizeStop({ ...input, type: input.type ?? stop.type });
    const codChanged = (stop.codExpected === null ? null : num(stop.codExpected)) !== (s.codExpected ?? null);
    const r = o.status === 'COMPLETED' ? assertSensitive('order.completed.update', reason) : null;
    await this.prisma.tx(async (tx) => {
      const data = this.stopData(s, stop.sequence);
      await tx.orderStop.update({ where: { id }, data: data as any });
      await this.refreshRoute(tx, stop.orderId);
      const d = diffFields(stop as any, data as any);
      if (d.changed.length) {
        await this.audit.log({
          entityType: 'ORDER_STOP', entityId: id, parent: { type: 'ORDER', id: stop.orderId }, category: codChanged ? 'MONEY' : r ? 'SENSITIVE' : 'UPDATE', sensitive: !!r,
          action: 'order.stop.update', reason: r, summary: `Sửa điểm ${stop.sequence} (${d.changed.join(', ')})`, before: d.before, after: d.after,
        }, tx);
      }
    });
    return this.orderStop(id);
  }

  async reorderStops(orderId: string, stopIds: string[]) {
    const o = await this.loadForEdit(orderId);
    if (stopIds.length !== o.stops.length || !o.stops.every((s) => stopIds.includes(s.id))) throw validationError([{ field: 'stopIds', message: 'Danh sách điểm dừng không khớp đơn' }]);
    await this.prisma.tx(async (tx) => {
      for (let i = 0; i < stopIds.length; i++) await tx.orderStop.update({ where: { id: stopIds[i] }, data: { sequence: i + 1 } });
      await this.refreshRoute(tx, orderId);
      await this.audit.log({ entityType: 'ORDER', entityId: orderId, category: 'UPDATE', action: 'order.stop.reorder', summary: 'Sắp xếp lại thứ tự điểm dừng', before: { order: o.stops.sort((a, b) => a.sequence - b.sequence).map((s) => s.id) }, after: { order: stopIds } }, tx);
    });
    return this.get(orderId);
  }

  async removeStop(id: string, reason?: string | null) {
    const stop = await this.prisma.db.orderStop.findFirst({ where: { id } });
    if (!stop) throw notFound('điểm dừng');
    const o = await this.loadForEdit(stop.orderId);
    const pods = await this.attachments.counts('ORDER_STOP', [id]);
    const msg = this.stopRemovable(stop, pods.get(id) ?? 0);
    if (msg) throw businessRule(msg);
    if (o.stops.filter((s) => s.type === stop.type).length <= 1) throw businessRule(`Đơn cần ít nhất 1 ${stop.type === 'PICKUP' ? 'điểm lấy' : 'điểm trả'}`);
    const r = o.status === 'COMPLETED' ? assertSensitive('order.completed.update', reason) : (reason ?? null);
    await this.prisma.tx(async (tx) => {
      await tx.tripStopAssignment.deleteMany({ where: { stopId: id } });
      await tx.cargoLine.updateMany({ where: { pickupStopId: id }, data: { pickupStopId: null } });
      await tx.cargoLine.updateMany({ where: { dropoffStopId: id }, data: { dropoffStopId: null } });
      await tx.orderStop.delete({ where: { id } });
      const rest = await tx.orderStop.findMany({ where: { orderId: stop.orderId }, orderBy: { sequence: 'asc' } });
      for (let i = 0; i < rest.length; i++) if (rest[i].sequence !== i + 1) await tx.orderStop.update({ where: { id: rest[i].id }, data: { sequence: i + 1 } });
      await this.refreshRoute(tx, stop.orderId);
      await this.audit.log({ entityType: 'ORDER', entityId: stop.orderId, category: 'UPDATE', action: 'order.stop.remove', reason: r, summary: `Xóa điểm ${stop.sequence} "${stop.locationName ?? stop.address}"`, before: { stop: { type: stop.type, address: stop.address, codExpected: stop.codExpected } } }, tx);
    });
    return this.get(stop.orderId);
  }

  private async refreshRoute(tx: Tx, orderId: string) {
    const stops = await tx.orderStop.findMany({ where: { orderId } });
    await tx.order.update({ where: { id: orderId }, data: { routeSummary: routeSummaryOf(stops) } });
    const trips = await tx.trip.findMany({ where: { orderId }, include: { stopAssignments: { include: { stop: true } } } });
    for (const t of trips) await tx.trip.update({ where: { id: t.id }, data: { routeSummary: routeSummaryOf(t.stopAssignments.map((a) => a.stop)) } });
  }

  async upsertCargo(orderId: string, input: CargoLineInput) {
    const o = await this.loadForEdit(orderId);
    const c = parse(cargoLineSchema, input);
    this.checkStopCargoRefs(new Set(o.stops.map((s) => s.id)), [c]);
    await this.prisma.tx(async (tx) => {
      if (c.id) {
        const ex = o.cargoLines.find((x) => x.id === c.id);
        if (!ex) throw notFound('dòng hàng');
        await tx.cargoLine.update({ where: { id: c.id }, data: this.cargoData(c, ex.sortOrder) as any });
        await this.audit.log({ entityType: 'ORDER', entityId: orderId, category: 'UPDATE', action: 'order.cargo.update', summary: `Sửa hàng "${c.name}"` }, tx);
      } else {
        await tx.cargoLine.create({ data: { ...this.cargoData(c, o.cargoLines.length), orderId } as any });
        await this.audit.log({ entityType: 'ORDER', entityId: orderId, category: 'UPDATE', action: 'order.cargo.create', summary: `Thêm hàng "${c.name}"` }, tx);
      }
    });
    return this.get(orderId);
  }

  async deleteCargo(id: string) {
    const c = await this.prisma.db.cargoLine.findFirst({ where: { id } });
    if (!c) throw notFound('dòng hàng');
    await this.loadForEdit(c.orderId);
    await this.prisma.tx(async (tx) => {
      await tx.cargoLine.delete({ where: { id } });
      await this.audit.log({ entityType: 'ORDER', entityId: c.orderId, category: 'UPDATE', action: 'order.cargo.delete', summary: `Xóa hàng "${c.name}"` }, tx);
    });
    return this.get(c.orderId);
  }

  async upsertAddon(orderId: string, input: OrderAddonInput, reason?: string | null) {
    const o = await this.loadForEdit(orderId);
    const a = parse(orderAddonSchema, input);
    const next = a.id ? o.addons.map((x) => (x.id === a.id ? { ...x, ...a } : x)) : [...o.addons, a];
    if (a.id && !o.addons.some((x) => x.id === a.id)) throw notFound('dịch vụ cộng thêm');
    const before = { freightAmount: num(o.freightAmount), addons: o.addons.map((x) => ({ name: x.name, amount: num(x.amount) })) };
    const after = { freightAmount: num(o.freightAmount), addons: next.map((x: any) => ({ name: x.name, amount: num(x.amount) })) };
    const r = this.sensitiveReason(o, JSON.stringify(before) !== JSON.stringify(after), reason);
    await this.prisma.tx(async (tx) => {
      const data = { serviceId: a.serviceId ?? null, name: a.name, amount: big(a.amount), note: a.note ?? null };
      if (a.id) await tx.orderAddon.update({ where: { id: a.id }, data });
      else await tx.orderAddon.create({ data: { ...data, orderId } as any });
      await this.logPrice(tx, o, before, after, r);
    });
    return this.get(orderId);
  }

  async deleteAddon(id: string, reason?: string | null) {
    const a = await this.prisma.db.orderAddon.findFirst({ where: { id } });
    if (!a) throw notFound('dịch vụ cộng thêm');
    const o = await this.loadForEdit(a.orderId);
    const before = { freightAmount: num(o.freightAmount), addons: o.addons.map((x) => ({ name: x.name, amount: num(x.amount) })) };
    const after = { freightAmount: num(o.freightAmount), addons: o.addons.filter((x) => x.id !== id).map((x) => ({ name: x.name, amount: num(x.amount) })) };
    const r = this.sensitiveReason(o, true, reason);
    await this.prisma.tx(async (tx) => {
      await tx.orderAddon.delete({ where: { id } });
      await this.logPrice(tx, o, before, after, r);
    });
    return this.get(a.orderId);
  }

  // ================= Trạng thái =================

  async updateStatus(id: string, status: OrderStatus, reason?: string | null, note?: string | null) {
    if (!ORDER_STATUS[status]) throw validationError([{ field: 'status', message: 'Trạng thái không hợp lệ' }]);
    if (status === 'CANCELLED') return this.cancel(id, reason ?? '');
    const o = await this.prisma.db.order.findFirst({ where: { id }, include: { customer: { select: { portalAccountId: true } } } });
    if (!o) throw notFound('đơn hàng');
    const from = o.status as OrderStatus;
    if (from === status) return this.get(id);
    const reverse = from === 'CANCELLED' || isReverseTransition(ORDER_STATUS_FLOW, from, status);
    const r = reverse ? assertSensitive('status.reverse', reason) : (reason ?? '').trim() || null;
    await this.prisma.tx(async (tx) => {
      const data: any = { status };
      if (status === 'CONFIRMED' && !o.confirmedAt) data.confirmedAt = new Date();
      if (status === 'IN_PROGRESS' && !o.startedAt) data.startedAt = new Date();
      if (status === 'COMPLETED') data.completedAt = new Date();
      else if (o.completedAt) data.completedAt = null;
      if (from === 'CANCELLED') Object.assign(data, { cancelledAt: null, cancelReason: null });
      await tx.order.update({ where: { id }, data });
      await this.audit.statusChange({ entityType: 'ORDER', entityId: id, from, to: status, reason: r, note }, tx);
      if (reverse) {
        await this.audit.log({
          entityType: 'ORDER', entityId: id, category: 'SENSITIVE', sensitive: true, action: 'order.status.reverse', reason: r,
          summary: `Đổi ngược trạng thái đơn ${o.code}: ${labelOf(ORDER_STATUS, from)} → ${labelOf(ORDER_STATUS, status)}`, before: { status: from }, after: { status },
        }, tx);
      }
    });
    if (o.customer.portalAccountId) {
      await this.notify.toCustomerAccount(o.customer.portalAccountId, { type: 'ORDER_UPDATED', title: `Đơn ${o.code}: ${labelOf(ORDER_STATUS, status)}`, entityType: 'ORDER', entityId: id, severity: 'info' });
    }
    return this.get(id);
  }

  /** Hủy đơn: giữ chi phí đã phát sinh; hủy các chuyến chưa hoàn thành. */
  async cancel(id: string, reason: string) {
    const r = assertSensitive('order.cancel', reason);
    const o = await this.prisma.db.order.findFirst({ where: { id }, include: { trips: true } });
    if (!o) throw notFound('đơn hàng');
    if (o.status === 'CANCELLED') return this.get(id);
    const openTrips = o.trips.filter((t) => t.status !== 'CANCELLED' && t.status !== 'COMPLETED');
    await this.prisma.tx(async (tx) => {
      for (const t of openTrips) await this.tripStatus.cancelTripTx(tx, t, `Hủy theo đơn ${o.code}: ${r}`);
      await tx.order.update({ where: { id }, data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: r } });
      await this.audit.statusChange({ entityType: 'ORDER', entityId: id, from: o.status, to: 'CANCELLED', reason: r }, tx);
      await this.audit.log({
        entityType: 'ORDER', entityId: id, category: 'SENSITIVE', sensitive: true, action: 'order.cancel', reason: r,
        summary: `Hủy đơn ${o.code}${openTrips.length ? ` và ${openTrips.length} chuyến` : ''}`, before: { status: o.status }, after: { status: 'CANCELLED' },
      }, tx);
    });
    for (const t of openTrips) {
      if (t.driverId) await this.notify.toDriver(t.driverId, { type: 'TRIP_CHANGED', title: `Chuyến ${t.code} đã bị hủy`, body: r, entityType: 'TRIP', entityId: t.id, severity: 'warning' });
    }
    return this.get(id);
  }
}

/**
 * "Đơn cần xử lý": nháp / chờ xác nhận, đã xác nhận nhưng chưa có chuyến gán đủ xe-tài xế,
 * hoặc đơn chưa hủy đang có cảnh báo (quá hạn thanh toán, sự cố mở, trùng lịch...).
 */
export function needsAction(o: { status: string; tripCount: number; warnings: string[] }): boolean {
  if (o.status === 'CANCELLED') return false;
  if (o.status === 'DRAFT' || o.status === 'PENDING_CONFIRMATION') return true;
  if (o.status === 'CONFIRMED' && o.tripCount === 0) return true;
  return o.warnings.length > 0;
}
