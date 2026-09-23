import * as React from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { IconButton } from '../ui/icon-button';
import { cn } from '../lib/utils';

export interface LineItemColumn<Row> {
  key: string;
  label: React.ReactNode;
  width?: number | string;
  align?: 'left' | 'right';
  render: (row: Row, index: number, update: (patch: Partial<Row>) => void) => React.ReactNode;
}

export interface LineItemsEditorProps<Row> {
  rows: Row[];
  onChange: (rows: Row[]) => void;
  columns: LineItemColumn<Row>[];
  newRow: () => Row;
  addLabel?: string;
  sortable?: boolean;
  removable?: (row: Row) => boolean;
  minRows?: number;
  className?: string;
  footer?: React.ReactNode;
  emptyText?: string;
}

/** Bảng nhập dòng: hàng hóa, dịch vụ thêm, điểm dừng (sắp xếp bằng nút lên/xuống). */
export function LineItemsEditor<Row>({ rows, onChange, columns, newRow, addLabel = 'Thêm dòng', sortable, removable, minRows = 0, className, footer, emptyText = 'Chưa có dòng nào' }: LineItemsEditorProps<Row>) {
  const update = (i: number, patch: Partial<Row>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className={cn('col-span-full flex flex-col gap-2', className)}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-max text-body">
          <thead className="bg-surface-muted text-body-sm text-text-muted">
            <tr>
              {sortable ? <th className="w-8 px-2 text-center">#</th> : null}
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width }} className={cn('h-9 px-2 font-medium', c.align === 'right' ? 'text-right' : 'text-left')}>
                  {c.label}
                </th>
              ))}
              <th className="w-[88px]" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-4 text-center text-body-sm text-text-muted">
                  {emptyText}
                </td>
              </tr>
            ) : null}
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border align-top">
                {sortable ? <td className="px-2 py-1.5 text-center text-body-sm text-text-subtle tabular-nums">{i + 1}</td> : null}
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-2 py-1.5', c.align === 'right' && 'text-right')}>
                    {c.render(r, i, (patch) => update(i, patch))}
                  </td>
                ))}
                <td className="px-1 py-1.5">
                  <div className="flex items-center justify-end">
                    {sortable ? (
                      <>
                        <IconButton label="Lên" size="sm" onClick={() => move(i, -1)} disabled={i === 0}>
                          <ArrowUp />
                        </IconButton>
                        <IconButton label="Xuống" size="sm" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>
                          <ArrowDown />
                        </IconButton>
                      </>
                    ) : null}
                    <IconButton label="Xóa dòng" size="sm" onClick={() => remove(i)} disabled={rows.length <= minRows || (removable ? !removable(r) : false)}>
                      <Trash2 />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...rows, newRow()])}>
          <Plus /> {addLabel}
        </Button>
        <div className="flex-1" />
        {footer}
      </div>
    </div>
  );
}
