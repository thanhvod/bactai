import * as React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Controller, useFieldArray, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, BookUser, Plus, Trash2 } from 'lucide-react';
import { Banner, Button, Checkbox, DetailSkeleton, EmptyState, FormField, IconButton, Input, PageHeader, Select, Textarea, toast } from '@bta/shadcn';
import { CreateBookingMutation, CustomerMeQuery, MyBookingQuery, PublicMerchantQuery, PublicMerchantsQuery, UpdateBookingMutation } from '@/graphql/operations';
import { apolloErrorMessage } from '@/lib/apollo';
import { paths } from '@/app/routes';
import { Panel } from '@/components/ui';
import { AddressPicker } from '../addresses/AddressPicker';
import { bookingFormSchema, defaultBookingValues, emptyStop, toBookingInput, toLocalInput, type BookingFormValues } from './booking-form';

/** CW-BOOK-01 — Tạo / sửa yêu cầu vận chuyển (sửa chỉ khi Chờ tiếp nhận). */
export default function BookingFormPage() {
  const { bookingId } = useParams();
  const [params] = useSearchParams();
  const editing = !!bookingId;
  const existing = useQuery(MyBookingQuery, { variables: { id: bookingId ?? '' }, skip: !editing });
  if (editing && existing.loading && !existing.data) return <DetailSkeleton />;
  if (editing && (existing.error || !existing.data)) {
    return <EmptyState message="Không tìm thấy yêu cầu" action={<Button asChild><Link to={paths.bookings()}>Về danh sách booking</Link></Button>} />;
  }
  const b = existing.data?.myBooking;
  if (b && b.status !== 'SUBMITTED') {
    return (
      <EmptyState
        message="Yêu cầu đã được nhà xe xử lý nên không sửa được"
        action={<Button asChild><Link to={paths.booking(b.id)}>Xem yêu cầu</Link></Button>}
      />
    );
  }
  const initial: BookingFormValues | null = b
    ? {
        merchantId: b.merchantId,
        stops: b.stops.map((s) => ({ type: s.type as 'PICKUP' | 'DROPOFF', address: s.address, locationName: s.locationName ?? '', contactName: s.contactName ?? '', contactPhone: s.contactPhone ?? '', note: s.note ?? '', addressId: null })),
        cargoName: b.cargoName,
        weightTon: b.weightTon ?? '',
        packages: b.packages ?? '',
        vehicleTypeHint: b.vehicleTypeHint ?? '',
        fragile: b.fragile,
        loadingAtPickup: b.loadingAtPickup,
        loadingAtDrop: b.loadingAtDrop,
        pickupFrom: toLocalInput(b.pickupFrom),
        deliverBefore: toLocalInput(b.deliverBefore),
        flexibility: b.flexibility ?? '',
        note: b.note ?? '',
        contactName: b.contactName,
        contactPhone: b.contactPhone,
      }
    : null;
  return <BookingForm bookingId={bookingId} bookingCode={b?.code} initial={initial} merchantParam={params.get('merchantId')} />;
}

