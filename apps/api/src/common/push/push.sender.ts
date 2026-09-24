import { Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'node:fs';
import { env } from '../../config/env';

export interface PushMessage {
  title: string;
  body?: string | null;
  data: Record<string, string>;
}

export interface PushResult {
  /** token FCM báo không còn hợp lệ → xóa khỏi DB */
  invalidTokens: string[];
  success: number;
  failure: number;
}

export interface PushSender {
  readonly enabled: boolean;
  send(tokens: string[], msg: PushMessage): Promise<PushResult>;
}

/** Thiếu cấu hình: không gửi, chỉ log debug. */
export class NoopPushSender implements PushSender {
  readonly enabled = false;
  async send(tokens: string[]): Promise<PushResult> {
    return { invalidTokens: [], success: 0, failure: tokens.length ? 0 : 0 };
  }
}

/** Test: ghi lại tin đã gửi để assert. */
export class MemoryPushSender implements PushSender {
  readonly enabled = true;
  readonly sent: { tokens: string[]; msg: PushMessage }[] = [];
  invalid = new Set<string>();
  async send(tokens: string[], msg: PushMessage): Promise<PushResult> {
    this.sent.push({ tokens, msg });
    const invalidTokens = tokens.filter((t) => this.invalid.has(t));
    return { invalidTokens, success: tokens.length - invalidTokens.length, failure: invalidTokens.length };
  }
}

const INVALID_CODES = new Set(['messaging/registration-token-not-registered', 'messaging/invalid-registration-token', 'messaging/invalid-argument']);

/**
 * D-017: FCM qua firebase-admin. `FIREBASE_SERVICE_ACCOUNT` = JSON service account (chuỗi JSON, base64, hoặc đường dẫn file).
 */
export class FcmPushSender implements PushSender {
  readonly enabled = true;
  private readonly logger = new Logger('FCM');
  private readonly app: admin.app.App;

  constructor(serviceAccount: admin.ServiceAccount) {
    const existing = admin.apps.find((a) => a?.name === 'bta-push');
    this.app = existing ?? admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId: env().FIREBASE_PROJECT_ID }, 'bta-push');
  }

  async send(tokens: string[], msg: PushMessage): Promise<PushResult> {
    const invalidTokens: string[] = [];
    let success = 0;
    let failure = 0;
    for (let i = 0; i < tokens.length; i += 500) {
      const chunk = tokens.slice(i, i + 500);
      const res = await this.app.messaging().sendEachForMulticast({
        tokens: chunk,
        notification: { title: msg.title, body: msg.body ?? undefined },
        data: msg.data,
        android: { priority: 'high', notification: { channelId: 'bta_default', sound: 'default' } },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
      success += res.successCount;
      failure += res.failureCount;
      res.responses.forEach((r, idx) => {
        if (!r.success && r.error && INVALID_CODES.has(r.error.code)) invalidTokens.push(chunk[idx]);
        else if (!r.success) this.logger.warn(`FCM lỗi: ${r.error?.code} ${r.error?.message}`);
      });
    }
    return { invalidTokens, success, failure };
  }
}

export function loadServiceAccount(raw: string | undefined): admin.ServiceAccount | null {
  if (!raw?.trim()) return null;
  try {
    const text = raw.trim().startsWith('{')
      ? raw
      : fs.existsSync(raw.trim())
        ? fs.readFileSync(raw.trim(), 'utf8')
        : Buffer.from(raw.trim(), 'base64').toString('utf8');
    const json = JSON.parse(text);
    return { projectId: json.project_id, clientEmail: json.client_email, privateKey: json.private_key };
  } catch {
    return null;
  }
}
