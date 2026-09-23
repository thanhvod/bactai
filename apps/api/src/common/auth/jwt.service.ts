import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export type TokenAudience = 'driver' | 'customer' | 'user';

export interface AccessClaims {
  sub: string; // accountId
  aud: TokenAudience;
  mid?: string; // merchantId (driver)
  did?: string; // driverId
}

export const ACCESS_TTL_SECONDS = 60 * 60; // 1h
export const REFRESH_TTL_DAYS = 30;

@Injectable()
export class JwtService {
  private secret(aud: TokenAudience) {
    return aud === 'driver' ? env().DRIVER_JWT_SECRET : aud === 'user' ? env().USER_JWT_SECRET : env().CUSTOMER_JWT_SECRET;
  }

  sign(claims: AccessClaims): string {
    return jwt.sign(claims, this.secret(claims.aud), { expiresIn: ACCESS_TTL_SECONDS });
  }

  verify(token: string, aud: TokenAudience): AccessClaims | null {
    try {
      return jwt.verify(token, this.secret(aud), { audience: aud }) as AccessClaims;
    } catch {
      return null;
    }
  }
}
