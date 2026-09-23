import { Link, useParams } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Download, FileText } from 'lucide-react';
import { ATTACHMENT_CATEGORY, STOP_TYPE, formatDate, formatDateTime, labelOf } from '@bta/shared';
import { Button, DataTable, DetailSkeleton, DueIndicator, EmptyState, MoneyCell, PageHeader, SummaryStrip } from '@bta/shadcn';
import { MyOrderQuery } from '@/graphql/operations';
import { paths } from '@/app/routes';
import { OrderStatusBadge, Panel, StopStatusBadge, TripStatusBadge } from '@/components/ui';

/** CW-ORD-02 — Chi tiết đơn customer-safe (không lộ chi phí, lãi/lỗ, COD tài xế, SĐT tài xế, ghi chú nội bộ). */
export default function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const { data, loading, error } = useQuery(MyOrderQuery, { variables: { id: orderId }, pollInterval: 60_000 });
  if (loading && !data) return <DetailSkeleton />;
  const o = data?.myOrder;
  if (error || !o)
    return (
      <EmptyState
        message="Không xem được đơn hàng này"
        description="Đơn không tồn tại, chưa được nhà xe mở cho khách hoặc không thuộc tài khoản của bạn."
        action={<Button asChild><Link to={paths.orders()}>Về danh sách đơn</Link></Button>}
      />
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {o.code} <OrderStatusBadge status={o.status} />
          </span>
        }
        subtitle={`${o.merchantName} · ngày đơn ${formatDate(o.orderDate)}${o.routeSummary ? ` · ${o.routeSummary}` : ''}`}
        breadcrumb={[{ label: 'Đơn hàng', to: paths.orders() }, { label: o.code }]}
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to={paths.merchant(o.merchantId)}>Liên hệ nhà xe</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to={paths.debt()}>Xem bảng kê{o.statementCode ? ` ${o.statementCode}` : ''}</Link>
            </Button>
          </>
        }
      />
      <SummaryStrip
        items={[
          { label: 'Tổng tiền', value: <MoneyCell value={o.totalAmount} strong /> },
          { label: 'Đã trả', value: <MoneyCell value={o.paidAmount} /> , tone: 'success' },
          { label: 'Còn phải trả', value: o.status === 'PENDING_CONFIRMATION' ? 'Chờ xác nhận' : <MoneyCell value={o.remainingAmount} strong />, tone: o.remainingAmount > 0 ? 'warning' : 'neutral' },
          { label: 'Hạn thanh toán', value: o.dueDate ? <DueIndicator dueDate={o.dueDate} overdueDays={o.overdueDays} paid={o.remainingAmount <= 0} /> : '—' },
          ...(o.bookingId ? [{ label: 'Booking gốc', value: <Link className="text-accent hover:underline" to={paths.booking(o.bookingId)}>{o.bookingCode}</Link> }] : []),
        ]}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Panel title="Tiến độ chuyến">
            {o.trips?.length ? (
              <ul className="divide-y divide-border">
                {o.trips.map((t) => (
                  <li key={t.code} className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-body-strong">{t.code}</p>
                      <p className="text-body-sm text-text-muted">
                        {[t.plate, t.vehicleType, t.driverName ? `Tài xế ${t.driverName}` : null].filter(Boolean).join(' · ') || 'Chưa xếp xe'}
                      </p>
                    </div>
                    <div className="text-right">
                      <TripStatusBadge status={t.status} />
                      <p className="mt-1 text-caption text-text-subtle">Cập nhật {formatDateTime(t.lastUpdateAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-text-muted">Nhà xe chưa xếp xe cho đơn này.</p>
            )}
          </Panel>
          <Panel title="Điểm lấy / trả">
            <ol className="space-y-3">
              {(o.stops ?? []).map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-caption">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-body-strong">
                        {labelOf(STOP_TYPE, s.type)}
                        {s.place ? ` · ${s.place}` : ''}
                      </p>
                      <StopStatusBadge status={s.status} />
                    </div>
                    <p className="text-body">{s.address}</p>
                    <p className="text-body-sm text-text-muted">
                      {[s.contactName, s.plannedAt ? `Dự kiến ${formatDateTime(s.plannedAt)}` : null, s.actualAt ? `Thực tế ${formatDateTime(s.actualAt)}` : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel title="Hàng hóa">
            {o.cargo?.length ? <ul className="list-disc space-y-1 pl-5 text-body">{o.cargo.map((c, i) => <li key={i}>{c}</li>)}</ul> : <p className="text-body-sm text-text-muted">—</p>}
          </Panel>
        </div>
        <aside className="space-y-5">
          <Panel title="Giá & thanh toán">
            <DataTable
              compact
              rowKey={(r) => r.label}
              rows={o.pricingLines ?? []}
              columns={[
                { key: 'label', label: 'Khoản', render: (r) => r.label },
                { key: 'amount', label: 'Số tiền', money: true, align: 'right', render: (r) => <MoneyCell value={r.amount} /> },
              ]}
              totalRow={{ label: 'Tổng cộng', amount: <MoneyCell value={o.totalAmount} strong /> }}
            />
          </Panel>
          <Panel title="Chứng từ được chia sẻ">
            {o.sharedAttachments?.length ? (
              <ul className="space-y-2">
                {o.sharedAttachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-text-muted" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-body">{a.fileName}</span>
                        <span className="block text-caption text-text-subtle">
                          {labelOf(Object.fromEntries(Object.entries(ATTACHMENT_CATEGORY).map(([k, v]) => [k, { label: v, tone: 'neutral' as const }])), a.category)} · {formatDate(a.createdAt)}
                        </span>
                      </span>
                    </span>
                    {a.url ? (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={a.url} target="_blank" rel="noreferrer">
                          <Download /> Tải
                        </a>
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-text-muted">Chưa có chứng từ nào được nhà xe chia sẻ.</p>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