function BookingForm({ bookingId, bookingCode, initial, merchantParam }: { bookingId?: string; bookingCode?: string; initial: BookingFormValues | null; merchantParam: string | null }) {
  const navigate = useNavigate();
  const me = useQuery(CustomerMeQuery);
  const merchants = useQuery(PublicMerchantsQuery, { variables: { first: 100 } });
  const form = useForm<BookingFormValues>({
    // Form giữ chuỗi cho ô số (weightTon/packages); schema preprocess '' → null khi validate.
    resolver: zodResolver(bookingFormSchema) as unknown as Resolver<BookingFormValues>,
    defaultValues: initial ?? defaultBookingValues(merchantParam ?? ''),
  });
  const stops = useFieldArray({ control: form.control, name: 'stops' });
  const [pickFor, setPickFor] = React.useState<number | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [create, createState] = useMutation(CreateBookingMutation);
  const [update, updateState] = useMutation(UpdateBookingMutation);
  const merchantId = form.watch('merchantId');
  const merchant = useQuery(PublicMerchantQuery, { variables: { id: merchantId }, skip: !merchantId });

  // Điền sẵn liên hệ từ hồ sơ khi tạo mới.
  React.useEffect(() => {
    const a = me.data?.customerMe.account;
    if (!initial && a) {
      if (!form.getValues('contactName')) form.setValue('contactName', a.fullName);
      if (!form.getValues('contactPhone') && a.phone) form.setValue('contactPhone', a.phone);
    }
  }, [me.data, initial, form]);

  const errs = form.formState.errors;
  const submit = form.handleSubmit(async (v) => {
    setSubmitError(null);
    const input = toBookingInput(bookingFormSchema.parse(v));
    try {
      if (bookingId) {
        await update({ variables: { id: bookingId, input } });
        toast.success('Đã cập nhật yêu cầu');
        navigate(paths.booking(bookingId));
      } else {
        const r = await create({ variables: { input } });
        toast.success(`Đã gửi yêu cầu ${r.data?.createBooking.code ?? ''}`);
        navigate(paths.booking(r.data!.createBooking.id));
      }
    } catch (e) {
      setSubmitError(apolloErrorMessage(e));
    }
  });

  const cancelTo = bookingId ? paths.booking(bookingId) : merchantId ? paths.merchant(merchantId) : '/';
  const merchantOptions = (merchants.data?.publicMerchants.nodes ?? []).map((m) => ({ value: m.id, label: m.name }));

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <PageHeader
        title={bookingId ? `Sửa yêu cầu ${bookingCode ?? ''}` : 'Gửi yêu cầu vận chuyển'}
        subtitle="Yêu cầu chưa phải đơn hàng và chưa có giá — nhà xe sẽ tiếp nhận, xác nhận giá và tạo đơn."
        breadcrumb={[{ label: 'Booking của tôi', to: paths.bookings() }, { label: bookingId ? 'Sửa yêu cầu' : 'Yêu cầu mới' }]}
      />
      {submitError ? <Banner tone="danger" message={`Không gửi được yêu cầu: ${submitError}`} /> : null}

      <Panel title="Nhà xe">
        <FormField label="Gửi tới nhà xe" required error={errs.merchantId?.message} htmlFor="merchantId">
          <Controller
            control={form.control}
            name="merchantId"
            render={({ field }) => (
              <Select id="merchantId" value={field.value} onValueChange={field.onChange} options={merchantOptions} placeholder="Chọn nhà xe" disabled={!!bookingId} />
            )}
          />
        </FormField>
        {merchant.data?.publicMerchant ? (
          <p className="mt-2 text-body-sm text-text-muted">
            {merchant.data.publicMerchant.serviceAreas.join(' · ')}
            {merchant.data.publicMerchant.vehicleTypes.length ? ` · ${merchant.data.publicMerchant.vehicleTypes.join(', ')}` : ''}
          </p>
        ) : null}
      </Panel>

      <Panel
        title="Điểm lấy / trả hàng"
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => stops.append(emptyStop('PICKUP'))}>
              <Plus /> Điểm lấy
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => stops.append(emptyStop('DROPOFF'))}>
              <Plus /> Điểm trả
            </Button>
          </div>
        }
      >
        {errs.stops?.message || errs.stops?.root?.message ? (
          <p className="mb-3 text-body-sm text-danger" role="alert">
            {errs.stops?.message ?? errs.stops?.root?.message}
          </p>
        ) : null}
        <ol className="space-y-4">
          {stops.fields.map((f, i) => {
            const e = errs.stops?.[i];
            const type = form.watch(`stops.${i}.type`);
            return (
              <li key={f.id} className="rounded-md border border-border p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-surface-muted text-caption">{i + 1}</span>
                    <Controller
                      control={form.control}
                      name={`stops.${i}.type`}
                      render={({ field }) => (
                        <Select
                          className="w-[140px]"
                          value={field.value}
                          onValueChange={field.onChange}
                          options={[
                            { value: 'PICKUP', label: 'Điểm lấy' },
                            { value: 'DROPOFF', label: 'Điểm trả' },
                          ]}
                        />
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPickFor(i)}>
                      <BookUser /> Chọn từ địa chỉ thường dùng
                    </Button>
                    <IconButton label="Chuyển lên" variant="ghost" size="sm" disabled={i === 0} onClick={() => stops.move(i, i - 1)}>
                      <ArrowUp />
                    </IconButton>
                    <IconButton label="Chuyển xuống" variant="ghost" size="sm" disabled={i === stops.fields.length - 1} onClick={() => stops.move(i, i + 1)}>
                      <ArrowDown />
                    </IconButton>
                    <IconButton label="Xóa điểm" variant="ghost" size="sm" disabled={stops.fields.length <= 2} onClick={() => stops.remove(i)}>
                      <Trash2 />
                    </IconButton>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Tên điểm / kho" htmlFor={`s${i}-name`}>
                    <Input id={`s${i}-name`} placeholder={type === 'PICKUP' ? 'VD: Kho Thuận An' : 'VD: Cửa hàng Quận 7'} {...form.register(`stops.${i}.locationName`)} />
                  </FormField>
                  <FormField label="Địa chỉ" required error={e?.address?.message} htmlFor={`s${i}-addr`}>
                    <Input id={`s${i}-addr`} {...form.register(`stops.${i}.address`)} />
                  </FormField>
                  <FormField label="Người liên hệ" htmlFor={`s${i}-cn`}>
                    <Input id={`s${i}-cn`} {...form.register(`stops.${i}.contactName`)} />
                  </FormField>
                  <FormField label="SĐT liên hệ" htmlFor={`s${i}-cp`}>
                    <Input id={`s${i}-cp`} type="tel" {...form.register(`stops.${i}.contactPhone`)} />
                  </FormField>
                  <FormField label="Ghi chú điểm" className="sm:col-span-2" htmlFor={`s${i}-note`}>
                    <Input id={`s${i}-note`} placeholder="VD: vào cổng số 2, giờ nhận hàng" {...form.register(`stops.${i}.note`)} />
                  </FormField>
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>

      <Panel title="Hàng hóa & dịch vụ">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Tên hàng" required error={errs.cargoName?.message} className="sm:col-span-2" htmlFor="cargoName">
            <Input id="cargoName" placeholder="VD: 10 tấn gạo đóng bao" {...form.register('cargoName')} />
          </FormField>
          <FormField label="Khối lượng (tấn)" error={errs.weightTon?.message as string | undefined} htmlFor="weightTon">
            <Input id="weightTon" type="number" step="0.1" min={0} {...form.register('weightTon')} />
          </FormField>
          <FormField label="Số kiện" error={errs.packages?.message as string | undefined} htmlFor="packages">
            <Input id="packages" type="number" min={0} {...form.register('packages')} />
          </FormField>
          <FormField label="Loại xe mong muốn" className="sm:col-span-2" htmlFor="vth">
            <Input id="vth" placeholder="VD: Tải thùng 8 tấn" {...form.register('vehicleTypeHint')} />
          </FormField>
        </div>
        <div className="mt-3 flex flex-wrap gap-5">
          <Controller control={form.control} name="fragile" render={({ field }) => <Checkbox label="Hàng dễ vỡ" checked={!!field.value} onCheckedChange={(c) => field.onChange(!!c)} />} />
          <Controller control={form.control} name="loadingAtPickup" render={({ field }) => <Checkbox label="Cần bốc xếp tại điểm lấy" checked={!!field.value} onCheckedChange={(c) => field.onChange(!!c)} />} />
          <Controller control={form.control} name="loadingAtDrop" render={({ field }) => <Checkbox label="Cần bốc xếp tại điểm trả" checked={!!field.value} onCheckedChange={(c) => field.onChange(!!c)} />} />
        </div>
      </Panel>

      <Panel title="Thời gian & liên hệ">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Lấy hàng từ" required error={errs.pickupFrom?.message} htmlFor="pickupFrom">
            <Input id="pickupFrom" type="datetime-local" {...form.register('pickupFrom')} />
          </FormField>
          <FormField label="Giao trước" error={errs.deliverBefore?.message} htmlFor="deliverBefore">
            <Input id="deliverBefore" type="datetime-local" {...form.register('deliverBefore')} />
          </FormField>
          <FormField label="Mức linh hoạt" htmlFor="flex">
            <Input id="flex" placeholder="VD: ± 2 giờ" {...form.register('flexibility')} />
          </FormField>
          <FormField label="Người liên hệ" required error={errs.contactName?.message} htmlFor="contactName">
            <Input id="contactName" {...form.register('contactName')} />
          </FormField>
          <FormField label="SĐT liên hệ" required error={errs.contactPhone?.message} htmlFor="contactPhone">
            <Input id="contactPhone" type="tel" {...form.register('contactPhone')} />
          </FormField>
          <FormField label="Ghi chú cho nhà xe" className="sm:col-span-2 lg:col-span-3" htmlFor="note">
            <Textarea id="note" rows={3} {...form.register('note')} />
          </FormField>
        </div>
      </Panel>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => navigate(cancelTo)}>
          Hủy
        </Button>
        <Button type="submit" loading={createState.loading || updateState.loading}>
          {bookingId ? 'Lưu thay đổi' : 'Gửi yêu cầu'}
        </Button>
      </div>

      <AddressPicker
        open={pickFor !== null}
        onOpenChange={(o) => !o && setPickFor(null)}
        onPick={(a) => {
          if (pickFor === null) return;
          form.setValue(`stops.${pickFor}.addressId`, a.id);
          form.setValue(`stops.${pickFor}.locationName`, a.name);
          form.setValue(`stops.${pickFor}.address`, a.address, { shouldValidate: true });
          form.setValue(`stops.${pickFor}.contactName`, a.contactName ?? '');
          form.setValue(`stops.${pickFor}.contactPhone`, a.contactPhone ?? '');
          form.setValue(`stops.${pickFor}.note`, a.note ?? '');
        }}
      />
    </form>
  );
}
