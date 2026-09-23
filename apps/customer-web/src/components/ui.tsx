import * as React from 'react';
import { BOOKING_STATUS, DEBT_STATEMENT_STATUS, ORDER_STATUS, STOP_STATUS, TRIP_STATUS } from '@bta/shared';
import { StatusBadge, cn } from '@bta/shadcn';

/** Khối nội dung có tiêu đề (không lồng card). */
export function Panel({ title, actions, children, className }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-lg border border-border bg-surface', className)}>
      {title || actions ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          {title ? <h2 className="text-heading-sm font-semibold text-text">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

export const BookingStatusBadge = ({ status }: { status: string }) => <StatusBadge meta={BOOKING_STATUS} status={status} outline={status === 'CANCELLED'} />;
export const OrderStatusBadge = ({ status }: { status: string }) => <StatusBadge meta={ORDER_STATUS} status={status} />;
export const TripStatusBadge = ({ status }: { status: string }) => <StatusBadge meta={TRIP_STATUS} status={status} />;
export const StopStatusBadge = ({ status }: { status: string }) => <StatusBadge meta={STOP_STATUS} status={status} />;
export const StatementStatusBadge = ({ status }: { status: string }) => <StatusBadge meta={DEBT_STATEMENT_STATUS} status={status} />;

export function InlineError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-body-sm text-danger">
      {children}
    </p>
  );
}

/** Tóm tắt điểm lấy → điểm trả từ danh sách stop. */
export function routeOf(stops: { type: string; locationName?: string | null; address: string }[]): string {
  const name = (s: { locationName?: string | null; address: string }) => s.locationName || s.address;
  const p = stops.find((s) => s.type === 'PICKUP');
  const d = [...stops].reverse().find((s) => s.type === 'DROPOFF');
  return [p && name(p), d && name(d)].filter(Boolean).join(' → ');
}
