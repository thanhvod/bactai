import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { changePasswordSchema, driverLoginSchema } from '@bta/shared';
import { hashPassword, randomToken, sha256, verifyPassword } from '@bta/db';
import { Auth, CurrentPrincipal, Public } from '../../common/auth/decorators';
import { ACCESS_TTL_SECONDS, JwtService, REFRESH_TTL_DAYS } from '../../common/auth/jwt.service';
import type { DriverPrincipal } from '../../common/context/request-context';
import { AppError, unauthenticated } from '../../common/errors/app-error';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';

function normalizePhone(p: string) {
  return p.replace(/[^\d+]/g, '').replace(/^\+84/, '0');
}

/** D-009: đăng nhập App Tài xế bằng SĐT + mật khẩu do merchant cấp. REST để app gọi trước khi có token. */
@Controller('driver/auth')
export class DriverAuthController {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: unknown) {
    const { phone, password } = parse(driverLoginSchema, body);
    const drivers = await this.prisma.raw.driver.findMany({
      where: { phone: normalizePhone(phone), status: 'ACTIVE', merchant: { status: 'ACTIVE' }, account: { isNot: null } },
      include: { account: true, merchant: true },
    });
    // SĐT unique theo merchant — cùng SĐT ở nhiều merchant: chọn tài khoản khớp mật khẩu.
    const match = drivers.find((d) => d.account && d.account.status !== 'DISABLED' && verifyPassword(password, d.account.passwordHash));
    if (!match || !match.account) throw new AppError('UNAUTHENTICATED', 'Số điện thoại hoặc mật khẩu không đúng');
    await this.prisma.raw.driverAccount.update({ where: { id: match.account.id }, data: { lastLoginAt: new Date() } });
    return this.issue(match.account.id, match.id, match.merchantId, {
      id: match.id,
      code: match.code,
      name: match.name,
      phone: match.phone,
      merchantId: match.merchantId,
      merchantName: match.merchant.name,
      mustChangePassword: match.account.mustChangePassword,
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { refreshToken?: string }) {
    if (!body?.refreshToken) throw unauthenticated();
    const token = await this.prisma.raw.driverRefreshToken.findUnique({
      where: { tokenHash: sha256(body.refreshToken) },
      include: { account: { include: { driver: { include: { merchant: true } } } } },
    });
    if (!token || token.revokedAt || token.expiresAt < new Date()) throw unauthenticated('Phiên đã hết hạn, vui lòng đăng nhập lại');
    const acc = token.account;
    if (acc.status === 'DISABLED' || acc.driver.status !== 'ACTIVE') throw unauthenticated('Tài khoản đã bị khóa');
    await this.prisma.raw.driverRefreshToken.update({ where: { id: token.id }, data: { revokedAt: new Date() } });
    const d = acc.driver;
    return this.issue(acc.id, d.id, d.merchantId, { id: d.id, code: d.code, name: d.name, phone: d.phone, merchantId: d.merchantId, merchantName: d.merchant.name, mustChangePassword: acc.mustChangePassword });
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: { refreshToken?: string }) {
    if (body?.refreshToken) {
      await this.prisma.raw.driverRefreshToken.updateMany({ where: { tokenHash: sha256(body.refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
    }
    return { ok: true };
  }

  @Auth('DRIVER')
  @Post('change-password')
  @HttpCode(200)
  async changePassword(@CurrentPrincipal() p: DriverPrincipal, @Body() body: unknown) {
    const { oldPassword, newPassword } = parse(changePasswordSchema, body);
    const acc = await this.prisma.raw.driverAccount.findUniqueOrThrow({ where: { id: p.accountId } });
    if (!verifyPassword(oldPassword, acc.passwordHash)) throw new AppError('VALIDATION_ERROR', 'Mật khẩu hiện tại không đúng', { validation: [{ field: 'oldPassword', message: 'Mật khẩu hiện tại không đúng' }] });
    await this.prisma.raw.driverAccount.update({ where: { id: acc.id }, data: { passwordHash: hashPassword(newPassword), mustChangePassword: false, status: 'ACTIVE' } });
    return { ok: true };
  }

  private async issue(accountId: string, driverId: string, merchantId: string, driver: Record<string, unknown>) {
    const refreshToken = randomToken();
    await this.prisma.raw.driverRefreshToken.create({
      data: { accountId, tokenHash: sha256(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 86_400_000) },
    });
    const accessToken = `drv.${this.jwt.sign({ sub: accountId, aud: 'driver', mid: merchantId, did: driverId })}`;
    return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SECONDS, driver };
  }
}
