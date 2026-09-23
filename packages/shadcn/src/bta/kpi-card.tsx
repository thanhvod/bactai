import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Tone } from '@bta/shared';
import { LinkContext } from './breadcrumb';
import { cn } from '../lib/utils';

export interface KpiCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: Tone;
  to?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const toneText: Record<Tone, string> = { neutral: 'text-text', info: 'text-info', primary: 'text-primary', accent: 'text-accent', success: 'text-success', warning: 'text-warning', danger: 'text-danger' };

/** Chỉ dùng cho KPI; click → màn chi tiết. Không đổ bóng. */
export function KpiCard({ label, value, sub, tone = 'neutral', to, onClick, icon, className, loading }: KpiCardProps) {
  const Link = React.useContext(LinkContext);
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm text-text-muted">{label}</span>
        {icon ? <span className="text-text-subtle [&_svg]:size-4">{icon}</span> : to || onClick ? <ArrowUpRight className="size-4 text-text-subtle" /> : null}
      </div>
      <div className={cn('mt-1 text-display-sm tabular-nums', toneText[tone], loading && 'animate-pulse text-text-subtle')}>{loading ? '…' : value}</div>
      {sub ? <div className="mt-0.5 text-caption text-text-subtle">{sub}</div> : null}
    </>
  );
  const cls = cn('flex flex-col rounded-lg border border-border bg-surface px-4 py-3 text-left', (to || onClick) && 'transition-colors hover:border-border-strong hover:bg-surface-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className);
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{body}</button>;
  return <div className={cls}>{body}</div>;
}
