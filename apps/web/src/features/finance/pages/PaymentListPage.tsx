import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { HandCoins, Plus } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, KpiCard, MoneyCell, PageHeader, Pagination, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { PaymentFieldsFragment } from '@/gql/graphql';
import { CellLink, notReadyYet, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { DOC_STATUS, NotRevenueTag, PAYMENT_IN_TYPE, PAYMENT_METHOD, options } from '../components/common';
import { PaymentsQuery } from '../graphql/finance';

type Row = PaymentFieldsFragment;

/** WM-PAY-01 — Danh sách phiếu thu. */
export default function PaymentListPage() {
  return (
    <RequirePermission permission={['finance.view', 'payment.create']}>
      <PaymentList />
    </RequirePermission>
  );
}

function PaymentList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') ?? '');
  const q = useDebounced(search.trim());
  const type = params.get('type');
  const method = params.get('method');
  const unallocated = params.get('unallocated') === '1';
  const from = params.get('from');
  const to = params.get('to');
  const paging = useCursorPaging();
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  React.useEffect(() => paging.reset(), [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const filter = { search: q || null, type, method, hasUnallocated: unallocated || null, dateFrom: from, dateTo: to, customerId: params.get('customerId'), driverId: params.get('driverId') };
  const { data, loading, error, refetch } = useQuery(PaymentsQuery, { variables: { filter, first: paging.first, after: paging.after } });
  const { data: pending } = useQuery(PaymentsQuery, { variables: { filter: { hasUnallocated: true, type: 'CUSTOMER_PAYMENT', status: 'ACTIVE' }, first: 100 } });
  const rows = data?.payments.nodes ?? [];
  const pendingRows = pending?.payments.nodes ?? [];
  const canCreate = hasPermission('payment.create');
  const canAllocate = hasPermission('payment.allocate');

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã phiếu', width: 150, render: (r) => <span className="font-mono text-body-sm">{r.code}</span> },
    { key: 'date', label: 'Ngày thu', width: 110, render: (r) => formatDate(r.receivedAt) },
    { key: 'type', label: 'Loại', render: (r) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge meta={PAYMENT_IN_TYPE} status={r.type} />
        {r.notRevenue ? <NotRevenueTag /> : null}
      </div>
    ) },
    { key: 'payer', label: 'Người nộp', render: (r) => (
      r.customer ? <CellLink to={paths.customer(r.customer.id, 'debt')}>{r.customer.name}</CellLink>
      : r.driver ? <CellLink to={paths.driver(r.driver.id, 'ledger')}>{r.driver.name}</CellLink>
      : <span>{r.payerLabel}</span>
    ) },
    { key: 'method', label: 'Hình thức', hideBelow: 'lg', render: (r) => PAYMENT_METHOD[r.method as keyof typeof PAYMENT_METHOD]?.label ?? r.method },
    { key: 'amount', label: 'Số tiền', money: true, render: (r) => <MoneyCell value={r.amount} tone={r.status === 'CANCELLED' ? 'muted' : 'default'} strong /> },
    { key: 'allocated', label: 'Đã phân bổ', money: true, hideBelow: 'lg', render: (r) => (r.type === 'CUSTOMER_PAYMENT' ? <MoneyCell value={r.allocatedAmount} /> : <span className="block text-right text-text-subtle">—</span>) },
    { key: 'unallocated', label: 'Còn treo', money: true, render: (r) => (r.type === 'CUSTOMER_PAYMENT' ? <MoneyCell value={r.unallocatedAmount} tone={r.unallocatedAmount > 0 && r.status === 'ACTIVE' ? 'warning' : 'muted'} /> : <span className="block text-right text-text-subtle">—</span>) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={DOC_STATUS} status={r.status} outline={r.status === 'CANCELLED'} /> },
    {
      key: 'act',
      label: '',
      width: 110,
      render: (r) =>
        canAllocate && r.type === 'CUSTOMER_PAYMENT' && r.status === 'ACTIVE' && r.unallocatedAmount > 0 ? (
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); navigate(paths.paymentAllocate(r.id)); }}>Phân bổ</Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Phiếu thu"
        subtitle="Khách trả, tài xế nộp COD, hoàn tạm ứng và thu khác"
        breadcrumb={[{ label: 'Thu chi & Công nợ', to: PATHS.finance }, { label: 'Phiếu thu' }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => notReadyYet('Xuất danh sách phiếu thu')}>Xuất Excel</Button>
            {canCreate ? (
              <Button onClick={() => navigate(`${PATHS.paymentNew}${type ? `?type=${type}` : ''}`)}>
                <Plus /> Tạo phiếu thu
              </Button>
            ) : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard loading={loading && !data} label="Tổng tiền phiếu (theo lọc)" value={formatVnd(data?.payments.totalAmount ?? 0)} sub={`${data?.payments.totalCount ?? 0} phiếu`} />
        <KpiCard label="Phiếu khách trả còn treo" value={pendingRows.length} sub={formatVnd(pendingRows.reduce((s, p) => s + p.unallocatedAmount, 0))} tone={pendingRows.length ? 'warning' : 'neutral'} onClick={() => setParam('unallocated', unallocated ? null : '1')} />
        <KpiCard label="Công nợ khách" value="Xem theo khách" sub="Phải thu, quá hạn, số dư" to={PATHS.customerDebt} />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã phiếu, người nộp, nội dung chuyển khoản"
        dateRange={{ from, to, onChange: (r) => { const n = new URLSearchParams(params); r.from ? n.set('from', r.from) : n.delete('from'); r.to ? n.set('to', r.to) : n.delete('to'); setParams(n, { replace: true }); paging.reset(); } }}
        selects={[
          { key: 'type', placeholder: 'Loại thu', value: type ?? 'ALL', onChange: (v) => setParam('type', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi loại' }, ...options(PAYMENT_IN_TYPE)], width: 190 },
          { key: 'method', placeholder: 'Hình thức', value: method ?? 'ALL', onChange: (v) => setParam('method', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi hình thức' }, ...options(PAYMENT_METHOD)], width: 160 },
        ]}
        chips={<FilterChip label="Còn tiền chưa phân bổ" active={unallocated} onClick={() => setParam('unallocated', unallocated ? null : '1')} />}
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
            onRowClick={(r) => navigate(paths.payment(r.id))}
            rowClassName={(r) => (r.status === 'CANCELLED' ? 'opacity-60' : undefined)}
            empty={<EmptyState icon={<HandCoins strokeWidth={1.5} />} message="Chưa có phiếu thu" action={canCreate ? <Button onClick={() => navigate(PATHS.paymentNew)}><Plus /> Tạo phiếu thu</Button> : null} />}
          />
          <Pagination
            hasNextPage={!!data?.payments.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.payments.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.payments.totalCount}
          />
        </>
      )}
    </div>
  );
}
