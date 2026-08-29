import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@bta/shadcn';
import { Link } from 'react-router-dom';
import { formatDateTime, formatMoney } from '../../lib/format';
import { PageHeader } from '../components/page-shell';
import { StatusBadge } from '../components/status-badge';

const DASHBOARD = gql`
  query Dashboard {
    dashboard {
      runningTrips ordersInProgress ordersAwaitingDispatch overdueOrders
      totalReceivable overdueReceivable
      activeTrips { id orderId orderCode vehiclePlate driverName status plannedStartAt pauseReasonName }
    }
  }
`;

export function HomePage() {
  // Polling 30s — "gần realtime" phase 1 (08-kien-truc.md mục 5)
  const { data } = useQuery<any>(DASHBOARD, { pollInterval: 30_000 });
  const d = data?.dashboard;

  const stats: [string, string, string?][] = d
    ? [
        ['Chuyến đang chạy', String(d.runningTrips)],
        ['Đơn đang thực hiện', String(d.ordersInProgress)],
        ['Đơn chờ xếp xe', String(d.ordersAwaitingDispatch)],
        ['Đơn quá hạn thanh toán', String(d.overdueOrders), d.overdueOrders > 0 ? 'cần thu hồi' : undefined],
        ['Tổng công nợ khách', formatMoney(d.totalReceivable)],
        ['Công nợ quá hạn', formatMoney(d.overdueReceivable)],
      ]
    : [];

  return (
    <div className="grid gap-4">
      <PageHeader title="Tổng quan" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map(([label, value, hint]) => (
          <Card key={label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{value}</div>
              {hint && <div className="text-xs text-red-600">{hint}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Xe đang chạy</CardTitle></CardHeader>
        <CardContent>
          {!d || d.activeTrips.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có chuyến nào đang chạy</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn</TableHead><TableHead>Xe</TableHead><TableHead>Tài xế</TableHead>
                  <TableHead>Trạng thái</TableHead><TableHead>Dự kiến chạy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.activeTrips.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <Link className="hover:underline" to={`/orders/${t.orderId}`}>{t.orderCode}</Link>
                    </TableCell>
                    <TableCell>{t.vehiclePlate}</TableCell>
                    <TableCell>{t.driverName}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} label={t.status === 'PAUSED' && t.pauseReasonName ? `Tạm dừng — ${t.pauseReasonName}` : undefined} />
                    </TableCell>
                    <TableCell>{formatDateTime(t.plannedStartAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
