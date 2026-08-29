import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apolloClient } from '../../lib/apollo';
import { auth } from '../../lib/firebase';

interface AuthState {
  user: User | null;
  /** true khi Firebase chưa trả về trạng thái phiên lần đầu */
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        setState({ user, loading: false });
        // Đổi phiên (đăng xuất / đổi tài khoản): xóa cache để không lộ dữ liệu tenant cũ
        if (!user) void apolloClient.clearStore();
      }),
    [],
  );

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
