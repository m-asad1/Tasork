import { randomUUID } from 'crypto';

import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FileVisibility, UserRole, type User } from '@prisma/client';
import { Queue } from 'bullmq';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { FILE_SCAN_QUEUE } from './processors/file-scan.queue';
import { STORAGE_PROVIDER, type StorageProvider } from './storage/storage.interface';

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB, matches the submission form limit
const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.msi', '.dll', '.scr'];

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    @Inject(FILE_SCAN_QUEUE) private readonly scanQueue: Queue,
  ) {}

  async uploadFile(
    uploader: User,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    options: { visibility?: FileVisibility; rootId?: string } = {},
  ) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File exceeds the 50MB size limit');
    }
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(`Files of type ${ext} are not allowed`);
    }

    let version = 1;
    if (options.rootId) {
      const root = await this.prisma.fileAsset.findUnique({ where: { id: options.rootId } });
      if (!root) throw new NotFoundException('Original file not found');
      const latest = await this.prisma.fileAsset.findFirst({
        where: { OR: [{ id: options.rootId }, { rootId: options.rootId }] },
        orderBy: { version: 'desc' },
      });
      version = (latest?.version ?? 1) + 1;
    }

    const storageKey = `${uploader.id}/${randomUUID()}${ext}`;
    await this.storage.upload({ key: storageKey, body: file.buffer, contentType: file.mimetype });

    const fileAsset = await this.prisma.fileAsset.create({
      data: {
        uploaderId: uploader.id,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        visibility: options.visibility ?? FileVisibility.CLIENT_AND_TEAM,
        rootId: options.rootId,
        version,
      },
    });

    // Fire-and-forget: the scan hook runs async so uploads aren't blocked on
    // it. Deliberately non-fatal — a Redis/queue hiccup should never turn a
    // successful upload into a failed request. Worst case, this file's
    // scanStatus stays PENDING until the queue recovers.
    try {
      await this.scanQueue.add('scan', { fileAssetId: fileAsset.id, storageKey });
    } catch (error) {
      this.logger.error(`Failed to enqueue virus scan for file ${fileAsset.id}: ${(error as Error).message}`);
    }

    return fileAsset;
  }

  async getDownloadUrl(fileAssetId: string, requester: User) {
    const fileAsset = await this.prisma.fileAsset.findUnique({
      where: { id: fileAssetId },
      include: { projectAttachments: { include: { project: true, request: true } } },
    });
    if (!fileAsset) throw new NotFoundException('File not found');

    await this.assertCanAccess(fileAsset, requester);

    const url = await this.storage.getSignedDownloadUrl(fileAsset.storageKey);
    return { url, fileAsset };
  }

  async listVersions(fileAssetId: string, requester: User) {
    const fileAsset = await this.prisma.fileAsset.findUnique({ where: { id: fileAssetId } });
    if (!fileAsset) throw new NotFoundException('File not found');
    await this.assertCanAccess(fileAsset, requester);

    const rootId = fileAsset.rootId ?? fileAsset.id;
    return this.prisma.fileAsset.findMany({
      where: { OR: [{ id: rootId }, { rootId }] },
      orderBy: { version: 'desc' },
    });
  }

  private async assertCanAccess(
    fileAsset: { id: string; uploaderId: string; visibility: FileVisibility },
    requester: User,
  ) {
    if (requester.role === UserRole.ADMIN || requester.role === UserRole.SUPER_ADMIN || requester.role === UserRole.SUPPORT) {
      return;
    }
    if (fileAsset.uploaderId === requester.id) return;

    if (fileAsset.visibility === FileVisibility.TEAM_ONLY) {
      throw new ForbiddenException('This file is not shared with clients');
    }

    const attachment = await this.prisma.projectAttachment.findFirst({
      where: { fileAssetId: fileAsset.id },
      include: { project: { include: { request: true } }, request: true },
    });

    const clientId = attachment?.project?.request.clientId ?? attachment?.request?.clientId;
    if (clientId === requester.id) return;

    throw new ForbiddenException('You do not have access to this file');
  }
}
