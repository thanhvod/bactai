import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        '[&[type=date]]:pr-9 [&[type=date]::-webkit-calendar-picker-indicator]:absolute [&[type=date]::-webkit-calendar-picker-indicator]:right-0 [&[type=date]::-webkit-calendar-picker-indicator]:top-0 [&[type=date]::-webkit-calendar-picker-indicator]:h-full [&[type=date]::-webkit-calendar-picker-indicator]:w-9 [&[type=date]::-webkit-calendar-picker-indicator]:opacity-0 [&[type=date]::-webkit-calendar-picker-indicator]:cursor-pointer',
        '[&[type=time]]:relative [&[type=time]]:pr-9 [&[type=time]::-webkit-calendar-picker-indicator]:absolute [&[type=time]::-webkit-calendar-picker-indicator]:right-2 [&[type=time]::-webkit-calendar-picker-indicator]:top-1/2 [&[type=time]::-webkit-calendar-picker-indicator]:h-[1.125rem] [&[type=time]::-webkit-calendar-picker-indicator]:w-[1.125rem] [&[type=time]::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&[type=time]::-webkit-calendar-picker-indicator]:cursor-pointer',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
