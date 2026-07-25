'use client';

import {
  Badge,
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
import { AlertCircle, DollarSign, FolderKanban, Users } from 'lucide-react';

import { StatWidget } from '@/components/dashboard/stat-widget';

const PENDING_REVIEWS = [
  { id: '1', title: 'E-commerce storefront rebuild', client: 'Nadia R.', submitted: '2 hours ago' },
  { id: '2', title: 'University thesis formatting', client: 'Tomás L.', submitted: '5 hours ago' },
  { id: '3', title: 'CRM workflow automation', client: 'Growth Labs Inc.', submitted: '1 day ago' },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Platform health and operations at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatWidget label="Revenue (30d)" value="$48,210" icon={DollarSign} trend={{ value: '+12.4%', direction: 'up' }} />
        <StatWidget label="Active Projects" value="86" icon={FolderKanban} trend={{ value: '+6 this week', direction: 'up' }} />
        <StatWidget label="New Users (30d)" value="312" icon={Users} trend={{ value: '+8.1%', direction: 'up' }} />
        <StatWidget label="Requests Awaiting Review" value="7" icon={AlertCircle} trend={{ value: '3 over SLA', direction: 'down' }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests Awaiting Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PENDING_REVIEWS.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.client}</TableCell>
                  <TableCell className="text-muted-foreground">{item.submitted}</TableCell>
                  <TableCell>
                    <Badge variant={item.submitted.includes('day') ? 'destructive' : 'secondary'}>
                      {item.submitted.includes('day') ? 'Over SLA' : 'On time'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
