import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { AlertTriangle, History, Pause, Pencil, Play, Printer, Receipt, RefreshCcw, Wallet, XCircle } from 'lucide-react';
import {
  Banner,
  Breadcrumb,
  Button,
  DataTable,
  DescriptionList,
  DetailSkeleton,
  Dialog,
  EmptyState,
  EntityHeader,
  ErrorState,
  FormField,
  MapView,
  MoneyCell,
  Select,
  SensitiveActionModal,
  StatusBadge,
  StatusStepper,
  SummaryStrip,
  Tabs,
  TabsContent,
  Textarea,
  toast,
  type DataTableColumn,
  type MenuItemDef,
} from '@bta/shadcn';
import {
  EXPENSE_KIND,
  EXPENSE_PAID_BY,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  STOP_STATUS,
  STOP_TYPE,
  TRIP_STATUS,
  TRIP_STATUS_FLOW,
  formatDateTime,
  formatVnd,
  isReverseTransition,
  labelOf,
  type TripStatus,
} from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { DspTripQuery } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { AttachmentsPanel } from '@/features/shared/AttachmentsPanel';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { EntityTimeline, TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { StopDrawer } from '@/features/orders/components/StopDrawer';
import { ago, errorCode, overlapText } from '@/features/orders/components/common';
import { IncidentCreateDialog } from '../components/IncidentCreateDialog';
import { CancelTripMutation, ResumeTripMutation, TripDetailQuery, TripLocationsQuery, UpdateTripStatusMutation } from '../graphql/dispatch';

type Trip = NonNullable<DspTripQuery['trip']>;
type TripStop = NonNullable<Trip['stops']>[number];
type TripExpense = NonNullable<Trip['expenses']>[number];

const TABS = ['overview', 'stops', 'expenses', 'podcod', 'gps', 'incidents', 'attachments', 'timeline'];

const NEXT_LABEL: Partial<Record<TripStatus, string>> = {
  TO_PICKUP: 'Bắt đầu đi lấy hàng',
  PICKING_UP: 'Đã đến điểm lấy',
  IN_TRANSIT: 'Bắt đầu vận chuyển',
  DELIVERING: 'Đến điểm trả',
  COMPLETED: 'Hoàn thành chuyến',
};

/** WM-TRIP-01 — Chi tiết chuyến: phân công, điểm dừng, trạng thái (cập nhật thay tài xế), chi phí, POD/COD, GPS, sự cố. */
export default function TripDetailPage() {
  return (
    <RequirePermission permission="order.view">
      <TripDetail />
    </RequirePermission>
  );
}

function TripDetail() {
  const { tripId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [tabParam, setTab] = useQueryParam('tab');
  const tab = TABS.includes(tabParam ?? '') ? tabParam! : 'overview';
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(TripDetailQuery, { variables: { id: tripId }, pollInterval: 30_000 });
  const { data: locs } = useQuery(TripLocationsQuery, { variables: { tripId }, skip: tab !== 'gps' && tab !== 'overview' });
  const [updateStatus, { loading: saving }] = useMutation(UpdateTripStatusMutation);
  const [resume, { loading: resuming }] = useMutation(ResumeTripMutation);
  const [cancel, { loading: cancelling }] = useMutation(CancelTripMutation);
  const [pauseOpen, setPauseOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [reverseTo, setReverseTo] = React.useState<string | null>(null);
  const [incidentOpen, setIncidentOpen] = React.useState(false);
  const [stopId, setStopId] = React.useState<string | null>(null);

  if (error) {
    return /Không tìm thấy/.test(error.message) ? (
      <EmptyState message="Không tìm thấy chuyến" description="Chuyến không tồn tại hoặc thuộc nhà xe khác." action={<Button onClick={() => navigate(PATHS.dispatch)}>Quay lại bảng điều phối</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const t = data?.trip;
  if (!t) return null;
  const status = t.status as TripStatus;
  const canStatus = hasPermission('trip.status.update');
  const closed = status === 'COMPLETED' || status === 'CANCELLED';

  const change = async (to: string, extra: { reason?: string; note?: string; pauseReasonId?: string } = {}) => {
    try {
      await updateStatus({ variables: { id: t.id, input: { status: to, reason: extra.reason ?? null, note: extra.note ?? null, pauseReasonId: extra.pauseReasonId ?? null } } });
      toast.success(`Chuyến ${t.code}: ${labelOf(TRIP_STATUS, to)}`);
      setPauseOpen(false);
      setStatusOpen(false);
      setReverseTo(null);
      void refetch();
    } catch (e) {
      if (errorCode(e) === 'SENSITIVE_REASON_REQUIRED') {
        setStatusOpen(false);
        setReverseTo(to);
        return;
      }
      toast.error('Không cập nhật được trạng thái', apolloErrorMessage(e));
      throw e;
    }
  };

  const next = t.allowedNextStatuses.filter((s) => s !== 'PAUSED' && s !== 'CANCELLED') as TripStatus[];
  const primary =
    canStatus && !closed ? (
      status === 'PAUSED' ? (
        <Button
          loading={resuming}
          onClick={async () => {
            try {
              await resume({ variables: { id: t.id } });
              toast.success(`Tiếp tục chuyến — về "${labelOf(TRIP_STATUS, t.previousStatusBeforePause ?? '')}"`);
              void refetch();
            } catch (e) {
              toast.error('Không tiếp tục được', apolloErrorMessage(e));
            }
          }}
        >
          <Play /> Tiếp tục chuyến
        </Button>
      ) : next[0] ? (
        <Button loading={saving} onClick={() => void change(next[0])}>
          {NEXT_LABEL[next[0]] ?? labelOf(TRIP_STATUS, next[0])}
        </Button>
      ) : null
    ) : null;

  const menu: MenuItemDef[] = [
    ...(hasPermission('trip.assign') && status !== 'CANCELLED' ? [{ key: 'edit', label: 'Sửa chuyến / đổi xe, tài xế', icon: <Pencil />, onSelect: () => navigate(paths.tripEdit(t.id)) }] : []),
    ...(canStatus && !closed && status !== 'PAUSED' && status !== 'SCHEDULED' ? [{ key: 'pause', label: 'Tạm dừng…', icon: <Pause />, onSelect: () => setPauseOpen(true) }] : []),
    ...(canStatus && status !== 'CANCELLED' ? [{ key: 'status', label: 'Đổi trạng thái…', icon: <RefreshCcw />, onSelect: () => setStatusOpen(true) }] : []),
    ...(hasPermission('expense.create') ? [{ key: 'expense', label: 'Thêm chi phí chuyến', icon: <Receipt />, onSelect: () => navigate(`${PATHS.expenseNew}?kind=TRIP_COST&tripId=${t.id}`) }] : []),
    ...(hasPermission('expense.create') && t.driver ? [{ key: 'advance', label: 'Tạm ứng chuyến', icon: <Wallet />, onSelect: () => navigate(`${PATHS.expenseNew}?kind=TRIP_ADVANCE&tripId=${t.id}&driverId=${t.driver!.id}`) }] : []),
    ...(hasPermission('incident.manage') ? [{ key: 'incident', label: 'Báo sự cố', icon: <AlertTriangle />, onSelect: () => setIncidentOpen(true) }] : []),
    { key: 'print', label: 'In phiếu điều xe', icon: <Printer />, onSelect: () => navigate(`${paths.orderPrint(t.orderId)}?template=DISPATCH_NOTE&tripId=${t.id}`) },
    { key: 'timeline', label: 'Timeline', icon: <History />, onSelect: openTimeline },
    ...(status !== 'CANCELLED' && status !== 'COMPLETED' ? [{ key: 'cancel', label: 'Hủy chuyến', icon: <XCircle />, danger: true, separatorBefore: true, disabled: !hasPermission('trip.cancel'), onSelect: () => setCancelOpen(true) }] : []),
  ];

  const stale = t.lastLocation?.isStale;
  const running = !closed && status !== 'SCHEDULED';
  const expenses = t.expenses ?? [];
  const costTotal = expenses.filter((e) => e.status !== 'CANCELLED' && EXPENSE_KIND[e.kind as keyof typeof EXPENSE_KIND]?.isCost).reduce((s, e) => s + e.amount, 0);
  const advanceTotal = (t.advances ?? []).filter((a) => a.status !== 'CANCELLED').reduce((s, a) => s + a.amount, 0);

  const stopColumns: DataTableColumn<TripStop>[] = [
    { key: 'seq', label: '#', width: 48, render: (s) => <span className="font-mono">{s.tripSequence || s.sequence}</span> },
    { key: 'type', label: 'Loại', render: (s) => <StatusBadge meta={STOP_TYPE} status={s.type} outline /> },
    { key: 'loc', label: 'Địa điểm', render: (s) => <span className="flex flex-col"><span className="font-medium">{s.locationName ?? '—'}</span><span className="text-caption text-text-muted">{s.address}</span></span> },
    { key: 'contact', label: 'Liên hệ', hideBelow: 'lg', render: (s) => [s.contactName, s.contactPhone].filter(Boolean).join(' · ') || '—' },
    { key: 'codE', label: 'COD dự kiến', money: true, render: (s) => <MoneyCell value={s.codExpected} /> },
    { key: 'codA', label: 'COD thực thu', money: true, render: (s) => <MoneyCell value={s.codActual} tone={s.codActual != null && s.codActual !== s.codExpected ? 'warning' : 'default'} /> },
    { key: 'pod', label: 'POD', align: 'center', render: (s) => s.podCount || '—' },
    { key: 'at', label: 'Thực tế', hideBelow: 'md', render: (s) => (s.completedAt ? formatDateTime(s.completedAt) : s.arrivedAt ? `Đến ${formatDateTime(s.arrivedAt)}` : '—') },
    { key: 'status', label: 'Trạng thái', render: (s) => <StatusBadge meta={STOP_STATUS} status={s.status} /> },
  ];
  const expenseColumns: DataTableColumn<TripExpense>[] = [
    { key: 'code', label: 'Phiếu chi', render: (e) => <CellLink to={paths.expense(e.id)}>{e.code}</CellLink> },
    { key: 'date', label: 'Ngày', render: (e) => formatDateTime(e.expenseDate).slice(0, 10) },
    { key: 'cat', label: 'Loại', render: (e) => e.categoryName ?? labelOf(EXPENSE_KIND, e.kind) },
    { key: 'by', label: 'Ai chi', render: (e) => labelOf(EXPENSE_PAID_BY, e.paidBy) + (e.reimbursable ? ' · cần hoàn' : '') },
    { key: 'desc', label: 'Diễn giải', hideBelow: 'lg', render: (e) => e.description ?? '—' },
    { key: 'amt', label: 'Số tiền', money: true, render: (e) => <MoneyCell value={e.amount} tone={e.status === 'CANCELLED' ? 'muted' : 'default'} /> },
  ];

  const path = (locs?.tripLocations ?? []).map((p) => ({ lat: p.lat, lng: p.lng }));
  const stopPins = (t.stops ?? []).filter((s) => s.lat != null && s.lng != null).map((s) => ({ id: s.id, lat: s.lat!, lng: s.lng!, label: `${s.sequence}. ${s.locationName ?? s.address}`, status: (s.status === 'COMPLETED' ? 'neutral' : s.type === 'PICKUP' ? 'accent' : 'primary') as 'neutral' | 'accent' | 'primary' }));
  const pins = [
    ...stopPins,
    ...(t.lastLocation ? [{ id: 'truck', lat: t.lastLocation.lat, lng: t.lastLocation.lng, label: `${t.vehicle?.plate ?? t.code} · ${formatDateTime(t.lastLocation.capturedAt)}`, status: (stale ? 'warning' : 'primary') as 'warning' | 'primary' }] : []),
  ];

  const flowSteps = TRIP_STATUS_FLOW.map((s) => ({
    key: s,
    label: TRIP_STATUS[s].label,
    at: s === 'SCHEDULED' ? formatDateTime(t.plannedStartAt) : s === 'TO_PICKUP' && t.actualStartAt ? formatDateTime(t.actualStartAt) : s === 'COMPLETED' && t.actualEndAt ? formatDateTime(t.actualEndAt) : undefined,
  }));

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Điều phối', to: PATHS.dispatch }, { label: t.order.code, to: paths.order(t.order.id) }, { label: t.code }]} />
      <EntityHeader
        code={t.code}
        status={<StatusBadge meta={TRIP_STATUS} status={t.status} />}
        subtitle={
          <span>
            Đơn <CellLink to={paths.order(t.order.id)}>{t.order.code}</CellLink> · <CellLink to={paths.customer(t.order.customerId)}>{t.order.customerName}</CellLink> · {t.routeSummary ?? ''}
          </span>
        }
        metrics={[
          { label: 'Xe', value: t.vehicle ? <CellLink to={paths.vehicle(t.vehicle.id)}>{t.vehicle.plate}</CellLink> : t.isExternal ? 'Xe ngoài' : 'Chưa gán' },
          { label: 'Tài xế', value: t.driver ? <CellLink to={paths.driver(t.driver.id)}>{t.driver.name}</CellLink> : t.isExternal ? t.externalTransport?.driverName ?? '—' : 'Chưa gán' },
          { label: 'Dự kiến', value: `${formatDateTime(t.plannedStartAt)}${t.plannedEndAt ? ` → ${formatDateTime(t.plannedEndAt).slice(11)}` : ''}` },
        ]}
        primaryAction={primary}
        menu={menu}
      />
      {status === 'PAUSED' ? (
        <Banner tone="warning" message={`Tạm dừng từ ${t.pausedAt ? formatDateTime(t.pausedAt) : '—'}: ${t.pauseReasonLabel ?? ''}${t.pauseNote ? ` — ${t.pauseNote}` : ''}. Tiếp tục sẽ quay về "${labelOf(TRIP_STATUS, t.previousStatusBeforePause ?? '')}".`} />
      ) : null}
      {status === 'CANCELLED' ? <Banner tone="danger" message={`Chuyến đã hủy${t.cancelReason ? `: ${t.cancelReason}` : ''}. Chi phí phát sinh vẫn giữ.`} /> : null}
      {running && stale && t.lastLocation ? <Banner tone="info" message={`App tài xế chưa gửi vị trí từ ${formatDateTime(t.lastLocation.capturedAt)} (${ago(t.lastLocation.capturedAt)}).`} /> : null}
      {t.warnings?.length ? (
        <Banner tone="warning" message={`Cảnh báo lịch: ${t.warnings.map((w) => overlapText({ ...w, thresholdMinutes: w.thresholdMinutes })).join(' · ')}${t.warnings.some((w) => w.overrideReason) ? ` — đã bỏ qua: ${t.warnings.map((w) => w.overrideReason).filter(Boolean).join('; ')}` : ''}`} />
      ) : null}
      {t.openIncidentCount ? <Banner tone="danger" message={`${t.openIncidentCount} sự cố đang mở`} action={<Button size="sm" variant="secondary" onClick={() => setTab('incidents')}>Xem sự cố</Button>} /> : null}
      <StatusStepper steps={flowSteps} current={status === 'PAUSED' ? t.previousStatusBeforePause ?? 'IN_TRANSIT' : status === 'CANCELLED' ? 'SCHEDULED' : status} />
      <SummaryStrip
        items={[
          { label: 'Điểm hoàn thành', value: `${(t.stops ?? []).filter((s) => s.status === 'COMPLETED' || s.status === 'SKIPPED').length}/${(t.stops ?? []).length}` },
          { label: 'COD dự kiến / thực thu', value: `${formatVnd(t.codExpectedTotal)} / ${formatVnd(t.codActualTotal)}` },
          { label: 'Chi phí chuyến', value: formatVnd(costTotal) },
          { label: 'Tạm ứng', value: formatVnd(advanceTotal), hint: 'Không tính lãi/lỗ đến khi đối soát' },
          { label: 'Thưởng tài xế', value: formatVnd(t.driverBonusAmount) },
        ]}
      />
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v === 'overview' ? null : v)}
        items={[
          { value: 'overview', label: 'Tổng quan' },
          { value: 'stops', label: 'Điểm dừng', count: t.stops?.length ?? null },
          { value: 'expenses', label: 'Chi phí & tạm ứng', count: expenses.length + (t.advances?.length ?? 0) },
          { value: 'podcod', label: 'POD & COD' },
          { value: 'gps', label: 'Lộ trình GPS' },
          { value: 'incidents', label: 'Sự cố', count: t.incidents?.length ?? null },
          { value: 'attachments', label: 'Chứng từ', count: t.attachmentCount ?? null },
          { value: 'timeline', label: 'Timeline' },
        ]}
      >
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Điểm dừng được giao" className="lg:col-span-2">
              <DataTable columns={stopColumns} rows={t.stops ?? []} rowKey={(s) => s.id} compact onRowClick={(s) => setStopId(s.id)} empty={<EmptyState compact message="Chuyến chưa có điểm phụ trách" />} />
            </Panel>
            <div className="flex flex-col gap-4">
              <Panel title="Phân công">
                <DescriptionList
                  columns={1}
                  items={[
                    { label: 'Xe', value: t.vehicle ? `${t.vehicle.plate}${t.vehicle.typeName ? ` · ${t.vehicle.typeName}` : ''}${t.vehicle.capacityTons ? ` · ${t.vehicle.capacityTons} tấn` : ''}` : t.isExternal ? `Xe ngoài ${t.externalTransport?.vehiclePlate ?? ''}` : null },
                    { label: 'Tài xế', value: t.driver ? <span>{t.driver.name} · <a className="text-accent" href={`tel:${t.driver.phone}`}>{t.driver.phone}</a></span> : t.externalTransport ? [t.externalTransport.driverName, t.externalTransport.driverPhone].filter(Boolean).join(' · ') : null },
                    ...(t.isExternal ? [{ label: 'NCC / chành', value: t.externalTransport?.supplierId ? <CellLink to={paths.supplier(t.externalTransport.supplierId)}>{t.externalTransport.supplierName}</CellLink> : t.externalTransport?.supplierName }, { label: 'Giá thuê thỏa thuận', value: t.externalTransport?.agreedAmount != null ? formatVnd(t.externalTransport.agreedAmount) : null }] : []),
                    { label: 'Bắt đầu thực tế', value: t.actualStartAt ? formatDateTime(t.actualStartAt) : null },
                    { label: 'Kết thúc thực tế', value: t.actualEndAt ? formatDateTime(t.actualEndAt) : null },
                    { label: 'Ghi chú', value: t.note },
                  ]}
                />
              </Panel>
              <Panel title="Vị trí gần nhất">
                {t.lastLocation ? (
                  <>
                    <MapView pins={pins} path={path} height={220} center={[t.lastLocation.lat, t.lastLocation.lng]} />
                    <p className={`mt-2 text-body-sm ${stale ? 'text-warning' : 'text-text-muted'}`}>
                      {formatDateTime(t.lastLocation.capturedAt)} ({ago(t.lastLocation.capturedAt)}){t.lastLocation.speed != null ? ` · ${Math.round(t.lastLocation.speed)} km/h` : ''}
                    </p>
                  </>
                ) : (
                  <p className="text-body-sm text-text-muted">Chưa có GPS — app tài xế gửi vị trí khi chuyến đang chạy.</p>
                )}
              </Panel>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="stops">
          <Panel title="Điểm dừng — bấm để cập nhật thay tài xế">
            <DataTable columns={stopColumns} rows={t.stops ?? []} rowKey={(s) => s.id} compact onRowClick={(s) => setStopId(s.id)} empty={<EmptyState compact message="Chuyến chưa có điểm phụ trách" />} />
          </Panel>
        </TabsContent>
        <TabsContent value="expenses">
          <div className="flex flex-col gap-4">
            <Panel
              title="Chi phí chuyến"
              actions={
                hasPermission('expense.create') ? (
                  <Button size="sm" onClick={() => navigate(`${PATHS.expenseNew}?kind=TRIP_COST&tripId=${t.id}`)}>
                    <Receipt /> Thêm chi phí
                  </Button>
                ) : null
              }
            >
              <DataTable columns={expenseColumns} rows={expenses} rowKey={(e) => e.id} compact onRowClick={(e) => navigate(paths.expense(e.id))} totalRow={{ code: 'Tổng tính lãi/lỗ', amt: <MoneyCell value={costTotal} strong /> }} empty={<EmptyState compact message="Chưa có chi phí chuyến" />} />
            </Panel>
            <Panel
              title="Tạm ứng chuyến"
              actions={
                <>
                  <CellLink to={`${PATHS.tripAdvances}?tripId=${t.id}`}>Đối soát tạm ứng</CellLink>
                  {hasPermission('expense.create') && t.driver ? (
                    <Button size="sm" variant="secondary" onClick={() => navigate(`${PATHS.expenseNew}?kind=TRIP_ADVANCE&tripId=${t.id}&driverId=${t.driver!.id}`)}>
                      <Wallet /> Tạo tạm ứng
                    </Button>
                  ) : null}
                </>
              }
            >
              <DataTable
                columns={[
                  { key: 'code', label: 'Phiếu chi', render: (a: NonNullable<Trip['advances']>[number]) => <CellLink to={paths.expense(a.id)}>{a.code}</CellLink> },
                  { key: 'date', label: 'Ngày', render: (a) => formatDateTime(a.expenseDate).slice(0, 10) },
                  { key: 'desc', label: 'Diễn giải', render: (a) => a.description ?? '—' },
                  { key: 'amt', label: 'Số tiền', money: true, render: (a) => <MoneyCell value={a.amount} tone={a.status === 'CANCELLED' ? 'muted' : 'default'} /> },
                ]}
                rows={t.advances ?? []}
                rowKey={(a) => a.id}
                compact
                empty={<EmptyState compact message="Chưa tạm ứng cho chuyến này" />}
              />
              <p className="mt-2 text-caption text-text-muted">Tạm ứng là dòng tiền với tài xế, không phải chi phí; sau chuyến đối soát với chi phí thực tế (WM-ADV-01).</p>
            </Panel>
          </div>
        </TabsContent>
        <TabsContent value="podcod">
          <Panel title="POD & COD theo điểm">
            <DataTable
              columns={[
                { key: 'seq', label: '#', width: 48, render: (s: TripStop) => s.tripSequence || s.sequence },
                { key: 'loc', label: 'Điểm', render: (s) => s.locationName ?? s.address },
                { key: 'pod', label: 'Ảnh POD', align: 'center', render: (s) => (s.podCount ? <StatusBadge label={`${s.podCount} ảnh`} tone="success" /> : s.type === 'DROPOFF' ? <StatusBadge label="Chưa có" tone="warning" /> : '—') },
                { key: 'codE', label: 'COD dự kiến', money: true, render: (s) => <MoneyCell value={s.codExpected} /> },
                { key: 'codA', label: 'COD thực thu', money: true, render: (s) => <MoneyCell value={s.codActual} tone={s.codActual != null && s.codActual !== s.codExpected ? 'warning' : 'default'} /> },
                { key: 'codAt', label: 'Lúc thu', render: (s) => (s.codCollectedAt ? formatDateTime(s.codCollectedAt) : '—') },
              ]}
              rows={t.stops ?? []}
              rowKey={(s) => s.id}
              compact
              onRowClick={(s) => setStopId(s.id)}
              totalRow={{ loc: 'Tổng', codE: <MoneyCell value={t.codExpectedTotal} strong />, codA: <MoneyCell value={t.codActualTotal} strong /> }}
            />
            <p className="mt-2 text-caption text-text-muted">COD tài xế thu vào sổ công nợ tài xế (đang giữ tiền công ty) — không phải doanh thu.</p>
          </Panel>
        </TabsContent>
        <TabsContent value="gps">
          <Panel title={`Lộ trình GPS (${locs?.tripLocations.length ?? 0} điểm)`}>
            {path.length || pins.length ? <MapView pins={pins} path={path} height={480} /> : <EmptyState compact message="Chưa có dữ liệu GPS" description="App tài xế tự gửi vị trí khi chuyến đang chạy (có buffer offline)." />}
          </Panel>
        </TabsContent>
        <TabsContent value="incidents">
          <Panel
            title="Sự cố"
            actions={
              hasPermission('incident.manage') ? (
                <Button size="sm" onClick={() => setIncidentOpen(true)}>
                  <AlertTriangle /> Báo sự cố
                </Button>
              ) : null
            }
          >
            <DataTable
              columns={[
                { key: 'code', label: 'Mã', render: (i: NonNullable<Trip['incidents']>[number]) => <CellLink to={paths.incident(i.id)}>{i.code}</CellLink> },
                { key: 'title', label: 'Sự cố', render: (i) => i.title },
                { key: 'sev', label: 'Mức độ', render: (i) => <StatusBadge meta={INCIDENT_SEVERITY} status={i.severity} /> },
                { key: 'st', label: 'Trạng thái', render: (i) => <StatusBadge meta={INCIDENT_STATUS} status={i.status} /> },
                { key: 'at', label: 'Lúc', render: (i) => formatDateTime(i.createdAt) },
              ]}
              rows={t.incidents ?? []}
              rowKey={(i) => i.id}
              compact
              onRowClick={(i) => navigate(paths.incident(i.id))}
              empty={<EmptyState compact message="Chưa có sự cố" />}
            />
          </Panel>
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentsPanel entityType="TRIP" entityId={t.id} category="OTHER" canUpload={canStatus} emptyText="Chưa có chứng từ chuyến" />
        </TabsContent>
        <TabsContent value="timeline">{tab === 'timeline' ? <EntityTimeline entity={{ type: 'TRIP', id: t.id }} /> : null}</TabsContent>
      </Tabs>

      <TimelineDrawer entity={{ type: 'TRIP', id: t.id, label: t.code }} />
      <StopDrawer stopId={stopId} tripId={t.id} open={!!stopId} onOpenChange={(o) => !o && setStopId(null)} onChanged={() => void refetch()} />
      <IncidentCreateDialog open={incidentOpen} onOpenChange={setIncidentOpen} orderId={t.orderId} tripId={t.id} onCreated={() => void refetch()} />
      <PauseDialog open={pauseOpen} onOpenChange={setPauseOpen} loading={saving} onSubmit={(pauseReasonId, note) => void change('PAUSED', { pauseReasonId, note })} />
      <TripStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        current={status}
        loading={saving}
        onSubmit={(to, note) => (to === 'PAUSED' ? (setStatusOpen(false), setPauseOpen(true)) : isReverseTransition(TRIP_STATUS_FLOW, status, to as TripStatus) || closed ? (setStatusOpen(false), setReverseTo(to)) : void change(to, { note }))}
      />
      <SensitiveActionModal
        open={!!reverseTo}
        onOpenChange={(o) => !o && setReverseTo(null)}
        action={`Đổi trạng thái ngược chuyến ${t.code}`}
        before={{ status: labelOf(TRIP_STATUS, status) }}
        after={{ status: labelOf(TRIP_STATUS, reverseTo ?? '') }}
        diffLabels={{ status: 'Trạng thái' }}
        confirmLabel="Đổi trạng thái"
        loading={saving}
        onConfirm={(reason) => change(reverseTo!, { reason })}
      />
      <SensitiveActionModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        action={`Hủy chuyến ${t.code}`}
        description="Đơn vẫn có thể chạy tiếp bằng xe khác. Chi phí đã phát sinh giữ nguyên."
        affected={[`${(t.stops ?? []).length} điểm sẽ không còn chuyến phụ trách`, t.driver ? `Tài xế ${t.driver.name} nhận thông báo hủy` : 'Chưa gán tài xế']}
        confirmLabel="Hủy chuyến"
        loading={cancelling}
        onConfirm={async (reason) => {
          try {
            await cancel({ variables: { id: t.id, reason } });
            toast.success(`Đã hủy chuyến ${t.code}`);
            setCancelOpen(false);
            void refetch();
          } catch (e) {
            toast.error('Không hủy được chuyến', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}

function PauseDialog({ open, onOpenChange, onSubmit, loading }: { open: boolean; onOpenChange: (o: boolean) => void; onSubmit: (reasonId: string, note?: string) => void; loading?: boolean }) {
  const { data } = useQuery(CatalogOptionsQuery, { variables: { type: 'PAUSE_REASON' as never, activeOnly: true }, skip: !open });
  const [reasonId, setReasonId] = React.useState('');
  const [note, setNote] = React.useState('');
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tạm dừng chuyến"
      description="Xe dừng giữa chừng (giờ cấm tải, nghỉ đêm, chờ phà…). Hết dừng bấm Tiếp tục để quay lại trạng thái trước. Sự cố (hư xe, hàng hư) hãy báo sự cố riêng."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button loading={loading} disabled={!reasonId} onClick={() => onSubmit(reasonId, note || undefined)}>
            <Pause /> Tạm dừng
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Lý do" required>
          <Select value={reasonId} onValueChange={setReasonId} placeholder="Chọn lý do" options={(data?.catalogItems ?? []).map((c) => ({ value: c.id, label: c.name }))} />
        </FormField>
        <FormField label="Ghi chú">
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  );
}

function TripStatusDialog({ open, onOpenChange, current, onSubmit, loading }: { open: boolean; onOpenChange: (o: boolean) => void; current: TripStatus; onSubmit: (to: string, note?: string) => void; loading?: boolean }) {
  const [to, setTo] = React.useState<string>(current);
  const [note, setNote] = React.useState('');
  React.useEffect(() => {
    if (open) {
      setTo(current);
      setNote('');
    }
  }, [open, current]);
  const reverse = isReverseTransition(TRIP_STATUS_FLOW, current === 'PAUSED' ? 'IN_TRANSIT' : current, to as TripStatus) || current === 'COMPLETED';
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cập nhật trạng thái thay tài xế"
      description="Dùng khi tài xế không cập nhật được trên app. Mọi thay đổi lưu lịch sử."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button loading={loading} disabled={to === current} onClick={() => onSubmit(to, note || undefined)}>
            {reverse ? 'Tiếp tục (cần lý do)' : 'Lưu trạng thái'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Trạng thái mới">
          <Select value={to} onValueChange={setTo} options={[...TRIP_STATUS_FLOW, 'PAUSED' as const].map((s) => ({ value: s, label: TRIP_STATUS[s].label }))} />
        </FormField>
        {reverse ? <Banner tone="warning" message="Đổi trạng thái ngược — cần quyền 'Đổi trạng thái ngược' và lý do." /> : null}
        <FormField label="Ghi chú">
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  );
}
