import { DashboardHeader } from '@/components/dashboard/header';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';
import { Sidebar, type SidebarLink } from '@/components/dashboard/sidebar';

// Define customer links using iconName strings (serializable)
const CUSTOMER_LINKS: SidebarLink[] = [
  { label: 'Overview', href: '/dashboard', iconName: 'dashboard' },
  { label: 'My Projects', href: '/dashboard/projects', iconName: 'projects' },
  { label: 'Messages', href: '/dashboard/messages', iconName: 'messages' },
  { label: 'Invoices', href: '/dashboard/invoices', iconName: 'invoices' },
  { label: 'Settings', href: '/dashboard/settings', iconName: 'settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar links={CUSTOMER_LINKS} root="/dashboard" />
      <MobileSidebar links={CUSTOMER_LINKS} root="/dashboard" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}