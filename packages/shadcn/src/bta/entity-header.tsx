import * as React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Menu, type MenuItemDef } from '../ui/menu';
import { IconButton } from '../ui/icon-button';
import { cn } from '../lib/utils';

export interface EntityHeaderProps {
  code: React.ReactNode;
  title?: React.ReactNode;
  status?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Chip metadata nhỏ: khách, xe, ngày... */
  metrics?: { label: React.ReactNode; value: React.ReactNode }[];
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  menu?: MenuItemDef[];
  className?: string;
}

/** Header của detail page. */
export function EntityHeader({ code, title, status, subtitle, metrics, primaryAction, secondaryActions, menu, className }: EntityHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-heading-lg tabular-nums">{code}</span>
          {title ? <span className="text-heading-lg">{title}</span> : null}
          {status}
        </div>
        {subtitle ? <p className="text-body-sm text-text-muted">{subtitle}</p> : null}
        {metrics?.length ? (
          <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-body-sm">
            {metrics.map((m, i) => (
              <div key={i} className="flex gap-1">
                <dt className="text-text-subtle">{m.label}:</dt>
                <dd className="text-text">{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {secondaryActions}
        {primaryAction}
        {menu?.length ? (
          <Menu
            trigger={
              <IconButton label="Thêm thao tác" variant="secondary" tooltip={false}>
                <MoreHorizontal />
              </IconButton>
            }
            items={menu}
          />
        ) : null}
      </div>
    </div>
  );
}
