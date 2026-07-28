import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DisputeStatus, NotificationType, UserRole, type User } from '@prisma/client';

import { NotificationsService } from '@/modules/notifications/notifications.service';
import { PrismaService } from '@/modules/prisma/prisma.service';

const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT];

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async raise(projectId: string, raisedBy: User, subject: string, description: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, include: { request: true } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.request.clientId !== raisedBy.id && !STAFF_ROLES.includes(raisedBy.role)) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const dispute = await this.prisma.dispute.create({
      data: { projectId, raisedById: raisedBy.id, subject, description },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }, deletedAt: null },
      select: { id: true },
    });
    await Promise.all(
      admins.map((admin) =>
        this.notifications.notify({
          userId: admin.id,
          type: NotificationType.DISPUTE_UPDATE,
          title: 'New dispute raised',
          body: `"${subject}" on "${project.request.title}"`,
          metadata: { disputeId: dispute.id, projectId },
        }),
      ),
    );

    return dispute;
  }

  async list(status?: DisputeStatus) {
    return this.prisma.dispute.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        project: { include: { request: { select: { title: true } } } },
        raisedBy: { select: { fullName: true, email: true } },
      },
    });
  }

  async getById(id: string, requester: User) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { project: { include: { request: true } }, raisedBy: { select: { fullName: true, email: true } } },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.raisedById !== requester.id && !STAFF_ROLES.includes(requester.role)) {
      throw new ForbiddenException('You do not have access to this dispute');
    }
    return dispute;
  }

  async resolve(id: string, admin: User, status: DisputeStatus.RESOLVED | DisputeStatus.REJECTED, resolutionNote: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.status !== DisputeStatus.OPEN && dispute.status !== DisputeStatus.UNDER_REVIEW) {
      throw new BadRequestException('This dispute has already been closed');
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: { status, resolutionNote, resolvedById: admin.id, resolvedAt: new Date() },
    });

    await this.notifications.notify({
      userId: dispute.raisedById,
      type: NotificationType.DISPUTE_UPDATE,
      title: 'Dispute update',
      body: `Your dispute "${dispute.subject}" was ${status.toLowerCase()}. ${resolutionNote}`,
      metadata: { disputeId: id },
    });

    return updated;
  }

  async markUnderReview(id: string) {
    return this.prisma.dispute.update({ where: { id }, data: { status: DisputeStatus.UNDER_REVIEW } });
  }
}
