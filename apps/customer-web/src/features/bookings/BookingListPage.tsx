import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Plus } from 'lucide-react';
import { BOOKING_STATUS, formatDate, formatDateTime } from '@bta/shared';
import { Banner, Button, DataTable, EmptyState, FilterBar, FilterChip, PageHeader, Pagination } from '@bta/shadcn';
import { MyBookingsQuery } from '@/graphql/operations';
import { paths } from '@/app/routes';
import { BookingStatusBadge, routeOf } from '@/components/ui';
import { useCursorPage } from '@/lib/use-cursor-page';

const STATUS_CHIPS = ['SUBMITTED', 'ACCEPTED', 'CONVERTED', 'REJECTED', 'CANCELLED'] as const;

/** CW-BOOK-02 — Danh sách booking của tôi. */
export default function BookingListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [status, setStatus] = React.useState<string | null>(null);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(keyword.trim()), 300);
    return () => clearTimeout(t);
  }, [keyword]);
  const page = useCursorPage(20, `${debounced}|${status}`);
  const filter = { ...(debounced ? { keyword: debounced } : {}), ...(status ? { status: [status] } : {}) };
  const { data, loading, error, refetch } = useQuery(MyBookingsQuery, { variables: { filter, ...page.variables } });
  const conn = data?.myBookings;
  type Row = NonNullable<typeof conn>['nodes'][number];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Booking của tôi"
        subtitle="Theo dõi yêu cầu vận chuyển đã gửi và đơn hàng nhà xe tạo từ yêu cầu"
        actions={
          <Button asChild>
            <Link to="/">
              <Plus /> Tạo yêu cầu mới
            </Link>
          </Button>
        }
      />
      <FilterBar
        search={keyword}
        onSearchChange={setKeyword}
        searchPlaceholder="Tìm mã booking, hàng hóa"
        chips={
          <>
            <FilterChip label="Tất cả" active={!status} onClick={() => setStatus(null)} />
            {STATUS_CHIPS.map((s) => (
              <FilterChip key={s} label={BOOKING_STATUS[s].label} active={status === s} onClick={() => setStatus(status === s ? null : s)} />
            ))}
          </>
        }
      />
      {error ? <Banner tone="danger" message="Không tải được danh sách booking" action={<Button size="sm" variant="secondary" onClick={() => refetch()}>Thử lại</Button>} /> : null}
      <DataTable<Row>
        rowKey={(r) => r.id}
        loading={loading && !data}
        rows={conn?.nodes ?? []}
        onRowClick={(r) => navigate(paths.booking(r.id))}
        empty={
          <EmptyState
            message={status || debounced ? 'Không có booking phù hợp bộ lọc' : 'Bạn chưa gửi yêu cầu nào'}
            action={
              <Button variant="secondary" asChild>
                <Link to="/">Tìm nhà xe</Link>
              </Button>
            }
          />
        }
        columns={[
          { key: 'code', label: 'Mã', render: (r) => <span className="text-body-strong text-accent">{r.code}</span> },
          { key: 'merchant', label: 'Nhà xe', render: (r) => r.merchantName },
          { key: 'route', label: 'Tuyến', render: (r) => routeOf(r.stops) || '—' },
          { key: 'pickup', label: 'Lấy hàng', render: (r) => (r.pickupFrom ? formatDateTime(r.pickupFrom) : '—'), hideBelow: 'md' },
          { key: 'cargo', label: 'Hàng hóa', render: (r) => [r.cargoName, r.weightTon ? `${r.weightTon} tấn` : null].filter(Boolean).join(' · '), hideBelow: 'lg' },
          { key: 'status', label: 'Trạng thái', render: (r) => <BookingStatusBadge status={r.status} /> },
          {
            key: 'order',
            label: 'Đơn liên kết',
            render: (r) =>
              r.orderId ? (
                <Link to={paths.order(r.orderId)} className="text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
                  {r.orderCode}
                </Link>
              ) : (
                <span className="text-text-subtle">—</span>
              ),
          },
          { key: 'created', label: 'Ngày gửi', render: (r) => formatDate(r.createdAt), hideBelow: 'md' },
        ]}
      />
      {conn ? (
        <Pagination
          hasNextPage={conn.pageInfo.hasNextPage}
          hasPrevPage={page.hasPrev}
          onNext={() => page.next(conn.pageInfo.endCursor)}
          onPrev={page.prev}
          pageSize={page.pageSize}
          shown={conn.nodes.length}
          total={conn.totalCount}
        />
      ) : null}
    </div>
  );
}
