import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { NoPermissionState, Skeleton } from '@bta/shadcn';
import type { Permission } from '@bta/shared';
import { useAuth } from './AuthProvider';
import { PATHS } from '../routes';

function FullPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center" aria-busy>
      <div className="flex w-64 flex-col gap-3">
        <Skeleton h={20} w="60%" />
        <Skeleton />
        <Skeleton w="80%" />
      </div>
    </div>
  );
}

/** Route con cần đăng nhập + đã chọn merchant. */
export function RequireAuth() {
  const { status, current, memberships } = useAuth();
  const loc = useLocation();
  if (status === 'loading') return <FullPageLoading />;
  if (status === 'anonymous') return <Navigate to={PATHS.login} replace state={{ from: loc.pathname + loc.search }} />;
  if (!current) {
    const active = memberships.filter((m) => m.status === 'ACTIVE');
    if (memberships.length === 0) return <Navigate to={PATHS.accessPending} replace />;
    if (active.length === 0) return <Navigate to={PATHS.selectMerchant} replace />;
    return <Navigate to={PATHS.selectMerchant} replace />;
  }
  return <Outlet />;
}

/** Route cần đăng nhập nhưng KHÔNG cần merchant (select-merchant, onboarding, access-pending). */
export function RequireAccount() {
  const { status } = useAuth();
  const loc = useLocation();
  if (status === 'loading') return <FullPageLoading />;
  if (status === 'anonymous') return <Navigate to={PATHS.login} replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}

/** Route khách: đã đăng nhập thì chuyển vào app. */
export function RedirectIfAuthenticated() {
  const { status, current } = useAuth();
  if (status === 'loading') return <FullPageLoading />;
  if (status === 'authenticated') return <Navigate to={current ? PATHS.dashboard : PATHS.selectMerchant} replace />;
  return <Outlet />;
}

export function RequirePermission({ permission, children, fallback }: { permission: Permission | string | (Permission | string)[]; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const keys = Array.isArray(permission) ? permission : [permission];
  const ok = keys.some((k) => hasPermission(k));
  if (!ok) return <>{fallback ?? <NoPermissionState />}</>;
  return <>{children}</>;
}

/** Ẩn phần tử nếu thiếu quyền (nút, menu item). */
export function Can({ permission, children }: { permission: Permission | string | (Permission | string)[]; children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  const keys = Array.isArray(permission) ? permission : [permission];
  return keys.some((k) => hasPermission(k)) ? <>{children}</> : null;
}
