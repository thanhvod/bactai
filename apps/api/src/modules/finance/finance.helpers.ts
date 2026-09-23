import { EXPENSE_KIND, PAYMENT_IN_TYPE, toDbDate, type ExpenseKind, type PaymentInType } from '@bta/shared';
import { num } from '@bta/db';

/** "YYYY-MM-DD" → Date UTC 00:00 (cột @db.Date lưu đúng ngày). */
export function dateOnly(iso: string): Date {
  return toDbDate(iso);
}

/** Khoảng ngày theo giờ VN cho cột DateTime (receivedAt...). */
export function vnDayStart(iso: string): Date {
  return new Date(`${iso}T00:00:00+07:00`);
}
export function vnDayEnd(iso: string): Date {
  return new Date(`${iso}T23:59:59.999+07:00`);
}

export const EXPENSE_INCLUDE = {
  order: { select: { id: true, code: true } },
  trip: { select: { id: true, code: true } },
  vehicle: { select: { id: true, code: true, plate: true } },
  driver: { select: { id: true, code: true, name: true } },
  supplier: { select: { id: true, code: true, name: true } },
} as const;

export function expenseView(e: any, categories: Map<string, string>, attachmentCounts: Map<string, number>) {
  return {
    ...e,
    amount: num(e.amount),
    kindLabel: EXPENSE_KIND[e.kind as ExpenseKind]?.label ?? e.kind,
    isCost: EXPENSE_KIND[e.kind as ExpenseKind]?.isCost ?? false,
    categoryName: e.categoryId ? categories.get(e.categoryId) ?? null : null,
    order: e.order ? { id: e.order.id, code: e.order.code } : null,
    trip: e.trip ? { id: e.trip.id, code: e.trip.code } : null,
    vehicle: e.vehicle ? { id: e.vehicle.id, code: e.vehicle.code, name: e.vehicle.plate } : null,
    driver: e.driver ? { id: e.driver.id, code: e.driver.code, name: e.driver.name } : null,
    supplier: e.supplier ? { id: e.supplier.id, code: e.supplier.code, name: e.supplier.name } : null,
    attachmentCount: attachmentCounts.get(e.id) ?? 0,
  };
}

/** Phiếu thu KHÔNG phải doanh thu: tài xế nộp COD (thu hồi phải thu) & hoàn tạm ứng. */
export function isNotRevenue(type: PaymentInType): boolean {
  return type === 'DRIVER_COD_REMITTANCE' || type === 'DRIVER_ADVANCE_RETURN';
}

export function paymentTypeLabel(type: string) {
  return PAYMENT_IN_TYPE[type as PaymentInType]?.label ?? type;
}
