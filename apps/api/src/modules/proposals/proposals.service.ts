import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ActivityType,
  MilestoneStatus,
  NotificationType,
  ProposalStatus,
  UserRole,
  type User,
} from '@prisma/client';

import { FilesService } from '@/modules/files/files.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { RealtimeGateway } from '@/modules/realtime/realtime.gateway';

import type { CreateProposalDto } from './dto/create-proposal.dto';
import { generateProposalPdf } from './pdf/proposal-pdf.generator';

const DEFAULT_EXPIRY_DAYS = 14;
const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT];

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
    private readonly notifications: NotificationsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  // -----------------------------------------------------------------------
  // Builder — create as a new version, superseding any currently-sent one
  // -----------------------------------------------------------------------

  async create(admin: User, requestId: string, dto: CreateProposalDto) {
    const request = await this.prisma.projectRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Project request not found');
    if (request.status !== 'APPROVED') {
      throw new BadRequestException('Only approved requests can receive a proposal');
    }

    const latest = await this.prisma.proposal.findFirst({
      where: { requestId },
      orderBy: { version: 'desc' },
    });
    if (latest && latest.status === ProposalStatus.ACCEPTED) {
      throw new BadRequestException('This request already has an accepted proposal');
    }

    const proposal = await this.prisma.proposal.create({
      data: {
        requestId,
        createdById: admin.id,
        version: (latest?.version ?? 0) + 1,
        supersedesId: latest && latest.status === ProposalStatus.SENT ? latest.id : undefined,
        price: dto.price,
        currency: dto.currency ?? 'USD',
        timelineDays: dto.timelineDays,
        scope: dto.scope,
        revisionPolicy: dto.revisionPolicy,
        deliverables: { create: dto.deliverables.map((d) => ({ title: d.title, description: d.description, order: d.order })) },
        milestones: {
          create: dto.milestones.map((m) => ({
            title: m.title,
            description: m.description,
            amount: m.amount,
            order: m.order,
            dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          })),
        },
      },
      include: { deliverables: true, milestones: true },
    });

    if (latest && latest.status === ProposalStatus.SENT) {
      await this.prisma.proposal.update({ where: { id: latest.id }, data: { status: ProposalStatus.SUPERSEDED } });
    }

    await this.logActivity(requestId, admin.id, ActivityType.SYSTEM, `Proposal v${proposal.version} drafted`);
    return proposal;
  }

  async getVersionHistory(requestId: string, requester: User) {
    await this.assertRequestAccess(requestId, requester);
    return this.prisma.proposal.findMany({
      where: { requestId },
      orderBy: { version: 'desc' },
      include: { deliverables: true, milestones: true },
    });
  }

  async getById(id: string, requester: User) {
    const proposal = await this.mustFind(id);
    await this.assertRequestAccess(proposal.requestId, requester);
    return proposal;
  }

  // -----------------------------------------------------------------------
  // Send — generates the PDF and starts the expiry clock
  // -----------------------------------------------------------------------

  async send(id: string, admin: User, expiresAtOverride?: string) {
    const proposal = await this.mustFind(id);
    if (proposal.status !== ProposalStatus.DRAFT) {
      throw new BadRequestException('Only draft proposals can be sent');
    }

    const request = await this.prisma.projectRequest.findUniqueOrThrow({
      where: { id: proposal.requestId },
      include: { client: true },
    });

    const expiresAt = expiresAtOverride
      ? new Date(expiresAtOverride)
      : new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const pdfBuffer = await generateProposalPdf({
      proposalId: proposal.id,
      version: proposal.version,
      clientName: request.client.fullName,
      requestTitle: request.title,
      price: Number(proposal.price),
      currency: proposal.currency,
      timelineDays: proposal.timelineDays,
      scope: proposal.scope,
      revisionPolicy: proposal.revisionPolicy,
      expiresAt,
      deliverables: proposal.deliverables,
      milestones: proposal.milestones.map((m) => ({ ...m, amount: Number(m.amount) })),
    });

    const pdfAsset = await this.filesService.uploadFile(admin, {
      buffer: pdfBuffer,
      originalname: `proposal-v${proposal.version}.pdf`,
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
    });

    const sent = await this.prisma.proposal.update({
      where: { id },
      data: { status: ProposalStatus.SENT, sentAt: new Date(), expiresAt, pdfFileAssetId: pdfAsset.id },
    });

    await this.logActivity(proposal.requestId, admin.id, ActivityType.PROPOSAL_SENT, `Proposal v${proposal.version} sent to client`);
    await this.notifications.notify({
      userId: request.clientId,
      type: NotificationType.PROPOSAL_SENT,
      title: 'Your custom solution is ready',
      body: `A proposal for "${request.title}" is ready to review.`,
      metadata: { requestId: request.id, proposalId: id },
    });

    return sent;
  }

  // -----------------------------------------------------------------------
  // Client response
  // -----------------------------------------------------------------------

  async accept(id: string, client: User) {
    const proposal = await this.mustFind(id);
    const request = await this.prisma.projectRequest.findUniqueOrThrow({ where: { id: proposal.requestId } });

    if (request.clientId !== client.id) throw new ForbiddenException('This is not your proposal to accept');
    if (proposal.status !== ProposalStatus.SENT) throw new BadRequestException('This proposal is no longer active');
    if (proposal.expiresAt && proposal.expiresAt < new Date()) {
      await this.prisma.proposal.update({ where: { id }, data: { status: ProposalStatus.EXPIRED } });
      throw new BadRequestException('This proposal has expired. Ask Tasork for a new one.');
    }

    const project = await this.prisma.$transaction(async (tx) => {
      await tx.proposal.update({
        where: { id },
        data: { status: ProposalStatus.ACCEPTED, respondedAt: new Date() },
      });

      const created = await tx.project.create({
        data: { requestId: request.id, proposalId: id },
      });

      await tx.milestone.updateMany({ where: { proposalId: id }, data: { projectId: created.id } });

      await tx.conversation.create({
        data: {
          projectId: created.id,
          participants: { create: [{ userId: client.id }, { userId: proposal.createdById }] },
        },
      });

      return created;
    });

    await this.logActivity(proposal.requestId, client.id, ActivityType.PROPOSAL_ACCEPTED, 'Proposal accepted — project created', project.id);
    await this.notifications.notify({
      userId: proposal.createdById,
      type: NotificationType.PROPOSAL_ACCEPTED,
      title: 'Proposal accepted!',
      body: `${client.fullName} accepted the proposal for "${request.title}".`,
      metadata: { projectId: project.id },
    });
    this.realtimeGateway.emitToUser(proposal.createdById, 'proposal:accepted', { proposalId: id, projectId: project.id });

    return project;
  }

  async decline(id: string, client: User, reason?: string) {
    const proposal = await this.mustFind(id);
    const request = await this.prisma.projectRequest.findUniqueOrThrow({ where: { id: proposal.requestId } });

    if (request.clientId !== client.id) throw new ForbiddenException('This is not your proposal to decline');
    if (proposal.status !== ProposalStatus.SENT) throw new BadRequestException('This proposal is no longer active');

    const updated = await this.prisma.proposal.update({
      where: { id },
      data: { status: ProposalStatus.DECLINED, respondedAt: new Date(), declineReason: reason },
    });

    await this.logActivity(proposal.requestId, client.id, ActivityType.STATUS_CHANGE, `Proposal declined${reason ? `: ${reason}` : ''}`);
    await this.notifications.notify({
      userId: proposal.createdById,
      type: NotificationType.SYSTEM,
      title: 'Proposal declined',
      body: `${client.fullName} declined the proposal for "${request.title}". ${reason ?? ''}`,
      metadata: { requestId: request.id },
    });

    return updated;
  }

  // -----------------------------------------------------------------------
  // Expiry — runs hourly, sweeping any SENT proposal past its expiresAt
  // -----------------------------------------------------------------------

  @Cron(CronExpression.EVERY_HOUR)
  async expireStaleProposals() {
    const expired = await this.prisma.proposal.findMany({
      where: { status: ProposalStatus.SENT, expiresAt: { lt: new Date() } },
    });
    if (expired.length === 0) return;

    await this.prisma.proposal.updateMany({
      where: { id: { in: expired.map((p) => p.id) } },
      data: { status: ProposalStatus.EXPIRED },
    });

    for (const proposal of expired) {
      await this.logActivity(proposal.requestId, undefined, ActivityType.SYSTEM, `Proposal v${proposal.version} expired`);
    }
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private async mustFind(id: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { deliverables: true, milestones: true },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  private async assertRequestAccess(requestId: string, requester: User) {
    if (STAFF_ROLES.includes(requester.role)) return;
    const request = await this.prisma.projectRequest.findUnique({ where: { id: requestId } });
    if (request?.clientId === requester.id) return;
    throw new ForbiddenException('You do not have access to this proposal');
  }

  private logActivity(requestId: string, actorId: string | undefined, type: ActivityType, message: string, projectId?: string) {
    return this.prisma.projectActivityLog.create({ data: { requestId, projectId, actorId, type, message } });
  }
}
