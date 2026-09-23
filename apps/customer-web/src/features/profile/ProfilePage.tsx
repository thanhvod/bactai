import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, DataTable, DetailSkeleton, ErrorState, FormField, Input, PageHeader, Switch, toast } from '@bta/shadcn';
import { CustomerMeQuery, UpdateCustomerProfileMutation } from '@/graphql/operations';
import { apolloErrorMessage } from '@/lib/apollo';
import { useAuth } from '@/app/auth/AuthProvider';
import { paths } from '@/app/routes';
import { InlineError, Panel } from '@/components/ui';

type Prefs = { booking: boolean; order: boolean; statement: boolean; sms: boolean };
const DEFAULT_PREFS: Prefs = { booking: true, order: true, statement: true, sms: false };

/** CW-PROFILE-01 — Hồ sơ khách hàng, tùy chọn nhận thông báo, liên kết nhà xe. SĐT là định danh đăng nhập OTP (D-013b), không sửa ở đây. */
export default function ProfilePage() {
  const { data, loading, error, refetch } = useQuery(CustomerMeQuery);
  const { updateAccount, logout } = useAuth();
  const navigate = useNavigate();
  const [save, saveState] = useMutation(UpdateCustomerProfileMutation);
  const [form, setForm] = React.useState({ fullName: '', email: '', companyName: '', taxCode: '', billingAddress: '', contactTitle: '' });
  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const a = data?.customerMe.account;
    if (!a) return;
    setForm({ fullName: a.fullName, email: a.email ?? '', companyName: a.companyName ?? '', taxCode: a.taxCode ?? '', billingAddress: a.billingAddress ?? '', contactTitle: a.contactTitle ?? '' });
    setPrefs({ ...DEFAULT_PREFS, ...((a.notificationPrefs as Partial<Prefs> | null) ?? {}) });
  }, [data]);

  if (loading && !data) return <DetailSkeleton />;
  if (error || !data) return <ErrorState error={error} onRetry={() => refetch()} />;
  const me = data.customerMe;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  const none = (v: string) => (v.trim() ? v.trim() : null);

  const submit = async (nextPrefs: Prefs = prefs) => {
    if (!form.fullName.trim()) return setFormError('Nhập họ tên');
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setFormError('Email không hợp lệ');
    setFormError(null);
    try {
      const r = await save({
        variables: {
          input: { fullName: form.fullName.trim(), email: none(form.email), companyName: none(form.companyName), taxCode: none(form.taxCode), billingAddress: none(form.billingAddress), contactTitle: none(form.contactTitle), notificationPrefs: nextPrefs },
        },
      });
      const a = r.data?.updateCustomerProfile.account;
      if (a) updateAccount({ fullName: a.fullName, email: a.email, companyName: a.companyName });
      toast.success('Đã lưu thay đổi');
    } catch (e) {
      setFormError(apolloErrorMessage(e));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hồ sơ của tôi"
        subtitle={me.account.phone}
        actions={
          <Button variant="secondary" asChild>
            <Link to={paths.addresses()}>Quản lý địa chỉ</Link>
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Panel title="Thông tin cá nhân / doanh nghiệp">
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <FormField label="Họ tên" required htmlFor="p-name">
                <Input id="p-name" value={form.fullName} onChange={set('fullName')} />
              </FormField>
              <FormField label="Chức danh" htmlFor="p-title">
                <Input id="p-title" value={form.contactTitle} onChange={set('contactTitle')} />
              </FormField>
              <FormField label="Số điện thoại" hint="Dùng để đăng nhập bằng mã OTP, không đổi được" htmlFor="p-phone">
                <Input id="p-phone" type="tel" value={me.account.phone} disabled />
              </FormField>
              <FormField label="Email" hint="Không bắt buộc — nhận thông tin từ nhà xe" htmlFor="p-email">
                <Input id="p-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
              </FormField>
              <FormField label="Tên công ty" htmlFor="p-company">
                <Input id="p-company" value={form.companyName} onChange={set('companyName')} />
              </FormField>
              <FormField label="Mã số thuế" htmlFor="p-tax">
                <Input id="p-tax" value={form.taxCode} onChange={set('taxCode')} />
              </FormField>
              <FormField label="Địa chỉ xuất hóa đơn" className="sm:col-span-2" htmlFor="p-billing">
                <Input id="p-billing" value={form.billingAddress} onChange={set('billingAddress')} />
              </FormField>
              <div className="sm:col-span-2">
                <InlineError>{formError}</InlineError>
              </div>
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" loading={saveState.loading}>
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </Panel>
          <Panel title="Nhà xe đã liên kết">
            <DataTable
              compact
              rowKey={(r) => r.merchantId}
              rows={me.merchantLinks}
              empty={<p className="p-3 text-body-sm text-text-muted">Chưa liên kết nhà xe nào. Khi nhà xe tạo đơn từ yêu cầu của bạn, tài khoản sẽ được liên kết để xem đơn và bảng kê.</p>}
              columns={[
                { key: 'm', label: 'Nhà xe', render: (r) => <Link className="text-accent hover:underline" to={paths.merchant(r.merchantId)}>{r.merchantName}</Link> },
                { key: 'c', label: 'Mã khách hàng', render: (r) => r.customerCode },
                { key: 't', label: 'Số ngày công nợ', align: 'right', render: (r) => (r.paymentTermDays != null ? `${r.paymentTermDays} ngày` : '—') },
                { key: 'o', label: 'Số đơn', align: 'right', render: (r) => r.orderCount },
              ]}
            />
          </Panel>
        </div>
        <aside className="space-y-5">
          <Panel title="Nhận thông báo">
            <div className="space-y-3">
              {(
                [
                  ['booking', 'Yêu cầu được tiếp nhận / phản hồi'],
                  ['order', 'Đơn hàng cập nhật'],
                  ['statement', 'Bảng kê mới'],
                  ['sms', 'Nhận thêm qua SMS (khi nhà xe hỗ trợ)'],
                ] as [keyof Prefs, string][]
              ).map(([k, label]) => (
                <Switch
                  key={k}
                  label={label}
                  checked={prefs[k]}
                  onCheckedChange={(c) => {
                    const next = { ...prefs, [k]: !!c };
                    setPrefs(next);
                    void submit(next);
                  }}
                />
              ))}
            </div>
          </Panel>
          <Button
            variant="destructive-outline"
            className="w-full"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            Đăng xuất
          </Button>
        </aside>
      </div>
    </div>
  );
}
