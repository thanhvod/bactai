import { MIN_REASON_LENGTH, requiresReason, type Permission } from '@bta/shared';
import { currentPrincipal } from '../context/request-context';
import { forbidden, reasonRequired } from '../errors/app-error';

export function hasPermission(permission: Permission): boolean {
  const p = currentPrincipal();
  return p?.type === 'USER' && p.permissions.includes(permission);
}

/** Kiểm tra quyền + lý do cho thao tác nhạy cảm (doc/2-PRD/08 §10). Trả về reason đã trim. */
export function assertSensitive(permission: Permission, reason: string | null | undefined): string {
  if (!hasPermission(permission)) throw forbidden(`Bạn không có quyền "${permission}"`);
  const r = (reason ?? '').trim();
  if (requiresReason(permission) && r.length < MIN_REASON_LENGTH) throw reasonRequired();
  return r;
}

export function assertPermission(permission: Permission): void {
  if (!hasPermission(permission)) throw forbidden(`Bạn không có quyền "${permission}"`);
}
