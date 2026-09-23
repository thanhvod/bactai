import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '../lib/utils';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: React.ReactNode;
}

export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(({ className, label, id, ...props }, ref) => {
  const autoId = React.useId();
  const sid = id ?? autoId;
  const sw = (
    <SwitchPrimitive.Root
      ref={ref}
      id={sid}
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border-control transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-muted',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4 rounded-full bg-surface shadow-sm transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-border-control" />
    </SwitchPrimitive.Root>
  );
  if (!label) return sw;
  return (
    <label htmlFor={sid} className="inline-flex cursor-pointer items-center gap-2 text-body">
      {sw}
      <span>{label}</span>
    </label>
  );
});
Switch.displayName = 'Switch';
