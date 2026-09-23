import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { Copy, KeyRound, Smartphone, SmartphoneNfc } from 'lucide-react';
import { Banner, Button, DescriptionList, Dialog, FormField, Input, StatusBadge, toast } from '@bta/shadcn';
import { formatDateTime } from '@bta/shared';
import { apolloErrorMessage } from '@/lib/apollo';
import { DisableMerchantUserAppLoginMutation, ResetMerchantUserAppPasswordMutation } from '../graphql/settings';

export interface StaffAppLogin {
  phone?: string | null;
  hasPassword: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: string | null;
  sharedWithOtherMerchants: boolean;
}

const APP_LOGIN_STATUS = {
  NONE: { label: 'Chưa có mật khẩu app', tone: 'neutral' },
  MUST_CHANGE: { label: 'Chờ đổi mật khẩu tạm', tone: 'warning' },
  ACTIVE: { label: 'Đang dùng app', tone: 'success' },
} as const;

export function normalizeVnMobile(input: string): string | null {
  let d = input.replace(/[^\d+]/g, '');
  if (d.startsWith('+84')) d = `0${d.slice(3)}`;
  if (d.startsWith('84') && d.length === 11) d = `0${d.slice(2)}`;
  return /^0[35789]\d{8}$/.test(d) ? d : null;
}

/**
 * WM-USER-02 — khối "Đăng nhập App Merchant" (D-014): SĐT + mật khẩu. Admin cấp/đặt lại mật khẩu tạm (hiện 1 lần)
 * hoặc tắt đăng nhập app. Tài khoản thuộc cả nhà xe khác → nhân viên tự đặt trong menu tài khoản (chống chiếm tài khoản).
 */
