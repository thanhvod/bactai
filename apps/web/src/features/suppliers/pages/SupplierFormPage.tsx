import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { Banner, Button, DetailSkeleton, ErrorState, FormField, FormSection, Input, LineItemsEditor, NoPermissionState, PageHeader, Select, Switch, Textarea, toast } from '@bta/shadcn';
import { supplierSchema, type ContactInput } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage, apolloValidation } from '@/lib/apollo';
import { emptyToNull, stripTypename } from '@/lib/form';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { CreateSupplierMutation, SupplierDetailQuery, UpdateSupplierMutation } from '../graphql/suppliers';

const formSchema = z.preprocess((v) => {
  const o = emptyToNull((v ?? {}) as Record<string, unknown>) as Record<string, unknown>;
  const contacts = ((o.contacts as ContactInput[] | null) ?? [])
    .map((c) => emptyToNull(c as Record<string, unknown>))
    .filter((c) => c.name || c.phone || c.email);
  return { ...o, contacts };
}, supplierSchema);
type FormValues = z.input<typeof supplierSchema> & { active?: boolean };

const emptyContact = (): ContactInput => ({ name: '', role: '', phone: '', email: '' });

/** WM-SUP-03 — Tạo/sửa nhà cung cấp (nhiều liên hệ). */
export default function SupplierFormPage() {
  const { supplierId } = useParams();
  const { hasPermission } = useAuth();
  if (!hasPermission('supplier.edit')) return <NoPermissionState message="Bạn không có quyền tạo/sửa nhà cung cấp" />;
  return <SupplierForm supplierId={supplierId} />;
}

