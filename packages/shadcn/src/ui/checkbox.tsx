import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const cid = id ?? autoId;
    const box = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={cid}
        className={cn(
          'peer size-4 shrink-0 rounded-sm border border-border-control bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground',
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          {props.checked === 'indeterminate' ? <Minus className="size-3" /> : <Check className="size-3" />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
    if (!label) return box;
    return (
      <label htmlFor={cid} className="inline-flex cursor-pointer items-center gap-2 text-body">
        {box}
        <span>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
