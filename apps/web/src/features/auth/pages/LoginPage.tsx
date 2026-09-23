import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button, Banner, FormField, Input, Select } from '@bta/shadcn';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { firebaseEnabled, signInWithGoogle } from '@/lib/firebase';
import { AUTH_DEV_BYPASS, session } from '@/lib/session';
import { apolloErrorMessage } from '@/lib/apollo';
import { AuthLayout } from './AuthLayout';

const SEED_EMAILS = ['admin@bta-demo.test', 'operation@bta-demo.test', 'accountant@bta-demo.test', 'admin@tenant-b.test'];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6C12.3 13.4 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.8 38 46.5 31.8 46.5 24.5z" />
      <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4-13.6-9.9l-7.8 6C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/** WM-AUTH-01 — chỉ Google login (D-006); khối đăng nhập dev khi VITE_AUTH_DEV_BYPASS=true. */
export default function LoginPage() {
  const { afterLogin, error: authError } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [loading, setLoading] = React.useState<'google' | 'dev' | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [devEmail, setDevEmail] = React.useState(SEED_EMAILS[0]);

  const finish = async () => {
    await afterLogin();
    navigate(loc.state?.from && loc.state.from !== PATHS.login ? loc.state.from : PATHS.dashboard, { replace: true });
  };

  const google = async () => {
    setError(null);
    setLoading('google');
    try {
      await signInWithGoogle();
      await finish();
    } catch (e) {
      setError(apolloErrorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  const dev = async () => {
    setError(null);
    setLoading('dev');
    try {
      session.setDevToken(devEmail.trim());
      await finish();
    } catch (e) {
      session.setDevToken(null);
      setError(apolloErrorMessage(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <AuthLayout title="Đăng nhập Web Merchant" subtitle="Dùng tài khoản Google đã được nhà xe cấp quyền.">
      {error || authError ? <Banner tone="danger" message={error ?? authError} /> : null}
      <Button size="lg" variant="secondary" onClick={google} loading={loading === 'google'} disabled={!firebaseEnabled || loading !== null} className="w-full">
        {loading !== 'google' ? <GoogleIcon /> : null} Đăng nhập bằng Google
      </Button>
      {!firebaseEnabled ? <p className="text-caption text-text-subtle">Chưa cấu hình VITE_FIREBASE_* trong apps/web/.env.</p> : null}
      {AUTH_DEV_BYPASS ? (
        <div className="flex flex-col gap-3 rounded-md border border-dashed border-warning/60 bg-warning-soft/40 p-3">
          <p className="text-body-sm font-semibold text-warning">Đăng nhập dev (chỉ môi trường phát triển)</p>
          <FormField label="Email seed" htmlFor="dev-email">
            <Select id="dev-email" value={devEmail} onValueChange={setDevEmail} options={SEED_EMAILS.map((e) => ({ value: e, label: e }))} />
          </FormField>
          <FormField label="Hoặc email khác" htmlFor="dev-email-custom">
            <Input id="dev-email-custom" value={devEmail} onChange={(e) => setDevEmail(e.target.value)} placeholder="email@…" />
          </FormField>
          <Button onClick={dev} loading={loading === 'dev'} disabled={loading !== null || !devEmail.includes('@')}>
            Vào bằng email này
          </Button>
        </div>
      ) : null}
    </AuthLayout>
  );
}
