import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { Drawer, EmptyState, ErrorState, FilterChip, Skeleton, Timeline, type TimelineEntry as UiEntry } from '@bta/shadcn';
import { ACTIVITY_CATEGORY, ENTITY_TYPE, labelOf, type Tone } from '@bta/shared';
import { ActivityTimelineQuery } from './graphql';
import { useQueryParam } from './useQueryParam';

const CATEGORY_TONE: Record<string, Tone> = {
  CREATE: 'primary',
  UPDATE: 'info',
  STATUS: 'accent',
  MONEY: 'warning',
  ATTACHMENT: 'neutral',
  NOTE: 'neutral',
  SENSITIVE: 'danger',
  ASSIGNMENT: 'info',
};

const FILTERS: { key: string; label: string; categories: string[] }[] = [
  { key: 'all', label: 'Tất cả', categories: [] },
  { key: 'status', label: 'Trạng thái', categories: ['STATUS'] },
  { key: 'money', label: 'Tiền', categories: ['MONEY'] },
  { key: 'attachment', label: 'Chứng từ', categories: ['ATTACHMENT'] },
  { key: 'note', label: 'Ghi chú / cập nhật', categories: ['NOTE', 'UPDATE', 'CREATE', 'ASSIGNMENT'] },
  { key: 'sensitive', label: 'Nhạy cảm', categories: ['SENSITIVE'] },
];

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

export interface TimelineEntity {
  type: keyof typeof ENTITY_TYPE | string;
  id: string;
  label?: string;
}

/** Danh sách timeline (dùng trong tab hoặc drawer). */
export function EntityTimeline({ entity, includeChildren = true, compact }: { entity: TimelineEntity; includeChildren?: boolean; compact?: boolean }) {
  const [filter, setFilter] = React.useState('all');
  const categories = FILTERS.find((f) => f.key === filter)?.categories ?? [];
  const { data, loading, error, refetch } = useQuery(ActivityTimelineQuery, {
    variables: { entity: { type: entity.type, id: entity.id }, filter: { categories: categories.length ? categories : null, includeChildren } },
    fetchPolicy: 'cache-and-network',
  });
  const entries: UiEntry[] = (data?.activityTimeline ?? []).map((e) => {
    const child = e.entityType !== entity.type || e.entityId !== entity.id;
    return {
      id: e.id,
      time: e.createdAt,
      actor: e.actorName ?? (e.actorType === 'SYSTEM' ? 'Hệ thống' : e.actorType),
      action: (
        <span>
          {child ? <span className="mr-1 text-text-subtle">[{labelOf(Object.fromEntries(Object.entries(ENTITY_TYPE).map(([k, v]) => [k, { label: v, tone: 'neutral' as Tone }])), e.entityType)}]</span> : null}
          {e.summary}
        </span>
      ),
      reason: e.reason ?? undefined,
      tone: e.sensitive ? 'danger' : CATEGORY_TONE[e.category] ?? 'neutral',
      category: ACTIVITY_CATEGORY[e.category as keyof typeof ACTIVITY_CATEGORY] ?? e.category,
      before: e.kind === 'ACTIVITY' ? asRecord(e.before) : null,
      after: e.kind === 'ACTIVITY' ? asRecord(e.after) : null,
    };
  });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <FilterChip key={f.key} label={f.label} active={filter === f.key} onClick={() => setFilter(f.key)} />
        ))}
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : loading && !data ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} h={compact ? 28 : 40} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState compact message="Chưa có hoạt động" />
      ) : (
        <Timeline entries={entries} />
      )}
    </div>
  );
}

/** WM-SHELL-07 — Timeline drawer, mở bằng query param `?timeline=1`. */
export function TimelineDrawer({ entity, title }: { entity: TimelineEntity; title?: React.ReactNode }) {
  const [open, setOpen] = useQueryParam('timeline');
  return (
    <Drawer open={open === '1'} onOpenChange={(o) => setOpen(o ? '1' : null)} title={title ?? 'Lịch sử hoạt động'} description={entity.label} width={560}>
      {open === '1' ? <EntityTimeline entity={entity} /> : null}
    </Drawer>
  );
}

/** Mở timeline drawer từ nút. */
export function useTimelineDrawer() {
  const [, setOpen] = useQueryParam('timeline');
  return () => setOpen('1');
}
