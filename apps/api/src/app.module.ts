import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { HealthController } from '@/app.controller';
import configuration from '@/config/configuration';
import { validateEnv } from '@/config/env.validation';
import { AuthModule } from '@/modules/auth/auth.module';
import { FilesModule } from '@/modules/files/files.module';
import { MailModule } from '@/modules/mail/mail.module';
import { MessagingModule } from '@/modules/messaging/messaging.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { ProposalsModule } from '@/modules/proposals/proposals.module';
import { QueueModule } from '@/modules/queue/queue.module';
import { RealtimeModule } from '@/modules/realtime/realtime.module';
import { RedisModule } from '@/modules/redis/redis.module';
import { UsersModule } from '@/modules/users/users.module';

import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate: validateEnv }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    PrismaModule,
    RedisModule,
    QueueModule,
    MailModule,
    RealtimeModule,
    FilesModule,
    NotificationsModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    ProposalsModule,
    PaymentsModule,
    MessagingModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
