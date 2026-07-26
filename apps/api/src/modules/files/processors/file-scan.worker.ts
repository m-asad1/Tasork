import { Logger } from '@nestjs/common';
import { Worker, type Job } from 'bullmq';
import Redis from 'ioredis';

import { PrismaService } from '@/modules/prisma/prisma.service';

import type { FileScanJobData } from './file-scan.queue';
import { FILE_SCAN_QUEUE } from './file-scan.queue';

/**
 * Virus-scan hook. This ships as a stub that always reports "clean" so
 * uploads aren't blocked in dev/staging without a scanner configured — swap
 * `scanBuffer` for a real ClamAV daemon call (e.g. clamscan over TCP) or a
 * hosted scanning API before accepting untrusted uploads in production.
 * See docs/26_File_Management.md § Virus Scan and docs/14_Security.md.
 */
async function scanBuffer(_storageKey: string): Promise<'CLEAN' | 'INFECTED'> {
  // Hook point: replace with a real scan. Left as a stub (always clean).
  return 'CLEAN';
}

export function createFileScanWorker(redisUrl: string, prisma: PrismaService) {
  const logger = new Logger('FileScanWorker');

  return new Worker<FileScanJobData>(
    FILE_SCAN_QUEUE,
    async (job: Job<FileScanJobData>) => {
      const { fileAssetId, storageKey } = job.data;
      const result = await scanBuffer(storageKey);

      await prisma.fileAsset.update({
        where: { id: fileAssetId },
        data: { scanStatus: result },
      });

      if (result === 'INFECTED') {
        logger.warn(`File ${fileAssetId} (${storageKey}) flagged INFECTED by scan hook`);
      }
    },
    { connection: new Redis(redisUrl, { maxRetriesPerRequest: null }) },
  );
}
