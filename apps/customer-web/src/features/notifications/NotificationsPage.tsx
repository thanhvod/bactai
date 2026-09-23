import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { formatDateTime } from '@bta/shared';
import { Banner, Button, EmptyState, PageHeader, SegmentedControl, Skeleton, cn } from '@bta/shadcn';
import { MarkAllNotificationsReadMutation, MarkNotificationsReadMutation, NotificationsQuery, UnreadCountQuery } from '@/graphql/operations';
import { paths } from '@/app/routes';

/** Đích điều hướng theo entity của thông báo. */
export function notificationTarget(n: { entityType?: string | null; entityId?: string | null; type: string }): string | null {
  if (!n.entityId) return n.type === 'DEBT_STATEMENT_SENT' ? paths.debt() : null;
  switch (n.entityType) {
    case 'BOOKING':
      return paths.booking(n.entityId);
    case 'ORDER':
      return paths.order(n.entityId);
    case 'DEBT_STATEMENT':
      return paths.debt(n.entityId);
    default:
      return null;
  }
}

/** CW-NOTI-01 — Thông báo khách hàng. */
export default function NotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState('all');
  const refetchQueries = [{ query: UnreadCountQuery }];
  const { data, loading, error, refetch, fetchMore } = useQuery(NotificationsQuery, { variables: { filter: tab === 'unread' ? { unread: true } : null, first: 30 } });
  const [markRead] = useMutation(MarkNotificationsReadMutation, { refetchQueries });
  const [markAll, markAllState] = useMutation(MarkAllNotificationsReadMutation, { refetchQueries });
  const conn = data?.notifications;

  return (
    <div className="mx-auto max-w-[840px] space-y-4">
      <PageHeader
        title="Thông báo"
        subtitle={conn ? `${conn.unreadCount} chưa đọc` : undefined}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link to={paths.profile()}>Cài đặt nhận thông báo</Link>
            </Button>
            <Button variant="secondary" loading={markAllState.loading} disabled={!conn?.unreadCount} onClick={async () => { await markAll(); await refetch(); }}>
              Đánh dấu tất cả đã đọc
            </Button>
          </>
        }
      />
      <SegmentedControl value={tab} onChange={setTab} items={[{ value: 'all', label: 'Tất cả' }, { value: 'unread', label: 'Chưa đọc', count: conn?.unreadCount ?? null }]} />
      {error ? <Banner tone="danger" message="Không tải được thông báo" action={<Button size="sm" variant="secondary" onClick={() => refetch()}>Thử lại</Button>} /> : null}
      {loading && !data ? (
        <div className="space-y-2">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : !conn?.nodes.length ? (
        <EmptyState message="Chưa có thông báo" />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {conn.nodes.map((n) => {
            const to = notificationTarget(n);
            return (
              <li key={n.id}>
                <button
                  type="button"
                  className={cn('flex w-full gap-3 px-4 py-3 text-left hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', !n.readAt && 'bg-accent-soft')}
                  onClick={async () => {
                    if (!n.readAt) await markRead({ variables: { ids: [n.id] } }).catch(() => undefined);
                    if (to) navigate(to);
                    else void refetch();
                  }}
                >
                  <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.readAt ? 'bg-transparent' : 'bg-accent')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-strong text-text">{n.title}</span>
                    {n.body ? <span className="block text-body-sm text-text-muted">{n.body}</span> : null}
                    <span className="block text-caption text-text-subtle">{formatDateTime(n.createdAt)}{n.readAt ? '' : ' · Chưa đọc'}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {conn?.pageInfo.hasNextPage ? (
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={() =>
              fetchMore({
                variables: { after: conn.pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult }) =>
                  fetchMoreResult ? { ...fetchMoreResult, notifications: { ...fetchMoreResult.notifications, nodes: [...prev.notifications.nodes, ...fetchMoreResult.notifications.nodes] } } : prev,
              })
            }
          >
            Xem thêm
          </Button>
        </div>
      ) : null}
    </div>
  );
}
