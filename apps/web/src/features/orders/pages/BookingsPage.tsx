import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, ClipboardPlus, Inbox, Send, XCircle } from 'lucide-react';
import {
  Banner,
  Button,
  DataTable,
  DescriptionList,
  Drawer,
  EmptyState,
  EntityPicker,
  ErrorState,
  FilterBar,
  FilterChip,
  FormField,
  PageHeader,
  Pagination,
  SensitiveActionModal,
  Skeleton,
  StatusBadge,
  Textarea,
  Timeline,
  toast,
  type DataTableColumn,
  type PickerItem,
} from '@bta/shadcn';
import { BOOKING_STATUS, STOP_TYPE, formatDateTime, labelOf } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { BookingFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { CellLink, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { AcceptBookingMutation, AddBookingNoteMutation, BookingDetailQuery, BookingsQuery, CustomerPickQuery, RejectBookingMutation } from '../graphql/orders';

type Row = BookingFieldsFragment;

/**
 * Yêu cầu vận chuyển từ Web Khách hàng (phase 3) — phía nhà xe tiếp nhận (không có screen ID riêng; cầu nối CW-BOOK-* ↔ WM-ORD-03).
 * Booking KHÔNG tự thành đơn: operation tiếp nhận, liên kết khách hàng, rồi "Tạo đơn từ yêu cầu".
 */
export default function BookingsPage() {
  return (
    <RequirePermission permission="order.view">
      <Bookings />
    </RequirePermission>
  );
}

function Bookings() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [openId, setOpenId] = useQueryParam('booking');
  const [search, setSearch] = React.useState('');
  const q = useDebounced(search.trim());
  const view = params.get('view') ?? 'pending';
  const paging = useCursorPaging();
  const status = view === 'pending' ? ['SUBMITTED', 'ACCEPTED'] : view === 'all' ? null : [view];
  const { data, loading, error, refetch } = useQuery(BookingsQuery, { variables: { filter: { status, keyword: q || null }, first: paging.first, after: paging.after }, pollInterval: 60_000 });
  const set = (v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set('view', v);
    else next.delete('view');
    setParams(next, { replace: true });
    paging.reset();
  };
  const cols: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã yêu cầu', render: (b) => <span className="font-mono font-medium">{b.code}</span> },
    { key: 'at', label: 'Gửi lúc', render: (b) => formatDateTime(b.createdAt) },
    { key: 'who', label: 'Khách', render: (b) => <span className="flex flex-col"><span>{b.customerName ?? b.accountName ?? b.contactName}</span><span className="text-caption text-text-muted">{b.contactName} · {b.contactPhone}</span></span> },
    { key: 'route', label: 'Tuyến', render: (b) => <span className="line-clamp-2 max-w-[280px] text-body-sm">{b.stops.map((s) => s.locationName ?? s.address).join(' → ')}</span> },
    { key: 'cargo', label: 'Hàng', render: (b) => [b.cargoName, b.weightTon ? `${b.weightTon} tấn` : null].filter(Boolean).join(' · ') },
    { key: 'pickup', label: 'Lấy từ', hideBelow: 'lg', render: (b) => (b.pickupFrom ? formatDateTime(b.pickupFrom) : '—') },
    { key: 'status', label: 'Trạng thái', render: (b) => <StatusBadge meta={BOOKING_STATUS} status={b.status} /> },
    { key: 'order', label: 'Đơn', render: (b) => (b.orderId ? <CellLink to={paths.order(b.orderId)}>{b.orderCode}</CellLink> : '—') },
  ];
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Yêu cầu từ khách" subtitle="Booking khách gửi qua Web Khách hàng — tiếp nhận rồi tạo đơn (booking không tự thành đơn)" actions={<Button variant="secondary" onClick={() => navigate(PATHS.orders)}>Danh sách đơn</Button>} />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã, hàng, người liên hệ, SĐT"
        chips={[
          { k: 'pending', l: 'Cần xử lý' },
          { k: 'SUBMITTED', l: 'Chờ tiếp nhận' },
          { k: 'ACCEPTED', l: 'Đã tiếp nhận' },
          { k: 'CONVERTED', l: 'Đã tạo đơn' },
          { k: 'REJECTED', l: 'Từ chối' },
          { k: 'CANCELLED', l: 'Khách hủy' },
          { k: 'all', l: 'Tất cả' },
        ].map((c) => <FilterChip key={c.k} label={c.l} active={view === c.k} onClick={() => set(c.k === 'pending' ? null : c.k)} />)}
      />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable columns={cols} rows={data?.bookings.nodes ?? []} rowKey={(b) => b.id} loading={loading && !data} onRowClick={(b) => setOpenId(b.id)} empty={<EmptyState icon={<Inbox strokeWidth={1.5} />} message={view === 'pending' ? 'Không có yêu cầu cần xử lý' : 'Không có yêu cầu khớp bộ lọc'} />} />
          <Pagination
            hasNextPage={!!data?.bookings.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.bookings.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={data?.bookings.nodes.length ?? 0}
            total={data?.bookings.totalCount}
          />
        </>
      )}
      <BookingDrawer id={openId} onClose={() => setOpenId(null)} onChanged={() => void refetch()} />
    </div>
  );
}

