/** Cảnh báo trùng / gần trùng lịch xe & tài xế — mềm, không chặn. Ref: doc/1-BRD/05 §2. */
import type { ScheduleWarningType } from './status';

export interface ScheduleSlot {
  id?: string;
  code?: string;
  start: Date | string;
  end?: Date | string | null;
}

export interface ScheduleWarning {
  type: ScheduleWarningType;
  subject: 'VEHICLE' | 'DRIVER';
  subjectId: string;
  conflictTripId?: string;
  conflictTripCode?: string;
  /** Khoảng cách (phút) giữa 2 chuyến; 0 nếu chồng nhau */
  gapMinutes: number;
  thresholdMinutes: number;
}

export function slotEnd(slot: ScheduleSlot, defaultTripHours: number): Date {
  const start = new Date(slot.start);
  return slot.end ? new Date(slot.end) : new Date(start.getTime() + defaultTripHours * 3_600_000);
}

export function detectScheduleConflicts(
  candidate: ScheduleSlot,
  others: ScheduleSlot[],
  opts: { subject: 'VEHICLE' | 'DRIVER'; subjectId: string; nearOverlapMinutes: number; defaultTripHours: number },
): ScheduleWarning[] {
  const cStart = new Date(candidate.start).getTime();
  const cEnd = slotEnd(candidate, opts.defaultTripHours).getTime();
  const out: ScheduleWarning[] = [];
  for (const o of others) {
    if (candidate.id && o.id === candidate.id) continue;
    const oStart = new Date(o.start).getTime();
    const oEnd = slotEnd(o, opts.defaultTripHours).getTime();
    const overlap = cStart < oEnd && oStart < cEnd;
    if (overlap) {
      out.push({ type: 'OVERLAP', subject: opts.subject, subjectId: opts.subjectId, conflictTripId: o.id, conflictTripCode: o.code, gapMinutes: 0, thresholdMinutes: opts.nearOverlapMinutes });
      continue;
    }
    const gapMs = cStart >= oEnd ? cStart - oEnd : oStart - cEnd;
    const gapMinutes = Math.round(gapMs / 60_000);
    if (gapMinutes < opts.nearOverlapMinutes) {
      out.push({ type: 'NEAR_OVERLAP', subject: opts.subject, subjectId: opts.subjectId, conflictTripId: o.id, conflictTripCode: o.code, gapMinutes, thresholdMinutes: opts.nearOverlapMinutes });
    }
  }
  return out;
}
