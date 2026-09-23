/** Mã chứng từ tự động theo merchant — mặc định DH-YYYYMM-0001. Ref: doc/1-BRD/09 §2.1. */
import { vnParts } from './date';
import type { ResetPeriod } from './status';

export type DatePart = 'YYYYMM' | 'YYYY' | 'YYMM' | 'NONE';

export interface NumberFormat {
  prefix: string;
  separator: string;
  datePart: DatePart;
  digits: number;
  resetPeriod: ResetPeriod;
}

export const DEFAULT_NUMBER_FORMAT: Omit<NumberFormat, 'prefix'> = {
  separator: '-',
  datePart: 'YYYYMM',
  digits: 4,
  resetPeriod: 'MONTHLY',
};

export function periodKey(resetPeriod: ResetPeriod, at: Date = new Date()): string {
  const p = vnParts(at);
  if (resetPeriod === 'NEVER') return 'ALL';
  if (resetPeriod === 'YEARLY') return String(p.y);
  return `${p.y}${String(p.m).padStart(2, '0')}`;
}

export function formatDocCode(fmt: NumberFormat, value: number, at: Date = new Date()): string {
  const p = vnParts(at);
  const y = String(p.y);
  const mm = String(p.m).padStart(2, '0');
  const date =
    fmt.datePart === 'YYYYMM' ? `${y}${mm}` : fmt.datePart === 'YYYY' ? y : fmt.datePart === 'YYMM' ? `${y.slice(2)}${mm}` : '';
  const seq = String(value).padStart(fmt.digits, '0');
  return [fmt.prefix, date, seq].filter(Boolean).join(fmt.separator);
}
