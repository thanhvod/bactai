import { Injectable } from '@nestjs/common';
import {
  TRIP_CLOSED_STATUSES,
  TRIP_RUNNING_STATUSES,
  addDays,
  isoDate,
  startOfVnDay,
} from '@bta/shared';
import { num } from '@bta/db';
import { allowedNextTripStatuses } from '../trips/trip-status.service';
import { currentPrincipal, type DriverPrincipal } from '../../common/context/request-context';
import { forbidden, notFound } from '../../common/errors/app-error';
import { FinanceCalcService } from '../../common/finance/finance-calc.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { DriverJobsFilter } from './driver-app.types';

@Injectable()
export class DriverAppService {
  constructor(private readonly prisma: PrismaService, private readonly finance: FinanceCalcService) {}

  me(): DriverPrincipal {
    const p = currentPrincipal();
    if (p?.type !== 'DRIVER') throw forbidden();
    return p;
  }

  async driverMe() {
    const p = this.me();
    const d = await this.prisma.db.driver.findFirstOrThrow({ where: { id: p.driverId }, include: { account: true, merchant: true } });
    const [unread, ledger] = await Promise.all([
      this.prisma.raw.notification.count({ where: { recipientType: 'DRIVER', recipientId: d.id, readAt: null } }),
      this.finance.driverLedgers([d.id]),
    ]);
    return {
      id: d.id, code: d.code, name: d.name, phone: d.phone, merchantId: d.merchantId, merchantName: d.merchant.name,
      merchantHotline: d.merchant.dispatchHotline ?? d.merchant.phone, mustChangePassword: d.account?.mustChangePassword ?? false,
      licenseClass: d.licenseClass, licenseExpiresAt: d.licenseExpiresAt, unreadNotifications: unread, codHeld: ledger.get(d.id)?.codHeld ?? 0,
    };
  }

  private tripInclude = {
    order: { include: { customer: true, cargoLines: true } },
    vehicle: true,
    stopAssignments: { include: { stop: { include: { pickupCargo: true, dropoffCargo: true } } }, orderBy: { sequence: 'asc' as const } },
    incidents: { orderBy: { createdAt: 'desc' as const } },
  };

  async toView(t: any) {
    const stopIds = t.stopAssignments.map((a: any) => a.stopId);
    const [pods, atts, labels] = await Promise.all([
      this.prisma.db.attachment.groupBy({ by: ['entityId'], where: { entityType: 'ORDER_STOP', entityId: { in: stopIds }, category: 'POD', status: 'READY' }, _count: true }),
      this.prisma.db.attachment.count({ where: { status: 'READY', OR: [{ entityType: 'TRIP', entityId: t.id }, { entityType: 'ORDER_STOP', entityId: { in: stopIds } }] } }),
      this.prisma.db.catalogItem.findMany({ where: { id: { in: [t.pausedReasonId, t.vehicle?.typeId, ...t.order.cargoLines.map((c: any) => c.cargoTypeId)].filter(Boolean) } } }),
    ]);
    const label = (id?: string | null) => (id ? labels.find((l) => l.id === id)?.name ?? null : null);
    const stops = t.stopAssignments.map((a: any) => {
      const s = a.stop;
      const cargo = [...s.pickupCargo, ...s.dropoffCargo].map((c: any) => c.name);
      return {
        ...s, codExpected: s.codExpected === null ? null : num(s.codExpected), codActual: s.codActual === null ? null : num(s.codActual),
        podCount: (pods.find((p: any) => p.entityId === s.id) as any)?._count ?? 0, cargoSummary: cargo,
      };
    });
    return {
      id: t.id, code: t.code, status: t.status, previousStatusBeforePause: t.previousStatusBeforePause, pauseReason: label(t.pausedReasonId),
      orderId: t.orderId, orderCode: t.order.code, customerName: t.order.customer.name, routeSummary: t.routeSummary ?? t.order.routeSummary,
      vehiclePlate: t.vehicle?.plate ?? null, vehicleType: label(t.vehicle?.typeId), plannedStartAt: t.plannedStartAt, plannedEndAt: t.plannedEndAt,
      actualStartAt: t.actualStartAt, actualEndAt: t.actualEndAt,
      codExpectedTotal: stops.reduce((s: number, x: any) => s + (x.codExpected ?? 0), 0),
      codActualTotal: stops.reduce((s: number, x: any) => s + (x.codActual ?? 0), 0),
      driverBonusAmount: num(t.driverBonusAmount), note: t.note, orderNote: t.order.note,
      stopCount: stops.length, completedStopCount: stops.filter((s: any) => ['COMPLETED', 'SKIPPED'].includes(s.status)).length,
      attachmentCount: atts, stops,
      cargoLines: t.order.cargoLines.map((c: any) => ({ ...c, type: label(c.cargoTypeId), properties: c.properties })),
      incidents: t.incidents,
      allowedNextStatuses: allowedNextTripStatuses(t.status, t.previousStatusBeforePause).filter((x) => x !== 'CANCELLED'),
      lastLocationAt: t.lastLocationAt,
      isRunning: TRIP_RUNNING_STATUSES.includes(t.status),
    };
  }

