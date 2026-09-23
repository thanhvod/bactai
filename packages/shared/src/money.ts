/** Tiền VND luôn là số nguyên an toàn (không float). Ref: ARCHITECTURE §12.3. */

export type Money = number;

export function assertMoney(value: number, field = 'amount'): Money {
  if (!Number.isSafeInteger(value)) throw new Error(`${field} phải là số nguyên VND`);
  return value;
}

export function toMoney(value: number | bigint | string | null | undefined): Money {
  if (value === null || value === undefined || value === '') return 0;
  const n = typeof value === 'bigint' ? Number(value) : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

export function sumMoney(values: Iterable<number | bigint | null | undefined>): Money {
  let total = 0;
  for (const v of values) total += toMoney(v ?? 0);
  return total;
}

const VND = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

/** 1250000 → "1.250.000 đ" */
export function formatVnd(value: number | bigint | null | undefined, withUnit = true): string {
  const n = toMoney(value ?? 0);
  const s = VND.format(n);
  return withUnit ? `${s} đ` : s;
}

/** "1.250.000 đ" / "1,250,000" / "1250000" → 1250000 (null nếu rỗng/không hợp lệ). */
export function parseVnd(input: string | null | undefined): Money | null {
  if (input === null || input === undefined) return null;
  const negative = /^\s*-/.test(input);
  const digits = input.replace(/[^\d]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isSafeInteger(n)) return null;
  return negative ? -n : n;
}
