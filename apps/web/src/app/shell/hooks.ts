import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import type { NavBadges } from './nav';
import { MarkAllNotificationsReadMutation, MarkNotificationReadMutation, NotificationsQuery } from '@/features/shared/graphql';
import { GlobalSearchQuery, NavBadgesQuery, PendingBookingsQuery } from '@/features/dispatch/graphql/dispatch';
import { useAuth } from '@/app/auth/AuthProvider';
import { paths } from '../routes';
import { ACTIVE_STATUS, DOC_STATUS, INCIDENT_STATUS, ORDER_STATUS, TRIP_STATUS, VEHICLE_STATUS, labelOf, type EnumMeta } from '@bta/shared';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
  readAt?: string | null;
  severity?: 'info' | 'warning' | 'danger' | string | null;
}

/** WM-SHELL-02 — notifications của người dùng hiện tại (polling 30s, ARCHITECTURE §20). */
export function useNotifications(): { items: NotificationItem[]; unreadCount: number; loading: boolean; markRead: (id: string) => Promise<void>; markAllRead: () => Promise<void>; refetch: () => void } {
  const { data, loading, refetch } = useQuery(NotificationsQuery, { variables: { first: 30 }, pollInterval: 30_000, fetchPolicy: 'cache-and-network' });
  const [markOne] = useMutation(MarkNotificationReadMutation);
  const [markAll] = useMutation(MarkAllNotificationsReadMutation);
  const items: NotificationItem[] = (data?.notifications.nodes ?? []).map((n) => ({ ...n }));
  return {
    items,
    unreadCount: data?.notifications.unreadCount ?? 0,
    loading: loading && !data,
    markRead: async (id) => {
      if (items.find((i) => i.id === id)?.readAt) return;
      await markOne({ variables: { id } });
      await refetch();
    },
    markAllRead: async () => {
      await markAll();
      await refetch();
    },
    refetch: () => void refetch(),
  };
}

/** Badge cảnh báo sidebar từ `navBadges` + số yêu cầu khách chờ tiếp nhận (polling 60s). */
export function useNavBadges(): NavBadges {
  const { hasPermission } = useAuth();
  const { data } = useQuery(NavBadgesQuery, { pollInterval: 60_000, fetchPolicy: 'cache-and-network', skip: !hasPermission('dashboard.view') });
  const { data: bk } = useQuery(PendingBookingsQuery, { pollInterval: 60_000, fetchPolicy: 'cache-and-network', skip: !hasPermission('order.view') });
  const b = data?.navBadges;
  return {
    dispatch: b?.scheduleWarnings || undefined,
    incidents: b?.incidents || undefined,
    finance: b?.overdueCustomers || undefined,
    cod: b?.codOverThreshold || undefined,
    payroll: b?.payroll || undefined,
    bookings: bk?.bookings.totalCount || undefined,
  };
}

export interface SearchResult {
  type: 'ORDER' | 'TRIP' | 'CUSTOMER' | 'DRIVER' | 'VEHICLE' | 'PAYMENT_IN' | 'EXPENSE' | 'INCIDENT';
  id: string;
  code: string;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  to: string;
}

const STATUS_META: Partial<Record<SearchResult['type'], Record<string, EnumMeta>>> = {
  ORDER: ORDER_STATUS, TRIP: TRIP_STATUS, CUSTOMER: ACTIVE_STATUS, DRIVER: ACTIVE_STATUS, VEHICLE: VEHICLE_STATUS, PAYMENT_IN: DOC_STATUS, EXPENSE: DOC_STATUS, INCIDENT: INCIDENT_STATUS,
};

const SEARCH_GROUPS: { type: SearchResult['type']; label: string; to: (id: string) => string }[] = [
  { type: 'ORDER', label: 'Đơn hàng', to: (id) => paths.order(id) },
  { type: 'TRIP', label: 'Chuyến', to: (id) => paths.trip(id) },
  { type: 'CUSTOMER', label: 'Khách hàng', to: (id) => paths.customer(id) },
  { type: 'DRIVER', label: 'Tài xế', to: (id) => paths.driver(id) },
  { type: 'VEHICLE', label: 'Xe', to: (id) => paths.vehicle(id) },
  { type: 'PAYMENT_IN', label: 'Phiếu thu', to: (id) => paths.payment(id) },
  { type: 'EXPENSE', label: 'Phiếu chi', to: (id) => paths.expense(id) },
  { type: 'INCIDENT', label: 'Sự cố', to: (id) => paths.incident(id) },
];

/** WM-SHELL-03 — `globalSearch(query, types, first)`; debounce 250ms, tối thiểu 2 ký tự. */
export function useGlobalSearch(query: string): { groups: { type: SearchResult['type']; label: string; items: SearchResult[] }[]; loading: boolean } {
  const [q, setQ] = React.useState('');
  React.useEffect(() => {
    const t = setTimeout(() => setQ(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);
  const { data, loading } = useQuery(GlobalSearchQuery, { variables: { query: q, first: 5 }, skip: q.length < 2, fetchPolicy: 'network-only' });
  const results = q.length < 2 ? [] : data?.globalSearch ?? [];
  const groups = SEARCH_GROUPS.map((g) => ({
    type: g.type,
    label: g.label,
    items: results.filter((r) => r.type === g.type).map((r) => ({ ...r, type: g.type, code: r.code ?? '', status: r.status ? labelOf(STATUS_META[g.type] ?? {}, r.status) : null, to: g.to(r.id) })),
  })).filter((g) => g.items.length);
  return { groups, loading: loading && q.length >= 2 };
}
