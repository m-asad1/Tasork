export interface UploadOptions {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface StorageProvider {
  upload(options: UploadOptions): Promise<void>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
