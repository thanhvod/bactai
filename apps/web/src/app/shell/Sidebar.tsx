import * as React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { ChevronsUpDown } from 'lucide-react';
import { Logo, cn, initials } from '@bta/shadcn';
import { MERCHANT_ROLE_LABEL } from '@bta/shared';
import { useAuth } from '../auth/AuthProvider';
import { PATHS } from '../routes';
import { NAV_ITEMS, type NavBadges, type NavItem } from './nav';

function Badge({ n, tone }: { n?: number; tone: 'danger' | 'warning' }) {
  if (!n) return null;
  return <span className={cn('ml-auto rounded-[9px] px-1.5 text-[11px] font-bold leading-[18px]', tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>{n}</span>;
}

function isActive(pathname: string, to: string, exact?: boolean) {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(to + '/') || (to !== '/' && pathname.startsWith(to));
}

export function Sidebar({ badges, onNavigate }: { badges: NavBadges; onNavigate?: () => void }) {
  const { current, memberships, hasPermission } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const visible = NAV_ITEMS.filter((it) => !it.permission || hasPermission(it.permission) || it.key === 'dashboard');

  const groupActive = (it: NavItem) => (it.children ? it.children.some((c) => isActive(pathname, c.to, c.exact)) : isActive(pathname, it.to, it.exact));

  return (
    <aside className="flex h-full w-sidebar shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex flex-col gap-2 px-2 pb-2 pt-3">
        <div className="px-2">
          <Logo />
        </div>
        <button
          type="button"
          onClick={() => navigate(PATHS.selectMerchant)}
          className="flex items-center gap-2.5 rounded-md border border-border px-2.5 py-2 text-left hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Đổi nhà xe"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary-soft text-caption font-semibold text-primary">{initials(current?.merchantName)}</span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body-sm font-semibold">{current?.merchantName ?? 'Chưa chọn nhà xe'}</span>
            <span className="truncate text-[11px] text-text-subtle">
              {memberships.find((m) => m.merchantId === current?.merchantId)?.merchantCode ?? ''}
              {current ? ` · ${MERCHANT_ROLE_LABEL[current.role]}` : ''}
            </span>
          </span>
          <ChevronsUpDown className="size-4 text-text-subtle" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-1 scrollbar-thin" aria-label="Điều hướng chính">
        {visible.map((it) => {
          const active = groupActive(it);
          const Icon = it.icon;
          return (
            <div key={it.key}>
              <NavLink
                to={it.to}
                onClick={onNavigate}
                className={cn('flex h-9 items-center gap-2.5 rounded-md px-2.5 text-body transition-colors', active ? 'bg-primary-soft font-semibold text-primary' : 'text-text hover:bg-surface-muted')}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{it.label}</span>
                <Badge n={it.badgeKey ? badges[it.badgeKey as keyof NavBadges] : undefined} tone={it.badgeKey === 'finance' ? 'danger' : 'warning'} />
              </NavLink>
              {it.children && active ? (
                <div className="mt-0.5 flex flex-col gap-0.5">
                  {it.children
                    .filter((c) => !c.permission || hasPermission(c.permission))
                    .map((c) => {
                      const a = isActive(pathname, c.to, c.exact);
                      return (
                        <NavLink
                          key={c.to}
                          to={c.to}
                          onClick={onNavigate}
                          className={cn('flex h-8 items-center gap-2 rounded-md py-0 pl-9 pr-2.5 text-body-sm', a ? 'font-semibold text-primary' : 'text-text-muted hover:bg-surface-muted hover:text-text')}
                          aria-current={a ? 'page' : undefined}
                        >
                          <span className="truncate">{c.label}</span>
                          <Badge n={c.badgeKey ? badges[c.badgeKey as keyof NavBadges] : undefined} tone={c.badgeKey === 'finance' ? 'danger' : 'warning'} />
                        </NavLink>
                      );
                    })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
      <div className="px-3 py-2">
        <div className="rounded-md bg-surface-muted px-2.5 py-2 text-[11px] text-text-subtle">Phase 1 · v0.1</div>
      </div>
    </aside>
  );
}
