/** Kỳ lương & tính dòng lương — logic đơn giản, operation nhập tay. Ref: doc/1-BRD/04. */
import { sumMoney, type Money } from './money';
import { PAYROLL_ITEM_TYPE, type PayrollItemType, type PayrollPeriodType } from './status';

export interface PayrollPeriod {
  from: string; // YYYY-MM-DD (bao gồm)
  to: string; // YYYY-MM-DD (bao gồm)
  label: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function iso(y: number, m: number, d: number) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/**
 * Kỳ lương chứa tháng (year, month).
 * MONTHLY: 01 → cuối tháng. CUSTOM startDay=5: 05/tháng → 04/tháng sau (kỳ gắn nhãn theo tháng bắt đầu).
 */
export function payrollPeriodFor(year: number, month: number, type: PayrollPeriodType, startDay = 1): PayrollPeriod {
  if (type === 'MONTHLY' || startDay <= 1) {
    return { from: iso(year, month, 1), to: iso(year, month + 1, 0), label: `Tháng ${pad(month)}/${year}` };
  }
  const from = iso(year, month, startDay);
  const to = iso(year, month + 1, startDay - 1);
  return { from, to, label: `Kỳ ${pad(startDay)}/${pad(month)}/${year} – ${to.slice(8, 10)}/${to.slice(5, 7)}/${to.slice(0, 4)}` };
}

/** Lương cố định hiệu lực của kỳ: mốc mới nhất có effectiveFrom ≤ ngày cuối kỳ. */
export function salaryForPeriod(
  history: { amount: number | bigint; effectiveFrom: Date | string }[],
  periodTo: string,
): { amount: Money; effectiveFrom: string } | null {
  const end = new Date(`${periodTo}T23:59:59+07:00`).getTime();
  const applicable = history
    .filter((h) => new Date(h.effectiveFrom).getTime() <= end)
    .sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime());
  if (!applicable.length) return null;
  return { amount: Number(applicable[0].amount), effectiveFrom: new Date(applicable[0].effectiveFrom).toISOString() };
}

export interface PayrollLineTotals {
  base: Money;
  bonus: Money;
  advance: Money;
  deduction: Money;
  adjustment: Money;
  net: Money;
}

/** Items lưu số dương; dấu theo loại (ADVANCE/DEDUCTION trừ). ADJUSTMENT có thể âm. */
export function payrollLineTotals(items: { type: PayrollItemType; amount: number | bigint }[]): PayrollLineTotals {
  const by = (t: PayrollItemType) => sumMoney(items.filter((i) => i.type === t).map((i) => i.amount));
  const base = by('BASE');
  const bonus = by('BONUS');
  const advance = by('ADVANCE');
  const deduction = by('DEDUCTION');
  const adjustment = by('ADJUSTMENT');
  return { base, bonus, advance, deduction, adjustment, net: base + bonus - advance - deduction + adjustment };
}

export function signedItemAmount(type: PayrollItemType, amount: number): Money {
  return PAYROLL_ITEM_TYPE[type].sign * amount;
}
