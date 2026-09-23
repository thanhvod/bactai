import { describe, expect, it } from 'vitest';
import { formatPhone, isValidPhone, normalizePhone, sanitizeOtp, secondsLeft } from '@/features/auth/otp';
import { paths } from '@/app/routes';

describe('CW-AUTH-01 OTP (D-013b)', () => {
  it('chuẩn hóa và kiểm tra SĐT di động VN', () => {
    expect(normalizePhone('+84 912 345 678')).toBe('0912345678');
    expect(normalizePhone('84912345678')).toBe('0912345678');
    expect(isValidPhone('0912 345 678')).toBe(true);
    expect(isValidPhone('+84912345678')).toBe(true);
    expect(isValidPhone('0212345678')).toBe(false); // không phải đầu số di động
    expect(isValidPhone('091234567')).toBe(false); // thiếu số
    expect(isValidPhone('abc')).toBe(false);
    expect(formatPhone('0912345678')).toBe('0912 345 678');
  });

  it('mã OTP chỉ nhận 6 chữ số', () => {
    expect(sanitizeOtp('12a3 45-678')).toBe('123456');
    expect(sanitizeOtp('12')).toBe('12');
  });

  it('đếm ngược gửi lại mã không âm, làm tròn lên giây', () => {
    const now = 1_000_000;
    expect(secondsLeft(now + 60_000, now)).toBe(60);
    expect(secondsLeft(now + 59_100, now)).toBe(60);
    expect(secondsLeft(now + 400, now)).toBe(1);
    expect(secondsLeft(now - 5_000, now)).toBe(0);
  });

  it('link đăng nhập giữ returnUrl, không còn ?mode=', () => {
    expect(paths.login('/bookings/new?merchantId=m1')).toBe('/login?returnUrl=%2Fbookings%2Fnew%3FmerchantId%3Dm1');
    expect(paths.login()).toBe('/login');
  });
});
