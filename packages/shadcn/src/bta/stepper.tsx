import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export interface StepDef {
  key: string;
  label: React.ReactNode;
  description?: React.ReactNode;
}

/** Stepper ngang (ImportWizard: Upload → Map cột → Kiểm tra lỗi → Xác nhận) hoặc dọc (trạng thái). */
export function Stepper({ steps, active, orientation = 'horizontal', className }: { steps: StepDef[]; active: number; orientation?: 'horizontal' | 'vertical'; className?: string }) {
  return (
    <ol className={cn('flex', orientation === 'horizontal' ? 'flex-row items-start gap-2' : 'flex-col gap-3', className)}>
      {steps.map((s, i) => {
        const done = i < active;
        const cur = i === active;
        return (
          <li key={s.key} className={cn('flex items-start gap-2', orientation === 'horizontal' && 'flex-1')}>
            <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border text-caption', done ? 'border-primary bg-primary text-primary-foreground' : cur ? 'border-primary text-primary' : 'border-border-control text-text-subtle')}>
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className={cn('text-body-sm', cur ? 'font-semibold text-text' : done ? 'text-text' : 'text-text-muted')}>{s.label}</span>
              {s.description ? <span className="text-caption text-text-subtle">{s.description}</span> : null}
            </span>
            {orientation === 'horizontal' && i < steps.length - 1 ? <span className={cn('mt-3 h-px flex-1', done ? 'bg-primary' : 'bg-border')} aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}

/** Stepper trạng thái (StatusStepper) — dọc, cho Trip/Stop detail. */
export function StatusStepper({ steps, current, className }: { steps: { key: string; label: React.ReactNode; at?: React.ReactNode }[]; current: string; className?: string }) {
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <ol className={cn('flex flex-col', className)}>
      {steps.map((s, i) => {
        const done = i < idx;
        const cur = i === idx;
        return (
          <li key={s.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn('size-3 rounded-full border-2', done ? 'border-success bg-success' : cur ? 'border-primary bg-primary' : 'border-border-strong bg-surface')} />
              {i < steps.length - 1 ? <span className={cn('w-px flex-1', done ? 'bg-success' : 'bg-border')} /> : null}
            </div>
            <div className="pb-3">
              <p className={cn('text-body-sm', cur ? 'font-semibold text-primary' : done ? 'text-text' : 'text-text-muted')}>{s.label}</p>
              {s.at ? <p className="text-caption text-text-subtle">{s.at}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
