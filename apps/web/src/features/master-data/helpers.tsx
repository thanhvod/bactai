import * as React from 'react';
import { Link } from 'react-router';
import { toast } from '@bta/shadcn';
import { ACTIVE_STATUS, type EnumMeta, type Tone } from '@bta/shared';

/** Phân trang cursor (first/after) giữ stack cursor để quay lại trang trước. */
export function useCursorPaging(pageSize = 20) {
  const [stack, setStack] = React.useState<(string | null)[]>([null]);
  const [size, setSize] = React.useState(pageSize);
  const after = stack[stack.length - 1];
  return {
    first: size,
    after,
    pageSize: size,
    setPageSize: (n: number) => {
      setSize(n);
      setStack([null]);
    },
    next: (endCursor: string | null | undefined) => endCursor && setStack((s) => [...s, endCursor]),
    prev: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    hasPrev: stack.length > 1,
    reset: () => setStack([null]),
  };
}

export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** "2026-01-01T00:00:00.000Z" → "2026-01-01" cho input date (cột @db.Date lưu UTC 00:00). */
export function dateInput(v: string | null | undefined): string {
  return v ? String(v).slice(0, 10) : '';
}

/** Số ngày còn lại tới ngày hết hạn (âm = đã quá hạn). */
export function daysUntil(v: string | null | undefined): number | null {
  if (!v) return null;
  const target = new Date(`${String(v).slice(0, 10)}T00:00:00Z`).getTime();
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

export const APP_ACCOUNT_STATUS: Record<string, EnumMeta> = {
  NONE: { label: 'Chưa có tài khoản', tone: 'neutral' },
  ACTIVE: { label: 'Đang dùng app', tone: 'success' },
  MUST_CHANGE_PASSWORD: { label: 'Chờ đổi mật khẩu', tone: 'warning' },
  DISABLED: { label: 'Đã khóa', tone: 'danger' },
};

export const EXPENSE_PAID_STATUS: Record<string, EnumMeta> = {
  UNPAID: { label: 'Chưa trả', tone: 'warning' },
  PAID: { label: 'Đã trả', tone: 'success' },
};

export const STATUS_FILTER_OPTIONS = Object.entries(ACTIVE_STATUS).map(([value, m]) => ({ value, label: m.label }));

export function toneClass(tone: Tone) {
  return { neutral: 'text-text', info: 'text-info', primary: 'text-primary', accent: 'text-accent', success: 'text-success', warning: 'text-warning', danger: 'text-danger' }[tone];
}

/** Link trong bảng: chặn click lan tới onRowClick. */
export function CellLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Link to={to} onClick={(e) => e.stopPropagation()} className={className ?? 'text-accent hover:underline'}>
      {children}
    </Link>
  );
}

/** Import/Export Excel do module P6 (WM-SHELL-04/05) cung cấp — tạm thông báo. */
export function notReadyYet(feature: string) {
  toast.info(`${feature} sẽ có khi module Import/Export Excel sẵn sàng`);
}

/** Khối nội dung có tiêu đề (không lồng card). */
export function Panel({ title, actions, children, className }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-border bg-surface ${className ?? ''}`}>
      {title || actions ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          {title ? <h3 className="text-heading-sm">{title}</h3> : <span />}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}
