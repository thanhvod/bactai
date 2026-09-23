import * as React from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { MapPin, Save, Truck } from 'lucide-react';
import {
  Banner,
  Breadcrumb,
  Button,
  DateField,
  DetailSkeleton,
  EntityPicker,
  ErrorState,
  FormField,
  FormSection,
  Input,
  LineItemsEditor,
  MoneyCell,
  MoneyInput,
  PageHeader,
  Select,
  SensitiveActionModal,
  Switch,
  Textarea,
  WarningPanel,
  toast,
  type PickerItem,
} from '@bta/shadcn';
import { CARGO_PROPERTY, STOP_TYPE, createOrderSchema, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { useDebounced } from '@/features/master-data/helpers';
import { CheckOverlapQuery, ResourceOptionsQuery } from '@/features/dispatch/graphql/dispatch';
import {
  BookingDetailQuery,
  CreateOrderMutation,
  CreditCheckQuery,
  CustomerLocationsPickQuery,
  CustomerPickQuery,
  OrderDetailQuery,
  OrderSettingsQuery,
  UpdateOrderMutation,
} from '../graphql/orders';
import {
  OverlapWarningPanel,
  addDaysIso,
  errorCode,
  fromLocalInput,
  overlapWarningsFromError,
  toLocalInput,
  todayIso,
  type OverlapWarning,
} from '../components/common';

interface StopRow {
  key: string;
  id?: string;
  type: 'PICKUP' | 'DROPOFF';
  locationId: string | null;
  locationName: string;
  address: string;
  contactName: string;
  contactPhone: string;
  plannedAt: string;
  codExpected: number | null;
  note: string;
}
interface CargoRow {
  key: string;
  id?: string;
  name: string;
  cargoTypeId: string;
  weightKg: string;
  quantity: string;
  packagingUnit: string;
  properties: string[];
  note: string;
}
interface AddonRow {
  key: string;
  id?: string;
  serviceId: string;
  name: string;
  amount: number | null;
}

let seq = 0;
const k = () => `r${++seq}`;
const emptyStop = (type: StopRow['type']): StopRow => ({ key: k(), type, locationId: null, locationName: '', address: '', contactName: '', contactPhone: '', plannedAt: '', codExpected: null, note: '' });
const emptyCargo = (): CargoRow => ({ key: k(), name: '', cargoTypeId: '', weightKg: '', quantity: '', packagingUnit: '', properties: [], note: '' });
const numOrNull = (v: string) => (v.trim() === '' || Number.isNaN(Number(v)) ? null : Number(v));

/** WM-ORD-03 — Tạo/sửa đơn (không wizard): khách → điểm lấy/trả → hàng → giá/add-on → hạn thanh toán → (tùy chọn) tạo chuyến ngay. */
export default function OrderFormPage() {
  const { orderId } = useParams();
  return (
    <RequirePermission permission={orderId ? 'order.update' : 'order.create'}>
      <OrderForm orderId={orderId ?? null} />
    </RequirePermission>
  );
}

function OrderForm({ orderId }: { orderId: string | null }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { hasPermission } = useAuth();
  const isEdit = !!orderId;
  const bookingId = params.get('bookingId');

  const { data: existing, loading: loadingExisting, error: existingError, refetch } = useQuery(OrderDetailQuery, { variables: { id: orderId ?? '' }, skip: !isEdit });
  const { data: booking } = useQuery(BookingDetailQuery, { variables: { id: bookingId ?? '' }, skip: !bookingId || isEdit });
  const { data: settings } = useQuery(OrderSettingsQuery);
  const { data: addonCatalog } = useQuery(CatalogOptionsQuery, { variables: { type: 'ADDON_SERVICE' as never, activeOnly: true } });
  const { data: cargoCatalog } = useQuery(CatalogOptionsQuery, { variables: { type: 'CARGO_TYPE' as never, activeOnly: true } });

  const [customerId, setCustomerId] = React.useState<string | null>(params.get('customerId'));
  const [customerLabel, setCustomerLabel] = React.useState<PickerItem | null>(null);
  const [customerSearch, setCustomerSearch] = React.useState('');
  const debouncedSearch = useDebounced(customerSearch);
  const { data: customers, loading: loadingCustomers } = useQuery(CustomerPickQuery, { variables: { search: debouncedSearch || null } });
  const { data: locations } = useQuery(CustomerLocationsPickQuery, { variables: { customerId: customerId ?? '' }, skip: !customerId });

  const [orderDate, setOrderDate] = React.useState(todayIso());
  const [dueDate, setDueDate] = React.useState<string>('');
  const [dueTouched, setDueTouched] = React.useState(false);
  const [stops, setStops] = React.useState<StopRow[]>([emptyStop('PICKUP'), emptyStop('DROPOFF')]);
  const [cargo, setCargo] = React.useState<CargoRow[]>([emptyCargo()]);
  const [freight, setFreight] = React.useState<number | null>(null);
  const [addons, setAddons] = React.useState<AddonRow[]>([]);
  const [note, setNote] = React.useState('');
  const [internalNote, setInternalNote] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [hydrated, setHydrated] = React.useState(!isEdit && !bookingId);

  // Chuyến nhanh (đơn 1 xe) — chỉ khi tạo mới
  const [withTrip, setWithTrip] = React.useState(false);
  const [vehicleId, setVehicleId] = React.useState('');
  const [driverId, setDriverId] = React.useState('');
  const [tripStart, setTripStart] = React.useState('');
  const [tripEnd, setTripEnd] = React.useState('');
  const [bonus, setBonus] = React.useState<number | null>(null);
  const { data: resources } = useQuery(ResourceOptionsQuery, { skip: isEdit });
  const [checkOverlap, { data: overlapData, loading: checking }] = useLazyQuery(CheckOverlapQuery, { fetchPolicy: 'network-only' });
  const [serverWarnings, setServerWarnings] = React.useState<OverlapWarning[] | null>(null);
  const [overrideOpen, setOverrideOpen] = React.useState(false);
  const [reasonOpen, setReasonOpen] = React.useState<null | { submitStatus: string; goTrip: boolean }>(null);

  const [createOrder, { loading: creating }] = useMutation(CreateOrderMutation);
  const [updateOrder, { loading: updating }] = useMutation(UpdateOrderMutation);

  // Hydrate từ đơn hiện có
  React.useEffect(() => {
    const o = existing?.order;
    if (!o || hydrated) return;
    setCustomerId(o.customer.id);
    setCustomerLabel({ id: o.customer.id, label: o.customer.name, code: o.customer.code });
    setOrderDate(String(o.orderDate).slice(0, 10));
    setDueDate(o.dueDate ? String(o.dueDate).slice(0, 10) : '');
    setDueTouched(true);
    setStops(
      (o.stops ?? []).map((s) => ({
        key: k(), id: s.id, type: s.type as StopRow['type'], locationId: s.locationId ?? null, locationName: s.locationName ?? '', address: s.address,
        contactName: s.contactName ?? '', contactPhone: s.contactPhone ?? '', plannedAt: toLocalInput(s.plannedAt), codExpected: s.codExpected ?? null, note: s.note ?? '',
      })),
    );
    setCargo(
      (o.cargoLines ?? []).map((c) => ({
        key: k(), id: c.id, name: c.name, cargoTypeId: c.cargoTypeId ?? '', weightKg: c.weightKg != null ? String(c.weightKg) : '', quantity: c.quantity != null ? String(c.quantity) : '',
        packagingUnit: c.packagingUnit ?? '', properties: c.properties ?? [], note: c.note ?? '',
      })),
    );
    setFreight(o.freightAmount);
    setAddons((o.addons ?? []).map((a) => ({ key: k(), id: a.id, serviceId: a.serviceId ?? '', name: a.name, amount: a.amount })));
    setNote(o.note ?? '');
    setInternalNote(o.internalNote ?? '');
    setHydrated(true);
  }, [existing, hydrated]);

  // Prefill từ booking khách gửi
  React.useEffect(() => {
    const b = booking?.booking;
    if (!b || hydrated) return;
    if (b.customerId) {
      setCustomerId(b.customerId);
      setCustomerLabel({ id: b.customerId, label: b.customerName ?? 'Khách từ booking' });
    }
    setStops(
      b.stops.map((s) => ({
        ...emptyStop(s.type as StopRow['type']),
        locationName: s.locationName ?? '', address: s.address, contactName: s.contactName ?? b.contactName, contactPhone: s.contactPhone ?? b.contactPhone, note: s.note ?? '',
        plannedAt: s.type === 'PICKUP' ? toLocalInput(b.pickupFrom) : toLocalInput(b.deliverBefore),
      })),
    );
    setCargo([
      {
        ...emptyCargo(), name: b.cargoName, weightKg: b.weightTon != null ? String(b.weightTon * 1000) : '', quantity: b.packages != null ? String(b.packages) : '',
        properties: b.fragile ? ['FRAGILE'] : [],
      },
    ]);
    setNote([b.note, b.vehicleTypeHint ? `Yêu cầu xe: ${b.vehicleTypeHint}` : null, b.flexibility ? `Linh hoạt: ${b.flexibility}` : null].filter(Boolean).join('\n'));
    setHydrated(true);
  }, [booking, hydrated]);

  // Gợi ý hạn thanh toán = ngày đơn + số ngày công nợ mặc định (khách → merchant)
  const selectedCustomer = customers?.customers.nodes.find((c) => c.id === customerId);
  const debtDays = selectedCustomer?.defaultDebtDays ?? settings?.merchantSettings.defaultDebtDays ?? null;
  const suggestedDue = debtDays != null && orderDate ? addDaysIso(orderDate, debtDays) : '';
  React.useEffect(() => {
    if (!dueTouched && suggestedDue) setDueDate(suggestedDue);
  }, [suggestedDue, dueTouched]);

  const addonTotal = addons.reduce((s, a) => s + (a.amount ?? 0), 0);
  const total = (freight ?? 0) + addonTotal;
  const additional = isEdit ? Math.max(total - (existing?.order.totalAmount ?? 0), 0) : total;
  const { data: credit } = useQuery(CreditCheckQuery, { variables: { customerId: customerId ?? '', additionalAmount: additional }, skip: !customerId });

  // Kiểm tra trùng lịch realtime cho chuyến nhanh (debounce 400ms)
  const overlapKey = useDebounced(`${vehicleId}|${driverId}|${tripStart}|${tripEnd}`, 400);
  React.useEffect(() => {
    if (!withTrip || !tripStart || (!vehicleId && !driverId)) return;
    const start = fromLocalInput(tripStart);
    if (!start) return;
    void checkOverlap({ variables: { input: { vehicleId: vehicleId || null, driverId: driverId || null, plannedStartAt: start, plannedEndAt: fromLocalInput(tripEnd) } } });
  }, [overlapKey, withTrip]); // eslint-disable-line react-hooks/exhaustive-deps
  const liveWarnings: OverlapWarning[] = serverWarnings ?? ((withTrip ? overlapData?.checkTripOverlap : null) ?? []);

  const pickupDefaults = (locations?.customerLocations ?? []).filter((l) => l.usage !== 'DROPOFF' && l.usage !== 'DOCUMENTS');
  const dropDefaults = (locations?.customerLocations ?? []).filter((l) => l.usage !== 'PICKUP' && l.usage !== 'DOCUMENTS');
  // Khách mới chọn + điểm trống → tự điền địa chỉ mặc định
  React.useEffect(() => {
    if (!locations || isEdit) return;
    setStops((rows) =>
      rows.map((r) => {
        if (r.address) return r;
        const pool = r.type === 'PICKUP' ? pickupDefaults : dropDefaults;
        const l = pool.find((x) => x.isDefault) ?? (pool.length === 1 ? pool[0] : undefined);
        return l ? applyLocation(r, l) : r;
      }),
    );
  }, [locations]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isEdit && existingError) return <ErrorState error={existingError} onRetry={() => void refetch()} />;
  if (isEdit && loadingExisting && !existing) return <DetailSkeleton />;
  const order = existing?.order;
  if (order && (order.status === 'CANCELLED')) {
    return <Banner tone="danger" message={`Đơn ${order.code} đã hủy — không sửa được.`} action={<Button variant="secondary" onClick={() => navigate(paths.order(order.id))}>Quay lại đơn</Button>} />;
  }

  function buildInput() {
    return {
      customerId: customerId ?? '',
      orderDate,
      freightAmount: freight ?? 0,
      dueDate: dueDate || null,
      note: note || null,
      internalNote: internalNote || null,
      stops: stops.map((s, i) => ({
        ...(s.id ? { id: s.id } : {}),
        type: s.type,
        sequence: i + 1,
        locationId: s.locationId,
        locationName: s.locationName || null,
        address: s.address,
        contactName: s.contactName || null,
        contactPhone: s.contactPhone || null,
        plannedAt: fromLocalInput(s.plannedAt),
        codExpected: s.codExpected,
        note: s.note || null,
      })),
      cargoLines: cargo
        .filter((c) => c.name.trim())
        .map((c) => ({
          ...(c.id ? { id: c.id } : {}),
          name: c.name.trim(),
          cargoTypeId: c.cargoTypeId || null,
          weightKg: numOrNull(c.weightKg),
          quantity: numOrNull(c.quantity),
          packagingUnit: c.packagingUnit || null,
          properties: c.properties,
          note: c.note || null,
        })),
      addons: addons.filter((a) => a.name.trim() && a.amount != null).map((a) => ({ ...(a.id ? { id: a.id } : {}), serviceId: a.serviceId || null, name: a.name.trim(), amount: a.amount ?? 0 })),
    };
  }

  function validate(): boolean {
    const input = buildInput();
    const e: Record<string, string> = {};
    const r = createOrderSchema.safeParse({ ...input, bookingId: undefined });
    if (!r.success) for (const i of r.error.issues) e[i.path.join('.')] ??= i.message;
    if (!customerId) e.customerId = 'Chọn khách hàng';
    if (!stops.some((s) => s.type === 'PICKUP')) e.stops = 'Cần ít nhất 1 điểm lấy';
    if (!stops.some((s) => s.type === 'DROPOFF')) e.stops = 'Cần ít nhất 1 điểm trả';
    if (freight == null) e.freightAmount = 'Nhập giá cước (có thể 0)';
    if (withTrip) {
      if (!vehicleId) e.vehicleId = 'Chọn xe';
      if (!driverId) e.driverId = 'Chọn tài xế';
      if (!tripStart) e.tripStart = 'Nhập giờ xuất phát dự kiến';
      if (tripStart && tripEnd && new Date(tripEnd) <= new Date(tripStart)) e.tripEnd = 'Giờ kết thúc phải sau giờ bắt đầu';
    }
    setErrors(e);
    if (Object.keys(e).length) toast.error('Kiểm tra lại thông tin đơn', Object.values(e)[0]);
    return !Object.keys(e).length;
  }

  async function submit(status: 'DRAFT' | 'CONFIRMED', goTrip: boolean, extra: { overrideReason?: string; reason?: string } = {}) {
    if (!validate()) return;
    const input = buildInput();
    try {
      if (isEdit && order) {
        const { customerId: cid, ...rest } = input;
        await updateOrder({ variables: { id: order.id, input: { ...rest, customerId: cid }, reason: extra.reason ?? null } });
        toast.success(`Đã lưu đơn ${order.code}`);
        navigate(goTrip ? paths.orderTripNew(order.id) : paths.order(order.id));
        return;
      }
      const createTrip =
        withTrip && status === 'CONFIRMED'
          ? {
              vehicleId: vehicleId || null,
              driverId: driverId || null,
              plannedStartAt: fromLocalInput(tripStart)!,
              plannedEndAt: fromLocalInput(tripEnd),
              driverBonusAmount: bonus ?? 0,
              overrideReason: extra.overrideReason ?? null,
            }
          : null;
      const r = await createOrder({ variables: { input: { ...input, status, bookingId: bookingId || null, createTrip } } });
      const res = r.data!.createOrder;
      toast.success(`Đã tạo đơn ${res.order.code}${res.trip ? ` và chuyến ${res.trip.code}` : ''}`);
      for (const w of res.warnings) toast.warning(w);
      if (goTrip && !res.trip) navigate(paths.orderTripNew(res.order.id));
      else navigate(paths.order(res.order.id));
    } catch (e) {
      const w = overlapWarningsFromError(e);
      if (w) {
        setServerWarnings(w);
        toast.warning('Chuyến bị trùng/gần trùng lịch', 'Xem cảnh báo, đổi xe/tài xế/giờ hoặc tiếp tục kèm lý do.');
        return;
      }
      if (errorCode(e) === 'SENSITIVE_REASON_REQUIRED') {
        setReasonOpen({ submitStatus: status, goTrip });
        return;
      }
      toast.error('Không lưu được đơn', apolloErrorMessage(e));
    }
  }

  const customerItems: PickerItem[] = [
    ...(customerLabel && !customers?.customers.nodes.some((c) => c.id === customerLabel.id) ? [customerLabel] : []),
    ...(customers?.customers.nodes ?? []).map((c) => ({
      id: c.id, label: c.name, code: c.code, inactive: c.status === 'INACTIVE',
      description: [c.phone, c.debtSummary.remaining ? `Còn nợ ${formatVnd(c.debtSummary.remaining)}` : null, c.debtSummary.overdueOrders ? `${c.debtSummary.overdueOrders} đơn quá hạn` : null].filter(Boolean).join(' · '),
    })),
  ];
  const addonOptions = (addonCatalog?.catalogItems ?? []).map((c) => ({ value: c.id, label: c.name }));
  const cargoTypeOptions = (cargoCatalog?.catalogItems ?? []).map((c) => ({ value: c.id, label: c.name }));
  const canOverride = hasPermission('dispatch.override_warning');
  const saving = creating || updating;
  const title = isEdit ? `Sửa đơn ${order?.code ?? ''}` : bookingId ? `Tạo đơn từ yêu cầu ${booking?.booking.code ?? ''}` : 'Tạo đơn hàng';

  return (
    <div className="flex flex-col gap-4 pb-24">
      <Breadcrumb items={[{ label: 'Đơn hàng', to: PATHS.orders }, ...(order ? [{ label: order.code, to: paths.order(order.id) }] : []), { label: isEdit ? 'Sửa' : 'Tạo mới' }]} />
      <PageHeader title={title} subtitle="Nhập nhanh đơn 1 xe: khách → điểm lấy/trả → hàng → giá cước → hạn thanh toán" />
      {order?.priceLocked ? <Banner tone="warning" message="Đơn đã xác nhận: sửa giá cước/add-on là thao tác nhạy cảm — cần quyền và lý do." /> : null}
      {order?.status === 'COMPLETED' ? <Banner tone="warning" message="Đơn đã hoàn thành: mọi chỉnh sửa cần quyền 'Sửa đơn đã hoàn thành' và lý do." /> : null}
      {booking?.booking ? (
        <Banner tone="info" message={`Đang tạo đơn từ yêu cầu ${booking.booking.code} của ${booking.booking.contactName} (${booking.booking.contactPhone}). Có thể điều chỉnh giá/điểm/hàng trước khi lưu.`} />
      ) : null}

      <FormSection title="Khách hàng" description="Chọn khách; hệ thống cảnh báo mềm khi vượt hạn mức hoặc có đơn quá hạn.">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Khách hàng" required error={errors.customerId} className="md:col-span-2">
            <EntityPicker
              items={customerItems}
              value={customerId}
              onChange={(id, item) => {
                setCustomerId(id);
                setCustomerLabel(item);
                setDueTouched(false);
              }}
              onSearch={setCustomerSearch}
              loading={loadingCustomers}
              placeholder="Tìm khách theo tên, mã, SĐT"
              disabled={isEdit && order?.status !== 'DRAFT' && order?.status !== 'PENDING_CONFIRMATION'}
            />
          </FormField>
          <FormField label="Ngày đơn" required>
            <DateField value={orderDate} onChange={setOrderDate} />
          </FormField>
        </div>
        {credit?.customerCreditCheck.warnings.length ? (
          <WarningPanel title="Cảnh báo công nợ khách (không chặn)" items={credit.customerCreditCheck.warnings} />
        ) : null}
      </FormSection>

      <FormSection title="Điểm lấy / trả" description="Kéo để sắp xếp thứ tự. Chọn nhanh từ sổ địa chỉ của khách; nội dung vẫn sửa riêng cho đơn này.">
        {errors.stops ? <p className="text-body-sm text-danger">{errors.stops}</p> : null}
        <LineItemsEditor<StopRow>
          rows={stops}
          onChange={setStops}
          sortable
          minRows={2}
          newRow={() => emptyStop('DROPOFF')}
          addLabel="Thêm điểm"
          removable={(r) => !r.id || stops.length > 2}
          columns={[
            {
              key: 'type',
              label: 'Loại',
              width: 120,
              render: (r, _i, update) => (
                <Select value={r.type} onValueChange={(v) => update({ type: v as StopRow['type'] })} options={Object.entries(STOP_TYPE).map(([value, m]) => ({ value, label: m.label }))} />
              ),
            },
            {
              key: 'location',
              label: 'Địa điểm',
              render: (r, i, update) => (
                <div className="flex min-w-[260px] flex-col gap-1.5">
                  {locations?.customerLocations.length ? (
                    <Select
                      value={r.locationId ?? ''}
                      allowEmpty
                      emptyLabel="— Nhập địa chỉ khác —"
                      placeholder="Chọn từ sổ địa chỉ"
                      onValueChange={(v) => {
                        const l = locations.customerLocations.find((x) => x.id === v);
                        update(l ? applyLocation(r, l) : { locationId: null });
                      }}
                      options={(r.type === 'PICKUP' ? pickupDefaults : dropDefaults).map((l) => ({ value: l.id, label: `${l.name} — ${l.address}` }))}
                    />
                  ) : null}
                  <Input value={r.locationName} placeholder="Tên điểm (kho, công trình…)" onChange={(e) => update({ locationName: e.target.value })} />
                  <Input
                    value={r.address}
                    placeholder="Địa chỉ *"
                    aria-invalid={!!errors[`stops.${i}.address`]}
                    onChange={(e) => update({ address: e.target.value })}
                  />
                  {errors[`stops.${i}.address`] ? <span className="text-caption text-danger">{errors[`stops.${i}.address`]}</span> : null}
                </div>
              ),
            },
            {
              key: 'contact',
              label: 'Liên hệ',
              render: (r, _i, update) => (
                <div className="flex min-w-[170px] flex-col gap-1.5">
                  <Input value={r.contactName} placeholder="Người liên hệ" onChange={(e) => update({ contactName: e.target.value })} />
                  <Input value={r.contactPhone} placeholder="SĐT" onChange={(e) => update({ contactPhone: e.target.value })} />
                </div>
              ),
            },
            { key: 'plannedAt', label: 'Giờ dự kiến', width: 190, render: (r, _i, update) => <DateField mode="datetime" value={r.plannedAt} onChange={(v) => update({ plannedAt: v })} /> },
            {
              key: 'cod',
              label: 'COD dự kiến',
              align: 'right',
              width: 150,
              render: (r, _i, update) => <MoneyInput value={r.codExpected} onChange={(v) => update({ codExpected: v })} placeholder="0" aria-label="COD dự kiến" />,
            },
          ]}
        />
        <p className="col-span-full text-caption text-text-muted">
          <MapPin className="mr-1 inline size-3" />
          COD (thu hộ) chỉ là số dự kiến để tài xế thu tại điểm; tiền tài xế nộp về là thu hồi, không phải doanh thu.
        </p>
      </FormSection>

      <FormSection title="Hàng hóa" description="Ghi chú là chính — chỉ bắt buộc tên hàng (vd. '10 tấn gạo').">
        <LineItemsEditor<CargoRow>
          rows={cargo}
          onChange={setCargo}
          newRow={emptyCargo}
          addLabel="Thêm dòng hàng"
          columns={[
            { key: 'name', label: 'Tên hàng', render: (r, _i, update) => <Input value={r.name} placeholder="Tên/mô tả hàng" onChange={(e) => update({ name: e.target.value })} className="min-w-[200px]" /> },
            { key: 'type', label: 'Loại hàng', width: 160, render: (r, _i, update) => <Select value={r.cargoTypeId} allowEmpty onValueChange={(v) => update({ cargoTypeId: v })} options={cargoTypeOptions} placeholder="Loại" /> },
            { key: 'weight', label: 'Khối lượng (kg)', width: 130, align: 'right', render: (r, _i, update) => <Input inputMode="decimal" value={r.weightKg} onChange={(e) => update({ weightKg: e.target.value })} className="text-right" /> },
            {
              key: 'qty',
              label: 'Số lượng',
              width: 180,
              render: (r, _i, update) => (
                <div className="flex gap-1.5">
                  <Input inputMode="decimal" value={r.quantity} onChange={(e) => update({ quantity: e.target.value })} className="w-20 text-right" aria-label="Số lượng" />
                  <Input value={r.packagingUnit} placeholder="kiện/bao…" onChange={(e) => update({ packagingUnit: e.target.value })} aria-label="Đơn vị" />
                </div>
              ),
            },
            {
              key: 'props',
              label: 'Tính chất',
              width: 180,
              render: (r, _i, update) => (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(CARGO_PROPERTY).map(([key, label]) => {
                    const on = r.properties.includes(key);
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => update({ properties: on ? r.properties.filter((p) => p !== key) : [...r.properties, key] })}
                        className={`rounded border px-1.5 py-0.5 text-caption ${on ? 'border-primary bg-primary-soft text-primary' : 'border-border-control text-text-muted'}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ),
            },
          ]}
        />
      </FormSection>

      <FormSection title="Giá cước & dịch vụ cộng thêm" description="Giá cước nhập tay, tính chung cả đơn (kể cả đơn nhiều xe). Add-on cộng vào tổng thu khách, không tạo phiếu chi.">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Giá cước" required error={errors.freightAmount}>
            <MoneyInput value={freight} onChange={setFreight} placeholder="0" />
          </FormField>
          <FormField label="Hạn thanh toán" hint={suggestedDue ? `Gợi ý: ${suggestedDue.split('-').reverse().join('/')} (${debtDays} ngày công nợ)` : 'Để trống nếu chưa thỏa thuận'}>
            <DateField
              value={dueDate}
              onChange={(v) => {
                setDueDate(v);
                setDueTouched(true);
              }}
            />
          </FormField>
          <div className="flex flex-col justify-end rounded-lg bg-surface-muted p-3">
            <span className="text-caption text-text-muted">Tổng thu khách</span>
            <MoneyCell value={total} strong className="text-heading-md" />
            <span className="text-caption text-text-subtle">
              Cước {formatVnd(freight ?? 0)} + add-on {formatVnd(addonTotal)}
            </span>
          </div>
        </div>
        <LineItemsEditor<AddonRow>
          rows={addons}
          onChange={setAddons}
          newRow={() => ({ key: k(), serviceId: '', name: '', amount: null })}
          addLabel="Thêm dịch vụ cộng thêm"
          emptyText="Chưa có add-on (bốc xếp, nâng hạ, giao đêm…)"
          columns={[
            {
              key: 'service',
              label: 'Dịch vụ',
              render: (r, _i, update) => (
                <Select
                  value={r.serviceId}
                  allowEmpty
                  emptyLabel="— Khác (nhập tên) —"
                  onValueChange={(v) => update({ serviceId: v, name: addonOptions.find((o) => o.value === v)?.label ?? r.name })}
                  options={addonOptions}
                  placeholder="Chọn dịch vụ"
                />
              ),
            },
            { key: 'name', label: 'Tên hiển thị', render: (r, _i, update) => <Input value={r.name} onChange={(e) => update({ name: e.target.value })} placeholder="Tên dịch vụ" /> },
            { key: 'amount', label: 'Số tiền', width: 170, align: 'right', render: (r, _i, update) => <MoneyInput value={r.amount} onChange={(v) => update({ amount: v })} placeholder="0" /> },
          ]}
        />
      </FormSection>

      <FormSection title="Ghi chú">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Ghi chú đơn (tài xế thấy)">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Yêu cầu giao nhận, giờ hành chính…" />
          </FormField>
          <FormField label="Ghi chú nội bộ">
            <Textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} rows={3} placeholder="Chỉ nhân viên thấy" />
          </FormField>
        </div>
      </FormSection>

      {!isEdit && hasPermission('trip.create') ? (
        <FormSection title="Tạo chuyến ngay (đơn 1 xe)" description="Gán xe + tài xế luôn khi lưu; tất cả điểm dừng giao cho chuyến này. Đơn nhiều xe: bỏ chọn và tạo chuyến sau.">
          <Switch checked={withTrip} onCheckedChange={setWithTrip} label="Tạo chuyến khi lưu & xác nhận" />
          {withTrip ? (
            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="Xe" required error={errors.vehicleId}>
                <Select
                  value={vehicleId}
                  onValueChange={(v) => {
                    setVehicleId(v);
                    setServerWarnings(null);
                  }}
                  placeholder="Chọn xe"
                  options={(resources?.vehicleOptions ?? []).map((v) => ({
                    value: v.id,
                    label: `${v.plate}${v.typeName ? ` · ${v.typeName}` : ''}${v.status === 'MAINTENANCE' ? ' · bảo dưỡng' : ''}${v.busy ? ` · đang chạy ${v.busyTripCode ?? ''}` : ''}`,
                    disabled: v.status === 'INACTIVE',
                  }))}
                />
              </FormField>
              <FormField label="Tài xế" required error={errors.driverId}>
                <Select
                  value={driverId}
                  onValueChange={(v) => {
                    setDriverId(v);
                    setServerWarnings(null);
                  }}
                  placeholder="Chọn tài xế"
                  options={(resources?.driverOptions ?? []).map((d) => ({
                    value: d.id,
                    label: `${d.name} · ${d.phone}${d.status === 'INACTIVE' ? ' · ngừng hoạt động' : ''}${d.busy ? ` · đang chạy ${d.busyTripCode ?? ''}` : ''}`,
                    disabled: d.status === 'INACTIVE',
                  }))}
                />
              </FormField>
              <FormField label="Thưởng tài xế">
                <MoneyInput value={bonus} onChange={setBonus} placeholder="0" />
              </FormField>
              <FormField label="Xuất phát dự kiến" required error={errors.tripStart}>
                <DateField
                  mode="datetime"
                  value={tripStart}
                  onChange={(v) => {
                    setTripStart(v);
                    setServerWarnings(null);
                  }}
                />
              </FormField>
              <FormField label="Kết thúc dự kiến" error={errors.tripEnd} hint={`Để trống: tính ${settings?.merchantSettings.defaultTripHours ?? 8} giờ`}>
                <DateField
                  mode="datetime"
                  value={tripEnd}
                  onChange={(v) => {
                    setTripEnd(v);
                    setServerWarnings(null);
                  }}
                />
              </FormField>
              <div className="md:col-span-3">
                <OverlapWarningPanel warnings={liveWarnings} checking={checking} canOverride={canOverride} onOverride={serverWarnings ? () => setOverrideOpen(true) : undefined} />
              </div>
            </div>
          ) : null}
        </FormSection>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-6 py-3 backdrop-blur lg:pl-[284px]">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="mr-auto text-body-sm text-text-muted">
            Tổng thu khách: <strong className="text-text">{formatVnd(total)}</strong>
          </span>
          <Button variant="ghost" onClick={() => navigate(order ? paths.order(order.id) : PATHS.orders)}>
            Hủy
          </Button>
          {isEdit ? (
            <Button loading={saving} onClick={() => void submit('CONFIRMED', false)}>
              <Save /> Lưu thay đổi
            </Button>
          ) : (
            <>
              <Button variant="secondary" loading={saving} onClick={() => void submit('DRAFT', false)}>
                Lưu nháp
              </Button>
              <Button variant="secondary" loading={saving} onClick={() => void submit('CONFIRMED', false)}>
                Lưu & xác nhận
              </Button>
              {hasPermission('trip.create') ? (
                <Button loading={saving} onClick={() => void submit('CONFIRMED', true)} disabled={withTrip && !!serverWarnings && !canOverride}>
                  <Truck /> Lưu & tạo chuyến
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SensitiveActionModal
        open={overrideOpen}
        onOpenChange={setOverrideOpen}
        action="Bỏ qua cảnh báo trùng lịch và tạo chuyến"
        affected={(serverWarnings ?? []).map((w) => `${w.subject === 'VEHICLE' ? 'Xe' : 'Tài xế'} ${w.subjectLabel ?? ''} ↔ ${w.conflictTripCode ?? ''}`)}
        warning="Hệ thống ghi nhận lý do và người bỏ qua vào nhật ký; người điều phối khác sẽ nhận thông báo."
        confirmLabel="Tiếp tục tạo chuyến"
        loading={saving}
        onConfirm={async (reason) => {
          setOverrideOpen(false);
          await submit('CONFIRMED', true, { overrideReason: reason });
        }}
      />
      <SensitiveActionModal
        open={!!reasonOpen}
        onOpenChange={(o) => !o && setReasonOpen(null)}
        action={order?.status === 'COMPLETED' ? `Sửa đơn đã hoàn thành ${order?.code ?? ''}` : `Sửa giá cước đơn đã xác nhận ${order?.code ?? ''}`}
        before={order ? { freightAmount: formatVnd(order.freightAmount), addonTotal: formatVnd(order.addonTotal), totalAmount: formatVnd(order.totalAmount) } : undefined}
        after={{ freightAmount: formatVnd(freight ?? 0), addonTotal: formatVnd(addonTotal), totalAmount: formatVnd(total) }}
        diffLabels={{ freightAmount: 'Giá cước', addonTotal: 'Add-on', totalAmount: 'Tổng thu khách' }}
        confirmLabel="Lưu thay đổi"
        loading={saving}
        onConfirm={async (reason) => {
          const r = reasonOpen;
          setReasonOpen(null);
          if (r) await submit(r.submitStatus as 'DRAFT' | 'CONFIRMED', r.goTrip, { reason });
        }}
      />
    </div>
  );
}

function applyLocation(r: StopRow, l: { id: string; name: string; address: string; contactName?: string | null; contactPhone?: string | null; note?: string | null }): StopRow {
  return { ...r, locationId: l.id, locationName: l.name, address: l.address, contactName: l.contactName ?? r.contactName, contactPhone: l.contactPhone ?? r.contactPhone, note: r.note || l.note || '' };
}
