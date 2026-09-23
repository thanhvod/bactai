import { AsyncLocalStorage } from 'node:async_hooks';
import type { MerchantRole, Permission } from '@bta/shared';

export interface UserPrincipal {
  type: 'USER';
  accountId: string;
  email: string;
  name: string;
  /** Có khi request gửi x-merchant-id hợp lệ */
  membershipId?: string;
  merchantId?: string;
  role?: MerchantRole;
  permissions: Permission[];
}

export interface DriverPrincipal {
  type: 'DRIVER';
  driverId: string;
  merchantId: string;
  name: string;
  accountId: string;
}

export interface CustomerPrincipal {
  type: 'CUSTOMER';
  accountId: string;
  email: string | null;
  phone: string;
  name: string;
}

export type Principal = UserPrincipal | DriverPrincipal | CustomerPrincipal;

export interface RequestStore {
  requestId: string;
  principal: Principal | null;
  /** merchant đang thao tác (USER đã chọn merchant, DRIVER luôn có) */
  merchantId: string | null;
  ip?: string;
  userAgent?: string;
  /** Cho phép system job chạy trong scope merchant mà không có principal */
  systemActorName?: string;
}

export const requestContext = new AsyncLocalStorage<RequestStore>();

export function currentStore(): RequestStore | undefined {
  return requestContext.getStore();
}

export function currentMerchantId(): string | null {
  return requestContext.getStore()?.merchantId ?? null;
}

export function currentPrincipal(): Principal | null {
  return requestContext.getStore()?.principal ?? null;
}

/** Thông tin actor để ghi audit. */
export function currentActor(): { actorType: 'USER' | 'DRIVER' | 'CUSTOMER' | 'SYSTEM'; actorId: string | null; actorName: string | null } {
  const s = requestContext.getStore();
  const p = s?.principal;
  if (!p) return { actorType: 'SYSTEM', actorId: null, actorName: s?.systemActorName ?? 'Hệ thống' };
  if (p.type === 'USER') return { actorType: 'USER', actorId: p.membershipId ?? p.accountId, actorName: p.name };
  if (p.type === 'DRIVER') return { actorType: 'DRIVER', actorId: p.driverId, actorName: p.name };
  return { actorType: 'CUSTOMER', actorId: p.accountId, actorName: p.name };
}

/** Chạy một hàm trong scope merchant (dùng cho job/system/test). */
export function runAsSystem<T>(merchantId: string | null, fn: () => Promise<T>, actorName = 'Hệ thống'): Promise<T> {
  return requestContext.run(
    { requestId: `sys-${Date.now()}`, principal: null, merchantId, systemActorName: actorName },
    fn,
  );
}

export function runWithStore<T>(store: RequestStore, fn: () => Promise<T>): Promise<T> {
  return requestContext.run(store, fn);
}
