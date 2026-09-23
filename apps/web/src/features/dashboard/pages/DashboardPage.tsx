import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { CheckCircle2, HandCoins, Plus } from 'lucide-react';
import { Button, DataTable, DueIndicator, EmptyState, ErrorState, KpiCard, MoneyCell, PageHeader, StatusBadge, SummaryStrip, WarningPanel } from '@bta/shadcn';
import { TRIP_STATUS, formatDateTime, formatTime, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS, paths } from '@/app/routes';
import { DashSummaryQuery } from '../graphql/dashboard';

const POLL_MS = 30_000;

/** WM-DASH-01 — Dashboard tổng quan: KPI hôm nay, chuyến, công nợ quá hạn, COD, sự cố, bảng lương chờ duyệt (polling 30s). */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { hasPermission, current } = useAuth();
  const { data, loading, error, refetch } = useQuery(DashSummaryQuery, { pollInterval: POLL_MS, notifyOnNetworkStatusChange: false });
  const s = data?.dashboardSummary;
  const busy = loading && !data;
  const showMoney = hasPermission('report.view') || hasPermission('finance.view');

  const warnings = [
    ...(s?.scheduleWarnings ? [`${s.scheduleWarnings} cảnh báo trùng/gần trùng lịch xe, tài xế chưa xử lý`] : []),
    ...(s?.unassignedOrders ? [`${s.unassignedOrders} đơn đã xác nhận chưa xếp đủ xe`] : []),
    ...(s?.codOverThreshold ? [`${s.codOverThreshold} tài xế giữ COD vượt ngưỡng`] : []),
    ...(s?.overdueDebt.count ? [`${s.overdueDebt.count} khách có đơn quá hạn thanh toán (${formatVnd(s.overdueDebt.amount)})`] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Tổng quan"
        subtitle={`${current?.merchantName ?? ''} · cập nhật ${s ? formatDateTime(new Date()) : '…'} (tự làm mới 30 giây)`}
        actions={
          <>
            {hasPermission('payroll.approve') && s?.payrollPending ? (
              <Button variant="secondary" onClick={() => navigate(`${PATHS.payroll}?status=SUBMITTED`)}>
                <CheckCircle2 /> Duyệt bảng lương ({s.payrollPending})
              </Button>
            ) : null}
            {hasPermission('cod.remittance.record') ? (
              <Button variant="secondary" onClick={() => navigate(`${PATHS.paymentNew}?type=DRIVER_COD_REMITTANCE`)}>
                <HandCoins /> Ghi nhận nộp COD
              </Button>
            ) : null}
            {hasPermission('order.create') ? (
              <Button onClick={() => navigate(PATHS.orderNew)}>
                <Plus /> Tạo đơn
              </Button>
            ) : null}
          </>
        }
      />
      {error && !data ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Chuyến đang chạy" value={s?.runningTrips ?? 0} sub={s ? `${s.todayTrips} chuyến hôm nay` : undefined} to={PATHS.dispatch} loading={busy} tone="accent" />
        <KpiCard label="Đơn cần xử lý" value={s?.ordersNeedAction ?? 0} sub={s ? `${s.newOrdersToday} đơn mới hôm nay` : undefined} to={`${PATHS.orders}?view=action`} loading={busy} tone={s?.ordersNeedAction ? 'warning' : 'neutral'} />
        <KpiCard label="Công nợ quá hạn" value={formatVnd(s?.overdueDebt.amount ?? 0)} sub={s ? `${s.overdueDebt.count} khách` : undefined} to={`${PATHS.customerDebt}?quick=overdue`} loading={busy} tone={s?.overdueDebt.amount ? 'danger' : 'neutral'} />
        <KpiCard label="COD tài xế giữ" value={formatVnd(s?.codHeld.amount ?? 0)} sub={s ? `${s.codHeld.count} tài xế${s.codOverThreshold ? ` · ${s.codOverThreshold} vượt ngưỡng` : ''}` : undefined} to={`${PATHS.cod}?warning=1`} loading={busy} tone={s?.codOverThreshold ? 'danger' : s?.codHeld.amount ? 'warning' : 'neutral'} />
        <KpiCard label="Sự cố đang mở" value={s?.openIncidents ?? 0} to={PATHS.incidents} loading={busy} tone={s?.openIncidents ? 'danger' : 'neutral'} />
        <KpiCard label="Bảng lương chờ duyệt" value={s?.payrollPending ?? 0} to={`${PATHS.payroll}?status=SUBMITTED`} loading={busy} tone={s?.payrollPending ? 'info' : 'neutral'} />
      </div>
      {warnings.length ? <WarningPanel title="Cảnh báo cần chú ý" items={warnings} action={s?.scheduleWarnings ? <Button size="sm" variant="secondary" onClick={() => navigate(PATHS.dispatchConflicts)}>Xử lý trùng lịch</Button> : undefined} /> : null}
      {showMoney && s ? (
        <SummaryStrip
          items={[
            { label: 'Doanh thu tháng (tạm tính)', value: formatVnd(s.revenueMonth), hint: 'Giá cước + add-on theo ngày đơn' },
            { label: 'Chi phí tháng', value: formatVnd(s.costMonth) },
            { label: 'Lãi/lỗ tháng', value: formatVnd(s.profitMonth), tone: s.profitMonth >= 0 ? 'success' : 'danger' },
            { label: 'Tiền khách trả trong tháng', value: formatVnd(s.cashInMonth), hint: 'Dòng tiền — không phải doanh thu' },
            { label: 'Còn phải thu', value: formatVnd(s.receivable) },
          ]}
        />
      ) : null}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="flex flex-col gap-2 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-sm">Chuyến hôm nay</h2>
            <button className="text-body-sm text-accent hover:underline" onClick={() => navigate(PATHS.dispatch)}>
              Bảng điều phối
            </button>
          </div>
          <DataTable
            loading={busy}
            rows={s?.todayTripList ?? []}
            rowKey={(r) => r.id}
            onRowClick={(r) => navigate(paths.trip(r.id))}
            rowClassName={(r) => (r.openIncident ? 'bg-danger-soft' : r.hasWarning ? 'bg-warning-soft' : undefined)}
            empty={<EmptyState compact message="Hôm nay chưa có chuyến" />}
            columns={[
              { key: 'code', label: 'Mã chuyến', render: (r) => <div className="flex flex-col"><span className="font-mono">{r.code}</span><span className="text-caption text-text-subtle">{r.orderCode}</span></div> },
              { key: 'route', label: 'Tuyến', render: (r) => r.routeSummary ?? '—' },
              { key: 'time', label: 'Giờ', hideBelow: 'md', render: (r) => `${formatTime(r.plannedStartAt)}${r.plannedEndAt ? `–${formatTime(r.plannedEndAt)}` : ''}` },
              { key: 'driver', label: 'Tài xế · xe', hideBelow: 'md', render: (r) => [r.driverName, r.vehiclePlate].filter(Boolean).join(' · ') || <span className="text-warning">Chưa gán</span> },
              { key: 'status', label: 'Trạng thái', render: (r) => <div className="flex items-center gap-1"><StatusBadge meta={TRIP_STATUS} status={r.status} />{r.openIncident ? <span className="text-caption text-danger">Sự cố</span> : null}</div> },
            ]}
          />
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-heading-sm">Đơn quá hạn thanh toán</h2>
          <DataTable
            compact
            loading={busy}
            rows={s?.overdueOrders ?? []}
            rowKey={(r) => r.orderId}
            onRowClick={(r) => navigate(paths.order(r.orderId, 'finance'))}
            empty={<EmptyState compact message="Không có đơn quá hạn" />}
            columns={[
              { key: 'code', label: 'Mã đơn', render: (r) => <span className="font-mono">{r.code}</span> },
              { key: 'customer', label: 'Khách', render: (r) => r.customerName },
              { key: 'remaining', label: 'Còn nợ', money: true, render: (r) => <MoneyCell value={r.remaining} tone="danger" /> },
              { key: 'due', label: 'Hạn', render: (r) => <DueIndicator dueDate={r.dueDate} overdueDays={r.overdueDays} /> },
            ]}
          />
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-heading-sm">Tài xế đang giữ COD</h2>
          <DataTable
            compact
            loading={busy}
            rows={s?.codHolders ?? []}
            rowKey={(r) => r.driverId}
            onRowClick={(r) => navigate(paths.driverCod(r.driverId))}
            empty={<EmptyState compact message="Không có tài xế giữ COD" />}
            columns={[
              { key: 'name', label: 'Tài xế', render: (r) => <div className="flex flex-col"><span>{r.name}</span><span className="text-caption text-text-subtle">{r.phone}</span></div> },
              { key: 'held', label: 'Đang giữ', money: true, render: (r) => <MoneyCell value={r.codHeld} tone={r.overThreshold ? 'danger' : 'warning'} strong={r.overThreshold} /> },
              { key: 'days', label: 'Số ngày', align: 'right', render: (r) => <span className={r.overThreshold ? 'tabular-nums text-danger' : 'tabular-nums'}>{r.daysHeld}</span> },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
