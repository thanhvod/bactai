import * as React from 'react';
import { useApolloClient } from '@apollo/client/react';
import { authApi } from '@/lib/auth-api';
import { authEvents } from '@/lib/apollo';
import { session, type AuthPayload, type CustomerAccountInfo, type OtpVerifyPayload } from '@/lib/session';

interface AuthContextValue {
  account: CustomerAccountInfo | null;
  isAuthenticated: boolean;
  /** Xác thực OTP; trả về payload để UI biết có cần bổ sung hồ sơ (profileIncomplete). */
  verifyOtp: (input: Parameters<typeof authApi.verifyOtp>[0]) => Promise<OtpVerifyPayload>;
  logout: () => Promise<void>;
  updateAccount: (a: Partial<CustomerAccountInfo>) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const [account, setAccount] = React.useState<CustomerAccountInfo | null>(() => (session.getAccess() ? session.getAccount() : null));

  const apply = React.useCallback(
    async (p: AuthPayload) => {
      session.save(p);
      setAccount(p.account);
      await client.resetStore().catch(() => undefined);
    },
    [client],
  );

  React.useEffect(() => {
    authEvents.onUnauthenticated = () => {
      session.clear();
      setAccount(null);
    };
    return () => {
      authEvents.onUnauthenticated = undefined;
    };
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      account,
      isAuthenticated: !!account,
      verifyOtp: async (input) => {
        const p = await authApi.verifyOtp(input);
        await apply(p);
        return p;
      },
      logout: async () => {
        const rt = session.getRefresh();
        session.clear();
        setAccount(null);
        if (rt) authApi.logout(rt).catch(() => undefined);
        await client.clearStore().catch(() => undefined);
      },
      updateAccount: (a) =>
        setAccount((prev) => {
          if (!prev) return prev;
          const next = { ...prev, ...a };
          session.setAccount(next);
          return next;
        }),
    }),
    [account, apply, client],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải nằm trong AuthProvider');
  return ctx;
}
