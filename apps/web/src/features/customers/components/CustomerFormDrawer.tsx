import { zodFormResolver } from '../../../lib/form';
import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Controller, useForm } from 'react-hook-form';
import { Banner, Button, Drawer, FormField, FormSection, Input, MoneyInput, RadioGroup, Select, Textarea, toast } from '@bta/shadcn';
import { customerSchema, type CustomerInput } from '@bta/shared';
import { apolloErrorMessage, apolloValidation } from '@/lib/apollo';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { CreateCustomerMutation, UpdateCustomerMutation } from '../graphql/customers';
import type { CustomerDetailFieldsFragment } from '@/gql/graphql';

type Values = CustomerInput;

function toValues(c?: CustomerDetailFieldsFragment | null): Values {
  return {
    type: (c?.type as Values['type']) ?? 'COMPANY',
    name: c?.name ?? '',
    legalName: c?.legalName ?? '',
    taxCode: c?.taxCode ?? '',
    phone: c?.phone ?? '',
    email: c?.email ?? '',
    invoiceEmail: c?.invoiceEmail ?? '',
    billingAddress: c?.billingAddress ?? '',
    groupId: c?.groupId ?? null,
    primaryContact: { name: c?.primaryContact?.name ?? '', role: c?.primaryContact?.role ?? '', phone: c?.primaryContact?.phone ?? '', zalo: c?.primaryContact?.zalo ?? '', email: c?.primaryContact?.email ?? '' },
    creditLimit: c?.creditLimit ?? null,
    defaultDebtDays: c?.defaultDebtDays ?? null,
    note: c?.note ?? '',
  };
}

const blank = (v?: string | null) => (v && v.trim() ? v.trim() : null);

