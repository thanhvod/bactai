import { cn } from '@bta/shadcn';
import { formatVnd } from '@bta/shared';

/** Hạn mức + thanh % đã dùng (≥80% warning, >100% danger) — WM-CUS-01. */
export function CreditUsage({ limit, pct }: { limit?: number | null; pct?: number | null }) {
  if (!limit) return <span className="text-text-subtle">Không giới hạn</span>;
  const p = pct ?? 0;
  const tone = p > 100 ? 'bg-danger' : p >= 80 ? 'bg-warning' : 'bg-primary';
  return (
    <div className="flex min-w-[120px] flex-col items-end gap-1">
      <span className="tabular-nums">{formatVnd(limit)}</span>
      <div className="flex w-full items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
          <div className={cn('h-full rounded-full', tone)} style={{ width: `${Math.min(p, 100)}%` }} />
        </div>
        <span className={cn('text-caption tabular-nums', p > 100 ? 'text-danger' : p >= 80 ? 'text-warning' : 'text-text-muted')}>{p}%</span>
      </div>
    </div>
  );
}
