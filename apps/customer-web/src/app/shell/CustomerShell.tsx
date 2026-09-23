import * as React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Bell, ChevronDown, LogOut, MapPin, User } from 'lucide-react';
import { Button, ErrorState, LinkContext, Logo, Menu, cn, initials } from '@bta/shadcn';
import { UnreadCountQuery } from '@/graphql/operations';
import { useAuth } from '../auth/AuthProvider';
import { paths } from '../routes';

const RouterLink = ({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) => (
  <Link to={to} className={className}>
    {children}
  </Link>
);

const NAV = [
  { to: '/', label: 'Tìm nhà xe', end: true },
  { to: '/bookings', label: 'Booking của tôi' },
  { to: '/orders', label: 'Đơn hàng' },
  { to: '/debt-statements', label: 'Bảng kê' },
];

class Boundary extends React.Component<{ children: React.ReactNode; resetKey: string }, { error: unknown }> {
  state = { error: null as unknown };
  static getDerivedStateFromError(error: unknown) {
    return { error };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error) return <ErrorState error={this.state.error} onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}

function NotificationBell() {
  const { data } = useQuery(UnreadCountQuery, { pollInterval: 60_000, fetchPolicy: 'cache-and-network' });
  const n = data?.unreadNotificationCount ?? 0;
  return (
    <Link
      to={paths.notifications()}
      aria-label={n ? `Thông báo, ${n} chưa đọc` : 'Thông báo'}
      className="relative inline-flex h-control w-control items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text"
    >
      <Bell className="size-5" aria-hidden />
      {n > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-danger px-1 text-center text-[11px] font-semibold leading-[18px] text-primary-foreground">
          {n > 99 ? '99+' : n}
        </span>
      ) : null}
    </Link>
  );
}

/** Shell Web Khách hàng: top nav, chuông, menu tài khoản (design/COMPONENTS.md `CustomerShell`). */
export function CustomerShell() {
  const { account, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const name = account?.companyName || account?.fullName || '';

  return (
    <LinkContext.Provider value={RouterLink}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-border bg-surface">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-4 px-4">
            <Link to="/" aria-label="Trang chủ">
              <Logo />
            </Link>
            <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="Điều hướng chính">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    cn(
                      'whitespace-nowrap rounded-md px-3 py-1.5 text-body-strong',
                      isActive ? 'bg-primary-soft text-primary' : 'text-text-muted hover:bg-surface-muted hover:text-text',
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <NotificationBell />
                <Menu
                  trigger={
                    <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-surface-muted" aria-label="Tài khoản">
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-body-sm font-semibold text-primary">
                        {initials(name)}
                      </span>
                      <span className="hidden max-w-[180px] truncate text-body-strong sm:inline">{name}</span>
                      <ChevronDown className="size-4 text-text-muted" aria-hidden />
                    </button>
                  }
                  items={[
                    { key: 'profile', label: 'Hồ sơ của tôi', icon: <User />, onSelect: () => navigate(paths.profile()) },
                    { key: 'addr', label: 'Địa chỉ thường dùng', icon: <MapPin />, onSelect: () => navigate(paths.addresses()) },
                    { key: 'noti', label: 'Thông báo', icon: <Bell />, onSelect: () => navigate(paths.notifications()) },
                    {
                      key: 'logout',
                      label: 'Đăng xuất',
                      icon: <LogOut />,
                      separatorBefore: true,
                      onSelect: async () => {
                        await logout();
                        navigate('/login');
                      },
                    },
                  ]}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button onClick={() => navigate(paths.login(loc.pathname + loc.search))}>Đăng nhập / Đăng ký</Button>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1200px] px-4 py-6">
          <Boundary resetKey={loc.pathname}>
            <Outlet />
          </Boundary>
        </main>
      </div>
    </LinkContext.Provider>
  );
}
