import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { Ban, CheckCircle2, History, Printer, Send, Undo2, Wallet } from 'lucide-react';
import {
  Breadcrumb,
  Button,
  DataTable,
  DateField,
  DetailSkeleton,
  Dialog,
  EmptyState,
  EntityHeader,
  ErrorState,
  FormField,
  MoneyCell,
  SensitiveActionModal,
  StatusBadge,
  WarningPanel,
  toast,
  type DataTableColumn,
} from '@bta/shadcn';
import { PAYROLL_STATUS, formatDate, formatDateTime, isoDate } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { PrLineFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { ExportDialog } from '@/features/shared/ExportDialog';
import { TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { PayrollStatusBanner, PayrollTotalsStrip, Section, isEditable } from '../components/payroll-ui';
import { PrCancelMutation, PrMarkPaidMutation, PrPayrollQuery, PrReturnMutation, PrSubmitMutation } from '../graphql/payroll';

type Line = PrLineFieldsFragment;

/** WM-PAYROLL-02 — Chi tiết bảng lương: dòng lương snapshot, cảnh báo, gửi duyệt / duyệt / trả về / đã chi trả. */
export default function PayrollDetailPage() {
  return (
    <RequirePermission permission="payroll.view">
      <PayrollDetail />
    </RequirePermission>
  );
}

function PayrollDetail() {
  const { payrollId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(PrPayrollQuery, { variables: { id: payrollId } });
  const [submit, { loading: submitting }] = useMutation(PrSubmitMutation);
  const [ret, { loading: returning }] = useMutation(PrReturnMutation);
  const [markPaid, { loading: paying }] = useMutation(PrMarkPaidMutation);
  const [cancel, { loading: cancelling }] = useMutation(PrCancelMutation);
  const [returnOpen, setReturnOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [paidOpen, setPaidOpen] = React.useState(false);
  const [paidAt, setPaidAt] = React.useState(isoDate(new Date()));
  const [printOpen, setPrintOpen] = React.useState(false);

  if (error) {
    return /Không tìm thấy/.test(error.message) ? (
      <EmptyState message="Không tìm thấy bảng lương" action={<Button onClick={() => navigate(PATHS.payroll)}>Về danh sách bảng lương</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const p = data?.payroll;
  if (!p) return null;
  const editable = isEditable(p.status);
  const lines = p.lines ?? [];

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      await refetch();
    } catch (e) {
      toast.error(apolloErrorMessage(e));
      throw e;
    }
  };

  const primary =
    editable && hasPermission('payroll.submit') ? (
      <Button disabled={submitting || !lines.length} onClick={() => void run(() => submit({ variables: { id: p.id } }), `Đã gửi duyệt ${p.code}`).catch(() => undefined)}>
        <Send /> Gửi duyệt
      </Button>
    ) : p.status === 'SUBMITTED' && hasPermission('payroll.approve') ? (
      <Button onClick={() => navigate(paths.payrollApprove(p.id))}>
        <CheckCircle2 /> Xem và duyệt
      </Button>
    ) : p.status === 'APPROVED' && hasPermission('payroll.markPaid') ? (
      <Button onClick={() => setPaidOpen(true)}>
        <Wallet /> Đánh dấu đã chi trả
      </Button>
    ) : null;

  const columns: DataTableColumn<Line>[] = [
    { key: 'driver', label: 'Tài xế', render: (r) => <div className="flex flex-col"><span className="font-medium">{r.driverName}</span><span className="text-caption text-text-subtle">{r.driverCode}</span></div> },
    { key: 'base', label: 'Lương cố định', money: true, render: (r) => <div className="text-right"><MoneyCell value={r.baseSalary} /><span className="block text-caption text-text-subtle">{r.salaryEffectiveFrom ? `mốc ${formatDate(r.salaryEffectiveFrom)}` : '—'}</span></div> },
    { key: 'bonus', label: 'Thưởng', money: true, render: (r) => <MoneyCell value={r.bonusTotal} tone={r.bonusTotal ? 'success' : 'muted'} /> },
    { key: 'advance', label: 'Trừ ứng', money: true, render: (r) => <MoneyCell value={r.advanceTotal} tone={r.advanceTotal ? 'warning' : 'muted'} /> },
    { key: 'deduction', label: 'Giảm trừ', money: true, render: (r) => <MoneyCell value={r.deductionTotal} tone={r.deductionTotal ? 'danger' : 'muted'} /> },
    { key: 'adjustment', label: 'Điều chỉnh', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.adjustmentTotal} signed tone={r.adjustmentTotal ? 'default' : 'muted'} /> },
    { key: 'net', label: 'Thực lãnh', money: true, render: (r) => <MoneyCell value={r.netAmount} strong /> },
    { key: 'anomalies', label: 'Cảnh báo', hideBelow: 'md', render: (r) => (r.anomalies.length ? <span className="text-caption text-warning">{r.anomalies.join('; ')}</span> : <span className="text-text-subtle">—</span>) },
  ];

  const menu = [
    { key: 'print', label: 'In bảng lương / Xuất Excel', icon: <Printer />, onSelect: () => setPrintOpen(true), disabled: !hasPermission('payroll.export') },
    { key: 'timeline', label: 'Lịch sử hoạt động', icon: <History />, onSelect: openTimeline },
    ...((p.status === 'SUBMITTED' || p.status === 'APPROVED') && hasPermission('payroll.return')
      ? [{ key: 'return', label: p.status === 'APPROVED' ? 'Hủy duyệt / trả về nháp' : 'Trả về', icon: <Undo2 />, danger: true, separatorBefore: true, onSelect: () => setReturnOpen(true) }]
      : []),
    ...(['DRAFT', 'RETURNED', 'SUBMITTED'].includes(p.status) && hasPermission('payroll.generate')
      ? [{ key: 'cancel', label: 'Hủy bảng lương', icon: <Ban />, danger: true, onSelect: () => setCancelOpen(true) }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Lương', to: PATHS.payroll }, { label: p.code }]} />
      <EntityHeader
        code={p.code}
        title={p.periodLabel}
        status={<StatusBadge meta={PAYROLL_STATUS} status={p.status} />}
        subtitle={`${formatDate(p.periodFrom)} – ${formatDate(p.periodTo)}${p.note ? ` · ${p.note}` : ''}`}
        metrics={[
          { label: 'Người tạo', value: `${p.createdByName ?? '—'} · ${formatDateTime(p.createdAt)}` },
          ...(p.submittedAt ? [{ label: 'Gửi duyệt', value: `${p.submittedByName ?? ''} · ${formatDateTime(p.submittedAt)}` }] : []),
          ...(p.approvedAt ? [{ label: 'Duyệt', value: `${p.approvedByName ?? ''} · ${formatDateTime(p.approvedAt)}` }] : []),
          ...(p.paidAt ? [{ label: 'Chi trả', value: `${p.paidByName ?? ''} · ${formatDate(p.paidAt)}` }] : []),
        ]}
        primaryAction={primary}
        menu={menu}
      />
      <PayrollStatusBanner p={p} />
      {p.approvalNote ? <p className="text-body-sm text-text-muted">Ghi chú duyệt: {p.approvalNote}</p> : null}
      <PayrollTotalsStrip totals={p.totals} previous={p.previousTotals} />
      {p.changes?.length ? <WarningPanel title={`Thay đổi so với kỳ trước${p.previousCode ? ` (${p.previousCode})` : ''}`} items={p.changes.map((c) => c.message)} /> : null}
      <Section title={`Dòng lương (${lines.length})`} actions={editable ? <span className="text-caption text-text-subtle">Mở dòng để thêm giảm trừ / điều chỉnh</span> : null}>
        <DataTable
          columns={columns}
          rows={lines}
          rowKey={(r) => r.id ?? r.driverId}
          onRowClick={(r) => r.id && navigate(paths.payrollLine(p.id, r.id))}
          rowClassName={(r) => (r.anomalies.length ? 'bg-warning-soft' : undefined)}
          totalRow={{
            driver: <span className="font-medium">Tổng cộng</span>,
            base: <MoneyCell value={p.totals.salary} strong />,
            bonus: <MoneyCell value={p.totals.bonus} strong />,
            advance: <MoneyCell value={p.totals.advance} strong />,
            deduction: <MoneyCell value={p.totals.deduction} strong />,
            adjustment: <MoneyCell value={p.totals.adjustment} strong signed />,
            net: <MoneyCell value={p.totals.net} strong />,
          }}
          empty={<EmptyState compact message="Bảng lương chưa có dòng nào" />}
        />
      </Section>
      <p className="text-caption text-text-subtle">Chi phí tài xế chi trước và tạm ứng chuyến không trừ vào lương — đối soát ở sổ công nợ tài xế.</p>

      <TimelineDrawer entity={{ type: 'PAYROLL', id: p.id, label: p.code }} />
      <SensitiveActionModal
        open={returnOpen}
        onOpenChange={setReturnOpen}
        action={p.status === 'APPROVED' ? `Hủy duyệt bảng lương ${p.code}` : `Trả về bảng lương ${p.code}`}
        description="Bảng lương về trạng thái Bị trả về để operation sửa rồi gửi duyệt lại (D-012)."
        affected={[`${p.totals.driverCount} tài xế`, `Tổng thực lãnh ${p.totals.net.toLocaleString('vi-VN')} đ`]}
        confirmLabel="Trả về"
        loading={returning}
        onConfirm={(reason) => run(() => ret({ variables: { id: p.id, reason } }), `Đã trả về ${p.code}`).then(() => setReturnOpen(false))}
      />
      <SensitiveActionModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        action={`Hủy bảng lương ${p.code}`}
        description="Bảng lương bị hủy giữ nguyên lịch sử; các khoản ứng lương sẽ được tính lại ở bảng lương mới."
        confirmLabel="Hủy bảng lương"
        loading={cancelling}
        onConfirm={(reason) => run(() => cancel({ variables: { id: p.id, reason } }), `Đã hủy ${p.code}`).then(() => setCancelOpen(false))}
      />
      <Dialog
        open={paidOpen}
        onOpenChange={setPaidOpen}
        title={`Đánh dấu đã chi trả ${p.code}`}
        description="Sau khi đánh dấu đã chi, bảng lương không sửa được; chênh lệch điều chỉnh ở kỳ sau."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaidOpen(false)}>
              Hủy
            </Button>
            <Button disabled={paying || !paidAt} onClick={() => void run(() => markPaid({ variables: { id: p.id, paidAt: new Date(`${paidAt}T12:00:00+07:00`).toISOString() } }), 'Đã đánh dấu chi trả').then(() => setPaidOpen(false)).catch(() => undefined)}>
              Xác nhận đã chi
            </Button>
          </>
        }
      >
        <FormField label="Ngày chi trả" required>
          <DateField value={paidAt} onChange={(v) => setPaidAt(v ?? '')} />
        </FormField>
      </Dialog>
      <ExportDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title={`In / xuất bảng lương ${p.code}`}
        documents={[{ template: 'PAYROLL', entityId: p.id, label: 'Bảng lương' }]}
        excel={{ template: 'PAYROLL', filter: { payrollId: p.id, year: new Date(p.periodFrom).getFullYear() }, label: 'Tải Excel' }}
      />
    </div>
  );
}
