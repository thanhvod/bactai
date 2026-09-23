import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

export const badgeVariants = cva('inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-[11px] px-2 text-caption font-medium [&_svg]:size-3', {
  variants: {
    tone: {
      neutral: 'bg-neutral-soft text-text-muted',
      info: 'bg-info-soft text-info',
      primary: 'bg-primary-soft text-primary',
      accent: 'bg-accent-soft text-accent',
      success: 'bg-success-soft text-success',
      warning: 'bg-warning-soft text-warning',
      danger: 'bg-danger-soft text-danger',
    },
    outline: { true: 'bg-transparent border' },
  },
  compoundVariants: [
    { tone: 'danger', outline: true, class: 'border-danger text-danger' },
    { tone: 'neutral', outline: true, class: 'border-border-control text-text-muted' },
    { tone: 'primary', outline: true, class: 'border-primary text-primary' },
    { tone: 'success', outline: true, class: 'border-success text-success' },
    { tone: 'warning', outline: true, class: 'border-warning text-warning' },
    { tone: 'info', outline: true, class: 'border-info text-info' },
    { tone: 'accent', outline: true, class: 'border-accent text-accent' },
  ],
  defaultVariants: { tone: 'neutral' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, outline, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, outline }), className)} {...props} />;
}
