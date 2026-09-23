import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { BarChart, Banner, ErrorState, KpiCard, LineChart, PageHeader } from '@bta/shadcn';
import { formatVnd, isoDate } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS } from '@/app/routes';
import { ExportButton } from '@/features/shared/ExportDialog';
import { DashFinanceExtrasQuery, DashProfitMonthlyQuery, DashSummaryQuery } from '../graphql/dashboard';

/** WM-DASH-03 — Dashboard tài chính: doanh thu/chi phí/lãi lỗ, công nợ khách/NCC, COD, dòng tiền vào (giám đốc, kế toán). */
export default function DashboardFinancePage() {
  return (
    <RequirePermission permission={['report.view', 'finance.view']}>
      <DashboardFinance />
    </RequirePermission>
  );
}

function DashboardFinance() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const now = new Date();
  const from = isoDate(new Date(now.getFullYear(), now.getMonth() - 5, 1, 12));
  const to = isoDate(now);
  const { data: sum, error, refetch } = useQuery(DashSummaryQuery, { pollInterval: 60_000 });
  const { data: monthly, loading: mLoading } = useQuery(DashProfitMonthlyQuery, { variables: { filter: { dateFrom: from, dateTo: to, groupBy: 'MONTH' } } });
  const { data: extra } = useQuery(DashFinanceExtrasQuery);
  const s = sum?.dashboardSummary;
  const rows = monthly?.reportProfit.rows ?? [];
  const debt = extra?.reportCustomerDebt;
  const busy = !s;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Dashboard tài chính"
        subtitle="Doanh thu = giá cước + add-on (theo ngày đơn). Phiếu thu, tiền tài xế nộp COD là dòng tiền — không cộng vào doanh thu."
        actions={hasPermission('report.export') ? <ExportButton template="REPORT_PROFIT" filter={{ dateFrom: from, dateTo: to, groupBy: 'MONTH' }} label="Xuất lãi/lỗ 6 tháng" /> : null}
      />
      {error && !sum ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Doanh thu tháng này" value={formatVnd(s?.revenueMonth ?? 0)} loading={busy} to={PATHS.reportProfit} />
        <KpiCard label="Chi phí tháng này" value={formatVnd(s?.costMonth ?? 0)} loading={busy} to={PATHS.expenses} />
        <KpiCard label="Lãi/lỗ tháng này" value={formatVnd(s?.profitMonth ?? 0)} loading={busy} tone={(s?.profitMonth ?? 0) >= 0 ? 'success' : 'danger'} to={`${PATHS.reportProfit}?view=orders`} />
        <KpiCard label="Tiền khách trả trong tháng" value={formatVnd(s?.cashInMonth ?? 0)} sub="Dòng tiền, không phải doanh thu" loading={busy} to={PATHS.payments} />
        <KpiCard label="Công nợ khách còn phải thu" value={formatVnd(s?.receivable ?? 0)} loading={busy} to={PATHS.customerDebt} />
        <KpiCard label="Công nợ quá hạn" value={formatVnd(s?.overdueDebt.amount ?? 0)} sub={s ? `${s.overdueDebt.count} khách` : undefined} tone={s?.overdueDebt.amount ? 'danger' : 'neutral'} loading={busy} to={`${PATHS.customerDebt}?quick=overdue`} />
        <KpiCard label="Công nợ NCC phải trả" value={formatVnd(s?.supplierPayable ?? 0)} tone={s?.supplierPayable ? 'warning' : 'neutral'} loading={busy} to={PATHS.supplierDebt} />
        <KpiCard label="COD tài xế chưa nộp" value={formatVnd(s?.codHeld.amount ?? 0)} sub={s?.codOverThreshold ? `${s.codOverThreshold} tài xế vượt ngưỡng` : undefined} tone={s?.codOverThreshold ? 'danger' : 'neutral'} loading={busy} to={PATHS.cod} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="flex flex-col gap-2">
          <h2 className="text-heading-sm">Doanh thu, chi phí, lãi/lỗ 6 tháng</h2>
          {mLoading && !monthly ? null : (
            <BarChart
              money
              labels={rows.map((r) => r.label)}
              series={[
                { name: 'Doanh thu', values: rows.map((r) => r.revenue), colorToken: 1 },
                { name: 'Chi phí', values: rows.map((r) => r.cost), colorToken: 2 },
              ]}
            />
          )}
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-heading-sm">Lãi/lỗ theo tháng</h2>
          {rows.length ? <LineChart money labels={rows.map((r) => r.label)} series={[{ name: 'Lãi/lỗ', values: rows.map((r) => r.profit), colorToken: 3 }]} /> : null}
        </section>
      </div>
      {debt ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-sm">Tuổi nợ khách hàng</h2>
            <button className="text-body-sm text-accent hover:underline" onClick={() => navigate(PATHS.reportCustomerDebt)}>
              Xem báo cáo công nợ
            </button>
          </div>
          <BarChart
            money
            height={200}
            labels={['Chưa đến hạn', '1–15 ngày', '16–30 ngày', '31–60 ngày', '> 60 ngày']}
            series={[{ name: 'Còn nợ', values: [debt.aging.current, debt.aging.d1_15, debt.aging.d16_30, debt.aging.d31_60, debt.aging.d60p], colorToken: 2 }]}
          />
          {debt.totalCredit ? <Banner tone="info" message={`Khách còn ${formatVnd(debt.totalCredit)} tiền trả trước chưa phân bổ vào đơn.`} action={<button className="text-body-sm text-accent hover:underline" onClick={() => navigate(`${PATHS.payments}?hasUnallocated=1`)}>Phân bổ</button>} /> : null}
        </section>
      ) : null}
    </div>
  );
}
