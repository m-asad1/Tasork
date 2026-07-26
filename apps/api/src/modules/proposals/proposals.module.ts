import { Module } from '@nestjs/common';

import { FilesModule } from '@/modules/files/files.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { RealtimeModule } from '@/modules/realtime/realtime.module';

import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';

@Module({
  imports: [FilesModule, NotificationsModule, RealtimeModule],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
