import { Injectable } from '@nestjs/common';
import { TRIP_RUNNING_STATUSES, TRIP_STATUSES, detectScheduleConflicts, slotEnd, type Permission } from '@bta/shared';
import { currentPrincipal } from '../../common/context/request-context';
import { notFound } from '../../common/errors/app-error';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { PrismaService } from '../../common/prisma/prisma.service';
import { todayIso, vnDayRange } from '../trips/dispatch-helpers';
import { TripScheduleService } from '../trips/trip-schedule.service';

const brief = (t: any) =>
  t && { id: t.id, code: t.code, status: t.status, plannedStartAt: t.plannedStartAt, plannedEndAt: t.plannedEndAt, orderCode: t.order?.code ?? null, vehiclePlate: t.vehicle?.plate ?? null, driverName: t.driver?.name ?? null };
const TRIP_BRIEF = { include: { order: { select: { code: true } }, vehicle: { select: { plate: true } }, driver: { select: { name: true } } } };

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService, private readonly schedule: TripScheduleService) {}

  // ---------- WM-DISPATCH-03 ----------
  async scheduleWarnings(filter: { resolved?: boolean; dateFrom?: string; dateTo?: string; tripId?: string; subject?: string } = {}, page: { first?: number; after?: string | null }) {
    const where: any = {};
    if (filter.resolved === true) where.resolvedAt = { not: null };
    if (filter.resolved === false) where.resolvedAt = null;
    if (filter.tripId) where.tripId = filter.tripId;
    if (filter.subject) where.subject = filter.subject;
    if (filter.dateFrom || filter.dateTo) {
      where.trip = { plannedStartAt: {} };
      if (filter.dateFrom) where.trip.plannedStartAt.gte = vnDayRange(filter.dateFrom).from;
      if (filter.dateTo) where.trip.plannedStartAt.lt = vnDayRange(filter.dateTo).to;
    }
    const { take, skip } = pageParams(page);
    const [rows, total] = await Promise.all([
      this.prisma.db.scheduleWarning.findMany({ where, include: { trip: TRIP_BRIEF, conflictTrip: TRIP_BRIEF }, orderBy: { createdAt: 'desc' }, take, skip }),
      this.prisma.db.scheduleWarning.count({ where }),
    ]);
    const users = await this.prisma.db.merchantUser.findMany({ where: { id: { in: rows.map((r) => r.overriddenByUserId).filter(Boolean) as string[] } }, select: { id: true, name: true } });
    const nodes = rows.map((r) => ({
      ...r,
      trip: brief(r.trip),
      conflictTrip: brief(r.conflictTrip),
      subjectLabel: r.subject === 'VEHICLE' ? (r.trip as any).vehicle?.plate ?? null : (r.trip as any).driver?.name ?? null,
      status: r.resolvedAt ? 'RESOLVED' : r.overrideReason ? 'OVERRIDDEN' : 'OPEN',
      overriddenByName: users.find((u) => u.id === r.overriddenByUserId)?.name ?? null,
    }));
    return toConnection(nodes, total, skip, take);
  }

  async resolveWarning(id: string) {
    const w = await this.prisma.db.scheduleWarning.findFirst({ where: { id } });
    if (!w) throw notFound('cảnh báo');
    await this.prisma.db.scheduleWarning.update({ where: { id }, data: { resolvedAt: new Date() } });
    return true;
  }

  // ---------- WM-DISPATCH-02 ----------
  async schedules(kind: 'VEHICLE' | 'DRIVER', date: string | null | undefined, days = 1) {
    const iso = date ?? todayIso();
    const { from, to } = vnDayRange(iso, Math.min(Math.max(days, 1), 31));
    const s = await this.schedule.settings();
    const trips = await this.prisma.db.trip.findMany({
      where: {
        status: { not: 'CANCELLED' },
        [kind === 'VEHICLE' ? 'vehicleId' : 'driverId']: { not: null },
        plannedStartAt: { lt: to, gte: new Date(from.getTime() - 2 * 86_400_000) },
      },
      include: TRIP_BRIEF.include,
      orderBy: { plannedStartAt: 'asc' },
    });
    const visible = trips.filter((t) => slotEnd({ start: t.plannedStartAt, end: t.plannedEndAt }, s.defaultTripHours) > from);
    const resources =
      kind === 'VEHICLE'
        ? (await this.prisma.db.vehicle.findMany({ where: { OR: [{ status: { not: 'INACTIVE' } }, { id: { in: visible.map((t) => t.vehicleId!) } }] }, orderBy: { plate: 'asc' } })).map((v) => ({ type: 'VEHICLE', id: v.id, label: v.plate, status: v.status, sublabel: v.code }))
        : (await this.prisma.db.driver.findMany({ where: { OR: [{ status: 'ACTIVE' }, { id: { in: visible.map((t) => t.driverId!) } }] }, orderBy: { name: 'asc' } })).map((d) => ({ type: 'DRIVER', id: d.id, label: d.name, status: d.status, sublabel: d.phone }));
    const stored = await this.prisma.db.scheduleWarning.findMany({ where: { tripId: { in: visible.map((t) => t.id) }, resolvedAt: null }, select: { tripId: true } });
    const storedSet = new Set(stored.map((w) => w.tripId));
    return resources.map((r) => {
      const mine = visible.filter((t) => (kind === 'VEHICLE' ? t.vehicleId : t.driverId) === r.id);
      const blocks = mine.map((t) => {
        const others = mine.filter((o) => o.id !== t.id && o.status !== 'COMPLETED').map((o) => ({ id: o.id, code: o.code, start: o.plannedStartAt, end: o.plannedEndAt }));
        const live = t.status === 'COMPLETED' ? [] : detectScheduleConflicts({ id: t.id, start: t.plannedStartAt, end: t.plannedEndAt }, others, { subject: kind, subjectId: r.id, nearOverlapMinutes: s.nearOverlapMinutes, defaultTripHours: s.defaultTripHours });
        return {
          tripId: t.id, code: t.code, start: t.plannedStartAt, end: slotEnd({ start: t.plannedStartAt, end: t.plannedEndAt }, s.defaultTripHours), status: t.status,
          warning: live.length > 0 || storedSet.has(t.id), orderCode: t.order.code, routeSummary: t.routeSummary,
          counterpartLabel: kind === 'VEHICLE' ? t.driver?.name ?? null : t.vehicle?.plate ?? null,
        };
      });
      return { resource: r, blocks };
    });
  }

  // ---------- Tóm tắt bảng điều phối ----------
  async summary(date?: string | null) {
    const iso = date ?? todayIso();
    const { from, to } = vnDayRange(iso);
    const [grouped, running, unassigned, warnings, openIncidents, waiting] = await Promise.all([
      this.prisma.db.trip.groupBy({ by: ['status'], where: { plannedStartAt: { gte: from, lt: to } }, _count: true }),
      this.prisma.db.trip.count({ where: { status: { in: TRIP_RUNNING_STATUSES } } }),
      this.prisma.db.trip.count({ where: { status: 'SCHEDULED', isExternal: false, OR: [{ vehicleId: null }, { driverId: null }] } }),
      this.prisma.db.scheduleWarning.count({ where: { resolvedAt: null, trip: { status: { notIn: ['CANCELLED', 'COMPLETED'] } } } }),
      this.prisma.db.incident.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.prisma.db.order.count({ where: { status: 'CONFIRMED' } }),
    ]);
    const byStatus = TRIP_STATUSES.map((st) => ({ status: st, count: (grouped.find((g: any) => g.status === st) as any)?._count ?? 0 }));
    return { date: iso, total: byStatus.reduce((s, x) => s + x.count, 0), byStatus, running, unassigned, warnings, openIncidents, ordersWaitingDispatch: waiting };
  }

  // ---------- WM-SHELL-03 ----------
  async globalSearch(query: string, types: string[] | null | undefined, first = 5) {
    const q = query.trim();
    if (q.length < 2) return [];
    const p = currentPrincipal();
    const perms: Permission[] = p?.type === 'USER' ? p.permissions : [];
    const want = (t: string, perm: Permission) => (!types?.length || types.includes(t)) && perms.includes(perm);
    const ci = { contains: q, mode: 'insensitive' as const };
    const take = Math.min(Math.max(first, 1), 20);
    const out: any[] = [];
    const jobs: Promise<void>[] = [];
    if (want('ORDER', 'order.view'))
      jobs.push(this.prisma.db.order.findMany({ where: { OR: [{ code: ci }, { customer: { name: ci } }, { routeSummary: ci }] }, include: { customer: { select: { name: true } } }, take, orderBy: { orderDate: 'desc' } })
        .then((r) => void out.push(...r.map((o) => ({ type: 'ORDER', id: o.id, code: o.code, title: `${o.code} · ${o.customer.name}`, subtitle: o.routeSummary, status: o.status })))));
    if (want('TRIP', 'order.view'))
      jobs.push(this.prisma.db.trip.findMany({ where: { OR: [{ code: ci }, { vehicle: { plate: ci } }, { driver: { name: ci } }] }, include: TRIP_BRIEF.include, take, orderBy: { plannedStartAt: 'desc' } })
        .then((r) => void out.push(...r.map((t) => ({ type: 'TRIP', id: t.id, code: t.code, title: `${t.code} · ${t.order.code}`, subtitle: [t.vehicle?.plate, t.driver?.name].filter(Boolean).join(' / ') || t.routeSummary, status: t.status })))));
    if (want('CUSTOMER', 'customer.view'))
      jobs.push(this.prisma.db.customer.findMany({ where: { OR: [{ code: ci }, { name: ci }, { phone: { contains: q } }, { taxCode: { contains: q } }] }, take, orderBy: { name: 'asc' } })
        .then((r) => void out.push(...r.map((c) => ({ type: 'CUSTOMER', id: c.id, code: c.code, title: c.name, subtitle: c.phone, status: c.status })))));
    if (want('DRIVER', 'driver.view'))
      jobs.push(this.prisma.db.driver.findMany({ where: { OR: [{ code: ci }, { name: ci }, { phone: { contains: q } }] }, take, orderBy: { name: 'asc' } })
        .then((r) => void out.push(...r.map((d) => ({ type: 'DRIVER', id: d.id, code: d.code, title: d.name, subtitle: d.phone, status: d.status })))));
    if (want('VEHICLE', 'vehicle.view'))
      jobs.push(this.prisma.db.vehicle.findMany({ where: { OR: [{ code: ci }, { plate: ci }] }, take, orderBy: { plate: 'asc' } })
        .then((r) => void out.push(...r.map((v) => ({ type: 'VEHICLE', id: v.id, code: v.code, title: v.plate, subtitle: v.brandModel, status: v.status })))));
    if (want('PAYMENT_IN', 'finance.view'))
      jobs.push(this.prisma.db.paymentIn.findMany({ where: { OR: [{ code: ci }, { payerName: ci }, { customer: { name: ci } }] }, include: { customer: { select: { name: true } }, driver: { select: { name: true } } }, take, orderBy: { receivedAt: 'desc' } })
        .then((r) => void out.push(...r.map((x) => ({ type: 'PAYMENT_IN', id: x.id, code: x.code, title: `${x.code} · ${x.customer?.name ?? x.driver?.name ?? x.payerName ?? ''}`, subtitle: `${Number(x.amount).toLocaleString('vi-VN')} đ`, status: x.status })))));
    if (want('EXPENSE', 'finance.view'))
      jobs.push(this.prisma.db.expense.findMany({ where: { OR: [{ code: ci }, { description: ci }, { supplier: { name: ci } }] }, include: { supplier: { select: { name: true } } }, take, orderBy: { expenseDate: 'desc' } })
        .then((r) => void out.push(...r.map((x) => ({ type: 'EXPENSE', id: x.id, code: x.code, title: `${x.code} · ${x.supplier?.name ?? x.description ?? ''}`, subtitle: `${Number(x.amount).toLocaleString('vi-VN')} đ`, status: x.status })))));
    if (want('INCIDENT', 'order.view'))
      jobs.push(this.prisma.db.incident.findMany({ where: { OR: [{ code: ci }, { title: ci }] }, take, orderBy: { createdAt: 'desc' } })
        .then((r) => void out.push(...r.map((x) => ({ type: 'INCIDENT', id: x.id, code: x.code, title: `${x.code} · ${x.title}`, subtitle: null, status: x.status })))));
    await Promise.all(jobs);
    return out;
  }
}
