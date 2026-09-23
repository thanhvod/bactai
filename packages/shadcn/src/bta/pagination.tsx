import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { cn } from '../lib/utils';

export interface PaginationProps {
  /** Cursor pagination theo API (first/after). */
  hasNextPage: boolean;
  hasPrevPage?: boolean;
  onNext: () => void;
  onPrev?: () => void;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  /** Số dòng đang hiển thị / tổng nếu biết */
  shown?: number;
  total?: number | null;
  className?: string;
}

export function Pagination({ hasNextPage, hasPrevPage, onNext, onPrev, pageSize, onPageSizeChange, shown, total, className }: PaginationProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 text-body-sm text-text-muted', className)}>
      {shown !== undefined ? (
        <span>
          Hiển thị {shown}
          {total !== undefined && total !== null ? ` / ${total}` : ''}
        </span>
      ) : null}
      <div className="flex-1" />
      {onPageSizeChange ? (
        <div className="flex items-center gap-2">
          <span>Mỗi trang</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))} options={[20, 50, 100].map((n) => ({ value: String(n), label: String(n) }))} className="w-[80px]" />
        </div>
      ) : null}
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" onClick={onPrev} disabled={!hasPrevPage || !onPrev} aria-label="Trang trước">
          <ChevronLeft /> Trước
        </Button>
        <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasNextPage} aria-label="Trang sau">
          Sau <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
