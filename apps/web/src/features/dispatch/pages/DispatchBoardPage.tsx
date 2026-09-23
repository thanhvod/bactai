import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { AlertTriangle, CalendarDays, MapPinned, Plus, RefreshCcw, Truck } from 'lucide-react';
import {
  Button,
  DataTable,
  DateField,
  EmptyState,
  ErrorState,
  FilterBar,
  KpiCard,
  PageHeader,
  SegmentedControl,
  Skeleton,
  StatusBadge,
  type DataTableColumn,
} from '@bta/shadcn';
import { TRIP_STATUS, formatDateTime, formatTime, formatVnd, type TripStatus } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { TripListFieldsFragment } from '@/gql/graphql';
import { CellLink } from '@/features/master-data/helpers';
import { OrdersQuery } from '@/features/orders/graphql/orders';
import { todayIso } from '@/features/orders/components/common';
import { DispatchSummaryQuery, ResourceOptionsQuery, TripsQuery } from '../graphql/dispatch';

type Row = TripListFieldsFragment;

const COLUMNS: { key: string; label: string; statuses: TripStatus[] }[] = [
  { key: 'scheduled', label: 'Đã lên lịch', statuses: ['SCHEDULED'] },
  { key: 'pickup', label: 'Đi lấy / đang lấy', statuses: ['TO_PICKUP', 'PICKING_UP'] },
  { key: 'transit', label: 'Đang vận chuyển', statuses: ['IN_TRANSIT', 'PAUSED'] },
  { key: 'deliver', label: 'Đang trả hàng', statuses: ['DELIVERING'] },
  { key: 'done', label: 'Hoàn thành', statuses: ['COMPLETED'] },
];

/** WM-DISPATCH-01 — Bảng điều phối theo ngày/trạng thái (polling 30s để nhận trạng thái từ app tài xế). */
export default function DispatchBoardPage() {
  return (
    <RequirePermission permission="order.view">
      <DispatchBoard />
    </RequirePermission>
  );
}

