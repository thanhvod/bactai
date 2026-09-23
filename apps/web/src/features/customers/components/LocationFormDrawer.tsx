import { zodFormResolver } from '../../../lib/form';
import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { Controller, useForm } from 'react-hook-form';
import { Banner, Button, Drawer, FormField, Input, MapView, RadioGroup, Switch, Textarea, toast } from '@bta/shadcn';
import { LOCATION_USAGE, customerLocationSchema, type CustomerLocationInput } from '@bta/shared';
import { apolloErrorMessage } from '@/lib/apollo';
import type { CustomerLocationFieldsFragment } from '@/gql/graphql';
import { CreateCustomerLocationMutation, UpdateCustomerLocationMutation } from '../graphql/customers';

const blank = (v?: string | null) => (v && v.trim() ? v.trim() : null);

/** WM-CUS-04 — Drawer thêm/sửa địa chỉ thường dùng. */
export function LocationFormDrawer({
  customerId,
  location,
  open,
  onOpenChange,
  onSaved,
}: {
  customerId: string;
  location?: CustomerLocationFieldsFragment | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const [create, { loading: c1 }] = useMutation(CreateCustomerLocationMutation);
  const [update, { loading: c2 }] = useMutation(UpdateCustomerLocationMutation);
  const [error, setError] = React.useState<string | null>(null);
  const defaults = (l?: CustomerLocationFieldsFragment | null): CustomerLocationInput => ({
    name: l?.name ?? '',
    usage: (l?.usage as CustomerLocationInput['usage']) ?? 'BOTH',
    address: l?.address ?? '',
    province: l?.province ?? '',
    lat: l?.lat ?? null,
    lng: l?.lng ?? null,
    contactName: l?.contactName ?? '',
    contactPhone: l?.contactPhone ?? '',
    note: l?.note ?? '',
    isDefault: l?.isDefault ?? false,
  });
  const form = useForm<CustomerLocationInput>({ resolver: zodFormResolver<CustomerLocationInput>(customerLocationSchema), defaultValues: defaults(location) });
  React.useEffect(() => {
    if (open) {
      form.reset(defaults(location));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, location]);
  const f = form.formState.errors;
  const lat = form.watch('lat');
  const lng = form.watch('lng');

  const submit = form.handleSubmit(async (v) => {
    const input = {
      name: v.name.trim(),
      usage: v.usage,
      address: v.address.trim(),
      province: blank(v.province),
      lat: v.lat ?? null,
      lng: v.lng ?? null,
      contactName: blank(v.contactName),
      contactPhone: blank(v.contactPhone),
      note: blank(v.note),
      isDefault: !!v.isDefault,
    };
    try {
      if (location) await update({ variables: { id: location.id, input: input as never } });
      else await create({ variables: { customerId, input: input as never } });
      toast.success(location ? 'Đã lưu địa chỉ' : 'Đã thêm địa chỉ');
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setError(apolloErrorMessage(e));
    }
  });

  const numField = (name: 'lat' | 'lng', label: string) => (
    <FormField label={label} error={f[name]?.message}>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => <Input type="number" step="any" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />}
      />
    </FormField>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={location ? 'Sửa địa chỉ' : 'Thêm địa chỉ thường dùng'}
      description="Khi tạo đơn, chọn nhanh từ sổ địa chỉ; đơn lưu bản sao nên sửa ở đây không đổi đơn cũ."
      width={560}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => void submit()} loading={c1 || c2}>
            Lưu địa chỉ
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        {error ? <Banner tone="danger" message={error} /> : null}
        <FormField label="Tên kho / địa điểm" required error={f.name?.message}>
          <Input autoFocus {...form.register('name')} placeholder="Kho Cần Thơ" />
        </FormField>
        <FormField label="Dùng cho">
          <RadioGroup
            inline
            value={form.watch('usage')}
            onValueChange={(v) => form.setValue('usage', v as CustomerLocationInput['usage'], { shouldDirty: true })}
            options={Object.entries(LOCATION_USAGE).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </FormField>
        <FormField label="Địa chỉ" required error={f.address?.message}>
          <Textarea rows={2} {...form.register('address')} />
        </FormField>
        <FormField label="Tỉnh/Thành">
          <Input {...form.register('province')} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Người liên hệ">
            <Input {...form.register('contactName')} />
          </FormField>
          <FormField label="SĐT liên hệ">
            <Input {...form.register('contactPhone')} />
          </FormField>
        </div>
        <FormField label="Ghi chú bốc/trả hàng">
          <Textarea rows={2} {...form.register('note')} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          {numField('lat', 'Vĩ độ (tùy chọn)')}
          {numField('lng', 'Kinh độ (tùy chọn)')}
        </div>
        {typeof lat === 'number' && typeof lng === 'number' ? <MapView height={200} zoom={13} center={[lat, lng]} pins={[{ id: 'p', lat, lng, label: form.watch('name') || 'Vị trí', status: 'primary' }]} /> : null}
        <Switch label="Đặt làm địa chỉ mặc định" checked={!!form.watch('isDefault')} onCheckedChange={(c) => form.setValue('isDefault', c, { shouldDirty: true })} />
      </form>
    </Drawer>
  );
}
