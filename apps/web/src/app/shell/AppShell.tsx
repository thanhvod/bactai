import * as React from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { DetailSkeleton, ErrorState, LinkContext, cn } from '@bta/shadcn';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { QuickSearch } from './QuickSearch';
import { useNavBadges } from './hooks';

const RouterLink = ({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) => (
  <Link to={to} className={className}>
    {children}
  </Link>
);

class PageErrorBoundary extends React.Component<{ children: React.ReactNode; resetKey: string }, { error: unknown }> {
  state = { error: null as unknown };
  static getDerivedStateFromError(error: unknown) {
    return { error };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error) return <ErrorState title="Trang gặp lỗi" error={this.state.error} onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}

/** WM-SHELL-01 — Sidebar 260px + Topbar 56px + main padding 24px. */
export function AppShell() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const badges = useNavBadges();
  const loc = useLocation();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  React.useEffect(() => setSidebarOpen(false), [loc.pathname]);

  return (
    <LinkContext.Provider value={RouterLink}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <div className="hidden h-full lg:block">
          <Sidebar badges={badges} />
        </div>
        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-text/40" onClick={() => setSidebarOpen(false)} aria-hidden />
            <div className="absolute inset-y-0 left-0 shadow-dialog">
              <Sidebar badges={badges} onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenSearch={() => setSearchOpen(true)} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
          <main className={cn('min-w-0 flex-1 overflow-y-auto p-6')}>
            <PageErrorBoundary resetKey={loc.pathname}>
              <React.Suspense fallback={<DetailSkeleton />}>
                <Outlet />
              </React.Suspense>
            </PageErrorBoundary>
          </main>
        </div>
        <QuickSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </LinkContext.Provider>
  );
}
