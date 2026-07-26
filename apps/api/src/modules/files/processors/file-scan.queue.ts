export { FILE_SCAN_QUEUE } from '@/modules/queue/queue.module';

export interface FileScanJobData {
  fileAssetId: string;
  storageKey: string;
}
