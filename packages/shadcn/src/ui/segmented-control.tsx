import * as React from 'react';
import { cn } from '../lib/utils';

export interface SegmentedItem {
  value: string;
  label: React.ReactNode;
  count?: number | null;
}

export interface SegmentedControlProps {
  items: SegmentedItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl({ items, value, onChange, className, size = 'md' }: SegmentedControlProps) {
  return (
    <div role="tablist" className={cn('inline-flex rounded-md border border-border-control bg-surface p-0.5', className)}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-sm px-3 text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              size === 'sm' ? 'h-6 text-body-sm' : 'h-7',
              active ? 'bg-primary-soft font-semibold text-primary' : 'text-text-muted hover:bg-surface-muted hover:text-text',
            )}
          >
            {it.label}
            {it.count !== undefined && it.count !== null ? <span className="text-caption">{it.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
