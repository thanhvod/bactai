import * as React from 'react';
import { getFirebaseIdToken } from './firebase';
import { API_URL, session } from './session';

/** Header xác thực giống Apollo (dev token hoặc Firebase ID token + x-merchant-id). */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = session.getDevToken() ?? (await getFirebaseIdToken());
  const merchantId = session.getMerchantId();
  return {
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...(merchantId ? { 'x-merchant-id': merchantId } : {}),
  };
}

export interface UploadTarget {
  entityType: string;
  entityId: string;
  category?: string;
  note?: string | null;
}

export interface UploadedAttachment {
  id: string;
  fileName: string;
  url?: string | null;
  status: string;
}

async function restJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message ?? `Lỗi ${res.status}`);
  return data as T;
}

/** PUT file lên presigned URL với tiến độ (XHR để có progress). */
function putWithProgress(url: string, file: File, headers: Record<string, string>, onProgress?: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Tải lên thất bại (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Mất kết nối khi tải file lên'));
    xhr.send(file);
  });
}

/**
 * Upload chứng từ theo ARCHITECTURE §16.1: presign → PUT uploadUrl → confirm.
 * Lỗi PUT thì không confirm → không tạo chứng từ mồ côi (backend giữ PENDING).
 */
export async function uploadAttachment(file: File, target: UploadTarget, onProgress?: (pct: number) => void): Promise<UploadedAttachment> {
  const pre = await restJson<{ attachmentId: string; uploadUrl: string; headers: Record<string, string> }>('/uploads/presign', {
    entityType: target.entityType,
    entityId: target.entityId,
    category: target.category ?? 'OTHER',
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    fileSize: file.size,
    note: target.note ?? null,
  });
  await putWithProgress(pre.uploadUrl, file, pre.headers ?? { 'Content-Type': file.type }, onProgress);
  return restJson<UploadedAttachment>('/uploads/confirm', { attachmentId: pre.attachmentId });
}

/** Hook dùng chung mọi màn: `const { upload, uploading } = useUpload()`. */
export function useUpload() {
  const [uploading, setUploading] = React.useState(0);
  const upload = React.useCallback(async (file: File, target: UploadTarget, onProgress?: (pct: number) => void) => {
    setUploading((n) => n + 1);
    try {
      return await uploadAttachment(file, target, onProgress);
    } finally {
      setUploading((n) => n - 1);
    }
  }, []);
  return { upload, uploading: uploading > 0 };
}
