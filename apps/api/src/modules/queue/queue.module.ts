import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

export const EMAIL_QUEUE = 'EMAIL_QUEUE';
export const NOTIFICATION_QUEUE = 'NOTIFICATION_QUEUE';

/**
 * Central place for named BullMQ queues (email delivery, in-app notifications,
 * file processing, etc.) — see docs/25_Notifications.md. Consumers/processors
 * are registered per-module as the corresponding features are built.
 */
@Global()
@Module({
  providers: [
    {
      provide: EMAIL_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Queue(EMAIL_QUEUE, {
          connection: new Redis(config.get<string>('redis.url')!, { maxRetriesPerRequest: null }),
        }),
    },
    {
      provide: NOTIFICATION_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Queue(NOTIFICATION_QUEUE, {
          connection: new Redis(config.get<string>('redis.url')!, { maxRetriesPerRequest: null }),
        }),
    },
  ],
  exports: [EMAIL_QUEUE, NOTIFICATION_QUEUE],
})
export class QueueModule {}
