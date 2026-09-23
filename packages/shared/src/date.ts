/** Định dạng ngày giờ theo design: 23/09/2026 14:30. Múi giờ vận hành: Asia/Ho_Chi_Minh. */

export const BUSINESS_TZ = 'Asia/Ho_Chi_Minh';
const TZ_OFFSET_MINUTES = 7 * 60;

function pad(n: number, w = 2): string {
  return String(n).padStart(w, '0');
}

/** Lấy các thành phần ngày theo giờ Việt Nam (UTC+7, không DST). */
export function vnParts(d: Date | string | number): { y: number; m: number; d: number; h: number; mi: number } {
  const date = new Date(d);
  const t = new Date(date.getTime() + TZ_OFFSET_MINUTES * 60_000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), mi: t.getUTCMinutes() };
}

export function formatDate(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const p = vnParts(value);
  return `${pad(p.d)}/${pad(p.m)}/${p.y}`;
}

export function formatDateTime(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const p = vnParts(value);
  return `${pad(p.d)}/${pad(p.m)}/${p.y} ${pad(p.h)}:${pad(p.mi)}`;
}

export function formatTime(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const p = vnParts(value);
  return `${pad(p.h)}:${pad(p.mi)}`;
}

/** YYYYMM theo giờ VN — dùng cho mã chứng từ. */
export function yyyymm(value: Date | string | number = new Date()): string {
  const p = vnParts(value);
  return `${p.y}${pad(p.m)}`;
}

/** Đầu ngày (00:00 giờ VN) dưới dạng Date UTC. */
export function startOfVnDay(value: Date | string | number = new Date()): Date {
  const p = vnParts(value);
  return new Date(Date.UTC(p.y, p.m - 1, p.d) - TZ_OFFSET_MINUTES * 60_000);
}

export function addDays(value: Date | string | number, days: number): Date {
  return new Date(new Date(value).getTime() + days * 86_400_000);
}

/** Số ngày trọn giữa 2 mốc theo lịch VN (b - a). */
export function diffVnDays(a: Date | string | number, b: Date | string | number): number {
  return Math.round((startOfVnDay(b).getTime() - startOfVnDay(a).getTime()) / 86_400_000);
}

/** ISO date "2026-09-23" theo giờ VN. */
export function isoDate(value: Date | string | number): string {
  const p = vnParts(value);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

/**
 * Cột Prisma `@db.Date` lưu phần ngày UTC. Quy ước: ngày lịch VN "YYYY-MM-DD" ↔ Date UTC 00:00.
 * Dùng khi ghi (dueDate, orderDate, expenseDate, effectiveFrom...) để không lệch 1 ngày.
 */
export function toDbDate(isoDateStr: string): Date {
  return new Date(`${isoDateStr.slice(0, 10)}T00:00:00Z`);
}

/** Ngày lịch VN hôm nay dưới dạng Date cho cột @db.Date. */
export function todayDbDate(at: Date = new Date()): Date {
  return toDbDate(isoDate(at));
}
