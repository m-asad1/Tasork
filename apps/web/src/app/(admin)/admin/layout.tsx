import {
  BarChart3,
  FileStack,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Tag,
  Users,
} from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/header';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';
import { Sidebar } from '@/components/dashboard/sidebar';

const ADMIN_LINKS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'CMS', href: '/admin/cms', icon: FileStack },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Support', href: '/admin/support', icon: LifeBuoy },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

/**
 * Route-level access control (RBAC: ADMIN / SUPER_ADMIN only) is enforced
 * server-side via middleware.ts + the /admin/* matcher, not just hidden in the UI.
 * See docs/14_Security.md and docs/27_Admin_Panel.md.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar links={ADMIN_LINKS} root="/admin" />
      <MobileSidebar links={ADMIN_LINKS} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
