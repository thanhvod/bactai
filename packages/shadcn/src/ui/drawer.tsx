import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: 480 | 560 | 720;
  modalStrict?: boolean;
}

/** Drawer (Sheet) từ phải: form phụ, timeline, attachment, filter nâng cao. */
export function Drawer({ open, onOpenChange, title, description, children, footer, width = 560, modalStrict }: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-text/40 animate-fade-in" />
        <DialogPrimitive.Content
          onInteractOutside={modalStrict ? (e) => e.preventDefault() : undefined}
          style={{ width: `min(${width}px, 100vw)` }}
          className={cn('fixed inset-y-0 right-0 z-50 flex flex-col border-l border-border bg-surface shadow-dialog animate-slide-in-right focus:outline-none')}
        >
          <div className="flex items-start gap-3 border-b border-border px-5 py-4">
            <div className="flex-1 min-w-0">
              <DialogPrimitive.Title className="text-heading-sm">{title}</DialogPrimitive.Title>
              {description ? <DialogPrimitive.Description className="mt-1 text-body-sm text-text-muted">{description}</DialogPrimitive.Description> : null}
            </div>
            <DialogPrimitive.Close className="rounded-sm p-1 text-text-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Đóng">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer ? <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
