import * as React from 'react';
import { Button, type ButtonProps } from './button';
import { Tooltip } from './tooltip';

export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'children'> {
  /** Bắt buộc: dùng cho aria-label + tooltip */
  label: string;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  tooltip?: boolean;
}

/** Nút chỉ có icon: luôn có aria-label và tooltip. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = 'md', variant = 'ghost', tooltip = true, children, ...props }, ref) => {
    const btn = (
      <Button ref={ref} variant={variant} size={size === 'sm' ? 'icon-sm' : 'icon'} aria-label={label} {...props}>
        {children}
      </Button>
    );
    return tooltip ? <Tooltip content={label}>{btn}</Tooltip> : btn;
  },
);
IconButton.displayName = 'IconButton';
