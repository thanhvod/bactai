import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { Ban, CheckCircle2, History, Pencil } from 'lucide-react';
import {
  Banner,
  Button,
  DateField,
  DescriptionList,
  DetailSkeleton,
  Dialog,
  Drawer,
  EmptyState,
  EntityHeader,
  ErrorState,
  FormField,
  SensitiveActionModal,
  Select,
  StatusBadge,
  Tabs,
  TabsContent,
  Textarea,
  toast,
} from '@bta/shadcn';
import { EXPENSE_KIND, formatDate, formatDateTime, formatVnd, type ExpenseKind } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { ExpenseFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { AttachmentsPanel } from '@/features/shared/AttachmentsPanel';
import { EntityTimeline, TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { DOC_STATUS, EXPENSE_KIND_META, EXPENSE_PAID_BY, PAID_STATUS, PAYMENT_METHOD, options, todayInput, toInputDate } from '../components/common';
import { ExpenseFormBody, toExpenseInput, validateExpense, type ExpenseFormState } from '../components/ExpenseFormBody';
import { CancelExpenseMutation, ExpenseQuery, MarkExpensesPaidMutation, UpdateExpenseMutation } from '../graphql/finance';

type Expense = ExpenseFieldsFragment;

/** WM-EXP-02 — Chi tiết phiếu chi. */
export default function ExpenseDetailPage() {
  return (
    <RequirePermission permission={['finance.view', 'expense.create']}>
      <ExpenseDetail />
    </RequirePermission>
  );
}

function ExpenseDetail() {
  const { expenseId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [tabParam, setTab] = useQueryParam('tab');
  const tab = tabParam ?? 'overview';
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(ExpenseQuery, { variables: { id: expenseId } });
  const [cancel, { loading: cancelling }] = useMutation(CancelExpenseMutation);
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [paying, setPaying] = React.useState(false);

  if (error) {
    return /Không tìm thấy/.test(error.message) ? (
      <EmptyState message="Không tìm thấy phiếu chi" action={<Button onClick={() => navigate(PATHS.expenses)}>Về danh sách phiếu chi</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const x = data?.expense;
  if (!x) return null;
  const active = x.status === 'ACTIVE';
  const canUpdate = hasPermission('expense.update');
  const canMarkPaid = hasPermission('expense.markPaid') && active && x.paidStatus === 'UNPAID';

  return (
    <div className="flex flex-col gap-4">
      <EntityHeader
        code={x.code}
        title={x.categoryName ?? x.kindLabel}
        status={
          <span className="flex items-center gap-2">
            <StatusBadge meta={EXPENSE_KIND_META} status={x.kind} />
            {active ? <StatusBadge meta={PAID_STATUS} status={x.paidStatus} /> : <StatusBadge meta={DOC_STATUS} status="CANCELLED" outline />}
          </span>
        }
        subtitle={`${formatDate(x.expenseDate)} · ${EXPENSE_PAID_BY[x.paidBy as keyof typeof EXPENSE_PAID_BY]?.label ?? x.paidBy}`}
        metrics={[{ label: 'Số tiền', value: formatVnd(x.amount) }, { label: 'Tính chi phí lãi/lỗ', value: x.isCost ? 'Có' : 'Không (dòng tiền tài xế)' }]}
        primaryAction={
          canMarkPaid ? (
            <Button onClick={() => setPaying(true)}>
              <CheckCircle2 /> Đánh dấu đã trả
            </Button>
          ) : undefined
        }
        secondaryActions={
          <Button variant="ghost" onClick={openTimeline}>
            <History /> Timeline
          </Button>
        }
        menu={[
          ...(canUpdate && active ? [{ key: 'edit', label: 'Sửa phiếu chi', icon: <Pencil />, onSelect: () => setEditing(true) }] : []),
          ...(canUpdate && active ? [{ key: 'cancel', label: 'Hủy phiếu chi', icon: <Ban />, danger: true, onSelect: () => setConfirmCancel(true) }] : []),
        ]}
      />
      {!active ? <Banner tone="danger" message={`Phiếu đã hủy${x.cancelledAt ? ` lúc ${formatDateTime(x.cancelledAt)}` : ''}: ${x.cancelReason ?? ''}`} /> : null}
      {x.kind === 'TRIP_ADVANCE' && x.trip ? <Banner tone="info" message="Tạm ứng chuyến — đối soát với chi phí thực tế sau chuyến." action={<CellLink to={`${PATHS.tripAdvances}?tripId=${x.trip.id}`}>Mở đối soát</CellLink>} /> : null}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v === 'overview' ? null : v)}
        items={[
          { value: 'overview', label: 'Tổng quan' },
          { value: 'attachments', label: 'Chứng từ', count: x.attachmentCount },
          { value: 'timeline', label: 'Lịch sử' },
        ]}
      >
        <TabsContent value="overview" className="flex flex-col gap-4">
          <Panel title="Thông tin phiếu chi">
            <DescriptionList
              columns={3}
              items={[
                { label: 'Loại', value: x.kindLabel },
                { label: 'Danh mục', value: x.categoryName ?? '—' },
                { label: 'Ngày chi', value: formatDate(x.expenseDate) },
                { label: 'Ai chi', value: `${EXPENSE_PAID_BY[x.paidBy as keyof typeof EXPENSE_PAID_BY]?.label ?? x.paidBy}${x.reimbursable ? ' · hoàn lại tài xế' : ''}` },
                { label: 'Thanh toán', value: x.paidStatus === 'PAID' ? `Đã trả${x.paidAt ? ` ${formatDate(x.paidAt)}` : ''}${x.paidMethod ? ` · ${PAYMENT_METHOD[x.paidMethod as keyof typeof PAYMENT_METHOD]?.label ?? x.paidMethod}` : ''}` : 'Chưa trả' },
                { label: 'Nội dung', value: x.description ?? '—' },
                { label: 'Ghi chú', value: x.note ?? '—', span: 3 as const },
              ]}
            />
          </Panel>
          <Panel title="Gắn với">
            <DescriptionList
              columns={3}
              items={[
                { label: 'Đơn hàng', value: x.order ? <CellLink to={paths.order(x.order.id, 'finance')}>{x.order.code}</CellLink> : '—' },
                { label: 'Chuyến', value: x.trip ? <CellLink to={paths.trip(x.trip.id)}>{x.trip.code}</CellLink> : '—' },
                { label: 'Xe', value: x.vehicle ? <CellLink to={paths.vehicle(x.vehicle.id)}>{x.vehicle.name ?? x.vehicle.code}</CellLink> : '—' },
                { label: 'Tài xế', value: x.driver ? <CellLink to={paths.driver(x.driver.id, 'ledger')}>{x.driver.name}</CellLink> : '—' },
                { label: 'Nhà cung cấp', value: x.supplier ? <CellLink to={paths.supplier(x.supplier.id)}>{x.supplier.name}</CellLink> : '—' },
              ]}
            />
          </Panel>
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentsPanel entityType="EXPENSE" entityId={x.id} category="EXPENSE_RECEIPT" canUpload={active && (hasPermission('expense.create') || canUpdate)} emptyText="Chưa có chứng từ chi phí" />
        </TabsContent>
        <TabsContent value="timeline">
          <EntityTimeline entity={{ type: 'EXPENSE', id: x.id, label: x.code }} />
        </TabsContent>
      </Tabs>
      <TimelineDrawer entity={{ type: 'EXPENSE', id: x.id, label: x.code }} />
      <SensitiveActionModal
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        action={`Hủy phiếu chi ${x.code}`}
        affected={[`Số tiền ${formatVnd(x.amount)}`, x.isCost ? 'Giảm chi phí và tăng lãi/lỗ các đơn/chuyến liên quan' : 'Thay đổi công nợ tài xế', ...(x.paidStatus === 'UNPAID' && x.supplier ? [`Giảm công nợ NCC ${x.supplier.name}`] : [])]}
        confirmLabel="Hủy phiếu"
        loading={cancelling}
        onConfirm={async (reason) => {
          try {
            await cancel({ variables: { id: x.id, reason } });
            toast.success('Đã hủy phiếu chi');
            setConfirmCancel(false);
          } catch (e) {
            toast.error(apolloErrorMessage(e));
          }
        }}
      />
      {editing ? <EditExpenseDrawer expense={x} onClose={() => setEditing(false)} /> : null}
      {paying ? <MarkPaidDialog ids={[x.id]} total={x.amount} onClose={() => setPaying(false)} /> : null}
    </div>
  );
}

function fromExpense(x: Expense): ExpenseFormState {
  return {
    kind: x.kind as ExpenseKind,
    categoryId: x.categoryId ?? null,
    amount: x.amount,
    expenseDate: toInputDate(x.expenseDate),
    paidBy: x.paidBy as ExpenseFormState['paidBy'],
    reimbursable: x.reimbursable,
    paidStatus: x.paidStatus as 'PAID' | 'UNPAID',
    supplierId: x.supplierId ?? null,
    orderId: x.orderId ?? null,
    tripId: x.tripId ?? null,
    vehicleId: x.vehicleId ?? null,
    driverId: x.driverId ?? null,
    description: x.description ?? '',
    note: x.note ?? '',
  };
}

function EditExpenseDrawer({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  const [state, setState] = React.useState(() => fromExpense(expense));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [reason, setReason] = React.useState('');
  const [update, { loading }] = useMutation(UpdateExpenseMutation);
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      title={`Sửa phiếu chi ${expense.code}`}
      description={`Thao tác nhạy cảm — lý do được ghi nhật ký. ${EXPENSE_KIND[state.kind].label}`}
      width={720}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button
            loading={loading}
            disabled={reason.trim().length < 5}
            onClick={async () => {
              const e = validateExpense(state);
              setErrors(e);
              if (Object.keys(e).length) return;
              try {
                await update({ variables: { id: expense.id, input: toExpenseInput(state), reason: reason.trim() } });
                toast.success('Đã cập nhật phiếu chi');
                onClose();
              } catch (err) {
                toast.error(apolloErrorMessage(err));
              }
            }}
          >
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ExpenseFormBody state={state} onChange={setState} errors={errors} lockKind />
        <FormField label="Lý do sửa" required hint="Tối thiểu 5 ký tự">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
        </FormField>
      </div>
    </Drawer>
  );
}

/** Đánh dấu 1 hoặc nhiều phiếu chi đã trả NCC. */
export function MarkPaidDialog({ ids, total, onClose, onDone }: { ids: string[]; total: number; onClose: () => void; onDone?: () => void }) {
  const [paidAt, setPaidAt] = React.useState(todayInput());
  const [method, setMethod] = React.useState('BANK_TRANSFER');
  const [note, setNote] = React.useState('');
  const [mark, { loading }] = useMutation(MarkExpensesPaidMutation);
  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={ids.length > 1 ? `Trả ${ids.length} phiếu chi` : 'Đánh dấu phiếu chi đã trả'}
      description={`Tổng ${formatVnd(total)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button
            loading={loading}
            onClick={async () => {
              try {
                await mark({ variables: { ids, input: { paidAt: new Date(`${paidAt}T12:00:00`).toISOString(), method, note: note.trim() || null } } });
                toast.success('Đã đánh dấu đã trả');
                onDone?.();
                onClose();
              } catch (e) {
                toast.error(apolloErrorMessage(e));
              }
            }}
          >
            Xác nhận đã trả
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <FormField label="Ngày trả">
          <DateField value={paidAt} onChange={setPaidAt} />
        </FormField>
        <FormField label="Hình thức">
          <Select value={method} onValueChange={setMethod} options={options(PAYMENT_METHOD)} />
        </FormField>
        <FormField label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </FormField>
      </div>
    </Dialog>
  );
}
