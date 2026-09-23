import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { changePasswordSchema } from '@bta/shared';
import { hashPassword, randomToken, sha256, verifyPassword } from '@bta/db';
import { z } from 'zod';
import { Auth, CurrentPrincipal, NoMerchant, Public } from '../../common/auth/decorators';
import { ACCESS_TTL_SECONDS, JwtService, REFRESH_TTL_DAYS } from '../../common/auth/jwt.service';
import type { UserPrincipal } from '../../common/context/request-context';
import { AppError, unauthenticated } from '../../common/errors/app-error';
import { normalizeVnPhone } from '../../common/otp/sms.sender';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';

const loginSchema = z.object({ phone: z.string().trim().min(8, 'Nhập số điện thoại'), password: z.string().min(1, 'Nhập mật khẩu') });

/**
 * D-014: App Merchant đăng nhập SĐT + mật khẩu. Token "usr.<jwt>" → cùng principal USER như web (chọn nhà xe qua
 * header x-merchant-id, quyền theo membership). OTP làm sau.
 */
@Controller('merchant/auth')
export class MerchantAuthController {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: unknown) {
    const { phone, password } = parse(loginSchema, body);
    const acc = await this.prisma.raw.userAccount.findUnique({ where: { phone: normalizeVnPhone(phone) } });
    if (!acc || !verifyPassword(password, acc.passwordHash)) throw new AppError('UNAUTHENTICATED', 'Số điện thoại hoặc mật khẩu không đúng');
    const active = await this.prisma.raw.merchantUser.count({ where: { accountId: acc.id, status: { in: ['ACTIVE', 'INVITED'] }, merchant: { status: 'ACTIVE' } } });
    if (!active) throw new AppError('UNAUTHENTICATED', 'Tài khoản chưa thuộc nhà xe nào hoặc đã bị khóa');
    await this.prisma.raw.userAccount.update({ where: { id: acc.id }, data: { lastLoginAt: new Date() } });
    return this.issue(acc);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { refreshToken?: string }) {
    if (!body?.refreshToken) throw unauthenticated();
    const t = await this.prisma.raw.userRefreshToken.findUnique({ where: { tokenHash: sha256(body.refreshToken) }, include: { account: true } });
    if (!t || t.revokedAt || t.expiresAt < new Date() || !t.account.passwordHash) throw unauthenticated('Phiên đã hết hạn, vui lòng đăng nhập lại');
    await this.prisma.raw.userRefreshToken.update({ where: { id: t.id }, data: { revokedAt: new Date() } });
    return this.issue(t.account);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: { refreshToken?: string }) {
    if (body?.refreshToken) await this.prisma.raw.userRefreshToken.updateMany({ where: { tokenHash: sha256(body.refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
    return { ok: true };
  }

  @Auth('USER')
  @NoMerchant()
  @Post('change-password')
  @HttpCode(200)
  async changePassword(@CurrentPrincipal() p: UserPrincipal, @Body() body: unknown) {
    const { oldPassword, newPassword } = parse(changePasswordSchema, body);
    const acc = await this.prisma.raw.userAccount.findUniqueOrThrow({ where: { id: p.accountId } });
    if (!verifyPassword(oldPassword, acc.passwordHash)) {
      throw new AppError('VALIDATION_ERROR', 'Mật khẩu hiện tại không đúng', { validation: [{ field: 'oldPassword', message: 'Mật khẩu hiện tại không đúng' }] });
    }
    await this.prisma.raw.userAccount.update({ where: { id: acc.id }, data: { passwordHash: hashPassword(newPassword), mustChangePassword: false, passwordUpdatedAt: new Date() } });
    return { ok: true };
  }

  private async issue(acc: { id: string; email: string; name: string | null; phone: string | null; mustChangePassword: boolean }) {
    const refreshToken = randomToken();
    await this.prisma.raw.userRefreshToken.create({ data: { accountId: acc.id, tokenHash: sha256(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 86_400_000) } });
    return {
      accessToken: `usr.${this.jwt.sign({ sub: acc.id, aud: 'user' })}`,
      refreshToken,
      expiresIn: ACCESS_TTL_SECONDS,
      account: { id: acc.id, email: acc.email, name: acc.name, phone: acc.phone, mustChangePassword: acc.mustChangePassword },
    };
  }
}
