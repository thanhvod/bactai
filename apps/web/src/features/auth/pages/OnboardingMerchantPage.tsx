import * as React from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client/react';
import { Button, Banner, FormField, Input, Textarea, toast } from '@bta/shadcn';
import { createMerchantSchema, type CreateMerchantInput } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { CREATE_MERCHANT, type MeMembership } from '../graphql/me';
import { apolloErrorMessage } from '@/lib/apollo';
import { AuthLayout } from './AuthLayout';

/** WM-AUTH-02 — tạo merchant self-service; user tạo thành ADMIN. */
export default function OnboardingMerchantPage() {
  const navigate = useNavigate();
  const { account, selectMerchant, logout } = useAuth();
  const [createMerchant, { loading }] = useMutation<{ createMerchant: MeMembership }>(CREATE_MERCHANT);
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<CreateMerchantInput>({
    resolver: zodResolver(createMerchantSchema),
    defaultValues: { name: '', legalName: '', taxCode: '', address: '', contactName: account?.name ?? '', phone: '', email: account?.email ?? '' },
  });
  const f = form.formState.errors;
  const submit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const res = await createMerchant({ variables: { input: values } });
      const m = res.data?.createMerchant;
      if (!m) throw new Error('Không nhận được dữ liệu nhà xe');
      await selectMerchant(m.merchantId);
      toast.success('Đã tạo nhà xe', m.merchantName);
      navigate(PATHS.dashboard, { replace: true });
    } catch (e) {
      setError(apolloErrorMessage(e));
    }
  });
  return (
    <AuthLayout title="Tạo nhà xe" subtitle="Thông tin doanh nghiệp dùng cho hồ sơ, phiếu in và bảng kê. Có thể sửa sau trong Cài đặt." width={560}>
      {error ? <Banner tone="danger" message={error} /> : null}
      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <FormField label="Tên nhà xe" required error={f.name?.message} htmlFor="name">
          <Input id="name" {...form.register('name')} aria-invalid={!!f.name} autoFocus />
        </FormField>
        <FormField label="Tên pháp lý (trên hóa đơn)" error={f.legalName?.message} htmlFor="legalName">
          <Input id="legalName" {...form.register('legalName')} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Mã số thuế" error={f.taxCode?.message} htmlFor="taxCode">
            <Input id="taxCode" {...form.register('taxCode')} />
          </FormField>
          <FormField label="Số điện thoại" error={f.phone?.message} htmlFor="phone">
            <Input id="phone" {...form.register('phone')} />
          </FormField>
        </div>
        <FormField label="Địa chỉ" error={f.address?.message} htmlFor="address">
          <Textarea id="address" rows={2} {...form.register('address')} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Người liên hệ" error={f.contactName?.message} htmlFor="contactName">
            <Input id="contactName" {...form.register('contactName')} />
          </FormField>
          <FormField label="Email liên hệ" error={f.email?.message} htmlFor="email">
            <Input id="email" type="email" {...form.register('email')} />
          </FormField>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => void logout().then(() => navigate(PATHS.login))}>
            Hủy và đăng xuất
          </Button>
          <Button type="submit" loading={loading}>
            Tạo nhà xe
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
