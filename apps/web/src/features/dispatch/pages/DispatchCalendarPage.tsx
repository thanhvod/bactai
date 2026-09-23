import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Button, DateField, EmptyState, ErrorState, IconButton, PageHeader, SegmentedControl, Skeleton, Tooltip } from '@bta/shadcn';
import { TRIP_STATUS, formatDateTime, formatTime, labelOf } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { DspSchedulesQuery } from '@/gql/graphql';
import { addDaysIso, todayIso } from '@/features/orders/components/common';
import { SchedulesQuery } from '../graphql/dispatch';

type ScheduleRow = DspSchedulesQuery['vehicleSchedules'][number];

const TONE_BG: Record<string, string> = {
  SCHEDULED: 'bg-surface-muted border-border-strong text-text',
  TO_PICKUP: 'bg-info/10 border-info text-info',
  PICKING_UP: 'bg-info/10 border-info text-info',
  IN_TRANSIT: 'bg-accent/10 border-accent text-accent',
  PAUSED: 'bg-warning/10 border-warning text-warning',
  DELIVERING: 'bg-primary/10 border-primary text-primary',
  COMPLETED: 'bg-success/10 border-success text-success',
  CANCELLED: 'bg-danger/5 border-danger text-danger line-through',
};

/** WM-DISPATCH-02 — Lịch xe / tài xế: timeline theo tài nguyên, khối trùng lịch viền cảnh báo (không chặn). */
export default function DispatchCalendarPage() {
  return (
    <RequirePermission permission="order.view">
      <DispatchCalendar />
    </RequirePermission>
  );
}

