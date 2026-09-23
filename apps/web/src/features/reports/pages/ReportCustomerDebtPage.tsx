import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { FileText } from 'lucide-react';
import { BarChart, Button, DataTable, EmptyState, ErrorState, FilterChip, MoneyCell, SummaryStrip } from '@bta/shadcn';
import { formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import { ReportPage, useReportRange } from '../components/report-ui';
import { RptCustomerDebtQuery } from '../graphql/reports';

/** WM-RPT-06 — Công nợ khách: tuổi nợ, quá hạn, số dư, hạn mức; tạo bảng kê từ dòng. */
export default function ReportCustomerDebtPage() {
  return (
    <RequirePermission permission="report.view">
      <ReportCustomerDebt />
    </RequirePermission>
  );
}

function ReportCustomerDebt() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const range = useReportRange('year');
  const overdueOnly = range.params.get('overdue') === '1';
  const filter = { dateFrom: range.from, dateTo: range.to, overdueOnly };
  const { data, loading, error, refetch } = useQuery(RptCustomerDebtQuery, { variables: { filter } });
  const rep = data?.reportCustomerDebt;
  const rows = rep?.rows ?? [];
  const aging = rep?.aging;
  return (
    <ReportPage
      title="Công nợ khách hàng"
      subtitle="Còn phải thu theo đơn đã xác nhận, tuổi nợ tính từ hạn thanh toán. Số dư = tiền khách trả chưa phân bổ."
      exportTemplate="CUSTOMER_DEBT"
      exportFilter={filter}
      range={range}
      chips={<FilterChip label="Chỉ khách quá hạn" active={overdueOnly} onClick={() => range.set({ overdue: overdueOnly ? null : '1' })} />}
    >
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {rep ? (
        <SummaryStrip
          items={[
            { label: 'Tổng còn phải thu', value: formatVnd(rep.totalDebt) },
            { label: 'Quá hạn', value: formatVnd(rep.totalOverdue), tone: rep.totalOverdue ? 'danger' : 'neutral' },
            { label: 'Số dư khách (chưa phân bổ)', value: formatVnd(rep.totalCredit), tone: 'info' },
            { label: 'Số khách còn nợ', value: rows.filter((r) => r.totalDebt > 0).length },
          ]}
        />
      ) : null}
      {aging ? (
        <BarChart
          money
          withTable={false}
          height={180}
          labels={['Chưa đến hạn', '1–15 ngày', '16–30 ngày', '31–60 ngày', '> 60 ngày']}
          series={[{ name: 'Còn nợ', values: [aging.current, aging.d1_15, aging.d16_30, aging.d31_60, aging.d60p], colorToken: 2 }]}
        />
      ) : null}
      <DataTable
        rows={rows}
        rowKey={(r) => r.customerId}
        loading={loading && !data}
        onRowClick={(r) => navigate(paths.customer(r.customerId, 'debt'))}
        empty={<EmptyState compact message={overdueOnly ? 'Không có khách quá hạn' : 'Không có công nợ'} />}
        columns={[
          { key: 'name', label: 'Khách hàng', render: (r) => <div className="flex flex-col"><span className="font-medium">{r.name}</span><span className="text-caption text-text-subtle">{r.code}{r.warnings.length ? ` · ${r.warnings.join('; ')}` : ''}</span></div> },
          { key: 'limit', label: 'Hạn mức', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.creditLimit} emptyText="Không đặt" /> },
          { key: 'debt', label: 'Còn nợ', money: true, render: (r) => <MoneyCell value={r.totalDebt} strong /> },
          { key: 'd0', label: 'Chưa hạn', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.aging.current} tone="muted" /> },
          { key: 'd15', label: '1–15', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.aging.d1_15} tone={r.aging.d1_15 ? 'warning' : 'muted'} /> },
          { key: 'd30', label: '16–30', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.aging.d16_30} tone={r.aging.d16_30 ? 'warning' : 'muted'} /> },
          { key: 'd60', label: '31–60', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.aging.d31_60} tone={r.aging.d31_60 ? 'danger' : 'muted'} /> },
          { key: 'd60p', label: '> 60', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.aging.d60p} tone={r.aging.d60p ? 'danger' : 'muted'} /> },
          { key: 'credit', label: 'Số dư', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.creditBalance} tone={r.creditBalance ? 'success' : 'muted'} /> },
          {
            key: 'act',
            label: '',
            width: 120,
            render: (r) =>
              hasPermission('debtStatement.create') && r.totalDebt > 0 ? (
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`${PATHS.debtStatements}?customerId=${r.customerId}&create=1`); }}>
                  <FileText /> Bảng kê
                </Button>
              ) : null,
          },
        ]}
      />
    </ReportPage>
  );
}
