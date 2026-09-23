import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../lib/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'children'> {
  options: RadioOption[];
  inline?: boolean;
}

export function RadioGroup({ options, inline, className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root className={cn(inline ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2', className)} {...props}>
      {options.map((o) => {
        const id = `${props.name ?? 'rg'}-${o.value}`;
        return (
          <label key={o.value} htmlFor={id} className={cn('flex cursor-pointer items-start gap-2 text-body', o.disabled && 'opacity-50')}>
            <RadioGroupPrimitive.Item
              id={id}
              value={o.value}
              disabled={o.disabled}
              className="mt-1 size-4 shrink-0 rounded-full border border-border-control bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 data-[state=checked]:border-primary"
            >
              <RadioGroupPrimitive.Indicator className="flex items-center justify-center after:block after:size-2 after:rounded-full after:bg-primary" />
            </RadioGroupPrimitive.Item>
            <span className="flex flex-col">
              <span>{o.label}</span>
              {o.description ? <span className="text-body-sm text-text-muted">{o.description}</span> : null}
            </span>
          </label>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
