import { Injectable } from '@nestjs/common';
import { ORDER_STATUS, STOP_STATUS, TRIP_STATUS, PAYROLL_STATUS, DEBT_STATEMENT_STATUS, INCIDENT_STATUS, BOOKING_STATUS, labelOf, type EntityType } from '@bta/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { EntityRefInput, TimelineEntry, TimelineFilter } from './activity.types';

const STATUS_META: Partial<Record<EntityType, Record<string, { label: string }>>> = {
  ORDER: ORDER_STATUS,
  TRIP: TRIP_STATUS,
  ORDER_STOP: STOP_STATUS,
  PAYROLL: PAYROLL_STATUS,
  DEBT_STATEMENT: DEBT_STATEMENT_STATUS,
  INCIDENT: INCIDENT_STATUS,
  BOOKING: BOOKING_STATUS,
};

/** Timeline hợp nhất activity_logs + status_histories theo entity (WM-SHELL-07). */
@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  private async childRefs(entity: EntityRefInput): Promise<{ type: EntityType; ids: string[] }[]> {
    if (entity.type === 'ORDER') {
      const [trips, stops] = await Promise.all([
        this.prisma.db.trip.findMany({ where: { orderId: entity.id }, select: { id: true } }),
        this.prisma.db.orderStop.findMany({ where: { orderId: entity.id }, select: { id: true } }),
      ]);
      return [
        { type: 'TRIP', ids: trips.map((t) => t.id) },
        { type: 'ORDER_STOP', ids: stops.map((s) => s.id) },
      ];
    }
    if (entity.type === 'TRIP') {
      const a = await this.prisma.db.tripStopAssignment.findMany({ where: { tripId: entity.id }, select: { stopId: true } });
      return [{ type: 'ORDER_STOP', ids: a.map((x) => x.stopId) }];
    }
    return [];
  }

  async timeline(entity: EntityRefInput, filter: TimelineFilter = {}): Promise<TimelineEntry[]> {
    const refs: { type: EntityType; ids: string[] }[] = [{ type: entity.type as EntityType, ids: [entity.id] }];
    if (filter.includeChildren !== false) refs.push(...(await this.childRefs(entity)));
    const or = refs.filter((r) => r.ids.length).map((r) => ({ entityType: r.type, entityId: { in: r.ids } }));
    const cats = filter.categories?.length ? filter.categories : null;
    const [logs, statuses] = await Promise.all([
      this.prisma.db.activityLog.findMany({
        where: { OR: [...or, { parentEntityType: entity.type as EntityType, parentEntityId: entity.id }], ...(cats ? { category: { in: cats as any } } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      !cats || cats.includes('STATUS')
        ? this.prisma.db.statusHistory.findMany({ where: { OR: or }, orderBy: { changedAt: 'desc' }, take: 500 })
        : Promise.resolve([]),
    ]);
    const entries: TimelineEntry[] = [
      ...logs.map((l) => ({
        id: l.id, kind: 'ACTIVITY', createdAt: l.createdAt, entityType: l.entityType, entityId: l.entityId, category: l.category,
        action: l.action, summary: l.summary, actorType: l.actorType, actorId: l.actorId, actorName: l.actorName, reason: l.reason,
        before: l.before, after: l.after, sensitive: l.sensitive,
      })),
      ...statuses.map((s) => {
        const meta = STATUS_META[s.entityType as EntityType] ?? {};
        return {
          id: s.id, kind: 'STATUS', createdAt: s.changedAt, entityType: s.entityType, entityId: s.entityId, category: 'STATUS',
          action: 'status.change',
          summary: `${s.fromStatus ? `${labelOf(meta as any, s.fromStatus)} → ` : ''}${labelOf(meta as any, s.toStatus)}`,
          actorType: s.actorType, actorId: s.actorId, actorName: s.actorName, reason: s.reason ?? s.note,
          before: s.fromStatus ? { status: s.fromStatus } : null, after: { status: s.toStatus }, sensitive: false,
          fromStatus: s.fromStatus, toStatus: s.toStatus,
        };
      }),
    ];
    return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async statusHistory(entityType: EntityType, entityId: string) {
    return this.prisma.db.statusHistory.findMany({ where: { entityType, entityId }, orderBy: { changedAt: 'asc' } });
  }

  async byActor(actorId: string, first = 50): Promise<TimelineEntry[]> {
    const logs = await this.prisma.db.activityLog.findMany({ where: { actorId }, orderBy: { createdAt: 'desc' }, take: first });
    return logs.map((l) => ({
      id: l.id, kind: 'ACTIVITY', createdAt: l.createdAt, entityType: l.entityType, entityId: l.entityId, category: l.category,
      action: l.action, summary: l.summary, actorType: l.actorType, actorId: l.actorId, actorName: l.actorName, reason: l.reason,
      before: l.before, after: l.after, sensitive: l.sensitive,
    }));
  }
}
