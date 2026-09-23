import { useNavigate, useParams } from 'react-router';
import { RequirePermission } from '@/app/auth/guards';
import { paths } from '@/app/routes';
import { OrderDetailView } from './OrderDetailPage';

/** WM-STOP-01 — Chi tiết điểm dừng: drawer mở trên nền chi tiết đơn (route /orders/:orderId/stops/:stopId). */
export default function StopDetailPage() {
  const { orderId = '', stopId = '' } = useParams();
  const navigate = useNavigate();
  return (
    <RequirePermission permission="order.view">
      <OrderDetailView openStopId={stopId} onStopClose={() => navigate(paths.order(orderId, 'stops'), { replace: true })} />
    </RequirePermission>
  );
}
