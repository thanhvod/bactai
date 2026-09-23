import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { Button, FormField, Input, Logo, toast } from '@bta/shadcn';
import { useAuth } from '@/app/auth/AuthProvider';
import { UpdateCustomerProfileMutation } from '@/graphql/operations';
import { apolloErrorMessage } from '@/lib/apollo';
import { authApi, ApiError } from '@/lib/auth-api';
import { InlineError } from '@/components/ui';
import { formatPhone, isValidPhone, normalizePhone, sanitizeOtp, useCountdown } from './otp';

type Step = 'phone' | 'code' | 'profile';

/** Chỉ cho quay về đường dẫn nội bộ (tránh open redirect). */
function safeReturn(url: string | null): string {
  return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
}

/**
 * CW-AUTH-01 — D-013b: đăng nhập/đăng ký bằng SĐT + OTP SMS (không mật khẩu).
 * Bước 1 nhập SĐT → bước 2 nhập mã 6 số (tự gửi khi đủ) → bước 3 bổ sung họ tên nếu tài khoản mới.
 */
export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, verifyOtp, updateAccount } = useAuth();
  const returnUrl = safeReturn(params.get('returnUrl'));
  const [step, setStep] = React.useState<Step>('phone');
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [profile, setProfile] = React.useState({ fullName: '', companyName: '' });
  const countdown = useCountdown();
  const codeRef = React.useRef<HTMLInputElement>(null);
  const [saveProfile, saveState] = useMutation(UpdateCustomerProfileMutation);

  React.useEffect(() => {
    if (isAuthenticated && step !== 'profile') navigate(returnUrl, { replace: true });
  }, [isAuthenticated, navigate, returnUrl, step]);

  React.useEffect(() => {
    if (step === 'code') codeRef.current?.focus();
  }, [step]);

  const sendCode = async () => {
    if (!isValidPhone(phone)) return setError('Nhập số điện thoại di động 10 số (vd. 0912 345 678)');
    setError(null);
    setBusy(true);
    try {
      const r = await authApi.requestOtp(normalizePhone(phone));
      setDevCode(import.meta.env.DEV ? r.devCode ?? null : null);
      countdown.start(r.resendAfter);
      setCode('');
      setStep('code');
    } catch (e) {
      const wait = e instanceof ApiError ? Number(e.details?.resendAfter ?? 0) : 0;
      if (wait > 0) {
        countdown.start(wait);
        setStep('code');
      }
      setError(e instanceof ApiError ? e.message : 'Không gửi được mã, vui lòng thử lại');
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (value: string) => {
    if (value.length !== 6 || busy) return;
    setError(null);
    setBusy(true);
    try {
      const p = await verifyOtp({ phone: normalizePhone(phone), code: value });
      if (p.profileIncomplete) setStep('profile');
      else navigate(returnUrl, { replace: true });
    } catch (e) {
      setCode('');
      setError(e instanceof ApiError ? e.message : 'Không xác thực được, vui lòng thử lại');
    } finally {
      setBusy(false);
    }
  };

  const submitProfile = async () => {
    if (!profile.fullName.trim()) return setError('Nhập họ tên');
    setError(null);
    try {
      const r = await saveProfile({ variables: { input: { fullName: profile.fullName.trim(), companyName: profile.companyName.trim() || null } } });
      const a = r.data?.updateCustomerProfile.account;
      if (a) updateAccount({ fullName: a.fullName, companyName: a.companyName });
      toast.success('Đã tạo tài khoản');
      navigate(returnUrl, { replace: true });
    } catch (e) {
      setError(apolloErrorMessage(e));
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[440px] space-y-6">
        <Link to="/" className="inline-block" aria-label="Về trang tìm nhà xe">
          <Logo />
        </Link>
        <div className="rounded-lg border border-border bg-surface p-6">
          {step === 'phone' ? (
            <form
              className="space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void sendCode();
              }}
            >
              <div>
                <h1 className="mb-1 text-heading-lg font-semibold text-text">Đăng nhập / Đăng ký</h1>
                <p className="text-body-sm text-text-muted">Nhập số điện thoại để nhận mã xác thực qua SMS. Số mới sẽ tự tạo tài khoản.</p>
              </div>
              <FormField label="Số điện thoại" required htmlFor="phone">
                <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" autoFocus placeholder="0912 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={busy} />
              </FormField>
              <InlineError>{error}</InlineError>
              <Button type="submit" className="w-full" loading={busy}>
                Gửi mã xác thực
              </Button>
              <p className="text-caption text-text-subtle">
                Nếu nhà xe đã có hồ sơ khách hàng với cùng số điện thoại, tài khoản sẽ tự liên kết để bạn xem đơn và bảng kê.
              </p>
            </form>
          ) : step === 'code' ? (
            <form
              className="space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void submitCode(code);
              }}
            >
              <div>
                <h1 className="mb-1 text-heading-lg font-semibold text-text">Nhập mã xác thực</h1>
                <p className="text-body-sm text-text-muted">
                  Mã 6 số đã gửi tới <span className="font-semibold text-text">{formatPhone(phone)}</span>. Mã có hiệu lực 5 phút.
                </p>
              </div>
              <FormField label="Mã xác thực" required htmlFor="otp">
                <Input
                  id="otp"
                  ref={codeRef}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="text-center font-mono text-heading-md tracking-[0.5em]"
                  value={code}
                  disabled={busy}
                  onChange={(e) => {
                    const v = sanitizeOtp(e.target.value);
                    setCode(v);
                    if (v.length === 6) void submitCode(v);
                  }}
                />
              </FormField>
              {devCode ? <p className="text-caption text-warning">Mã dev: {devCode}</p> : null}
              <InlineError>{error}</InlineError>
              <Button type="submit" className="w-full" loading={busy} disabled={code.length !== 6}>
                Xác nhận
              </Button>
              <div className="flex items-center justify-between text-body-sm">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setStep('phone');
                    setError(null);
                    setDevCode(null);
                  }}
                >
                  Đổi số điện thoại
                </Button>
                {countdown.left > 0 ? (
                  <span className="text-text-muted">Gửi lại sau {countdown.left}s</span>
                ) : (
                  <Button type="button" variant="link" disabled={busy} onClick={() => void sendCode()}>
                    Gửi lại mã
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <form
              className="space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void submitProfile();
              }}
            >
              <div>
                <h1 className="mb-1 text-heading-lg font-semibold text-text">Hoàn tất tài khoản</h1>
                <p className="text-body-sm text-text-muted">Cho nhà xe biết bạn là ai khi gửi yêu cầu vận chuyển.</p>
              </div>
              <FormField label="Họ tên" required htmlFor="fullName">
                <Input id="fullName" autoComplete="name" autoFocus value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
              </FormField>
              <FormField label="Tên công ty" hint="Nếu đặt xe cho doanh nghiệp" htmlFor="companyName">
                <Input id="companyName" autoComplete="organization" value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} />
              </FormField>
              <InlineError>{error}</InlineError>
              <Button type="submit" className="w-full" loading={saveState.loading}>
                Tiếp tục
              </Button>
            </form>
          )}
        </div>
        <p className="text-center text-body-sm text-text-muted">
          <Link to="/" className="text-accent hover:underline">
            Xem danh sách nhà xe không cần đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
