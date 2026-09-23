import * as React from 'react';

/** 0912345678 / +84 912 345 678 / 84912345678 → 0912345678 (khớp chuẩn hóa phía API). */
export function normalizePhone(input: string): string {
  const d = input.replace(/[^\d+]/g, '');
  if (d.startsWith('+84')) return `0${d.slice(3)}`;
  if (d.startsWith('84') && d.length >= 11) return `0${d.slice(2)}`;
  return d;
}

/** SĐT di động Việt Nam 10 số (03/05/07/08/09). */
export function isValidPhone(input: string): boolean {
  return /^0[35789]\d{8}$/.test(normalizePhone(input));
}

/** Chỉ giữ chữ số, tối đa 6 ký tự. */
export function sanitizeOtp(input: string): string {
  return input.replace(/\D/g, '').slice(0, 6);
}

/** 0912345678 → 0912 345 678 */
export function formatPhone(phone: string): string {
  const p = normalizePhone(phone);
  return p.length === 10 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p;
}

/** Số giây còn lại tới `until` (ms epoch), không âm. */
export function secondsLeft(until: number, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((until - now) / 1000));
}

/** Đếm ngược theo giây (gửi lại OTP). start(n) đặt mốc mới. */
export function useCountdown() {
  const [until, setUntil] = React.useState(0);
  const [, tick] = React.useState(0);
  React.useEffect(() => {
    if (secondsLeft(until) <= 0) return;
    const t = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [until]);
  return { left: secondsLeft(until), start: (seconds: number) => setUntil(Date.now() + seconds * 1000) };
}
