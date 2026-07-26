import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { StorageProvider, UploadOptions } from './storage.interface';

/**
 * Single storage abstraction over any S3-compatible backend — Cloudflare R2
 * in production, MinIO locally (see docker-compose.yml), so application code
 * never talks to a specific vendor SDK directly (docs/26_File_Management.md
 * "Storage abstraction").
 */
@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('storage.bucket')!;
    this.client = new S3Client({
      endpoint: this.config.get<string>('storage.endpoint'),
      region: this.config.get<string>('storage.region') ?? 'auto',
      forcePathStyle: true, // required for MinIO / R2 compatibility
      credentials: {
        accessKeyId: this.config.get<string>('storage.accessKeyId')!,
        secretAccessKey: this.config.get<string>('storage.secretAccessKey')!,
      },
    });
  }

  async upload({ key, body, contentType }: UploadOptions): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }),
    );
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
