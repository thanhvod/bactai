import * as React from 'react';
import { cn } from '../lib/utils';

export interface DescriptionItem {
  label: React.ReactNode;
  value: React.ReactNode;
  span?: 1 | 2 | 3;
}

export function DescriptionList({ items, columns = 2, className }: { items: DescriptionItem[]; columns?: 1 | 2 | 3 | 4; className?: string }) {
  const grid = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4' }[columns];
  return (
    <dl className={cn('grid gap-x-6 gap-y-3', grid, className)}>
      {items.map((it, i) => (
        <div key={i} className={cn('flex flex-col gap-0.5', it.span === 2 && 'sm:col-span-2', it.span === 3 && 'sm:col-span-3')}>
          <dt className="text-caption text-text-muted">{it.label}</dt>
          <dd className="text-body text-text">{it.value ?? <span className="text-text-subtle">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
