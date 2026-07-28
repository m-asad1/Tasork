import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { Queue } from 'bullmq';

import { RealtimeGateway } from '@/modules/realtime/realtime.gateway';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { NOTIFICATION_QUEUE } from '@/modules/queue/queue.module';

import type { ChannelToggles } from './dto/update-preferences.dto';

export interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

const DEFAULT_CHANNELS: ChannelToggles = { IN_APP: true, EMAIL: true, PUSH: false };

/**
 * Single entry point every other module (Projects, Proposals, Payments,
 * Messaging, Disputes...) calls to notify a user — Deliverable 56. Fans out
 * to: (1) a persisted in-app Notification row + live Socket.io push, and
 * (2) an EMAIL_QUEUE job, each gated by the user's NotificationPreference.
 * PUSH is wired to the same preference matrix now so it's a no-op switch to
 * flip on once a push provider (FCM/APNs) is integrated — "future-ready" per
 * the deliverable.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    @Inject(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  async notify(input: NotifyInput) {
    const channels = await this.resolveChannels(input.userId, input.type);

    // notify() is called as a side-effect from the middle of business flows
    // (approving a request, sending a proposal, project creation, ...).
    // A Redis/queue outage here must never fail the action that triggered
    // it — so every channel below is best-effort and logs rather than throws.
    let notification = null;
    if (channels.IN_APP) {
      try {
        notification = await this.prisma.notification.create({
          data: {
            userId: input.userId,
            type: input.type,
            title: input.title,
            body: input.body,
            metadata: input.metadata as never,
          },
        });
        this.realtimeGateway.emitToUser(input.userId, 'notification:new', notification);
      } catch (error) {
        this.logger.error(`Failed to create in-app notification for user ${input.userId}: ${(error as Error).message}`);
      }
    }

    if (channels.EMAIL) {
      try {
        await this.notificationQueue.add('email-notification', {
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body,
        });
      } catch (error) {
        this.logger.error(`Failed to enqueue email notification for user ${input.userId}: ${(error as Error).message}`);
      }
    }

    // PUSH: enqueued to the same worker so adding a real provider later is a
    // processor change only, not a call-site change across the app.
    if (channels.PUSH) {
      try {
        await this.notificationQueue.add('push-notification', {
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body,
        });
      } catch (error) {
        this.logger.error(`Failed to enqueue push notification for user ${input.userId}: ${(error as Error).message}`);
      }
    }

    return notification;
  }

  private async resolveChannels(userId: string, type: NotificationType): Promise<ChannelToggles> {
    const pref = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    const matrix = (pref?.preferences as Record<string, Partial<ChannelToggles>>) ?? {};
    return { ...DEFAULT_CHANNELS, ...matrix[type] };
  }

  async list(userId: string, { unreadOnly = false, page = 1, limit = 20 } = {}) {
    const where = { userId, ...(unreadOnly ? { readAt: null } : {}) };
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items, total, unreadCount, page, limit };
  }

  async markRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async getPreferences(userId: string) {
    const pref = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    return pref?.preferences ?? {};
  }

  async updatePreferences(userId: string, partial: Record<string, Partial<ChannelToggles>>) {
    const existing = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    const current = (existing?.preferences as Record<string, Partial<ChannelToggles>>) ?? {};

    const merged: Record<string, Partial<ChannelToggles>> = { ...current };
    for (const [type, toggles] of Object.entries(partial)) {
      if (!(type in NotificationType)) continue; // ignore unknown keys defensively
      merged[type] = { ...merged[type], ...toggles };
    }

    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: { preferences: merged as never },
      create: { userId, preferences: merged as never },
    });
  }
}
