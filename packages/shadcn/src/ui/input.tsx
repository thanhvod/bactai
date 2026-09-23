import * as React from 'react';
import { cn } from '../lib/utils';

export const inputClass =
  'flex h-control w-full rounded-md border border-border-control bg-surface px-3 py-1 text-body text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70 aria-[invalid=true]:border-danger';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, prefix, suffix, type = 'text', ...props }, ref) => {
  if (!prefix && !suffix) return <input ref={ref} type={type} className={cn(inputClass, className)} {...props} />;
  return (
    <div className={cn('relative flex items-center', className)}>
      {prefix ? <span className="pointer-events-none absolute left-3 text-text-subtle [&_svg]:size-4">{prefix}</span> : null}
      <input ref={ref} type={type} className={cn(inputClass, prefix && 'pl-9', suffix && 'pr-9')} {...props} />
      {suffix ? <span className="pointer-events-none absolute right-3 text-text-subtle text-body-sm">{suffix}</span> : null}
    </div>
  );
});
Input.displayName = 'Input';

/** Alias theo tên trong design/COMPONENTS.md */
export const TextField = Input;
