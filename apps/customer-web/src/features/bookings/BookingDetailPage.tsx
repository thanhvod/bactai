import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { BOOKING_STATUS, STOP_TYPE, formatDate, formatDateTime, formatVnd, labelOf } from '@bta/shared';
import { Banner, Button, DescriptionList, DetailSkeleton, Dialog, EmptyState, FormField, PageHeader, StatusStepper, Textarea, toast } from '@bta/shadcn';
import { AddBookingNoteMutation, CancelBookingMutation, MyBookingQuery } from '@/graphql/operations';
import { apolloErrorMessage } from '@/lib/apollo';
import { paths } from '@/app/routes';
import { BookingStatusBadge, InlineError, Panel } from '@/components/ui';

const STEPS = [
  { key: 'SUBMITTED', label: 'Đã gửi' },
  { key: 'ACCEPTED', label: 'Nhà xe tiếp nhận' },
  { key: 'CONVERTED', label: 'Đã tạo đơn' },
];

/** CW-BOOK-03 — Chi tiết booking: nội dung, trao đổi ghi chú, lịch sử trạng thái, đơn liên kết. */
export default function BookingDetailPage() {
  const { bookingId = '' } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(MyBookingQuery, { variables: { id: bookingId }, pollInterval: 60_000 });
  const [note, setNote] = React.useState('');
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [cancelError, setCancelError] = React.useState<string | null>(null);
  const [addNote, noteState] = useMutation(AddBookingNoteMutation);
  const [cancel, cancelState] = useMutation(CancelBookingMutation, { refetchQueries: [{ query: MyBookingQuery, variables: { id: bookingId } }] });

  if (loading && !data) return <DetailSkeleton />;
  const b = data?.myBooking;
  if (error || !b)
    return (
      <EmptyState
        message="Không tìm thấy yêu cầu"
        description="Yêu cầu không tồn tại hoặc không thuộc tài khoản của bạn."
        action={<Button asChild><Link to={paths.bookings()}>Về Booking của tôi</Link></Button>}
      />
    );

  const pending = b.status === 'SUBMITTED';
  const adj = (b.orderAdjustments ?? null) as { freightAmount?: number; dueDate?: string | null; note?: string } | null;
  const lastCancel = [...b.statusHistory].reverse().find((h) => h.toStatus === 'CANCELLED' || h.toStatus === 'REJECTED');

  return (
    <div className="space-y-5">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {b.code} <BookingStatusBadge status={b.status} />
          </span>
        }
        subtitle={`${b.merchantName} · gửi ${formatDateTime(b.createdAt)}`}
        breadcrumb={[{ label: 'Booking của tôi', to: paths.bookings() }, { label: b.code }]}
        actions={
          <>
            {b.orderId ? (
              <Button asChild>
                <Link to={paths.order(b.orderId)}>Xem đơn {b.orderCode}</Link>
              </Button>
            ) : null}
            <Button variant="secondary" disabled={!pending} title={pending ? undefined : 'Chỉ sửa được khi Chờ tiếp nhận'} onClick={() => navigate(paths.bookingEdit(b.id))}>
              Sửa yêu cầu
            </Button>
            <Button variant="destructive-outline" disabled={!pending} title={pending ? undefined : 'Chỉ hủy được khi Chờ tiếp nhận'} onClick={() => setCancelOpen(true)}>
              Hủy yêu cầu
            </Button>
          </>
        }
      />

      {pending ? <Banner tone="info" message="Chờ nhà xe tiếp nhận. Bạn vẫn có thể sửa hoặc hủy yêu cầu." /> : null}
      {b.status === 'CANCELLED' ? <Banner tone="neutral" message={`Đã hủy: ${b.cancelReason ?? '—'}${lastCancel?.actorName ? ` (${lastCancel.actorName})` : ''}`} /> : null}
      {b.status === 'REJECTED' ? <Banner tone="danger" message={`Nhà xe từ chối: ${b.rejectReason ?? '—'}`} /> : null}
      {!pending && b.status !== 'CANCELLED' && b.status !== 'REJECTED' ? (
        <p className="text-body-sm text-text-muted">Yêu cầu đã được nhà xe xử lý nên không sửa/hủy được. Liên hệ nhà xe nếu cần thay đổi.</p>
      ) : null}

      {['SUBMITTED', 'ACCEPTED', 'CONVERTED'].includes(b.status) ? (
        <Panel>
          <StatusStepper
            current={b.status}
            steps={STEPS.map((s) => ({ ...s, at: (() => { const h = b.statusHistory.find((x) => x.toStatus === s.key); return h ? formatDateTime(h.changedAt) : undefined; })() }))}
          />
        </Panel>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Panel title="Điểm lấy / trả">
            <ol className="space-y-3">
              {b.stops.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-caption">{i + 1}</span>
                  <div>
                    <p className="text-body-strong">
                      {labelOf(STOP_TYPE, s.type)}
                      {s.locationName ? ` · ${s.locationName}` : ''}
                    </p>
                    <p className="text-body">{s.address}</p>
                    {s.contactName || s.contactPhone ? <p className="text-body-sm text-text-muted">{[s.contactName, s.contactPhone].filter(Boolean).join(' · ')}</p> : null}
                    {s.note ? <p className="text-body-sm text-text-muted">{s.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel title="Hàng hóa & thời gian">
            <DescriptionList
              items={[
                { label: 'Hàng hóa', value: b.cargoName },
                { label: 'Khối lượng / số kiện', value: [b.weightTon ? `${b.weightTon} tấn` : null, b.packages ? `${b.packages} kiện` : null].filter(Boolean).join(' · ') || '—' },
                { label: 'Loại xe mong muốn', value: b.vehicleTypeHint || '—' },
                { label: 'Yêu cầu thêm', value: [b.fragile ? 'Hàng dễ vỡ' : null, b.loadingAtPickup ? 'Bốc xếp điểm lấy' : null, b.loadingAtDrop ? 'Bốc xếp điểm trả' : null].filter(Boolean).join(', ') || '—' },
                { label: 'Lấy hàng từ', value: b.pickupFrom ? formatDateTime(b.pickupFrom) : '—' },
                { label: 'Giao trước', value: b.deliverBefore ? formatDateTime(b.deliverBefore) : '—' },
                { label: 'Linh hoạt', value: b.flexibility || '—' },
                { label: 'Liên hệ', value: `${b.contactName} · ${b.contactPhone}` },
                { label: 'Ghi chú', value: b.note || '—', span: 2 },
              ]}
            />
          </Panel>
          {adj && b.orderId ? (
            <Panel title="Nhà xe điều chỉnh khi tạo đơn">
              <DescriptionList
                items={[
                  { label: 'Đơn hàng', value: <Link className="text-accent hover:underline" to={paths.order(b.orderId)}>{b.orderCode}</Link> },
                  { label: 'Giá cước', value: adj.freightAmount != null ? formatVnd(adj.freightAmount) : '—' },
                  { label: 'Hạn thanh toán', value: adj.dueDate ? formatDate(adj.dueDate) : '—' },
                ]}
              />
              {adj.note ? <p className="mt-2 text-body-sm text-text-muted">{adj.note}</p> : null}
            </Panel>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Panel title="Trao đổi với nhà xe">
            {b.notes.length === 0 ? <p className="mb-3 text-body-sm text-text-muted">Chưa có ghi chú.</p> : null}
            <ul className="mb-3 space-y-3">
              {b.notes.map((n) => (
                <li key={n.id} className={n.authorType === 'CUSTOMER' ? 'rounded-md bg-accent-soft p-2' : 'rounded-md bg-surface-muted p-2'}>
                  <p className="text-caption text-text-muted">
                    {n.authorType === 'CUSTOMER' ? 'Bạn' : n.authorName ?? 'Nhà xe'} · {formatDateTime(n.createdAt)}
                  </p>
                  <p className="whitespace-pre-line text-body">{n.body}</p>
                </li>
              ))}
            </ul>
            <form
              className="space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!note.trim()) return;
                try {
                  await addNote({ variables: { bookingId: b.id, body: note.trim() } });
                  setNote('');
                } catch (err) {
                  toast.error('Không gửi được ghi chú', apolloErrorMessage(err));
                }
              }}
            >
              <Textarea aria-label="Nội dung ghi chú" rows={3} placeholder="Nhắn cho nhà xe…" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button type="submit" size="sm" loading={noteState.loading} disabled={!note.trim()}>
                Gửi ghi chú
              </Button>
            </form>
          </Panel>
          <Panel title="Lịch sử trạng thái">
            <ol className="space-y-2">
              {b.statusHistory.map((h, i) => (
                <li key={i} className="text-body-sm">
                  <span className="text-text">{labelOf(BOOKING_STATUS, h.toStatus)}</span>
                  <span className="text-text-muted"> · {formatDateTime(h.changedAt)}{h.actorName ? ` · ${h.actorName}` : ''}</span>
                  {h.reason ? <p className="text-text-muted">Lý do: {h.reason}</p> : null}
                </li>
              ))}
            </ol>
          </Panel>
        </aside>
      </div>

      <Dialog
        open={cancelOpen}
        onOpenChange={(o) => {
          setCancelOpen(o);
          if (!o) setCancelError(null);
        }}
        title={`Hủy yêu cầu ${b.code}`}
        description="Yêu cầu sẽ không còn hiển thị để nhà xe tiếp nhận."
        danger
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Quay lại
            </Button>
            <Button
              variant="destructive"
              loading={cancelState.loading}
              onClick={async () => {
                if (reason.trim().length < 3) return setCancelError('Vui lòng nhập lý do hủy');
                try {
                  await cancel({ variables: { id: b.id, reason: reason.trim() } });
                  toast.success('Đã hủy yêu cầu');
                  setCancelOpen(false);
                } catch (err) {
                  setCancelError(apolloErrorMessage(err));
                }
              }}
            >
              Hủy yêu cầu
            </Button>
          </>
        }
      >
        <FormField label="Lý do hủy" required htmlFor="cancel-reason">
          <Textarea id="cancel-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </FormField>
        <div className="mt-2">
          <InlineError>{cancelError}</InlineError>
        </div>
      </Dialog>
    </div>
  );
}
