import * as React from 'react';
import { cn } from '../lib/utils';

export interface FormFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
}

/** Label 13px text-muted; lỗi chặn inline danger. */
export function FormField({ label, required, hint, error, htmlFor, children, className, inline }: FormFieldProps) {
  // Tự gắn label ↔ control (a11y): nếu không truyền htmlFor và con là 1 element không có id → sinh id.
  const autoId = React.useId();
  const msgId = `${autoId}-msg`;
  let controlId = htmlFor;
  let content = children;
  if (!htmlFor && React.isValidElement(children)) {
    const el = children as React.ReactElement<Record<string, unknown>>;
    controlId = (el.props.id as string | undefined) ?? autoId;
    content = React.cloneElement(el, {
      id: controlId,
      ...(error ? { 'aria-invalid': el.props['aria-invalid'] ?? true } : {}),
      ...(error || hint ? { 'aria-describedby': el.props['aria-describedby'] ?? msgId } : {}),
    });
  }
  return (
    <div className={cn('flex gap-1', inline ? 'flex-row items-center gap-3' : 'flex-col', className)}>
      {label ? (
        <label htmlFor={controlId} className={cn('text-body-sm text-text-muted', inline && 'w-40 shrink-0')}>
          {label}
          {required ? <span className="ml-0.5 text-danger" aria-hidden>*</span> : null}
        </label>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {content}
        {error ? (
          <p id={msgId} className="text-caption text-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={msgId} className="text-caption text-text-subtle">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Khối section trong form dài. */
export function FormSection({ title, description, children, className }: { title: React.ReactNode; description?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-lg border border-border bg-surface', className)}>
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-heading-sm">{title}</h3>
        {description ? <p className="text-body-sm text-text-muted">{description}</p> : null}
      </div>
      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
