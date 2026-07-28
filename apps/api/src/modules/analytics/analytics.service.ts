import { Injectable } from '@nestjs/common';
import { PaymentStatus, ProjectRequestStatus, ProjectStatus, ProposalStatus } from '@prisma/client';

import { PrismaService } from '@/modules/prisma/prisma.service';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Daily revenue for the trailing `days` days — feeds the Revenue chart. */
  async getRevenueOverTime(days = 30) {
    const payments = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCEEDED, paidAt: { gte: daysAgo(days) } },
      select: { totalAmount: true, paidAt: true, currency: true },
    });

    const byDay = new Map<string, number>();
    for (const p of payments) {
      const key = p.paidAt!.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + Number(p.totalAmount));
    }

    const series: { date: string; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const key = daysAgo(i).toISOString().slice(0, 10);
      series.push({ date: key, revenue: Math.round((byDay.get(key) ?? 0) * 100) / 100 });
    }

    return {
      series,
      total: Math.round(series.reduce((sum, d) => sum + d.revenue, 0) * 100) / 100,
    };
  }

  /** Project counts by status — feeds the Projects chart. */
  async getProjectStats() {
    const grouped = await this.prisma.project.groupBy({ by: ['status'], _count: { _all: true } });
    const byStatus = Object.fromEntries(Object.values(ProjectStatus).map((s) => [s, 0])) as Record<ProjectStatus, number>;
    for (const row of grouped) byStatus[row.status] = row._count._all;

    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    return { byStatus, total };
  }

  /**
   * Request → Review → Proposal → Payment funnel — feeds the Conversion
   * Rate chart (docs/29_Analytics.md § Proposal Funnel).
   */
  async getConversionFunnel(days = 90) {
    const since = daysAgo(days);

    const [submitted, approved, proposalsSent, proposalsAccepted, projectsStarted] = await Promise.all([
      this.prisma.projectRequest.count({ where: { createdAt: { gte: since } } }),
      this.prisma.projectRequest.count({ where: { createdAt: { gte: since }, status: { not: ProjectRequestStatus.SUBMITTED } } }),
      this.prisma.proposal.count({ where: { createdAt: { gte: since }, sentAt: { not: null } } }),
      this.prisma.proposal.count({ where: { createdAt: { gte: since }, status: ProposalStatus.ACCEPTED } }),
      this.prisma.project.count({ where: { createdAt: { gte: since } } }),
    ]);

    return {
      steps: [
        { label: 'Requests submitted', count: submitted },
        { label: 'Reviewed', count: approved },
        { label: 'Proposals sent', count: proposalsSent },
        { label: 'Proposals accepted', count: proposalsAccepted },
        { label: 'Projects started', count: projectsStarted },
      ],
      conversionRate: submitted > 0 ? Math.round((projectsStarted / submitted) * 1000) / 10 : 0,
    };
  }

  /** Sent proposals that ended ACCEPTED vs DECLINED/EXPIRED — Proposal Acceptance chart. */
  async getProposalAcceptanceRate(days = 90) {
    const since = daysAgo(days);
    const grouped = await this.prisma.proposal.groupBy({
      by: ['status'],
      where: { sentAt: { gte: since, not: null } },
      _count: { _all: true },
    });

    const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Partial<Record<ProposalStatus, number>>;
    const accepted = counts.ACCEPTED ?? 0;
    const declined = counts.DECLINED ?? 0;
    const expired = counts.EXPIRED ?? 0;
    const totalResolved = accepted + declined + expired;

    return {
      accepted,
      declined,
      expired,
      acceptanceRate: totalResolved > 0 ? Math.round((accepted / totalResolved) * 1000) / 10 : 0,
    };
  }

  /** % of clients with more than one project — Customer Retention chart. */
  async getCustomerRetention() {
    const perClient = await this.prisma.$queryRaw<{ client_id: string; project_count: bigint }[]>`
      SELECT pr."clientId" as client_id, COUNT(p.id) as project_count
      FROM "project_requests" pr
      JOIN "projects" p ON p."requestId" = pr.id
      GROUP BY pr."clientId"
    `;

    const totalClients = perClient.length;
    const repeatClients = perClient.filter((c) => Number(c.project_count) > 1).length;

    return {
      totalClients,
      repeatClients,
      retentionRate: totalClients > 0 ? Math.round((repeatClients / totalClients) * 1000) / 10 : 0,
    };
  }

  /** DAU/WAU/MAU based on login history — Active Users chart. */
  async getActiveUsers() {
    const [daily, weekly, monthly] = await Promise.all([
      this.prisma.loginHistoryEntry.groupBy({ by: ['userId'], where: { success: true, createdAt: { gte: daysAgo(1) } } }),
      this.prisma.loginHistoryEntry.groupBy({ by: ['userId'], where: { success: true, createdAt: { gte: daysAgo(7) } } }),
      this.prisma.loginHistoryEntry.groupBy({ by: ['userId'], where: { success: true, createdAt: { gte: daysAgo(30) } } }),
    ]);

    return { dau: daily.length, wau: weekly.length, mau: monthly.length };
  }

  /** Single call for the admin dashboard's summary widgets. */
  async getOverview() {
    const [revenue30, projectStats, funnel, acceptance, retention, activeUsers, newUsers30] = await Promise.all([
      this.getRevenueOverTime(30),
      this.getProjectStats(),
      this.getConversionFunnel(),
      this.getProposalAcceptanceRate(),
      this.getCustomerRetention(),
      this.getActiveUsers(),
      this.prisma.user.count({ where: { createdAt: { gte: daysAgo(30) }, deletedAt: null } }),
    ]);

    return { revenue30, projectStats, funnel, acceptance, retention, activeUsers, newUsers30 };
  }
}
