import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Banner, Button, Dialog, FormField, Input, toast } from '@bta/shadcn';
import { graphql } from '@/gql';
import { apolloErrorMessage } from '@/lib/apollo';

const MyAppLoginQuery = graphql(`
  query MyAppLogin {
    me {
      account {
        id
        phone
        hasAppPassword
      }
    }
  }
`);

const SetMyAppCredentialsMutation = graphql(`
  mutation SetMyAppCredentials($phone: String!, $newPassword: String!) {
    setMyAppCredentials(phone: $phone, newPassword: $newPassword) {
      account {
        id
        phone
        hasAppPassword
      }
    }
  }
`);

function normalizeVnMobile(input: string): string | null {
  let d = input.replace(/[^\d+]/g, '');
  if (d.startsWith('+84')) d = `0${d.slice(3)}`;
  if (d.startsWith('84') && d.length === 11) d = `0${d.slice(2)}`;
  return /^0[35789]\d{8}$/.test(d) ? d : null;
}

/** D-014 — nhân viên tự đặt SĐT + mật khẩu đăng nhập App Merchant (đang đăng nhập web bằng Google). */
export function MyAppPasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data } = useQuery(MyAppLoginQuery, { skip: !open, fetchPolicy: 'network-only' });
  const [save, { loading }] = useMutation(SetMyAppCredentialsMutation);
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const acc = data?.me.account;

  React.useEffect(() => {
    if (open) {
      setPassword('');
      setConfirm('');
      setErrors({});
    }
  }, [open]);
  React.useEffect(() => {
    if (open && acc) setPhone(acc.phone ?? '');
  }, [open, acc]);

  const submit = async () => {
    const next: Record<string, string> = {};
    const p = normalizeVnMobile(phone);
    if (!p) next.phone = 'Số điện thoại di động không hợp lệ';
    if (password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (confirm !== password) next.confirm = 'Mật khẩu nhập lại không khớp';
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await save({ variables: { phone: p!, newPassword: password } });
      toast.success('Đã lưu mật khẩu App Merchant', 'Các phiên app đang đăng nhập đã bị đăng xuất');
      onOpenChange(false);
    } catch (e) {
      setErrors({ form: apolloErrorMessage(e) });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Mật khẩu App Merchant"
      description="App Merchant đăng nhập bằng số điện thoại + mật khẩu. Web Merchant vẫn đăng nhập Google như cũ."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => void submit()} loading={loading}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {acc?.hasAppPassword ? <Banner tone="info" message="Bạn đã có mật khẩu app — lưu mới sẽ thay mật khẩu cũ." /> : null}
        {errors.form ? <Banner tone="danger" message={errors.form} /> : null}
        <FormField label="Số điện thoại đăng nhập" required error={errors.phone}>
          <Input value={phone} inputMode="tel" onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" />
        </FormField>
        <FormField label="Mật khẩu mới" required error={errors.password} hint="Tối thiểu 6 ký tự">
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        <FormField label="Nhập lại mật khẩu mới" required error={errors.confirm}>
          <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  );
}