/** WM-CUS-03 — Form khách hàng (drawer). Tạo mới khi không truyền `customer`. */
export function CustomerFormDrawer({
  open,
  onOpenChange,
  customer,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  customer?: CustomerDetailFieldsFragment | null;
  onSaved: (id: string) => void;
}) {
  const [create, { loading: creating }] = useMutation(CreateCustomerMutation);
  const [update, { loading: updating }] = useMutation(UpdateCustomerMutation);
  const groups = useQuery(CatalogOptionsQuery, { variables: { type: 'CUSTOMER_GROUP' as never, activeOnly: false }, skip: !open });
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodFormResolver<Values>(customerSchema), defaultValues: toValues(customer) });
  React.useEffect(() => {
    if (open) {
      form.reset(toValues(customer));
      setError(null);
    }
  }, [open, customer, form]);
  const f = form.formState.errors;

  const submit = form.handleSubmit(async (v) => {
    setError(null);
    const pc = v.primaryContact ?? {};
    const input = {
      type: v.type,
      name: v.name.trim(),
      legalName: blank(v.legalName),
      taxCode: blank(v.taxCode),
      phone: blank(v.phone),
      email: blank(v.email),
      invoiceEmail: blank(v.invoiceEmail),
      billingAddress: blank(v.billingAddress),
      groupId: v.groupId || null,
      primaryContact: pc.name || pc.phone ? { name: blank(pc.name), role: blank(pc.role), phone: blank(pc.phone), zalo: blank(pc.zalo), email: blank(pc.email) } : null,
      creditLimit: v.creditLimit ?? null,
      defaultDebtDays: v.defaultDebtDays ?? null,
      note: blank(v.note),
    };
    try {
      if (customer) {
        await update({ variables: { id: customer.id, input: input as never } });
        toast.success('Đã lưu khách hàng');
        onSaved(customer.id);
      } else {
        const r = await create({ variables: { input: input as never } });
        const c = r.data?.createCustomer;
        toast.success('Đã tạo khách hàng', c ? `${c.code} · ${c.name}` : undefined);
        if (c) onSaved(c.id);
      }
    } catch (e) {
      const issues = apolloValidation(e);
      for (const i of issues) form.setError(i.field as keyof Values, { message: i.message });
      setError(apolloErrorMessage(e));
    }
  });

  const type = form.watch('type');
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={customer ? `Sửa khách hàng ${customer.code}` : 'Tạo khách hàng'}
      description={customer ? customer.name : 'Mã khách hàng do hệ thống tự sinh.'}
      width={720}
      modalStrict={form.formState.isDirty}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => void submit()} loading={creating || updating}>
            Lưu khách hàng
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        {error ? <Banner tone="danger" message={error} /> : null}
        <FormSection title="Thông tin chung">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Loại khách" className="md:col-span-2">
              <RadioGroup
                inline
                value={type}
                onValueChange={(v) => form.setValue('type', v as Values['type'], { shouldDirty: true })}
                options={[
                  { value: 'COMPANY', label: 'Doanh nghiệp' },
                  { value: 'INDIVIDUAL', label: 'Cá nhân' },
                ]}
              />
            </FormField>
            <FormField label={type === 'COMPANY' ? 'Tên khách hàng' : 'Họ tên'} required error={f.name?.message} htmlFor="c-name" className="md:col-span-2">
              <Input id="c-name" autoFocus {...form.register('name')} aria-invalid={!!f.name} />
            </FormField>
            {type === 'COMPANY' ? (
              <FormField label="Tên pháp lý (xuất hóa đơn)" htmlFor="c-legal">
                <Input id="c-legal" {...form.register('legalName')} />
              </FormField>
            ) : null}
            <FormField label="Mã số thuế" error={f.taxCode?.message} htmlFor="c-tax">
              <Input id="c-tax" {...form.register('taxCode')} />
            </FormField>
            <FormField label="Số điện thoại" error={f.phone?.message} htmlFor="c-phone">
              <Input id="c-phone" {...form.register('phone')} />
            </FormField>
            <FormField label="Email" error={f.email?.message} htmlFor="c-email">
              <Input id="c-email" type="email" {...form.register('email')} />
            </FormField>
            <FormField label="Nhóm khách">
              <Controller
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? null}
                    allowEmpty
                    onValueChange={(v) => field.onChange(v || null)}
                    options={(groups.data?.catalogItems ?? []).map((g) => ({ value: g.id, label: g.name, disabled: !g.active && g.id !== field.value }))}
                  />
                )}
              />
            </FormField>
          </div>
        </FormSection>
        <FormSection title="Hóa đơn & liên hệ">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Địa chỉ xuất hóa đơn" htmlFor="c-bill" className="md:col-span-2">
              <Input id="c-bill" {...form.register('billingAddress')} />
            </FormField>
            <FormField label="Email nhận hóa đơn / bảng kê" htmlFor="c-inv">
              <Input id="c-inv" type="email" {...form.register('invoiceEmail')} />
            </FormField>
            <div />
            <FormField label="Người liên hệ chính" htmlFor="c-pc-name">
              <Input id="c-pc-name" {...form.register('primaryContact.name')} />
            </FormField>
            <FormField label="Chức vụ" htmlFor="c-pc-role">
              <Input id="c-pc-role" {...form.register('primaryContact.role')} />
            </FormField>
            <FormField label="SĐT liên hệ" htmlFor="c-pc-phone">
              <Input id="c-pc-phone" {...form.register('primaryContact.phone')} />
            </FormField>
            <FormField label="Zalo" htmlFor="c-pc-zalo">
              <Input id="c-pc-zalo" {...form.register('primaryContact.zalo')} />
            </FormField>
          </div>
        </FormSection>
        <FormSection title="Công nợ" description="Cảnh báo mềm khi tạo đơn vượt hạn mức; không chặn.">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Hạn mức nợ" hint="Để trống = dùng mặc định nhà xe" error={f.creditLimit?.message}>
              <Controller control={form.control} name="creditLimit" render={({ field }) => <MoneyInput value={field.value ?? null} onChange={(v) => field.onChange(v)} />} />
            </FormField>
            <FormField label="Số ngày công nợ mặc định" hint="Gợi ý hạn thanh toán khi tạo đơn" error={f.defaultDebtDays?.message}>
              <Controller
                control={form.control}
                name="defaultDebtDays"
                render={({ field }) => (
                  <Input type="number" min={0} suffix="ngày" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                )}
              />
            </FormField>
          </div>
        </FormSection>
        <FormField label="Ghi chú nội bộ" htmlFor="c-note">
          <Textarea id="c-note" rows={3} {...form.register('note')} />
        </FormField>
      </form>
    </Drawer>
  );
}
