import * as React from 'react';
import { useNavigate } from 'react-router';
import { Button, EmptyState, cn } from '@bta/shadcn';
import { NOTIFICATION_TYPE, formatDateTime, labelOf } from '@bta/shared';
import type { NotificationItem } from './hooks';

const entityPath: Record<string, (id: string) => string> = {
  ORDER: (id) => `/orders/${id}`,
  TRIP: (id) => `/trips/${id}`,
  CUSTOMER: (id) => `/customers/${id}`,
  DRIVER: (id) => `/drivers/${id}`,
  PAYROLL: (id) => `/payroll/${id}`,
  INCIDENT: (id) => `/dispatch/incidents/${id}`,
  PAYMENT_IN: (id) => `/finance/payments/${id}`,
  EXPENSE: (id) => `/finance/expenses/${id}`,
  DEBT_STATEMENT: (id) => `/finance/debt-statements/${id}`,
};

/** WM-SHELL-02 — popover từ chuông topbar. */
export function NotificationList({ items, unreadCount, markRead, markAllRead, loading }: { items: NotificationItem[]; unreadCount: number; loading: boolean; markRead: (id: string) => Promise<void>; markAllRead: () => Promise<void> }) {
  const navigate = useNavigate();
  return (
    <div className="flex max-h-[480px] flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="text-body-strong">Thông báo</span>
        {unreadCount ? <span className="text-caption text-text-muted">{unreadCount} chưa đọc</span> : null}
        <div className="flex-1" />
        <Button variant="link" size="sm" onClick={() => void markAllRead()} disabled={!unreadCount}>
          Đánh dấu đã đọc
        </Button>
      </div>
      <div className="overflow-y-auto">
        {loading ? <p className="p-4 text-body-sm text-text-muted">Đang tải…</p> : null}
        {!loading && items.length === 0 ? <EmptyState compact message="Không có thông báo mới" /> : null}
        <ul>
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  void markRead(n.id);
                  const p = n.entityType && n.entityId ? entityPath[n.entityType]?.(n.entityId) : null;
                  if (p) navigate(p);
                }}
                className={cn('flex w-full flex-col gap-0.5 border-b border-border px-3 py-2 text-left hover:bg-surface-muted', !n.readAt && 'bg-accent-soft/40')}
              >
                <span className="flex items-center gap-2">
                  <span className={cn('size-2 shrink-0 rounded-full', n.severity === 'danger' ? 'bg-danger' : n.severity === 'warning' ? 'bg-warning' : 'bg-info')} aria-hidden />
                  <span className="text-caption text-text-subtle">{labelOf(NOTIFICATION_TYPE, n.type)}</span>
                  <span className="ml-auto text-caption text-text-subtle tabular-nums">{formatDateTime(n.createdAt)}</span>
                </span>
                <span className={cn('text-body-sm', !n.readAt && 'font-semibold')}>{n.title}</span>
                {n.body ? <span className="text-caption text-text-muted">{n.body}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
