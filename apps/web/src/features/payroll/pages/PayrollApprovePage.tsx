import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { CheckCircle2, Undo2 } from 'lucide-react';
import { Banner, Button, DataTable, DetailSkeleton, EmptyState, ErrorState, FormField, MoneyCell, PageHeader, SensitiveActionModal, StatusBadge, Textarea, WarningPanel, toast } from '@bta/shadcn';
import { PAYROLL_STATUS, formatDateTime, formatVnd } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { PrTotalsFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { PayrollTotalsStrip, Section } from '../components/payroll-ui';
import { PrApproveMutation, PrPayrollQuery, PrReturnMutation } from '../graphql/payroll';

const COMPARE: { key: keyof PrTotalsFieldsFragment; label: string }[] = [
  { key: 'driverCount', label: 'Số tài xế' },
  { key: 'salary', label: 'Lương cố định' },
  { key: 'bonus', label: 'Thưởng chuyến' },
  { key: 'advance', label: 'Trừ ứng lương' },
  { key: 'deduction', label: 'Giảm trừ' },
  { key: 'adjustment', label: 'Điều chỉnh' },
  { key: 'net', label: 'Tổng thực lãnh' },
];

/** WM-PAYROLL-05 — Duyệt bảng lương (chỉ admin/giám đốc): so sánh kỳ trước, thay đổi, cảnh báo; duyệt hoặc trả về có lý do. */
export default function PayrollApprovePage() {
  return (
    <RequirePermission permission="payroll.approve">
      <PayrollApprove />
    </RequirePermission>
  );
}

function PayrollApprove() {
  const { payrollId = '' } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(PrPayrollQuery, { variables: { id: payrollId } });
  const [approve, { loading: approving }] = useMutation(PrApproveMutation);
  const [ret, { loading: returning }] = useMutation(PrReturnMutation);
  const [note, setNote] = React.useState('');
  const [returnOpen, setReturnOpen] = React.useState(false);

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (loading && !data) return <DetailSkeleton />;
  const p = data?.payroll;
  if (!p) return <EmptyState message="Không tìm thấy bảng lương" />;
  const canAct = p.status === 'SUBMITTED';
  const anomalies = (p.lines ?? []).flatMap((l) => l.anomalies.map((a) => `${l.driverName}: ${a}`));

  const doApprove = async () => {
    try {
      await approve({ variables: { id: p.id, note: note.trim() || null } });
      toast.success(`Đã duyệt bảng lương ${p.code}`);
      navigate(paths.payrollDetail(p.id));
    } catch (e) {
      toast.error(apolloErrorMessage(e));
    }
  };

  const rows = COMPARE.map((c) => {
    const cur = p.totals[c.key] as number;
    const prev = p.previousTotals ? (p.previousTotals[c.key] as number) : null;
    return { ...c, cur, prev, delta: prev === null ? null : cur - prev };
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`Duyệt bảng lương ${p.code}`}
        subtitle={`${p.periodLabel} · gửi duyệt ${formatDateTime(p.submittedAt)}${p.submittedByName ? ` bởi ${p.submittedByName}` : ''}`}
        breadcrumb={[{ label: 'Lương', to: PATHS.payroll }, { label: p.code, to: paths.payrollDetail(p.id) }, { label: 'Duyệt' }]}
        actions={<StatusBadge meta={PAYROLL_STATUS} status={p.status} />}
      />
      {!canAct ? <Banner tone="info" message={`Bảng lương đang ở trạng thái "${PAYROLL_STATUS[p.status as keyof typeof PAYROLL_STATUS]?.label ?? p.status}" — chỉ duyệt được khi Chờ duyệt.`} action={<Button size="sm" variant="secondary" onClick={() => navigate(paths.payrollDetail(p.id))}>Về bảng lương</Button>} /> : null}
      <PayrollTotalsStrip totals={p.totals} previous={p.previousTotals} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Section title={`So với kỳ trước${p.previousCode ? ` (${p.previousCode})` : ''}`}>
          <DataTable
            compact
            rows={rows}
            rowKey={(r) => r.key}
            columns={[
              { key: 'label', label: 'Khoản', render: (r) => r.label },
              { key: 'prev', label: 'Kỳ trước', money: true, render: (r) => (r.prev === null ? <span className="text-text-subtle">—</span> : r.key === 'driverCount' ? r.prev : <MoneyCell value={r.prev} />) },
              { key: 'cur', label: 'Kỳ này', money: true, render: (r) => (r.key === 'driverCount' ? r.cur : <MoneyCell value={r.cur} strong={r.key === 'net'} />) },
              { key: 'delta', label: 'Chênh lệch', money: true, render: (r) => (r.delta === null ? '—' : r.key === 'driverCount' ? (r.delta > 0 ? `+${r.delta}` : r.delta) : <MoneyCell value={r.delta} signed />) },
            ]}
          />
        </Section>
        <div className="flex flex-col gap-3">
          {p.changes?.length ? <WarningPanel title="Thay đổi cần chú ý" items={p.changes.map((c) => (c.amount ? `${c.message} (${formatVnd(c.amount)})` : c.message))} /> : <Banner tone="success" message="Không có thay đổi bất thường so với kỳ trước." />}
          {anomalies.length ? <WarningPanel tone="danger" title="Cảnh báo dữ liệu" items={anomalies} /> : null}
        </div>
      </div>
      <Section title="Dòng lương">
        <DataTable
          compact
          rows={p.lines ?? []}
          rowKey={(r) => r.id ?? r.driverId}
          onRowClick={(r) => r.id && navigate(paths.payrollLine(p.id, r.id))}
          columns={[
            { key: 'driver', label: 'Tài xế', render: (r) => r.driverName },
            { key: 'base', label: 'Lương', money: true, render: (r) => <MoneyCell value={r.baseSalary} /> },
            { key: 'bonus', label: 'Thưởng', money: true, render: (r) => <MoneyCell value={r.bonusTotal} /> },
            { key: 'advance', label: 'Ứng', money: true, render: (r) => <MoneyCell value={r.advanceTotal} /> },
            { key: 'deduction', label: 'Giảm trừ', money: true, render: (r) => <MoneyCell value={r.deductionTotal} /> },
            { key: 'net', label: 'Thực lãnh', money: true, render: (r) => <MoneyCell value={r.netAmount} strong /> },
          ]}
        />
      </Section>
      {canAct ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
          <FormField label="Ghi chú duyệt (tùy chọn)">
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setReturnOpen(true)}>
              <Undo2 /> Trả về
            </Button>
            <Button disabled={approving} onClick={() => void doApprove()}>
              <CheckCircle2 /> Duyệt bảng lương · {formatVnd(p.totals.net)}
            </Button>
          </div>
        </div>
      ) : null}
      <SensitiveActionModal
        open={returnOpen}
        onOpenChange={setReturnOpen}
        action={`Trả về bảng lương ${p.code}`}
        description="Operation sẽ nhận thông báo và sửa lại bảng lương trước khi gửi duyệt lại."
        confirmLabel="Trả về"
        loading={returning}
        onConfirm={async (reason) => {
          try {
            await ret({ variables: { id: p.id, reason } });
            toast.success(`Đã trả về ${p.code}`);
            setReturnOpen(false);
            navigate(paths.payrollDetail(p.id));
          } catch (e) {
            toast.error(apolloErrorMessage(e));
          }
        }}
      />
    </div>
  );
}
