import { Injectable } from '@nestjs/common';
import { externalTransportSchema, formatDateTime, formatVnd, tripSchema, TRIP_RUNNING_STATUSES, type TripStatus } from '@bta/shared';
import { big, num } from '@bta/db';
import { z } from 'zod';
import { AuditService } from '../../common/audit/audit.service';
import { assertSensitive } from '../../common/auth/sensitive';
import { currentPrincipal } from '../../common/context/request-context';
import { AppError, businessRule, notFound, validationError } from '../../common/errors/app-error';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NotifyService } from '../../common/notifications/notify.service';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService, type Tx } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { CatalogsService } from '../catalogs/catalogs.service';
import { routeSummaryOf, vnDayRange } from './dispatch-helpers';
import { OrderSyncService } from './order-sync.service';
import { TripScheduleService, type ScheduleWarningOut } from './trip-schedule.service';
import { allowedNextTripStatuses } from './trip-status.service';
import type { CheckTripOverlapInput, ExternalTransportInput, TripFilter, TripInput, UpdateTripInput } from './trips.types';

const STALE_MS = 15 * 60_000;

const TRIP_INCLUDE = {
  order: { select: { id: true, code: true, status: true, customerId: true, customer: { select: { name: true, phone: true } } } },
  vehicle: true,
  driver: true,
  stopAssignments: { include: { stop: true }, orderBy: { sequence: 'asc' as const } },
  scheduleWarnings: { where: { resolvedAt: null }, include: { conflictTrip: { select: { code: true } } } },
  incidents: { select: { id: true, code: true, title: true, severity: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' as const } },
  externalTransport: { include: { supplier: { select: { name: true } } } },
};

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly schedule: TripScheduleService,
    private readonly orderSync: OrderSyncService,
    private readonly notify: NotifyService,
    private readonly catalogs: CatalogsService,
  ) {}

  // ---------------- Views ----------------

  async views(trips: any[], detail = false) {
    if (!trips.length) return [];
    const typeLabels = await this.catalogs.labels([...trips.map((t) => t.vehicle?.typeId), ...trips.map((t) => t.pausedReasonId)]);
    const stopIds = trips.flatMap((t) => t.stopAssignments.map((a: any) => a.stopId));
    const pods = stopIds.length
      ? await this.prisma.db.attachment.groupBy({ by: ['entityId'], where: { entityType: 'ORDER_STOP', entityId: { in: stopIds }, category: 'POD', status: 'READY' }, _count: true })
      : [];
    const podMap = new Map(pods.map((p: any) => [p.entityId, p._count as number]));
    let expenses: any[] = [];
    let attachCounts = new Map<string, number>();
    let latestSpeed = new Map<string, number | null>();
    if (detail) {
      const ids = trips.map((t) => t.id);
      expenses = await this.prisma.db.expense.findMany({ where: { tripId: { in: ids } }, orderBy: { expenseDate: 'desc' } });
      const labels = await this.catalogs.labels(expenses.map((e) => e.categoryId));
      expenses = expenses.map((e) => ({ ...e, categoryName: e.categoryId ? labels.get(e.categoryId) ?? null : null }));
      const ac = await this.prisma.db.attachment.groupBy({ by: ['entityId'], where: { entityType: 'TRIP', entityId: { in: ids }, status: 'READY' }, _count: true });
      attachCounts = new Map(ac.map((a: any) => [a.entityId, a._count]));
      for (const id of ids) {
        const loc = await this.prisma.db.tripLocation.findFirst({ where: { tripId: id }, orderBy: { recordedAt: 'desc' }, select: { speed: true } });
        latestSpeed.set(id, loc?.speed ?? null);
      }
    }
    return trips.map((t) => {
      const stops = t.stopAssignments.map((a: any) => ({
        ...a.stop,
        tripSequence: a.sequence,
        codExpected: a.stop.codExpected === null ? null : num(a.stop.codExpected),
        codActual: a.stop.codActual === null ? null : num(a.stop.codActual),
        podCount: podMap.get(a.stop.id) ?? 0,
      }));
      const tripExpenses = expenses.filter((e) => e.tripId === t.id).map((e) => ({ ...e, amount: num(e.amount), tripCode: t.code }));
      const view: any = {
        ...t,
        order: { id: t.order.id, code: t.order.code, status: t.order.status, customerId: t.order.customerId, customerName: t.order.customer.name, customerPhone: t.order.customer.phone },
        vehicle: t.vehicle ? { ...t.vehicle, typeName: t.vehicle.typeId ? typeLabels.get(t.vehicle.typeId) ?? null : null } : null,
        driver: t.driver,
        driverBonusAmount: num(t.driverBonusAmount),
        pauseReasonLabel: t.pausedReasonId ? typeLabels.get(t.pausedReasonId) ?? null : null,
        lastLocation:
          t.lastLat !== null && t.lastLng !== null && t.lastLocationAt
            ? { lat: t.lastLat, lng: t.lastLng, capturedAt: t.lastLocationAt, speed: latestSpeed.get(t.id) ?? null, isStale: Date.now() - t.lastLocationAt.getTime() > STALE_MS }
            : null,
        stopCount: stops.length,
        codExpectedTotal: stops.reduce((s: number, x: any) => s + (x.codExpected ?? 0), 0),
        codActualTotal: stops.reduce((s: number, x: any) => s + (x.codActual ?? 0), 0),
        hasWarning: t.scheduleWarnings.length > 0,
        openIncidentCount: t.incidents.filter((i: any) => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length,
        allowedNextStatuses: allowedNextTripStatuses(t.status, t.previousStatusBeforePause),
        warnings: t.scheduleWarnings.map((w: any) => ({ ...w, conflictTripCode: w.conflictTrip?.code ?? null, subjectLabel: w.subject === 'VEHICLE' ? t.vehicle?.plate : t.driver?.name })),
        incidents: t.incidents,
        externalTransport: t.externalTransport
          ? { ...t.externalTransport, orderCode: t.order.code, tripCode: t.code, supplierName: t.externalTransport.supplier?.name ?? null, agreedAmount: t.externalTransport.agreedAmount === null ? null : num(t.externalTransport.agreedAmount) }
          : null,
      };
      if (detail) {
        view.stops = stops;
        view.expenses = tripExpenses.filter((e: any) => e.kind !== 'TRIP_ADVANCE');
        view.advances = tripExpenses.filter((e: any) => e.kind === 'TRIP_ADVANCE');
        view.attachmentCount = attachCounts.get(t.id) ?? 0;
      } else {
        view.stops = stops;
      }
      return view;
    });
  }

  async get(id: string) {
    const t = await this.prisma.db.trip.findFirst({ where: { id }, include: TRIP_INCLUDE });
    if (!t) throw notFound('chuyến');
    return (await this.views([t], true))[0];
  }

  async list(filter: TripFilter = {}, page: { first?: number; after?: string | null }, sort?: string | null) {
    const where: any = {};
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.running) where.status = { in: TRIP_RUNNING_STATUSES };
    if (filter.driverId) where.driverId = filter.driverId;
    if (filter.vehicleId) where.vehicleId = filter.vehicleId;
    if (filter.orderId) where.orderId = filter.orderId;
    if (filter.hasWarning) where.scheduleWarnings = { some: { resolvedAt: null } };
    if (filter.dateFrom || filter.dateTo) {
      where.plannedStartAt = {};
      if (filter.dateFrom) where.plannedStartAt.gte = vnDayRange(filter.dateFrom).from;
      if (filter.dateTo) where.plannedStartAt.lt = vnDayRange(filter.dateTo).to;
    }
    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { order: { code: { contains: q, mode: 'insensitive' } } },
        { vehicle: { plate: { contains: q, mode: 'insensitive' } } },
        { driver: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }
    const orderBy =
      sort === 'PLANNED_START_DESC' ? [{ plannedStartAt: 'desc' as const }] : sort === 'CODE' ? [{ code: 'desc' as const }] : [{ plannedStartAt: 'asc' as const }];
    const { take, skip } = pageParams(page);
    const [rows, total] = await Promise.all([
      this.prisma.db.trip.findMany({ where, include: TRIP_INCLUDE, orderBy, take, skip }),
      this.prisma.db.trip.count({ where }),
    ]);
    return toConnection(await this.views(rows), total, skip, take);
  }

  // ---------------- Overlap ----------------

  async checkOverlap(input: CheckTripOverlapInput) {
    return (await this.schedule.check(input)).map(toWarningView);
  }

  /** Không có override → ném BUSINESS_RULE_VIOLATION kèm danh sách cảnh báo; có override → kiểm quyền + lý do. */
  private resolveOverride(warnings: ScheduleWarningOut[], overrideReason: string | null | undefined): string | null {
    if (!warnings.length) return null;
    if (!(overrideReason ?? '').trim()) {
      throw new AppError('BUSINESS_RULE_VIOLATION', `Lịch bị trùng/gần trùng: ${warnings.map(TripScheduleService.describe).join('; ')}`, {
        details: { warnings: warnings.map(toWarningView) },
      });
    }
    return assertSensitive('dispatch.override_warning', overrideReason);
  }

  private async assertResources(vehicleId: string | null | undefined, driverId: string | null | undefined, notices: string[]) {
    if (vehicleId) {
      const v = await this.prisma.db.vehicle.findFirst({ where: { id: vehicleId } });
      if (!v) throw notFound('xe');
      if (v.status === 'INACTIVE') throw businessRule(`Xe ${v.plate} đã ngừng sử dụng, không thể gán chuyến mới`);
      if (v.status === 'MAINTENANCE') notices.push(`Xe ${v.plate} đang bảo dưỡng`);
    }
    if (driverId) {
      const d = await this.prisma.db.driver.findFirst({ where: { id: driverId } });
      if (!d) throw notFound('tài xế');
      if (d.status !== 'ACTIVE') throw businessRule(`Tài xế ${d.name} đã ngừng hoạt động, không thể gán chuyến mới`);
    }
  }

  private async saveWarnings(tx: Tx, tripId: string, warnings: ScheduleWarningOut[], overrideReason: string | null) {
    if (!warnings.length) return;
    await tx.scheduleWarning.updateMany({ where: { tripId, resolvedAt: null }, data: { resolvedAt: new Date() } });
    const p = currentPrincipal();
    await tx.scheduleWarning.createMany({
      data: warnings.map((w) => ({
        tripId, type: w.type, subject: w.subject, subjectId: w.subjectId, conflictTripId: w.conflictTripId ?? null, gapMinutes: w.gapMinutes,
        thresholdMinutes: w.thresholdMinutes, overrideReason, overriddenByUserId: p?.type === 'USER' ? p.membershipId ?? null : null,
      })) as any,
    });
  }

  private async upsertExternalTx(tx: Tx, orderId: string, tripId: string | null, input: z.infer<typeof externalTransportSchema>) {
    const data = { ...input, agreedAmount: input.agreedAmount === undefined || input.agreedAmount === null ? input.agreedAmount : big(input.agreedAmount) };
    const existing = await tx.externalTransportInfo.findFirst({ where: tripId ? { tripId } : { orderId, tripId: null } });
    if (existing) return tx.externalTransportInfo.update({ where: { id: existing.id }, data: data as any });
    return tx.externalTransportInfo.create({ data: { ...data, orderId, tripId } as any });
  }

  // ---------------- Create / Update ----------------

  async create(input: TripInput) {
    const data = parse(tripSchema, input);
    const order = await this.prisma.db.order.findFirst({ where: { id: data.orderId }, include: { stops: true, trips: { where: { status: { not: 'CANCELLED' } }, select: { id: true } } } });
    if (!order) throw notFound('đơn hàng');
    if (order.status === 'CANCELLED') throw businessRule('Đơn đã hủy, không thể tạo chuyến');
    if (order.status === 'COMPLETED') assertSensitive('order.completed.update', data.reason);
    if (data.plannedEndAt && data.plannedEndAt < data.plannedStartAt) throw validationError([{ field: 'plannedEndAt', message: 'Giờ kết thúc phải sau giờ bắt đầu' }]);
    const isExternal = !!data.isExternal;
    const vehicleId = isExternal ? null : data.vehicleId ?? null;
    const driverId = isExternal ? null : data.driverId ?? null;
    const notices: string[] = [];
    await this.assertResources(vehicleId, driverId, notices);
    let stopIds = data.stopIds ?? [];
    if (!stopIds.length) {
      if (order.trips.length) throw validationError([{ field: 'stopIds', message: 'Đơn đã có chuyến khác — chọn điểm dừng chuyến này phụ trách' }]);
      stopIds = order.stops.map((s) => s.id);
    }
    const stops = stopIds.map((id) => order.stops.find((s) => s.id === id));
    if (stops.some((s) => !s)) throw validationError([{ field: 'stopIds', message: 'Điểm dừng không thuộc đơn này' }]);
    const warnings = await this.schedule.check({ vehicleId, driverId, plannedStartAt: data.plannedStartAt, plannedEndAt: data.plannedEndAt });
    const override = this.resolveOverride(warnings, data.overrideReason);
    const sortedStops = (stops as any[]).sort((a, b) => a.sequence - b.sequence);

    const trip = await this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('TRIP', tx);
      const t = await tx.trip.create({
        data: {
          code, orderId: order.id, vehicleId, driverId, isExternal, plannedStartAt: data.plannedStartAt, plannedEndAt: data.plannedEndAt ?? null,
          driverBonusAmount: big(data.driverBonusAmount ?? 0), note: data.note ?? null, routeSummary: routeSummaryOf(sortedStops),
          createdByUserId: userId(),
          stopAssignments: { create: sortedStops.map((s, i) => ({ merchantId: order.merchantId, stopId: s.id, sequence: i + 1 })) },
        } as any,
      });
      if (isExternal && data.externalTransport) await this.upsertExternalTx(tx, order.id, t.id, data.externalTransport);
      await this.saveWarnings(tx, t.id, warnings, override);
      await this.audit.statusChange({ entityType: 'TRIP', entityId: t.id, from: null, to: 'SCHEDULED' }, tx);
      await this.audit.log({
        entityType: 'TRIP', entityId: t.id, parent: { type: 'ORDER', id: order.id }, category: 'CREATE', action: 'trip.create',
        summary: `Tạo chuyến ${t.code} cho đơn ${order.code}${await this.assignText(tx, vehicleId, driverId, isExternal)}`,
        after: { vehicleId, driverId, plannedStartAt: data.plannedStartAt, driverBonusAmount: data.driverBonusAmount ?? 0, stopIds },
      }, tx);
      if (override) {
        await this.audit.log({
          entityType: 'TRIP', entityId: t.id, parent: { type: 'ORDER', id: order.id }, category: 'SENSITIVE', sensitive: true, action: 'dispatch.override_warning',
          summary: `Bỏ qua cảnh báo lịch: ${warnings.map(TripScheduleService.describe).join('; ')}`, reason: override,
        }, tx);
      }
      await this.orderSync.sync(order.id, tx);
      return t;
    });
    await this.afterAssign(trip.id, null, driverId, null, false, override ? warnings : []);
    return { trip: await this.get(trip.id), warnings: warnings.map((w) => ({ ...toWarningView(w), overrideReason: override })), notices };
  }

  private async assignText(tx: Tx, vehicleId: string | null, driverId: string | null, isExternal: boolean) {
    if (isExternal) return ' · thuê xe ngoài';
    const v = vehicleId ? await tx.vehicle.findFirst({ where: { id: vehicleId }, select: { plate: true } }) : null;
    const d = driverId ? await tx.driver.findFirst({ where: { id: driverId }, select: { name: true } }) : null;
    const parts = [v?.plate && `xe ${v.plate}`, d?.name && `tài xế ${d.name}`].filter(Boolean);
    return parts.length ? ` · ${parts.join(' / ')}` : '';
  }

  async update(id: string, input: UpdateTripInput, reason?: string | null) {
    const before = await this.prisma.db.trip.findFirst({ where: { id }, include: { order: { include: { stops: true } }, stopAssignments: true } });
    if (!before) throw notFound('chuyến');
    if (before.status === 'CANCELLED') throw businessRule('Chuyến đã hủy');
    const partial = parse(tripSchema.partial().omit({ orderId: true }), input);
    let r: string | null = null;
    if (before.status === 'COMPLETED') r = assertSensitive('order.completed.update', reason ?? partial.reason);
    const isExternal = partial.isExternal ?? before.isExternal;
    const vehicleId = isExternal ? null : partial.vehicleId !== undefined ? partial.vehicleId : before.vehicleId;
    const driverId = isExternal ? null : partial.driverId !== undefined ? partial.driverId : before.driverId;
    const plannedStartAt = partial.plannedStartAt ?? before.plannedStartAt;
    const plannedEndAt = partial.plannedEndAt !== undefined ? partial.plannedEndAt : before.plannedEndAt;
    if (plannedEndAt && plannedEndAt < plannedStartAt) throw validationError([{ field: 'plannedEndAt', message: 'Giờ kết thúc phải sau giờ bắt đầu' }]);
    const notices: string[] = [];
    const assignChanged = vehicleId !== before.vehicleId || driverId !== before.driverId;
    const timeChanged = plannedStartAt.getTime() !== before.plannedStartAt.getTime() || (plannedEndAt?.getTime() ?? null) !== (before.plannedEndAt?.getTime() ?? null);
    if (assignChanged) await this.assertResources(vehicleId !== before.vehicleId ? vehicleId : null, driverId !== before.driverId ? driverId : null, notices);
    let warnings: ScheduleWarningOut[] = [];
    let override: string | null = null;
    if (assignChanged || timeChanged) {
      warnings = await this.schedule.check({ tripId: id, vehicleId, driverId, plannedStartAt, plannedEndAt });
      override = this.resolveOverride(warnings, partial.overrideReason);
    }
    let stopIds = partial.stopIds;
    if (stopIds) {
      if (!stopIds.length) throw validationError([{ field: 'stopIds', message: 'Chuyến cần ít nhất 1 điểm dừng' }]);
      if (stopIds.some((sid) => !before.order.stops.some((s) => s.id === sid))) throw validationError([{ field: 'stopIds', message: 'Điểm dừng không thuộc đơn này' }]);
    }
    const bonusBefore = num(before.driverBonusAmount);
    const bonusAfter = partial.driverBonusAmount === undefined || partial.driverBonusAmount === null ? bonusBefore : partial.driverBonusAmount;

    await this.prisma.tx(async (tx) => {
      const data: any = { vehicleId, driverId, isExternal, plannedStartAt, plannedEndAt, driverBonusAmount: big(bonusAfter) };
      if (partial.note !== undefined) data.note = partial.note;
      if (stopIds) {
        const keep = new Map(before.stopAssignments.map((a) => [a.stopId, a]));
        await tx.tripStopAssignment.deleteMany({ where: { tripId: id, stopId: { notIn: stopIds } } });
        const sorted = stopIds.map((sid) => before.order.stops.find((s) => s.id === sid)!).sort((a, b) => a.sequence - b.sequence);
        for (let i = 0; i < sorted.length; i++) {
          const s = sorted[i];
          if (keep.has(s.id)) await tx.tripStopAssignment.update({ where: { tripId_stopId: { tripId: id, stopId: s.id } }, data: { sequence: i + 1 } });
          else await tx.tripStopAssignment.create({ data: { tripId: id, stopId: s.id, sequence: i + 1 } as any });
        }
        data.routeSummary = routeSummaryOf(sorted);
      }
      await tx.trip.update({ where: { id }, data });
      if (isExternal && partial.externalTransport) await this.upsertExternalTx(tx, before.orderId, id, partial.externalTransport);
      if (assignChanged || timeChanged) {
        await tx.scheduleWarning.updateMany({ where: { tripId: id, resolvedAt: null }, data: { resolvedAt: new Date() } });
        await this.saveWarnings(tx, id, warnings, override);
      }
      const parent = { type: 'ORDER' as const, id: before.orderId };
      if (assignChanged || timeChanged || stopIds) {
        await this.audit.log({
          entityType: 'TRIP', entityId: id, parent, category: r ? 'SENSITIVE' : 'ASSIGNMENT', sensitive: !!r, action: 'trip.update', reason: r,
          summary: `Cập nhật chuyến ${before.code}${assignChanged ? await this.assignText(tx, vehicleId, driverId, isExternal) : ''}${timeChanged ? ` · giờ ${formatDateTime(plannedStartAt)}` : ''}`,
          before: { vehicleId: before.vehicleId, driverId: before.driverId, plannedStartAt: before.plannedStartAt, plannedEndAt: before.plannedEndAt, stopIds: before.stopAssignments.map((a) => a.stopId) },
          after: { vehicleId, driverId, plannedStartAt, plannedEndAt, stopIds: stopIds ?? before.stopAssignments.map((a) => a.stopId) },
        }, tx);
      }
      if (bonusAfter !== bonusBefore) {
        await this.audit.log({
          entityType: 'TRIP', entityId: id, parent, category: r ? 'SENSITIVE' : 'MONEY', sensitive: !!r, action: 'trip.bonus.update', reason: r,
          summary: `Thưởng tài xế chuyến ${before.code}: ${formatVnd(bonusBefore)} → ${formatVnd(bonusAfter)}`,
          before: { driverBonusAmount: bonusBefore }, after: { driverBonusAmount: bonusAfter },
        }, tx);
      }
      if (override) {
        await this.audit.log({ entityType: 'TRIP', entityId: id, parent, category: 'SENSITIVE', sensitive: true, action: 'dispatch.override_warning', summary: `Bỏ qua cảnh báo lịch: ${warnings.map(TripScheduleService.describe).join('; ')}`, reason: override }, tx);
      }
      await this.orderSync.sync(before.orderId, tx);
    });
    await this.afterAssign(id, before.driverId, driverId, before.plannedStartAt, timeChanged, override ? warnings : []);
    return { trip: await this.get(id), warnings: warnings.map((w) => ({ ...toWarningView(w), overrideReason: override })), notices };
  }

  /** Thông báo tài xế (giao việc/thay đổi) + cảnh báo trùng lịch cho điều phối. */
  private async afterAssign(tripId: string, oldDriverId: string | null, newDriverId: string | null, _oldStart: Date | null, timeChanged: boolean, overridden: ScheduleWarningOut[]) {
    const t = await this.prisma.db.trip.findFirst({ where: { id: tripId }, include: { vehicle: { select: { plate: true } } } });
    if (!t) return;
    const body = `${t.routeSummary ?? ''} · xuất phát ${formatDateTime(t.plannedStartAt)}${t.vehicle ? ` · xe ${t.vehicle.plate}` : ''}`;
    if (newDriverId && newDriverId !== oldDriverId) {
      await this.notify.toDriver(newDriverId, { type: 'TRIP_ASSIGNED', title: `Bạn được giao chuyến ${t.code}`, body, entityType: 'TRIP', entityId: t.id, severity: 'info' });
    }
    if (oldDriverId && oldDriverId !== newDriverId) {
      await this.notify.toDriver(oldDriverId, { type: 'TRIP_CHANGED', title: `Chuyến ${t.code} đã chuyển cho tài xế khác`, body, entityType: 'TRIP', entityId: t.id, severity: 'warning' });
    } else if (newDriverId && newDriverId === oldDriverId && timeChanged) {
      await this.notify.toDriver(newDriverId, { type: 'TRIP_CHANGED', title: `Chuyến ${t.code} đổi giờ`, body, entityType: 'TRIP', entityId: t.id, severity: 'warning' });
    }
    if (overridden.length) {
      const p = currentPrincipal();
      await this.notify.toUsersWithPermission('trip.assign', {
        type: 'SCHEDULE_CONFLICT', title: `Chuyến ${t.code} được lưu dù trùng/gần trùng lịch`, body: overridden.map(TripScheduleService.describe).join('; '),
        entityType: 'TRIP', entityId: t.id, severity: 'warning',
      }, { exceptMembershipId: p?.type === 'USER' ? p.membershipId : null });
    }
  }

  // ---------------- External transport (DIS-006) ----------------

  async externalTransports(filter: { orderId?: string; supplierId?: string }) {
    const rows = await this.prisma.db.externalTransportInfo.findMany({
      where: { ...(filter.orderId ? { orderId: filter.orderId } : {}), ...(filter.supplierId ? { supplierId: filter.supplierId } : {}) },
      include: { supplier: { select: { name: true } }, order: { select: { code: true } }, trip: { select: { code: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toExternalView);
  }

  async upsertExternalTransport(orderId: string, tripId: string | null | undefined, input: ExternalTransportInput) {
    const data = parse(externalTransportSchema, input);
    const order = await this.prisma.db.order.findFirst({ where: { id: orderId } });
    if (!order) throw notFound('đơn hàng');
    if (tripId && !(await this.prisma.db.trip.count({ where: { id: tripId, orderId } }))) throw notFound('chuyến');
    if (data.supplierId && !(await this.prisma.db.supplier.count({ where: { id: data.supplierId } }))) throw notFound('nhà cung cấp');
    const row = await this.prisma.tx(async (tx) => {
      const r = await this.upsertExternalTx(tx, orderId, tripId ?? null, data);
      await this.audit.log({ entityType: 'ORDER', entityId: orderId, category: 'UPDATE', action: 'externalTransport.upsert', summary: `Cập nhật thông tin thuê xe ngoài${data.vehiclePlate ? ` (xe ${data.vehiclePlate})` : ''}`, after: data }, tx);
      return r;
    });
    const full = await this.prisma.db.externalTransportInfo.findFirstOrThrow({ where: { id: row.id }, include: { supplier: { select: { name: true } }, order: { select: { code: true } }, trip: { select: { code: true } } } });
    return toExternalView(full);
  }

  // ---------------- GPS view ----------------

  async lastKnownLocations(running = true) {
    const trips = await this.prisma.db.trip.findMany({
      where: { lastLocationAt: { not: null }, ...(running ? { status: { in: TRIP_RUNNING_STATUSES } } : {}) },
      include: { vehicle: { select: { plate: true } }, driver: { select: { name: true, phone: true } }, order: { select: { code: true } } },
      orderBy: { lastLocationAt: 'desc' },
      take: 500,
    });
    return trips.map((t) => ({
      tripId: t.id, tripCode: t.code, tripStatus: t.status, orderCode: t.order.code, vehiclePlate: t.vehicle?.plate ?? null, driverName: t.driver?.name ?? null,
      driverPhone: t.driver?.phone ?? null, lat: t.lastLat!, lng: t.lastLng!, capturedAt: t.lastLocationAt!, isStale: Date.now() - t.lastLocationAt!.getTime() > STALE_MS,
    }));
  }

  async tripLocations(tripId: string, from?: Date | null, to?: Date | null) {
    if (!(await this.prisma.db.trip.count({ where: { id: tripId } }))) throw notFound('chuyến');
    return this.prisma.db.tripLocation.findMany({
      where: { tripId, ...(from || to ? { recordedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      orderBy: { recordedAt: 'asc' },
      take: 5000,
      select: { lat: true, lng: true, recordedAt: true, speed: true, accuracy: true },
    });
  }

  runningStatuses(): TripStatus[] {
    return TRIP_RUNNING_STATUSES;
  }
}

function userId(): string | null {
  const p = currentPrincipal();
  return p?.type === 'USER' ? p.membershipId ?? null : null;
}

export function toWarningView(w: ScheduleWarningOut) {
  return {
    id: null, type: w.type, subject: w.subject, subjectId: w.subjectId, subjectLabel: w.subjectLabel, conflictTripId: w.conflictTripId ?? null,
    conflictTripCode: w.conflictTripCode ?? null, gapMinutes: w.gapMinutes, thresholdMinutes: w.thresholdMinutes, overrideReason: null as string | null,
  };
}

function toExternalView(r: any) {
  return {
    ...r, orderCode: r.order?.code ?? null, tripCode: r.trip?.code ?? null, supplierName: r.supplier?.name ?? null,
    agreedAmount: r.agreedAmount === null ? null : num(r.agreedAmount),
  };
}
