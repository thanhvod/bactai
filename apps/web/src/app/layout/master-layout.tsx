import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@bta/shadcn';
import { LogOut } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { signOut } from '../../lib/firebase';
import { useAuth } from '../auth/auth-context';
import { AppSidebar } from './app-sidebar';
import { NAV_GROUPS } from './nav-items';

function usePageTitle(): string {
  const { pathname } = useLocation();
  const items = NAV_GROUPS.flatMap((g) => g.items);
  const match = items.find((item) =>
    item.url === '/' ? pathname === '/' : pathname.startsWith(item.url),
  );
  return match?.title ?? 'BacTai.Net';
}

function UserMenu() {
  const { user } = useAuth();
  if (!user) return null;

  const initials = (user.displayName ?? user.email ?? '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-8">
          <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="grid gap-0.5">
            <span className="truncate text-sm font-medium">
              {user.displayName ?? 'Người dùng'}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MasterLayout() {
  const title = usePageTitle();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-semibold">{title}</h1>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
