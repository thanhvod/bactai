import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button, Card, CardContent, CardHeader, CardTitle, Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@bta/shadcn';
import { ORDER_STATUS_LABEL, STOP_STATUS_LABEL, TRIP_STATUS_LABEL } from '@bta/shared';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDate, formatDateTime, formatMoney, localToIso, parseMoney } from '../../lib/format';
import { Field, FormDialog, PageHeader } from '../components/page-shell';
import { StatusBadge } from '../components/status-badge';

const DETAIL = gql`
  query Order($id: ID!) {
    order(id: $id) {
      id code customerName status price dueDate notes createdAt
      totalAmount paidAmount overdueDays profit
      stops { id type sequence address contactName contactPhone status codExpected codCollected }
      cargoLines { id name weightKg volumeM3 quantity unit notes }
      addons { id name amount }
      trips { id vehiclePlate driverName status plannedStartAt driverBonus pauseReasonName }
      expenses { id categoryName amount tripId paidByDriver paymentStatus }
      allocations { id amount receivedDate method }
      history { id fromStatus toStatus reason byUserName createdAt }
    }
  }
`;
const VEHICLES = gql`query VehicleOpts { vehicles { id plateNumber } }`;
const DRIVERS = gql`query DriverOpts { drivers { id fullName } }`;
const EXPENSE_CATS = gql`query ExpCats { catalogItems(kind: EXPENSE_CATEGORY) { id name } }`;
const WARNINGS = gql`
  query DispatchWarnings($vehicleId: ID!, $driverId: ID!, $plannedStartAt: DateTime!, $plannedEndAt: DateTime) {
    dispatchWarnings(vehicleId: $vehicleId, driverId: $driverId, plannedStartAt: $plannedStartAt, plannedEndAt: $plannedEndAt) {
      target kind orderCode plannedStartAt
    }
  }
`;
const UPDATE_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!, $reason: String) {
    updateOrderStatus(id: $id, status: $status, reason: $reason) { id status }
  }
`;
const CREATE_TRIP = gql`
  mutation CreateTrip($orderId: ID!, $vehicleId: ID!, $driverId: ID!, $plannedStartAt: DateTime, $plannedEndAt: DateTime) {
    createTrip(orderId: $orderId, vehicleId: $vehicleId, driverId: $driverId, plannedStartAt: $plannedStartAt, plannedEndAt: $plannedEndAt) { id }
  }
`;
const SET_BONUS = gql`
  mutation SetTripBonus($id: ID!, $driverBonus: BigInt!) { setTripBonus(id: $id, driverBonus: $driverBonus) { id } }
`;
const CREATE_EXPENSE = gql`
  mutation CreateOrderExpense($input: ExpenseInput!) { createExpense(input: $input) { id } }
