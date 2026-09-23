import * as React from 'react';
import { Input, type InputProps } from './input';

export interface DateFieldProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  /** 'date' → YYYY-MM-DD; 'datetime' → YYYY-MM-DDTHH:mm */
  mode?: 'date' | 'datetime';
  value?: string | null;
  onChange?: (value: string) => void;
}

/** Ô ngày dùng input native (đủ cho vận hành; hiển thị theo locale trình duyệt). */
export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(({ mode = 'date', value, onChange, ...props }, ref) => (
  <Input
    ref={ref}
    type={mode === 'date' ? 'date' : 'datetime-local'}
    value={value ?? ''}
    onChange={(e) => onChange?.(e.target.value)}
    {...props}
  />
));
DateField.displayName = 'DateField';
