/** Phiên khách hàng: token lưu localStorage (D-013b — đăng nhập SĐT + OTP). */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export interface CustomerAccountInfo {
  id: string;
  email?: string | null;
  fullName: string;
  phone: string;
  companyName?: string | null;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  account: CustomerAccountInfo;
}

export interface OtpVerifyPayload extends AuthPayload {
  isNew: boolean;
  profileIncomplete: boolean;
}

const K = { access: 'bta.cus.access', refresh: 'bta.cus.refresh', account: 'bta.cus.account' };

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export const session = {
  getAccess: () => safe(() => localStorage.getItem(K.access), null),
  getRefresh: () => safe(() => localStorage.getItem(K.refresh), null),
  getAccount: (): CustomerAccountInfo | null => safe(() => JSON.parse(localStorage.getItem(K.account) ?? 'null'), null),
  save(p: AuthPayload) {
    safe(() => {
      localStorage.setItem(K.access, p.accessToken);
      localStorage.setItem(K.refresh, p.refreshToken);
      localStorage.setItem(K.account, JSON.stringify(p.account));
    }, undefined);
  },
  setAccount(a: CustomerAccountInfo) {
    safe(() => localStorage.setItem(K.account, JSON.stringify(a)), undefined);
  },
  clear() {
    safe(() => Object.values(K).forEach((k) => localStorage.removeItem(k)), undefined);
  },
};
