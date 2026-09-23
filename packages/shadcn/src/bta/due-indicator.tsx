import { formatDate } from '@bta/shared';
import { cn } from '../lib/utils';

export interface DueIndicatorProps {
  dueDate?: string | Date | null;
  overdueDays?: number;
  paid?: boolean;
  className?: string;
}

/** "Quá hạn N ngày" (danger) / "Còn hạn" / "Đã thu". */
export function DueIndicator({ dueDate, overdueDays = 0, paid, className }: DueIndicatorProps) {
  if (paid) return <span className={cn('text-body-sm text-success', className)}>Đã thu đủ</span>;
  if (!dueDate) return <span className={cn('text-body-sm text-text-subtle', className)}>Chưa đặt hạn</span>;
  if (overdueDays > 0)
    return (
      <span className={cn('text-body-sm font-medium', overdueDays > 30 ? 'text-danger' : 'text-warning', className)}>
        Quá hạn {overdueDays} ngày <span className="font-normal text-text-subtle">({formatDate(dueDate)})</span>
      </span>
    );
  return (
    <span className={cn('text-body-sm text-text-muted', className)}>
      Còn hạn <span className="text-text-subtle">({formatDate(dueDate)})</span>
    </span>
  );
}
