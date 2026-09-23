import * as React from 'react';
import { cn } from '../lib/utils';

/** Khung A4 preview cho phiếu giao, phiếu điều xe, bảng kê, bảng lương. Nội dung template do page render. */
export function PrintSheet({ children, className, landscape, title }: { children: React.ReactNode; className?: string; landscape?: boolean; title?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 bg-surface-muted p-4">
      {title ? <p className="no-print text-body-sm text-text-muted">{title}</p> : null}
      <div
        className={cn('print-sheet bg-surface text-[12px] leading-[18px] text-text shadow-dialog', className)}
        style={{ width: landscape ? '297mm' : '210mm', minHeight: landscape ? '210mm' : '297mm', padding: '16mm' }}
      >
        {children}
      </div>
    </div>
  );
}
