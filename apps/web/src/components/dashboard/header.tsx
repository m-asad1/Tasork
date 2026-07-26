'use client';

import { Avatar, AvatarFallback, Button } from '@tasork/ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, ChevronRight, LogOut, Menu, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { ThemeToggle } from '@/components/theme-toggle';
import { apiClient } from '@/lib/api-client';
import { clearSessionCookies } from '@/lib/session-cookies';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = (pathname ?? '').split('/').filter(Boolean);
  return segments.map((seg, idx) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, idx + 1).join('/'),
  }));
}

export function DashboardHeader() {
  const crumbs = useBreadcrumbs();
  const router = useRouter();
  const { user, clear } = useAuthStore();
  const { setMobileNavOpen } = useUIStore();

  async function handleLogout() {
    await apiClient.post('/auth/logout');
    clear();
    clearSessionCookies(); // Clear the session cookies for middleware
    router.push('/login');
  }

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm sm:flex">
          {crumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              <Link
                href={crumb.href}
                className={
                  idx === crumbs.length - 1
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="w-56 rounded-lg border border-border bg-popover p-1.5 shadow-lg animate-fade-in"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.fullName ?? 'Account'}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/10"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/10"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </DropdownMenu.Item>
              <div className="my-1 h-px bg-border" />
              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}