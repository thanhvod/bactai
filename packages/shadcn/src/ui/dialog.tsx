import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export const DialogRoot = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  danger?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Không cho đóng khi click ra ngoài (form đang nhập) */
  modalStrict?: boolean;
}

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

/** Dialog: confirm, form ngắn. Form dài dùng Drawer. */
export function Dialog({ open, onOpenChange, title, description, children, footer, danger, size = 'md', modalStrict }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-text/40 animate-fade-in" />
        <DialogPrimitive.Content
          onInteractOutside={modalStrict ? (e) => e.preventDefault() : undefined}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border bg-surface shadow-dialog animate-zoom-in focus:outline-none',
            sizes[size],
          )}
        >
          <div className={cn('flex items-start gap-3 border-b border-border px-5 py-4', danger && 'border-l-4 border-l-danger')}>
            <div className="flex-1">
              <DialogPrimitive.Title className="text-heading-sm">{title}</DialogPrimitive.Title>
              {description ? <DialogPrimitive.Description className="mt-1 text-body-sm text-text-muted">{description}</DialogPrimitive.Description> : null}
            </div>
            <DialogPrimitive.Close className="rounded-sm p-1 text-text-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Đóng">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          {children ? <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div> : null}
          {footer ? <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