function SupplierForm({ supplierId }: { supplierId?: string }) {
  const navigate = useNavigate();
  const isEdit = !!supplierId;
  const { data, loading, error, refetch } = useQuery(SupplierDetailQuery, { variables: { id: supplierId ?? '' }, skip: !isEdit });
  const { data: types } = useQuery(CatalogOptionsQuery, { variables: { type: 'SUPPLIER_TYPE' as never, activeOnly: true } });
  const [create, { loading: creating }] = useMutation(CreateSupplierMutation);
  const [update, { loading: updating }] = useMutation(UpdateSupplierMutation);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema as never), defaultValues: { name: '', contacts: [emptyContact()] } });
  const s = data?.supplier;
  React.useEffect(() => {
    if (!s) return;
    form.reset({
      name: s.name,
      typeId: s.typeId ?? '',
      taxCode: s.taxCode ?? '',
      address: s.address ?? '',
      bankName: s.bankName ?? '',
      bankAccountNo: s.bankAccountNo ?? '',
      paymentTerms: s.paymentTerms ?? '',
      contacts: s.contacts.length ? stripTypename(s.contacts).map((c) => ({ name: c.name ?? '', role: c.role ?? '', phone: c.phone ?? '', email: c.email ?? '' })) : [emptyContact()],
      note: s.note ?? '',
    });
  }, [s, form]);

  const submit = form.handleSubmit(async (values) => {
    setSaveError(null);
    const input = { ...(values as Record<string, unknown>) };
    delete input.status; // ngừng giao dịch đi qua thao tác nhạy cảm ở trang chi tiết
    try {
      if (isEdit) {
        await update({ variables: { id: supplierId!, input: input as never } });
        toast.success('Đã lưu nhà cung cấp');
        navigate(paths.supplier(supplierId!));
      } else {
        const res = await create({ variables: { input: input as never } });
        const c = res.data?.createSupplier;
        if (!c) return;
        toast.success(`Đã thêm NCC ${c.code}`);
        navigate(paths.supplier(c.id));
      }
    } catch (e) {
      apolloValidation(e).forEach((i) => form.setError(i.field as keyof FormValues, { message: i.message }));
      setSaveError(apolloErrorMessage(e));
    }
  });

  if (isEdit && error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (isEdit && loading && !s) return <DetailSkeleton />;
  const f = form.formState.errors;
  const reg = (name: keyof FormValues) => form.register(name as never);
  const typeOptions = (types?.catalogItems ?? []).map((t) => ({ value: t.id, label: t.name }));
  if (s?.typeId && s.type && !typeOptions.some((o) => o.value === s.typeId)) typeOptions.push({ value: s.typeId, label: `${s.type.name} (ngừng dùng)` });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <PageHeader
        title={isEdit ? `Sửa NCC ${s?.code ?? ''}` : 'Thêm nhà cung cấp'}
        breadcrumb={[{ label: 'Nhà cung cấp', to: PATHS.suppliers }, ...(isEdit && s ? [{ label: s.name, to: paths.supplier(s.id) }] : []), { label: isEdit ? 'Sửa' : 'Thêm mới' }]}
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => navigate(isEdit ? paths.supplier(supplierId!) : PATHS.suppliers)}>
              Hủy
            </Button>
            <Button type="submit" loading={creating || updating}>
              Lưu NCC
            </Button>
          </>
        }
      />
      {saveError ? <Banner tone="danger" message={saveError} /> : null}
      <FormSection title="Thông tin nhà cung cấp">
        <FormField label="Tên nhà cung cấp" required error={f.name?.message}>
          <Input {...reg('name')} aria-invalid={!!f.name} />
        </FormField>
        <FormField label="Loại NCC" error={f.typeId?.message}>
          <Controller control={form.control} name="typeId" render={({ field }) => <Select value={(field.value as string) || null} onValueChange={field.onChange} options={typeOptions} allowEmpty placeholder="Chọn loại" />} />
        </FormField>
        <FormField label="Mã số thuế" hint="Không bắt buộc" error={f.taxCode?.message}>
          <Input {...reg('taxCode')} />
        </FormField>
        <FormField label="Địa chỉ" error={f.address?.message}>
          <Input {...reg('address')} />
        </FormField>
      </FormSection>
      <FormSection title="Thanh toán">
        <FormField label="Ngân hàng" error={f.bankName?.message}>
          <Input {...reg('bankName')} />
        </FormField>
        <FormField label="Số tài khoản" error={f.bankAccountNo?.message}>
          <Input {...reg('bankAccountNo')} className="font-mono" />
        </FormField>
        <FormField label="Điều khoản thanh toán" className="sm:col-span-2" error={f.paymentTerms?.message}>
          <Input {...reg('paymentTerms')} placeholder="Công nợ 30 ngày" />
        </FormField>
      </FormSection>
      <section className="rounded-lg border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-heading-sm">Người liên hệ</h3>
        </div>
        <div className="p-4">
          <Controller
            control={form.control}
            name="contacts"
            render={({ field }) => (
              <LineItemsEditor<ContactInput>
                rows={(field.value as ContactInput[] | undefined) ?? []}
                onChange={field.onChange}
                newRow={emptyContact}
                addLabel="Thêm người liên hệ"
                emptyText="Chưa có người liên hệ"
                columns={[
                  { key: 'name', label: 'Họ tên', render: (r, _i, u) => <Input value={r.name ?? ''} onChange={(e) => u({ name: e.target.value })} /> },
                  { key: 'role', label: 'Chức vụ', width: 160, render: (r, _i, u) => <Input value={r.role ?? ''} onChange={(e) => u({ role: e.target.value })} /> },
                  { key: 'phone', label: 'SĐT', width: 160, render: (r, _i, u) => <Input value={r.phone ?? ''} inputMode="tel" onChange={(e) => u({ phone: e.target.value })} /> },
                  { key: 'email', label: 'Email', width: 220, render: (r, _i, u) => <Input value={r.email ?? ''} type="email" onChange={(e) => u({ email: e.target.value })} /> },
                ]}
              />
            )}
          />
        </div>
      </section>
      <FormSection title="Ghi chú">
        <FormField label="Ghi chú nội bộ" className="sm:col-span-2">
          <Textarea rows={3} {...reg('note')} />
        </FormField>
        {isEdit && s?.status === 'INACTIVE' ? (
          <FormField label="Trạng thái">
            <Switch checked={false} disabled label="Đang ngừng giao dịch — kích hoạt lại ở trang chi tiết" />
          </FormField>
        ) : null}
      </FormSection>
    </form>
  );
}
