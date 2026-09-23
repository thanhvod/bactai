import * as React from 'react';
import { useNavigate } from 'react-router';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, StatusBadge } from '@bta/shadcn';
import { useGlobalSearch } from './hooks';
import { PATHS } from '../routes';

const QUICK_LINKS = [
  { label: 'Tạo đơn hàng', to: PATHS.orderNew },
  { label: 'Bảng điều phối', to: PATHS.dispatch },
  { label: 'Tạo phiếu thu', to: PATHS.paymentNew },
  { label: 'Tạo phiếu chi', to: PATHS.expenseNew },
  { label: 'Công nợ khách', to: PATHS.customerDebt },
  { label: 'COD tài xế đang giữ', to: PATHS.cod },
];

/** WM-SHELL-03 — Command palette Ctrl/⌘ K. */
export function QuickSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [q, setQ] = React.useState('');
  const navigate = useNavigate();
  const { groups, loading } = useGlobalSearch(q);
  const go = (to: string) => {
    onOpenChange(false);
    setQ('');
    navigate(to);
  };
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-text/40 animate-fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[15vh] z-50 w-[calc(100%-32px)] max-w-[640px] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-surface shadow-dialog animate-zoom-in">
          <DialogPrimitive.Title className="sr-only">Tìm kiếm nhanh</DialogPrimitive.Title>
          <Command shouldFilter={!q}>
            <CommandInput placeholder="Tìm mã đơn, mã chuyến, khách, tài xế, xe, phiếu…" value={q} onValueChange={setQ} autoFocus />
            <CommandList>
              {loading ? <p className="p-3 text-body-sm text-text-muted">Đang tìm…</p> : <CommandEmpty>{q ? 'Không tìm thấy kết quả' : 'Gõ để tìm kiếm'}</CommandEmpty>}
              {!q ? (
                <CommandGroup heading="Đi nhanh">
                  {QUICK_LINKS.map((l) => (
                    <CommandItem key={l.to} value={l.label} onSelect={() => go(l.to)}>
                      {l.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {groups.map((g) => (
                <CommandGroup key={g.type} heading={g.label}>
                  {g.items.map((it) => (
                    <CommandItem key={it.id} value={`${it.code} ${it.title}`} onSelect={() => go(it.to)}>
                      <span className="font-mono text-body-sm">{it.code}</span>
                      <span className="min-w-0 flex-1 truncate">{it.title}</span>
                      {it.subtitle ? <span className="text-caption text-text-subtle">{it.subtitle}</span> : null}
                      {it.status ? <StatusBadge label={it.status} /> : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
