'use client';

import { Drawer, DrawerContent } from '@tasork/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/navigation/logo';
import type { SidebarLink } from '@/components/dashboard/sidebar';
import { useUIStore } from '@/store/ui-store';

export function MobileSidebar({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useUIStore();

  return (
    <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen} direction="left">
      <DrawerContent className="inset-y-0 left-0 right-auto h-full w-72 rounded-none border-r">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/10'
                }`}
              >
                <link.icon className="h-4.5 w-4.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
