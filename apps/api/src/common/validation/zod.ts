import type { ZodTypeAny, z } from 'zod';
import { validationError } from '../errors/app-error';

/** Parse input bằng zod, lỗi → VALIDATION_ERROR có extensions.validation[{field,message}]. */
export function parse<T extends ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const r = schema.safeParse(input);
  if (r.success) return r.data;
  return (() => {
    throw validationError(r.error.issues.map((i) => ({ field: i.path.join('.') || '_', message: i.message })));
  })();
}
