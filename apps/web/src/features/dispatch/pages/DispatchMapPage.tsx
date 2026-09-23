import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { RefreshCcw } from 'lucide-react';
import { Button, EmptyState, ErrorState, LocationList, MapView, PageHeader, SegmentedControl, Skeleton, StatusBadge } from '@bta/shadcn';
import { TRIP_STATUS, formatDateTime } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { paths } from '@/app/routes';
import { ago, useNow } from '@/features/orders/components/common';
import { LastLocationsQuery } from '../graphql/dispatch';

/** WM-DISPATCH-04 — Theo dõi vị trí: last known location chuyến đang chạy (polling 30s), GPS cũ hiện xám. */
export default function DispatchMapPage() {
  return (
    <RequirePermission permission="order.view">
      <DispatchMap />
    </RequirePermission>
  );
}

function DispatchMap() {
  const navigate = useNavigate();
  const now = useNow(30_000);
  const [filter, setFilter] = React.useState<'all' | 'stale'>('all');
  const { data, loading, error, refetch } = useQuery(LastLocationsQuery, { variables: { running: true }, pollInterval: 30_000 });
  const all = data?.lastKnownLocations ?? [];
  const items = filter === 'stale' ? all.filter((l) => l.isStale) : all;
  const [selected, setSelected] = React.useState<string | null>(null);
  const sel = items.find((l) => l.tripId === selected);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Theo dõi vị trí"
        subtitle="Vị trí gần nhất của chuyến đang chạy từ app tài xế · tự làm mới 30 giây"
        actions={
          <Button variant="secondary" onClick={() => void refetch()}>
            <RefreshCcw /> Làm mới
          </Button>
        }
      />
      <SegmentedControl items={[{ value: 'all', label: 'Tất cả', count: all.length }, { value: 'stale', label: 'GPS cũ > 15 phút', count: all.filter((l) => l.isStale).length }]} value={filter} onChange={(v) => setFilter(v as 'all' | 'stale')} />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : loading && !data ? (
        <Skeleton h={520} />
      ) : !items.length ? (
        <EmptyState message="Không có chuyến đang chạy có vị trí" description="Vị trí xuất hiện khi tài xế bắt đầu chuyến trên app (GPS tự gửi 15–30 giây/lần)." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <MapView
            height={560}
            center={sel ? [sel.lat, sel.lng] : undefined}
            zoom={sel ? 13 : 9}
            pins={items.map((l) => ({
              id: l.tripId,
              lat: l.lat,
              lng: l.lng,
              label: `${l.vehiclePlate ?? l.tripCode} · ${l.driverName ?? ''} · ${formatDateTime(l.capturedAt)}`,
              status: l.isStale ? 'neutral' : l.tripStatus === 'PAUSED' ? 'warning' : 'primary',
              onClick: () => setSelected(l.tripId),
            }))}
          />
          <div className="flex max-h-[560px] flex-col gap-2 overflow-y-auto">
            <LocationList
              items={items.map((l) => ({
                id: l.tripId,
                title: (
                  <span className="flex items-center gap-2">
                    <span className="font-mono">{l.vehiclePlate ?? l.tripCode}</span>
                    <StatusBadge meta={TRIP_STATUS} status={l.tripStatus} />
                  </span>
                ),
                subtitle: `${l.tripCode} · ${l.orderCode} · ${l.driverName ?? '—'}${l.driverPhone ? ` · ${l.driverPhone}` : ''}`,
                at: `${formatDateTime(l.capturedAt)} (${ago(l.capturedAt, now)})`,
                stale: l.isStale,
                onClick: () => (selected === l.tripId ? navigate(paths.trip(l.tripId)) : setSelected(l.tripId)),
              }))}
            />
            {sel ? (
              <Button variant="secondary" onClick={() => navigate(`${paths.trip(sel.tripId)}?tab=gps`)}>
                Mở chuyến {sel.tripCode} · lịch sử GPS
              </Button>
            ) : (
              <p className="text-caption text-text-muted">Bấm một xe để phóng to; bấm lần nữa để mở chuyến.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
