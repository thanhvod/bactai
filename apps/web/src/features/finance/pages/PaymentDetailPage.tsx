import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { Ban, History, Pencil, Split } from 'lucide-react';
import {
  Banner,
  Button,
  DataTable,
  DateField,
  DescriptionList,
  DetailSkeleton,
  Drawer,
  EmptyState,
  EntityHeader,
  ErrorState,
  FormField,
  Input,
  MoneyCell,
  MoneyInput,
  SensitiveActionModal,
  Select,
  StatusBadge,
  SummaryStrip,
  Tabs,
  TabsContent,
  Textarea,
  toast,
  type DataTableColumn,
} from '@bta/shadcn';
import { formatDate, formatDateTime, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { PaymentFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { AttachmentsPanel } from '@/features/shared/AttachmentsPanel';
import { EntityTimeline, TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { DOC_STATUS, NotRevenueTag, PAYMENT_IN_TYPE, PAYMENT_METHOD, options, toLocalDateTimeInput } from '../components/common';
import { CancelPaymentMutation, PaymentQuery, UnallocatePaymentMutation, UpdatePaymentMutation } from '../graphql/finance';

type Payment = PaymentFieldsFragment;
type Allocation = Payment['allocations'][number];

/** WM-PAY-02 — Chi tiết phiếu thu. */
export default function PaymentDetailPage() {
  return (
    <RequirePermission permission={['finance.view', 'payment.create']}>
      <PaymentDetail />
    </RequirePermission>
  );
}

function PaymentDetail() {
  const { paymentId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [tabParam, setTab] = useQueryParam('tab');
  const tab = tabParam ?? 'overview';
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(PaymentQuery, { variables: { id: paymentId } });
  const [cancel, { loading: cancelling }] = useMutation(CancelPaymentMutation);
  const [unallocate, { loading: unallocating }] = useMutation(UnallocatePaymentMutation);
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [removeAlloc, setRemoveAlloc] = React.useState<Allocation | null>(null);
  const [editing, setEditing] = React.useState(false);

  if (error) {
    return /Không tìm thấy/.test(error.message) ? (
      <EmptyState message="Không tìm thấy phiếu thu" action={<Button onClick={() => navigate(PATHS.payments)}>Về danh sách phiếu thu</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const p = data?.payment;
  if (!p) return null;
  const active = p.status === 'ACTIVE';
  const isCustomer = p.type === 'CUSTOMER_PAYMENT';
  const canUpdate = hasPermission('payment.update');
  const canAllocate = hasPermission('payment.allocate');

  const allocColumns: DataTableColumn<Allocation>[] = [
    { key: 'order', label: 'Đơn hàng', render: (a) => <CellLink to={paths.order(a.orderId, 'finance')} className="font-mono text-accent hover:underline">{a.orderCode}</CellLink> },
    { key: 'date', label: 'Ngày phân bổ', render: (a) => formatDateTime(a.createdAt) },
    { key: 'amount', label: 'Số tiền', money: true, render: (a) => <MoneyCell value={a.amount} /> },
    {
      key: 'act',
      label: '',
      width: 110,
      render: (a) =>
        canUpdate && active ? (
          <Button size="sm" variant="ghost" onClick={() => setRemoveAlloc(a)}>
            Gỡ phân bổ
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <EntityHeader
        code={p.code}
        title={p.typeLabel}
        status={
          <span className="flex items-center gap-2">
            <StatusBadge meta={DOC_STATUS} status={p.status} outline={!active} />
            {p.notRevenue ? <NotRevenueTag /> : null}
          </span>
        }
        subtitle={`${p.payerLabel} · ${formatDateTime(p.receivedAt)}`}
        metrics={[
          { label: 'Số tiền', value: formatVnd(p.amount) },
          ...(isCustomer ? [{ label: 'Đã phân bổ', value: formatVnd(p.allocatedAmount) }, { label: 'Còn treo', value: formatVnd(p.unallocatedAmount) }] : []),
        ]}
        primaryAction={
          isCustomer && active && canAllocate && p.unallocatedAmount > 0 ? (
            <Button onClick={() => navigate(paths.paymentAllocate(p.id))}>
              <Split /> Phân bổ vào đơn
            </Button>
          ) : undefined
        }
        secondaryActions={
          <Button variant="ghost" onClick={openTimeline}>
            <History /> Timeline
          </Button>
        }
        menu={[
          ...(canUpdate && active ? [{ key: 'edit', label: 'Sửa phiếu thu', icon: <Pencil />, onSelect: () => setEditing(true) }] : []),
          ...(canUpdate && active ? [{ key: 'cancel', label: 'Hủy phiếu thu', icon: <Ban />, danger: true, onSelect: () => setConfirmCancel(true) }] : []),
        ]}
      />
      {!active ? <Banner tone="danger" message={`Phiếu đã hủy${p.cancelledAt ? ` lúc ${formatDateTime(p.cancelledAt)}` : ''}: ${p.cancelReason ?? ''}. Các phân bổ của phiếu không còn tính vào công nợ.`} /> : null}
      {p.notRevenue ? <Banner tone="info" message="Phiếu này là thu hồi khoản phải thu từ tài xế — không tính doanh thu, không đổi công nợ khách." /> : null}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v === 'overview' ? null : v)}
        items={[
          { value: 'overview', label: 'Tổng quan' },
          { value: 'attachments', label: 'Chứng từ', count: p.attachmentCount },
          { value: 'timeline', label: 'Lịch sử' },
        ]}
      >
        <TabsContent value="overview" className="flex flex-col gap-4">
          {isCustomer ? (
            <SummaryStrip
              items={[
                { label: 'Tổng phiếu', value: formatVnd(p.amount) },
                { label: 'Đã phân bổ', value: formatVnd(p.allocatedAmount), tone: 'success' },
                { label: 'Còn treo (số dư)', value: formatVnd(p.unallocatedAmount), tone: p.unallocatedAmount > 0 ? 'warning' : 'neutral' },
                { label: 'Số dư hiện tại của khách', value: formatVnd(p.customerCreditBalance ?? 0), tone: 'info' },
              ]}
            />
          ) : null}
          <Panel title="Thông tin phiếu">
            <DescriptionList
              columns={3}
              items={[
                { label: 'Loại', value: <StatusBadge meta={PAYMENT_IN_TYPE} status={p.type} /> },
                {
                  label: 'Người nộp',
                  value: p.customer ? <CellLink to={paths.customer(p.customer.id, 'debt')}>{p.customer.name}</CellLink> : p.driver ? <CellLink to={paths.driver(p.driver.id, 'ledger')}>{p.driver.name}</CellLink> : p.payerLabel,
                },
                { label: 'Hình thức', value: PAYMENT_METHOD[p.method as keyof typeof PAYMENT_METHOD]?.label ?? p.method },
                { label: 'Ngày giờ thu', value: formatDateTime(p.receivedAt) },
                { label: 'Người nhận tiền', value: p.receivedBy ?? '—' },
                { label: 'Tài khoản nhận', value: p.bankAccount ?? '—' },
                { label: 'Nội dung CK', value: p.transferNote ?? '—' },
                ...(p.trip ? [{ label: 'Chuyến', value: <CellLink to={paths.trip(p.trip.id)}>{p.trip.code}</CellLink> }] : []),
                { label: 'Ghi chú', value: p.note ?? '—', span: 3 as const },
              ]}
            />
          </Panel>
          {isCustomer ? (
            <Panel title="Phân bổ vào đơn" actions={active && canAllocate && p.unallocatedAmount > 0 ? <Button size="sm" variant="secondary" onClick={() => navigate(paths.paymentAllocate(p.id))}>Phân bổ</Button> : null}>
              <DataTable
                columns={allocColumns}
                rows={p.allocations}
                rowKey={(a) => a.id}
                compact
                totalRow={{ order: 'Tổng', amount: <MoneyCell value={p.allocatedAmount} strong /> }}
                empty={<EmptyState compact message="Chưa phân bổ vào đơn nào — toàn bộ đang là số dư khách" />}
              />
            </Panel>
          ) : null}
          {p.codItems.length ? (
            <Panel title="Khoản COD được đối trừ">
              <DataTable
                columns={[
                  { key: 'order', label: 'Đơn', render: (r) => <span className="font-mono">{r.orderCode}</span> },
                  { key: 'stop', label: 'Điểm', render: (r) => r.stopName ?? '—' },
                  { key: 'amount', label: 'Số tiền', money: true, render: (r) => <MoneyCell value={r.amount} /> },
                ]}
                rows={p.codItems}
                rowKey={(r) => r.stopId}
                compact
              />
            </Panel>
          ) : null}
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentsPanel entityType="PAYMENT_IN" entityId={p.id} category="PAYMENT_PROOF" canUpload={active && (hasPermission('payment.create') || canUpdate)} emptyText="Chưa có chứng từ thanh toán" />
        </TabsContent>
        <TabsContent value="timeline">
          <EntityTimeline entity={{ type: 'PAYMENT_IN', id: p.id, label: p.code }} />
        </TabsContent>
      </Tabs>
      <TimelineDrawer entity={{ type: 'PAYMENT_IN', id: p.id, label: p.code }} />

      <SensitiveActionModal
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        action={`Hủy phiếu thu ${p.code}`}
        affected={[`Số tiền ${formatVnd(p.amount)}`, ...(p.allocations.length ? [`${p.allocations.length} dòng phân bổ sẽ không còn tính vào công nợ các đơn`] : [])]}
        warning="Phiếu đã hủy không khôi phục được; công nợ các đơn đã phân bổ sẽ tăng trở lại."
        confirmLabel="Hủy phiếu"
        loading={cancelling}
        onConfirm={async (reason) => {
          try {
            await cancel({ variables: { id: p.id, reason } });
            toast.success('Đã hủy phiếu thu');
            setConfirmCancel(false);
          } catch (e) {
            toast.error(apolloErrorMessage(e));
          }
        }}
      />
      <SensitiveActionModal
        open={!!removeAlloc}
        onOpenChange={(o) => !o && setRemoveAlloc(null)}
        action={`Gỡ phân bổ ${removeAlloc ? formatVnd(removeAlloc.amount) : ''} khỏi đơn ${removeAlloc?.orderCode ?? ''}`}
        affected={['Công nợ đơn tăng lại tương ứng', 'Số tiền trở về số dư khách']}
        confirmLabel="Gỡ phân bổ"
        loading={unallocating}
        onConfirm={async (reason) => {
          if (!removeAlloc) return;
          try {
            await unallocate({ variables: { allocationId: removeAlloc.id, reason } });
            toast.success('Đã gỡ phân bổ');
            setRemoveAlloc(null);
          } catch (e) {
            toast.error(apolloErrorMessage(e));
          }
        }}
      />
      {editing ? <EditPaymentDrawer payment={p} onClose={() => setEditing(false)} /> : null}
    </div>
  );
}

/** Sửa phiếu thu (thao tác nhạy cảm: nhập lý do, không giảm dưới số đã phân bổ). */
function EditPaymentDrawer({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const [amount, setAmount] = React.useState<number | null>(payment.amount);
  const [receivedAt, setReceivedAt] = React.useState(toLocalDateTimeInput(payment.receivedAt));
  const [method, setMethod] = React.useState(payment.method);
  const [transferNote, setTransferNote] = React.useState(payment.transferNote ?? '');
  const [note, setNote] = React.useState(payment.note ?? '');
  const [reason, setReason] = React.useState('');
  const [update, { loading }] = useMutation(UpdatePaymentMutation);
  const tooLow = (amount ?? 0) < payment.allocatedAmount;
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      title={`Sửa phiếu thu ${payment.code}`}
      description="Thao tác nhạy cảm — lý do được ghi vào nhật ký"
      width={480}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button
            loading={loading}
            disabled={tooLow || reason.trim().length < 5 || !amount}
            onClick={async () => {
              try {
                await update({
                  variables: {
                    id: payment.id,
                    reason: reason.trim(),
                    input: { amount, receivedAt: new Date(receivedAt).toISOString(), method, transferNote: transferNote.trim() || null, note: note.trim() || null },
                  },
                });
                toast.success('Đã cập nhật phiếu thu');
                onClose();
              } catch (e) {
                toast.error(apolloErrorMessage(e));
              }
            }}
          >
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <FormField label="Số tiền" required error={tooLow ? `Không thấp hơn số đã phân bổ ${formatVnd(payment.allocatedAmount)}` : undefined}>
          <MoneyInput value={amount} onChange={setAmount} />
        </FormField>
        <FormField label="Ngày giờ thu">
          <DateField mode="datetime" value={receivedAt} onChange={setReceivedAt} />
        </FormField>
        <FormField label="Hình thức">
          <Select value={method} onValueChange={setMethod} options={options(PAYMENT_METHOD)} />
        </FormField>
        <FormField label="Nội dung chuyển khoản">
          <Input value={transferNote} onChange={(e) => setTransferNote(e.target.value)} />
        </FormField>
        <FormField label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </FormField>
        <FormField label="Lý do sửa" required hint="Tối thiểu 5 ký tự">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
        </FormField>
        <p className="text-caption text-text-muted">Ngày tạo phiếu: {formatDate(payment.createdAt)}</p>
      </div>
    </Drawer>
  );
}
