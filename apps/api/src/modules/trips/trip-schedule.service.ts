import { Injectable } from '@nestjs/common';
import { detectScheduleConflicts, type ScheduleWarning } from '@bta/shared';
import { PrismaService, type DbClient } from '../../common/prisma/prisma.service';

export interface OverlapQuery {
  tripId?: string | null;
  vehicleId?: string | null;
  driverId?: string | null;
  plannedStartAt: Date;
  plannedEndAt?: Date | null;
}

export type ScheduleWarningOut = ScheduleWarning & { subjectLabel: string | null };

/** DIS-002: cảnh báo trùng / gần trùng lịch xe + tài xế theo ngưỡng merchant. */
@Injectable()
export class TripScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async settings(db: DbClient = this.prisma.db) {
    const s = await (db as any).merchantSettings.findFirst({});
    return {
      nearOverlapMinutes: s?.nearOverlapMinutes ?? 120,
      defaultTripHours: s?.defaultTripHours ?? 8,
      overlapWarnVehicle: s?.overlapWarnVehicle ?? true,
      overlapWarnDriver: s?.overlapWarnDriver ?? true,
    };
  }

  async check(q: OverlapQuery, db: DbClient = this.prisma.db): Promise<ScheduleWarningOut[]> {
    const s = await this.settings(db);
    const start = new Date(q.plannedStartAt);
    const end = q.plannedEndAt ? new Date(q.plannedEndAt) : new Date(start.getTime() + s.defaultTripHours * 3_600_000);
    // cửa sổ quét rộng: chuyến khác bắt đầu trong khoảng [start - 3 ngày, end + ngưỡng]
    const windowFrom = new Date(start.getTime() - 3 * 86_400_000);
    const windowTo = new Date(end.getTime() + s.nearOverlapMinutes * 60_000);
    const out: ScheduleWarningOut[] = [];
    const subjects: { subject: 'VEHICLE' | 'DRIVER'; id: string | null | undefined; enabled: boolean }[] = [
      { subject: 'VEHICLE', id: q.vehicleId, enabled: s.overlapWarnVehicle },
      { subject: 'DRIVER', id: q.driverId, enabled: s.overlapWarnDriver },
    ];
    for (const sub of subjects) {
      if (!sub.id || !sub.enabled) continue;
      const others = await (db as any).trip.findMany({
        where: {
          [sub.subject === 'VEHICLE' ? 'vehicleId' : 'driverId']: sub.id,
          status: { notIn: ['CANCELLED', 'COMPLETED'] },
          plannedStartAt: { gte: windowFrom, lte: windowTo },
          ...(q.tripId ? { id: { not: q.tripId } } : {}),
        },
        select: { id: true, code: true, plannedStartAt: true, plannedEndAt: true },
      });
      const label =
        sub.subject === 'VEHICLE'
          ? (await (db as any).vehicle.findFirst({ where: { id: sub.id }, select: { plate: true } }))?.plate ?? null
          : (await (db as any).driver.findFirst({ where: { id: sub.id }, select: { name: true } }))?.name ?? null;
      const w = detectScheduleConflicts(
        { id: q.tripId ?? undefined, start, end },
        others.map((o: any) => ({ id: o.id, code: o.code, start: o.plannedStartAt, end: o.plannedEndAt })),
        { subject: sub.subject, subjectId: sub.id, nearOverlapMinutes: s.nearOverlapMinutes, defaultTripHours: s.defaultTripHours },
      );
      out.push(...w.map((x) => ({ ...x, subjectLabel: label })));
    }
    return out;
  }

  static describe(w: ScheduleWarningOut): string {
    const who = w.subject === 'VEHICLE' ? `Xe ${w.subjectLabel ?? ''}` : `Tài xế ${w.subjectLabel ?? ''}`;
    return w.type === 'OVERLAP'
      ? `${who} trùng lịch với chuyến ${w.conflictTripCode}`
      : `${who} cách chuyến ${w.conflictTripCode} ${w.gapMinutes} phút (ngưỡng ${w.thresholdMinutes} phút)`;
  }
}
