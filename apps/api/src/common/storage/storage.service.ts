import { Injectable } from '@nestjs/common';
import { env } from '../../config/env';
import { LocalStorageAdapter } from './local.storage';
import { S3StorageAdapter } from './s3.storage';
import type { StorageAdapter } from './storage.adapter';

@Injectable()
export class StorageService {
  readonly adapter: StorageAdapter = env().STORAGE_DRIVER === 's3' ? new S3StorageAdapter() : new LocalStorageAdapter();

  get local(): LocalStorageAdapter | null {
    return this.adapter instanceof LocalStorageAdapter ? this.adapter : null;
  }

  /** merchant/{merchantId}/{entityType}/{entityId}/{yyyy}/{mm}/{attachmentId}-{safeFileName} — ARCHITECTURE §17.3 */
  buildKey(merchantId: string | null, entityType: string, entityId: string, attachmentId: string, fileName: string): string {
    const d = new Date();
    const safe = fileName
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .slice(-80);
    const scope = merchantId ? `merchant/${merchantId}` : 'platform';
    return `${scope}/${entityType}/${entityId}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${attachmentId}-${safe}`;
  }
}
