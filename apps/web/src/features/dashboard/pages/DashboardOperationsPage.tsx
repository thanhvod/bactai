import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { AlertTriangle, MapPinned, RefreshCcw } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, KpiCard, LocationList, MapView, PageHeader, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { TRIP_STATUS, TRIP_STATUS_FLOW, formatDateTime, formatTime, labelOf } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { DspOpsDashboardQuery } from '@/gql/graphql';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { LastLocationsQuery, ResourceOptionsQuery, ScheduleWarningsQuery, OpsDashboardQuery } from '@/features/dispatch/graphql/dispatch';
import { ago, formatMinutes, useNow } from '@/features/orders/components/common';

type TripRow = DspOpsDashboardQuery['dashboardSummary']['todayTripList'][number];

/** WM-DASH-02 — Dashboard vận hành: chuyến theo trạng thái, xe/tài xế, cảnh báo lịch, vị trí (polling 60s). */
export default function DashboardOperationsPage() {
  return (
    <RequirePermission permission="order.view">
      <OpsDashboard />
    </RequirePermission>
  );
}

function OpsDashboard() {
  const navigate = useNavigate();
  const now = useNow(30_000);
  const { data, loading, error, refetch } = useQuery(OpsDashboardQuery, { pollInterval: 60_000 });
  const { data: locs } = useQuery(LastLocationsQuery, { variables: { running: true }, pollInterval: 60_000 });
  const { data: warnings } = useQuery(ScheduleWarningsQuery, { variables: { filter: { resolved: false }, first: 5 }, pollInterval: 60_000 });
  const { data: res } = useQuery(ResourceOptionsQuery, { pollInterval: 60_000 });
  const [updatedAt, setUpdatedAt] = React.useState(Date.now());
  React.useEffect(() => {
    if (data) setUpdatedAt(Date.now());
  }, [data]);

  if (error) return <ErrorState title="Không tải được dashboard vận hành" error={error} onRetry={() => void refetch()} />;
  const d = data?.dashboardSummary;
  const counts = new Map((d?.tripCountsByStatus ?? []).map((c) => [c.status, c.count]));
  const vehicles = res?.vehicleOptions ?? [];
  const drivers = res?.driverOptions ?? [];
  const busyVeh = vehicles.filter((v) => v.busy).length;
  const busyDrv = drivers.filter((v) => v.busy).length;

  const cols: DataTableColumn<TripRow>[] = [
    { key: 'code', label: 'Chuyến', render: (t) => <CellLink to={paths.trip(t.id)}>{t.code}</CellLink> },
    { key: 'order', label: 'Đơn', render: (t) => <CellLink to={paths.order(t.orderId)}>{t.orderCode}</CellLink> },
    { key: 'route', label: 'Tuyến', render: (t) => <span className="line-clamp-1 max-w-[240px] text-body-sm">{t.routeSummary ?? '—'}</span> },
    { key: 'veh', label: 'Xe · tài xế', render: (t) => [t.vehiclePlate, t.driverName].filter(Boolean).join(' · ') || <span className="text-warning">Chưa gán</span> },
    { key: 'time', label: 'Giờ', render: (t) => `${formatTime(t.plannedStartAt)}${t.plannedEndAt ? `–${formatTime(t.plannedEndAt)}` : ''}` },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (t) => (
        <span className="flex items-center gap-1.5">
          <StatusBadge meta={TRIP_STATUS} status={t.status} />
          {t.hasWarning ? <AlertTriangle className="size-4 text-warning" aria-label="Cảnh báo lịch" /> : null}
          {t.openIncident ? <span className="text-caption text-danger">Sự cố</span> : null}
        </span>
      ),
    },
    { key: 'gps', label: 'GPS', hideBelow: 'lg', render: (t) => (t.lastLocationAt ? <span className={now - new Date(t.lastLocationAt).getTime() > 30 * 60_000 ? 'text-text-subtle' : ''}>{ago(t.lastLocationAt, now)}</span> : '—') },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Dashboard vận hành"
        subtitle={`Cập nhật ${ago(new Date(updatedAt).toISOString(), now)} · tự làm mới mỗi 60 giây`}
        actions={
          <>
            <Button variant="secondary" onClick={() => void refetch()}>
              <RefreshCcw /> Làm mới
            </Button>
            <Button variant="secondary" onClick={() => navigate(PATHS.dispatchMap)}>
              <MapPinned /> Bản đồ
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard label="Chuyến hôm nay" value={d?.todayTrips ?? '—'} loading={loading && !d} to={PATHS.dispatch} />
        <KpiCard label="Đang chạy" value={d?.runningTrips ?? '—'} tone="accent" loading={loading && !d} to={`${PATHS.dispatch}?view=list`} />
        <KpiCard label="Đơn chưa xếp xe" value={d?.unassignedOrders ?? '—'} tone={d?.unassignedOrders ? 'warning' : 'neutral'} loading={loading && !d} to={`${PATHS.orders}?view=action`} />
        <KpiCard label="Cảnh báo lịch" value={d?.scheduleWarnings ?? '—'} tone={d?.scheduleWarnings ? 'warning' : 'neutral'} loading={loading && !d} to={PATHS.dispatchConflicts} />
        <KpiCard label="Sự cố mở" value={d?.openIncidents ?? '—'} tone={d?.openIncidents ? 'danger' : 'neutral'} loading={loading && !d} to={PATHS.incidents} />
        <KpiCard label="Xe · tài xế đang chạy" value={`${busyVeh} · ${busyDrv}`} sub={`${vehicles.filter((v) => v.status === 'ACTIVE').length} xe sẵn sàng · ${drivers.filter((x) => x.status === 'ACTIVE').length} tài xế`} />
      </div>
      <Panel title="Chuyến theo trạng thái">
        <div className="flex flex-wrap gap-2">
          {[...TRIP_STATUS_FLOW.slice(0, 5), 'PAUSED' as const, 'COMPLETED' as const, 'CANCELLED' as const].filter((s, i, a) => a.indexOf(s) === i).map((s) => (
            <button key={s} type="button" onClick={() => navigate(`${PATHS.dispatch}?view=list&status=${s}`)} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:bg-surface-muted">
              <StatusBadge meta={TRIP_STATUS} status={s} />
              <span className="font-mono text-heading-sm tabular-nums">{counts.get(s) ?? 0}</span>
            </button>
          ))}
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Chuyến hôm nay" className="lg:col-span-2" actions={<CellLink to={PATHS.dispatch}>Bảng điều phối</CellLink>}>
          <DataTable columns={cols} rows={d?.todayTripList ?? []} rowKey={(t) => t.id} compact loading={loading && !d} onRowClick={(t) => navigate(paths.trip(t.id))} empty={<EmptyState compact message="Hôm nay chưa có chuyến" />} />
        </Panel>
        <div className="flex flex-col gap-4">
          <Panel title="Cảnh báo lịch mới" actions={<CellLink to={PATHS.dispatchConflicts}>Tất cả</CellLink>}>
            {(warnings?.scheduleWarnings.nodes ?? []).length ? (
              <ul className="flex flex-col gap-2 text-body-sm">
                {warnings!.scheduleWarnings.nodes.map((w) => (
                  <li key={w.id} className="flex flex-col">
                    <span>
                      <span className={w.type === 'OVERLAP' ? 'text-danger' : 'text-warning'}>{w.type === 'OVERLAP' ? 'Trùng' : 'Gần trùng'}</span> · {w.subject === 'VEHICLE' ? 'Xe' : 'Tài xế'} {w.subjectLabel}
                    </span>
                    <span className="text-caption text-text-muted">
                      <CellLink to={paths.trip(w.trip.id)}>{w.trip.code}</CellLink> ↔ {w.conflictTrip ? <CellLink to={paths.trip(w.conflictTrip.id)}>{w.conflictTrip.code}</CellLink> : '—'} · {w.type === 'OVERLAP' ? 'chồng giờ' : `cách ${formatMinutes(w.gapMinutes)}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-text-muted">Không có cảnh báo đang mở</p>
            )}
          </Panel>
          <Panel title="Xe đang chạy" actions={<CellLink to={PATHS.dispatchMap}>Bản đồ</CellLink>}>
            {(locs?.lastKnownLocations ?? []).length ? (
              <>
                <MapView height={200} pins={(locs?.lastKnownLocations ?? []).map((l) => ({ id: l.tripId, lat: l.lat, lng: l.lng, label: `${l.vehiclePlate ?? l.tripCode} · ${labelOf(TRIP_STATUS, l.tripStatus)}`, status: l.isStale ? 'neutral' : 'primary', onClick: () => navigate(paths.trip(l.tripId)) }))} />
                <LocationList
                  className="mt-2"
                  items={(locs?.lastKnownLocations ?? []).slice(0, 6).map((l) => ({
                    id: l.tripId,
                    title: `${l.vehiclePlate ?? l.tripCode} · ${l.driverName ?? ''}`,
                    subtitle: `${l.tripCode} · ${labelOf(TRIP_STATUS, l.tripStatus)}`,
                    at: l.isStale ? `GPS cũ · ${formatDateTime(l.capturedAt)}` : ago(l.capturedAt, now),
                    stale: l.isStale,
                    onClick: () => navigate(paths.trip(l.tripId)),
                  }))}
                />
              </>
            ) : (
              <p className="text-body-sm text-text-muted">Chưa có xe gửi vị trí</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