export function StaffAppLoginSection({ userId, userName, defaultPhone, appLogin, onChanged }: { userId: string; userName: string; defaultPhone?: string | null; appLogin: StaffAppLogin; onChanged: () => void }) {
  const [reset, { loading: resetting }] = useMutation(ResetMerchantUserAppPasswordMutation);
  const [disable, { loading: disabling }] = useMutation(DisableMerchantUserAppLoginMutation);
  const [phoneOpen, setPhoneOpen] = React.useState(false);
  const [confirmDisable, setConfirmDisable] = React.useState(false);
  const [phone, setPhone] = React.useState('');
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [creds, setCreds] = React.useState<{ phone: string; tempPassword: string } | null>(null);
  const status = !appLogin.hasPassword ? 'NONE' : appLogin.mustChangePassword ? 'MUST_CHANGE' : 'ACTIVE';
  const locked = appLogin.sharedWithOtherMerchants;

  const openReset = () => {
    setPhone(appLogin.phone ?? defaultPhone ?? '');
    setPhoneError(null);
    setPhoneOpen(true);
  };

  const submitReset = async () => {
    const p = normalizeVnMobile(phone);
    if (!p) {
      setPhoneError('Nhập số điện thoại di động hợp lệ của nhân viên');
      return;
    }
    try {
      const res = await reset({ variables: { id: userId, phone: p } });
      setPhoneOpen(false);
      setCreds(res.data!.resetMerchantUserAppPassword);
      onChanged();
    } catch (e) {
      setPhoneError(apolloErrorMessage(e));
    }
  };

  const submitDisable = async () => {
    try {
      await disable({ variables: { id: userId } });
      toast.success('Đã tắt đăng nhập App Merchant');
      setConfirmDisable(false);
      onChanged();
    } catch (e) {
      toast.error('Không thực hiện được', apolloErrorMessage(e));
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5" aria-labelledby="app-login-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="app-login-title" className="flex items-center gap-2 text-heading-sm">
          <Smartphone className="size-4" /> Đăng nhập App Merchant
        </h2>
        <StatusBadge meta={APP_LOGIN_STATUS} status={status} />
      </div>
      <DescriptionList
        columns={2}
        items={[
          { label: 'Số điện thoại đăng nhập', value: appLogin.phone ? <span className="font-mono">{appLogin.phone}</span> : '—' },
          { label: 'Đăng nhập app gần nhất', value: appLogin.lastLoginAt ? formatDateTime(appLogin.lastLoginAt) : '—' },
        ]}
      />
      {locked ? (
        <Banner tone="info" message="Tài khoản này thuộc cả nhà xe khác — nhân viên tự đặt mật khẩu app trong menu tài khoản (góc trên bên phải) trên Web Merchant." />
      ) : (
        <p className="text-body-sm text-text-muted">App Merchant đăng nhập bằng số điện thoại + mật khẩu. Mật khẩu tạm chỉ hiện một lần; nhân viên đổi mật khẩu khi đăng nhập lần đầu.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={openReset} disabled={locked} loading={resetting}>
          <KeyRound /> {appLogin.hasPassword ? 'Đặt lại mật khẩu app' : 'Cấp mật khẩu app'}
        </Button>
        {appLogin.hasPassword ? (
          <Button variant="ghost" onClick={() => setConfirmDisable(true)} disabled={locked}>
            <SmartphoneNfc /> Tắt đăng nhập app
          </Button>
        ) : null}
      </div>

      <Dialog
        open={phoneOpen}
        onOpenChange={setPhoneOpen}
        title={appLogin.hasPassword ? 'Đặt lại mật khẩu App Merchant' : 'Cấp mật khẩu App Merchant'}
        description={`${userName} — mật khẩu cũ (nếu có) hết hiệu lực, các phiên app đang đăng nhập bị đăng xuất.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPhoneOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => void submitReset()} loading={resetting}>
              Tạo mật khẩu tạm
            </Button>
          </>
        }
      >
        <FormField label="Số điện thoại đăng nhập" required error={phoneError} hint="SĐT di động của nhân viên, dùng để đăng nhập app">
          <Input value={phone} inputMode="tel" onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" />
        </FormField>
      </Dialog>

      <Dialog
        open={!!creds}
        onOpenChange={(o) => !o && setCreds(null)}
        title={
          <span className="flex items-center gap-2">
            <KeyRound className="size-4" /> Tài khoản App Merchant
          </span>
        }
        description={userName}
        modalStrict
        footer={<CredentialsFooter creds={creds} onClose={() => setCreds(null)} />}
      >
        {creds ? (
          <div className="flex flex-col gap-4">
            <Banner tone="warning" message="Mật khẩu tạm chỉ hiển thị một lần. Gửi cho nhân viên qua kênh riêng; nếu quên phải đặt lại." />
            <DescriptionList
              columns={2}
              items={[
                { label: 'Số điện thoại đăng nhập', value: <span className="font-mono text-heading-sm">{creds.phone}</span> },
                { label: 'Mật khẩu tạm', value: <span className="select-all font-mono text-heading-sm tracking-wider">{creds.tempPassword}</span> },
              ]}
            />
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={confirmDisable}
        onOpenChange={setConfirmDisable}
        title="Tắt đăng nhập App Merchant?"
        description="Mật khẩu app bị xóa và các phiên app bị đăng xuất. Đăng nhập Web Merchant (Google) không đổi."
        danger
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDisable(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => void submitDisable()} loading={disabling}>
              Tắt đăng nhập app
            </Button>
          </>
        }
      />
    </section>
  );
}

function CredentialsFooter({ creds, onClose }: { creds: { phone: string; tempPassword: string } | null; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => setCopied(false), [creds]);
  const copy = async () => {
    if (!creds) return;
    try {
      await navigator.clipboard.writeText(`Tài khoản App BTA Nhà xe\nSĐT: ${creds.phone}\nMật khẩu tạm: ${creds.tempPassword}\n(Đăng nhập lần đầu sẽ được yêu cầu đổi mật khẩu)`);
      setCopied(true);
      toast.success('Đã sao chép thông tin đăng nhập');
    } catch {
      toast.error('Không sao chép được', 'Hãy chép tay mật khẩu bên dưới');
    }
  };
  return (
    <>
      <Button variant="secondary" onClick={() => void copy()}>
        <Copy /> {copied ? 'Đã sao chép' : 'Sao chép'}
      </Button>
      <Button onClick={onClose}>Tôi đã lưu mật khẩu</Button>
    </>
  );
}
