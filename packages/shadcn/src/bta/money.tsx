import * as React from 'react';
import { formatVnd, parseVnd } from '@bta/shared';
import { Input, type InputProps } from '../ui/input';
import { cn } from '../lib/utils';

export interface MoneyCellProps {
  value: number | bigint | null | undefined;
  /** Tô màu theo dấu: dương xanh, âm đỏ */
  signed?: boolean;
  tone?: 'default' | 'muted' | 'success' | 'warning' | 'danger';
  strong?: boolean;
  withUnit?: boolean;
  className?: string;
  emptyText?: string;
}

/** Tiền VND căn phải, tabular-nums. */
export function MoneyCell({ value, signed, tone = 'default', strong, withUnit = true, className, emptyText = '—' }: MoneyCellProps) {
  if (value === null || value === undefined) return <span className={cn('block text-right text-text-subtle tabular-nums', className)}>{emptyText}</span>;
  const n = Number(value);
  const color =
    tone === 'muted' ? 'text-text-muted' : tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : tone === 'danger' ? 'text-danger' : signed ? (n < 0 ? 'text-danger' : n > 0 ? 'text-success' : '') : '';
  return (
    <span className={cn('block whitespace-nowrap text-right tabular-nums', strong && 'font-semibold', color, className)}>
      {formatVnd(n, withUnit)}
    </span>
  );
}

export interface MoneyInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  allowNegative?: boolean;
}

/** Ô nhập tiền: số nguyên VND, tự chèn dấu chấm nghìn, hậu tố đ, căn phải. */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(({ value, onChange, allowNegative, className, onBlur, ...props }, ref) => {
  const [text, setText] = React.useState(() => (value === null || value === undefined ? '' : formatVnd(value, false)));
  const lastValue = React.useRef(value);
  React.useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      setText(value === null || value === undefined ? '' : formatVnd(value, false));
    }
  }, [value]);
  return (
    <Input
      ref={ref}
      inputMode="numeric"
      autoComplete="off"
      value={text}
      suffix="đ"
      className={cn('[&>input]:text-right [&>input]:tabular-nums', className)}
      onChange={(e) => {
        const raw = e.target.value;
        const parsed = parseVnd(raw);
        const n = parsed === null ? null : allowNegative ? parsed : Math.abs(parsed);
        lastValue.current = n;
        setText(raw === '' ? '' : n === null ? raw : (raw.trim().startsWith('-') && allowNegative && n === 0 ? '-' : formatVnd(n, false)));
        onChange(n);
      }}
      onBlur={(e) => {
        setText(value === null || value === undefined ? '' : formatVnd(value, false));
        onBlur?.(e);
      }}
      {...props}
    />
  );
});
MoneyInput.displayName = 'MoneyInput';
