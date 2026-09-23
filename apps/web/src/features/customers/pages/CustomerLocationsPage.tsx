import { RequirePermission } from '@/app/auth/guards';
import { CustomerDetail } from './CustomerDetailPage';

/** WM-CUS-04 — Sổ địa chỉ là tab của chi tiết khách (route /customers/:id/locations). */
export default function CustomerLocationsPage() {
  return (
    <RequirePermission permission="customer.view">
      <CustomerDetail initialTab="locations" />
    </RequirePermission>
  );
}
