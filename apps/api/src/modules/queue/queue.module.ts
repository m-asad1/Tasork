import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

export const EMAIL_QUEUE = 'EMAIL_QUEUE';
export const NOTIFICATION_QUEUE = 'NOTIFICATION_QUEUE';
export const FILE_SCAN_QUEUE = 'FILE_SCAN_QUEUE';

/** Shared by every BullMQ Queue/Worker in the app — see the comment below. */
export const BULLMQ_CONNECTION = 'BULLMQ_CONNECTION';

/**
 * Central place for named BullMQ queues (email delivery, in-app notifications,
 * file processing, etc.) — see docs/25_Notifications.md. Consumers/processors
 * are registered per-module as the corresponding features are built.
 *
 * All queues AND workers share one ioredis connection (BULLMQ_CONNECTION)
 * rather than each opening its own. Managed Redis providers (Upstash, etc.)
 * commonly cap concurrent connections on lower tiers; with 3 queues + 2+
 * workers each dialing independently, that cap gets hit fast and every
 * `.add()` call starts failing with ECONNREFUSED. One connection, reused,
 * avoids the problem entirely and is the pattern BullMQ's own docs recommend
 * for apps with multiple queues.
 */
@Global()
@Module({
  providers: [
    {
      provide: BULLMQ_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis(config.get<string>('redis.url')!, {
          maxRetriesPerRequest: null, // required by BullMQ for blocking commands
        }),
    },
    {
      provide: EMAIL_QUEUE,
      inject: [BULLMQ_CONNECTION],
      useFactory: (connection: Redis) => new Queue(EMAIL_QUEUE, { connection }),
    },
    {
      provide: NOTIFICATION_QUEUE,
      inject: [BULLMQ_CONNECTION],
      useFactory: (connection: Redis) => new Queue(NOTIFICATION_QUEUE, { connection }),
    },
    {
      provide: FILE_SCAN_QUEUE,
      inject: [BULLMQ_CONNECTION],
      useFactory: (connection: Redis) => new Queue(FILE_SCAN_QUEUE, { connection }),
    },
  ],
  exports: [BULLMQ_CONNECTION, EMAIL_QUEUE, NOTIFICATION_QUEUE, FILE_SCAN_QUEUE],
})
export class QueueModule {}
