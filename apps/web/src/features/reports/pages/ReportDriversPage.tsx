import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { DataTable, EmptyState, ErrorState, MoneyCell, StatusBadge, SummaryStrip } from '@bta/shadcn';
import { ACTIVE_STATUS, formatVnd } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { paths } from '@/app/routes';
import { ReportPage, pct, useReportRange } from '../components/report-ui';
import { RptDriversQuery } from '../graphql/reports';

/** WM-RPT-05 — Hiệu suất tài xế: chuyến hoàn thành, đúng giờ, doanh thu, thưởng, COD giữ, sự cố. */
export default function ReportDriversPage() {
  return (
    <RequirePermission permission="report.view">
      <ReportDrivers />
    </RequirePermission>
  );
}

function ReportDrivers() {
  const navigate = useNavigate();
  const range = useReportRange();
  const status = range.params.get('status') ?? 'ACTIVE';
  const { data, loading, error, refetch } = useQuery(RptDriversQuery, { variables: { filter: { dateFrom: range.from, dateTo: range.to, status: status === 'ALL' ? null : [status] } } });
  const rows = data?.reportDrivers ?? [];
  return (
    <ReportPage
      title="Hiệu suất tài xế"
      subtitle="Đúng giờ = hoàn thành trước giờ kết thúc dự kiến. Thưởng theo chuyến hoàn thành trong kỳ."
      range={range}
      selects={[{ key: 'status', placeholder: 'Trạng thái', value: status, onChange: (v) => range.set({ status: v === 'ACTIVE' ? null : v }), options: [{ value: 'ALL', label: 'Tất cả' }, ...Object.entries(ACTIVE_STATUS).map(([value, m]) => ({ value, label: m.label }))], width: 170 }]}
    >
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      <SummaryStrip
        items={[
          { label: 'Tài xế', value: rows.length },
          { label: 'Chuyến hoàn thành', value: rows.reduce((a, r) => a + r.completedTrips, 0) },
          { label: 'Tổng thưởng', value: formatVnd(rows.reduce((a, r) => a + r.bonusTotal, 0)) },
          { label: 'COD đang giữ', value: formatVnd(rows.reduce((a, r) => a + r.codHeld, 0)), tone: rows.some((r) => r.codHeld > 0) ? 'warning' : 'neutral' },
          { label: 'Sự cố', value: rows.reduce((a, r) => a + r.incidents, 0) },
        ]}
      />
      <DataTable
        rows={rows}
        rowKey={(r) => r.driverId}
        loading={loading && !data}
        onRowClick={(r) => navigate(paths.driver(r.driverId))}
        empty={<EmptyState compact message="Chưa có dữ liệu tài xế trong kỳ" />}
        columns={[
          { key: 'name', label: 'Tài xế', render: (r) => <div className="flex flex-col"><span className="font-medium">{r.name}</span><span className="text-caption text-text-subtle">{r.code}</span></div> },
          { key: 'status', label: 'Trạng thái', hideBelow: 'md', render: (r) => <StatusBadge meta={ACTIVE_STATUS} status={r.status} /> },
          { key: 'trips', label: 'Chuyến xong', align: 'right', render: (r) => <span className="tabular-nums">{r.completedTrips}</span> },
          { key: 'ontime', label: 'Đúng giờ', align: 'right', render: (r) => <span className="tabular-nums">{pct(r.onTimeRate)}</span> },
          { key: 'revenue', label: 'Doanh thu', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.revenue} /> },
          { key: 'bonus', label: 'Thưởng', money: true, render: (r) => <MoneyCell value={r.bonusTotal} tone="success" /> },
          { key: 'cod', label: 'COD giữ', money: true, render: (r) => <MoneyCell value={r.codHeld} tone={r.codHeld > 0 ? 'warning' : 'muted'} /> },
          { key: 'inc', label: 'Sự cố', align: 'right', hideBelow: 'md', render: (r) => <span className={r.incidents ? 'tabular-nums text-danger' : 'tabular-nums'}>{r.incidents}</span> },
        ]}
      />
    </ReportPage>
  );
}
