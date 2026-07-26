import { Module, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@/modules/prisma/prisma.service';

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

  constructor(config: ConfigService, prisma: PrismaService) {
    this.worker = createFileScanWorker(config.get<string>('redis.url')!, prisma);
  }

  async onModuleDestroy() {
    await this.worker.close();
  }
}
