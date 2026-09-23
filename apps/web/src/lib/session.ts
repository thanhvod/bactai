/** Lưu phiên phía client: dev token (sessionStorage) + merchant đã chọn (localStorage). */
const DEV_TOKEN_KEY = 'bta.devToken';
const MERCHANT_KEY = 'bta.merchantId';

export const AUTH_DEV_BYPASS = import.meta.env.VITE_AUTH_DEV_BYPASS === 'true';
export const API_URL = import.meta.env.VITE_API_URL ?? '';

export const session = {
  getDevToken(): string | null {
    try {
      return sessionStorage.getItem(DEV_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setDevToken(email: string | null) {
    try {
      if (email) sessionStorage.setItem(DEV_TOKEN_KEY, `dev:${email}`);
      else sessionStorage.removeItem(DEV_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
  getMerchantId(): string | null {
    try {
      return localStorage.getItem(MERCHANT_KEY);
    } catch {
      return null;
    }
  },
  setMerchantId(id: string | null) {
    try {
      if (id) localStorage.setItem(MERCHANT_KEY, id);
      else localStorage.removeItem(MERCHANT_KEY);
    } catch {
      /* ignore */
    }
  },
  clear() {
    this.setDevToken(null);
    this.setMerchantId(null);
  },
};
