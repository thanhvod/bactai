import { API_URL, session, type AuthPayload, type OtpVerifyPayload } from './session';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public validation?: { field: string; message: string }[],
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export interface OtpRequestResult {
  phone: string;
  resendAfter: number;
  expiresIn: number;
  /** Chỉ có ở môi trường dev (SMS_DRIVER=log). */
  devCode?: string;
}

async function post<T>(path: string, body: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (auth) {
    const t = session.getAccess();
    if (t) headers.authorization = `Bearer ${t}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}/customer/auth/${path}`, { method: 'POST', headers, body: JSON.stringify(body ?? {}) });
  } catch {
    throw new ApiError('NETWORK', 'Không kết nối được máy chủ, vui lòng thử lại');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.code ?? 'ERROR', data.message ?? 'Đã xảy ra lỗi', data.validation, data.details);
  return data as T;
}

/** D-013b: đăng nhập/đăng ký bằng SĐT + OTP — không mật khẩu, không đặt lại qua email. */
export const authApi = {
  requestOtp: (phone: string) => post<OtpRequestResult>('otp/request', { phone }),
  verifyOtp: (input: { phone: string; code: string; fullName?: string | null; companyName?: string | null }) =>
    post<OtpVerifyPayload>('otp/verify', input),
  logout: (refreshToken: string) => post<{ ok: boolean }>('logout', { refreshToken }),
};

let refreshing: Promise<boolean> | null = null;

/** Làm mới access token (1 request dùng chung khi nhiều query cùng hết hạn). */
export function refreshTokens(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const rt = session.getRefresh();
      if (!rt) return false;
      try {
        const p = await post<AuthPayload>('refresh', { refreshToken: rt });
        session.save(p);
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      setTimeout(() => (refreshing = null), 0);
    });
  }
  return refreshing;
}
