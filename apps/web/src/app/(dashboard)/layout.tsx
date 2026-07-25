import { DashboardHeader } from '@/components/dashboard/header';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { FolderKanban, LayoutDashboard, MessageSquare, Receipt, Settings } from 'lucide-react';

const CUSTOMER_LINKS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar links={CUSTOMER_LINKS} root="/dashboard" />
      <MobileSidebar links={CUSTOMER_LINKS} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
