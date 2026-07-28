import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, UserRole, type User } from '@prisma/client';

import { NotificationsService } from '@/modules/notifications/notifications.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { RealtimeGateway } from '@/modules/realtime/realtime.gateway';

const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT];

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  private async getConversation(projectId: string, requester: User) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { projectId },
      include: { participants: true, project: { include: { request: true } } },
    });
    if (!conversation) throw new NotFoundException('This project does not have a conversation yet');

    const isParticipant = conversation.participants.some((p) => p.userId === requester.id);
    if (!isParticipant && !STAFF_ROLES.includes(requester.role)) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    // Staff viewing a project they aren't yet a participant of are
    // auto-joined the first time they open it, so read receipts work for
    // them too (e.g. support stepping in on a project).
    if (!isParticipant && STAFF_ROLES.includes(requester.role)) {
      await this.prisma.conversationParticipant.create({
        data: { conversationId: conversation.id, userId: requester.id },
      });
    }

    return conversation;
  }

  async listMessages(projectId: string, requester: User, { page = 1, limit = 30 } = {}) {
    const conversation = await this.getConversation(projectId, requester);
    const [items, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId: conversation.id, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
          fileAssets: true,
        },
      }),
      this.prisma.message.count({ where: { conversationId: conversation.id, deletedAt: null } }),
    ]);
    return { items: items.reverse(), total, page, limit };
  }

  async searchMessages(projectId: string, requester: User, query: string) {
    const conversation = await this.getConversation(projectId, requester);
    return this.prisma.message.findMany({
      where: { conversationId: conversation.id, deletedAt: null, body: { contains: query, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { sender: { select: { fullName: true } } },
    });
  }

  async sendMessage(projectId: string, sender: User, body: string, fileAssetIds: string[] = []) {
    const conversation = await this.getConversation(projectId, sender);

    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: sender.id,
        body,
        fileAssets: fileAssetIds.length ? { connect: fileAssetIds.map((id) => ({ id })) } : undefined,
      },
      include: { sender: { select: { id: true, fullName: true, avatarUrl: true } }, fileAssets: true },
    });

    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId: conversation.id, userId: sender.id },
      data: { lastReadAt: new Date() },
    });

    this.realtimeGateway.emitToProject(projectId, 'message:new', message);

    const otherParticipants = conversation.participants.filter((p) => p.userId !== sender.id);
    await Promise.all(
      otherParticipants.map((p) =>
        this.notifications.notify({
          userId: p.userId,
          type: NotificationType.MESSAGE_RECEIVED,
          title: `New message from ${sender.fullName}`,
          body: body.length > 120 ? `${body.slice(0, 117)}...` : body,
          metadata: { projectId, messageId: message.id },
        }),
      ),
    );

    return message;
  }

  async markRead(projectId: string, requester: User) {
    const conversation = await this.getConversation(projectId, requester);
    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId: conversation.id, userId: requester.id },
      data: { lastReadAt: new Date() },
    });
    this.realtimeGateway.emitToProject(projectId, 'message:read', { userId: requester.id, readAt: new Date() });
    return { message: 'Marked as read' };
  }

  async getUnreadCount(projectId: string, requester: User) {
    const conversation = await this.getConversation(projectId, requester);
    const participant = conversation.participants.find((p) => p.userId === requester.id);
    return this.prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: requester.id },
        deletedAt: null,
        createdAt: participant?.lastReadAt ? { gt: participant.lastReadAt } : undefined,
      },
    });
  }
}
