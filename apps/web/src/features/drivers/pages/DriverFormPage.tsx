import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { Banner, Button, DateField, DetailSkeleton, ErrorState, FormField, FormSection, Input, MoneyInput, NoPermissionState, PageHeader, RadioGroup, Switch, Textarea, toast } from '@bta/shadcn';
import { driverSchema, formatVnd, isoDate } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage, apolloValidation } from '@/lib/apollo';
import { emptyToNull } from '@/lib/form';
import { dateInput } from '@/features/master-data/helpers';
import { AccountCredentialsDialog, type Credentials } from '../components/AccountCredentialsDialog';
import { CreateDriverMutation, DriverDetailQuery, UpdateDriverMutation } from '../graphql/drivers';

const formSchema = z.preprocess((v) => emptyToNull((v ?? {}) as Record<string, unknown>), driverSchema);
type FormValues = z.input<typeof driverSchema>;

/** WM-DRV-03 — Tạo/sửa tài xế. Lương cố định chỉ nhập khi tạo; đổi lương qua lịch sử lương (WM-DRV-04). */
export default function DriverFormPage() {
  const { driverId } = useParams();
  const { hasPermission } = useAuth();
  if (!hasPermission('driver.edit')) return <NoPermissionState message="Bạn không có quyền tạo/sửa tài xế" />;
  return <DriverForm driverId={driverId} />;
}

