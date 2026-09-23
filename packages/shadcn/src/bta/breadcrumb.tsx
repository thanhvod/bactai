import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export interface BreadcrumbItem {
  label: React.ReactNode;
  to?: string;
}

/** LinkComponent: truyền Link của react-router qua BreadcrumbProvider để package không phụ thuộc router. */
export const LinkContext = React.createContext<React.ComponentType<{ to: string; className?: string; children: React.ReactNode }>>(
  ({ to, className, children }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
);

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  const Link = React.useContext(LinkContext);
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-body-sm text-text-muted', className)}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <ChevronRight className="size-3.5 text-text-subtle" aria-hidden /> : null}
          {it.to && i < items.length - 1 ? (
            <Link to={it.to} className="text-text-muted hover:text-text hover:underline">
              {it.label}
            </Link>
          ) : (
            <span className={cn(i === items.length - 1 && 'text-text')}>{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
