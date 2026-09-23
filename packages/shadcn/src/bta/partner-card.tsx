import * as React from 'react';
import { cn } from '../lib/utils';
import { initials } from '../lib/utils';

export interface PartnerCardProps {
  name: React.ReactNode;
  code?: string | null;
  lines?: React.ReactNode[];
  onClick?: () => void;
  className?: string;
  avatarText?: string;
}

/** Thẻ khách hàng / NCC / tài xế trong detail & picker. */
export function PartnerCard({ name, code, lines, onClick, className, avatarText }: PartnerCardProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn('flex w-full items-start gap-3 rounded-lg border border-border bg-surface p-3 text-left', onClick && 'hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-body-strong text-primary">{avatarText ?? initials(typeof name === 'string' ? name : '')}</span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body-strong">{name}</span>
        {code ? <span className="font-mono text-caption text-text-subtle">{code}</span> : null}
        {lines?.map((l, i) => (
          <span key={i} className="truncate text-body-sm text-text-muted">
            {l}
          </span>
        ))}
      </span>
    </Comp>
  );
}
