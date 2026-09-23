import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { Ban, Download, History, Lock, Printer, RefreshCw, Send, Stamp } from 'lucide-react';
import {
  Banner,
  Breadcrumb,
  Button,
  Checkbox,
  DataTable,
  DetailSkeleton,
  Dialog,
  DueIndicator,
  EmptyState,
  EntityHeader,
  ErrorState,
  MoneyCell,
  SensitiveActionModal,
  StatusBadge,
  SummaryStrip,
  WarningPanel,
  toast,
} from '@bta/shadcn';
import { DEBT_STATEMENT_STATUS, formatDate, formatDateTime, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { CellLink } from '@/features/master-data/helpers';
import { ExportDialog } from '@/features/shared/ExportDialog';
import { TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { DsCancelMutation, DsDetailQuery, DsFinalizeMutation, DsMarkSentMutation, DsRefreshMutation } from '../graphql/debt-statements';

/** WM-DEBT-04 — Chi tiết bảng kê: nháp (xem trước, làm mới) → chốt (snapshot + PDF) → đã gửi; hủy cần lý do. */
export default function DebtStatementDetailPage() {
  return (
    <RequirePermission permission={['debt.view', 'debtStatement.create']}>
      <DebtStatementDetail />
    </RequirePermission>
  );
}

function DebtStatementDetail() {
  const { statementId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(DsDetailQuery, { variables: { id: statementId } });
  const [refresh, { loading: refreshing }] = useMutation(DsRefreshMutation);
  const [finalize, { loading: finalizing }] = useMutation(DsFinalizeMutation);
  const [markSent, { loading: sending }] = useMutation(DsMarkSentMutation);
  const [cancel, { loading: cancelling }] = useMutation(DsCancelMutation);
  const [confirmFinalize, setConfirmFinalize] = React.useState(false);
  const [sentOpen, setSentOpen] = React.useState(false);
  const [share, setShare] = React.useState(true);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [printOpen, setPrintOpen] = React.useState(false);

  if (error) {
    return /Không tìm thấy/.test(error.message) ? (
      <EmptyState message="Không tìm thấy bảng kê" action={<Button onClick={() => navigate(PATHS.debtStatements)}>Về danh sách bảng kê</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const s = data?.debtStatement;
  if (!s) return null;
  const locked = s.status === 'FINALIZED' || s.status === 'SENT';
  const canFinalize = hasPermission('debtStatement.finalize');
  const lines = s.lines ?? [];

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      await refetch();
      return true;
    } catch (e) {
      toast.error(apolloErrorMessage(e));
      return false;
    }
  };

  const openPdf = () => s.pdfUrl && window.open(s.pdfUrl, '_blank', 'noopener');

  const primary =
    s.status === 'DRAFT' && canFinalize ? (
      <Button disabled={finalizing || !lines.length} onClick={() => setConfirmFinalize(true)}>
        <Stamp /> Chốt bảng kê
      </Button>
    ) : s.status === 'FINALIZED' && canFinalize ? (
      <Button onClick={() => setSentOpen(true)}>
        <Send /> Đánh dấu đã gửi
      </Button>
    ) : s.pdfUrl ? (
      <Button onClick={openPdf}>
        <Download /> Tải PDF
      </Button>
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Thu chi & Công nợ', to: PATHS.finance }, { label: 'Bảng kê công nợ', to: PATHS.debtStatements }, { label: s.code }]} />
      <EntityHeader
        code={s.code}
        status={<StatusBadge meta={DEBT_STATEMENT_STATUS} status={s.status} icon={locked ? <Lock /> : undefined} outline={s.status === 'CANCELLED'} />}
        subtitle={
          <>
            <CellLink to={paths.customer(s.customer.id, 'debt')}>{s.customer.name}</CellLink> · Kỳ {formatDate(s.periodFrom)} – {formatDate(s.periodTo)} ·{' '}
            {s.scope === 'UNPAID_ONLY' ? 'chỉ đơn còn nợ' : 'tất cả đơn trong kỳ'}
          </>
        }
        metrics={[
          { label: 'Tạo', value: `${s.createdByName ?? ''} · ${formatDateTime(s.createdAt)}` },
          ...(s.finalizedAt ? [{ label: 'Chốt', value: `${s.finalizedByName ?? ''} · ${formatDateTime(s.finalizedAt)}` }] : []),
          ...(s.sentAt ? [{ label: 'Đã gửi', value: `${formatDateTime(s.sentAt)}${s.sharedWithCustomer ? ' · chia sẻ cho khách' : ''}` }] : []),
        ]}
        primaryAction={primary}
        secondaryActions={
          <>
            {s.status === 'DRAFT' && hasPermission('debtStatement.create') ? (
              <Button variant="secondary" disabled={refreshing} onClick={() => void act(() => refresh({ variables: { id: s.id } }), 'Đã làm mới số liệu nháp')}>
                <RefreshCw /> Làm mới số liệu
              </Button>
            ) : null}
            {locked && s.pdfUrl && s.status !== 'SENT' ? (
              <Button variant="secondary" onClick={openPdf}>
                <Download /> Tải PDF
              </Button>
            ) : null}
          </>
        }
        menu={[
          { key: 'print', label: 'Xem trước bản in', icon: <Printer />, onSelect: () => setPrintOpen(true) },
          { key: 'timeline', label: 'Lịch sử hoạt động', icon: <History />, onSelect: openTimeline },
          ...(s.status !== 'CANCELLED' && hasPermission('debtStatement.cancel')
            ? [{ key: 'cancel', label: 'Hủy bảng kê', icon: <Ban />, danger: true, separatorBefore: true, onSelect: () => setCancelOpen(true) }]
            : []),
        ]}
      />
      {locked ? (
        <Banner tone="primary" icon={<Lock />} message={`Đã chốt snapshot ${formatDateTime(s.finalizedAt)} — số liệu giữ nguyên như file PDF đã gửi khách, không đổi theo thanh toán sau đó.`} />
      ) : s.status === 'DRAFT' ? (
        <Banner tone="info" message="Bản nháp: số liệu tính tại thời điểm tạo/làm mới. Chốt để lưu snapshot và xuất PDF." />
      ) : (
        <Banner tone="neutral" message={`Đã hủy ${formatDateTime(s.cancelledAt)}: ${s.cancelReason ?? '—'}`} />
      )}
      <SummaryStrip
        items={[
          { label: 'Số đơn', value: s.lineCount },
          { label: 'Tổng tiền', value: formatVnd(s.totalAmount) },
          { label: 'Đã thu', value: formatVnd(s.paidAmount), tone: 'success' },
          { label: 'Còn lại', value: formatVnd(s.remainingAmount), tone: s.remainingAmount > 0 ? 'warning' : 'neutral' },
          { label: 'Quá hạn', value: formatVnd(lines.filter((l) => l.overdueDays > 0).reduce((a, l) => a + l.remainingAmount, 0)), tone: lines.some((l) => l.overdueDays > 0) ? 'danger' : 'neutral' },
        ]}
      />
      {s.diffVsCurrent?.length ? (
        <WarningPanel
          title={`Số liệu hiện tại đã khác snapshot (${s.diffVsCurrent.length} đơn)`}
          items={s.diffVsCurrent.map((d) => `${d.orderCode}: còn lại snapshot ${formatVnd(d.snapshotRemaining)} → hiện tại ${formatVnd(d.currentRemaining)}. ${d.message}`)}
        />
      ) : null}
      {s.note ? <p className="text-body-sm text-text-muted">Ghi chú: {s.note}</p> : null}
      <DataTable
        rows={lines}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(paths.order(r.orderId, 'finance'))}
        empty={<EmptyState compact message="Không có đơn nào trong kỳ theo phạm vi đã chọn" />}
        columns={[
          { key: 'seq', label: '#', width: 48, render: (r) => r.sequence },
          { key: 'date', label: 'Ngày đơn', render: (r) => formatDate(r.orderDate) },
          { key: 'code', label: 'Mã đơn', render: (r) => <span className="font-mono">{r.orderCode}</span> },
          { key: 'route', label: 'Tuyến', hideBelow: 'md', render: (r) => r.route ?? '—' },
          { key: 'total', label: 'Tổng tiền', money: true, render: (r) => <MoneyCell value={r.totalAmount} /> },
          { key: 'paid', label: 'Đã thu', money: true, render: (r) => <MoneyCell value={r.paidAmount} tone="success" /> },
          { key: 'remaining', label: 'Còn lại', money: true, render: (r) => <MoneyCell value={r.remainingAmount} strong /> },
          { key: 'due', label: 'Hạn thanh toán', render: (r) => <DueIndicator dueDate={r.dueDate} overdueDays={r.overdueDays} paid={r.remainingAmount <= 0} /> },
        ]}
        totalRow={{
          code: <span className="font-medium">Tổng cộng</span>,
          total: <MoneyCell value={s.totalAmount} strong />,
          paid: <MoneyCell value={s.paidAmount} strong />,
          remaining: <MoneyCell value={s.remainingAmount} strong />,
        }}
      />
      <p className="text-caption text-text-subtle">Nhà xe tự gửi file PDF cho khách qua Zalo/email; hệ thống lưu bản đã chốt để đối chiếu sau này.</p>

      <TimelineDrawer entity={{ type: 'DEBT_STATEMENT', id: s.id, label: s.code }} />
      <Dialog
        open={confirmFinalize}
        onOpenChange={setConfirmFinalize}
        title={`Chốt bảng kê ${s.code}?`}
        description="Hệ thống tính lại số liệu lần cuối, lưu snapshot và tạo file PDF. Sau khi chốt không sửa được — chỉ hủy (có lý do) rồi tạo bảng kê mới."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmFinalize(false)}>
              Để sau
            </Button>
            <Button
              disabled={finalizing}
              onClick={async () => {
                if (await act(() => finalize({ variables: { id: s.id } }), `Đã chốt ${s.code} và tạo PDF`)) setConfirmFinalize(false);
              }}
            >
              {finalizing ? 'Đang chốt & tạo PDF…' : 'Chốt & tạo PDF'}
            </Button>
          </>
        }
      />
      <Dialog
        open={sentOpen}
        onOpenChange={setSentOpen}
        title="Đánh dấu đã gửi khách"
        description="Ghi nhận bảng kê đã gửi (qua Zalo/email ngoài hệ thống)."
        footer={
          <>
            <Button variant="secondary" onClick={() => setSentOpen(false)}>
              Hủy
            </Button>
            <Button
              disabled={sending}
              onClick={async () => {
                if (await act(() => markSent({ variables: { id: s.id, share: s.customer.hasPortalAccount && share } }), 'Đã đánh dấu đã gửi')) setSentOpen(false);
              }}
            >
              Xác nhận đã gửi
            </Button>
          </>
        }
      >
        {s.customer.hasPortalAccount ? (
          <label className="flex items-center gap-2 text-body-sm">
            <Checkbox checked={share} onCheckedChange={(v) => setShare(v === true)} /> Chia sẻ bảng kê trên Web Khách hàng (khách nhận thông báo)
          </label>
        ) : (
          <p className="text-body-sm text-text-muted">Khách chưa có tài khoản Web Khách hàng — chỉ ghi nhận đã gửi.</p>
        )}
      </Dialog>
      <SensitiveActionModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        action={`Hủy bảng kê ${s.code}`}
        description={locked ? 'Bảng kê đã chốt/đã gửi khách. Hủy giữ lại lịch sử và file PDF để tra cứu.' : undefined}
        affected={[s.customer.name, `Còn lại ${formatVnd(s.remainingAmount)}`]}
        confirmLabel="Hủy bảng kê"
        loading={cancelling}
        onConfirm={async (reason) => {
          if (await act(() => cancel({ variables: { id: s.id, reason } }), `Đã hủy ${s.code}`)) setCancelOpen(false);
        }}
      />
      <ExportDialog open={printOpen} onOpenChange={setPrintOpen} title={`Bảng kê ${s.code}`} documents={[{ template: 'DEBT_STATEMENT', entityId: s.id, label: 'Bảng kê công nợ' }]} />
    </div>
  );
}