`;

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, refetch } = useQuery<any>(DETAIL, { variables: { id } });
  const { data: vData } = useQuery<any>(VEHICLES);
  const { data: dData } = useQuery<any>(DRIVERS);
  const { data: catData } = useQuery<any>(EXPENSE_CATS);

  const [updateStatus] = useMutation(UPDATE_STATUS);
  const [createTrip, { loading: tripLoading, error: tripError }] = useMutation(CREATE_TRIP);
  const [setBonus] = useMutation(SET_BONUS);
  const [createExpense, { loading: expLoading, error: expError }] = useMutation(CREATE_EXPENSE);

  const [tripOpen, setTripOpen] = useState(false);
  const [tripForm, setTripForm] = useState({ vehicleId: '', driverId: '', start: '', end: '' });
  const { data: warnData } = useQuery<any>(WARNINGS, {
    skip: !tripForm.vehicleId || !tripForm.driverId || !tripForm.start,
    variables: {
      vehicleId: tripForm.vehicleId,
      driverId: tripForm.driverId,
      plannedStartAt: tripForm.start ? localToIso(tripForm.start) : null,
      plannedEndAt: tripForm.end ? localToIso(tripForm.end) : null,
    },
  });

  const [expOpen, setExpOpen] = useState(false);
  const [expForm, setExpForm] = useState({ categoryId: '', amount: '', tripId: '', paidByDriver: false });

  const o = data?.order;
  if (!o) return <div className="text-muted-foreground">Đang tải…</div>;

  const warnings = warnData?.dispatchWarnings ?? [];
  return (
    <div className="grid gap-4">
      <PageHeader
        title={`Đơn ${o.code}`}
        actions={
          <>
            <Select
              value={o.status}
              onValueChange={async (v) => {
                const reason = prompt('Lý do đổi trạng thái (không bắt buộc):') ?? undefined;
                await updateStatus({ variables: { id: o.id, status: v, reason } });
                refetch();
              }}
            >
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" asChild><Link to="/orders"><ArrowLeft className="size-4" /> Danh sách</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Khách hàng', o.customerName],
          ['Tổng tiền', formatMoney(o.totalAmount)],
          ['Đã thu', formatMoney(o.paidAmount)],
          ['Lãi/lỗ tạm tính', formatMoney(o.profit)],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardHeader className="pb-1"><CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent className="text-lg font-semibold">{value}</CardContent>
          </Card>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        Trạng thái: <StatusBadge status={o.status} /> · Hạn thanh toán: {formatDate(o.dueDate)}
        {o.overdueDays > 0 && <span className="ml-1 font-medium text-red-600">(quá hạn {o.overdueDays} ngày)</span>}
        {o.notes && <> · Ghi chú: {o.notes}</>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Điểm lấy / trả hàng</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead><TableHead>Loại</TableHead><TableHead>Địa chỉ</TableHead>
                <TableHead>Liên hệ</TableHead><TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">COD dự kiến</TableHead>
                <TableHead className="text-right">COD đã thu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {o.stops.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{s.sequence}</TableCell>
                  <TableCell>{s.type === 'PICKUP' ? 'Lấy' : 'Trả'}</TableCell>
                  <TableCell>{s.address}</TableCell>
                  <TableCell>{[s.contactName, s.contactPhone].filter(Boolean).join(' · ') || '—'}</TableCell>
                  <TableCell>{STOP_STATUS_LABEL[s.status as keyof typeof STOP_STATUS_LABEL]}</TableCell>
                  <TableCell className="text-right">{formatMoney(s.codExpected)}</TableCell>
                  <TableCell className="text-right">{s.codCollected != null ? formatMoney(s.codCollected) : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {o.cargoLines.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Hàng hóa: {o.cargoLines.map((c: any) => [c.name, c.weightKg && `${c.weightKg}kg`, c.notes].filter(Boolean).join(' — ')).join(' · ')}
            </p>
          )}
          {o.addons.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Dịch vụ cộng thêm: {o.addons.map((a: any) => `${a.name} ${formatMoney(a.amount)}`).join(' · ')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Chuyến xe</CardTitle>
          <Button size="sm" onClick={() => { setTripForm({ vehicleId: '', driverId: '', start: '', end: '' }); setTripOpen(true); }}>
            <Plus className="size-4" /> Xếp xe
          </Button>
        </CardHeader>
        <CardContent>
          {o.trips.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa xếp xe</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Xe</TableHead><TableHead>Tài xế</TableHead><TableHead>Trạng thái</TableHead>
                  <TableHead>Dự kiến chạy</TableHead><TableHead className="text-right">Thưởng tài xế</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {o.trips.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.vehiclePlate}</TableCell>
                    <TableCell>{t.driverName}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} label={t.status === 'PAUSED' && t.pauseReasonName ? `${TRIP_STATUS_LABEL.PAUSED} — ${t.pauseReasonName}` : undefined} />
                    </TableCell>
                    <TableCell>{formatDateTime(t.plannedStartAt)}</TableCell>
                    <TableCell className="text-right">
                      <button
                        className="underline-offset-2 hover:underline"
                        onClick={async () => {
                          const v = prompt('Thưởng tài xế cho chuyến này (₫):', String(t.driverBonus));
                          if (v != null) { await setBonus({ variables: { id: t.id, driverBonus: parseMoney(v) } }); refetch(); }
                        }}
                      >
                        {formatMoney(t.driverBonus)}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Chi phí phát sinh</CardTitle>
            <Button size="sm" variant="outline" onClick={() => { setExpForm({ categoryId: '', amount: '', tripId: '', paidByDriver: false }); setExpOpen(true); }}>
              <Plus className="size-4" /> Thêm chi phí
            </Button>
          </CardHeader>
          <CardContent>
            {o.expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có chi phí</p>
            ) : (
              <Table>
                <TableBody>
                  {o.expenses.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.categoryName}{e.paidByDriver && <span className="ml-1 text-xs text-amber-600">(tài xế chi trước)</span>}</TableCell>
                      <TableCell className="text-right">{formatMoney(e.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Thanh toán đã nhận</CardTitle></CardHeader>
          <CardContent>
            {o.allocations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có thanh toán — ghi nhận ở mục Thu chi &amp; công nợ</p>
            ) : (
              <Table>
                <TableBody>
                  {o.allocations.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{formatDate(a.receivedDate)}{a.method && <span className="ml-1 text-xs text-muted-foreground">({a.method})</span>}</TableCell>
                      <TableCell className="text-right">{formatMoney(a.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Lịch sử trạng thái</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {o.history.map((h: any) => (
                <TableRow key={h.id}>
                  <TableCell className="text-muted-foreground">{formatDateTime(h.createdAt)}</TableCell>
                  <TableCell>
                    {h.fromStatus ? `${ORDER_STATUS_LABEL[h.fromStatus as keyof typeof ORDER_STATUS_LABEL] ?? h.fromStatus} → ` : ''}
                    {ORDER_STATUS_LABEL[h.toStatus as keyof typeof ORDER_STATUS_LABEL] ?? h.toStatus}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{h.reason ?? ''}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{h.byUserName ?? ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog xếp xe */}
      <FormDialog
        open={tripOpen}
        onOpenChange={setTripOpen}
        title="Xếp xe cho đơn"
        onSubmit={async () => {
          await createTrip({
            variables: {
              orderId: o.id,
              vehicleId: tripForm.vehicleId,
              driverId: tripForm.driverId,
              plannedStartAt: tripForm.start ? localToIso(tripForm.start) : null,
              plannedEndAt: tripForm.end ? localToIso(tripForm.end) : null,
            },
          });
          setTripOpen(false);
          refetch();
        }}
        submitDisabled={!tripForm.vehicleId || !tripForm.driverId}
        loading={tripLoading}
        error={tripError?.message}
      >
        <Field label="Xe *">
          <Select value={tripForm.vehicleId} onValueChange={(v) => setTripForm({ ...tripForm, vehicleId: v })}>
            <SelectTrigger><SelectValue placeholder="Chọn xe" /></SelectTrigger>
            <SelectContent>
              {(vData?.vehicles ?? []).map((v: any) => (
                <SelectItem key={v.id} value={v.id}>{v.plateNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Tài xế *">
          <Select value={tripForm.driverId} onValueChange={(v) => setTripForm({ ...tripForm, driverId: v })}>
            <SelectTrigger><SelectValue placeholder="Chọn tài xế" /></SelectTrigger>
            <SelectContent>
              {(dData?.drivers ?? []).map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Bắt đầu dự kiến"><Input type="datetime-local" value={tripForm.start} onChange={(e) => setTripForm({ ...tripForm, start: e.target.value })} /></Field>
        <Field label="Kết thúc dự kiến"><Input type="datetime-local" value={tripForm.end} onChange={(e) => setTripForm({ ...tripForm, end: e.target.value })} /></Field>
        {warnings.length > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800">
            ⚠️ Cảnh báo lịch (vẫn được phép gán):
            <ul className="ml-4 list-disc">
              {warnings.map((w: any, i: number) => (
                <li key={i}>
                  {w.target === 'VEHICLE' ? 'Xe' : 'Tài xế'} {w.kind === 'OVERLAP' ? 'TRÙNG lịch' : 'gần trùng lịch'} với đơn {w.orderCode} ({formatDateTime(w.plannedStartAt)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </FormDialog>

      {/* Dialog chi phí */}
      <FormDialog
        open={expOpen}
        onOpenChange={setExpOpen}
        title="Thêm chi phí cho đơn"
        onSubmit={async () => {
          await createExpense({
            variables: {
              input: {
                categoryId: expForm.categoryId,
                amount: parseMoney(expForm.amount),
                expenseDate: new Date().toISOString(),
                orderId: o.id,
                tripId: expForm.tripId || null,
                paidBy: expForm.paidByDriver ? 'DRIVER' : 'COMPANY',
                reimbursable: expForm.paidByDriver,
              },
            },
          });
          setExpOpen(false);
          refetch();
        }}
        submitDisabled={!expForm.categoryId || !expForm.amount}
        loading={expLoading}
        error={expError?.message}
      >
        <Field label="Loại chi phí *">
          <Select value={expForm.categoryId} onValueChange={(v) => setExpForm({ ...expForm, categoryId: v })}>
            <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
            <SelectContent>
              {(catData?.catalogItems ?? []).map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Số tiền (₫) *"><Input value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} /></Field>
        <Field label="Gắn vào chuyến (tùy chọn)">
          <Select value={expForm.tripId || 'NONE'} onValueChange={(v) => setExpForm({ ...expForm, tripId: v === 'NONE' ? '' : v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Không gắn chuyến</SelectItem>
              {o.trips.map((t: any) => (
                <SelectItem key={t.id} value={t.id}>{t.vehiclePlate} — {t.driverName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={expForm.paidByDriver} onChange={(e) => setExpForm({ ...expForm, paidByDriver: e.target.checked })} />
          Tài xế chi trước (công ty hoàn lại)
        </label>
      </FormDialog>
    </div>
  );
}
