import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Button, DataTable, DueIndicator, EmptyState, ErrorState, FilterBar, MoneyCell, Pagination, StatusBadge, SummaryStrip, type DataTableColumn } from '@bta/shadcn';
import { ORDER_STATUS, formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS, paths } from '@/app/routes';
import type { OrderListFieldsFragment } from '@/gql/graphql';
import { CellLink, useCursorPaging } from '@/features/master-data/helpers';
import { OrderTotalsQuery, OrdersQuery } from '../graphql/orders';

/** WM-CUS-06 — Lịch sử đơn của khách (tab trên chi tiết khách). */
export function CustomerOrdersTab({ customerId, canCreate = true }: { customerId: string; canCreate?: boolean }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [status, setStatus] = React.useState<string>('ALL');
  const [range, setRange] = React.useState<{ from: string | null; to: string | null }>({ from: null, to: null });
  const paging = useCursorPaging(10);
  const filter = { customerId, status: status === 'ALL' ? null : [status], dateFrom: range.from, dateTo: range.to };
  const { data, loading, error, refetch } = useQuery(OrdersQuery, { variables: { filter, first: paging.first, after: paging.after } });
  const { data: totals } = useQuery(OrderTotalsQuery, { variables: { filter } });
  const cols: DataTableColumn<OrderListFieldsFragment>[] = [
    { key: 'code', label: 'Mã đơn', render: (r) => <CellLink to={paths.order(r.id)}>{r.code}</CellLink> },
    { key: 'date', label: 'Ngày đơn', render: (r) => formatDate(r.orderDate) },
    { key: 'route', label: 'Tuyến', render: (r) => <span className="line-clamp-1 max-w-[260px]">{r.routeSummary ?? '—'}</span> },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={ORDER_STATUS} status={r.status} /> },
    { key: 'total', label: 'Tổng tiền', money: true, render: (r) => <MoneyCell value={r.totalAmount} /> },
    { key: 'paid', label: 'Đã thu', money: true, render: (r) => <MoneyCell value={r.paidAmount} /> },
    { key: 'rem', label: 'Còn lại', money: true, render: (r) => <MoneyCell value={r.remainingAmount} tone={r.remainingAmount > 0 ? (r.overdueDays > 0 ? 'danger' : 'warning') : 'muted'} /> },
    { key: 'due', label: 'Hạn', render: (r) => (r.status === 'CANCELLED' ? '—' : <DueIndicator dueDate={r.dueDate} overdueDays={r.overdueDays} paid={r.remainingAmount <= 0 && r.paidAmount > 0} />) },
  ];
  const t = totals?.orderTotals;
  return (
    <div className="flex flex-col gap-3">
      <SummaryStrip
        items={[
          { label: 'Số đơn', value: t?.count ?? '—' },
          { label: 'Tổng tiền', value: t ? formatVnd(t.totalAmount) : '—' },
          { label: 'Đã thu', value: t ? formatVnd(t.paidAmount) : '—', tone: 'success' },
          { label: 'Còn lại', value: t ? formatVnd(t.remainingAmount) : '—', tone: t?.remainingAmount ? 'warning' : undefined },
          { label: 'Quá hạn', value: t ? formatVnd(t.overdueAmount) : '—', tone: t?.overdueAmount ? 'danger' : undefined },
        ]}
      />
      <FilterBar
        dateRange={{ from: range.from, to: range.to, onChange: (r) => (setRange(r), paging.reset()) }}
        selects={[{ key: 'st', placeholder: 'Trạng thái', value: status, onChange: (v) => (setStatus(v), paging.reset()), options: [{ value: 'ALL', label: 'Mọi trạng thái' }, ...Object.entries(ORDER_STATUS).map(([value, m]) => ({ value, label: m.label }))], width: 170 }]}
        right={
          canCreate && hasPermission('order.create') ? (
            <Button size="sm" onClick={() => navigate(`${PATHS.orderNew}?customerId=${customerId}`)}>
              <Plus /> Tạo đơn
            </Button>
          ) : null
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable columns={cols} rows={data?.orders.nodes ?? []} rowKey={(r) => r.id} compact loading={loading && !data} onRowClick={(r) => navigate(paths.order(r.id))} empty={<EmptyState compact message="Khách chưa có đơn khớp bộ lọc" />} />
          <Pagination hasNextPage={!!data?.orders.pageInfo.hasNextPage} hasPrevPage={paging.hasPrev} onNext={() => paging.next(data?.orders.pageInfo.endCursor)} onPrev={paging.prev} pageSize={paging.pageSize} onPageSizeChange={paging.setPageSize} shown={data?.orders.nodes.length ?? 0} total={data?.orders.totalCount} />
        </>
      )}
    </div>
  );
}
