import { DashboardHeader } from '@/components/dashboard/header';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';
import { Sidebar, type SidebarLink } from '@/components/dashboard/sidebar';

// Define admin links using iconName strings (serializable)
const ADMIN_LINKS: SidebarLink[] = [
  { label: 'Overview', href: '/admin', iconName: 'dashboard' },
  { label: 'Projects', href: '/admin/projects', iconName: 'projects' },
  { label: 'Users', href: '/admin/users', iconName: 'users' },
  { label: 'Analytics', href: '/admin/analytics', iconName: 'analytics' },
  { label: 'CMS', href: '/admin/cms', iconName: 'cms' },
  { label: 'Coupons', href: '/admin/coupons', iconName: 'coupons' },
  { label: 'Support', href: '/admin/support', iconName: 'support' },
  { label: 'Settings', href: '/admin/settings', iconName: 'settings' },
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
      <MobileSidebar links={ADMIN_LINKS} root="/admin" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}