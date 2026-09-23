import * as React from 'react';
import { useApolloClient } from '@apollo/client/react';
import type { Permission } from '@bta/shared';
import { ME_QUERY, type MeAccount, type MeCurrent, type MeData, type MeMembership } from '@/features/auth/graphql/me';
import { authEvents, apolloErrorMessage } from '@/lib/apollo';
import { firebaseSignOut, waitForFirebaseUser } from '@/lib/firebase';
import { session } from '@/lib/session';

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated';

export interface AuthContextValue {
  status: AuthStatus;
  error: string | null;
  account: MeAccount | null;
  memberships: MeMembership[];
  current: MeCurrent | null;
  permissions: Set<string>;
  hasPermission: (key: Permission | string) => boolean;
  /** Chọn merchant → lưu header x-merchant-id, refetch me */
  selectMerchant: (merchantId: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  /** Gọi sau khi login thành công (Google/dev) */
  afterLogin: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const [status, setStatus] = React.useState<AuthStatus>('loading');
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<MeData['me'] | null>(null);

  const loadMe = React.useCallback(async () => {
    const res = await client.query<MeData>({ query: ME_QUERY, fetchPolicy: 'network-only' });
    if (res.error) throw res.error;
    return res.data?.me ?? null;
  }, [client]);

  const fetchMe = React.useCallback(async () => {
    const me = await loadMe();
    setData(me);
    setStatus(me ? 'authenticated' : 'anonymous');
    setError(null);
    return me;
  }, [loadMe]);

  const logout = React.useCallback(async () => {
    session.clear();
    await firebaseSignOut().catch(() => undefined);
    await client.clearStore().catch(() => undefined);
    setData(null);
    setStatus('anonymous');
  }, [client]);

  // Khởi tạo: nếu có dev token hoặc Firebase user → gọi me
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const hasDev = !!session.getDevToken();
      const user = hasDev ? null : await waitForFirebaseUser();
      if (cancelled) return;
      if (!hasDev && !user) {
        setStatus('anonymous');
        return;
      }
      try {
        await fetchMe();
      } catch (e) {
        if (cancelled) return;
        const msg = apolloErrorMessage(e);
        // Token hợp lệ nhưng API lỗi → giữ anonymous kèm thông báo
        setError(msg);
        setStatus('anonymous');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMe]);

  React.useEffect(() => {
    authEvents.onUnauthenticated = () => {
      void logout();
    };
    authEvents.onMerchantRequired = () => {
      session.setMerchantId(null);
      setData((d) => (d ? { ...d, current: null } : d));
    };
    return () => {
      authEvents.onUnauthenticated = undefined;
      authEvents.onMerchantRequired = undefined;
    };
  }, [logout]);

  const selectMerchant = React.useCallback(
    async (merchantId: string | null) => {
      session.setMerchantId(merchantId);
      await client.clearStore().catch(() => undefined);
      await fetchMe();
    },
    [client, fetchMe],
  );

  const afterLogin = React.useCallback(async () => {
    setStatus('loading');
    try {
      // Giữ status 'loading' tới khi chọn xong merchant — tránh guard chuyển sang /select-merchant quá sớm.
      const me = await loadMe();
      const active = me?.memberships.filter((m) => m.status === 'ACTIVE') ?? [];
      if (me && !me.current && active.length === 1) {
        session.setMerchantId(active[0].merchantId);
        await client.clearStore().catch(() => undefined);
      }
      await fetchMe();
    } catch (e) {
      setError(apolloErrorMessage(e));
      setStatus('anonymous');
      throw e;
    }
  }, [client, fetchMe, loadMe]);

  const permissions = React.useMemo(() => new Set(data?.current?.permissions ?? []), [data]);

  const value: AuthContextValue = {
    status,
    error,
    account: data?.account ?? null,
    memberships: data?.memberships ?? [],
    current: data?.current ?? null,
    permissions,
    hasPermission: (key) => permissions.has(key),
    selectMerchant,
    refresh: async () => {
      await fetchMe();
    },
    logout,
    afterLogin,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
}

export function usePermission(key: Permission | string): boolean {
  return useAuth().hasPermission(key);
}
