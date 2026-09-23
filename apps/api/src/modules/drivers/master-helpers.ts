import { num } from '@bta/db';
import { isoDate } from '@bta/shared';

/** 'YYYY-MM-DD' → Date UTC 00:00 (cột @db.Date lưu đúng ngày). */
export function dateOnly(v: string | null | undefined): Date | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  return new Date(`${v}T00:00:00.000Z`);
}

/** Hôm nay (giờ VN) dạng Date UTC 00:00 cho so sánh cột @db.Date. */
export function todayDate(): Date {
  return new Date(`${isoDate(new Date())}T00:00:00.000Z`);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

export function toTripItem(t: any) {
  return {
    ...t,
    orderCode: t.order?.code ?? null,
    vehiclePlate: t.vehicle?.plate ?? null,
    driverName: t.driver?.name ?? null,
    driverBonusAmount: num(t.driverBonusAmount),
  };
}

export function toExpenseItem(e: any, labels: Map<string, string>) {
  return {
    ...e,
    amount: num(e.amount),
    categoryName: e.categoryId ? labels.get(e.categoryId) ?? null : null,
    orderCode: e.order?.code ?? null,
    tripCode: e.trip?.code ?? null,
    supplierName: e.supplier?.name ?? null,
    vehiclePlate: e.vehicle?.plate ?? null,
  };
}

export const TRIP_ITEM_INCLUDE = {
  order: { select: { code: true } },
  vehicle: { select: { plate: true } },
  driver: { select: { name: true } },
} as const;

export const EXPENSE_ITEM_INCLUDE = {
  order: { select: { code: true } },
  trip: { select: { code: true } },
  supplier: { select: { name: true } },
  vehicle: { select: { plate: true } },
} as const;

export function requireReason(reason: string | null | undefined): string {
  return (reason ?? '').trim();
}
