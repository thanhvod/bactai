import { Badge } from '@bta/shadcn';
import {
  ORDER_STATUS_LABEL,
  PAYROLL_STATUS_LABEL,
  TRIP_STATUS_LABEL,
} from '@bta/shared';

const COLORS: Record<string, string> = {
  // order
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_CONFIRM: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  // trip
  SCHEDULED: 'bg-muted text-muted-foreground',
  TO_PICKUP: 'bg-sky-100 text-sky-800',
  PICKING_UP: 'bg-sky-100 text-sky-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  PAUSED: 'bg-amber-100 text-amber-800',
  DELIVERING: 'bg-indigo-100 text-indigo-800',
  // payroll
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  PAID: 'bg-emerald-100 text-emerald-800',
};

const ALL_LABELS: Record<string, string> = {
  ...ORDER_STATUS_LABEL,
  ...TRIP_STATUS_LABEL,
  ...PAYROLL_STATUS_LABEL,
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <Badge variant="secondary" className={COLORS[status] ?? ''}>
      {label ?? ALL_LABELS[status] ?? status}
    </Badge>
  );
}
