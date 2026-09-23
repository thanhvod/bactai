import * as React from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { Save } from 'lucide-react';
import {
  Banner,
  Breadcrumb,
  Button,
  Checkbox,
  DateField,
  DetailSkeleton,
  ErrorState,
  FormField,
  FormSection,
  Input,
  MoneyInput,
  PageHeader,
  Select,
  SensitiveActionModal,
  StatusBadge,
  Switch,
  Textarea,
  toast,
} from '@bta/shadcn';
import { STOP_STATUS, STOP_TYPE, formatDateTime } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { useDebounced } from '@/features/master-data/helpers';
import { OverlapWarningPanel, errorCode, fromLocalInput, overlapWarningsFromError, toLocalInput, type OverlapWarning } from '@/features/orders/components/common';
import { OrderSettingsQuery } from '@/features/orders/graphql/orders';
import { CheckOverlapQuery, CreateTripMutation, ResourceOptionsQuery, TripDetailQuery, TripFormOrderQuery, UpdateTripMutation } from '../graphql/dispatch';
import { SupplierOptionsQuery } from '../graphql/suppliers';

/** WM-TRIP-02 — Tạo/sửa chuyến: điểm phụ trách, xe, tài xế, giờ, thưởng; cảnh báo trùng lịch mềm (override cần quyền + lý do). */
export default function TripFormPage() {
  return (
    <RequirePermission permission={['trip.create', 'trip.assign']}>
      <TripForm />
    </RequirePermission>
  );
}

