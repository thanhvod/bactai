import * as React from 'react';
import type { Tone } from '@bta/shared';
import { cn } from '../lib/utils';

export interface SummaryItem {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: Tone;
  hint?: React.ReactNode;
}

const toneText: Record<Tone, string> = { neutral: 'text-text', info: 'text-info', primary: 'text-primary', accent: 'text-accent', success: 'text-success', warning: 'text-warning', danger: 'text-danger' };

/** Dải tiền/trạng thái dưới EntityHeader. */
export function SummaryStrip({ items, className }: { items: SummaryItem[]; className?: string }) {
  return (
    <div className={cn('flex flex-wrap divide-x divide-border rounded-lg border border-border bg-surface', className)}>
      {items.map((it, i) => (
        <div key={i} className="flex min-w-[140px] flex-1 flex-col px-4 py-2.5">
          <span className="text-caption text-text-subtle">{it.label}</span>
          <span className={cn('text-heading-sm tabular-nums', toneText[it.tone ?? 'neutral'])}>{it.value}</span>
          {it.hint ? <span className="text-caption text-text-subtle">{it.hint}</span> : null}
        </div>
      ))}
    </div>
  );
}
