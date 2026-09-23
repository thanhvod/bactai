import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { HandCoins } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, MoneyCell, SummaryStrip } from '@bta/shadcn';
import { formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import { ReportPage, useReportRange } from '../components/report-ui';
import { RptCodQuery } from '../graphql/reports';

/** WM-RPT-07 — COD tài xế: đã thu, đã nộp, đang giữ, tuổi nợ; ghi nhận nộp COD. COD nộp về KHÔNG phải doanh thu. */
export default function ReportCodPage() {
  return (
    <RequirePermission permission="report.view">
      <ReportCod />
    </RequirePermission>
  );
}

function ReportCod() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const range = useReportRange('year');
  const { data, loading, error, refetch } = useQuery(RptCodQuery, { variables: { filter: { dateFrom: range.from, dateTo: range.to } } });
  const rep = data?.reportCodHeld;
  const rows = rep?.rows ?? [];
  return (
    <ReportPage title="COD tài xế" subtitle="Tiền tài xế nộp COD là thu hồi khoản phải thu từ tài xế, không phải doanh thu." exportTemplate="COD_HELD" exportFilter={{}} range={range}>
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {rep ? (
        <SummaryStrip
          items={[
            { label: 'Tổng COD đang giữ', value: formatVnd(rep.totalHeld), tone: rep.totalHeld ? 'warning' : 'neutral' },
            { label: 'Tài xế vượt ngưỡng', value: rep.overThresholdCount, tone: rep.overThresholdCount ? 'danger' : 'neutral' },
            { label: 'Ngưỡng cảnh báo', value: `${formatVnd(rep.thresholdAmount)} / ${rep.thresholdDays} ngày` },
          ]}
        />
      ) : null}
      <DataTable
        rows={rows}
        rowKey={(r) => r.driverId}
        loading={loading && !data}
        onRowClick={(r) => navigate(paths.driverCod(r.driverId))}
        rowClassName={(r) => (r.overAmount || r.overDays ? 'bg-danger-soft' : undefined)}
        empty={<EmptyState compact message="Không có tài xế giữ COD" />}
        columns={[
          { key: 'name', label: 'Tài xế', render: (r) => <div className="flex flex-col"><span className="font-medium">{r.name}</span><span className="text-caption text-text-subtle">{r.phone}</span></div> },
          { key: 'collected', label: 'Đã thu', money: true, render: (r) => <MoneyCell value={r.codCollected} /> },
          { key: 'remitted', label: 'Đã nộp', money: true, render: (r) => <MoneyCell value={r.codRemitted} tone="success" /> },
          { key: 'held', label: 'Đang giữ', money: true, render: (r) => <MoneyCell value={r.codHeld} strong tone={r.overAmount || r.overDays ? 'danger' : 'default'} /> },
          { key: 'days', label: 'Số ngày giữ', align: 'right', render: (r) => <span className={r.overDays ? 'tabular-nums text-danger' : 'tabular-nums'}>{r.codHeld ? r.heldDays : '—'}</span> },
          { key: 'oldest', label: 'Khoản cũ nhất', hideBelow: 'md', render: (r) => formatDate(r.oldestHeldAt) || '—' },
          {
            key: 'act',
            label: '',
            width: 150,
            render: (r) =>
              hasPermission('cod.remittance.record') && r.codHeld > 0 ? (
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`${PATHS.paymentNew}?type=DRIVER_COD_REMITTANCE&driverId=${r.driverId}`); }}>
                  <HandCoins /> Ghi nhận nộp
                </Button>
              ) : null,
          },
        ]}
      />
    </ReportPage>
  );
}
