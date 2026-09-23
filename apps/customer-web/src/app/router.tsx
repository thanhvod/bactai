import * as React from 'react';
import { createBrowserRouter } from 'react-router';
import { DetailSkeleton } from '@bta/shadcn';
import { CustomerShell } from './shell/CustomerShell';
import { RequireCustomer } from './auth/RequireCustomer';
import { PATHS } from './routes';

const lazy = (load: () => Promise<{ default: React.ComponentType }>) => {
  const C = React.lazy(load);
  return (
    <React.Suspense fallback={<DetailSkeleton />}>
      <C />
    </React.Suspense>
  );
};

export const router = createBrowserRouter([
  { path: PATHS.login, element: lazy(() => import('@/features/auth/LoginPage')) },
  {
    element: <CustomerShell />,
    children: [
      { path: PATHS.home, element: lazy(() => import('@/features/home/HomePage')) },
      { path: PATHS.merchant, element: lazy(() => import('@/features/merchants/MerchantPage')) },
      {
        element: <RequireCustomer />,
        children: [
          { path: PATHS.bookingNew, element: lazy(() => import('@/features/bookings/BookingFormPage')) },
          { path: PATHS.bookingEdit, element: lazy(() => import('@/features/bookings/BookingFormPage')) },
          { path: PATHS.bookings, element: lazy(() => import('@/features/bookings/BookingListPage')) },
          { path: PATHS.booking, element: lazy(() => import('@/features/bookings/BookingDetailPage')) },
          { path: PATHS.orders, element: lazy(() => import('@/features/orders/OrderListPage')) },
          { path: PATHS.order, element: lazy(() => import('@/features/orders/OrderDetailPage')) },
          { path: PATHS.debt, element: lazy(() => import('@/features/debt/DebtStatementsPage')) },
          { path: PATHS.profile, element: lazy(() => import('@/features/profile/ProfilePage')) },
          { path: PATHS.addresses, element: lazy(() => import('@/features/addresses/AddressesPage')) },
          { path: PATHS.notifications, element: lazy(() => import('@/features/notifications/NotificationsPage')) },
        ],
      },
      { path: '*', element: lazy(() => import('@/features/home/NotFoundPage')) },
    ],
  },
]);
