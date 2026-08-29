import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

/** Verify Firebase ID token (D-006). Chỉ cần projectId — SDK tự lấy public key của Google. */
@Injectable()
export class FirebaseService {
  private app: admin.app.App;

  constructor() {
    this.app =
      admin.apps.length > 0
        ? admin.app()
        : admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || 'bac-tai-app',
          });
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    // Chỉ cho test cục bộ: DEV_AUTH_BYPASS=1 + token dạng "dev:<email>". KHÔNG bật ở production.
    if (process.env.DEV_AUTH_BYPASS === '1' && token.startsWith('dev:')) {
      const email = token.slice(4);
      return { uid: `dev-${email}`, email, name: email.split('@')[0] } as unknown as admin.auth.DecodedIdToken;
    }
    try {
      return await this.app.auth().verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