function BookingDrawer({ id, onClose, onChanged }: { id: string | null; onClose: () => void; onChanged: () => void }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data, loading, error, refetch } = useQuery(BookingDetailQuery, { variables: { id: id ?? '' }, skip: !id });
  const [accept, { loading: accepting }] = useMutation(AcceptBookingMutation);
  const [reject, { loading: rejecting }] = useMutation(RejectBookingMutation);
  const [addNote, { loading: noting }] = useMutation(AddBookingNoteMutation);
  const [customerId, setCustomerId] = React.useState<string | null>(null);
  const [custSearch, setCustSearch] = React.useState('');
  const dq = useDebounced(custSearch);
  const { data: customers, loading: loadingCust } = useQuery(CustomerPickQuery, { variables: { search: dq || null }, skip: !id });
  const [note, setNote] = React.useState('');
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const b = data?.booking;
  React.useEffect(() => setCustomerId(b?.customerId ?? null), [b?.id, b?.customerId]);
  const canManage = hasPermission('booking.manage');
  const after = () => {
    void refetch();
    onChanged();
  };
  const items: PickerItem[] = [
    ...(b?.customerId && !customers?.customers.nodes.some((c) => c.id === b.customerId) ? [{ id: b.customerId, label: b.customerName ?? 'Khách đã liên kết' }] : []),
    ...(customers?.customers.nodes ?? []).map((c) => ({ id: c.id, label: c.name, code: c.code, description: c.phone, inactive: c.status === 'INACTIVE' })),
  ];
  return (
    <Drawer
      open={!!id}
      onOpenChange={(o) => !o && onClose()}
      width={720}
      title={b ? `Yêu cầu ${b.code}` : 'Yêu cầu vận chuyển'}
      description={b ? `${b.accountName ?? ''}${b.accountEmail ? ` · ${b.accountEmail}` : ''}` : undefined}
      footer={
        b && canManage && (b.status === 'SUBMITTED' || b.status === 'ACCEPTED') ? (
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(true)}>
              <XCircle /> Từ chối
            </Button>
            {b.status === 'SUBMITTED' ? (
              <Button
                variant="secondary"
                loading={accepting}
                onClick={async () => {
                  try {
                    await accept({ variables: { id: b.id, customerId } });
                    toast.success('Đã tiếp nhận — khách nhận thông báo');
                    after();
                  } catch (e) {
                    toast.error('Không tiếp nhận được', apolloErrorMessage(e));
                  }
                }}
              >
                <CheckCircle2 /> Tiếp nhận
              </Button>
            ) : null}
            {hasPermission('order.create') ? (
              <Button
                onClick={async () => {
                  if (customerId && customerId !== b.customerId && b.status === 'SUBMITTED') {
                    try {
                      await accept({ variables: { id: b.id, customerId } });
                    } catch (e) {
                      toast.error('Không liên kết được khách', apolloErrorMessage(e));
                      return;
                    }
                  }
                  navigate(`${PATHS.orderNew}?bookingId=${b.id}${customerId ? `&customerId=${customerId}` : ''}`);
                }}
              >
                <ClipboardPlus /> Tạo đơn từ yêu cầu
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : loading && !b ? (
        <Skeleton h={300} />
      ) : !b ? null : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <StatusBadge meta={BOOKING_STATUS} status={b.status} />
            {b.orderId ? (
              <span className="text-body-sm">
                Đơn <CellLink to={paths.order(b.orderId)}>{b.orderCode}</CellLink>
              </span>
            ) : null}
          </div>
          {b.rejectReason ? <Banner tone="danger" message={`Đã từ chối: ${b.rejectReason}`} /> : null}
          {b.cancelReason ? <Banner tone="neutral" message={`Khách hủy: ${b.cancelReason}`} /> : null}
          {canManage && (b.status === 'SUBMITTED' || b.status === 'ACCEPTED') ? (
            <FormField label="Liên kết khách hàng của nhà xe" hint="Chọn hồ sơ khách để tạo đơn và cho khách xem lịch sử đơn/bảng kê trên Web Khách hàng.">
              <EntityPicker items={items} value={customerId} onChange={(v) => setCustomerId(v)} onSearch={setCustSearch} loading={loadingCust} placeholder="Tìm khách hàng" />
            </FormField>
          ) : null}
          <div className="flex flex-col gap-2">
            <h3 className="text-heading-sm">Điểm lấy / trả</h3>
            <ol className="flex flex-col gap-2">
              {b.stops.map((s, i) => (
                <li key={i} className="flex gap-2 text-body-sm">
                  <StatusBadge meta={STOP_TYPE} status={s.type} outline />
                  <span className="flex flex-col">
                    <span className="font-medium">{s.locationName ?? s.address}</span>
                    <span className="text-text-muted">{s.address}</span>
                    <span className="text-caption text-text-subtle">{[s.contactName, s.contactPhone, s.note].filter(Boolean).join(' · ')}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <DescriptionList
            columns={2}
            items={[
              { label: 'Hàng hóa', value: b.cargoName },
              { label: 'Khối lượng / kiện', value: [b.weightTon ? `${b.weightTon} tấn` : null, b.packages ? `${b.packages} kiện` : null].filter(Boolean).join(' · ') || null },
              { label: 'Loại xe gợi ý', value: b.vehicleTypeHint },
              { label: 'Yêu cầu thêm', value: [b.fragile ? 'Dễ vỡ' : null, b.loadingAtPickup ? 'Bốc xếp điểm lấy' : null, b.loadingAtDrop ? 'Bốc xếp điểm trả' : null].filter(Boolean).join(', ') || null },
              { label: 'Lấy hàng từ', value: b.pickupFrom ? formatDateTime(b.pickupFrom) : null },
              { label: 'Giao trước', value: b.deliverBefore ? formatDateTime(b.deliverBefore) : null },
              { label: 'Linh hoạt', value: b.flexibility },
              { label: 'Liên hệ', value: `${b.contactName} · ${b.contactPhone}` },
              { label: 'Ghi chú', value: b.note, span: 2 },
            ]}
          />
          <div className="flex flex-col gap-2">
            <h3 className="text-heading-sm">Trao đổi với khách</h3>
            <Timeline
              entries={(b.notes ?? []).map((n) => ({ id: n.id, time: formatDateTime(n.createdAt), actor: `${n.authorName ?? ''} (${n.authorType === 'CUSTOMER' ? 'khách' : 'nhà xe'})`, action: n.body, tone: n.authorType === 'CUSTOMER' ? 'info' : 'primary' }))}
              emptyText="Chưa có trao đổi"
            />
            {canManage ? (
              <div className="flex gap-2">
                <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhắn khách (báo giá, xác nhận giờ…)" />
                <Button
                  variant="secondary"
                  loading={noting}
                  disabled={!note.trim()}
                  onClick={async () => {
                    try {
                      await addNote({ variables: { bookingId: b.id, body: note.trim() } });
                      setNote('');
                      toast.success('Đã gửi — khách nhận thông báo');
                      void refetch();
                    } catch (e) {
                      toast.error('Không gửi được', apolloErrorMessage(e));
                    }
                  }}
                >
                  <Send /> Gửi
                </Button>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-heading-sm">Lịch sử trạng thái</h3>
            <Timeline entries={(b.statusHistory ?? []).map((h, i) => ({ id: String(i), time: formatDateTime(h.changedAt), actor: h.actorName ?? '', action: `${h.fromStatus ? `${labelOf(BOOKING_STATUS, h.fromStatus)} → ` : ''}${labelOf(BOOKING_STATUS, h.toStatus)}`, reason: h.reason ?? undefined }))} />
          </div>
        </div>
      )}
      <SensitiveActionModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        action={`Từ chối yêu cầu ${b?.code ?? ''}`}
        description="Khách nhận thông báo kèm lý do."
        confirmLabel="Từ chối"
        loading={rejecting}
        onConfirm={async (reason) => {
          try {
            await reject({ variables: { id: b!.id, reason } });
            toast.success('Đã từ chối yêu cầu');
            setRejectOpen(false);
            after();
          } catch (e) {
            toast.error('Không từ chối được', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </Drawer>
  );
}
