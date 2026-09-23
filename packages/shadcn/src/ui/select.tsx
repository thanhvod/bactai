import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string | null;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-invalid'?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

const EMPTY = '__empty__';

/** Select đơn giản dựa trên Radix. Giá trị rỗng dùng allowEmpty. */
export function Select({ value, onValueChange, options, placeholder = 'Chọn…', disabled, className, id, allowEmpty, emptyLabel = '— Không chọn —', ...rest }: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={value ?? (allowEmpty ? EMPTY : undefined)}
      onValueChange={(v) => onValueChange?.(v === EMPTY ? '' : v)}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-invalid={rest['aria-invalid']}
        className={cn(
          'flex h-control w-full items-center justify-between gap-2 rounded-md border border-border-control bg-surface px-3 text-body text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-surface-muted data-[placeholder]:text-text-subtle aria-[invalid=true]:border-danger [&>span]:truncate',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 text-text-subtle" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-surface shadow-popover animate-fade-in"
        >
          <SelectPrimitive.Viewport className="p-1">
            {allowEmpty ? <Item value={EMPTY}>{emptyLabel}</Item> : null}
            {options.map((o) => (
              <Item key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function Item({ value, disabled, children }: { value: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <SelectPrimitive.Item
      value={value}
      disabled={disabled}
      className="relative flex h-8 cursor-default select-none items-center rounded-sm pl-8 pr-2 text-body outline-none data-[highlighted]:bg-surface-muted data-[disabled]:opacity-50"
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