function TripForm() {
  const { orderId: orderParam, tripId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEdit = !!tripId;
  const { data: tripData, loading: tripLoading, error: tripError } = useQuery(TripDetailQuery, { variables: { id: tripId ?? '' }, skip: !isEdit });
  const orderId = orderParam ?? tripData?.trip.orderId ?? '';
  const { data: orderData, loading: orderLoading, error: orderError, refetch } = useQuery(TripFormOrderQuery, { variables: { id: orderId }, skip: !orderId });
  const { data: resources } = useQuery(ResourceOptionsQuery);
  const { data: settings } = useQuery(OrderSettingsQuery);
  const { data: suppliers } = useQuery(SupplierOptionsQuery);
  const [checkOverlap, { data: overlap, loading: checking }] = useLazyQuery(CheckOverlapQuery, { fetchPolicy: 'network-only' });
  const [createTrip, { loading: creating }] = useMutation(CreateTripMutation);
  const [updateTrip, { loading: updating }] = useMutation(UpdateTripMutation);

  const [stopIds, setStopIds] = React.useState<string[] | null>(null);
  const [vehicleId, setVehicleId] = React.useState('');
  const [driverId, setDriverId] = React.useState('');
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  const [bonus, setBonus] = React.useState<number | null>(null);
  const [note, setNote] = React.useState('');
  const [external, setExternal] = React.useState(false);
  const [ext, setExt] = React.useState({ supplierId: '', vehiclePlate: '', driverName: '', driverPhone: '', agreedAmount: null as number | null, note: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverWarnings, setServerWarnings] = React.useState<OverlapWarning[] | null>(null);
  const [overrideOpen, setOverrideOpen] = React.useState(false);
  const [reasonOpen, setReasonOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  const order = orderData?.order;
  const trip = tripData?.trip;

  React.useEffect(() => {
    if (hydrated) return;
    if (isEdit && trip) {
      setStopIds((trip.stops ?? []).map((s) => s.id));
      setVehicleId(trip.vehicle?.id ?? '');
      setDriverId(trip.driver?.id ?? '');
      setStart(toLocalInput(trip.plannedStartAt));
      setEnd(toLocalInput(trip.plannedEndAt));
      setBonus(trip.driverBonusAmount);
      setNote(trip.note ?? '');
      setExternal(trip.isExternal);
      if (trip.externalTransport)
        setExt({
          supplierId: trip.externalTransport.supplierId ?? '', vehiclePlate: trip.externalTransport.vehiclePlate ?? '', driverName: trip.externalTransport.driverName ?? '',
          driverPhone: trip.externalTransport.driverPhone ?? '', agreedAmount: trip.externalTransport.agreedAmount ?? null, note: trip.externalTransport.note ?? '',
        });
      setHydrated(true);
    } else if (!isEdit && order) {
      // Đơn 1 xe: mặc định gán tất cả điểm chưa có chuyến; giờ xuất phát = giờ dự kiến điểm lấy đầu.
      const free = (order.stops ?? []).filter((s) => !s.tripIds.length && s.status !== 'SKIPPED');
      const firstPickup = (order.stops ?? []).find((s) => s.type === 'PICKUP');
      setStopIds((free.length ? free : order.stops ?? []).map((s) => s.id));
      if (firstPickup?.plannedAt) setStart(toLocalInput(firstPickup.plannedAt));
      setHydrated(true);
    }
  }, [isEdit, trip, order, hydrated]);

  const key = useDebounced(`${vehicleId}|${driverId}|${start}|${end}`, 400);
  React.useEffect(() => {
    if (!start || (!vehicleId && !driverId) || external) return;
    const s = fromLocalInput(start);
    if (!s) return;
    setServerWarnings(null);
    void checkOverlap({ variables: { input: { tripId: tripId ?? null, vehicleId: vehicleId || null, driverId: driverId || null, plannedStartAt: s, plannedEndAt: fromLocalInput(end) } } });
  }, [key, external]); // eslint-disable-line react-hooks/exhaustive-deps
  const warnings: OverlapWarning[] = serverWarnings ?? (external ? [] : overlap?.checkTripOverlap ?? []);

  if (tripError || orderError) return <ErrorState error={tripError ?? orderError} onRetry={() => void refetch()} />;
  if ((isEdit && tripLoading && !trip) || (orderLoading && !order)) return <DetailSkeleton />;
  if (!order) return <ErrorState title="Không tìm thấy đơn" error={new Error('Đơn không tồn tại hoặc thuộc nhà xe khác.')} />;
  if (order.status === 'CANCELLED') return <Banner tone="danger" message={`Đơn ${order.code} đã hủy — không tạo chuyến được.`} />;

  const stops = order.stops ?? [];
  const selectedVehicle = resources?.vehicleOptions.find((v) => v.id === vehicleId);
  const canOverride = hasPermission('dispatch.override_warning');
  const saving = creating || updating;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!start) e.start = 'Nhập giờ xuất phát dự kiến';
    if (start && end && new Date(end) <= new Date(start)) e.end = 'Giờ kết thúc phải sau giờ bắt đầu';
    if (!external) {
      if (!vehicleId) e.vehicleId = 'Chọn xe';
      if (!driverId) e.driverId = 'Chọn tài xế';
    }
    if (!(stopIds ?? []).length) e.stops = 'Chọn ít nhất 1 điểm phụ trách';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (extra: { overrideReason?: string; reason?: string } = {}) => {
    if (!validate()) return;
    const common = {
      vehicleId: external ? null : vehicleId || null,
      driverId: external ? null : driverId || null,
      plannedStartAt: fromLocalInput(start)!,
      plannedEndAt: fromLocalInput(end),
      driverBonusAmount: external ? 0 : bonus ?? 0,
      note: note || null,
      stopIds: stopIds ?? [],
      isExternal: external,
      externalTransport: external ? { supplierId: ext.supplierId || null, vehiclePlate: ext.vehiclePlate || null, driverName: ext.driverName || null, driverPhone: ext.driverPhone || null, agreedAmount: ext.agreedAmount, note: ext.note || null } : null,
      overrideReason: extra.overrideReason ?? null,
    };
    try {
      if (isEdit && trip) {
        const r = await updateTrip({ variables: { id: trip.id, input: common, reason: extra.reason ?? null } });
        toast.success(`Đã lưu chuyến ${r.data?.updateTrip.trip.code}`);
        for (const n of r.data?.updateTrip.notices ?? []) toast.warning(n);
        navigate(paths.trip(trip.id));
      } else {
        const r = await createTrip({ variables: { input: { ...common, orderId: order.id } } });
        const t = r.data!.createTrip;
        toast.success(`Đã tạo chuyến ${t.trip.code} — tài xế nhận thông báo trên app`);
        for (const n of t.notices) toast.warning(n);
        navigate(paths.trip(t.trip.id));
      }
    } catch (e) {
      const w = overlapWarningsFromError(e);
      if (w) {
        setServerWarnings(w);
        toast.warning('Chuyến trùng/gần trùng lịch', 'Đổi xe/tài xế/giờ hoặc tiếp tục kèm lý do (cần quyền).');
        return;
      }
      if (errorCode(e) === 'SENSITIVE_REASON_REQUIRED') {
        setReasonOpen(true);
        return;
      }
      toast.error('Không lưu được chuyến', apolloErrorMessage(e));
    }
  };

  const toggleStop = (id: string) => setStopIds((cur) => ((cur ?? []).includes(id) ? (cur ?? []).filter((x) => x !== id) : [...(cur ?? []), id]));

  return (
    <div className="flex flex-col gap-4 pb-24">
      <Breadcrumb
        items={[
          { label: 'Đơn hàng', to: PATHS.orders },
          { label: order.code, to: paths.order(order.id) },
          ...(trip ? [{ label: trip.code, to: paths.trip(trip.id) }] : []),
          { label: isEdit ? 'Sửa chuyến' : 'Tạo chuyến' },
        ]}
      />
      <PageHeader title={isEdit ? `Sửa chuyến ${trip?.code ?? ''}` : `Tạo chuyến cho đơn ${order.code}`} subtitle={`${order.customer.name} · ${order.routeSummary ?? ''}`} />
      {trip?.status === 'COMPLETED' ? <Banner tone="warning" message="Chuyến đã hoàn thành: sửa cần quyền 'Sửa đơn đã hoàn thành' và lý do." /> : null}

      <FormSection title="Điểm phụ trách" description="Đơn 1 xe: gán tất cả điểm. Đơn nhiều xe: chọn điểm cho chuyến này; điểm đã có chuyến khác hiện mã chuyến (vẫn chọn được, vd. cùng điểm lấy).">
        {errors.stops ? <p className="text-body-sm text-danger">{errors.stops}</p> : null}
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {stops.map((s) => {
            const others = s.tripIds.map((id, i) => ({ id, code: s.tripCodes[i] })).filter((t) => t.id !== tripId);
            return (
              <li key={s.id} className="flex items-start gap-3 px-3 py-2">
                <Checkbox id={`stop-${s.id}`} checked={(stopIds ?? []).includes(s.id)} onCheckedChange={() => toggleStop(s.id)} className="mt-1" />
                <label htmlFor={`stop-${s.id}`} className="flex min-w-0 flex-1 cursor-pointer flex-col">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-body-sm">{s.sequence}.</span>
                    <StatusBadge meta={STOP_TYPE} status={s.type} outline />
                    <span className="font-medium">{s.locationName ?? s.address}</span>
                    {s.status !== 'NOT_ARRIVED' ? <StatusBadge meta={STOP_STATUS} status={s.status} /> : null}
                    {others.length ? <span className="text-caption text-warning">Đã có chuyến {others.map((t) => t.code).join(', ')}</span> : null}
                  </span>
                  <span className="text-body-sm text-text-muted">
                    {s.address}
                    {s.plannedAt ? ` · DK ${formatDateTime(s.plannedAt)}` : ''}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </FormSection>

      <FormSection title="Xe & tài xế" description="Tài xế không cố định xe — gán theo từng chuyến. Giao là nhận: tài xế thấy chuyến ngay trên app.">
        <Switch checked={external} onCheckedChange={setExternal} label="Thuê xe ngoài / chành (không dùng xe nhà)" />
        {!external ? (
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Xe" required error={errors.vehicleId} hint={selectedVehicle?.status === 'MAINTENANCE' ? 'Xe đang bảo dưỡng — hệ thống sẽ cảnh báo.' : undefined}>
              <Select
                value={vehicleId}
                onValueChange={setVehicleId}
                placeholder="Chọn xe"
                options={(resources?.vehicleOptions ?? []).map((v) => ({
                  value: v.id,
                  label: `${v.plate}${v.typeName ? ` · ${v.typeName}` : ''}${v.capacityTons ? ` · ${v.capacityTons} tấn` : ''}${v.status === 'MAINTENANCE' ? ' · bảo dưỡng' : v.status === 'INACTIVE' ? ' · ngừng sử dụng' : ''}${v.busy ? ` · đang chạy ${v.busyTripCode ?? ''}` : ''}`,
                  disabled: v.status === 'INACTIVE',
                }))}
              />
            </FormField>
            <FormField label="Tài xế" required error={errors.driverId}>
              <Select
                value={driverId}
                onValueChange={setDriverId}
                placeholder="Chọn tài xế"
                options={(resources?.driverOptions ?? []).map((d) => ({
                  value: d.id,
                  label: `${d.name} · ${d.phone}${d.status === 'INACTIVE' ? ' · ngừng hoạt động' : ''}${d.busy ? ` · đang chạy ${d.busyTripCode ?? ''}` : ''}`,
                  disabled: d.status === 'INACTIVE',
                }))}
              />
            </FormField>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="NCC / chành">
              <Select value={ext.supplierId} allowEmpty onValueChange={(v) => setExt({ ...ext, supplierId: v })} options={(suppliers?.supplierOptions ?? []).map((s) => ({ value: s.id, label: `${s.name}${s.typeName ? ` · ${s.typeName}` : ''}`, disabled: s.status === 'INACTIVE' }))} />
            </FormField>
            <FormField label="Biển số xe ngoài">
              <Input value={ext.vehiclePlate} onChange={(e) => setExt({ ...ext, vehiclePlate: e.target.value })} />
            </FormField>
            <FormField label="Giá thuê thỏa thuận" hint="Tiền thuê thực tế ghi bằng phiếu chi gắn đơn">
              <MoneyInput value={ext.agreedAmount} onChange={(v) => setExt({ ...ext, agreedAmount: v })} />
            </FormField>
            <FormField label="Tài xế ngoài">
              <Input value={ext.driverName} onChange={(e) => setExt({ ...ext, driverName: e.target.value })} />
            </FormField>
            <FormField label="SĐT tài xế ngoài">
              <Input value={ext.driverPhone} onChange={(e) => setExt({ ...ext, driverPhone: e.target.value })} />
            </FormField>
            <FormField label="Ghi chú liên hệ">
              <Input value={ext.note} onChange={(e) => setExt({ ...ext, note: e.target.value })} />
            </FormField>
          </div>
        )}
      </FormSection>

      <FormSection title="Thời gian & thưởng">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Xuất phát dự kiến" required error={errors.start}>
            <DateField mode="datetime" value={start} onChange={setStart} />
          </FormField>
          <FormField label="Kết thúc dự kiến" error={errors.end} hint={`Để trống: tính ${settings?.merchantSettings.defaultTripHours ?? 8} giờ khi kiểm tra trùng lịch`}>
            <DateField mode="datetime" value={end} onChange={setEnd} />
          </FormField>
          {!external ? (
            <FormField label="Thưởng tài xế" hint="Operation điền tay — cộng vào bảng lương kỳ">
              <MoneyInput value={bonus} onChange={setBonus} placeholder="0" />
            </FormField>
          ) : null}
        </div>
        <OverlapWarningPanel warnings={warnings} checking={checking} canOverride={canOverride} onOverride={serverWarnings ? () => setOverrideOpen(true) : undefined} />
        {!serverWarnings && warnings.length ? (
          <p className="text-caption text-text-muted">Cảnh báo mềm (ngưỡng gần trùng {settings?.merchantSettings.nearOverlapMinutes ?? 120} phút). Khi lưu, hệ thống yêu cầu xác nhận lý do nếu vẫn giữ lịch này.</p>
        ) : null}
        <FormField label="Ghi chú chuyến">
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </FormSection>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-6 py-3 backdrop-blur lg:pl-[284px]">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate(trip ? paths.trip(trip.id) : paths.order(order.id))}>
            Hủy
          </Button>
          <Button loading={saving} disabled={!!serverWarnings && !canOverride} onClick={() => (serverWarnings ? setOverrideOpen(true) : void submit())}>
            <Save /> {isEdit ? 'Lưu chuyến' : 'Tạo chuyến'}
          </Button>
        </div>
      </div>

      <SensitiveActionModal
        open={overrideOpen}
        onOpenChange={setOverrideOpen}
        action="Bỏ qua cảnh báo trùng lịch"
        description="WM-DISPATCH-03: lịch xe/tài xế bị trùng hoặc quá sát. Vẫn lưu nếu bạn chịu trách nhiệm điều phối."
        affected={warnings.map((w) => `${w.subject === 'VEHICLE' ? 'Xe' : 'Tài xế'} ${w.subjectLabel ?? ''} ↔ ${w.conflictTripCode ?? ''} (${w.type === 'OVERLAP' ? 'trùng' : `cách ${w.gapMinutes} phút`})`)}
        warning="Lý do và người bỏ qua được ghi audit; người có quyền điều phối nhận thông báo."
        confirmLabel="Lưu và bỏ qua cảnh báo"
        loading={saving}
        onConfirm={async (reason) => {
          setOverrideOpen(false);
          await submit({ overrideReason: reason });
        }}
      />
      <SensitiveActionModal
        open={reasonOpen}
        onOpenChange={setReasonOpen}
        action={`Sửa chuyến đã hoàn thành ${trip?.code ?? ''}`}
        confirmLabel="Lưu"
        loading={saving}
        onConfirm={async (reason) => {
          setReasonOpen(false);
          await submit({ reason });
        }}
      />
    </div>
  );
}
