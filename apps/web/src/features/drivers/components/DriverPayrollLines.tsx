import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { DataTable, EmptyState, ErrorState, MoneyCell, StatusBadge } from '@bta/shadcn';
import { PAYROLL_STATUS, formatDate } from '@bta/shared';
import { paths } from '@/app/routes';
import { PrDriverPayrollLinesQuery } from '@/features/payroll/graphql/payroll';

/** WM-DRV-04 — Các bảng lương đã dùng mức lương của tài xế (snapshot từng kỳ). */
export function DriverPayrollLines({ driverId }: { driverId: string }) {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(PrDriverPayrollLinesQuery, { variables: { driverId } });
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  const rows = data?.driverPayrollLines ?? [];
  return (
    <DataTable
      compact
      rows={rows}
      rowKey={(r) => r.id ?? r.payrollId}
      loading={loading && !data}
      onRowClick={(r) => (r.id ? navigate(paths.payrollLine(r.payrollId, r.id)) : navigate(paths.payrollDetail(r.payrollId)))}
      empty={<EmptyState compact message="Tài xế chưa có trong bảng lương nào" />}
      columns={[
        { key: 'code', label: 'Bảng lương', render: (r) => <div className="flex flex-col"><span className="font-mono">{r.payrollCode}</span><span className="text-caption text-text-subtle">{r.periodLabel}</span></div> },
        { key: 'status', label: 'Trạng thái', render: (r) => (r.payrollStatus ? <StatusBadge meta={PAYROLL_STATUS} status={r.payrollStatus} /> : null) },
        { key: 'base', label: 'Lương snapshot', money: true, render: (r) => <div className="text-right"><MoneyCell value={r.baseSalary} /><span className="block text-caption text-text-subtle">{r.salaryEffectiveFrom ? `mốc ${formatDate(r.salaryEffectiveFrom)}` : ''}</span></div> },
        { key: 'bonus', label: 'Thưởng', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.bonusTotal} /> },
        { key: 'advance', label: 'Ứng', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.advanceTotal} /> },
        { key: 'deduction', label: 'Giảm trừ', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.deductionTotal} /> },
        { key: 'net', label: 'Thực lãnh', money: true, render: (r) => <MoneyCell value={r.netAmount} strong /> },
      ]}
    />
  );
}
