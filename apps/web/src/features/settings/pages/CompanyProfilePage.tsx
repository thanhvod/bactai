import { zodFormResolver } from '../../../lib/form';
import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { History, ImagePlus, Trash2 } from 'lucide-react';
import { Banner, Button, DetailSkeleton, ErrorState, FormField, FormSection, Input, PageHeader, Switch, Textarea, toast } from '@bta/shadcn';
import { formatDateTime, merchantProfileSchema } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { emptyToNull } from '@/lib/form';
import { useUpload } from '@/lib/upload';
import { TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { MerchantProfileQuery, UpdateMerchantProfileMutation } from '../graphql/settings';

const schema = merchantProfileSchema.extend({
  name: z.string().trim().min(2, 'Nhập tên nhà xe'),
  taxCode: z
    .string()
    .trim()
    .regex(/^(\d{10}|\d{10}-\d{3}|\d{13})?$/, 'MST gồm 10 hoặc 13 số')
    .optional()
    .nullable(),
  serviceAreasText: z.string().optional(),
  servicesText: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const splitList = (s?: string) => (s ?? '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

/** WM-ORG-01 — Hồ sơ nhà xe. Chỉ Admin (settings.manage) được sửa; vai trò khác xem read-only. */
export default function CompanyProfilePage() {
  const { hasPermission, current } = useAuth();
  const canEdit = hasPermission('settings.manage');
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(MerchantProfileQuery);
  const [save, { loading: saving }] = useMutation(UpdateMerchantProfileMutation);
  const { upload, uploading } = useUpload();
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const p = data?.merchantProfile;
  const form = useForm<FormValues>({ resolver: zodFormResolver<FormValues>(schema) });
  React.useEffect(() => {
    if (!p) return;
    form.reset({
      name: p.name,
      legalName: p.legalName ?? '',
      taxCode: p.taxCode ?? '',
      businessType: p.businessType ?? '',
      address: p.address ?? '',
      province: p.province ?? '',
      district: p.district ?? '',
      yardName: p.yardName ?? '',
      representativeName: p.representativeName ?? '',
      representativeTitle: p.representativeTitle ?? '',
      contactName: p.contactName ?? '',
      phone: p.phone ?? '',
      dispatchHotline: p.dispatchHotline ?? '',
      email: p.email ?? '',
      intro: p.intro ?? '',
      publicProfile: p.publicProfile,
      serviceAreasText: p.serviceAreas.join(', '),
      servicesText: p.services.join(', '),
    });
  }, [p, form]);

  const toInput = (v: FormValues, logoAttachmentId?: string | null) => {
    const { serviceAreasText, servicesText, ...rest } = v;
    return {
      ...(emptyToNull(rest as Record<string, unknown>) as Record<string, unknown>),
      name: v.name,
      publicProfile: !!v.publicProfile,
      serviceAreas: splitList(serviceAreasText),
      services: splitList(servicesText),
      ...(logoAttachmentId !== undefined ? { logoAttachmentId } : { logoAttachmentId: p?.logoAttachmentId ?? null }),
    };
  };

  const submit = form.handleSubmit(async (v) => {
    setSaveError(null);
    try {
      await save({ variables: { input: toInput(v) as never } });
      toast.success('Đã lưu hồ sơ nhà xe');
      form.reset(v);
      void refetch();
    } catch (e) {
      setSaveError(apolloErrorMessage(e));
    }
  });

  const onLogo = async (file: File | undefined) => {
    if (!file || !current) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) return toast.error('Logo phải là PNG hoặc JPG');
    if (file.size > 2 * 1024 * 1024) return toast.error('Logo tối đa 2 MB');
    try {
      const att = await upload(file, { entityType: 'MERCHANT', entityId: current.merchantId, category: 'LOGO' });
      await save({ variables: { input: toInput(form.getValues(), att.id) as never } });
      toast.success('Đã cập nhật logo');
      void refetch();
    } catch (e) {
      toast.error('Không tải được logo', apolloErrorMessage(e));
    }
  };

  const removeLogo = async () => {
    try {
      await save({ variables: { input: toInput(form.getValues(), null) as never } });
      toast.success('Đã xóa logo');
      void refetch();
    } catch (e) {
      toast.error('Không xóa được logo', apolloErrorMessage(e));
    }
  };

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (loading && !p) return <DetailSkeleton />;
  if (!p) return null;
  const f = form.formState.errors;
  const ro = !canEdit;
  const field = (name: keyof FormValues, label: string, opts: { required?: boolean; type?: string; placeholder?: string } = {}) => (
    <FormField label={label} required={opts.required} error={f[name]?.message as string | undefined} htmlFor={name}>
      <Input id={name} type={opts.type} placeholder={opts.placeholder} readOnly={ro} {...form.register(name)} aria-invalid={!!f[name]} />
    </FormField>
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Hồ sơ nhà xe"
        subtitle="Thông tin doanh nghiệp in trên chứng từ, bảng kê và hiển thị ở trang khám phá cho khách."
        breadcrumb={[{ label: 'Cài đặt', to: PATHS.settingsCompany }, { label: 'Hồ sơ nhà xe' }]}
        actions={
          <>
            {canEdit ? (
              <Button variant="secondary" onClick={openTimeline}>
                <History /> Lịch sử
              </Button>
            ) : null}
            {canEdit ? (
              <Button onClick={() => void submit()} loading={saving} disabled={!form.formState.isDirty}>
                Lưu thay đổi
              </Button>
            ) : null}
          </>
        }
      />
      {ro ? <Banner tone="info" message="Chỉ Admin được sửa hồ sơ nhà xe." /> : null}
      {saveError ? <Banner tone="danger" message={`Không lưu được hồ sơ: ${saveError}`} /> : null}
      <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[1fr_320px]" noValidate>
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
          <FormSection title="Doanh nghiệp">
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Mã nhà xe" hint="Do hệ thống cấp, không sửa">
                <Input value={p.code} readOnly disabled />
              </FormField>
              {field('name', 'Tên hiển thị', { required: true })}
              {field('legalName', 'Tên pháp lý')}
              {field('taxCode', 'Mã số thuế')}
              {field('businessType', 'Loại hình kinh doanh', { placeholder: 'Vận tải hàng hóa đường bộ' })}
              {field('yardName', 'Tên bãi xe')}
            </div>
          </FormSection>
          <FormSection title="Địa chỉ">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-3">{field('address', 'Địa chỉ', { required: true })}</div>
              {field('province', 'Tỉnh/Thành phố', { required: true })}
              {field('district', 'Quận/Huyện')}
            </div>
          </FormSection>
          <FormSection title="Người đại diện & liên hệ">
            <div className="grid gap-3 md:grid-cols-2">
              {field('representativeName', 'Người đại diện', { required: true })}
              {field('representativeTitle', 'Chức vụ')}
              {field('contactName', 'Người liên hệ')}
              {field('phone', 'Số điện thoại', { required: true })}
              {field('dispatchHotline', 'Hotline điều phối')}
              {field('email', 'Email', { type: 'email' })}
            </div>
          </FormSection>
          <FormSection title="Hồ sơ công khai" description="Hiển thị ở Web Khách hàng để khách tìm và gửi yêu cầu vận chuyển.">
            <div className="flex flex-col gap-3">
              <Switch
                label="Hiển thị nhà xe trên trang khám phá"
                checked={!!form.watch('publicProfile')}
                disabled={ro}
                onCheckedChange={(c) => form.setValue('publicProfile', c, { shouldDirty: true })}
              />
              <FormField label="Giới thiệu" htmlFor="intro">
                <Textarea id="intro" rows={3} readOnly={ro} {...form.register('intro')} />
              </FormField>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Khu vực phục vụ" hint="Cách nhau bằng dấu phẩy" htmlFor="serviceAreasText">
                  <Input id="serviceAreasText" readOnly={ro} {...form.register('serviceAreasText')} />
                </FormField>
                <FormField label="Dịch vụ" hint="Cách nhau bằng dấu phẩy" htmlFor="servicesText">
                  <Input id="servicesText" readOnly={ro} {...form.register('servicesText')} />
                </FormField>
              </div>
            </div>
          </FormSection>
        </div>
        <aside className="flex flex-col gap-3 self-start rounded-lg border border-border bg-surface p-5">
          <h2 className="text-heading-sm">Logo</h2>
          <div className="flex size-32 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted">
            {p.logoUrl ? <img src={p.logoUrl} alt="Logo nhà xe" className="size-full object-contain" /> : <span className="text-caption text-text-subtle">Chưa có logo</span>}
          </div>
          <p className="text-caption text-text-muted">PNG/JPG ≤ 2 MB, nên dùng ảnh vuông. Logo in ở đầu phiếu giao hàng, bảng kê.</p>
          {canEdit ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" type="button" loading={uploading} onClick={() => document.getElementById('logo-file')?.click()}>
                <ImagePlus /> {p.logoUrl ? 'Đổi logo' : 'Tải logo'}
              </Button>
              {p.logoUrl ? (
                <Button variant="ghost" size="sm" type="button" onClick={() => void removeLogo()}>
                  <Trash2 /> Xóa
                </Button>
              ) : null}
              <input id="logo-file" type="file" accept="image/png,image/jpeg" hidden onChange={(e) => void onLogo(e.target.files?.[0])} />
            </div>
          ) : null}
          <p className="text-caption text-text-subtle">Cập nhật lần cuối {formatDateTime(p.updatedAt)}</p>
        </aside>
      </form>
      {current ? <TimelineDrawer entity={{ type: 'MERCHANT', id: current.merchantId, label: p.name }} /> : null}
    </div>
  );
}
