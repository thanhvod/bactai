import { Injectable } from '@nestjs/common';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { AppError, businessRule, validationError } from '../errors/app-error';
import { PrismaService } from '../prisma/prisma.service';
import { env } from '../../config/env';
import { LogSmsSender, SnsSmsSender, isValidVnMobile, normalizeVnPhone, toE164Vn, type SmsSender } from './sms.sender';

export const OTP_TTL_SECONDS = 5 * 60;
export const OTP_RESEND_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_PER_HOUR = 5;
export const OTP_MAX_PER_DAY = 10;

export type OtpPurpose = 'CUSTOMER_LOGIN';

/** OTP SMS (D-013b): 6 số, hết hạn 5 phút, sai tối đa 5 lần, gửi lại sau 60s, giới hạn theo giờ/ngày. */
@Injectable()
export class OtpService {
  readonly sender: SmsSender = env().SMS_DRIVER === 'sns' ? new SnsSmsSender() : new LogSmsSender();

  constructor(private readonly prisma: PrismaService) {}

  private hash(phone: string, code: string) {
    return createHmac('sha256', env().OTP_SECRET).update(`${phone}:${code}`).digest('hex');
  }

  async request(rawPhone: string, purpose: OtpPurpose, ip?: string): Promise<{ phone: string; resendAfter: number; expiresIn: number; devCode?: string }> {
    const phone = normalizeVnPhone(rawPhone ?? '');
    if (!isValidVnMobile(phone)) throw validationError([{ field: 'phone', message: 'Số điện thoại di động không hợp lệ' }]);
    const now = Date.now();
    const recent = await this.prisma.raw.otpCode.findMany({
      where: { phone, purpose, createdAt: { gte: new Date(now - 86_400_000) } },
      orderBy: { createdAt: 'desc' },
    });
    const last = recent[0];
    if (last && now - last.createdAt.getTime() < OTP_RESEND_SECONDS * 1000) {
      const wait = Math.ceil((OTP_RESEND_SECONDS * 1000 - (now - last.createdAt.getTime())) / 1000);
      throw new AppError('BUSINESS_RULE_VIOLATION', `Vui lòng chờ ${wait} giây để gửi lại mã`, { details: { resendAfter: wait } });
    }
    if (recent.filter((r) => now - r.createdAt.getTime() < 3_600_000).length >= OTP_MAX_PER_HOUR || recent.length >= OTP_MAX_PER_DAY) {
      throw businessRule('Số điện thoại đã yêu cầu mã quá nhiều lần, vui lòng thử lại sau');
    }
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await this.prisma.raw.otpCode.create({
      data: { phone, purpose, codeHash: this.hash(phone, code), expiresAt: new Date(now + OTP_TTL_SECONDS * 1000), ip: ip ?? null },
    });
    await this.sender.send(toE164Vn(phone), `BTA: Ma xac thuc cua ban la ${code}. Hieu luc 5 phut. Khong chia se ma nay.`);
    return { phone, resendAfter: OTP_RESEND_SECONDS, expiresIn: OTP_TTL_SECONDS, ...(env().NODE_ENV === 'test' || env().SMS_DRIVER === 'log' ? { devCode: code } : {}) };
  }

  /** Kiểm tra mã; thành công thì đánh dấu đã dùng. Trả phone đã chuẩn hóa. */
  async verify(rawPhone: string, purpose: OtpPurpose, code: string): Promise<string> {
    const phone = normalizeVnPhone(rawPhone ?? '');
    const otp = await this.prisma.raw.otpCode.findFirst({
      where: { phone, purpose, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    const invalid = () => new AppError('UNAUTHENTICATED', 'Mã xác thực không đúng hoặc đã hết hạn');
    if (!otp || otp.expiresAt < new Date()) throw invalid();
    if (otp.attempts >= OTP_MAX_ATTEMPTS) throw new AppError('UNAUTHENTICATED', 'Nhập sai quá số lần cho phép, vui lòng yêu cầu mã mới');
    const expected = Buffer.from(otp.codeHash, 'hex');
    const got = Buffer.from(this.hash(phone, String(code ?? '').trim()), 'hex');
    if (expected.length !== got.length || !timingSafeEqual(expected, got)) {
      await this.prisma.raw.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      throw invalid();
    }
    const res = await this.prisma.raw.otpCode.updateMany({ where: { id: otp.id, consumedAt: null }, data: { consumedAt: new Date() } });
    if (res.count !== 1) throw invalid();
    return phone;
  }
}
