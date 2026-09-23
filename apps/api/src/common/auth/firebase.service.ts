import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { env } from '../../config/env';

export interface VerifiedIdentity {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}

/** Verify Firebase ID token (D-006). Chỉ cần projectId — dùng public cert của Google, không cần service account. */
@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App | null = null;

  private get auth() {
    if (!this.app) {
      this.app = admin.apps.length ? admin.app() : admin.initializeApp({ projectId: env().FIREBASE_PROJECT_ID });
    }
    return this.app.auth();
  }

  async verifyIdToken(token: string): Promise<VerifiedIdentity | null> {
    try {
      const decoded = await this.auth.verifyIdToken(token);
      if (!decoded.email) return null;
      return { uid: decoded.uid, email: decoded.email.toLowerCase(), name: decoded.name, picture: decoded.picture };
    } catch (e) {
      this.logger.debug(`Firebase token invalid: ${(e as Error).message}`);
      return null;
    }
  }
}