function DispatchBoard() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const date = params.get('date') ?? todayIso();
  const view = params.get('view') ?? 'board';
  const driverId = params.get('driverId');
  const vehicleId = params.get('vehicleId');
  const status = params.get('status');
  const [search, setSearch] = React.useState('');
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  const filter = { dateFrom: date, dateTo: date, driverId: driverId || null, vehicleId: vehicleId || null, status: status ? [status] : null, search: search || null };
  const { data, loading, error, refetch } = useQuery(TripsQuery, { variables: { filter, first: 200 }, pollInterval: 30_000 });
  const { data: running } = useQuery(TripsQuery, { variables: { filter: { running: true, driverId: driverId || null, vehicleId: vehicleId || null }, first: 200 }, pollInterval: 30_000, skip: date !== todayIso() });
  const { data: summary } = useQuery(DispatchSummaryQuery, { variables: { date }, pollInterval: 30_000 });
  const { data: resources } = useQuery(ResourceOptionsQuery);
  const { data: waiting } = useQuery(OrdersQuery, { variables: { filter: { needsAction: true }, first: 10, sort: 'ORDER_DATE_ASC' } });
  // Hôm nay: gộp chuyến đang chạy từ ngày trước để không sót xe đang trên đường.
  const rows = React.useMemo(() => {
    const map = new Map<string, Row>();
    for (const t of data?.trips.nodes ?? []) map.set(t.id, t);
    for (const t of running?.trips.nodes ?? []) if (!status || t.status === status) map.set(t.id, t);
    return [...map.values()].sort((a, b) => a.plannedStartAt.localeCompare(b.plannedStartAt));
  }, [data, running, status]);
  const s = summary?.dispatchSummary;

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Chuyến', render: (t) => <CellLink to={paths.trip(t.id)} className="font-mono font-medium text-text hover:text-accent hover:underline">{t.code}</CellLink> },
    { key: 'order', label: 'Đơn', render: (t) => <CellLink to={paths.order(t.order.id)}>{t.order.code}</CellLink> },
    { key: 'route', label: 'Tuyến', render: (t) => <span className="line-clamp-2 max-w-[260px] text-body-sm">{t.routeSummary ?? t.order.customerName}</span> },
    { key: 'veh', label: 'Xe', render: (t) => t.vehicle?.plate ?? (t.isExternal ? 'Xe ngoài' : <span className="text-warning">Chưa gán</span>) },
    { key: 'drv', label: 'Tài xế', render: (t) => t.driver?.name ?? (t.isExternal ? '—' : <span className="text-warning">Chưa gán</span>) },
    { key: 'time', label: 'Dự kiến', render: (t) => `${formatDateTime(t.plannedStartAt)}${t.plannedEndAt ? ` → ${formatTime(t.plannedEndAt)}` : ''}` },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (t) => (
        <span className="flex items-center gap-1.5">
          <StatusBadge meta={TRIP_STATUS} status={t.status} />
          {t.hasWarning ? <AlertTriangle className="size-4 text-warning" aria-label="Cảnh báo lịch" /> : null}
          {t.openIncidentCount ? <span className="text-caption text-danger">{t.openIncidentCount} sự cố</span> : null}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Bảng điều phối"
        subtitle={`Chuyến ngày ${date.split('-').reverse().join('/')} · tự làm mới mỗi 30 giây`}
        actions={
          <>
            <Button variant="secondary" onClick={() => void refetch()}>
              <RefreshCcw /> Làm mới
            </Button>
            <Button variant="secondary" onClick={() => navigate(PATHS.dispatchMap)}>
              <MapPinned /> Bản đồ
            </Button>
            {hasPermission('trip.create') ? (
              <Button onClick={() => navigate(`${PATHS.orders}?view=action`)}>
                <Plus /> Tạo chuyến từ đơn
              </Button>
            ) : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Chuyến trong ngày" value={s?.total ?? '—'} loading={!s} />
        <KpiCard label="Đang chạy" value={s?.running ?? '—'} tone="accent" loading={!s} />
        <KpiCard label="Chưa gán xe/tài xế" value={s?.unassigned ?? '—'} tone={s?.unassigned ? 'warning' : 'neutral'} loading={!s} />
        <KpiCard label="Cảnh báo lịch" value={s?.warnings ?? '—'} tone={s?.warnings ? 'warning' : 'neutral'} to={PATHS.dispatchConflicts} loading={!s} />
        <KpiCard label="Sự cố mở" value={s?.openIncidents ?? '—'} tone={s?.openIncidents ? 'danger' : 'neutral'} to={PATHS.incidents} loading={!s} />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã chuyến, mã đơn"
        selects={[
          { key: 'driver', placeholder: 'Tài xế', value: driverId ?? 'ALL', onChange: (v) => set('driverId', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi tài xế' }, ...(resources?.driverOptions ?? []).filter((d) => d.status === 'ACTIVE').map((d) => ({ value: d.id, label: d.name }))], width: 180 },
          { key: 'vehicle', placeholder: 'Xe', value: vehicleId ?? 'ALL', onChange: (v) => set('vehicleId', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi xe' }, ...(resources?.vehicleOptions ?? []).filter((v) => v.status !== 'INACTIVE').map((v) => ({ value: v.id, label: v.plate }))], width: 150 },
          { key: 'status', placeholder: 'Trạng thái', value: status ?? 'ALL', onChange: (v) => set('status', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi trạng thái' }, ...Object.entries(TRIP_STATUS).map(([value, m]) => ({ value, label: m.label }))], width: 170 },
        ]}
        right={
          <div className="flex items-center gap-2">
            <DateField value={date} onChange={(v) => set('date', v === todayIso() ? null : v)} className="w-40" aria-label="Ngày" />
            <SegmentedControl
              items={[
                { value: 'list', label: 'Danh sách' },
                { value: 'board', label: 'Bảng' },
                { value: 'calendar', label: 'Lịch' },
              ]}
              value={view}
              onChange={(v) => (v === 'calendar' ? navigate(`${PATHS.dispatchCalendar}?date=${date}`) : set('view', v === 'board' ? null : v))}
            />
          </div>
        }
      />
      {error ? (
        <ErrorState title="Không tải được chuyến" error={error} onRetry={() => void refetch()} />
      ) : view === 'list' ? (
        <DataTable columns={columns} rows={rows} rowKey={(t) => t.id} loading={loading && !data} onRowClick={(t) => navigate(paths.trip(t.id))} empty={<EmptyState icon={<Truck strokeWidth={1.5} />} message="Không có chuyến trong ngày" />} />
      ) : loading && !data ? (
        <div className="grid gap-3 lg:grid-cols-5">
          {COLUMNS.map((c) => (
            <div key={c.key} className="flex flex-col gap-2">
              <Skeleton h={20} w="60%" />
              <Skeleton h={96} />
              <Skeleton h={96} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 overflow-x-auto lg:grid-cols-5">
          {COLUMNS.map((c) => {
            const items = rows.filter((t) => c.statuses.includes(t.status as TripStatus));
            return (
              <section key={c.key} className="flex min-w-[220px] flex-col gap-2 rounded-lg bg-surface-muted p-2">
                <h3 className="flex items-center justify-between px-1 text-body-sm font-semibold text-text-muted">
                  {c.label}
                  <span className="rounded bg-surface px-1.5 text-caption">{items.length}</span>
                </h3>
                {items.length ? (
                  items.map((t) => <TripCard key={t.id} t={t} onOpen={() => navigate(paths.trip(t.id))} onAssign={hasPermission('trip.assign') && !t.vehicle && !t.isExternal ? () => navigate(paths.tripEdit(t.id)) : undefined} />)
                ) : (
                  <p className="px-1 py-4 text-center text-caption text-text-subtle">Không có chuyến</p>
                )}
              </section>
            );
          })}
        </div>
      )}
      {rows.some((t) => t.status === 'CANCELLED') ? (
        <p className="text-caption text-text-muted">{rows.filter((t) => t.status === 'CANCELLED').length} chuyến đã hủy trong ngày (xem ở chế độ Danh sách).</p>
      ) : null}
      {(waiting?.orders.nodes ?? []).length ? (
        <section className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-2 flex items-center gap-2 text-heading-sm">
            <CalendarDays className="size-4" /> Đơn cần xử lý / chờ xếp xe
          </h3>
          <ul className="flex flex-col gap-1.5 text-body-sm">
            {waiting!.orders.nodes.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-2">
                <CellLink to={paths.order(o.id)}>{o.code}</CellLink>
                <StatusBadge meta={{ DRAFT: { label: 'Nháp', tone: 'neutral' }, PENDING_CONFIRMATION: { label: 'Chờ xác nhận', tone: 'warning' }, CONFIRMED: { label: 'Đã xác nhận', tone: 'info' }, DISPATCHED: { label: 'Đã xếp xe', tone: 'primary' } }} status={o.status} />
                <span className="text-text-muted">{o.customer.name} · {o.routeSummary}</span>
                <span className="text-text-subtle">{formatVnd(o.totalAmount)}</span>
                {hasPermission('trip.create') && (o.status === 'CONFIRMED' || o.status === 'DISPATCHED') ? (
                  <Button size="sm" variant="ghost" onClick={() => navigate(paths.orderTripNew(o.id))}>
                    Tạo chuyến
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function TripCard({ t, onOpen, onAssign }: { t: Row; onOpen: () => void; onAssign?: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className={`flex cursor-pointer flex-col gap-1 rounded-md border bg-surface p-2.5 text-body-sm hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${t.hasWarning ? 'border-warning' : 'border-border'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-medium">{t.code}</span>
        <StatusBadge meta={TRIP_STATUS} status={t.status} />
      </div>
      <span className="line-clamp-2 text-text-muted">{t.routeSummary ?? t.order.customerName}</span>
      <span className="text-caption text-text-subtle">
        {t.order.code} · {formatTime(t.plannedStartAt)}
        {t.plannedEndAt ? `–${formatTime(t.plannedEndAt)}` : ''}
      </span>
      <span className="flex flex-wrap items-center gap-x-2 text-caption">
        <span className={t.vehicle || t.isExternal ? '' : 'text-warning'}>{t.vehicle?.plate ?? (t.isExternal ? 'Xe ngoài' : 'Chưa gán xe')}</span>
        <span className={t.driver || t.isExternal ? '' : 'text-warning'}>{t.driver?.name ?? (t.isExternal ? '' : 'Chưa gán tài xế')}</span>
      </span>
      {t.hasWarning ? (
        <span className="flex items-center gap-1 text-caption text-warning">
          <AlertTriangle className="size-3" /> Trùng/gần trùng lịch
        </span>
      ) : null}
      {t.openIncidentCount ? <span className="text-caption text-danger">{t.openIncidentCount} sự cố mở</span> : null}
      {t.lastLocation?.isStale && !['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(t.status) ? <span className="text-caption text-text-subtle">GPS cũ</span> : null}
      {onAssign ? (
        <Button
          size="sm"
          variant="secondary"
          className="mt-1"
          onClick={(e) => {
            e.stopPropagation();
            onAssign();
          }}
        >
          Gán xe / tài xế
        </Button>
      ) : null}
    </div>
  );
}
