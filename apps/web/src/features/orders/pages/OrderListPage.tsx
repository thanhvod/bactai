import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { AlertTriangle, ClipboardList, Download, Inbox, Plus, Printer } from 'lucide-react';
import {
  Button,
  DataTable,
  DueIndicator,
  EmptyState,
  ErrorState,
  FilterBar,
  FilterChip,
  KpiCard,
  MoneyCell,
  PageHeader,
  Pagination,
  StatusBadge,
  Tooltip,
  toast,
  type DataTableColumn,
} from '@bta/shadcn';
import { ORDER_STATUS, formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { OrderListFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { CellLink, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { OrderTotalsQuery, OrdersQuery } from '../graphql/orders';
import { ExportFileMutation } from '../graphql/exports';

type Row = OrderListFieldsFragment;

const QUICK: { key: string; label: string; status?: string[]; debtStatus?: string; needsAction?: boolean; warning?: boolean }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'action', label: 'Cần xử lý', needsAction: true },
  { key: 'running', label: 'Đang thực hiện', status: ['DISPATCHED', 'IN_PROGRESS'] },
  { key: 'done', label: 'Hoàn thành', status: ['COMPLETED'] },
  { key: 'overdue', label: 'Quá hạn thanh toán', debtStatus: 'OVERDUE' },
  { key: 'warning', label: 'Có cảnh báo', warning: true },
  { key: 'cancelled', label: 'Đã hủy', status: ['CANCELLED'] },
];

const SORTS = [
  { value: 'ORDER_DATE_DESC', label: 'Ngày đơn mới nhất' },
  { value: 'ORDER_DATE_ASC', label: 'Ngày đơn cũ nhất' },
  { value: 'DUE_DATE', label: 'Hạn thanh toán gần nhất' },
  { value: 'CODE', label: 'Mã đơn' },
];

/** WM-ORD-01 — Danh sách đơn hàng. */
export default function OrderListPage() {
  return (
    <RequirePermission permission="order.view">
      <OrderList />
    </RequirePermission>
  );
}

function OrderList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') ?? '');
  const q = useDebounced(search.trim());
  const quick = QUICK.find((x) => x.key === (params.get('view') ?? 'all')) ?? QUICK[0];
  const statusParam = params.get('status');
  const customerId = params.get('customerId');
  const dateFrom = params.get('from');
  const dateTo = params.get('to');
  const sort = params.get('sort') ?? 'ORDER_DATE_DESC';
  const paging = useCursorPaging();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const setParam = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true });
    paging.reset();
  };
  React.useEffect(() => paging.reset(), [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const filter = {
    search: q || null,
    status: statusParam ? [statusParam] : quick.status ?? null,
    debtStatus: quick.debtStatus ?? null,
    needsAction: quick.needsAction ?? null,
    warning: quick.warning ?? null,
    customerId: customerId || null,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
  };
  const { data, loading, error, refetch } = useQuery(OrdersQuery, { variables: { filter, first: paging.first, after: paging.after, sort } });
  const { data: totals } = useQuery(OrderTotalsQuery, { variables: { filter } });
  const { data: actionTotals } = useQuery(OrderTotalsQuery, { variables: { filter: { needsAction: true } } });
  const { data: overdueTotals } = useQuery(OrderTotalsQuery, { variables: { filter: { debtStatus: 'OVERDUE' } } });
  const [exportFile, { loading: exporting }] = useMutation(ExportFileMutation);
  const rows = data?.orders.nodes ?? [];

  /** Có ids → xuất đúng các đơn đang chọn; không → xuất theo bộ lọc hiện tại. */
  const doExport = async (ids?: string[]) => {
    try {
      const r = await exportFile({ variables: { input: { template: 'ORDERS', filter: ids?.length ? { ids } : filter } } });
      const url = r.data?.exportFile.url;
      if (url) window.open(url, '_blank');
      toast.success(`Đã xuất ${r.data?.exportFile.rowCount ?? 0} đơn`);
    } catch (e) {
      toast.error('Không xuất được Excel', apolloErrorMessage(e));
    }
  };

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã đơn', render: (r) => <CellLink to={paths.order(r.id)} className="font-mono font-medium text-text hover:text-accent hover:underline">{r.code}</CellLink> },
    { key: 'date', label: 'Ngày đơn', hideBelow: 'lg', render: (r) => formatDate(r.orderDate) },
    { key: 'customer', label: 'Khách hàng', render: (r) => <CellLink to={paths.customer(r.customer.id)} className="text-text hover:text-accent hover:underline">{r.customer.name}</CellLink> },
    { key: 'route', label: 'Tuyến', render: (r) => <span className="line-clamp-2 max-w-[280px] text-body-sm">{r.routeSummary ?? '—'}</span> },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (r) => (
        <span className="flex items-center gap-1.5">
          <StatusBadge meta={ORDER_STATUS} status={r.status} />
          {r.warnings.length ? (
            <Tooltip content={r.warnings.join(' · ')}>
              <AlertTriangle className="size-4 text-warning" aria-label="Cảnh báo" />
            </Tooltip>
          ) : null}
        </span>
      ),
    },
    { key: 'total', label: 'Tổng tiền', money: true, render: (r) => <MoneyCell value={r.totalAmount} /> },
    { key: 'paid', label: 'Đã thu', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.paidAmount} tone={r.paidAmount ? 'success' : 'muted'} /> },
    { key: 'remaining', label: 'Còn nợ', money: true, render: (r) => <MoneyCell value={r.remainingAmount} tone={r.remainingAmount > 0 ? (r.overdueDays > 0 ? 'danger' : 'warning') : 'muted'} /> },
    { key: 'due', label: 'Hạn thanh toán', hideBelow: 'md', render: (r) => (r.status === 'CANCELLED' ? '—' : <DueIndicator dueDate={r.dueDate} overdueDays={r.overdueDays} paid={r.totalAmount > 0 && r.remainingAmount <= 0 && r.paidAmount > 0} />) },
  ];

  const anyFilter = !!(q || statusParam || quick.key !== 'all' || customerId || dateFrom || dateTo);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Đơn hàng"
        subtitle="Đơn vận chuyển, trạng thái, tiền phải thu và hạn thanh toán"
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/bookings')}>
              <Inbox /> Yêu cầu từ khách
            </Button>
            <Button variant="secondary" loading={exporting} onClick={() => void doExport()}>
              <Download /> Xuất Excel
            </Button>
            {hasPermission('order.create') ? (
              <Button onClick={() => navigate(PATHS.orderNew)}>
                <Plus /> Tạo đơn
              </Button>
            ) : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Đơn theo bộ lọc" value={totals?.orderTotals.count ?? '—'} sub={totals ? `Tổng ${formatVnd(totals.orderTotals.totalAmount)}` : undefined} />
        <KpiCard label="Còn phải thu" value={totals ? formatVnd(totals.orderTotals.remainingAmount) : '—'} tone="warning" />
        <KpiCard label="Cần xử lý" value={actionTotals?.orderTotals.count ?? '—'} tone={actionTotals?.orderTotals.count ? 'warning' : 'neutral'} sub="Nháp · chờ xác nhận · chưa đủ xe" onClick={() => setParam({ view: 'action', status: null })} />
        <KpiCard
          label="Quá hạn thanh toán"
          value={overdueTotals ? formatVnd(overdueTotals.orderTotals.overdueAmount) : '—'}
          sub={overdueTotals ? `${overdueTotals.orderTotals.count} đơn` : undefined}
          tone={overdueTotals?.orderTotals.count ? 'danger' : 'neutral'}
          onClick={() => setParam({ view: 'overdue', status: null })}
        />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã đơn, khách hàng, tuyến"
        dateRange={{ from: dateFrom, to: dateTo, onChange: (r) => setParam({ from: r.from, to: r.to }) }}
        selects={[
          {
            key: 'status',
            placeholder: 'Trạng thái',
            value: statusParam ?? 'ALL',
            onChange: (v) => setParam({ status: v === 'ALL' ? null : v, view: null }),
            options: [{ value: 'ALL', label: 'Mọi trạng thái' }, ...Object.entries(ORDER_STATUS).map(([value, m]) => ({ value, label: m.label }))],
            width: 170,
          },
          { key: 'sort', placeholder: 'Sắp xếp', value: sort, onChange: (v) => setParam({ sort: v === 'ORDER_DATE_DESC' ? null : v }), options: SORTS, width: 200 },
        ]}
        chips={
          <>
            {QUICK.map((c) => (
              <FilterChip key={c.key} label={c.label} active={quick.key === c.key && !statusParam} onClick={() => setParam({ view: c.key === 'all' ? null : c.key, status: null })} />
            ))}
            {customerId ? <FilterChip label="Lọc theo khách" active onRemove={() => setParam({ customerId: null })} /> : null}
          </>
        }
      />
      {error ? (
        <ErrorState title="Không tải được danh sách đơn" error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            loading={loading && !data}
            selectable
            selected={selected}
            onSelectedChange={setSelected}
            bulkActions={(sel) => (
              <>
                {sel.size === 1 ? (
                  <Button size="sm" variant="secondary" onClick={() => navigate(paths.orderPrint([...sel][0]))}>
                    <Printer /> In phiếu
                  </Button>
                ) : null}
                <Button size="sm" variant="secondary" loading={exporting} onClick={() => void doExport([...sel])}>
                  <Download /> Xuất Excel ({sel.size})
                </Button>
              </>
            )}
            onRowClick={(r) => navigate(paths.order(r.id))}
            rowClassName={(r) => (r.status === 'CANCELLED' ? 'opacity-60' : undefined)}
            empty={
              <EmptyState
                icon={<ClipboardList strokeWidth={1.5} />}
                message={anyFilter ? 'Không có đơn khớp bộ lọc' : 'Chưa có đơn hàng'}
                action={
                  hasPermission('order.create') && !anyFilter ? (
                    <Button onClick={() => navigate(PATHS.orderNew)}>
                      <Plus /> Tạo đơn đầu tiên
                    </Button>
                  ) : null
                }
              />
            }
          />
          <Pagination
            hasNextPage={!!data?.orders.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.orders.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.orders.totalCount}
          />
        </>
      )}
    </div>
  );
}
