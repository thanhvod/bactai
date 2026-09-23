import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, PageHeader, Pagination, StatusBadge, toast, type DataTableColumn } from '@bta/shadcn';
import { SCHEDULE_WARNING_TYPE, TRIP_STATUS, formatDateTime } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { paths } from '@/app/routes';
import type { DspScheduleWarningsQuery } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { CellLink, useCursorPaging } from '@/features/master-data/helpers';
import { formatMinutes } from '@/features/orders/components/common';
import { ResolveWarningMutation, ScheduleWarningsQuery } from '../graphql/dispatch';

type Row = DspScheduleWarningsQuery['scheduleWarnings']['nodes'][number];

/** WM-DISPATCH-03 — Cảnh báo lịch: trùng/gần trùng xe & tài xế, lý do override; đánh dấu đã xử lý. */
export default function DispatchConflictsPage() {
  return (
    <RequirePermission permission="order.view">
      <Conflicts />
    </RequirePermission>
  );
}

function Conflicts() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const resolved = params.get('resolved') === '1';
  const subject = params.get('subject');
  const paging = useCursorPaging();
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  const { data, loading, error, refetch } = useQuery(ScheduleWarningsQuery, { variables: { filter: { resolved, subject: subject || null }, first: paging.first, after: paging.after }, pollInterval: 60_000 });
  const [resolve] = useMutation(ResolveWarningMutation);
  const rows = data?.scheduleWarnings.nodes ?? [];

  const tripCell = (t: Row['trip'] | null | undefined) =>
    t ? (
      <span className="flex flex-col">
        <span className="flex items-center gap-1.5">
          <CellLink to={paths.trip(t.id)}>{t.code}</CellLink>
          <StatusBadge meta={TRIP_STATUS} status={t.status} />
        </span>
        <span className="text-caption text-text-muted">{[t.orderCode, formatDateTime(t.plannedStartAt), t.vehiclePlate, t.driverName].filter(Boolean).join(' · ')}</span>
      </span>
    ) : (
      '—'
    );

  const columns: DataTableColumn<Row>[] = [
    { key: 'type', label: 'Loại', render: (r) => <StatusBadge label={SCHEDULE_WARNING_TYPE[r.type as keyof typeof SCHEDULE_WARNING_TYPE] ?? r.type} tone={r.type === 'OVERLAP' ? 'danger' : 'warning'} /> },
    { key: 'subject', label: 'Đối tượng', render: (r) => `${r.subject === 'VEHICLE' ? 'Xe' : 'Tài xế'} ${r.subjectLabel ?? ''}` },
    { key: 'trip', label: 'Chuyến', render: (r) => tripCell(r.trip) },
    { key: 'conflict', label: 'Trùng với', render: (r) => tripCell(r.conflictTrip) },
    { key: 'gap', label: 'Khoảng cách', render: (r) => (r.type === 'OVERLAP' ? 'Chồng giờ' : `${formatMinutes(r.gapMinutes)} / ngưỡng ${formatMinutes(r.thresholdMinutes)}`) },
    { key: 'override', label: 'Override', render: (r) => (r.overrideReason ? <span className="flex flex-col text-body-sm"><span>{r.overrideReason}</span><span className="text-caption text-text-muted">{r.overriddenByName}</span></span> : <span className="text-text-subtle">—</span>) },
    { key: 'at', label: 'Phát hiện', hideBelow: 'lg', render: (r) => formatDateTime(r.createdAt) },
    {
      key: 'act',
      label: '',
      render: (r) =>
        !r.resolvedAt && hasPermission('trip.assign') ? (
          <span className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={(e) => (e.stopPropagation(), navigate(paths.tripEdit(r.trip.id)))}>
              Sửa chuyến
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await resolve({ variables: { id: r.id } });
                  toast.success('Đã đánh dấu xử lý');
                  void refetch();
                } catch (err) {
                  toast.error('Không cập nhật được', apolloErrorMessage(err));
                }
              }}
            >
              <CheckCircle2 /> Đã xử lý
            </Button>
          </span>
        ) : r.resolvedAt ? (
          <span className="text-caption text-success">Đã xử lý {formatDateTime(r.resolvedAt)}</span>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Cảnh báo lịch" subtitle="Xe/tài xế trùng hoặc gần trùng lịch (ngưỡng theo cài đặt vận hành). Cảnh báo mềm — điều phối vẫn tự quyết." />
      <FilterBar
        chips={
          <>
            <FilterChip label="Đang mở" active={!resolved} onClick={() => set('resolved', null)} />
            <FilterChip label="Đã xử lý" active={resolved} onClick={() => set('resolved', '1')} />
            <FilterChip label="Xe" active={subject === 'VEHICLE'} onClick={() => set('subject', subject === 'VEHICLE' ? null : 'VEHICLE')} />
            <FilterChip label="Tài xế" active={subject === 'DRIVER'} onClick={() => set('subject', subject === 'DRIVER' ? null : 'DRIVER')} />
          </>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading && !data} onRowClick={(r) => navigate(paths.trip(r.trip.id))} empty={<EmptyState icon={<CheckCircle2 strokeWidth={1.5} />} message={resolved ? 'Chưa có cảnh báo đã xử lý' : 'Không có cảnh báo lịch đang mở'} />} />
          <Pagination
            hasNextPage={!!data?.scheduleWarnings.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.scheduleWarnings.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.scheduleWarnings.totalCount}
          />
        </>
      )}
    </div>
  );
}
