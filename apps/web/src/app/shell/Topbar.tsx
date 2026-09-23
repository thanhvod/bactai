import * as React from 'react';
import { useNavigate } from 'react-router';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu as MenuIcon, Search, Settings, ShieldCheck, Smartphone, UserRound } from 'lucide-react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, IconButton, Popover, PopoverContent, PopoverTrigger, cn, initials } from '@bta/shadcn';
import { MERCHANT_ROLE_LABEL } from '@bta/shared';
import { useAuth } from '../auth/AuthProvider';
import { PATHS } from '../routes';
import { MyAppPasswordDialog } from './MyAppPasswordDialog';
import { NotificationList } from './NotificationList';
import { useNotifications } from './hooks';

export function Topbar({ onOpenSearch, onToggleSidebar }: { onOpenSearch: () => void; onToggleSidebar: () => void }) {
  const { account, current, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const noti = useNotifications();
  const [appPwOpen, setAppPwOpen] = React.useState(false);
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <header className="flex h-topbar shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      <IconButton label="Mở menu" className="lg:hidden" onClick={onToggleSidebar}>
        <MenuIcon />
      </IconButton>
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex h-[34px] w-[420px] max-w-[50vw] items-center gap-2 rounded-md border border-border-control bg-surface px-2.5 text-left text-body-sm text-text-subtle hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Tìm kiếm nhanh"
      >
        <Search className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">Tìm mã đơn, mã chuyến, khách, tài xế, xe, phiếu…</span>
        <kbd className="rounded-sm border border-border px-1.5 text-[11px] font-medium text-text-muted">{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      <div className="flex-1" />
      <IconButton label="Trợ giúp" onClick={() => window.open('https://github.com', '_blank')}>
        <HelpCircle />
      </IconButton>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="relative inline-flex size-9 items-center justify-center rounded-md text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Thông báo${noti.unreadCount ? `, ${noti.unreadCount} chưa đọc` : ''}`}>
            <Bell className="size-4" />
            {noti.unreadCount ? <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-danger px-1 text-center text-[10px] font-bold leading-4 text-primary-foreground">{noti.unreadCount}</span> : null}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0">
          <NotificationList {...noti} />
        </PopoverContent>
      </Popover>
      <div className="h-6 w-px bg-border" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Menu tài khoản">
            {account?.avatarUrl ? (
              <img src={account.avatarUrl} alt="" className="size-[30px] rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <span className="flex size-[30px] items-center justify-center rounded-full bg-primary-soft text-caption font-semibold text-primary">{initials(account?.name ?? account?.email)}</span>
            )}
            <span className="hidden flex-col text-left md:flex">
              <span className="text-body-sm font-semibold leading-tight">{account?.name ?? account?.email}</span>
              <span className="text-[11px] leading-tight text-text-subtle">{current ? MERCHANT_ROLE_LABEL[current.role] : ''}</span>
            </span>
            <ChevronDown className="size-4 text-text-subtle" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>
            <div className="text-body-sm font-semibold text-text">{account?.name ?? '—'}</div>
            <div className="truncate text-caption text-text-subtle">{account?.email}</div>
            {current ? <div className="mt-1 text-caption text-text-muted">{current.merchantName} · {MERCHANT_ROLE_LABEL[current.role]}</div> : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate(PATHS.selectMerchant)}>
            <ShieldCheck /> Đổi nhà xe
          </DropdownMenuItem>
          {hasPermission('settings.manage') ? (
            <DropdownMenuItem onSelect={() => navigate(PATHS.settingsCompany)}>
              <Settings /> Hồ sơ nhà xe
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={() => navigate(current ? `/settings/users/${current.membershipId}` : PATHS.settingsUsers)}>
            <UserRound /> Tài khoản của tôi
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAppPwOpen(true)}>
            <Smartphone /> Mật khẩu App Merchant
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem danger onSelect={() => void logout().then(() => navigate(PATHS.login))}>
            <LogOut /> Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className={cn('sr-only')}>
        <Button variant="link" onClick={onOpenSearch}>Tìm kiếm</Button>
      </span>
      <MyAppPasswordDialog open={appPwOpen} onOpenChange={setAppPwOpen} />
    </header>
  );
}
