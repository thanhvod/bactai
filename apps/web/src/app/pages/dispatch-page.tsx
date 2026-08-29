import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea,
} from '@bta/shadcn';
import { TRIP_STATUS_LABEL } from '@bta/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../lib/format';
import { EmptyState, Field, FormDialog, PageHeader } from '../components/page-shell';
import { StatusBadge } from '../components/status-badge';

const TRIPS = gql`
  query DispatchTrips {
    trips {
      id orderId orderCode vehiclePlate driverName status
      plannedStartAt plannedEndAt pauseReasonName pauseNote driverBonus
    }
  }
`;
const AWAITING = gql`
  query AwaitingOrders {
    orders {
      id code customerName status tripCount createdAt
    }
  }
`;
const PAUSE_REASONS = gql`query PauseReasons { catalogItems(kind: PAUSE_REASON) { id name } }`;
const UPDATE_TRIP_STATUS = gql`
  mutation UpdateTripStatus($id: ID!, $status: TripStatus!, $pauseReasonId: ID, $pauseNote: String) {
    updateTripStatus(id: $id, status: $status, pauseReasonId: $pauseReasonId, pauseNote: $pauseNote) { id status }
  }
`;

export function DispatchPage() {
  const { data: tripData, refetch } = useQuery<any>(TRIPS);
  const { data: orderData } = useQuery<any>(AWAITING);
  const { data: reasonData } = useQuery<any>(PAUSE_REASONS);
  const [updateStatus, { loading, error }] = useMutation(UPDATE_TRIP_STATUS);

  const [pauseDialog, setPauseDialog] = useState<{ tripId: string } | null>(null);
  const [pauseForm, setPauseForm] = useState({ reasonId: '', note: '' });

  const changeStatus = async (tripId: string, status: string) => {
    if (status === 'PAUSED') {
      setPauseForm({ reasonId: '', note: '' });
      setPauseDialog({ tripId });
      return;
    }
    await updateStatus({ variables: { id: tripId, status } });
    refetch();
  };

  const trips = tripData?.trips ?? [];
  const awaiting = (orderData?.orders ?? []).filter(
    (o: any) => o.tripCount === 0 && !['CANCELLED', 'COMPLETED'].includes(o.status),
  );

  return (
    <div className="grid gap-4">
      <PageHeader title="Điều phối" />

      <Card>
        <CardHeader><CardTitle className="text-base">Đơn chưa xếp xe ({awaiting.length})</CardTitle></CardHeader>
        <CardContent>
          {awaiting.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không có đơn nào chờ xếp xe</p>
          ) : (
            <Table>
              <TableBody>
                {awaiting.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium"><Link className="hover:underline" to={`/orders/${o.id}`}>{o.code}</Link></TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/orders/${o.id}`}>Xếp xe</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Chuyến xe</CardTitle></CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <EmptyState message="Chưa có chuyến nào" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Tài xế</TableHead>
                  <TableHead>Dự kiến</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cập nhật trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <Link className="hover:underline" to={`/orders/${t.orderId}`}>{t.orderCode}</Link>
                    </TableCell>
                    <TableCell>{t.vehiclePlate}</TableCell>
                    <TableCell>{t.driverName}</TableCell>
                    <TableCell>{formatDateTime(t.plannedStartAt)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={t.status}
                        label={t.status === 'PAUSED' && t.pauseReasonName ? `Tạm dừng — ${t.pauseReasonName}` : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={t.status} onValueChange={(v) => changeStatus(t.id, v)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRIP_STATUS_LABEL).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <FormDialog
        open={pauseDialog !== null}
        onOpenChange={(v) => !v && setPauseDialog(null)}
        title="Tạm dừng chuyến — chọn lý do"
        onSubmit={async () => {
          await updateStatus({
            variables: {
              id: pauseDialog!.tripId,
              status: 'PAUSED',
              pauseReasonId: pauseForm.reasonId || null,
              pauseNote: pauseForm.note || null,
            },
          });
          setPauseDialog(null);
          refetch();
        }}
        submitDisabled={!pauseForm.reasonId}
        loading={loading}
        error={error?.message}
      >
        <Field label="Lý do tạm dừng *">
          <Select value={pauseForm.reasonId} onValueChange={(v) => setPauseForm({ ...pauseForm, reasonId: v })}>
            <SelectTrigger><SelectValue placeholder="Chọn lý do" /></SelectTrigger>
            <SelectContent>
              {(reasonData?.catalogItems ?? []).map((r: any) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Ghi chú">
          <Textarea rows={2} value={pauseForm.note} onChange={(e) => setPauseForm({ ...pauseForm, note: e.target.value })} />
        </Field>
      </FormDialog>
    </div>
  );
}
