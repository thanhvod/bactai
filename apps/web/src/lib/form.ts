import { zodResolver as zodResolverImpl } from '@hookform/resolvers/zod';
/** Chuẩn hóa dữ liệu form ↔ API: null → '' khi đưa vào input; '' → null khi gửi lên. */
export function nullsToEmpty<T extends Record<string, unknown>>(obj: T): { [K in keyof T]: T[K] extends null ? string : Exclude<T[K], null> | (null extends T[K] ? string : never) } {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = v === null || v === undefined ? '' : v;
  return out as never;
}

export function emptyToNull<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = typeof v === 'string' && v.trim() === '' ? null : v;
  return out as T;
}

/** Bỏ field __typename (Apollo) trước khi gửi input. */
export function stripTypename<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripTypename) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (k !== '__typename') out[k] = stripTypename(v);
    return out as T;
  }
  return value;
}

/**
 * zodResolver cho schema @bta/shared: schema chấp nhận null ở input (coi như bỏ trống) nhưng form dùng kiểu output.
 * Ép kiểu resolver về kiểu giá trị form để react-hook-form không báo lệch input/output.
 */
export function zodFormResolver<T extends import('react-hook-form').FieldValues>(schema: import('zod').ZodTypeAny): import('react-hook-form').Resolver<T> {
  return zodResolverImpl(schema) as unknown as import('react-hook-form').Resolver<T>;
}
