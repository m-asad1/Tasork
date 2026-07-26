import { Logger } from '@nestjs/common';
import { Worker, type Job } from 'bullmq';
import Redis from 'ioredis';

import { MailService } from '@/modules/mail/mail.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { NOTIFICATION_QUEUE } from '@/modules/queue/queue.module';

interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  body: string;
}

export function createNotificationWorker(redisUrl: string, prisma: PrismaService, mail: MailService) {
  const logger = new Logger('NotificationWorker');

  return new Worker<NotificationJobData>(
    NOTIFICATION_QUEUE,
    async (job: Job<NotificationJobData>) => {
      const { userId, title, body } = job.data;

      if (job.name === 'email-notification') {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;
        await mail.send({ to: user.email, subject: title, html: `<p>${body}</p>` });
      }

      if (job.name === 'push-notification') {
        // Hook point: integrate FCM/APNs here. Logged for now so the
        // delivery pipeline is visible before a real provider is wired up.
        logger.log(`[push, no provider configured] ${userId}: ${title}`);
      }
    },
    { connection: new Redis(redisUrl, { maxRetriesPerRequest: null }) },
  );
}
