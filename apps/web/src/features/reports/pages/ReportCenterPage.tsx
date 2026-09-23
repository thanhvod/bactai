import { useQuery } from '@apollo/client/react';
import { BarChart3, FileBarChart, Truck, UserRound, Wallet } from 'lucide-react';
import { ErrorState, KpiCard, PageHeader, Skeleton } from '@bta/shadcn';
import { RequirePermission } from '@/app/auth/guards';
import { RangeControls, useReportRange } from '../components/report-ui';
import { RptSummaryQuery } from '../graphql/reports';

const ICON: Record<string, React.ReactNode> = {
  profit: <BarChart3 />,
  profitByOrder: <FileBarChart />,
  customerDebt: <Wallet />,
  cod: <Wallet />,
  vehicles: <Truck />,
  drivers: <UserRound />,
  payroll: <Wallet />,
};
const GROUPS = ['Vận hành', 'Tài chính', 'Lương'];

/** WM-RPT-01 — Trung tâm báo cáo: headline từng báo cáo theo kỳ, bấm để xem sâu. */
export default function ReportCenterPage() {
  return (
    <RequirePermission permission="report.view">
      <ReportCenter />
    </RequirePermission>
  );
}

function ReportCenter() {
  const range = useReportRange();
  const { data, loading, error, refetch } = useQuery(RptSummaryQuery, { variables: { filter: { dateFrom: range.from, dateTo: range.to } } });
  const items = data?.reportSummary ?? [];
  const qs = range.preset === 'custom' ? `from=${range.from}&to=${range.to}&preset=custom` : `preset=${range.preset}`;
  const withRange = (route: string) => (route.includes('payroll') ? route : `${route}${route.includes('?') ? '&' : '?'}${qs}`);
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Báo cáo" subtitle="Doanh thu = giá cước + add-on theo ngày đơn. Phiếu thu và tiền tài xế nộp COD không tính là doanh thu." actions={<RangeControls range={range} />} />
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {GROUPS.map((g) => {
        const list = items.filter((i) => i.group === g);
        if (!loading && !list.length) return null;
        return (
          <section key={g} className="flex flex-col gap-2">
            <h2 className="text-heading-sm">{g}</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {loading && !data
                ? [0, 1].map((i) => <Skeleton key={i} h={96} />)
                : list.map((i) => <KpiCard key={i.key} label={i.title} value={i.headline} icon={ICON[i.key]} to={withRange(i.route)} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
