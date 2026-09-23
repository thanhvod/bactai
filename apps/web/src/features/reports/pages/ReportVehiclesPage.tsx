import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { BarChart, DataTable, EmptyState, ErrorState, MoneyCell, StatusBadge, SummaryStrip } from '@bta/shadcn';
import { VEHICLE_STATUS, formatVnd } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { paths } from '@/app/routes';
import { ReportPage, pct, useReportRange } from '../components/report-ui';
import { RptVehiclesQuery } from '../graphql/reports';

/** WM-RPT-04 — Hiệu suất xe: số chuyến, ngày chạy, doanh thu liên quan, chi phí vật tư/chuyến, lợi nhuận gộp. */
export default function ReportVehiclesPage() {
  return (
    <RequirePermission permission="report.view">
      <ReportVehicles />
    </RequirePermission>
  );
}

function ReportVehicles() {
  const navigate = useNavigate();
  const range = useReportRange();
  const status = range.params.get('status');
  const filter = { dateFrom: range.from, dateTo: range.to, status: status ? [status] : null };
  const { data, loading, error, refetch } = useQuery(RptVehiclesQuery, { variables: { filter } });
  const rows = data?.reportVehicles ?? [];
  const sum = (k: 'revenue' | 'vehicleCost' | 'tripCost' | 'grossProfit' | 'tripCount') => rows.reduce((a, r) => a + r[k], 0);
  const top = [...rows].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  return (
    <ReportPage
      title="Hiệu suất xe"
      subtitle="Doanh thu đơn nhiều xe chia đều theo số chuyến. Chi phí xe gồm vật tư/sửa chữa gắn xe trong kỳ."
      range={range}
      selects={[{ key: 'status', placeholder: 'Trạng thái', value: status ?? 'ALL', onChange: (v) => range.set({ status: v === 'ALL' ? null : v }), options: [{ value: 'ALL', label: 'Tất cả xe' }, ...Object.entries(VEHICLE_STATUS).map(([value, m]) => ({ value, label: m.label }))], width: 160 }]}
    >
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      <SummaryStrip
        items={[
          { label: 'Số xe', value: rows.length },
          { label: 'Tổng chuyến', value: sum('tripCount') },
          { label: 'Doanh thu liên quan', value: formatVnd(sum('revenue')) },
          { label: 'Chi phí xe + chuyến', value: formatVnd(sum('vehicleCost') + sum('tripCost')) },
          { label: 'Lợi nhuận gộp', value: formatVnd(sum('grossProfit')), tone: sum('grossProfit') >= 0 ? 'success' : 'danger' },
        ]}
      />
      {top.length ? (
        <BarChart money withTable={false} labels={top.map((r) => r.plate)} series={[{ name: 'Doanh thu', values: top.map((r) => r.revenue), colorToken: 1 }, { name: 'Lợi nhuận gộp', values: top.map((r) => r.grossProfit), colorToken: 3 }]} />
      ) : null}
      <DataTable
        rows={rows}
        rowKey={(r) => r.vehicleId}
        loading={loading && !data}
        onRowClick={(r) => navigate(paths.vehicle(r.vehicleId))}
        empty={<EmptyState compact message="Chưa có dữ liệu xe trong kỳ" />}
        columns={[
          { key: 'plate', label: 'Biển số', render: (r) => <div className="flex flex-col"><span className="font-mono font-medium">{r.plate}</span><span className="text-caption text-text-subtle">{r.type ?? '—'}</span></div> },
          { key: 'status', label: 'Trạng thái', hideBelow: 'md', render: (r) => <StatusBadge meta={VEHICLE_STATUS} status={r.status} /> },
          { key: 'trips', label: 'Chuyến', align: 'right', render: (r) => <span className="tabular-nums">{r.tripCount}</span> },
          { key: 'days', label: 'Ngày chạy', align: 'right', hideBelow: 'md', render: (r) => <span className="tabular-nums">{r.activeDays}</span> },
          { key: 'util', label: 'Tỉ lệ sử dụng', align: 'right', hideBelow: 'lg', render: (r) => <span className="tabular-nums">{pct(r.utilization)}</span> },
          { key: 'revenue', label: 'Doanh thu', money: true, render: (r) => <MoneyCell value={r.revenue} /> },
          { key: 'vehicleCost', label: 'Chi phí xe', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.vehicleCost} /> },
          { key: 'tripCost', label: 'Chi phí chuyến', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.tripCost} /> },
          { key: 'gross', label: 'Lợi nhuận gộp', money: true, render: (r) => <MoneyCell value={r.grossProfit} signed strong /> },
        ]}
      />
    </ReportPage>
  );
}
