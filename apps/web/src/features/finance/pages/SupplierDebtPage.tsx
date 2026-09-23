import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, KpiCard, MoneyCell, PageHeader, type DataTableColumn } from '@bta/shadcn';
import { formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { FinSupplierDebtQuery } from '@/gql/graphql';
import { CellLink, notReadyYet } from '@/features/master-data/helpers';
import { SupplierDebtQuery } from '../graphql/finance';
import { MarkPaidDialog } from './ExpenseDetailPage';

type Row = FinSupplierDebtQuery['supplierDebt']['rows'][number];
type Exp = Row['expenses'][number];

/** WM-DEBT-02 — Công nợ nhà cung cấp; trả NCC = đánh dấu nhiều phiếu chi đã trả. */
export default function SupplierDebtPage() {
  return (
    <RequirePermission permission="supplierDebt.view">
      <SupplierDebt />
    </RequirePermission>
  );
}

function SupplierDebt() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data, loading, error, refetch } = useQuery(SupplierDebtQuery, { variables: { filter: {} } });
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [paying, setPaying] = React.useState(false);
  const rows = data?.supplierDebt.rows ?? [];
  const allExpenses = rows.flatMap((r) => r.expenses);
  const selectedTotal = allExpenses.filter((e) => selected.has(e.id)).reduce((s, e) => s + e.amount, 0);
  const canPay = hasPermission('expense.markPaid');
  const aging = rows.reduce((a, r) => ({ d0_15: a.d0_15 + r.aging.d0_15, d16_30: a.d16_30 + r.aging.d16_30, d31_60: a.d31_60 + r.aging.d31_60, d60p: a.d60p + r.aging.d60p }), { d0_15: 0, d16_30: 0, d31_60: 0, d60p: 0 });

  const toggle = (id: string) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const columns: DataTableColumn<Row>[] = [
    { key: 'exp', label: '', width: 36, render: (r) => (expanded.has(r.supplier.id) ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />) },
    { key: 'supplier', label: 'Nhà cung cấp', render: (r) => <CellLink to={paths.supplier(r.supplier.id)} className="font-medium text-text hover:text-accent hover:underline">{r.supplier.name}</CellLink> },
    { key: 'count', label: 'Số phiếu chưa trả', align: 'right', render: (r) => r.unpaidCount },
    { key: 'a1', label: '0–15 ngày', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.aging.d0_15} tone="muted" /> },
    { key: 'a2', label: '16–30', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.aging.d16_30} tone={r.aging.d16_30 ? 'warning' : 'muted'} /> },
    { key: 'a3', label: '31–60', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.aging.d31_60} tone={r.aging.d31_60 ? 'warning' : 'muted'} /> },
    { key: 'a4', label: '> 60', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.aging.d60p} tone={r.aging.d60p ? 'danger' : 'muted'} /> },
    { key: 'oldest', label: 'Cũ nhất', align: 'right', render: (r) => `${r.oldestDays} ngày` },
    { key: 'total', label: 'Chưa trả', money: true, render: (r) => <MoneyCell value={r.unpaidTotal} strong /> },
  ];

  const expColumns: DataTableColumn<Exp>[] = [
    { key: 'code', label: 'Phiếu chi', render: (e) => <CellLink to={paths.expense(e.id)} className="font-mono text-accent hover:underline">{e.code}</CellLink> },
    { key: 'date', label: 'Ngày', render: (e) => formatDate(e.expenseDate) },
    { key: 'desc', label: 'Nội dung', render: (e) => e.categoryName ?? e.description ?? e.kindLabel },
    { key: 'link', label: 'Gắn với', render: (e) => [e.order?.code, e.trip?.code, e.vehicle?.name].filter(Boolean).join(' · ') || '—' },
    { key: 'amount', label: 'Số tiền', money: true, render: (e) => <MoneyCell value={e.amount} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Công nợ nhà cung cấp"
        subtitle="Tổng phiếu chi công ty chi nhưng chưa trả, theo tuổi nợ"
        breadcrumb={[{ label: 'Thu chi & Công nợ', to: PATHS.finance }, { label: 'Công nợ NCC' }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => notReadyYet('Xuất công nợ NCC')}>Xuất Excel</Button>
            {hasPermission('expense.create') ? <Button variant="secondary" onClick={() => navigate(`${PATHS.expenseNew}?kind=VEHICLE_SUPPLY&paidStatus=UNPAID`)}><Plus /> Tạo phiếu chi</Button> : null}
            {canPay ? <Button disabled={!selected.size} onClick={() => setPaying(true)}>Trả NCC ({selected.size}) · {formatVnd(selectedTotal)}</Button> : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard loading={loading && !data} label="Tổng chưa trả" value={formatVnd(data?.supplierDebt.total ?? 0)} sub={`${rows.length} nhà cung cấp`} />
        <KpiCard loading={loading && !data} label="0–15 ngày" value={formatVnd(aging.d0_15)} />
        <KpiCard loading={loading && !data} label="16–60 ngày" value={formatVnd(aging.d16_30 + aging.d31_60)} tone={aging.d16_30 + aging.d31_60 > 0 ? 'warning' : 'neutral'} />
        <KpiCard loading={loading && !data} label="> 60 ngày" value={formatVnd(aging.d60p)} tone={aging.d60p > 0 ? 'danger' : 'neutral'} />
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : rows.length === 0 && !loading ? (
        <EmptyState message="Không có công nợ nhà cung cấp" description="Mọi phiếu chi gắn NCC đã được trả." />
      ) : (
        <div className="flex flex-col gap-3">
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.supplier.id} loading={loading && !data} onRowClick={(r) => toggle(r.supplier.id)} />
          {rows.filter((r) => expanded.has(r.supplier.id)).map((r) => (
            <section key={r.supplier.id} className="rounded-lg border border-border bg-surface p-3">
              <h3 className="mb-2 text-heading-sm">Phiếu chưa trả — {r.supplier.name}</h3>
              <DataTable
                columns={expColumns}
                rows={r.expenses}
                rowKey={(e) => e.id}
                compact
                selectable={canPay}
                selected={selected}
                onSelectedChange={setSelected}
                totalRow={{ code: 'Tổng', amount: <MoneyCell value={r.unpaidTotal} strong /> }}
              />
            </section>
          ))}
          {!expanded.size ? <p className="text-body-sm text-text-muted">Bấm vào một NCC để xem và chọn phiếu cần trả.</p> : null}
        </div>
      )}
      {paying ? (
        <MarkPaidDialog
          ids={[...selected]}
          total={selectedTotal}
          onClose={() => setPaying(false)}
          onDone={() => {
            setSelected(new Set());
            void refetch();
          }}
        />
      ) : null}
    </div>
  );
}
