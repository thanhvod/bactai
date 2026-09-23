import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { randomToken, sha256 } from '@bta/db';
import { z } from 'zod';
import { Public } from '../../common/auth/decorators';
import { ACCESS_TTL_SECONDS, JwtService, REFRESH_TTL_DAYS } from '../../common/auth/jwt.service';
import { unauthenticated } from '../../common/errors/app-error';
import { OtpService } from '../../common/otp/otp.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';

const requestSchema = z.object({ phone: z.string().trim().min(8, 'Nhập số điện thoại') });
const verifySchema = z.object({
  phone: z.string().trim().min(8),
  code: z.string().trim().regex(/^\d{6}$/, 'Mã gồm 6 chữ số'),
  // Dùng khi tài khoản mới — có thể bổ sung sau qua updateCustomerProfile
  fullName: z.string().trim().max(200).optional().nullable(),
  companyName: z.string().trim().max(300).optional().nullable(),
});

/**
 * D-013b: Web Khách hàng đăng nhập/đăng ký bằng SĐT + OTP SMS. Không mật khẩu, không đặt lại qua email.
 * Tài khoản chưa có sẽ được tạo khi xác thực OTP lần đầu (profileIncomplete=true → UI mời điền tên).
 */
@Controller('customer/auth')
export class CustomerAuthController {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly otp: OtpService) {}

  @Public()
  @Post('otp/request')
  @HttpCode(200)
  request(@Body() body: unknown, @Req() req: Request) {
    const { phone } = parse(requestSchema, body);
    return this.otp.request(phone, 'CUSTOMER_LOGIN', req.ip);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(200)
  async verify(@Body() body: unknown) {
    const d = parse(verifySchema, body);
    const phone = await this.otp.verify(d.phone, 'CUSTOMER_LOGIN', d.code);
    let acc = await this.prisma.raw.customerAccount.findUnique({ where: { phone } });
    let isNew = false;
    if (!acc) {
      isNew = true;
      acc = await this.prisma.raw.customerAccount.create({
        data: { phone, fullName: d.fullName?.trim() || phone, companyName: d.companyName ?? null },
      });
      // Tự liên kết hồ sơ khách của các nhà xe có cùng SĐT, chưa gắn tài khoản.
      await this.prisma.raw.customer.updateMany({ where: { portalAccountId: null, phone }, data: { portalAccountId: acc.id } });
    }
    if (acc.status !== 'ACTIVE') throw unauthenticated('Tài khoản đã bị khóa');
    await this.prisma.raw.customerAccount.update({ where: { id: acc.id }, data: { lastLoginAt: new Date() } });
    return { ...(await this.issue(acc)), isNew, profileIncomplete: acc.fullName === acc.phone };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { refreshToken?: string }) {
    if (!body?.refreshToken) throw unauthenticated();
    const t = await this.prisma.raw.customerRefreshToken.findUnique({ where: { tokenHash: sha256(body.refreshToken) }, include: { account: true } });
    if (!t || t.revokedAt || t.expiresAt < new Date() || t.account.status !== 'ACTIVE') throw unauthenticated('Phiên đã hết hạn');
    await this.prisma.raw.customerRefreshToken.update({ where: { id: t.id }, data: { revokedAt: new Date() } });
    return this.issue(t.account);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: { refreshToken?: string }) {
    if (body?.refreshToken) await this.prisma.raw.customerRefreshToken.updateMany({ where: { tokenHash: sha256(body.refreshToken) }, data: { revokedAt: new Date() } });
    return { ok: true };
  }

  private async issue(acc: { id: string; email: string | null; fullName: string; phone: string; companyName: string | null }) {
    const refreshToken = randomToken();
    await this.prisma.raw.customerRefreshToken.create({ data: { accountId: acc.id, tokenHash: sha256(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 86_400_000) } });
    return {
      accessToken: `cus.${this.jwt.sign({ sub: acc.id, aud: 'customer' })}`,
      refreshToken,
      expiresIn: ACCESS_TTL_SECONDS,
      account: { id: acc.id, email: acc.email, fullName: acc.fullName, phone: acc.phone, companyName: acc.companyName },
    };
  }
}
