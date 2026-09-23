import * as React from 'react';
import { Logo } from '@bta/shadcn';

export function AuthLayout({ title, subtitle, children, width = 420 }: { title: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode; width?: number }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full flex-col gap-5 rounded-lg border border-border bg-surface p-6" style={{ maxWidth: width }}>
        <Logo />
        <div>
          <h1 className="text-heading-lg">{title}</h1>
          {subtitle ? <p className="mt-1 text-body-sm text-text-muted">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
