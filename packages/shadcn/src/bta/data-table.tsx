import * as React from 'react';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import { EmptyState } from './states';
import { cn } from '../lib/utils';

export interface DataTableColumn<Row> {
  key: string;
  label: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  /** Cột tiền: align right + tabular-nums */
  money?: boolean;
  render?: (row: Row, index: number) => React.ReactNode;
  className?: string;
  /** ẩn ở màn hẹp */
  hideBelow?: 'md' | 'lg';
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  loading?: boolean;
  /** Số dòng skeleton khi loading */
  skeletonRows?: number;
  empty?: React.ReactNode;
  selectable?: boolean;
  selected?: Set<string>;
  onSelectedChange?: (next: Set<string>) => void;
  onRowClick?: (row: Row) => void;
  /** Dòng tổng dưới cùng: map key → nội dung */
  totalRow?: Partial<Record<string, React.ReactNode>>;
  compact?: boolean;
  rowClassName?: (row: Row) => string | undefined;
  /** Thanh bulk action, chỉ hiện khi có dòng được chọn */
  bulkActions?: (selected: Set<string>) => React.ReactNode;
  className?: string;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  footer?: React.ReactNode;
}

/** Bảng dữ liệu vận hành: header sticky nền surface-muted, row 44px (compact 40), cuộn ngang khi hẹp. */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  loading,
  skeletonRows = 6,
  empty,
  selectable,
  selected,
  onSelectedChange,
  onRowClick,
  totalRow,
  compact,
  rowClassName,
  bulkActions,
  className,
  stickyHeader = true,
  maxHeight,
  footer,
}: DataTableProps<Row>) {
  const sel = selected ?? new Set<string>();
  const allKeys = rows.map(rowKey);
  const allChecked = allKeys.length > 0 && allKeys.every((k) => sel.has(k));
  const someChecked = allKeys.some((k) => sel.has(k));
  const toggleAll = () => {
    const next = new Set(sel);
    if (allChecked) allKeys.forEach((k) => next.delete(k));
    else allKeys.forEach((k) => next.add(k));
    onSelectedChange?.(next);
  };
  const toggle = (k: string) => {
    const next = new Set(sel);
    next.has(k) ? next.delete(k) : next.add(k);
    onSelectedChange?.(next);
  };
  const rowH = compact ? 'h-10' : 'h-row';
  const cellAlign = (c: DataTableColumn<Row>) => (c.money || c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left');
  const hide = (c: DataTableColumn<Row>) => (c.hideBelow === 'md' ? 'hidden md:table-cell' : c.hideBelow === 'lg' ? 'hidden lg:table-cell' : '');

  return (
    <div className={cn('flex flex-col rounded-lg border border-border bg-surface', className)}>
      {selectable && bulkActions && sel.size > 0 ? (
        <div className="flex items-center gap-2 border-b border-border bg-accent-soft px-3 py-2 text-body-sm">
          <span className="font-medium text-accent">Đã chọn {sel.size}</span>
          <div className="flex-1" />
          {bulkActions(sel)}
        </div>
      ) : null}
      <div className="overflow-auto scrollbar-thin" style={{ maxHeight }}>
        <table className="w-full min-w-max border-collapse text-body">
          <thead className={cn('bg-surface-muted text-body-sm text-text-muted', stickyHeader && 'sticky top-0 z-10 shadow-sticky')}>
            <tr>
              {selectable ? (
                <th className="w-10 px-3">
                  <Checkbox checked={allChecked ? true : someChecked ? 'indeterminate' : false} onCheckedChange={toggleAll} aria-label="Chọn tất cả" />
                </th>
              ) : null}
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width }} className={cn('h-10 whitespace-nowrap px-3 font-medium', cellAlign(c), hide(c), c.className)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={`sk-${i}`} className={cn(rowH, 'border-t border-border')}>
                    {selectable ? <td className="px-3" /> : null}
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-3', hide(c))}>
                        <Skeleton className={cn(c.money || c.align === 'right' ? 'ml-auto' : '')} w={c.money ? 90 : '60%'} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row, i) => {
                  const k = rowKey(row);
                  const isSel = sel.has(k);
                  return (
                    <tr
                      key={k}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        rowH,
                        'border-t border-border transition-colors',
                        onRowClick && 'cursor-pointer hover:bg-surface-muted/60',
                        isSel && 'bg-accent-soft',
                        rowClassName?.(row),
                      )}
                    >
                      {selectable ? (
                        <td className="px-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isSel} onCheckedChange={() => toggle(k)} aria-label="Chọn dòng" />
                        </td>
                      ) : null}
                      {columns.map((c) => (
                        <td key={c.key} className={cn('px-3 align-middle', cellAlign(c), c.money && 'tabular-nums', hide(c), c.className)}>
                          {c.render ? c.render(row, i) : String((row as Record<string, unknown>)[c.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-10">
                  {empty ?? <EmptyState message="Chưa có dữ liệu" />}
                </td>
              </tr>
            ) : null}
          </tbody>
          {totalRow && !loading && rows.length > 0 ? (
            <tfoot className="sticky bottom-0 bg-surface-muted text-body-strong">
              <tr className={cn(rowH, 'border-t border-border-strong')}>
                {selectable ? <td /> : null}
                {columns.map((c, i) => (
                  <td key={c.key} className={cn('px-3', cellAlign(c), c.money && 'tabular-nums', hide(c))}>
                    {totalRow[c.key] ?? (i === 0 ? 'Tổng' : null)}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {footer ? <div className="border-t border-border px-3 py-2">{footer}</div> : null}
    </div>
  );
}
