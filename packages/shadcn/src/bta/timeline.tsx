import * as React from 'react';
import { formatDateTime, formatVnd, type Tone } from '@bta/shared';
import { cn } from '../lib/utils';

export interface TimelineEntry {
  id?: string;
  time: string | Date;
  actor?: React.ReactNode;
  action: React.ReactNode;
  reason?: React.ReactNode;
  tone?: Tone;
  category?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  children?: React.ReactNode;
}

const dot: Record<Tone, string> = { neutral: 'bg-border-strong', info: 'bg-info', primary: 'bg-primary', accent: 'bg-accent', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' };

/** Timeline hoạt động theo entity — có trên mọi entity quan trọng. */
export function Timeline({ entries, className, emptyText = 'Chưa có hoạt động' }: { entries: TimelineEntry[]; className?: string; emptyText?: string }) {
  if (!entries.length) return <p className="py-6 text-center text-body-sm text-text-muted">{emptyText}</p>;
  return (
    <ol className={cn('relative flex flex-col gap-4 border-l border-border pl-5', className)}>
      {entries.map((e, i) => (
        <li key={e.id ?? i} className="relative">
          <span className={cn('absolute -left-[25px] top-1.5 size-2.5 rounded-full ring-2 ring-surface', dot[e.tone ?? 'neutral'])} aria-hidden />
          <div className="flex flex-wrap items-baseline gap-x-2 text-body-sm">
            <span className="text-text-subtle tabular-nums">{formatDateTime(e.time)}</span>
            {e.actor ? <span className="font-medium text-text">{e.actor}</span> : null}
          </div>
          <div className="text-body text-text">{e.action}</div>
          {e.reason ? <div className="text-body-sm text-text-muted">Lý do: {e.reason}</div> : null}
          {e.before || e.after ? <AuditDiff before={e.before ?? {}} after={e.after ?? {}} className="mt-1" /> : null}
          {e.children}
        </li>
      ))}
    </ol>
  );
}

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'number' && Math.abs(v) >= 1000) return formatVnd(v);
  if (typeof v === 'boolean') return v ? 'Có' : 'Không';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export interface AuditDiffProps {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  /** Nhãn tiếng Việt cho field */
  labels?: Record<string, string>;
  className?: string;
}

/** Diff trước/sau đủ hiểu, không JSON thô. */
export function AuditDiff({ before, after, labels = {}, className }: AuditDiffProps) {
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).filter((k) => fmt(before[k]) !== fmt(after[k]));
  if (!keys.length) return null;
  return (
    <div className={cn('rounded-md border border-border bg-surface-muted p-2 text-body-sm', className)}>
      <table className="w-full">
        <tbody>
          {keys.map((k) => (
            <tr key={k}>
              <td className="pr-3 text-text-muted">{labels[k] ?? k}</td>
              <td className="pr-2 text-danger line-through tabular-nums">{fmt(before[k])}</td>
              <td className="text-success tabular-nums">{fmt(after[k])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
