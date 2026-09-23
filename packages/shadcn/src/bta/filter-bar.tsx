import * as React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { DateField } from '../ui/date-field';
import { Select, type SelectOption } from '../ui/select';
import { cn } from '../lib/utils';

export interface FilterChipProps {
  label: React.ReactNode;
  active?: boolean;
  count?: number | null;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function FilterChip({ label, active, count, onClick, onRemove, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-[26px] items-center gap-1 rounded-[13px] border px-2.5 text-body-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'border-primary bg-primary-soft font-medium text-primary' : 'border-border-control bg-surface text-text-muted hover:bg-surface-muted',
        className,
      )}
    >
      {label}
      {count !== undefined && count !== null ? <span className="text-caption">{count}</span> : null}
      {onRemove ? (
        <span
          role="button"
          aria-label="Bỏ lọc"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-border"
        >
          <X className="size-3" />
        </span>
      ) : null}
    </button>
  );
}

export interface FilterSelectDef {
  key: string;
  placeholder: string;
  options: SelectOption[];
  value?: string | null;
  onChange: (v: string) => void;
  width?: number;
}

export interface FilterBarProps {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  chips?: React.ReactNode;
  dateRange?: { from?: string | null; to?: string | null; onChange: (r: { from: string | null; to: string | null }) => void };
  selects?: FilterSelectDef[];
  onAdvanced?: () => void;
  right?: React.ReactNode;
  className?: string;
}

/** Thanh lọc trên list page: tìm kiếm · chip · khoảng ngày · select · lọc nâng cao (Drawer do page mở). */
export function FilterBar({ search, onSearchChange, searchPlaceholder = 'Tìm kiếm', chips, dateRange, selects, onAdvanced, right, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 rounded-lg bg-surface-muted px-3 py-2', className)}>
      {onSearchChange ? (
        <Input
          value={search ?? ''}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          prefix={<Search />}
          className="w-[260px] max-w-full"
          aria-label={searchPlaceholder}
        />
      ) : null}
      {chips ? <div className="flex flex-wrap items-center gap-1.5">{chips}</div> : null}
      {dateRange ? (
        <div className="flex items-center gap-1">
          <DateField value={dateRange.from} onChange={(v) => dateRange.onChange({ from: v || null, to: dateRange.to ?? null })} className="w-[150px]" aria-label="Từ ngày" />
          <span className="text-text-subtle">–</span>
          <DateField value={dateRange.to} onChange={(v) => dateRange.onChange({ from: dateRange.from ?? null, to: v || null })} className="w-[150px]" aria-label="Đến ngày" />
        </div>
      ) : null}
      {selects?.map((s) => (
        <Select key={s.key} value={s.value ?? ''} onValueChange={s.onChange} options={s.options} placeholder={s.placeholder} allowEmpty emptyLabel={`Tất cả · ${s.placeholder.toLowerCase()}`} className={cn('w-[170px]')} />
      ))}
      <div className="flex-1" />
      {right}
      {onAdvanced ? (
        <Button variant="secondary" size="sm" onClick={onAdvanced}>
          <SlidersHorizontal /> Lọc nâng cao
        </Button>
      ) : null}
    </div>
  );
}
