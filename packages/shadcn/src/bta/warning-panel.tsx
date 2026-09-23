import * as React from 'react';
import { AlertTriangle, Info, Lock, WifiOff, XCircle, CheckCircle2, X } from 'lucide-react';
import type { Tone } from '@bta/shared';
import { cn } from '../lib/utils';

export interface WarningPanelProps {
  title: React.ReactNode;
  items?: React.ReactNode[];
  action?: React.ReactNode;
  tone?: 'warning' | 'danger' | 'info';
  className?: string;
}

/** Cảnh báo mềm (trùng lịch, vượt hạn mức, COD quá hạn) — cho tiếp tục. */
export function WarningPanel({ title, items, action, tone = 'warning', className }: WarningPanelProps) {
  const cls = tone === 'danger' ? 'border-danger/40 bg-danger-soft text-danger' : tone === 'info' ? 'border-info/40 bg-info-soft text-info' : 'border-warning/40 bg-warning-soft text-warning';
  return (
    <div role="status" className={cn('flex items-start gap-3 rounded-lg border px-3 py-2.5', cls, className)}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-body-strong">{title}</p>
        {items?.length ? (
          <ul className="mt-1 list-disc pl-5 text-body-sm text-text">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export interface BannerProps {
  tone?: Tone | 'offline';
  message: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

/** Banner: đã chốt snapshot (primary + khóa), offline, GPS tắt, lỗi tải. */
export function Banner({ tone = 'info', message, action, onDismiss, icon, className }: BannerProps) {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    neutral: { cls: 'border-border bg-surface-muted text-text', icon: <Info /> },
    info: { cls: 'border-info/40 bg-info-soft text-info', icon: <Info /> },
    primary: { cls: 'border-primary/40 bg-primary-soft text-primary', icon: <Lock /> },
    accent: { cls: 'border-accent/40 bg-accent-soft text-accent', icon: <Info /> },
    success: { cls: 'border-success/40 bg-success-soft text-success', icon: <CheckCircle2 /> },
    warning: { cls: 'border-warning/40 bg-warning-soft text-warning', icon: <AlertTriangle /> },
    danger: { cls: 'border-danger/40 bg-danger-soft text-danger', icon: <XCircle /> },
    offline: { cls: 'border-warning/40 bg-warning-soft text-warning', icon: <WifiOff /> },
  };
  const m = map[tone];
  return (
    <div role="status" className={cn('flex items-center gap-2 rounded-md border px-3 py-2 text-body-sm [&_svg]:size-4', m.cls, className)}>
      <span className="shrink-0">{icon ?? m.icon}</span>
      <span className="min-w-0 flex-1 text-text">{message}</span>
      {action}
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Đóng" className="rounded-sm p-0.5 hover:bg-surface/60">
          <X />
        </button>
      ) : null}
    </div>
  );
}
