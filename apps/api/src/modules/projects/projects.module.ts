import { Module } from '@nestjs/common';

import { FilesModule } from '@/modules/files/files.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { RealtimeModule } from '@/modules/realtime/realtime.module';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [FilesModule, NotificationsModule, RealtimeModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
