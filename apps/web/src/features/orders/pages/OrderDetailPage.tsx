import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  History,
  Pencil,
  Plus,
  Printer,
  Receipt,
  RefreshCcw,
  Trash2,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  AttachmentList,
  Banner,
  Breadcrumb,
  Button,
  DataTable,
  DescriptionList,
  DetailSkeleton,
  Dialog,
  DueIndicator,
  EmptyState,
  EntityHeader,
  ErrorState,
  FormField,
  IconButton,
  Input,
  MoneyCell,
  MoneyInput,
  PartnerCard,
  Select,
  SensitiveActionModal,
  StatusBadge,
  SummaryStrip,
  Tabs,
  TabsContent,
  Textarea,
  WarningPanel,
  toast,
  type DataTableColumn,
  type MenuItemDef,
} from '@bta/shadcn';
import {
  CARGO_PROPERTY,
  EXPENSE_KIND,
  EXPENSE_PAID_BY,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  STOP_STATUS,
  STOP_TYPE,
  TRIP_STATUS,
  formatDate,
  formatDateTime,
  formatVnd,
  isReverseTransition,
  labelOf,
  type OrderStatus,
} from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { OrdOrderDetailQuery } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { AttachmentsPanel } from '@/features/shared/AttachmentsPanel';
import { EntityTimeline, TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { IncidentCreateDialog } from '@/features/dispatch/components/IncidentCreateDialog';
import {
  CancelOrderMutation,
  CreateOrderStopMutation,
  DeleteCargoLineMutation,
  OrderAttachmentsQuery,
  OrderDetailQuery,
  RemoveOrderStopMutation,
  ReorderOrderStopsMutation,
  UpdateOrderStatusMutation,
  UpsertCargoLineMutation,
} from '../graphql/orders';
import { PricingDrawer } from '../components/PricingDrawer';
import { StopDrawer } from '../components/StopDrawer';
import { errorCode, fromLocalInput } from '../components/common';

type Order = NonNullable<OrdOrderDetailQuery['order']>;
type Stop = NonNullable<Order['stops']>[number];
type Cargo = NonNullable<Order['cargoLines']>[number];
type Trip = NonNullable<Order['trips']>[number];
type Expense = NonNullable<Order['financeSummary']>['expenses'][number];
type Allocation = NonNullable<Order['financeSummary']>['allocations'][number];

const TABS = ['overview', 'stops', 'cargo', 'trips', 'finance', 'incidents', 'attachments', 'timeline'] as const;

/** WM-ORD-02 — Chi tiết đơn hàng: trung tâm xử lý một đơn. */
export default function OrderDetailPage() {
  return (
    <RequirePermission permission="order.view">
      <OrderDetailView />
    </RequirePermission>
  );
}

/** Dùng lại cho WM-STOP-01 (/orders/:orderId/stops/:stopId) — mở drawer điểm dừng trên nền chi tiết đơn. */
export function OrderDetailView({ openStopId, onStopClose }: { openStopId?: string | null; onStopClose?: () => void }) {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [tabParam, setTab] = useQueryParam('tab');
  const tab = (TABS as readonly string[]).includes(tabParam ?? '') ? tabParam! : openStopId ? 'stops' : 'overview';
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(OrderDetailQuery, { variables: { id: orderId }, pollInterval: 30_000 });
  const [updateStatus, { loading: statusSaving }] = useMutation(UpdateOrderStatusMutation);
  const [cancel, { loading: cancelling }] = useMutation(CancelOrderMutation);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [statusTarget, setStatusTarget] = React.useState<string | null>(null);
  const [reverseOpen, setReverseOpen] = React.useState<string | null>(null);
  const [pricingOpen, setPricingOpen] = React.useState(false);
  const [incidentOpen, setIncidentOpen] = React.useState(false);
  const [stopId, setStopId] = React.useState<string | null>(openStopId ?? null);
  React.useEffect(() => setStopId(openStopId ?? null), [openStopId]);

  if (error) {
    return /Không tìm thấy/.test(error.message) ? (
      <EmptyState message="Không tìm thấy đơn hàng" description="Đơn không tồn tại hoặc thuộc nhà xe khác." action={<Button onClick={() => navigate(PATHS.orders)}>Quay lại danh sách đơn</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const o = data?.order;
  if (!o) return null;
  const status = o.status as OrderStatus;
  const fin = o.financeSummary;
  const closed = status === 'CANCELLED';

  const doStatus = async (to: string, reason?: string, note?: string) => {
    try {
      await updateStatus({ variables: { id: o.id, status: to, reason: reason ?? null, note: note ?? null } });
      toast.success(`Đơn ${o.code}: ${labelOf(ORDER_STATUS, to)}`);
      setStatusTarget(null);
      setReverseOpen(null);
      void refetch();
    } catch (e) {
      if (errorCode(e) === 'SENSITIVE_REASON_REQUIRED') {
        setStatusTarget(null);
        setReverseOpen(to);
        return;
      }
      toast.error('Không đổi được trạng thái', apolloErrorMessage(e));
      throw e;
    }
  };
  const requestStatus = (to: string) => {
    if (isReverseTransition(ORDER_STATUS_FLOW, status, to as OrderStatus)) setReverseOpen(to);
    else void doStatus(to);
  };

  const paymentUrl = `${PATHS.paymentNew}?type=CUSTOMER_PAYMENT&customerId=${o.customer.id}&orderId=${o.id}`;
  const expenseUrl = `${PATHS.expenseNew}?orderId=${o.id}`;
  const canUpdate = hasPermission('order.update');
  const primary = (() => {
    if (closed) return null;
    if ((status === 'DRAFT' || status === 'PENDING_CONFIRMATION') && canUpdate)
      return (
        <Button loading={statusSaving} onClick={() => requestStatus('CONFIRMED')}>
          <CheckCircle2 /> Xác nhận đơn
        </Button>
      );
    if ((status === 'CONFIRMED' || status === 'DISPATCHED') && hasPermission('trip.create'))
      return (
        <Button onClick={() => navigate(paths.orderTripNew(o.id))}>
          <Truck /> Tạo chuyến
        </Button>
      );
    if (status === 'COMPLETED' && o.remainingAmount > 0 && hasPermission('payment.create'))
      return (
        <Button onClick={() => navigate(paymentUrl)}>
          <Banknote /> Ghi nhận thanh toán
        </Button>
      );
    return null;
  })();

  const menu: MenuItemDef[] = [
    ...(canUpdate && !closed ? [{ key: 'edit', label: 'Sửa đơn', icon: <Pencil />, onSelect: () => navigate(paths.orderEdit(o.id)) }] : []),
    ...(canUpdate && !closed ? [{ key: 'price', label: 'Sửa giá cước / add-on', icon: <CircleDollarSign />, onSelect: () => setPricingOpen(true) }] : []),
    ...(hasPermission('trip.create') && !closed && status !== 'COMPLETED' ? [{ key: 'trip', label: 'Tạo chuyến', icon: <Truck />, onSelect: () => navigate(paths.orderTripNew(o.id)) }] : []),
    ...(canUpdate && !closed ? [{ key: 'status', label: 'Đổi trạng thái…', icon: <RefreshCcw />, onSelect: () => setStatusTarget(status) }] : []),
    { key: 'print', label: 'In phiếu giao hàng / điều xe', icon: <Printer />, onSelect: () => navigate(paths.orderPrint(o.id)) },
    ...(hasPermission('order.create') ? [{ key: 'copy', label: 'Tạo đơn tương tự', icon: <Copy />, onSelect: () => navigate(`${PATHS.orderNew}?customerId=${o.customer.id}`) }] : []),
    { key: 'timeline', label: 'Timeline', icon: <History />, onSelect: openTimeline },
    ...(!closed ? [{ key: 'cancel', label: 'Hủy đơn', icon: <XCircle />, danger: true, separatorBefore: true, disabled: !hasPermission('order.cancel'), onSelect: () => setCancelOpen(true) }] : []),
  ];

  const openTrips = (o.trips ?? []).filter((t) => !['COMPLETED', 'CANCELLED'].includes(t.status));

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Đơn hàng', to: PATHS.orders }, { label: o.code }]} />
      <EntityHeader
        code={o.code}
        status={<StatusBadge meta={ORDER_STATUS} status={o.status} />}
        subtitle={
          <span>
            <CellLink to={paths.customer(o.customer.id)}>{o.customer.name}</CellLink> · {formatDate(o.orderDate)} · {o.routeSummary ?? '—'}
          </span>
        }
        metrics={[
          { label: 'Tổng thu khách', value: formatVnd(o.totalAmount) },
          { label: 'Còn nợ', value: <span className={o.remainingAmount > 0 ? (o.overdueDays > 0 ? 'text-danger' : 'text-warning') : ''}>{formatVnd(o.remainingAmount)}</span> },
          { label: 'Chuyến', value: `${o.tripCount}` },
        ]}
        primaryAction={primary}
        menu={menu}
      />
      {closed ? <Banner tone="danger" message={`Đơn đã hủy${o.cancelledAt ? ` lúc ${formatDateTime(o.cancelledAt)}` : ''}${o.cancelReason ? ` — ${o.cancelReason}` : ''}. Chi phí đã phát sinh vẫn giữ để quyết toán.`} /> : null}
      {o.warnings.length || o.customerWarnings?.length ? <WarningPanel title="Cảnh báo" items={[...o.warnings, ...(o.customerWarnings ?? [])]} /> : null}
      <SummaryStrip
        items={[
          { label: 'Giá cước', value: formatVnd(o.freightAmount) },
          { label: 'Add-on', value: formatVnd(o.addonTotal) },
          { label: 'Đã thu', value: formatVnd(o.paidAmount), tone: o.paidAmount ? 'success' : undefined },
          { label: 'Hạn thanh toán', value: <DueIndicator dueDate={o.dueDate} overdueDays={o.overdueDays} paid={o.remainingAmount <= 0 && o.paidAmount > 0} /> },
          ...(fin ? [{ label: fin.provisional ? 'Lãi/lỗ tạm tính' : 'Lãi/lỗ', value: formatVnd(fin.profit), tone: (fin.profit < 0 ? 'danger' : 'success') as 'danger' | 'success' }] : []),
        ]}
      />
      <Tabs
        value={tab}
        onValueChange={(t) => setTab(t === 'overview' ? null : t)}
        items={[
          { value: 'overview', label: 'Tổng quan' },
          { value: 'stops', label: 'Điểm dừng', count: o.stops?.length ?? null },
          { value: 'cargo', label: 'Hàng hóa', count: o.cargoLines?.length ?? null },
          { value: 'trips', label: 'Chuyến', count: o.tripCount },
          { value: 'finance', label: 'Tài chính' },
          { value: 'incidents', label: 'Sự cố', count: o.incidents?.length ?? null },
          { value: 'attachments', label: 'Chứng từ', count: o.attachmentCount ?? null },
          { value: 'timeline', label: 'Timeline' },
        ]}
      >
        <TabsContent value="overview">
          <Overview o={o} onOpenStop={setStopId} onTab={setTab} />
        </TabsContent>
        <TabsContent value="stops">
          <StopsTab o={o} onOpenStop={setStopId} refetch={() => void refetch()} />
        </TabsContent>
        <TabsContent value="cargo">
          <CargoTab o={o} refetch={() => void refetch()} />
        </TabsContent>
        <TabsContent value="trips">
          <TripsTab o={o} />
        </TabsContent>
        <TabsContent value="finance">
          <FinanceTab o={o} paymentUrl={paymentUrl} expenseUrl={expenseUrl} onEditPrice={() => setPricingOpen(true)} />
        </TabsContent>
        <TabsContent value="incidents">
          <Panel
            title="Sự cố của đơn"
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
                { key: 'code', label: 'Mã', render: (i: NonNullable<Order['incidents']>[number]) => <CellLink to={paths.incident(i.id)}>{i.code}</CellLink> },
                { key: 'title', label: 'Sự cố', render: (i) => i.title },
                { key: 'sev', label: 'Mức độ', render: (i) => <StatusBadge meta={INCIDENT_SEVERITY} status={i.severity} /> },
                { key: 'status', label: 'Trạng thái', render: (i) => <StatusBadge meta={INCIDENT_STATUS} status={i.status} /> },
                { key: 'at', label: 'Lúc', render: (i) => formatDateTime(i.createdAt) },
              ]}
              rows={o.incidents ?? []}
              rowKey={(i) => i.id}
              compact
              onRowClick={(i) => navigate(paths.incident(i.id))}
              empty={<EmptyState compact message="Đơn chưa có sự cố" />}
            />
          </Panel>
        </TabsContent>
        <TabsContent value="attachments">{tab === 'attachments' ? <OrderAttachments orderId={o.id} canUpload={canUpdate || hasPermission('trip.status.update')} /> : null}</TabsContent>
        <TabsContent value="timeline">{tab === 'timeline' ? <EntityTimeline entity={{ type: 'ORDER', id: o.id }} /> : null}</TabsContent>
      </Tabs>

      <TimelineDrawer entity={{ type: 'ORDER', id: o.id, label: o.code }} />
      <StopDrawer
        stopId={stopId}
        open={!!stopId}
        onOpenChange={(open) => {
          if (!open) {
            setStopId(null);
            onStopClose?.();
          }
        }}
        onChanged={() => void refetch()}
      />
      <PricingDrawer open={pricingOpen} onOpenChange={setPricingOpen} order={o} onSaved={() => void refetch()} />
      <IncidentCreateDialog open={incidentOpen} onOpenChange={setIncidentOpen} orderId={o.id} trips={(o.trips ?? []).map((t) => ({ id: t.id, code: t.code }))} onCreated={() => void refetch()} />
      <StatusDialog
        open={!!statusTarget}
        current={status}
        onOpenChange={(v) => !v && setStatusTarget(null)}
        loading={statusSaving}
        onSubmit={(to, note) => (isReverseTransition(ORDER_STATUS_FLOW, status, to as OrderStatus) ? (setStatusTarget(null), setReverseOpen(to)) : void doStatus(to, undefined, note))}
      />
      <SensitiveActionModal
        open={!!reverseOpen}
        onOpenChange={(v) => !v && setReverseOpen(null)}
        action={`Đổi trạng thái ngược đơn ${o.code}`}
        before={{ status: labelOf(ORDER_STATUS, status) }}
        after={{ status: labelOf(ORDER_STATUS, reverseOpen ?? '') }}
        diffLabels={{ status: 'Trạng thái' }}
        warning={status === 'COMPLETED' ? 'Đơn đã hoàn thành — mở lại có thể ảnh hưởng công nợ/bảng kê.' : undefined}
        confirmLabel="Đổi trạng thái"
        loading={statusSaving}
        onConfirm={(reason) => doStatus(reverseOpen!, reason)}
      />
      <SensitiveActionModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        action={`Hủy đơn ${o.code}`}
        description="Đơn hủy không phát sinh phải thu; chi phí đã phát sinh vẫn giữ để quyết toán."
        affected={[
          `${openTrips.length} chuyến chưa hoàn thành sẽ bị hủy theo${openTrips.length ? `: ${openTrips.map((t) => t.code).join(', ')}` : ''}`,
          fin?.expenses.length ? `${fin.expenses.length} phiếu chi vẫn giữ (${formatVnd(fin.expenseTotal)})` : 'Chưa có chi phí',
          o.paidAmount ? `Đã thu ${formatVnd(o.paidAmount)} — cần xử lý phân bổ lại` : 'Chưa có tiền phân bổ',
        ]}
        confirmLabel="Hủy đơn"
        loading={cancelling}
        onConfirm={async (reason) => {
          try {
            await cancel({ variables: { id: o.id, reason } });
            toast.success(`Đã hủy đơn ${o.code}`);
            setCancelOpen(false);
            void refetch();
          } catch (e) {
            toast.error('Không hủy được đơn', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}

function StatusDialog({ open, current, onOpenChange, onSubmit, loading }: { open: boolean; current: string; onOpenChange: (o: boolean) => void; onSubmit: (to: string, note?: string) => void; loading?: boolean }) {
  const [to, setTo] = React.useState(current);
  const [note, setNote] = React.useState('');
  React.useEffect(() => {
    if (open) {
      setTo(current);
      setNote('');
    }
  }, [open, current]);
  const reverse = isReverseTransition(ORDER_STATUS_FLOW, current as OrderStatus, to as OrderStatus);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Đổi trạng thái đơn"
      description="Operation được cập nhật trạng thái thủ công; mọi thay đổi lưu lịch sử. Hủy đơn dùng thao tác Hủy đơn."
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
          <Select value={to} onValueChange={setTo} options={ORDER_STATUS_FLOW.map((s) => ({ value: s, label: ORDER_STATUS[s].label }))} />
        </FormField>
        {reverse ? <Banner tone="warning" message="Đây là đổi trạng thái ngược — cần quyền và lý do." /> : null}
        <FormField label="Ghi chú">
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  );
}

function Overview({ o, onOpenStop, onTab }: { o: Order; onOpenStop: (id: string) => void; onTab: (t: string) => void }) {
  const navigate = useNavigate();
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Panel title="Điểm lấy / trả" actions={<Button size="sm" variant="ghost" onClick={() => onTab('stops')}>Xem tất cả</Button>}>
          <ol className="flex flex-col gap-3">
            {(o.stops ?? []).map((s) => (
              <li key={s.id} className="flex cursor-pointer items-start gap-3 rounded-md p-1 hover:bg-surface-muted" onClick={() => onOpenStop(s.id)}>
                <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-caption font-semibold text-white ${s.type === 'PICKUP' ? 'bg-info' : 'bg-primary'}`}>{s.sequence}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{s.locationName ?? labelOf(STOP_TYPE, s.type)}</span>
                    <StatusBadge meta={STOP_STATUS} status={s.status} />
                    {s.tripCodes.length ? <span className="text-caption text-text-muted">{s.tripCodes.join(', ')}</span> : <span className="text-caption text-warning">Chưa gán chuyến</span>}
                  </div>
                  <div className="text-body-sm text-text-muted">{s.address}</div>
                  <div className="text-caption text-text-subtle">
                    {[s.contactName, s.contactPhone, s.plannedAt ? `DK ${formatDateTime(s.plannedAt)}` : null, s.codExpected ? `COD ${formatVnd(s.codExpected)}` : null, s.podCount ? `${s.podCount} POD` : null].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Chuyến" actions={<Button size="sm" variant="ghost" onClick={() => onTab('trips')}>Xem tất cả</Button>}>
          {(o.trips ?? []).length ? (
            <ul className="flex flex-col gap-2">
              {(o.trips ?? []).map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-2 text-body-sm">
                  <CellLink to={paths.trip(t.id)}>{t.code}</CellLink>
                  <StatusBadge meta={TRIP_STATUS} status={t.status} />
                  <span className="text-text-muted">{[t.vehicle?.plate ?? (t.isExternal ? 'Xe ngoài' : 'Chưa gán xe'), t.driver?.name, formatDateTime(t.plannedStartAt)].filter(Boolean).join(' · ')}</span>
                  {t.hasWarning ? <AlertTriangle className="size-4 text-warning" aria-label="Cảnh báo lịch" /> : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact message="Chưa có chuyến" action={o.status !== 'CANCELLED' ? <Button size="sm" onClick={() => navigate(paths.orderTripNew(o.id))}><Truck /> Tạo chuyến</Button> : null} />
          )}
        </Panel>
        <Panel title="Hàng hóa">
          {(o.cargoLines ?? []).length ? (
            <ul className="flex flex-col gap-1 text-body-sm">
              {(o.cargoLines ?? []).map((c) => (
                <li key={c.id}>
                  <span className="font-medium">{c.name}</span>
                  <span className="text-text-muted"> {cargoMeta(c)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-body-sm text-text-muted">Chưa khai báo hàng hóa</span>
          )}
        </Panel>
      </div>
      <div className="flex flex-col gap-4">
        <PartnerCard name={o.customer.name} code={o.customer.code} lines={[o.customer.phone ?? '—']} />
        <Panel title="Thông tin đơn">
          <DescriptionList
            columns={1}
            items={[
              { label: 'Ngày đơn', value: formatDate(o.orderDate) },
              { label: 'Hạn thanh toán', value: o.dueDate ? formatDate(o.dueDate) : 'Chưa đặt' },
              { label: 'Xác nhận lúc', value: o.confirmedAt ? formatDateTime(o.confirmedAt) : null },
              { label: 'Bắt đầu', value: o.startedAt ? formatDateTime(o.startedAt) : null },
              { label: 'Hoàn thành', value: o.completedAt ? formatDateTime(o.completedAt) : null },
              { label: 'Yêu cầu xe', value: [o.requiredVehicleTypeName, o.requiredCapacityTons ? `${o.requiredCapacityTons} tấn` : null].filter(Boolean).join(' · ') || null },
              { label: 'Ghi chú', value: o.note },
              { label: 'Ghi chú nội bộ', value: o.internalNote },
            ]}
          />
        </Panel>
        {(o.externalTransports ?? []).length ? (
          <Panel title="Thuê xe ngoài">
            {(o.externalTransports ?? []).map((x) => (
              <DescriptionList
                key={x.id}
                columns={1}
                items={[
                  { label: 'NCC / chành', value: x.supplierId ? <CellLink to={paths.supplier(x.supplierId)}>{x.supplierName}</CellLink> : x.supplierName },
                  { label: 'Xe / tài xế ngoài', value: [x.vehiclePlate, x.driverName, x.driverPhone].filter(Boolean).join(' · ') || null },
                  { label: 'Giá thuê thỏa thuận', value: x.agreedAmount != null ? formatVnd(x.agreedAmount) : null },
                  { label: 'Ghi chú', value: x.note },
                ]}
              />
            ))}
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

function cargoMeta(c: Cargo) {
  const parts = [
    c.cargoTypeName,
    c.weightKg != null ? `${c.weightKg.toLocaleString('vi-VN')} kg` : null,
    c.volumeM3 != null ? `${c.volumeM3} m³` : null,
    c.quantity != null ? `${c.quantity} ${c.packagingUnit ?? ''}`.trim() : null,
    ...(c.properties ?? []).map((p) => CARGO_PROPERTY[p as keyof typeof CARGO_PROPERTY] ?? p),
  ].filter(Boolean);
  return parts.length ? `· ${parts.join(' · ')}` : '';
}

// ---------------- WM-ORD-04: Điểm dừng ----------------

function StopsTab({ o, onOpenStop, refetch }: { o: Order; onOpenStop: (id: string) => void; refetch: () => void }) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('order.update') && o.status !== 'CANCELLED';
  const [reorder, { loading: reordering }] = useMutation(ReorderOrderStopsMutation);
  const [remove] = useMutation(RemoveOrderStopMutation);
  const [adding, setAdding] = React.useState(false);
  const [removeTarget, setRemoveTarget] = React.useState<Stop | null>(null);
  const stops = o.stops ?? [];
  const move = async (idx: number, dir: -1 | 1) => {
    const ids = stops.map((s) => s.id);
    const j = idx + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[idx], ids[j]] = [ids[j], ids[idx]];
    try {
      await reorder({ variables: { orderId: o.id, stopIds: ids } });
      refetch();
    } catch (e) {
      toast.error('Không sắp xếp được', apolloErrorMessage(e));
    }
  };
  const columns: DataTableColumn<Stop>[] = [
    {
      key: 'seq',
      label: '#',
      width: 88,
      render: (s, i) => (
        <span className="flex items-center gap-1">
          <span className="w-5 font-mono">{s.sequence}</span>
          {canEdit ? (
            <>
              <IconButton label="Lên" size="sm" variant="ghost" disabled={i === 0 || reordering} onClick={(e) => (e.stopPropagation(), void move(i, -1))}><ArrowUp /></IconButton>
              <IconButton label="Xuống" size="sm" variant="ghost" disabled={i === stops.length - 1 || reordering} onClick={(e) => (e.stopPropagation(), void move(i, 1))}><ArrowDown /></IconButton>
            </>
          ) : null}
        </span>
      ),
    },
    { key: 'type', label: 'Loại', render: (s) => <StatusBadge meta={STOP_TYPE} status={s.type} outline /> },
    {
      key: 'loc',
      label: 'Địa điểm',
      render: (s) => (
        <span className="flex flex-col">
          <span className="font-medium">{s.locationName ?? '—'}</span>
          <span className="text-caption text-text-muted">{s.address}</span>
        </span>
      ),
    },
    { key: 'contact', label: 'Liên hệ', hideBelow: 'lg', render: (s) => [s.contactName, s.contactPhone].filter(Boolean).join(' · ') || '—' },
    { key: 'trip', label: 'Chuyến', render: (s) => (s.tripIds.length ? s.tripIds.map((id, i) => <CellLink key={id} to={paths.trip(id)}>{s.tripCodes[i]} </CellLink>) : <span className="text-warning">Chưa gán</span>) },
    { key: 'codE', label: 'COD dự kiến', money: true, render: (s) => <MoneyCell value={s.codExpected} /> },
    { key: 'codA', label: 'COD thực thu', money: true, render: (s) => <MoneyCell value={s.codActual} tone={s.codActual != null && s.codActual !== s.codExpected ? 'warning' : 'default'} /> },
    { key: 'pod', label: 'POD', align: 'center', render: (s) => (s.podCount ? s.podCount : '—') },
    { key: 'at', label: 'Giờ thực tế', hideBelow: 'lg', render: (s) => (s.completedAt ? formatDateTime(s.completedAt) : s.arrivedAt ? `Đến ${formatDateTime(s.arrivedAt)}` : '—') },
    { key: 'status', label: 'Trạng thái', render: (s) => <StatusBadge meta={STOP_STATUS} status={s.status} /> },
    {
      key: 'actions',
      label: '',
      width: 48,
      render: (s) =>
        canEdit && s.status === 'NOT_ARRIVED' && !s.codActual && !s.podCount ? (
          <IconButton label="Xóa điểm" size="sm" variant="ghost" onClick={(e) => (e.stopPropagation(), setRemoveTarget(s))}><Trash2 /></IconButton>
        ) : null,
    },
  ];
  return (
    <Panel
      title="Điểm lấy / trả"
      actions={
        canEdit ? (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus /> Thêm điểm
          </Button>
        ) : null
      }
    >
      <DataTable columns={columns} rows={stops} rowKey={(s) => s.id} compact onRowClick={(s) => onOpenStop(s.id)} empty={<EmptyState compact message="Đơn chưa có điểm dừng" />} />
      <p className="mt-2 text-caption text-text-muted">Điểm đã đến/có COD/POD không xóa được — dùng "Bỏ qua điểm" trong chi tiết điểm (cần lý do).</p>
      <AddStopDialog open={adding} onOpenChange={setAdding} orderId={o.id} onDone={refetch} />
      <SensitiveActionModal
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        action={`Xóa điểm ${removeTarget?.sequence ?? ''} khỏi đơn`}
        description={removeTarget?.address}
        danger
        confirmLabel="Xóa điểm"
        onConfirm={async (reason) => {
          try {
            await remove({ variables: { id: removeTarget!.id, reason } });
            toast.success('Đã xóa điểm dừng');
            setRemoveTarget(null);
            refetch();
          } catch (e) {
            toast.error('Không xóa được điểm', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </Panel>
  );
}

function AddStopDialog({ open, onOpenChange, orderId, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; orderId: string; onDone: () => void }) {
  const [create, { loading }] = useMutation(CreateOrderStopMutation);
  const [type, setType] = React.useState('DROPOFF');
  const [locationName, setLocationName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [contactName, setContactName] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [plannedAt, setPlannedAt] = React.useState('');
  const [cod, setCod] = React.useState<number | null>(null);
  const submit = async () => {
    if (!address.trim()) return toast.error('Nhập địa chỉ');
    try {
      await create({ variables: { orderId, input: { type, locationName: locationName || null, address, contactName: contactName || null, contactPhone: contactPhone || null, plannedAt: fromLocalInput(plannedAt), codExpected: cod } } });
      toast.success('Đã thêm điểm dừng');
      onOpenChange(false);
      setAddress('');
      setLocationName('');
      setCod(null);
      onDone();
    } catch (e) {
      toast.error('Không thêm được điểm', apolloErrorMessage(e));
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thêm điểm lấy/trả"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button loading={loading} onClick={() => void submit()}>
            Thêm điểm
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Loại">
          <Select value={type} onValueChange={setType} options={Object.entries(STOP_TYPE).map(([value, m]) => ({ value, label: m.label }))} />
        </FormField>
        <FormField label="Tên điểm">
          <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} />
        </FormField>
        <FormField label="Địa chỉ" required className="md:col-span-2">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>
        <FormField label="Người liên hệ">
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </FormField>
        <FormField label="SĐT">
          <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </FormField>
        <FormField label="Giờ dự kiến">
          <Input type="datetime-local" value={plannedAt} onChange={(e) => setPlannedAt(e.target.value)} />
        </FormField>
        <FormField label="COD dự kiến">
          <MoneyInput value={cod} onChange={setCod} />
        </FormField>
      </div>
    </Dialog>
  );
}

// ---------------- WM-ORD-05: Hàng hóa ----------------

function CargoTab({ o, refetch }: { o: Order; refetch: () => void }) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('order.update') && o.status !== 'CANCELLED';
  const [editing, setEditing] = React.useState<Partial<Cargo> | null>(null);
  const [del] = useMutation(DeleteCargoLineMutation);
  const stopLabel = (id?: string | null) => {
    const s = (o.stops ?? []).find((x) => x.id === id);
    return s ? `${s.sequence}. ${s.locationName ?? s.address}` : '—';
  };
  return (
    <Panel
      title="Hàng hóa (ghi chú là chính)"
      actions={
        canEdit ? (
          <Button size="sm" onClick={() => setEditing({})}>
            <Plus /> Thêm dòng hàng
          </Button>
        ) : null
      }
    >
      <DataTable<Cargo>
        columns={[
          { key: 'name', label: 'Tên hàng', render: (c) => <span className="font-medium">{c.name}</span> },
          { key: 'type', label: 'Loại', render: (c) => c.cargoTypeName ?? '—' },
          { key: 'weight', label: 'Khối lượng', align: 'right', render: (c) => (c.weightKg != null ? `${c.weightKg.toLocaleString('vi-VN')} kg` : '—') },
          { key: 'vol', label: 'Thể tích', align: 'right', hideBelow: 'lg', render: (c) => (c.volumeM3 != null ? `${c.volumeM3} m³` : '—') },
          { key: 'qty', label: 'Số lượng', align: 'right', render: (c) => (c.quantity != null ? `${c.quantity} ${c.packagingUnit ?? ''}` : '—') },
          { key: 'props', label: 'Tính chất', render: (c) => (c.properties ?? []).map((p) => CARGO_PROPERTY[p as keyof typeof CARGO_PROPERTY] ?? p).join(', ') || '—' },
          { key: 'stops', label: 'Lấy → trả', hideBelow: 'lg', render: (c) => `${stopLabel(c.pickupStopId)} → ${stopLabel(c.dropoffStopId)}` },
          {
            key: 'act',
            label: '',
            width: 80,
            render: (c) =>
              canEdit ? (
                <span className="flex">
                  <IconButton label="Sửa" size="sm" variant="ghost" onClick={(e) => (e.stopPropagation(), setEditing(c))}><Pencil /></IconButton>
                  <IconButton
                    label="Xóa"
                    size="sm"
                    variant="ghost"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await del({ variables: { id: c.id } });
                        toast.success('Đã xóa dòng hàng');
                        refetch();
                      } catch (err) {
                        toast.error('Không xóa được', apolloErrorMessage(err));
                      }
                    }}
                  >
                    <Trash2 />
                  </IconButton>
                </span>
              ) : null,
          },
        ]}
        rows={o.cargoLines ?? []}
        rowKey={(c) => c.id}
        compact
        empty={<EmptyState compact message="Chưa khai báo hàng hóa" description="Chỉ cần tên hàng, vd. '10 tấn gạo'." />}
      />
      <CargoDialog cargo={editing} onClose={() => setEditing(null)} orderId={o.id} stops={o.stops ?? []} onDone={refetch} />
    </Panel>
  );
}

function CargoDialog({ cargo, onClose, orderId, stops, onDone }: { cargo: Partial<Cargo> | null; onClose: () => void; orderId: string; stops: Stop[]; onDone: () => void }) {
  const { data: types } = useQuery(CatalogOptionsQuery, { variables: { type: 'CARGO_TYPE' as never, activeOnly: true }, skip: !cargo });
  const [save, { loading }] = useMutation(UpsertCargoLineMutation);
  const [f, setF] = React.useState<Record<string, string>>({});
  const [props, setProps] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!cargo) return;
    setF({
      name: cargo.name ?? '', cargoTypeId: cargo.cargoTypeId ?? '', weightKg: cargo.weightKg != null ? String(cargo.weightKg) : '', volumeM3: cargo.volumeM3 != null ? String(cargo.volumeM3) : '',
      quantity: cargo.quantity != null ? String(cargo.quantity) : '', packagingUnit: cargo.packagingUnit ?? '', pickupStopId: cargo.pickupStopId ?? '', dropoffStopId: cargo.dropoffStopId ?? '', note: cargo.note ?? '',
    });
    setProps(cargo.properties ?? []);
  }, [cargo]);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const num = (v?: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);
  const submit = async () => {
    if (!f.name?.trim()) return toast.error('Nhập tên hàng');
    try {
      await save({
        variables: {
          orderId,
          input: {
            ...(cargo?.id ? { id: cargo.id } : {}),
            name: f.name.trim(), cargoTypeId: f.cargoTypeId || null, weightKg: num(f.weightKg), volumeM3: num(f.volumeM3), quantity: num(f.quantity), packagingUnit: f.packagingUnit || null,
            properties: props, pickupStopId: f.pickupStopId || null, dropoffStopId: f.dropoffStopId || null, note: f.note || null,
          },
        },
      });
      toast.success('Đã lưu dòng hàng');
      onClose();
      onDone();
    } catch (e) {
      toast.error('Không lưu được', apolloErrorMessage(e));
    }
  };
  return (
    <Dialog
      open={!!cargo}
      onOpenChange={(o) => !o && onClose()}
      title={cargo?.id ? 'Sửa dòng hàng' : 'Thêm dòng hàng'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button loading={loading} onClick={() => void submit()}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Tên hàng" required className="md:col-span-2">
          <Input value={f.name ?? ''} onChange={set('name')} />
        </FormField>
        <FormField label="Loại hàng">
          <Select value={f.cargoTypeId ?? ''} allowEmpty onValueChange={(v) => setF((x) => ({ ...x, cargoTypeId: v }))} options={(types?.catalogItems ?? []).map((t) => ({ value: t.id, label: t.name }))} />
        </FormField>
        <FormField label="Khối lượng (kg)">
          <Input inputMode="decimal" value={f.weightKg ?? ''} onChange={set('weightKg')} />
        </FormField>
        <FormField label="Thể tích (m³)">
          <Input inputMode="decimal" value={f.volumeM3 ?? ''} onChange={set('volumeM3')} />
        </FormField>
        <FormField label="Số lượng / đơn vị">
          <div className="flex gap-2">
            <Input inputMode="decimal" value={f.quantity ?? ''} onChange={set('quantity')} className="w-24" />
            <Input value={f.packagingUnit ?? ''} onChange={set('packagingUnit')} placeholder="kiện, pallet…" />
          </div>
        </FormField>
        <FormField label="Điểm lấy">
          <Select value={f.pickupStopId ?? ''} allowEmpty onValueChange={(v) => setF((x) => ({ ...x, pickupStopId: v }))} options={stops.filter((s) => s.type === 'PICKUP').map((s) => ({ value: s.id, label: `${s.sequence}. ${s.locationName ?? s.address}` }))} />
        </FormField>
        <FormField label="Điểm trả">
          <Select value={f.dropoffStopId ?? ''} allowEmpty onValueChange={(v) => setF((x) => ({ ...x, dropoffStopId: v }))} options={stops.filter((s) => s.type === 'DROPOFF').map((s) => ({ value: s.id, label: `${s.sequence}. ${s.locationName ?? s.address}` }))} />
        </FormField>
        <FormField label="Tính chất" className="md:col-span-2">
          <div className="flex flex-wrap gap-2">
            {Object.entries(CARGO_PROPERTY).map(([key, label]) => {
              const on = props.includes(key);
              return (
                <button type="button" key={key} onClick={() => setProps(on ? props.filter((p) => p !== key) : [...props, key])} className={`rounded border px-2 py-1 text-body-sm ${on ? 'border-primary bg-primary-soft text-primary' : 'border-border-control text-text-muted'}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </FormField>
        <FormField label="Ghi chú" className="md:col-span-2">
          <Textarea rows={2} value={f.note ?? ''} onChange={set('note')} />
        </FormField>
      </div>
    </Dialog>
  );
}

// ---------------- Chuyến ----------------

function TripsTab({ o }: { o: Order }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const unassigned = (o.stops ?? []).filter((s) => !s.tripIds.length && s.status !== 'SKIPPED');
  const cols: DataTableColumn<Trip>[] = [
    { key: 'code', label: 'Mã chuyến', render: (t) => <CellLink to={paths.trip(t.id)}>{t.code}</CellLink> },
    { key: 'status', label: 'Trạng thái', render: (t) => <StatusBadge meta={TRIP_STATUS} status={t.status} /> },
    { key: 'veh', label: 'Xe', render: (t) => t.vehicle?.plate ?? (t.isExternal ? 'Xe ngoài' : <span className="text-warning">Chưa gán</span>) },
    { key: 'drv', label: 'Tài xế', render: (t) => (t.driver ? `${t.driver.name} · ${t.driver.phone}` : t.isExternal ? '—' : <span className="text-warning">Chưa gán</span>) },
    { key: 'time', label: 'Dự kiến', render: (t) => `${formatDateTime(t.plannedStartAt)}${t.plannedEndAt ? ` → ${formatDateTime(t.plannedEndAt)}` : ''}` },
    { key: 'stops', label: 'Điểm', align: 'center', render: (t) => t.stopCount },
    { key: 'bonus', label: 'Thưởng TX', money: true, render: (t) => <MoneyCell value={t.driverBonusAmount} tone={t.driverBonusAmount ? 'default' : 'muted'} /> },
    { key: 'warn', label: '', width: 40, render: (t) => (t.hasWarning || t.openIncidentCount ? <AlertTriangle className="size-4 text-warning" aria-label="Có cảnh báo/sự cố" /> : null) },
  ];
  return (
    <div className="flex flex-col gap-4">
      {unassigned.length && o.status !== 'CANCELLED' ? (
        <Banner tone="warning" message={`${unassigned.length} điểm chưa có chuyến phụ trách: ${unassigned.map((s) => s.sequence).join(', ')}`} action={hasPermission('trip.create') ? <Button size="sm" onClick={() => navigate(paths.orderTripNew(o.id))}>Tạo chuyến</Button> : undefined} />
      ) : null}
      <Panel
        title="Chuyến của đơn"
        actions={
          hasPermission('trip.create') && o.status !== 'CANCELLED' ? (
            <Button size="sm" onClick={() => navigate(paths.orderTripNew(o.id))}>
              <Plus /> Tạo chuyến
            </Button>
          ) : null
        }
      >
        <DataTable columns={cols} rows={o.trips ?? []} rowKey={(t) => t.id} compact onRowClick={(t) => navigate(paths.trip(t.id))} empty={<EmptyState compact message="Chưa có chuyến" description="Đơn 1 xe: tạo 1 chuyến gán tất cả điểm. Đơn nhiều xe: tạo nhiều chuyến, mỗi chuyến phụ trách một số điểm." />} />
      </Panel>
    </div>
  );
}

// ---------------- WM-ORD-07: Tài chính đơn ----------------

function FinanceTab({ o, paymentUrl, expenseUrl, onEditPrice }: { o: Order; paymentUrl: string; expenseUrl: string; onEditPrice: () => void }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const f = o.financeSummary;
  if (!f) return <EmptyState message="Chưa có số liệu tài chính" />;
  const allocCols: DataTableColumn<Allocation>[] = [
    { key: 'code', label: 'Phiếu thu', render: (a) => <CellLink to={paths.payment(a.paymentId)}>{a.paymentCode}</CellLink> },
    { key: 'at', label: 'Ngày thu', render: (a) => formatDate(a.receivedAt) },
    { key: 'amt', label: 'Số phân bổ', money: true, render: (a) => <MoneyCell value={a.amount} /> },
  ];
  const expCols: DataTableColumn<Expense>[] = [
    { key: 'code', label: 'Phiếu chi', render: (e) => <CellLink to={paths.expense(e.id)}>{e.code}</CellLink> },
    { key: 'kind', label: 'Loại', render: (e) => <span className="flex flex-col"><span>{e.categoryName ?? labelOf(EXPENSE_KIND, e.kind)}</span>{!e.isCost ? <span className="text-caption text-info">Dòng tiền, không tính lãi/lỗ</span> : null}</span> },
    { key: 'trip', label: 'Chuyến', render: (e) => e.tripCode ?? '—' },
    { key: 'by', label: 'Ai chi', hideBelow: 'lg', render: (e) => labelOf(EXPENSE_PAID_BY, e.paidBy) },
    { key: 'sup', label: 'NCC', hideBelow: 'lg', render: (e) => e.supplierName ?? '—' },
    { key: 'amt', label: 'Số tiền', money: true, render: (e) => <MoneyCell value={e.amount} tone={e.status === 'CANCELLED' ? 'muted' : 'default'} /> },
    { key: 'st', label: '', render: (e) => (e.status === 'CANCELLED' ? <StatusBadge label="Đã hủy" tone="danger" outline /> : null) },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="1 · Doanh thu (giá cước + add-on)"
        actions={
          hasPermission('order.update') && o.status !== 'CANCELLED' ? (
            <Button size="sm" variant="secondary" onClick={onEditPrice}>
              <Pencil /> Sửa giá
            </Button>
          ) : null
        }
      >
        <DescriptionList
          columns={2}
          items={[
            { label: 'Giá cước', value: <MoneyCell value={f.freight} /> },
            { label: 'Add-on', value: <MoneyCell value={f.addonTotal} /> },
            { label: 'Tổng thu khách', value: <MoneyCell value={f.totalAmount} strong /> },
            { label: 'Phải thu (đã xác nhận)', value: <MoneyCell value={f.receivable} /> },
          ]}
        />
        {(o.addons ?? []).length ? (
          <ul className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-body-sm">
            {(o.addons ?? []).map((a) => (
              <li key={a.id} className="flex justify-between">
                <span>{a.name}</span>
                <MoneyCell value={a.amount} />
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-caption text-text-muted">Doanh thu lấy từ đơn — không lấy từ phiếu thu. Đơn nháp/chờ xác nhận chưa phát sinh phải thu; đơn hủy doanh thu = 0.</p>
      </Panel>
      <Panel
        title="2 · Dòng tiền đã phân bổ"
        actions={
          <>
            {hasPermission('payment.allocate') ? (
              <Button size="sm" variant="secondary" onClick={() => navigate(`${PATHS.payments}?customerId=${o.customer.id}&hasUnallocated=1`)}>
                Phân bổ phiếu thu có sẵn
              </Button>
            ) : null}
            {hasPermission('payment.create') && o.status !== 'CANCELLED' ? (
              <Button size="sm" onClick={() => navigate(paymentUrl)}>
                <Banknote /> Ghi nhận thanh toán
              </Button>
            ) : null}
          </>
        }
      >
        <SummaryStrip
          items={[
            { label: 'Đã thu', value: formatVnd(f.paidAmount), tone: 'success' },
            { label: 'Còn nợ', value: formatVnd(f.remainingAmount), tone: f.remainingAmount > 0 ? (f.overdueDays > 0 ? 'danger' : 'warning') : undefined },
            { label: 'Hạn', value: <DueIndicator dueDate={o.dueDate} overdueDays={f.overdueDays} paid={f.remainingAmount <= 0 && f.paidAmount > 0} /> },
          ]}
        />
        <DataTable columns={allocCols} rows={f.allocations} rowKey={(a) => a.id} compact className="mt-3" empty={<EmptyState compact message="Chưa phân bổ tiền vào đơn" />} />
      </Panel>
      <Panel
        title="3 · Chi phí (chuyến + đơn, gồm thuê xe ngoài)"
        actions={
          hasPermission('expense.create') ? (
            <Button size="sm" onClick={() => navigate(expenseUrl)}>
              <Receipt /> Thêm chi phí
            </Button>
          ) : null
        }
        className="lg:col-span-2"
      >
        <DataTable
          columns={expCols}
          rows={f.expenses}
          rowKey={(e) => e.id}
          compact
          onRowClick={(e) => navigate(paths.expense(e.id))}
          totalRow={{ code: 'Tổng chi phí tính lãi/lỗ', amt: <MoneyCell value={f.expenseTotal} strong /> }}
          empty={<EmptyState compact message="Chưa có chi phí" />}
        />
      </Panel>
      <Panel title={`4 · Lãi/lỗ ${f.provisional ? '(tạm tính — đơn chưa hoàn thành)' : ''}`} className="lg:col-span-2">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Metric label="Doanh thu" value={f.receivable} />
          <Metric label="Chi phí chuyến" value={f.tripCost} />
          <Metric label="Thuê xe ngoài" value={f.outsourcedCost} />
          <Metric label="Chi phí khác" value={f.otherCost} />
          <Metric label="Lãi/lỗ" value={f.profit} tone={f.profit < 0 ? 'danger' : 'success'} sub={f.margin != null ? `Biên ${f.margin}%` : undefined} />
        </div>
        <p className="mt-3 text-caption text-text-muted">
          Lãi/lỗ = (giá cước + add-on) − (chi phí các chuyến + chi phí gắn đơn). Thưởng tài xế ({formatVnd(f.driverBonusTotal)}) tính vào bảng lương, không trừ ở đây. Tiền tài xế nộp COD là thu hồi, không phải doanh thu.
        </p>
      </Panel>
    </div>
  );
}

function Metric({ label, value, tone, sub }: { label: string; value: number; tone?: 'danger' | 'success'; sub?: string }) {
  return (
    <div className="rounded-md bg-surface-muted p-3">
      <div className="text-caption text-text-muted">{label}</div>
      <MoneyCell value={value} tone={tone} strong />
      {sub ? <div className="text-caption text-text-subtle">{sub}</div> : null}
    </div>
  );
}

function OrderAttachments({ orderId, canUpload }: { orderId: string; canUpload: boolean }) {
  const { data } = useQuery(OrderAttachmentsQuery, { variables: { orderId } });
  const related = (data?.orderAttachments ?? []).filter((a) => !(a.entityType === 'ORDER' && a.entityId === orderId));
  const ENTITY: Record<string, string> = { TRIP: 'Chuyến', ORDER_STOP: 'Điểm dừng', EXPENSE: 'Phiếu chi', INCIDENT: 'Sự cố' };
  return (
    <div className="flex flex-col gap-4">
      <AttachmentsPanel entityType="ORDER" entityId={orderId} category="WAREHOUSE_SLIP" canUpload={canUpload} emptyText="Chưa có chứng từ gắn đơn (phiếu xuất kho, hợp đồng…)" />
      <Panel title={`Chứng từ từ chuyến / điểm dừng / chi phí (${related.length})`}>
        <AttachmentList
          items={related.map((a) => ({ id: a.id, fileName: a.fileName, category: a.category, categoryLabel: `${ENTITY[a.entityType] ?? a.entityType} · ${a.category}`, mimeType: a.mimeType, size: a.size, url: a.url, thumbnailUrl: a.mimeType.startsWith('image/') ? a.url : null, uploadedByName: a.uploadedByName, capturedAt: a.capturedAt, createdAt: a.createdAt }))}
          onOpen={(a) => (a.url ? window.open(a.url, '_blank') : undefined)}
          emptyText="Chưa có POD/chứng từ từ tài xế hoặc phiếu chi"
        />
      </Panel>
    </div>
  );
}