  async jobs(filter: DriverJobsFilter = {}) {
    const p = this.me();
    const where: any = { driverId: p.driverId };
    const today = startOfVnDay();
    const tomorrow = addDays(today, 1);
    switch (filter.bucket) {
      case 'TODAY':
        where.OR = [{ plannedStartAt: { gte: today, lt: tomorrow } }, { status: { in: TRIP_RUNNING_STATUSES } }];
        break;
      case 'UPCOMING':
        where.plannedStartAt = { gte: tomorrow };
        where.status = 'SCHEDULED';
        break;
      case 'RUNNING':
        where.status = { in: TRIP_RUNNING_STATUSES };
        break;
      case 'DONE':
        where.status = { in: TRIP_CLOSED_STATUSES };
        break;
    }
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.date) where.plannedStartAt = { gte: startOfVnDay(filter.date), lt: addDays(startOfVnDay(filter.date), 1) };
    if (filter.from || filter.to) where.plannedStartAt = { ...(filter.from ? { gte: startOfVnDay(filter.from) } : {}), ...(filter.to ? { lt: addDays(startOfVnDay(filter.to), 1) } : {}) };
    const trips = await this.prisma.db.trip.findMany({
      where, include: this.tripInclude,
      orderBy: filter.bucket === 'DONE' ? { plannedStartAt: 'desc' } : { plannedStartAt: 'asc' },
      take: 100,
    });
    return Promise.all(trips.map((t) => this.toView(t)));
  }

  async calendar(from: string, to: string) {
    const p = this.me();
    const trips = await this.prisma.db.trip.findMany({
      where: { driverId: p.driverId, plannedStartAt: { gte: startOfVnDay(from), lt: addDays(startOfVnDay(to), 1) } },
      select: { plannedStartAt: true, status: true },
    });
    const map = new Map<string, { tripCount: number; statuses: Set<string> }>();
    for (const t of trips) {
      const k = isoDate(t.plannedStartAt);
      const e = map.get(k) ?? { tripCount: 0, statuses: new Set<string>() };
      e.tripCount++;
      e.statuses.add(t.status);
      map.set(k, e);
    }
    return [...map.entries()].sort().map(([date, e]) => ({ date, tripCount: e.tripCount, statuses: [...e.statuses] }));
  }

  async trip(id: string) {
    const p = this.me();
    const t = await this.prisma.db.trip.findFirst({ where: { id, driverId: p.driverId }, include: this.tripInclude });
    if (!t) throw notFound('chuyến');
    return this.toView(t);
  }

  /** Kiểm tra tài xế hiện tại chạy chuyến chứa stop; trả tripId. */
  async assertOwnStop(stopId: string): Promise<string> {
    const p = this.me();
    const a = await this.prisma.db.tripStopAssignment.findFirst({ where: { stopId, trip: { driverId: p.driverId, status: { not: 'CANCELLED' } } } });
    if (!a) throw notFound('điểm dừng');
    return a.tripId;
  }

  async assertOwnTrip(tripId: string) {
    const p = this.me();
    const t = await this.prisma.db.trip.findFirst({ where: { id: tripId, driverId: p.driverId } });
    if (!t) throw notFound('chuyến');
    return t;
  }
}
