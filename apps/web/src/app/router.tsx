import * as React from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { AppShell } from './shell/AppShell';
import { RedirectIfAuthenticated, RequireAccount, RequireAuth } from './auth/guards';
import { ErrorState } from '@bta/shadcn';

const lazy = (loader: () => Promise<{ default: React.ComponentType }>) => ({ Component: React.lazy(loader) });

function RouteError() {
  return <ErrorState title="Không tìm thấy trang" error="Đường dẫn không tồn tại hoặc bạn không có quyền." onRetry={() => (window.location.href = '/')} />;
}

// Route theo design/spec/routes.web.ts (WM-*). Drawer/dialog (overlayOf) không có route riêng.
const appRoutes: RouteObject[] = [
  { index: true, ...lazy(() => import('@/features/dashboard/pages/DashboardPage')) },
  { path: 'dashboard/operations', ...lazy(() => import('@/features/dashboard/pages/DashboardOperationsPage')) },
  { path: 'dashboard/finance', ...lazy(() => import('@/features/dashboard/pages/DashboardFinancePage')) },

  { path: 'orders', ...lazy(() => import('@/features/orders/pages/OrderListPage')) },
  { path: 'orders/new', ...lazy(() => import('@/features/orders/pages/OrderFormPage')) },
  { path: 'orders/:orderId', ...lazy(() => import('@/features/orders/pages/OrderDetailPage')) },
  { path: 'orders/:orderId/edit', ...lazy(() => import('@/features/orders/pages/OrderFormPage')) },
  { path: 'orders/:orderId/print', ...lazy(() => import('@/features/orders/pages/OrderPrintPage')) },
  { path: 'bookings', ...lazy(() => import('@/features/orders/pages/BookingsPage')) },
  { path: 'orders/:orderId/stops/:stopId', ...lazy(() => import('@/features/orders/pages/StopDetailPage')) },
  { path: 'orders/:orderId/trips/new', ...lazy(() => import('@/features/dispatch/pages/TripFormPage')) },
  { path: 'trips/:tripId', ...lazy(() => import('@/features/dispatch/pages/TripDetailPage')) },
  { path: 'trips/:tripId/edit', ...lazy(() => import('@/features/dispatch/pages/TripFormPage')) },

  { path: 'dispatch', ...lazy(() => import('@/features/dispatch/pages/DispatchBoardPage')) },
  { path: 'dispatch/calendar', ...lazy(() => import('@/features/dispatch/pages/DispatchCalendarPage')) },
  { path: 'dispatch/conflicts', ...lazy(() => import('@/features/dispatch/pages/DispatchConflictsPage')) },
  { path: 'dispatch/map', ...lazy(() => import('@/features/dispatch/pages/DispatchMapPage')) },
  { path: 'dispatch/incidents', ...lazy(() => import('@/features/dispatch/pages/IncidentListPage')) },
  { path: 'dispatch/incidents/:incidentId', ...lazy(() => import('@/features/dispatch/pages/IncidentDetailPage')) },

  { path: 'customers', ...lazy(() => import('@/features/customers/pages/CustomerListPage')) },
  { path: 'customers/new', ...lazy(() => import('@/features/customers/pages/CustomerFormPage')) },
  { path: 'customers/:customerId', ...lazy(() => import('@/features/customers/pages/CustomerDetailPage')) },
  { path: 'customers/:customerId/edit', ...lazy(() => import('@/features/customers/pages/CustomerFormPage')) },
  { path: 'customers/:customerId/locations', ...lazy(() => import('@/features/customers/pages/CustomerLocationsPage')) },

  { path: 'drivers', ...lazy(() => import('@/features/drivers/pages/DriverListPage')) },
  { path: 'drivers/new', ...lazy(() => import('@/features/drivers/pages/DriverFormPage')) },
  { path: 'drivers/:driverId', ...lazy(() => import('@/features/drivers/pages/DriverDetailPage')) },
  { path: 'drivers/:driverId/edit', ...lazy(() => import('@/features/drivers/pages/DriverFormPage')) },
  { path: 'drivers/:driverId/salary-history', ...lazy(() => import('@/features/drivers/pages/DriverSalaryHistoryPage')) },

  { path: 'vehicles', ...lazy(() => import('@/features/vehicles/pages/VehicleListPage')) },
  { path: 'vehicles/new', ...lazy(() => import('@/features/vehicles/pages/VehicleFormPage')) },
  { path: 'vehicles/:vehicleId', ...lazy(() => import('@/features/vehicles/pages/VehicleDetailPage')) },
  { path: 'vehicles/:vehicleId/edit', ...lazy(() => import('@/features/vehicles/pages/VehicleFormPage')) },

  { path: 'suppliers', ...lazy(() => import('@/features/suppliers/pages/SupplierListPage')) },
  { path: 'suppliers/new', ...lazy(() => import('@/features/suppliers/pages/SupplierFormPage')) },
  { path: 'suppliers/:supplierId', ...lazy(() => import('@/features/suppliers/pages/SupplierDetailPage')) },
  { path: 'suppliers/:supplierId/edit', ...lazy(() => import('@/features/suppliers/pages/SupplierFormPage')) },

  { path: 'finance', ...lazy(() => import('@/features/finance/pages/FinanceLedgerPage')) },
  { path: 'finance/payments', ...lazy(() => import('@/features/finance/pages/PaymentListPage')) },
  { path: 'finance/payments/new', ...lazy(() => import('@/features/finance/pages/PaymentFormPage')) },
  { path: 'finance/payments/:paymentId', ...lazy(() => import('@/features/finance/pages/PaymentDetailPage')) },
  { path: 'finance/payments/:paymentId/allocate', ...lazy(() => import('@/features/finance/pages/PaymentAllocatePage')) },
  { path: 'finance/expenses', ...lazy(() => import('@/features/finance/pages/ExpenseListPage')) },
  { path: 'finance/expenses/new', ...lazy(() => import('@/features/finance/pages/ExpenseFormPage')) },
  { path: 'finance/expenses/:expenseId', ...lazy(() => import('@/features/finance/pages/ExpenseDetailPage')) },
  { path: 'finance/customer-debt', ...lazy(() => import('@/features/finance/pages/CustomerDebtPage')) },
  { path: 'finance/supplier-debt', ...lazy(() => import('@/features/finance/pages/SupplierDebtPage')) },
  { path: 'finance/debt-statements', ...lazy(() => import('@/features/finance/pages/DebtStatementListPage')) },
  { path: 'finance/debt-statements/:statementId', ...lazy(() => import('@/features/finance/pages/DebtStatementDetailPage')) },
  { path: 'finance/cod', ...lazy(() => import('@/features/finance/pages/CodHeldPage')) },
  { path: 'finance/trip-advances', ...lazy(() => import('@/features/finance/pages/TripAdvancePage')) },

  { path: 'payroll', ...lazy(() => import('@/features/payroll/pages/PayrollListPage')) },
  { path: 'payroll/new', ...lazy(() => import('@/features/payroll/pages/PayrollCreatePage')) },
  { path: 'payroll/:payrollId', ...lazy(() => import('@/features/payroll/pages/PayrollDetailPage')) },
  { path: 'payroll/:payrollId/lines/:lineId', ...lazy(() => import('@/features/payroll/pages/PayrollLinePage')) },
  { path: 'payroll/:payrollId/approve', ...lazy(() => import('@/features/payroll/pages/PayrollApprovePage')) },

  { path: 'reports', ...lazy(() => import('@/features/reports/pages/ReportCenterPage')) },
  { path: 'reports/profit', ...lazy(() => import('@/features/reports/pages/ReportProfitPage')) },
  { path: 'reports/vehicles', ...lazy(() => import('@/features/reports/pages/ReportVehiclesPage')) },
  { path: 'reports/drivers', ...lazy(() => import('@/features/reports/pages/ReportDriversPage')) },
  { path: 'reports/customer-debt', ...lazy(() => import('@/features/reports/pages/ReportCustomerDebtPage')) },
  { path: 'reports/cod', ...lazy(() => import('@/features/reports/pages/ReportCodPage')) },
  { path: 'reports/payroll', ...lazy(() => import('@/features/reports/pages/ReportPayrollPage')) },

  { path: 'settings', element: <Navigate to="/settings/company" replace /> },
  { path: 'settings/company', ...lazy(() => import('@/features/settings/pages/CompanyProfilePage')) },
  { path: 'settings/users', ...lazy(() => import('@/features/settings/pages/UserListPage')) },
  { path: 'settings/users/new', ...lazy(() => import('@/features/settings/pages/UserInvitePage')) },
  { path: 'settings/users/:userId', ...lazy(() => import('@/features/settings/pages/UserDetailPage')) },
  { path: 'settings/roles', ...lazy(() => import('@/features/settings/pages/RolesPage')) },
  { path: 'settings/operations', ...lazy(() => import('@/features/settings/pages/OperationSettingsPage')) },
  { path: 'settings/numbering', ...lazy(() => import('@/features/settings/pages/NumberingSettingsPage')) },
  { path: 'settings/catalogs', ...lazy(() => import('@/features/settings/pages/CatalogPage')) },

  ...(import.meta.env.DEV ? [{ path: 'dev/components', ...lazy(() => import('@/features/dev/pages/ComponentsGalleryPage')) }] : []),
  { path: '*', element: <RouteError /> },
];

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthenticated />,
    children: [{ path: '/login', ...lazy(() => import('@/features/auth/pages/LoginPage')) }],
  },
  {
    element: <RequireAccount />,
    children: [
      { path: '/select-merchant', ...lazy(() => import('@/features/auth/pages/SelectMerchantPage')) },
      { path: '/onboarding/merchant', ...lazy(() => import('@/features/auth/pages/OnboardingMerchantPage')) },
      { path: '/access-pending', ...lazy(() => import('@/features/auth/pages/AccessPendingPage')) },
    ],
  },
  {
    element: <RequireAuth />,
    children: [{ path: '/', element: <AppShell />, children: appRoutes }],
  },
]);
