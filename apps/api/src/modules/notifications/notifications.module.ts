import { Inject, Module, type OnModuleDestroy } from '@nestjs/common';
import type Redis from 'ioredis';

import { MailService } from '@/modules/mail/mail.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { BULLMQ_CONNECTION } from '@/modules/queue/queue.module';
import { RealtimeModule } from '@/modules/realtime/realtime.module';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { createNotificationWorker } from './processors/notification.worker';

@Module({
  imports: [RealtimeModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule implements OnModuleDestroy {
  private worker: ReturnType<typeof createNotificationWorker>;

  constructor(
    @Inject(BULLMQ_CONNECTION) connection: Redis,
    prisma: PrismaService,
    mail: MailService,
  ) {
    this.worker = createNotificationWorker(connection, prisma, mail);
  }

  async onModuleDestroy() {
    await this.worker.close();
  }
}
