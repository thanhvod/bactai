import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

export const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentPropsWithoutRef<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive ref={ref} className={cn('flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface', className)} {...props} />
  ),
);
Command.displayName = 'Command';

export function CommandInput({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-3">
      <Search className="size-4 shrink-0 text-text-subtle" />
      <CommandPrimitive.Input
        className={cn('flex h-11 w-full bg-transparent text-body outline-none placeholder:text-text-subtle', className)}
        {...props}
      />
    </div>
  );
}
export const CommandList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List className={cn('max-h-[360px] overflow-y-auto p-1', className)} {...props} />
);
export const CommandEmpty = (props: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty className="py-6 text-center text-body-sm text-text-muted" {...props} />
);
export const CommandGroup = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group className={cn('overflow-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:text-text-subtle', className)} {...props} />
);
export const CommandItem = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    className={cn('flex h-9 cursor-default select-none items-center gap-2 rounded-sm px-2 text-body outline-none data-[selected=true]:bg-surface-muted data-[disabled=true]:opacity-50', className)}
    {...props}
  />
);
export const CommandSeparator = (props: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>) => (
  <CommandPrimitive.Separator className="-mx-1 h-px bg-border" {...props} />
);
