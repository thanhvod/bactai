import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { DataTable, EmptyState, ErrorState, FilterChip, MoneyCell, StatusBadge, SummaryStrip } from '@bta/shadcn';
import { PAYROLL_STATUS, formatDate, formatVnd } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { paths } from '@/app/routes';
import { ExportDialog } from '@/features/shared/ExportDialog';
import { ReportPage } from '../components/report-ui';
import { RptPayrollQuery } from '../graphql/reports';

/** WM-RPT-08 — Báo cáo bảng lương theo năm: thực lãnh, ứng, giảm trừ; mở rộng theo tài xế; xuất Excel / phiếu lương. */
export default function ReportPayrollPage() {
  return (
    <RequirePermission permission={['report.view', 'payroll.view']}>
      <ReportPayroll />
    </RequirePermission>
  );
}

function ReportPayroll() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const year = Number(params.get('year') ?? new Date().getFullYear());
  const status = params.get('status');
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [printId, setPrintId] = React.useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery(RptPayrollQuery, { variables: { filter: { year, status: status ? [status] : null } } });
  const rows = data?.reportPayroll ?? [];
  const sel = rows.find((r) => r.payrollId === expanded);
  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    setParams(n, { replace: true });
  };
  const years = [year + 1, year, year - 1, year - 2].filter((y) => y <= new Date().getFullYear() + 1);
  return (
    <ReportPage
      title="Báo cáo bảng lương"
      subtitle="Tổng hợp các bảng lương trong năm (không gồm bảng đã hủy)."
      exportTemplate="PAYROLL"
      exportFilter={{ year, status: status ?? undefined }}
      selects={[{ key: 'year', placeholder: 'Năm', value: String(year), onChange: (v) => set('year', v), options: years.map((y) => ({ value: String(y), label: `Năm ${y}` })), width: 130 }]}
      chips={
        <>
          {(['SUBMITTED', 'APPROVED', 'PAID'] as const).map((s) => (
            <FilterChip key={s} label={PAYROLL_STATUS[s].label} active={status === s} onClick={() => set('status', status === s ? null : s)} />
          ))}
        </>
      }
    >
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      <SummaryStrip
        items={[
          { label: 'Số bảng lương', value: rows.length },
          { label: 'Lương cố định', value: formatVnd(rows.reduce((a, r) => a + r.salary, 0)) },
          { label: 'Thưởng', value: formatVnd(rows.reduce((a, r) => a + r.bonus, 0)) },
          { label: 'Ứng + giảm trừ', value: formatVnd(rows.reduce((a, r) => a + r.advance + r.deduction, 0)) },
          { label: 'Tổng thực lãnh', value: formatVnd(rows.reduce((a, r) => a + r.net, 0)), tone: 'primary' },
        ]}
      />
      <DataTable
        rows={rows}
        rowKey={(r) => r.payrollId}
        loading={loading && !data}
        onRowClick={(r) => setExpanded(expanded === r.payrollId ? null : r.payrollId)}
        rowClassName={(r) => (r.payrollId === expanded ? 'bg-accent-soft' : undefined)}
        empty={<EmptyState compact message="Chưa có bảng lương trong năm" />}
        columns={[
          { key: 'code', label: 'Bảng lương', render: (r) => <div className="flex flex-col"><span className="font-mono">{r.payrollCode}</span><span className="text-caption text-text-subtle">{r.period}</span></div> },
          { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={PAYROLL_STATUS} status={r.status} /> },
          { key: 'drivers', label: 'Tài xế', align: 'right', hideBelow: 'md', render: (r) => r.driverCount },
          { key: 'salary', label: 'Lương', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.salary} /> },
          { key: 'bonus', label: 'Thưởng', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.bonus} /> },
          { key: 'advance', label: 'Ứng', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.advance} /> },
          { key: 'deduction', label: 'Giảm trừ', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.deduction} /> },
          { key: 'net', label: 'Thực lãnh', money: true, render: (r) => <MoneyCell value={r.net} strong /> },
          { key: 'paid', label: 'Ngày chi', hideBelow: 'md', render: (r) => formatDate(r.paidAt) || '—' },
        ]}
      />
      {sel ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-sm">
              {sel.payrollCode} · theo tài xế
            </h2>
            <button className="text-body-sm text-accent hover:underline" onClick={() => navigate(paths.payrollDetail(sel.payrollId))}>
              Mở bảng lương
            </button>
          </div>
          <DataTable
            compact
            rows={sel.byDriver}
            rowKey={(r) => r.driverId}
            columns={[
              { key: 'name', label: 'Tài xế', render: (r) => r.driverName },
              { key: 'salary', label: 'Lương', money: true, render: (r) => <MoneyCell value={r.salary} /> },
              { key: 'bonus', label: 'Thưởng', money: true, render: (r) => <MoneyCell value={r.bonus} /> },
              { key: 'advance', label: 'Ứng', money: true, render: (r) => <MoneyCell value={r.advance} /> },
              { key: 'deduction', label: 'Giảm trừ', money: true, render: (r) => <MoneyCell value={r.deduction} /> },
              { key: 'net', label: 'Thực lãnh', money: true, render: (r) => <MoneyCell value={r.net} strong /> },
            ]}
          />
          <div>
            <button className="text-body-sm text-accent hover:underline" onClick={() => setPrintId(sel.payrollId)}>
              In bảng lương
            </button>
          </div>
        </section>
      ) : null}
      <ExportDialog open={!!printId} onOpenChange={(o) => !o && setPrintId(null)} title="In bảng lương" documents={printId ? [{ template: 'PAYROLL', entityId: printId }] : []} />
    </ReportPage>
  );
}
