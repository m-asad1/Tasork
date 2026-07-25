'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tasork/ui';
import { useQuery } from '@tanstack/react-query';
import { Clock3, FolderKanban, MessageSquare, Plus, Receipt } from 'lucide-react';
import Link from 'next/link';

import { StatWidget } from '@/components/dashboard/stat-widget';
import { apiClient } from '@/lib/api-client';

interface RecentProject {
  id: string;
  title: string;
  status: 'AWAITING_PAYMENT' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  updatedAt: string;
}

const STATUS_VARIANT: Record<RecentProject['status'], 'default' | 'success' | 'warning' | 'secondary'> = {
  AWAITING_PAYMENT: 'warning',
  IN_PROGRESS: 'default',
  IN_REVIEW: 'secondary',
  COMPLETED: 'success',
};

export default function DashboardOverviewPage() {
  const { data: projects } = useQuery({
    queryKey: ['dashboard', 'recent-projects'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: RecentProject[] }>('/projects?limit=5');
      return data.data;
    },
    // Placeholder data so the page renders meaningfully before the API is live.
    placeholderData: [
      { id: '1', title: 'Landing page redesign', status: 'IN_PROGRESS', updatedAt: '2026-07-22' },
      { id: '2', title: 'Quarterly report formatting', status: 'IN_REVIEW', updatedAt: '2026-07-20' },
      { id: '3', title: 'Onboarding email sequence', status: 'AWAITING_PAYMENT', updatedAt: '2026-07-18' },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your solutions.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4" />
            Submit a Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget label="Active Projects" value="3" icon={FolderKanban} trend={{ value: '+1 this month', direction: 'up' }} />
        <StatWidget label="Pending Proposals" value="1" icon={Clock3} />
        <StatWidget label="Unread Messages" value="4" icon={MessageSquare} />
        <StatWidget label="Total Spent" value="$2,340" icon={Receipt} trend={{ value: '+$450 this month', direction: 'up' }} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                      {project.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[project.status]}>{project.status.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{project.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
