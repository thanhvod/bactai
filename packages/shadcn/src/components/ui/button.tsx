'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import {
  RippleButton as ButtonPrimitive,
  RippleButtonRipples,
  type RippleButtonProps as ButtonPrimitiveProps,
} from '@/components/animate-ui/primitives/buttons/ripple';
import { cn } from '@/lib/utils';

/** Default variant: neutral “classic” chrome; `.modern` theme overrides via `modern:` (see app Tailwind `addVariant('modern', '.modern &')`). */
const defaultVariantChrome = [
  'text-primary-foreground',
  '[background-color:rgb(48,48,48)]',
  '[background-image:linear-gradient(rgba(48,48,48,0)_63.53%,rgba(255,255,255,0.15)_100%)]',
  '[box-shadow:rgba(0,0,0,0.8)_0px_-1px_0px_1px_inset,rgb(48,48,48)_0px_0px_0px_1px_inset,rgba(255,255,255,0.25)_0px_0.5px_0px_1.5px_inset]',
  'hover:[background-color:rgb(18,18,18)]',
  'hover:[box-shadow:rgba(0,0,0,0.8)_0px_-1px_0px_1px_inset,rgb(68,68,68)_0px_0px_0px_1px_inset,rgba(255,255,255,0.25)_0px_0.5px_0px_1.5px_inset]',
  'modern:[background-color:rgb(6,45,200)]',
  'modern:[background-image:linear-gradient(rgba(48,48,48,0)_40%,rgba(45,207,255,0.75)_100%)]',
  'modern:[box-shadow:rgb(6_45_200_/_80%)_0px_-1px_0px_1px_inset,rgb(6_45_200)_0px_0px_0px_1px_inset,rgb(45_207_255_/_50%)_0px_0.5px_0px_1.5px_inset]',
  'modern:hover:[background-color:rgb(0,35,175)]',
  'modern:hover:[background-image:linear-gradient(rgba(48,48,48,0)_40%,rgba(45,207,255,0.45)_100%)]',
  'modern:hover:[box-shadow:rgb(6_45_200_/_80%)_0px_-1px_0px_1px_inset,rgb(6_45_200)_0px_0px_0px_1px_inset,rgb(45_207_255_/_50%)_0px_0.5px_0px_1.5px_inset]',
  'transition-[background-color,box-shadow] duration-300 ease-out',
].join(' ');

/**
 * Styled button — [Animate UI Button](https://animate-ui.com/docs/components/buttons/button)
 * (motion hover/tap) + CVA variants. Giữ thêm `neutral`, `md`, `icon-xs` tương thích bản cũ.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap rounded-lg text-sm font-medium transition-[box-shadow,_color,_background-color,_border-color,_outline-color,_text-decoration-color,_fill,_stroke] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: defaultVariantChrome,
        accent: 'bg-accent text-accent-foreground shadow-xs hover:bg-accent/90',
        neutral:
          'bg-neutral-100 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        md: 'h-10 rounded-md px-5 has-[>svg]:px-4',
        lg: 'h-11 rounded-lg text-[15px] px-6 has-[>svg]:px-6',
        icon: 'size-10',
        'icon-sm': 'size-9',
        'icon-xs': 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/** Ripple color per variant — light ripple on dark bg, dark ripple on light bg */
const RIPPLE_COLORS: Record<string, string> = {
  default: 'rgba(255,255,255,0.5)',
  accent: 'rgba(255,255,255,0.45)',
  destructive: 'rgba(255,255,255,0.5)',
  neutral: 'rgba(0,0,0,0.15)',
  outline: 'rgba(0,0,0,0.12)',
  secondary: 'rgba(0,0,0,0.12)',
  ghost: 'rgba(0,0,0,0.12)',
  link: 'rgba(0,0,0,0.1)',
};

type ButtonProps = Omit<ButtonPrimitiveProps, 'children'> &
  VariantProps<typeof buttonVariants> & {
    /** Motion + asChild union từ primitive chặt children; nới ra cho sidebar / fragment. */
    children?: React.ReactNode;
  };

function Button({ className, variant, size, ...props }: ButtonProps) {
  const rippleColor = RIPPLE_COLORS[variant ?? 'default'] ?? 'rgba(255,255,255,0.3)';
  return (
    <ButtonPrimitive
      data-slot="button"
      hoverScale={1}
      tapScale={1}
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as ButtonPrimitiveProps)}
    >
      <>
        {props.children}
        <RippleButtonRipples color={rippleColor} />
      </>
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants, type ButtonProps };