function DispatchCalendar() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const date = params.get('date') ?? todayIso();
  const days = Number(params.get('days') ?? '1');
  const resource = params.get('resource') ?? 'vehicle';
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  const { data, loading, error, refetch } = useQuery(SchedulesQuery, { variables: { date, days }, pollInterval: 60_000 });
  const rows = (resource === 'vehicle' ? data?.vehicleSchedules : data?.driverSchedules) ?? [];
  const rangeStart = new Date(`${date}T00:00:00`).getTime();
  const rangeEnd = rangeStart + days * 86_400_000;
  const hours = days === 1 ? Array.from({ length: 13 }, (_, i) => i * 2) : [];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Lịch xe / tài xế"
        subtitle="Phát hiện trùng / gần trùng lịch — cảnh báo mềm, không chặn điều phối"
        actions={
          <Button variant="secondary" onClick={() => navigate(`${PATHS.dispatch}?date=${date}`)}>
            <List /> Bảng điều phối
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <IconButton label="Ngày trước" variant="secondary" onClick={() => set('date', addDaysIso(date, -days))}>
          <ChevronLeft />
        </IconButton>
        <DateField value={date} onChange={(v) => set('date', v)} className="w-40" aria-label="Ngày" />
        <IconButton label="Ngày sau" variant="secondary" onClick={() => set('date', addDaysIso(date, days))}>
          <ChevronRight />
        </IconButton>
        <Button variant="ghost" onClick={() => set('date', null)}>
          Hôm nay
        </Button>
        <SegmentedControl items={[{ value: '1', label: '1 ngày' }, { value: '3', label: '3 ngày' }, { value: '7', label: '7 ngày' }]} value={String(days)} onChange={(v) => set('days', v === '1' ? null : v)} />
        <SegmentedControl items={[{ value: 'vehicle', label: 'Theo xe' }, { value: 'driver', label: 'Theo tài xế' }]} value={resource} onChange={(v) => set('resource', v === 'vehicle' ? null : v)} className="ml-auto" />
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : loading && !data ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} h={44} />
          ))}
        </div>
      ) : !rows.length ? (
        <EmptyState message={resource === 'vehicle' ? 'Chưa có xe' : 'Chưa có tài xế'} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <div className="min-w-[900px]">
            <div className="flex border-b border-border bg-surface-muted text-caption text-text-muted">
              <div className="w-52 shrink-0 px-3 py-2 font-medium">{resource === 'vehicle' ? 'Xe' : 'Tài xế'}</div>
              <div className="relative h-8 flex-1">
                {days === 1
                  ? hours.map((h) => (
                      <span key={h} className="absolute top-2 -translate-x-1/2" style={{ left: `${(h / 24) * 100}%` }}>
                        {String(h).padStart(2, '0')}:00
                      </span>
                    ))
                  : Array.from({ length: days }, (_, i) => (
                      <span key={i} className="absolute top-2 pl-1" style={{ left: `${(i / days) * 100}%` }}>
                        {addDaysIso(date, i).split('-').reverse().slice(0, 2).join('/')}
                      </span>
                    ))}
              </div>
            </div>
            {rows.map((r) => (
              <ResourceRow key={r.resource.id} row={r} rangeStart={rangeStart} rangeEnd={rangeEnd} onOpen={(id) => navigate(paths.trip(id))} />
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3 text-caption text-text-muted">
        {Object.entries(TRIP_STATUS).map(([k, m]) => (
          <span key={k} className="flex items-center gap-1">
            <span className={`inline-block size-3 rounded border ${TONE_BG[k]}`} /> {m.label}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded border-2 border-dashed border-warning" /> Trùng / gần trùng lịch
        </span>
      </div>
    </div>
  );
}

function ResourceRow({ row, rangeStart, rangeEnd, onOpen }: { row: ScheduleRow; rangeStart: number; rangeEnd: number; onOpen: (tripId: string) => void }) {
  const span = rangeEnd - rangeStart;
  const blocks = row.blocks.filter((b) => new Date(b.end).getTime() > rangeStart && new Date(b.start).getTime() < rangeEnd);
  const inactive = row.resource.status === 'INACTIVE' || row.resource.status === 'MAINTENANCE';
  return (
    <div className="flex border-b border-border last:border-0">
      <div className={`w-52 shrink-0 px-3 py-2 ${inactive ? 'opacity-60' : ''}`}>
        <div className="text-body-sm font-medium">{row.resource.label}</div>
        <div className="text-caption text-text-subtle">{[row.resource.sublabel, row.resource.status === 'MAINTENANCE' ? 'Bảo dưỡng' : row.resource.status === 'INACTIVE' ? 'Ngừng' : null].filter(Boolean).join(' · ')}</div>
      </div>
      <div className="relative h-14 flex-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_calc(100%/12-1px),rgb(var(--border)/0.6)_calc(100%/12-1px),rgb(var(--border)/0.6)_calc(100%/12))]">
        {blocks.map((b) => {
          const s = Math.max(new Date(b.start).getTime(), rangeStart);
          const e = Math.min(new Date(b.end).getTime(), rangeEnd);
          const left = ((s - rangeStart) / span) * 100;
          const width = Math.max(((e - s) / span) * 100, 1.2);
          return (
            <Tooltip
              key={b.tripId}
              content={
                <span className="flex flex-col">
                  <span>
                    {b.code} · {labelOf(TRIP_STATUS, b.status)}
                  </span>
                  <span>
                    {formatDateTime(b.start)} → {formatTime(b.end)}
                  </span>
                  {b.routeSummary ? <span>{b.routeSummary}</span> : null}
                  {b.counterpartLabel ? <span>{b.counterpartLabel}</span> : null}
                  {b.warning ? <span>Trùng / gần trùng lịch</span> : null}
                </span>
              }
            >
              <button
                type="button"
                onClick={() => onOpen(b.tripId)}
                className={`absolute top-2 flex h-10 flex-col justify-center overflow-hidden rounded border px-1.5 text-left text-caption ${TONE_BG[b.status] ?? ''} ${b.warning ? 'border-2 border-dashed !border-warning' : ''}`}
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <span className="truncate font-medium">{b.code}</span>
                <span className="truncate opacity-80">{b.counterpartLabel ?? b.orderCode}</span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
