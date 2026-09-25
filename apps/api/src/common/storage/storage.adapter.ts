export interface PresignedPut {
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresAt: Date;
}

export interface StorageAdapter {
  presignPut(key: string, contentType: string, maxBytes: number): Promise<PresignedPut>;
  presignGet(key: string, fileName: string, inline?: boolean): Promise<string>;
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  getObject(key: string): Promise<Buffer | null>;
  exists(key: string): Promise<{ size: number } | null>;
}
