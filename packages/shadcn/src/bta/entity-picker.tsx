import * as React from 'react';
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '../lib/utils';

export interface PickerItem {
  id: string;
  label: string;
  code?: string | null;
  description?: string | null;
  inactive?: boolean;
  meta?: Record<string, unknown>;
}

export interface EntityPickerProps<T extends PickerItem> {
  items: T[];
  value?: string | null;
  onChange: (id: string | null, item: T | null) => void;
  /** Gọi khi người dùng gõ tìm (debounce ở page) */
  onSearch?: (q: string) => void;
  loading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  renderItem?: (item: T) => React.ReactNode;
  allowCreate?: { label: string; onCreate: (query: string) => void };
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  recentLabel?: string;
  id?: string;
  'aria-invalid'?: boolean;
}

/** Chọn khách/tài xế/xe/NCC/đơn/chuyến: tìm + metadata; bản ghi ngừng hoạt động hiện nhưng không chọn được. */
export function EntityPicker<T extends PickerItem>({ items, value, onChange, onSearch, loading, placeholder = 'Chọn…', searchPlaceholder = 'Tìm theo tên, mã, SĐT…', emptyText = 'Không tìm thấy', renderItem, allowCreate, disabled, clearable = true, className, id, ...rest }: EntityPickerProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const selected = items.find((i) => i.id === value) ?? null;
  const [cached, setCached] = React.useState<T | null>(null);
  React.useEffect(() => {
    if (selected) setCached(selected);
    if (!value) setCached(null);
  }, [selected, value]);
  const shown = selected ?? cached;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={rest['aria-invalid']}
          disabled={disabled}
          className={cn('flex h-control w-full items-center justify-between gap-2 rounded-md border border-border-control bg-surface px-3 text-left text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-surface-muted aria-[invalid=true]:border-danger', className)}
        >
          {shown ? (
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate">{shown.label}</span>
              {shown.code ? <span className="shrink-0 font-mono text-caption text-text-subtle">{shown.code}</span> : null}
            </span>
          ) : (
            <span className="text-text-subtle">{placeholder}</span>
          )}
          <span className="flex shrink-0 items-center gap-1 text-text-subtle">
            {shown && clearable && !disabled ? (
              <span
                role="button"
                aria-label="Bỏ chọn"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null, null);
                }}
                className="rounded-sm p-0.5 hover:bg-surface-muted"
              >
                <X className="size-3.5" />
              </span>
            ) : null}
            <ChevronsUpDown className="size-4" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0">
        <Command shouldFilter={!onSearch}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={q}
            onValueChange={(v) => {
              setQ(v);
              onSearch?.(v);
            }}
          />
          <CommandList>
            {loading ? <div className="p-3 text-body-sm text-text-muted">Đang tìm…</div> : <CommandEmpty>{emptyText}</CommandEmpty>}
            <CommandGroup>
              {items.map((it) => (
                <CommandItem
                  key={it.id}
                  value={`${it.label} ${it.code ?? ''} ${it.description ?? ''}`}
                  disabled={it.inactive}
                  onSelect={() => {
                    onChange(it.id, it);
                    setOpen(false);
                  }}
                  className={cn(it.inactive && 'opacity-50')}
                >
                  <Check className={cn('size-4 shrink-0', it.id === value ? 'opacity-100 text-primary' : 'opacity-0')} />
                  {renderItem ? (
                    renderItem(it)
                  ) : (
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-baseline gap-2">
                        <span className="truncate">{it.label}</span>
                        {it.code ? <span className="font-mono text-caption text-text-subtle">{it.code}</span> : null}
                        {it.inactive ? <span className="text-caption text-text-subtle">Ngừng hoạt động</span> : null}
                      </span>
                      {it.description ? <span className="truncate text-caption text-text-muted">{it.description}</span> : null}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreate ? (
              <div className="border-t border-border p-1">
                <button
                  type="button"
                  onClick={() => {
                    allowCreate.onCreate(q);
                    setOpen(false);
                  }}
                  className="flex h-9 w-full items-center gap-2 rounded-sm px-2 text-body text-accent hover:bg-surface-muted"
                >
                  <Plus className="size-4" /> {allowCreate.label}
                  {q ? <span className="text-text-muted">“{q}”</span> : null}
                </button>
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Ô tìm kiếm đơn giản (mobile/list) */
export function SearchField({ value, onChange, placeholder = 'Tìm kiếm', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-control w-full rounded-md border border-border-control bg-surface pl-9 pr-3 text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    </div>
  );
}
