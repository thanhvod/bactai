import { MoneyCell, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { EXPENSE_KIND, EXPENSE_PAID_BY, formatDate, labelOf } from '@bta/shared';
import { paths } from '@/app/routes';
import { CellLink, EXPENSE_PAID_STATUS, daysUntil } from './helpers';

/** Ngày hết hạn (đăng kiểm/bảo hiểm/GPLX): đỏ khi còn ≤ 30 ngày. */
export function ExpiryCell({ date }: { date?: string | null }) {
  if (!date) return <span className="text-text-subtle">—</span>;
  const days = daysUntil(date);
  const warn = days !== null && days <= 30;
  return (
    <span className={warn ? 'text-danger' : undefined}>
      {formatDate(date)}
      {warn ? <span className="block text-caption">{days! < 0 ? 'Đã hết hạn' : `Còn ${days} ngày`}</span> : null}
    </span>
  );
}

/** Dòng phiếu chi rút gọn (MasterExpenseItem). */
export interface ExpenseBrief {
  id: string;
  code: string;
  kind: string;
  categoryName?: string | null;
  amount: number;
  expenseDate: string;
  paidBy: string;
  paidStatus: string;
  status: string;
  description?: string | null;
  orderCode?: string | null;
  tripCode?: string | null;
  supplierName?: string | null;
  vehiclePlate?: string | null;
}

export function expenseColumns<T extends ExpenseBrief>(opts: { showTrip?: boolean; showSupplier?: boolean; showVehicle?: boolean; showOrder?: boolean } = {}): DataTableColumn<T>[] {
  const cols: (DataTableColumn<T> | false | undefined)[] = [
    { key: 'code', label: 'Phiếu chi', render: (e) => <CellLink to={paths.expense(e.id)}>{e.code}</CellLink> },
    { key: 'date', label: 'Ngày', render: (e) => formatDate(e.expenseDate) },
    {
      key: 'kind',
      label: 'Loại chi',
      render: (e) => (
        <span className="flex flex-col">
          <span>{e.categoryName ?? labelOf(EXPENSE_KIND, e.kind)}</span>
          {e.description ? <span className="text-caption text-text-subtle">{e.description}</span> : null}
        </span>
      ),
    },
    opts.showOrder && { key: 'order', label: 'Đơn', render: (e) => e.orderCode ?? '—' },
    opts.showTrip && { key: 'trip', label: 'Chuyến', render: (e) => e.tripCode ?? '—' },
    opts.showVehicle && { key: 'vehicle', label: 'Xe', render: (e) => e.vehiclePlate ?? '—' },
    opts.showSupplier && { key: 'supplier', label: 'NCC', render: (e) => e.supplierName ?? '—' },
    { key: 'paidBy', label: 'Người chi', hideBelow: 'lg', render: (e) => labelOf(EXPENSE_PAID_BY, e.paidBy) },
    {
      key: 'paid',
      label: 'Thanh toán',
      render: (e) => (e.status === 'CANCELLED' ? <StatusBadge label="Đã hủy" tone="danger" outline /> : <StatusBadge meta={EXPENSE_PAID_STATUS} status={e.paidStatus} />),
    },
    {
      key: 'amount',
      label: 'Số tiền',
      money: true,
      render: (e) => <MoneyCell value={e.amount} tone={e.status === 'CANCELLED' ? 'muted' : 'default'} className={e.status === 'CANCELLED' ? 'line-through' : undefined} />,
    },
  ];
  return cols.filter(Boolean) as DataTableColumn<T>[];
}
