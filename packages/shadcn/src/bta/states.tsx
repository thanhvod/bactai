import * as React from 'react';
import { AlertTriangle, Inbox, Lock, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  message: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

/** Nói thẳng việc tiếp theo; action chỉ hiện nếu có quyền (page quyết định). */
export function EmptyState({ icon, message, description, action, className, compact }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 text-center', compact ? 'py-6' : 'py-12', className)}>
      <span className="text-text-subtle [&_svg]:size-8">{icon ?? <Inbox strokeWidth={1.5} />}</span>
      <p className="text-body text-text">{message}</p>
      {description ? <p className="max-w-md text-body-sm text-text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps {
  title?: React.ReactNode;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}

export function errorMessage(error: unknown): string {
  if (!error) return 'Đã xảy ra lỗi không xác định';
  if (typeof error === 'string') return error;
  const e = error as { message?: string; graphQLErrors?: { message: string }[]; networkError?: { message?: string } };
  if (e.graphQLErrors?.length) return e.graphQLErrors.map((g) => g.message).join('; ');
  if (e.networkError) return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  return e.message ?? String(error);
}

export function ErrorState({ title = 'Không tải được dữ liệu', error, onRetry, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center gap-2 py-12 text-center', className)}>
      <AlertTriangle className="size-8 text-danger" strokeWidth={1.5} />
      <p className="text-body-strong text-text">{title}</p>
      <p className="max-w-md text-body-sm text-text-muted">{errorMessage(error)}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw /> Thử lại
        </Button>
      ) : null}
    </div>
  );
}

export function NoPermissionState({ message = 'Bạn không có quyền xem trang này', description, action, className }: { message?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return <EmptyState icon={<Lock strokeWidth={1.5} />} message={message} description={description ?? 'Liên hệ admin nhà xe để được cấp quyền.'} action={action} className={className} />;
}
