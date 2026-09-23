import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { FileText, HandCoins, Wallet } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, KpiCard, MoneyCell, PageHeader, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { FinCustomerDebtQuery } from '@/gql/graphql';
import { CellLink, notReadyYet, useDebounced } from '@/features/master-data/helpers';
import { CustomerDebtQuery } from '../graphql/finance';

type Row = FinCustomerDebtQuery['customerDebt']['rows'][number];

/** WM-DEBT-01 — Công nợ khách tổng hợp. Còn nợ = tổng đơn − phân bổ; số dư (credit) không tự trừ. */
export default function CustomerDebtPage() {
  return (
    <RequirePermission permission="debt.view">
      <CustomerDebt />
    </RequirePermission>
  );
}

function CustomerDebt() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') ?? '');
  const q = useDebounced(search.trim());
  const quick = params.get('quick'); // overdue | overLimit | credit
  const setQuick = (v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set('quick', v);
    else next.delete('quick');
    setParams(next, { replace: true });
  };
  const { data, loading, error, refetch } = useQuery(CustomerDebtQuery, {
    variables: { filter: { search: q || null, overdueOnly: quick === 'overdue' || null, overLimit: quick === 'overLimit' || null, hasCredit: quick === 'credit' || null, openOnly: quick ? null : true } },
  });
  const { data: all } = useQuery(CustomerDebtQuery, { variables: { filter: {} } });
  const rows = data?.customerDebt.rows ?? [];
  const totals = all?.customerDebt.totals;
  const allRows = all?.customerDebt.rows ?? [];
  const canPay = hasPermission('payment.create');
  const canStatement = hasPermission('debtStatement.create');

  const columns: DataTableColumn<Row>[] = [
    { key: 'customer', label: 'Khách hàng', render: (r) => (
      <div className="flex flex-col">
        <CellLink to={paths.customer(r.customer.id, 'debt')} className="font-medium text-text hover:text-accent hover:underline">{r.customer.name}</CellLink>
        <span className="text-caption text-text-subtle">{[r.customer.code, r.phone].filter(Boolean).join(' · ')}</span>
      </div>
    ) },
    { key: 'receivable', label: 'Tổng phải thu', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.receivable} /> },
    { key: 'paid', label: 'Đã thu', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.paid} /> },
    { key: 'remaining', label: 'Còn nợ', money: true, render: (r) => <MoneyCell value={r.remaining} strong /> },
    { key: 'overdue', label: 'Quá hạn', money: true, render: (r) => (
      r.overdueAmount > 0 ? (
        <div className="text-right">
          <MoneyCell value={r.overdueAmount} tone="danger" strong />
          <span className="block text-caption text-danger">{r.overdueOrders} đơn · tối đa {r.maxOverdueDays} ngày</span>
        </div>
      ) : <MoneyCell value={0} tone="muted" />
    ) },
    { key: 'credit', label: 'Số dư', money: true, render: (r) => <MoneyCell value={r.creditBalance} tone={r.creditBalance > 0 ? 'success' : 'muted'} /> },
    { key: 'limit', label: 'Hạn mức', align: 'right', hideBelow: 'lg', render: (r) => (
      r.creditLimit ? (
        <div className="text-right">
          <MoneyCell value={r.creditLimit} tone="muted" />
          {r.overLimit ? <StatusBadge tone="danger" label={`Vượt ${r.limitUsagePct}%`} /> : <span className="block text-caption text-text-subtle">Dùng {r.limitUsagePct ?? 0}%</span>}
        </div>
      ) : <span className="block text-right text-text-subtle">—</span>
    ) },
    {
      key: 'act',
      label: '',
      width: 190,
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {canPay ? <Button size="sm" variant="ghost" onClick={() => navigate(`${PATHS.paymentNew}?type=CUSTOMER_PAYMENT&customerId=${r.customer.id}`)}>Ghi thu</Button> : null}
          {canStatement ? <Button size="sm" variant="ghost" onClick={() => navigate(`${PATHS.debtStatements}?new=1&customerId=${r.customer.id}`)}>Bảng kê</Button> : null}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Công nợ khách hàng"
        subtitle="Phải thu theo khách: còn nợ, quá hạn, số dư và hạn mức (cảnh báo mềm)"
        breadcrumb={[{ label: 'Thu chi & Công nợ', to: PATHS.finance }, { label: 'Công nợ khách' }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => notReadyYet('Xuất công nợ khách')}>Xuất Excel</Button>
            {canStatement ? <Button variant="secondary" onClick={() => navigate(PATHS.debtStatements)}><FileText /> Bảng kê công nợ</Button> : null}
            {canPay ? <Button onClick={() => navigate(`${PATHS.paymentNew}?type=CUSTOMER_PAYMENT`)}><HandCoins /> Ghi nhận thanh toán</Button> : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard loading={!all} label="Tổng còn nợ" value={formatVnd(totals?.remaining ?? 0)} sub={`${allRows.filter((r) => r.remaining > 0).length} khách`} onClick={() => setQuick(null)} />
        <KpiCard loading={!all} label="Quá hạn" value={formatVnd(totals?.overdueAmount ?? 0)} tone={(totals?.overdueAmount ?? 0) > 0 ? 'danger' : 'neutral'} sub={`${allRows.filter((r) => r.overdueAmount > 0).length} khách`} onClick={() => setQuick('overdue')} />
        <KpiCard loading={!all} label="Vượt hạn mức" value={allRows.filter((r) => r.overLimit).length} tone={allRows.some((r) => r.overLimit) ? 'warning' : 'neutral'} sub="Chỉ cảnh báo, không chặn tạo đơn" onClick={() => setQuick('overLimit')} />
        <KpiCard loading={!all} label="Số dư khách (chưa phân bổ)" value={formatVnd(totals?.creditBalance ?? 0)} tone="info" icon={<Wallet />} onClick={() => setQuick('credit')} />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm khách hàng, mã, SĐT"
        chips={
          <>
            <FilterChip label="Còn nợ" active={!quick} onClick={() => setQuick(null)} />
            <FilterChip label="Quá hạn" active={quick === 'overdue'} onClick={() => setQuick(quick === 'overdue' ? null : 'overdue')} />
            <FilterChip label="Vượt hạn mức" active={quick === 'overLimit'} onClick={() => setQuick(quick === 'overLimit' ? null : 'overLimit')} />
            <FilterChip label="Có số dư" active={quick === 'credit'} onClick={() => setQuick(quick === 'credit' ? null : 'credit')} />
          </>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.customer.id}
          loading={loading && !data}
          onRowClick={(r) => navigate(paths.customer(r.customer.id, 'debt'))}
          rowClassName={(r) => (r.overLimit ? 'bg-warning/5' : undefined)}
          totalRow={rows.length ? { customer: `Tổng ${rows.length} khách`, remaining: <MoneyCell value={rows.reduce((s, r) => s + r.remaining, 0)} strong />, overdue: <MoneyCell value={rows.reduce((s, r) => s + r.overdueAmount, 0)} tone="danger" strong />, credit: <MoneyCell value={rows.reduce((s, r) => s + r.creditBalance, 0)} /> } : undefined}
          empty={<EmptyState message="Không có khách còn nợ" />}
        />
      )}
    </div>
  );
}
