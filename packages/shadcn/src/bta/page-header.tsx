import * as React from 'react';
import { Breadcrumb, type BreadcrumbItem } from './breadcrumb';
import { cn } from '../lib/utils';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  /** Primary action bên phải; secondary đưa vào Menu */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        {breadcrumb?.length ? <Breadcrumb items={breadcrumb} /> : null}
        <h1 className="truncate text-display-sm">{title}</h1>
        {subtitle ? <p className="text-body-sm text-text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
