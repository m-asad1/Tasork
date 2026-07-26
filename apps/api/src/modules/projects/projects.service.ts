import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ActivityType,
  NotificationType,
  ProjectRequestStatus,
  ProjectStatus,
  UserRole,
  type User,
} from '@prisma/client';

import { NotificationsService } from '@/modules/notifications/notifications.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { RealtimeGateway } from '@/modules/realtime/realtime.gateway';

const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT];

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  // -----------------------------------------------------------------------
  // Project requests
  // -----------------------------------------------------------------------

  async createRequest(
    client: User,
    dto: { title: string; category: string; description: string; budgetRange?: string; deadline?: string },
    fileAssetIds: string[] = [],
  ) {
    const request = await this.prisma.projectRequest.create({
      data: {
        clientId: client.id,
        title: dto.title,
        category: dto.category,
        description: dto.description,
        budgetRange: dto.budgetRange,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        attachments: fileAssetIds.length
          ? { create: fileAssetIds.map((fileAssetId) => ({ fileAssetId })) }
          : undefined,
      },
      include: { attachments: { include: { fileAsset: true } } },
    });

    await this.logActivity({ requestId: request.id, actorId: client.id, type: ActivityType.SYSTEM, message: 'Project request submitted' });

    // Notify every admin/super-admin that a new request needs review.
    const admins = await this.prisma.user.findMany({
      where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }, deletedAt: null },
      select: { id: true },
    });
    await Promise.all(
      admins.map((admin) =>
        this.notifications.notify({
          userId: admin.id,
          type: NotificationType.PROJECT_STATUS,
          title: 'New project request submitted',
          body: `"${request.title}" is awaiting review.`,
          metadata: { requestId: request.id },
        }),
      ),
    );

    return request;
  }

  async listRequestsForClient(clientId: string, page = 1, limit = 20) {
    const where = { clientId, archivedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.projectRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { proposals: { select: { id: true, status: true } }, project: { select: { id: true, status: true } } },
      }),
      this.prisma.projectRequest.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async listRequestsForAdmin(status: ProjectRequestStatus | undefined, page = 1, limit = 20) {
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.prisma.projectRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { client: { select: { id: true, fullName: true, email: true, avatarUrl: true } } },
      }),
      this.prisma.projectRequest.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async getRequestById(id: string, requester: User) {
    const request = await this.prisma.projectRequest.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        attachments: { include: { fileAsset: true } },
        activityLog: { orderBy: { createdAt: 'desc' }, include: { actor: { select: { fullName: true } } } },
        proposals: { orderBy: { version: 'desc' } },
        project: true,
      },
    });
    if (!request) throw new NotFoundException('Project request not found');
    this.assertRequestAccess(request, requester);
    return request;
  }

  async updateRequest(
    id: string,
    client: User,
    dto: Partial<{ title: string; category: string; description: string; budgetRange: string; deadline: string }>,
  ) {
    const request = await this.mustFindRequest(id);
    this.assertRequestAccess(request, client);
    if (request.status !== ProjectRequestStatus.SUBMITTED) {
      throw new ForbiddenException('This request is already under review and can no longer be edited directly');
    }

    const updated = await this.prisma.projectRequest.update({
      where: { id },
      data: { ...dto, deadline: dto.deadline ? new Date(dto.deadline) : undefined },
    });
    await this.logActivity({ requestId: id, actorId: client.id, type: ActivityType.COMMENT, message: 'Request details updated' });
    return updated;
  }

  async cancelRequest(id: string, client: User) {
    const request = await this.mustFindRequest(id);
    this.assertRequestAccess(request, client);
    if (![ProjectRequestStatus.SUBMITTED, ProjectRequestStatus.UNDER_REVIEW].includes(request.status)) {
      throw new ForbiddenException('Only pending requests can be cancelled');
    }

    const updated = await this.prisma.projectRequest.update({
      where: { id },
      data: { status: ProjectRequestStatus.CANCELLED, cancelledAt: new Date() },
    });
    await this.logActivity({ requestId: id, actorId: client.id, type: ActivityType.STATUS_CHANGE, message: 'Request cancelled by client' });
    return updated;
  }

  async archiveRequest(id: string, requester: User) {
    const request = await this.mustFindRequest(id);
    this.assertRequestAccess(request, requester);
    if (![ProjectRequestStatus.DECLINED, ProjectRequestStatus.CANCELLED].includes(request.status)) {
      throw new ForbiddenException('Only declined or cancelled requests can be archived');
    }
    return this.prisma.projectRequest.update({ where: { id }, data: { archivedAt: new Date() } });
  }

  async duplicateRequest(id: string, client: User) {
    const original = await this.mustFindRequest(id);
    this.assertRequestAccess(original, client);

    const duplicate = await this.prisma.projectRequest.create({
      data: {
        clientId: client.id,
        title: `${original.title} (copy)`,
        category: original.category,
        description: original.description,
        budgetRange: original.budgetRange,
        duplicatedFromId: original.id,
      },
    });
    await this.logActivity({
      requestId: duplicate.id,
      actorId: client.id,
      type: ActivityType.SYSTEM,
      message: `Duplicated from request "${original.title}"`,
    });
    return duplicate;
  }

  async reviewRequest(id: string, admin: User, approve: boolean, declineReason?: string) {
    const request = await this.mustFindRequest(id);

    const updated = await this.prisma.projectRequest.update({
      where: { id },
      data: {
        status: approve ? ProjectRequestStatus.APPROVED : ProjectRequestStatus.DECLINED,
        declineReason: approve ? null : declineReason,
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    });

    await this.logActivity({
      requestId: id,
      actorId: admin.id,
      type: ActivityType.STATUS_CHANGE,
      message: approve ? 'Request approved — a proposal is being prepared' : `Request declined: ${declineReason ?? 'No reason given'}`,
    });

    await this.notifications.notify({
      userId: request.clientId,
      type: NotificationType.PROJECT_STATUS,
      title: approve ? 'Your project request was approved' : 'Update on your project request',
      body: approve
        ? `"${request.title}" has been approved. You'll receive a proposal shortly.`
        : `"${request.title}" was declined. ${declineReason ?? ''}`,
      metadata: { requestId: id },
    });

    return updated;
  }

  // -----------------------------------------------------------------------
  // Live projects (post-acceptance)
  // -----------------------------------------------------------------------

  async getProjectById(id: string, requester: User) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        request: { include: { client: { select: { id: true, fullName: true, email: true, avatarUrl: true } } } },
        proposal: { include: { deliverables: true, milestones: true } },
        assignments: { include: { user: { select: { id: true, fullName: true, avatarUrl: true, role: true } } } },
        attachments: { include: { fileAsset: true } },
        milestones: true,
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    await this.assertProjectAccess(project.id, project.request.client.id, requester);
    return project;
  }

  async listProjectsForClient(clientId: string, page = 1, limit = 20) {
    const where = { request: { clientId }, archivedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { request: { select: { title: true, category: true } } },
      }),
      this.prisma.project.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus, actor: User | null, message?: string) {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status,
        completedAt: status === ProjectStatus.COMPLETED ? new Date() : undefined,
        cancelledAt: status === ProjectStatus.CANCELLED ? new Date() : undefined,
      },
      include: { request: true },
    });

    await this.logActivity({
      projectId,
      actorId: actor?.id,
      type: ActivityType.STATUS_CHANGE,
      message: message ?? `Status changed to ${status.replace(/_/g, ' ').toLowerCase()}`,
    });

    await this.notifications.notify({
      userId: project.request.clientId,
      type: NotificationType.PROJECT_STATUS,
      title: 'Project status updated',
      body: `"${project.request.title}" is now ${status.replace(/_/g, ' ').toLowerCase()}.`,
      metadata: { projectId },
    });

    this.realtimeGateway.emitToProject(projectId, 'project:status-changed', { projectId, status });
    return project;
  }

  async archiveProject(id: string, requester: User) {
    const project = await this.prisma.project.findUnique({ where: { id }, include: { request: true } });
    if (!project) throw new NotFoundException('Project not found');
    await this.assertProjectAccess(project.id, project.request.clientId, requester);
    if (![ProjectStatus.COMPLETED, ProjectStatus.CANCELLED].includes(project.status)) {
      throw new ForbiddenException('Only completed or cancelled projects can be archived');
    }
    return this.prisma.project.update({ where: { id }, data: { archivedAt: new Date(), status: ProjectStatus.ARCHIVED } });
  }

  async assignMember(projectId: string, userId: string, role: import('@prisma/client').ProjectRole, admin: User) {
    const assignment = await this.prisma.projectAssignment.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role },
      create: { projectId, userId, role },
    });
    await this.logActivity({ projectId, actorId: admin.id, type: ActivityType.ASSIGNMENT, message: 'Team member assigned' });
    await this.notifications.notify({
      userId,
      type: NotificationType.PROJECT_STATUS,
      title: "You've been assigned to a project",
      body: 'Check your dashboard for the project details.',
      metadata: { projectId },
    });
    return assignment;
  }

  // -----------------------------------------------------------------------
  // Attachments & activity log (shared by requests and projects)
  // -----------------------------------------------------------------------

  async addAttachment(target: { requestId?: string; projectId?: string }, fileAssetId: string, actor: User) {
    const attachment = await this.prisma.projectAttachment.create({
      data: { ...target, fileAssetId },
      include: { fileAsset: true },
    });
    await this.logActivity({
      ...target,
      actorId: actor.id,
      type: ActivityType.FILE_UPLOAD,
      message: `${actor.fullName} uploaded ${attachment.fileAsset.originalName}`,
    });
    return attachment;
  }

  async removeAttachmentRef(attachmentId: string) {
    return this.prisma.projectAttachment.delete({ where: { id: attachmentId } });
  }

  getTimeline(target: { requestId?: string; projectId?: string }) {
    return this.prisma.projectActivityLog.findMany({
      where: target,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { fullName: true, avatarUrl: true } } },
    });
  }

  async logActivity(entry: {
    requestId?: string;
    projectId?: string;
    actorId?: string;
    type: ActivityType;
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.projectActivityLog.create({
      data: { ...entry, metadata: entry.metadata as never },
    });
  }

  // -----------------------------------------------------------------------
  // Access control helpers
  // -----------------------------------------------------------------------

  private assertRequestAccess(request: { clientId: string }, requester: User) {
    if (STAFF_ROLES.includes(requester.role) || request.clientId === requester.id) return;
    throw new ForbiddenException('You do not have access to this request');
  }

  private async assertProjectAccess(projectId: string, clientId: string, requester: User) {
    if (STAFF_ROLES.includes(requester.role) || clientId === requester.id) return;
    const assignment = await this.prisma.projectAssignment.findUnique({
      where: { projectId_userId: { projectId, userId: requester.id } },
    });
    if (assignment) return;
    throw new ForbiddenException('You do not have access to this project');
  }

  private async mustFindRequest(id: string) {
    const request = await this.prisma.projectRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Project request not found');
    return request;
  }
}
