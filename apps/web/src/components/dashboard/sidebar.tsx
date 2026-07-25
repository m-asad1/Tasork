'use client';

import { Button } from '@tasork/ui';
import {
  FolderKanban,
  LayoutDashboard,
  LucideIcon,
  MessageSquare,
  Receipt,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/navigation/logo';
import { useUIStore } from '@/store/ui-store';

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

const CUSTOMER_LINKS: SidebarLink[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ links = CUSTOMER_LINKS, root = '/dashboard' }: { links?: SidebarLink[]; root?: string }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-border bg-background transition-all duration-200 lg:flex ${
        sidebarCollapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href={root} className={sidebarCollapsed ? 'hidden' : 'block'}>
          <Logo />
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== root && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
              }`}
            >
              <link.icon className="h-4.5 w-4.5 shrink-0" />
              {!sidebarCollapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
