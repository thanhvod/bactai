import { ApolloClient, HttpLink, InMemoryCache, CombinedGraphQLErrors } from '@apollo/client';
import { refreshTokens } from './auth-api';
import { API_URL, session } from './session';

/** AuthProvider gán để đăng xuất khi refresh thất bại. */
export const authEvents: { onUnauthenticated?: () => void } = {};

function withAuth(init: RequestInit | undefined): RequestInit {
  const headers = new Headers(init?.headers);
  const t = session.getAccess();
  if (t) headers.set('authorization', `Bearer ${t}`);
  else headers.delete('authorization');
  return { ...init, headers };
}

function isUnauthenticated(body: unknown): boolean {
  const errs = (body as { errors?: { extensions?: { code?: string } }[] })?.errors;
  return !!errs?.some((e) => e.extensions?.code === 'UNAUTHENTICATED');
}

/** fetch: nếu API trả UNAUTHENTICATED và còn refresh token → refresh 1 lần rồi gửi lại. */
export const authFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, withAuth(init));
  if (!session.getAccess()) return res;
  const clone = res.clone();
  const body = await clone.json().catch(() => null);
  if (res.status === 401 || isUnauthenticated(body)) {
    if (await refreshTokens()) return fetch(input, withAuth(init));
    session.clear();
    authEvents.onUnauthenticated?.();
  }
  return res;
};

export const apollo = new ApolloClient({
  link: new HttpLink({ uri: `${API_URL}/graphql`, fetch: authFetch }),
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
});

export function apolloErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) return error.errors.map((e) => e.message).join('; ');
  if (error instanceof Error) return error.message;
  return 'Đã xảy ra lỗi';
}

export function errorCode(error: unknown): string | undefined {
  if (CombinedGraphQLErrors.is(error)) return (error.errors[0]?.extensions as { code?: string } | undefined)?.code;
  return undefined;
}
