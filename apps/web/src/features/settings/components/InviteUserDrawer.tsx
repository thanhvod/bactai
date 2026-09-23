import { zodFormResolver } from '../../../lib/form';
import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { Banner, Button, Drawer, FormField, Input, RadioGroup, Textarea, toast } from '@bta/shadcn';
import { MERCHANT_ROLE_LABEL, MERCHANT_ROLES, inviteUserSchema, type InviteUserInput } from '@bta/shared';
import { apolloErrorMessage } from '@/lib/apollo';
import { emptyToNull } from '@/lib/form';
import { InviteMerchantUserMutation } from '../graphql/settings';
import { ExtraPermissionsPicker } from './ExtraPermissionsPicker';

const ROLE_HINT: Record<string, string> = {
  ADMIN: 'Toàn quyền, duyệt bảng lương, quản lý cài đặt và nhân viên',
  OPERATION: 'Tạo đơn, điều phối, cập nhật trạng thái, chi phí vận hành',
  ACCOUNTANT: 'Thu chi, phân bổ, công nợ, bảng lương, báo cáo',
};

/** WM-USER-03 — Mời nhân viên (drawer trên WM-USER-01). */
export function InviteUserDrawer({ open, onOpenChange, onInvited }: { open: boolean; onOpenChange: (o: boolean) => void; onInvited: () => void }) {
  const [invite, { loading }] = useMutation(InviteMerchantUserMutation);
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<InviteUserInput>({ resolver: zodFormResolver<InviteUserInput>(inviteUserSchema), defaultValues: { email: '', name: '', phone: '', role: 'OPERATION', extraPermissions: [], note: '' } });
  const f = form.formState.errors;
  const role = form.watch('role');
  const submit = form.handleSubmit(async (v) => {
    setError(null);
    try {
      await invite({ variables: { input: { ...emptyToNull(v), email: v.email, name: v.name, role: v.role, extraPermissions: v.extraPermissions ?? [] } as never } });
      toast.success('Đã gửi lời mời', `${v.email} sẽ thấy lời mời khi đăng nhập Google bằng email này.`);
      form.reset();
      onInvited();
      onOpenChange(false);
    } catch (e) {
      setError(apolloErrorMessage(e));
    }
  });
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Mời nhân viên"
      description="Nhân viên đăng nhập bằng tài khoản Google đúng email này để chấp nhận lời mời."
      width={560}
      modalStrict={form.formState.isDirty}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => void submit()} loading={loading}>
            Gửi lời mời
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        {error ? <Banner tone="danger" message={error} /> : null}
        <FormField label="Email Google" required error={f.email?.message} htmlFor="inv-email">
          <Input id="inv-email" type="email" autoFocus {...form.register('email')} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Họ tên" required error={f.name?.message} htmlFor="inv-name">
            <Input id="inv-name" {...form.register('name')} />
          </FormField>
          <FormField label="Số điện thoại" error={f.phone?.message} htmlFor="inv-phone">
            <Input id="inv-phone" {...form.register('phone')} />
          </FormField>
        </div>
        <FormField label="Vai trò" required>
          <RadioGroup
            value={role}
            onValueChange={(v) => {
              form.setValue('role', v as InviteUserInput['role'], { shouldDirty: true });
              form.setValue('extraPermissions', []);
            }}
            options={MERCHANT_ROLES.map((r) => ({ value: r, label: MERCHANT_ROLE_LABEL[r], description: ROLE_HINT[r] }))}
          />
        </FormField>
        <FormField label="Quyền cấp thêm" hint="Chỉ cấp khi thật cần; thao tác nhạy cảm vẫn phải nhập lý do.">
          <ExtraPermissionsPicker role={role} value={form.watch('extraPermissions') ?? []} onChange={(v) => form.setValue('extraPermissions', v, { shouldDirty: true })} />
        </FormField>
        <FormField label="Ghi chú" htmlFor="inv-note">
          <Textarea id="inv-note" rows={2} {...form.register('note')} />
        </FormField>
      </form>
    </Drawer>
  );
}
