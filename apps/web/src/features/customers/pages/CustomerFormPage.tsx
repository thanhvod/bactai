import { useParams } from 'react-router';
import { RequirePermission } from '@/app/auth/guards';
import { CustomerList } from './CustomerListPage';
import { CustomerDetail } from './CustomerDetailPage';

/** WM-CUS-03 — Form khách hàng là drawer: /customers/new mở trên danh sách, /customers/:id/edit mở trên chi tiết. */
export default function CustomerFormPage() {
  const { customerId } = useParams();
  return <RequirePermission permission="customer.edit">{customerId ? <CustomerDetail editOpen /> : <CustomerList createOpen />}</RequirePermission>;
}
