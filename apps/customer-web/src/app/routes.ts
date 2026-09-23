/** Route Web Khách hàng — khớp design/spec/routes.web.ts (CW-*). */
export const PATHS = {
  login: '/login',
  home: '/',
  merchant: '/merchants/:merchantId',
  bookingNew: '/bookings/new',
  bookingEdit: '/bookings/:bookingId/edit',
  bookings: '/bookings',
  booking: '/bookings/:bookingId',
  orders: '/orders',
  order: '/orders/:orderId',
  debt: '/debt-statements',
  profile: '/profile',
  addresses: '/addresses',
  notifications: '/notifications',
} as const;

export const paths = {
  login: (returnUrl?: string) => {
    const q = new URLSearchParams();
    if (returnUrl && returnUrl !== '/login') q.set('returnUrl', returnUrl);
    const s = q.toString();
    return s ? `/login?${s}` : '/login';
  },
  home: () => '/',
  merchant: (id: string) => `/merchants/${id}`,
  bookingNew: (merchantId?: string | null) => (merchantId ? `/bookings/new?merchantId=${merchantId}` : '/bookings/new'),
  bookingEdit: (id: string) => `/bookings/${id}/edit`,
  bookings: () => '/bookings',
  booking: (id: string) => `/bookings/${id}`,
  orders: () => '/orders',
  order: (id: string) => `/orders/${id}`,
  debt: (statementId?: string) => (statementId ? `/debt-statements?statement=${statementId}` : '/debt-statements'),
  profile: () => '/profile',
  addresses: (pick?: boolean) => (pick ? '/addresses?pick=1' : '/addresses'),
  notifications: () => '/notifications',
};
