import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Receipt } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, KpiCard, MoneyCell, PageHeader, Pagination, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { ExpenseFieldsFragment } from '@/gql/graphql';
import { CellLink, notReadyYet, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { DOC_STATUS, EXPENSE_KIND_META, EXPENSE_PAID_BY, PAID_STATUS, options, useMasterPickers } from '../components/common';
import { ExpensesQuery } from '../graphql/finance';

type Row = ExpenseFieldsFragment;

export function ExpenseLinks({ r }: { r: Row }) {
  const parts: React.ReactNode[] = [];
  if (r.order) parts.push(<CellLink key="o" to={paths.order(r.order.id, 'finance')}>{r.order.code}</CellLink>);
  if (r.trip) parts.push(<CellLink key="t" to={paths.trip(r.trip.id)}>{r.trip.code}</CellLink>);
  if (r.vehicle) parts.push(<CellLink key="v" to={paths.vehicle(r.vehicle.id)}>{r.vehicle.name ?? r.vehicle.code}</CellLink>);
  if (r.driver) parts.push(<CellLink key="d" to={paths.driver(r.driver.id, 'ledger')}>{r.driver.name}</CellLink>);
  if (r.supplier) parts.push(<CellLink key="s" to={paths.supplier(r.supplier.id)}>{r.supplier.name}</CellLink>);
  if (!parts.length) return <span className="text-text-subtle">—</span>;
  return <span className="flex flex-wrap gap-x-2 gap-y-0.5 text-body-sm">{parts}</span>;
}

/** WM-EXP-01 — Danh sách phiếu chi. */
export default function ExpenseListPage() {
  return (
    <RequirePermission permission={['finance.view', 'expense.create']}>
      <ExpenseList />
    </RequirePermission>
  );
}

function ExpenseList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') ?? '');
  const q = useDebounced(search.trim());
  const kind = params.get('kind');
  const paidBy = params.get('paidBy');
  const paidStatus = params.get('paidStatus');
  const supplierId = params.get('supplierId');
  const from = params.get('from');
  const to = params.get('to');
  const paging = useCursorPaging();
  const pickers = useMasterPickers();
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  React.useEffect(() => paging.reset(), [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const filter = {
    search: q || null,
    kind: kind ? [kind] : null,
    paidBy,
    paidStatus,
    supplierId,
    driverId: params.get('driverId'),
    vehicleId: params.get('vehicleId'),
    orderId: params.get('orderId'),
    tripId: params.get('tripId'),
    status: params.get('status'),
    dateFrom: from,
    dateTo: to,
  };
  const { data, loading, error, refetch } = useQuery(ExpensesQuery, { variables: { filter, first: paging.first, after: paging.after } });
  const { data: unpaid } = useQuery(ExpensesQuery, { variables: { filter: { paidStatus: 'UNPAID', status: 'ACTIVE' }, first: 1 } });
  const { data: driverPaid } = useQuery(ExpensesQuery, { variables: { filter: { paidBy: 'DRIVER', status: 'ACTIVE' }, first: 1 } });
  const rows = data?.expenses.nodes ?? [];
  const canCreate = hasPermission('expense.create');

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã phiếu', width: 140, render: (r) => <span className="font-mono text-body-sm">{r.code}</span> },
    { key: 'date', label: 'Ngày', width: 100, render: (r) => formatDate(r.expenseDate) },
    { key: 'kind', label: 'Loại chi', render: (r) => (
      <div className="flex flex-col items-start gap-0.5">
        <StatusBadge meta={EXPENSE_KIND_META} status={r.kind} />
        <span className="text-caption text-text-subtle">{r.categoryName ?? r.description ?? ''}</span>
      </div>
    ) },
    { key: 'links', label: 'Gắn với', render: (r) => <ExpenseLinks r={r} /> },
    { key: 'paidBy', label: 'Ai chi', hideBelow: 'lg', render: (r) => <span className="text-body-sm">{EXPENSE_PAID_BY[r.paidBy as keyof typeof EXPENSE_PAID_BY]?.label}{r.reimbursable ? ' · hoàn TX' : ''}</span> },
    { key: 'amount', label: 'Số tiền', money: true, render: (r) => <MoneyCell value={r.amount} tone={r.status === 'CANCELLED' ? 'muted' : 'default'} strong /> },
    { key: 'status', label: 'Trạng thái', render: (r) => (r.status === 'CANCELLED' ? <StatusBadge meta={DOC_STATUS} status="CANCELLED" outline /> : <StatusBadge meta={PAID_STATUS} status={r.paidStatus} />) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Phiếu chi"
        subtitle="Chi phí chuyến, thuê xe ngoài, vật tư xe, hoàn ứng, ứng lương, tạm ứng chuyến"
        breadcrumb={[{ label: 'Thu chi & Công nợ', to: PATHS.finance }, { label: 'Phiếu chi' }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => notReadyYet('Xuất danh sách phiếu chi')}>Xuất Excel</Button>
            {canCreate ? <Button onClick={() => navigate(`${PATHS.expenseNew}${kind ? `?kind=${kind}` : ''}`)}><Plus /> Tạo phiếu chi</Button> : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard loading={loading && !data} label="Tổng tiền (theo lọc)" value={formatVnd(data?.expenses.totalAmount ?? 0)} sub={`${data?.expenses.totalCount ?? 0} phiếu`} />
        <KpiCard label="Chưa trả nhà cung cấp" value={formatVnd(unpaid?.expenses.totalAmount ?? 0)} sub={`${unpaid?.expenses.totalCount ?? 0} phiếu`} tone={(unpaid?.expenses.totalCount ?? 0) > 0 ? 'warning' : 'neutral'} to={PATHS.supplierDebt} />
        <KpiCard label="Tài xế chi trước" value={formatVnd(driverPaid?.expenses.totalAmount ?? 0)} sub="Xem công nợ tài xế" onClick={() => setParam('paidBy', paidBy === 'DRIVER' ? null : 'DRIVER')} />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã phiếu, nội dung, đơn, chuyến"
        dateRange={{ from, to, onChange: (r) => { const n = new URLSearchParams(params); r.from ? n.set('from', r.from) : n.delete('from'); r.to ? n.set('to', r.to) : n.delete('to'); setParams(n, { replace: true }); paging.reset(); } }}
        selects={[
          { key: 'kind', placeholder: 'Loại chi', value: kind ?? 'ALL', onChange: (v) => setParam('kind', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi loại chi' }, ...options(EXPENSE_KIND_META)], width: 190 },
          { key: 'supplier', placeholder: 'Nhà cung cấp', value: supplierId ?? 'ALL', onChange: (v) => setParam('supplierId', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi NCC' }, ...pickers.suppliers.map((s) => ({ value: s.id, label: s.label }))], width: 200 },
        ]}
        chips={
          <>
            <FilterChip label="Chưa trả" active={paidStatus === 'UNPAID'} onClick={() => setParam('paidStatus', paidStatus === 'UNPAID' ? null : 'UNPAID')} />
            <FilterChip label="Tài xế chi trước" active={paidBy === 'DRIVER'} onClick={() => setParam('paidBy', paidBy === 'DRIVER' ? null : 'DRIVER')} />
            <FilterChip label="Chi từ tạm ứng" active={paidBy === 'DRIVER_ADVANCE'} onClick={() => setParam('paidBy', paidBy === 'DRIVER_ADVANCE' ? null : 'DRIVER_ADVANCE')} />
          </>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            loading={loading && !data}
            onRowClick={(r) => navigate(paths.expense(r.id))}
            rowClassName={(r) => (r.status === 'CANCELLED' ? 'opacity-60' : undefined)}
            empty={<EmptyState icon={<Receipt strokeWidth={1.5} />} message="Chưa có phiếu chi" action={canCreate ? <Button onClick={() => navigate(PATHS.expenseNew)}><Plus /> Tạo phiếu chi</Button> : null} />}
          />
          <Pagination
            hasNextPage={!!data?.expenses.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.expenses.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.expenses.totalCount}
          />
        </>
      )}
    </div>
  );
}