function DriverForm({ driverId }: { driverId?: string }) {
  const navigate = useNavigate();
  const isEdit = !!driverId;
  const { data, loading, error, refetch } = useQuery(DriverDetailQuery, { variables: { id: driverId ?? '' }, skip: !isEdit });
  const [create, { loading: creating }] = useMutation(CreateDriverMutation);
  const [update, { loading: updating }] = useMutation(UpdateDriverMutation);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [credentials, setCredentials] = React.useState<{ id: string; cred: Credentials } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as never),
    defaultValues: { name: '', phone: '', status: 'ACTIVE', appLoginEnabled: true, salaryEffectiveFrom: isoDate(new Date()), fixedSalary: null },
  });
  const d = data?.driver;
  React.useEffect(() => {
    if (!d) return;
    form.reset({
      name: d.name,
      phone: d.phone,
      dob: dateInput(d.dob),
      idNumber: d.idNumber ?? '',
      address: d.address ?? '',
      emergencyContact: d.emergencyContact ?? '',
      licenseClass: d.licenseClass ?? '',
      licenseNumber: d.licenseNumber ?? '',
      licenseExpiresAt: dateInput(d.licenseExpiresAt),
      status: d.status as 'ACTIVE' | 'INACTIVE',
      note: d.note ?? '',
    });
  }, [d, form]);

  const submit = form.handleSubmit(async (values) => {
    setSaveError(null);
    const v = values as Record<string, unknown>;
    try {
      if (isEdit) {
        const { fixedSalary: _f, salaryEffectiveFrom: _s, salaryReason: _r, appLoginEnabled: _a, status: _st, ...rest } = v;
        await update({ variables: { id: driverId!, input: rest as never } });
        toast.success('Đã lưu hồ sơ tài xế');
        navigate(paths.driver(driverId!));
      } else {
        const res = await create({ variables: { input: v as never } });
        const c = res.data?.createDriver;
        if (!c) return;
        toast.success(`Đã tạo tài xế ${c.code}`);
        if (c.issuedTempPassword) setCredentials({ id: c.id, cred: { phone: c.phone, tempPassword: c.issuedTempPassword } });
        else navigate(paths.driver(c.id));
      }
    } catch (e) {
      const issues = apolloValidation(e);
      issues.forEach((i) => form.setError(i.field as keyof FormValues, { message: i.message }));
      setSaveError(apolloErrorMessage(e));
    }
  });

  if (isEdit && error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (isEdit && loading && !d) return <DetailSkeleton />;
  const f = form.formState.errors;
  const reg = (name: keyof FormValues) => form.register(name as never);
  const back = () => navigate(isEdit ? paths.driver(driverId!) : PATHS.drivers);

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <PageHeader
        title={isEdit ? `Sửa tài xế ${d?.code ?? ''}` : 'Thêm tài xế'}
        breadcrumb={[{ label: 'Tài xế', to: PATHS.drivers }, ...(isEdit && d ? [{ label: d.name, to: paths.driver(d.id) }] : []), { label: isEdit ? 'Sửa' : 'Thêm mới' }]}
        actions={
          <>
            <Button type="button" variant="secondary" onClick={back}>
              Hủy
            </Button>
            <Button type="submit" loading={creating || updating}>
              Lưu tài xế
            </Button>
          </>
        }
      />
      {saveError ? <Banner tone="danger" message={saveError} /> : null}
      <FormSection title="Thông tin cá nhân">
        <FormField label="Họ tên" required error={f.name?.message}>
          <Input {...reg('name')} aria-invalid={!!f.name} placeholder="Nguyễn Văn A" />
        </FormField>
        <FormField label="Số điện thoại" required hint="Dùng làm tên đăng nhập app tài xế" error={f.phone?.message}>
          <Input {...reg('phone')} aria-invalid={!!f.phone} inputMode="tel" placeholder="09xx xxx xxx" />
        </FormField>
        <FormField label="Ngày sinh" error={f.dob?.message}>
          <Controller control={form.control} name="dob" render={({ field }) => <DateField value={(field.value as string) ?? ''} onChange={field.onChange} />} />
        </FormField>
        <FormField label="Số CCCD" error={f.idNumber?.message}>
          <Input {...reg('idNumber')} />
        </FormField>
        <FormField label="Địa chỉ" className="sm:col-span-2" error={f.address?.message}>
          <Input {...reg('address')} />
        </FormField>
        <FormField label="Liên hệ khẩn cấp" className="sm:col-span-2" hint="Tên, quan hệ, SĐT người thân">
          <Input {...reg('emergencyContact')} />
        </FormField>
      </FormSection>
      <FormSection title="Giấy phép lái xe">
        <FormField label="Hạng GPLX" error={f.licenseClass?.message}>
          <Input {...reg('licenseClass')} placeholder="C, FC..." />
        </FormField>
        <FormField label="Số GPLX" error={f.licenseNumber?.message}>
          <Input {...reg('licenseNumber')} />
        </FormField>
        <FormField label="Ngày hết hạn GPLX" error={f.licenseExpiresAt?.message}>
          <Controller control={form.control} name="licenseExpiresAt" render={({ field }) => <DateField value={(field.value as string) ?? ''} onChange={field.onChange} />} />
        </FormField>
      </FormSection>
      {isEdit ? (
        <FormSection title="Lương cố định" description="Đổi lương bằng cách thêm mốc lương mới có ngày hiệu lực để kỳ cũ tính đúng.">
          <FormField label="Lương hiện hành">
            <span className="text-heading-sm tabular-nums">{d?.fixedSalary != null ? formatVnd(d.fixedSalary) : '—'}</span>
          </FormField>
          <div className="flex items-end">
            <Button type="button" variant="secondary" onClick={() => navigate(paths.driverSalaryHistory(driverId!))}>
              Mở lịch sử lương cố định
            </Button>
          </div>
        </FormSection>
      ) : (
        <FormSection title="Lương cố định & tài khoản app">
          <FormField label="Lương cố định / tháng" error={f.fixedSalary?.message}>
            <Controller control={form.control} name="fixedSalary" render={({ field }) => <MoneyInput value={(field.value as number | null) ?? null} onChange={field.onChange} />} />
          </FormField>
          <FormField label="Hiệu lực từ ngày" error={f.salaryEffectiveFrom?.message}>
            <Controller control={form.control} name="salaryEffectiveFrom" render={({ field }) => <DateField value={(field.value as string) ?? ''} onChange={field.onChange} />} />
          </FormField>
          <FormField label="Ghi chú mức lương" className="sm:col-span-2">
            <Input {...reg('salaryReason')} placeholder="Lương khởi điểm" />
          </FormField>
          <FormField label="Tài khoản app tài xế" className="sm:col-span-2" hint="Tạo tài khoản đăng nhập bằng SĐT + mật khẩu tạm (hiện 1 lần sau khi lưu)">
            <Controller control={form.control} name="appLoginEnabled" render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} label="Tạo tài khoản app ngay" />} />
          </FormField>
        </FormSection>
      )}
      <FormSection title="Khác">
        {!isEdit ? (
          <FormField label="Trạng thái">
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <RadioGroup
                  value={(field.value as string) ?? 'ACTIVE'}
                  onValueChange={field.onChange}
                  options={[
                    { value: 'ACTIVE', label: 'Đang hoạt động' },
                    { value: 'INACTIVE', label: 'Ngừng hoạt động' },
                  ]}
                />
              )}
            />
          </FormField>
        ) : null}
        <FormField label="Ghi chú nội bộ" className="sm:col-span-2">
          <Textarea rows={3} {...reg('note')} />
        </FormField>
      </FormSection>
      <AccountCredentialsDialog
        credentials={credentials?.cred ?? null}
        driverName={form.getValues('name') as string}
        onClose={() => {
          const id = credentials?.id;
          setCredentials(null);
          if (id) navigate(paths.driver(id));
        }}
      />
    </form>
  );
}
