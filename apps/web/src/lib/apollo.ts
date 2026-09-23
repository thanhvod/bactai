import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, CombinedGraphQLErrors } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { getFirebaseIdToken } from './firebase';
import { API_URL, session } from './session';

/** Được AuthProvider gán để xử lý UNAUTHENTICATED / MERCHANT_REQUIRED tập trung. */
export const authEvents: { onUnauthenticated?: () => void; onMerchantRequired?: () => void } = {};

async function getToken(): Promise<string | null> {
  const dev = session.getDevToken();
  if (dev) return dev;
  return getFirebaseIdToken();
}

const authLink = new SetContextLink(async (prev) => {
  const token = await getToken();
  const merchantId = session.getMerchantId();
  return {
    headers: {
      ...(prev.headers ?? {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(merchantId ? { 'x-merchant-id': merchantId } : {}),
    },
  };
});

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const e of error.errors) {
      const code = (e.extensions as { code?: string } | undefined)?.code;
      if (code === 'UNAUTHENTICATED') authEvents.onUnauthenticated?.();
      if (code === 'MERCHANT_REQUIRED') authEvents.onMerchantRequired?.();
    }
  }
});

export const apollo = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, new HttpLink({ uri: `${API_URL}/graphql`, credentials: 'include' })]),
  cache: new InMemoryCache({
    possibleTypes: {},
    typePolicies: {
      Query: { fields: {} },
    },
  }),
  defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
});

/** Lấy thông điệp lỗi hiển thị cho người dùng. */
export function apolloErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) return error.errors.map((e) => e.message).join('; ');
  if (error instanceof Error) return error.message;
  return 'Đã xảy ra lỗi';
}

/** Lấy lỗi validation theo field (extensions.validation) nếu API trả. */
export function apolloValidation(error: unknown): { field: string; message: string }[] {
  if (!CombinedGraphQLErrors.is(error)) return [];
  return error.errors.flatMap((e) => ((e.extensions as { validation?: { field: string; message: string }[] })?.validation ?? []));
}
