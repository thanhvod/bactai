import { ApolloProvider } from '@apollo/client/react';
import { Route, Routes } from 'react-router-dom';
import { apolloClient } from '../lib/apollo';
import { AuthProvider } from './auth/auth-context';
import { MerchantGate } from './auth/merchant-gate';
import { RequireAuth } from './auth/require-auth';
import { MasterLayout } from './layout/master-layout';
import { CustomersPage } from './pages/customers-page';
import { DispatchPage } from './pages/dispatch-page';
import { DriversPage } from './pages/drivers-page';
import { FinancePage } from './pages/finance-page';
import { HomePage } from './pages/home-page';
import { LoginPage } from './pages/login-page';
import { OrderDetailPage } from './pages/order-detail-page';
import { OrdersPage } from './pages/orders-page';
import { PayrollPage } from './pages/payroll-page';
import { ReportsPage } from './pages/reports-page';
import { SettingsPage } from './pages/settings-page';
import { SuppliersPage } from './pages/suppliers-page';
import { VehiclesPage } from './pages/vehicles-page';

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <MerchantGate>
                  <MasterLayout />
                </MerchantGate>
              </RequireAuth>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/dispatch" element={<DispatchPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
