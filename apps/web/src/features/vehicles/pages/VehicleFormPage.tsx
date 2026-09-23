import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { Banner, Button, DateField, DetailSkeleton, ErrorState, FormField, FormSection, Input, NoPermissionState, PageHeader, RadioGroup, Select, Textarea, toast } from '@bta/shadcn';
import { VEHICLE_STATUS, vehicleSchema } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage, apolloValidation } from '@/lib/apollo';
import { emptyToNull } from '@/lib/form';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { dateInput } from '@/features/master-data/helpers';
import { CreateVehicleMutation, UpdateVehicleMutation, VehicleDetailQuery } from '../graphql/vehicles';

const formSchema = z.preprocess((v) => emptyToNull((v ?? {}) as Record<string, unknown>), vehicleSchema);
type FormValues = z.input<typeof vehicleSchema>;

/** WM-VEH-03 — Tạo/sửa xe. Biển số unique trong nhà xe. */
export default function VehicleFormPage() {
  const { vehicleId } = useParams();
  const { hasPermission } = useAuth();
  if (!hasPermission('vehicle.edit')) return <NoPermissionState message="Bạn không có quyền tạo/sửa xe" />;
  return <VehicleForm vehicleId={vehicleId} />;
}

function VehicleForm({ vehicleId }: { vehicleId?: string }) {
  const navigate = useNavigate();
  const isEdit = !!vehicleId;
  const { data, loading, error, refetch } = useQuery(VehicleDetailQuery, { variables: { id: vehicleId ?? '' }, skip: !isEdit });
  const { data: types } = useQuery(CatalogOptionsQuery, { variables: { type: 'VEHICLE_TYPE' as never, activeOnly: true } });
  const [create, { loading: creating }] = useMutation(CreateVehicleMutation);
  const [update, { loading: updating }] = useMutation(UpdateVehicleMutation);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema as never), defaultValues: { plate: '', status: 'ACTIVE' } });
  const v = data?.vehicle;
  React.useEffect(() => {
    if (!v) return;
    form.reset({
      plate: v.plate,
      typeId: v.typeId ?? '',
      capacityTons: v.capacityTons ?? ('' as never),
      brandModel: v.brandModel ?? '',
      year: v.year ?? ('' as never),
      chassisNo: v.chassisNo ?? '',
      engineNo: v.engineNo ?? '',
      boxSize: v.boxSize ?? '',
      fuelNorm: v.fuelNorm ?? '',
      registrationExpiresAt: dateInput(v.registrationExpiresAt),
      insuranceExpiresAt: dateInput(v.insuranceExpiresAt),
      status: v.status as 'ACTIVE',
      note: v.note ?? '',
    });
  }, [v, form]);

  const submit = form.handleSubmit(async (values) => {
    setSaveError(null);
    const input = { ...(values as Record<string, unknown>) };
    try {
      if (isEdit) {
        // Ngừng sử dụng đi qua thao tác nhạy cảm ở trang chi tiết, form không đổi sang INACTIVE
        if (input.status === 'INACTIVE' && v?.status !== 'INACTIVE') delete input.status;
        await update({ variables: { id: vehicleId!, input: input as never } });
        toast.success('Đã lưu thông tin xe');
        navigate(paths.vehicle(vehicleId!));
      } else {
        const res = await create({ variables: { input: input as never } });
        const c = res.data?.createVehicle;
        if (!c) return;
        toast.success(`Đã thêm xe ${c.code}`);
        navigate(paths.vehicle(c.id));
      }
    } catch (e) {
      apolloValidation(e).forEach((i) => form.setError(i.field as keyof FormValues, { message: i.message }));
      setSaveError(apolloErrorMessage(e));
    }
  });

  if (isEdit && error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (isEdit && loading && !v) return <DetailSkeleton />;
  const f = form.formState.errors;
  const reg = (name: keyof FormValues) => form.register(name as never);
  const typeOptions = (types?.catalogItems ?? []).map((t) => ({ value: t.id, label: t.name }));
  if (v?.typeId && v.type && !typeOptions.some((o) => o.value === v.typeId)) typeOptions.push({ value: v.typeId, label: `${v.type.name} (ngừng dùng)` });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <PageHeader
        title={isEdit ? `Sửa xe ${v?.plate ?? ''}` : 'Thêm xe'}
        breadcrumb={[{ label: 'Xe', to: PATHS.vehicles }, ...(isEdit && v ? [{ label: v.plate, to: paths.vehicle(v.id) }] : []), { label: isEdit ? 'Sửa' : 'Thêm mới' }]}
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => navigate(isEdit ? paths.vehicle(vehicleId!) : PATHS.vehicles)}>
              Hủy
            </Button>
            <Button type="submit" loading={creating || updating}>
              Lưu xe
            </Button>
          </>
        }
      />
      {saveError ? <Banner tone="danger" message={saveError} /> : null}
      <FormSection title="Thông tin xe">
        <FormField label="Biển số" required error={f.plate?.message} hint="Ví dụ 51C-123.45 — không trùng trong nhà xe">
          <Input {...reg('plate')} aria-invalid={!!f.plate} className="font-mono uppercase" />
        </FormField>
        <FormField label="Loại xe" error={f.typeId?.message}>
          <Controller control={form.control} name="typeId" render={({ field }) => <Select value={(field.value as string) || null} onValueChange={field.onChange} options={typeOptions} allowEmpty placeholder="Chọn loại xe" />} />
        </FormField>
        <FormField label="Tải trọng (tấn)" error={f.capacityTons?.message}>
          <Input {...reg('capacityTons')} inputMode="decimal" />
        </FormField>
        <FormField label="Hãng / model" error={f.brandModel?.message}>
          <Input {...reg('brandModel')} placeholder="Hino FC" />
        </FormField>
        <FormField label="Năm sản xuất" error={f.year?.message}>
          <Input {...reg('year')} inputMode="numeric" />
        </FormField>
        <FormField label="Kích thước thùng" error={f.boxSize?.message}>
          <Input {...reg('boxSize')} placeholder="6.2 x 2.3 x 2.4 m" />
        </FormField>
      </FormSection>
      <FormSection title="Thông số kỹ thuật & giấy tờ">
        <FormField label="Số khung" error={f.chassisNo?.message}>
          <Input {...reg('chassisNo')} />
        </FormField>
        <FormField label="Số máy" error={f.engineNo?.message}>
          <Input {...reg('engineNo')} />
        </FormField>
        <FormField label="Định mức nhiên liệu" error={f.fuelNorm?.message}>
          <Input {...reg('fuelNorm')} placeholder="18 lít/100 km" />
        </FormField>
        <div />
        <FormField label="Hạn đăng kiểm" error={f.registrationExpiresAt?.message}>
          <Controller control={form.control} name="registrationExpiresAt" render={({ field }) => <DateField value={(field.value as string) ?? ''} onChange={field.onChange} />} />
        </FormField>
        <FormField label="Hạn bảo hiểm" error={f.insuranceExpiresAt?.message}>
          <Controller control={form.control} name="insuranceExpiresAt" render={({ field }) => <DateField value={(field.value as string) ?? ''} onChange={field.onChange} />} />
        </FormField>
      </FormSection>
      <FormSection title="Trạng thái & ghi chú">
        <FormField label="Trạng thái" hint={isEdit ? 'Ngừng sử dụng xe thực hiện ở trang chi tiết (cần lý do)' : undefined}>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <RadioGroup
                value={(field.value as string) ?? 'ACTIVE'}
                onValueChange={field.onChange}
                options={Object.entries(VEHICLE_STATUS)
                  .filter(([k]) => !isEdit || k !== 'INACTIVE' || v?.status === 'INACTIVE')
                  .map(([value, m]) => ({ value, label: m.label }))}
              />
            )}
          />
        </FormField>
        <FormField label="Ghi chú" className="sm:col-span-2">
          <Textarea rows={3} {...reg('note')} />
        </FormField>
      </FormSection>
    </form>
  );
}
