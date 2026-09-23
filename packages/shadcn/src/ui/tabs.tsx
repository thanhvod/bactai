import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../lib/utils';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  count?: number | null;
  disabled?: boolean;
}

export const TabsRoot = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  items: TabItem[];
  children?: React.ReactNode;
}

/** Tabs underline; tràn → cuộn ngang. Detail page dùng ?tab= (xử lý ở page). */
export function Tabs({ items, children, className, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root className={cn('flex flex-col gap-4', className)} {...props}>
      <TabsPrimitive.List className="flex gap-1 overflow-x-auto border-b border-border scrollbar-thin">
        {items.map((t) => (
          <TabsPrimitive.Trigger
            key={t.value}
            value={t.value}
            disabled={t.disabled}
            className="-mb-px flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-3 text-body text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-primary disabled:opacity-50"
          >
            {t.label}
            {t.count !== undefined && t.count !== null ? (
              <span className="rounded-full bg-neutral-soft px-1.5 text-caption text-text-muted">{t.count}</span>
            ) : null}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}
