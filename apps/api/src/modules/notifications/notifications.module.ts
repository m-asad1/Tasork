import { Module, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailService } from '@/modules/mail/mail.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
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

  constructor(config: ConfigService, prisma: PrismaService, mail: MailService) {
    this.worker = createNotificationWorker(config.get<string>('redis.url')!, prisma, mail);
  }

  async onModuleDestroy() {
    await this.worker.close();
  }
}
