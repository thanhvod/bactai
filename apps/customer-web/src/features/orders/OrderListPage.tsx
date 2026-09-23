import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { formatDate, formatVnd } from '@bta/shared';
import { Banner, Button, DataTable, DueIndicator, EmptyState, FilterBar, FilterChip, KpiCard, MoneyCell, PageHeader, Pagination } from '@bta/shadcn';
import { MyOrdersQuery } from '@/graphql/operations';
import { paths } from '@/app/routes';
import { OrderStatusBadge } from '@/components/ui';
import { useCursorPage } from '@/lib/use-cursor-page';

const CHIPS: { key: string; label: string; status?: string[]; unpaid?: boolean }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'running', label: 'Đang thực hiện', status: ['CONFIRMED', 'DISPATCHED', 'IN_PROGRESS'] },
  { key: 'done', label: 'Hoàn thành', status: ['COMPLETED'] },
  { key: 'unpaid', label: 'Còn phải trả', unpaid: true },
];

/** CW-ORD-01 — Lịch sử đơn hàng khách (customer-safe). */
export default function OrderListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [chip, setChip] = React.useState('all');
  const [range, setRange] = React.useState<{ from: string | null; to: string | null }>({ from: null, to: null });
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(keyword.trim()), 300);
    return () => clearTimeout(t);
  }, [keyword]);
  const c = CHIPS.find((x) => x.key === chip)!;
  const filter = {
    ...(debounced ? { keyword: debounced } : {}),
    ...(c.status ? { status: c.status } : {}),
    ...(c.unpaid ? { unpaidOnly: true } : {}),
    ...(range.from ? { dateFrom: range.from } : {}),
    ...(range.to ? { dateTo: range.to } : {}),
  };
  const page = useCursorPage(20, JSON.stringify(filter));
  const { data, loading, error, refetch } = useQuery(MyOrdersQuery, { variables: { filter, ...page.variables } });
  const conn = data?.myOrders;
  const sum = data?.myDebtSummary;
  type Row = NonNullable<typeof conn>['nodes'][number];

  return (
    <div className="space-y-4">
      <PageHeader title="Đơn hàng" subtitle="Đơn nhà xe đã tạo cho bạn (từ yêu cầu hoặc đặt qua điện thoại)" actions={<Button variant="secondary" asChild><Link to={paths.debt()}>Xem bảng kê</Link></Button>} />
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Tổng giá trị đơn" value={formatVnd(sum?.total ?? 0)} loading={!sum && loading} />
        <KpiCard label="Còn phải trả" value={formatVnd(sum?.remaining ?? 0)} sub={sum ? `${sum.openOrders} đơn` : undefined} tone={sum && sum.remaining > 0 ? 'warning' : 'neutral'} loading={!sum && loading} />
        <KpiCard label="Quá hạn" value={formatVnd(sum?.overdue ?? 0)} tone={sum && sum.overdue > 0 ? 'danger' : 'neutral'} loading={!sum && loading} onClick={() => setChip('unpaid')} />
      </div>
      <FilterBar
        search={keyword}
        onSearchChange={setKeyword}
        searchPlaceholder="Tìm mã đơn, tuyến"
        dateRange={{ from: range.from, to: range.to, onChange: setRange }}
        chips={CHIPS.map((x) => <FilterChip key={x.key} label={x.label} active={chip === x.key} onClick={() => setChip(x.key)} />)}
      />
      {error ? <Banner tone="danger" message="Không tải được đơn hàng" action={<Button size="sm" variant="secondary" onClick={() => refetch()}>Thử lại</Button>} /> : null}
      <DataTable<Row>
        rowKey={(r) => r.id}
        loading={loading && !data}
        rows={conn?.nodes ?? []}
        onRowClick={(r) => navigate(paths.order(r.id))}
        empty={<EmptyState message="Chưa có đơn hàng" action={<Button variant="secondary" asChild><Link to="/">Gửi yêu cầu vận chuyển</Link></Button>} />}
        columns={[
          { key: 'code', label: 'Mã đơn', render: (r) => <span className="text-body-strong text-accent">{r.code}</span> },
          { key: 'date', label: 'Ngày đơn', render: (r) => formatDate(r.orderDate) },
          { key: 'merchant', label: 'Nhà xe', render: (r) => r.merchantName, hideBelow: 'md' },
          { key: 'route', label: 'Tuyến', render: (r) => r.routeSummary ?? '—' },
          { key: 'status', label: 'Trạng thái', render: (r) => <OrderStatusBadge status={r.status} /> },
          { key: 'total', label: 'Tổng tiền', money: true, align: 'right', render: (r) => <MoneyCell value={r.totalAmount} /> },
          { key: 'paid', label: 'Đã trả', money: true, align: 'right', render: (r) => <MoneyCell value={r.paidAmount} tone="muted" />, hideBelow: 'lg' },
          {
            key: 'remaining',
            label: 'Còn phải trả',
            money: true,
            align: 'right',
            render: (r) => (r.status === 'PENDING_CONFIRMATION' ? <span className="text-text-subtle">Chờ xác nhận</span> : <MoneyCell value={r.remainingAmount} strong tone={r.remainingAmount > 0 ? 'warning' : 'muted'} />),
          },
          { key: 'due', label: 'Hạn thanh toán', render: (r) => (r.dueDate ? <DueIndicator dueDate={r.dueDate} overdueDays={r.overdueDays} paid={r.remainingAmount <= 0} /> : '—'), hideBelow: 'md' },
          {
            key: 'booking',
            label: 'Booking',
            hideBelow: 'lg',
            render: (r) =>
              r.bookingId ? (
                <Link className="text-accent hover:underline" to={paths.booking(r.bookingId)} onClick={(e) => e.stopPropagation()}>
                  {r.bookingCode}
                </Link>
              ) : (
                '—'
              ),
          },
        ]}
      />
      {conn ? (
        <Pagination hasNextPage={conn.pageInfo.hasNextPage} hasPrevPage={page.hasPrev} onNext={() => page.next(conn.pageInfo.endCursor)} onPrev={page.prev} pageSize={page.pageSize} shown={conn.nodes.length} total={conn.totalCount} />
      ) : null}
    </div>
  );
}
