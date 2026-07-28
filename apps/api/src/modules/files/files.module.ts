import { Inject, Module, type OnModuleDestroy } from '@nestjs/common';
import type Redis from 'ioredis';

import { PrismaService } from '@/modules/prisma/prisma.service';
import { BULLMQ_CONNECTION } from '@/modules/queue/queue.module';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { createFileScanWorker } from './processors/file-scan.worker';
import { S3StorageProvider } from './storage/s3-storage.provider';
import { STORAGE_PROVIDER } from './storage/storage.interface';

@Module({
  controllers: [FilesController],
  providers: [FilesService, { provide: STORAGE_PROVIDER, useClass: S3StorageProvider }],
  exports: [FilesService],
})
export class FilesModule implements OnModuleDestroy {
  private worker: ReturnType<typeof createFileScanWorker>;

  constructor(
    @Inject(BULLMQ_CONNECTION) connection: Redis,
    prisma: PrismaService,
  ) {
    this.worker = createFileScanWorker(connection, prisma);
  }

  async onModuleDestroy() {
    await this.worker.close();
  }
}
