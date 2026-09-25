import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env';
import type { PresignedPut, StorageAdapter } from './storage.adapter';

const TTL_SECONDS = 15 * 60;

/** Production: S3/R2/MinIO qua presigned URL. */
export class S3StorageAdapter implements StorageAdapter {
  private readonly client = new S3Client({
    region: env().S3_REGION,
    endpoint: env().S3_ENDPOINT || undefined,
    forcePathStyle: env().S3_FORCE_PATH_STYLE,
    credentials:
      env().S3_ACCESS_KEY_ID && env().S3_SECRET_ACCESS_KEY
        ? { accessKeyId: env().S3_ACCESS_KEY_ID!, secretAccessKey: env().S3_SECRET_ACCESS_KEY! }
        : undefined,
  });
  private readonly bucket = env().S3_BUCKET!;

  async presignPut(key: string, contentType: string): Promise<PresignedPut> {
    const url = await getSignedUrl(this.client, new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }), { expiresIn: TTL_SECONDS });
    return { url, method: 'PUT', headers: { 'Content-Type': contentType }, expiresAt: new Date(Date.now() + TTL_SECONDS * 1000) };
  }

  async presignGet(key: string, fileName: string, inline = true): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      }),
      { expiresIn: TTL_SECONDS },
    );
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }));
  }

  async getObject(key: string): Promise<Buffer | null> {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      return Buffer.from(await res.Body!.transformToByteArray());
    } catch {
      return null;
    }
  }

  async exists(key: string): Promise<{ size: number } | null> {
    try {
      const res = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return { size: Number(res.ContentLength ?? 0) };
    } catch {
      return null;
    }
  }
}
