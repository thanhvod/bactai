import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-md border border-border bg-surface text-text shadow-popover text-body',
          success: '!border-success/40',
          error: '!border-danger/40',
          warning: '!border-warning/40',
        },
      }}
    />
  );
}

export const toast = {
  success: (message: string, description?: string) => sonnerToast.success(message, { description }),
  error: (message: string, description?: string) => sonnerToast.error(message, { description }),
  warning: (message: string, description?: string) => sonnerToast.warning(message, { description }),
  info: (message: string, description?: string) => sonnerToast(message, { description }),
};
