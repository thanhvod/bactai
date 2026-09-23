import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthProvider';
import { paths } from '../routes';

/** Trang cần đăng nhập → chuyển về /login?returnUrl=... */
export function RequireCustomer() {
  const { isAuthenticated } = useAuth();
  const loc = useLocation();
  if (!isAuthenticated) return <Navigate to={paths.login(loc.pathname + loc.search)} replace />;
  return <Outlet />;
}
