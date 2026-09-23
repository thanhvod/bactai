import { isoDate, toDbDate as sharedToDbDate } from '@bta/shared';

/** Cột @db.Date — theo quy ước @bta/shared toDbDate (UTC 00:00 của ngày lịch VN); null-safe. */
export function toDbDate(s: string | null | undefined): Date | null {
  return s ? sharedToDbDate(s) : null;
}

export function todayIso(): string {
  return isoDate(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** [đầu ngày VN, đầu ngày VN kế tiếp) của ngày YYYY-MM-DD. */
export function vnDayRange(iso: string, days = 1): { from: Date; to: Date } {
  const from = new Date(`${iso.slice(0, 10)}T00:00:00+07:00`);
  return { from, to: new Date(from.getTime() + days * 86_400_000) };
}

export function stopLabel(s: { locationName?: string | null; address: string }): string {
  return s.locationName?.trim() || s.address;
}

/** "Điểm lấy đầu → điểm trả 1, điểm trả 2" (tối đa 3 điểm trả). */
export function routeSummaryOf(stops: { type: string; sequence: number; locationName?: string | null; address: string }[]): string | null {
  const sorted = [...stops].sort((a, b) => a.sequence - b.sequence);
  const pickups = sorted.filter((s) => s.type === 'PICKUP');
  const drops = sorted.filter((s) => s.type === 'DROPOFF');
  if (!sorted.length) return null;
  const from = pickups[0] ? stopLabel(pickups[0]) : stopLabel(sorted[0]);
  if (!drops.length) return from;
  const names = drops.slice(0, 3).map(stopLabel);
  const more = drops.length > 3 ? ` +${drops.length - 3}` : '';
  return `${from} → ${names.join(', ')}${more}`;
}
