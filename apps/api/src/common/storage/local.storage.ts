import { createHmac, timingSafeEqual } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { env } from '../../config/env';
import type { PresignedPut, StorageAdapter } from './storage.adapter';

const TTL_SECONDS = 15 * 60;

/**
 * D-011: dev không có MinIO. File lưu trên đĩa; URL upload/download là link API ký HMAC ngắn hạn,
 * cùng interface presigned như S3 để client không phân biệt.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private readonly root = path.resolve(env().STORAGE_LOCAL_DIR);

  private sign(payload: string): string {
    return createHmac('sha256', env().STORAGE_SIGNING_SECRET).update(payload).digest('base64url');
  }

  token(op: 'put' | 'get', key: string, extra = ''): string {
    const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
    const payload = Buffer.from(JSON.stringify({ op, key, exp, extra })).toString('base64url');
    return `${payload}.${this.sign(payload)}`;
  }

  verify(token: string, op: 'put' | 'get'): { key: string; extra: string } | null {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = Buffer.from(this.sign(payload));
    const got = Buffer.from(sig);
    if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.op !== op || data.exp < Date.now() / 1000) return null;
    return { key: data.key, extra: data.extra };
  }

  private file(key: string) {
    const p = path.resolve(this.root, key);
    if (!p.startsWith(this.root)) throw new Error('Invalid key');
    return p;
  }

  async presignPut(key: string, contentType: string, maxBytes: number): Promise<PresignedPut> {
    const t = this.token('put', key, `${contentType}|${maxBytes}`);
    return {
      url: `${env().API_PUBLIC_URL}/files/upload/${t}`,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      expiresAt: new Date(Date.now() + TTL_SECONDS * 1000),
    };
  }

  async presignGet(key: string, fileName: string, inline = true): Promise<string> {
    const t = this.token('get', key, `${inline ? 'inline' : 'attachment'}|${fileName}`);
    return `${env().API_PUBLIC_URL}/files/raw/${t}`;
  }

  async putObject(key: string, body: Buffer): Promise<void> {
    const f = this.file(key);
    await fs.mkdir(path.dirname(f), { recursive: true });
    await fs.writeFile(f, body);
  }

  async getObject(key: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(this.file(key));
    } catch {
      return null;
    }
  }

  async exists(key: string): Promise<{ size: number } | null> {
    try {
      const st = await fs.stat(this.file(key));
      return { size: st.size };
    } catch {
      return null;
    }
  }
}
