import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { BarChart, Banner, DataTable, EmptyState, ErrorState, MoneyCell, SegmentedControl, StatusBadge, SummaryStrip, type DataTableColumn } from '@bta/shadcn';
import { ORDER_STATUS, formatVnd } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { paths } from '@/app/routes';
import type { RptProfitRowFieldsFragment } from '@/gql/graphql';
import { ReportPage, pct, useReportRange } from '../components/report-ui';
import { RptProfitQuery } from '../graphql/reports';

type Row = RptProfitRowFieldsFragment;
const TIME_GROUPS = ['MONTH', 'WEEK', 'DAY'];

/** WM-RPT-02 — Doanh thu · chi phí · lãi/lỗ (nhóm theo thời gian/khách/xe/tài xế); `?view=orders` = WM-RPT-03 lãi/lỗ theo đơn. */
export default function ReportProfitPage() {
  return (
    <RequirePermission permission="report.view">
      <ReportProfit />
    </RequirePermission>
  );
}

function ReportProfit() {
  const navigate = useNavigate();
  const range = useReportRange();
  const view = range.params.get('view');
  const groupBy = view === 'orders' ? 'ORDER' : (range.params.get('groupBy') ?? 'MONTH');
  const filter = { dateFrom: range.from, dateTo: range.to, groupBy };
  const { data, loading, error, refetch } = useQuery(RptProfitQuery, { variables: { filter } });
  const rep = data?.reportProfit;
  const rows = rep?.rows ?? [];
  const t = rep?.totals;
  const isTime = TIME_GROUPS.includes(groupBy);

  const open = (r: Row) => {
    if (!r.entityId) return;
    if (groupBy === 'ORDER') navigate(paths.order(r.entityId, 'finance'));
    else if (groupBy === 'CUSTOMER') navigate(paths.customer(r.entityId, 'debt'));
    else if (groupBy === 'VEHICLE') navigate(paths.vehicle(r.entityId));
    else if (groupBy === 'DRIVER') navigate(paths.driver(r.entityId));
  };

  const columns: DataTableColumn<Row>[] = [
    {
      key: 'label',
      label: groupBy === 'ORDER' ? 'Đơn hàng' : isTime ? 'Kỳ' : groupBy === 'CUSTOMER' ? 'Khách hàng' : groupBy === 'VEHICLE' ? 'Xe' : 'Tài xế',
      render: (r) => (
        <div className="flex flex-col">
          <span className={groupBy === 'ORDER' ? 'font-mono' : 'font-medium'}>{r.label}</span>
          {r.sublabel ? <span className="text-caption text-text-subtle">{r.sublabel}</span> : null}
        </div>
      ),
    },
    ...(groupBy === 'ORDER'
      ? [{ key: 'status', label: 'Trạng thái', render: (r: Row) => (r.status ? <StatusBadge meta={ORDER_STATUS} status={r.status} /> : null) } as DataTableColumn<Row>]
      : [{ key: 'orders', label: 'Số đơn', align: 'right', render: (r: Row) => <span className="tabular-nums">{r.orderCount}</span> } as DataTableColumn<Row>]),
    { key: 'freight', label: 'Giá cước', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.freight} /> },
    { key: 'addons', label: 'Add-on', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.addons} /> },
    { key: 'revenue', label: 'Doanh thu', money: true, render: (r) => <MoneyCell value={r.revenue} strong /> },
    { key: 'tripCost', label: 'Chi phí chuyến', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.tripCost} /> },
    { key: 'outsourced', label: 'Thuê ngoài', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.outsourcedCost} /> },
    { key: 'other', label: 'Chi phí khác', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.otherCost} /> },
    { key: 'profit', label: 'Lãi/lỗ', money: true, render: (r) => <MoneyCell value={r.profit} signed strong /> },
    { key: 'margin', label: 'Biên', align: 'right', render: (r) => <span className="tabular-nums">{pct(r.margin)}{r.isProvisional ? <span className="ml-1 text-caption text-warning" title="Đơn chưa hoàn thành — tạm tính">*</span> : null}</span> },
  ];

  const setGroup = (g: string) => range.set({ groupBy: g === 'MONTH' ? null : g, view: null });

  return (
    <ReportPage
      title={view === 'orders' ? 'Lãi/lỗ theo đơn' : 'Doanh thu – chi phí – lãi/lỗ'}
      subtitle="Doanh thu = giá cước + add-on của đơn đã xác nhận (theo ngày đơn). Chi phí gồm chi phí chuyến, thuê xe ngoài, vật tư; không gồm tạm ứng/hoàn ứng."
      exportTemplate="REPORT_PROFIT"
      exportFilter={filter}
      range={range}
      chips={
        <SegmentedControl
          size="sm"
          value={view === 'orders' ? 'ORDER' : groupBy}
          onChange={(g) => (g === 'ORDER' ? range.set({ view: 'orders', groupBy: null }) : setGroup(g))}
          items={[
            { value: 'MONTH', label: 'Tháng' },
            { value: 'WEEK', label: 'Tuần' },
            { value: 'DAY', label: 'Ngày' },
            { value: 'CUSTOMER', label: 'Khách' },
            { value: 'VEHICLE', label: 'Xe' },
            { value: 'DRIVER', label: 'Tài xế' },
            { value: 'ORDER', label: 'Đơn' },
          ]}
        />
      }
    >
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {t ? (
        <SummaryStrip
          items={[
            { label: 'Doanh thu', value: formatVnd(t.revenue), hint: `Cước ${formatVnd(t.freight)} · add-on ${formatVnd(t.addons)}` },
            { label: 'Chi phí', value: formatVnd(t.cost), hint: `Chuyến ${formatVnd(t.tripCost)} · thuê ngoài ${formatVnd(t.outsourcedCost)}` },
            { label: 'Lãi/lỗ', value: formatVnd(t.profit), tone: t.profit >= 0 ? 'success' : 'danger' },
            { label: 'Biên lợi nhuận', value: pct(t.margin) },
            { label: 'Số đơn', value: t.orderCount },
          ]}
        />
      ) : null}
      {rep?.notes.length ? <Banner tone="info" message={rep.notes.join(' ')} /> : null}
      {isTime && rows.length ? (
        <BarChart
          money
          withTable={false}
          labels={rows.map((r) => r.label)}
          series={[
            { name: 'Doanh thu', values: rows.map((r) => r.revenue), colorToken: 1 },
            { name: 'Chi phí', values: rows.map((r) => r.cost), colorToken: 2 },
            { name: 'Lãi/lỗ', values: rows.map((r) => r.profit), colorToken: 3 },
          ]}
        />
      ) : null}
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.key}
        loading={loading && !data}
        onRowClick={isTime ? undefined : open}
        empty={<EmptyState compact message="Không có đơn trong kỳ" />}
        totalRow={
          t
            ? {
                label: <span className="font-medium">Tổng</span>,
                freight: <MoneyCell value={t.freight} strong />,
                addons: <MoneyCell value={t.addons} strong />,
                revenue: <MoneyCell value={t.revenue} strong />,
                tripCost: <MoneyCell value={t.tripCost} strong />,
                outsourced: <MoneyCell value={t.outsourcedCost} strong />,
                other: <MoneyCell value={t.otherCost} strong />,
                profit: <MoneyCell value={t.profit} signed strong />,
                margin: <span className="tabular-nums font-medium">{pct(t.margin)}</span>,
              }
            : undefined
        }
      />
      {rows.some((r) => r.isProvisional) ? <p className="text-caption text-text-subtle">* Đơn chưa hoàn thành — lãi/lỗ tạm tính, có thể thay đổi khi phát sinh thêm chi phí.</p> : null}
    </ReportPage>
  );
}
