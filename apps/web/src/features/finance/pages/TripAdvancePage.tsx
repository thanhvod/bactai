import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Scale } from 'lucide-react';
import {
  Banner,
  Button,
  DataTable,
  DescriptionList,
  Drawer,
  EmptyState,
  ErrorState,
  FilterChip,
  FormField,
  KpiCard,
  MoneyCell,
  MoneyInput,
  PageHeader,
  RadioGroup,
  StatusBadge,
  Textarea,
  toast,
  type DataTableColumn,
} from '@bta/shadcn';
import { TRIP_STATUS, formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { FinTripAdvancesQuery } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { CellLink } from '@/features/master-data/helpers';
import { TRIP_ADVANCE_STATUS } from '../components/common';
import { ReconcileTripAdvanceMutation, TripAdvancesQuery } from '../graphql/finance';

type Row = FinTripAdvancesQuery['tripAdvances'][number];

const RESOLUTION_LABEL: Record<string, string> = {
  DRIVER_RETURNS: 'Tài xế nộp lại',
  COMPANY_REIMBURSES: 'Công ty hoàn thêm',
  MATCHED: 'Khớp',
  WRITE_OFF: 'Điều chỉnh / bỏ qua chênh lệch',
};

/** Chênh lệch dương: tài xế còn giữ tạm ứng (nộp lại); âm: tài xế chi vượt (công ty hoàn). */
export function suggestedResolution(diff: number): string {
  return diff > 0 ? 'DRIVER_RETURNS' : diff < 0 ? 'COMPANY_REIMBURSES' : 'MATCHED';
}

/** WM-ADV-01 — Tạm ứng chuyến & đối soát sau chuyến. */
export default function TripAdvancePage() {
  return (
    <RequirePermission permission={['tripAdvance.reconcile', 'finance.view']}>
      <TripAdvances />
    </RequirePermission>
  );
}

function TripAdvances() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'OPEN';
  const driverId = params.get('driverId');
  const tripId = params.get('tripId');
  const { data, loading, error, refetch } = useQuery(TripAdvancesQuery, { variables: { filter: { status: status === 'ALL' ? null : status, driverId, tripId } } });
  const rows = data?.tripAdvances ?? [];
  const [openRow, setOpenRow] = React.useState<Row | null>(null);
  React.useEffect(() => {
    if (tripId && rows.length === 1 && !openRow) setOpenRow(rows[0]);
  }, [tripId, rows.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const setParam = (k: string, v: string | null) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    setParams(n, { replace: true });
  };
  const open = rows.filter((r) => r.status === 'OPEN');

  const columns: DataTableColumn<Row>[] = [
    { key: 'trip', label: 'Chuyến / đơn', render: (r) => (
      <div className="flex flex-col">
        <CellLink to={paths.trip(r.tripId)} className="font-mono text-accent hover:underline">{r.tripCode}</CellLink>
        <span className="text-caption text-text-subtle">{r.orderCode} · {formatDate(r.plannedStartAt)}</span>
      </div>
    ) },
    { key: 'tstatus', label: 'Trạng thái chuyến', hideBelow: 'lg', render: (r) => <StatusBadge meta={TRIP_STATUS} status={r.tripStatus} /> },
    { key: 'driver', label: 'Tài xế', render: (r) => (r.driver ? <CellLink to={paths.driver(r.driver.id, 'ledger')}>{r.driver.name}</CellLink> : '—') },
    { key: 'advance', label: 'Đã tạm ứng', money: true, render: (r) => <MoneyCell value={r.advanceAmount} /> },
    { key: 'spent', label: 'Chi từ tạm ứng', money: true, render: (r) => <MoneyCell value={r.spentFromAdvance} /> },
    { key: 'cost', label: 'Chi phí thực tế chuyến', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.actualCost} tone="muted" /> },
    { key: 'diff', label: 'Chênh lệch', money: true, render: (r) => (
      <div className="text-right">
        <MoneyCell value={r.difference} strong tone={r.difference === 0 ? 'muted' : r.difference > 0 ? 'warning' : 'danger'} />
        <span className="block text-caption text-text-subtle">{r.difference > 0 ? 'Tài xế nộp lại' : r.difference < 0 ? 'Công ty hoàn thêm' : 'Khớp'}</span>
      </div>
    ) },
    { key: 'status', label: 'Đối soát', render: (r) => (
      <div className="flex flex-col items-start gap-0.5">
        <StatusBadge meta={TRIP_ADVANCE_STATUS} status={r.status} />
        {r.resolution ? <span className="text-caption text-text-subtle">{RESOLUTION_LABEL[r.resolution] ?? r.resolution}</span> : null}
      </div>
    ) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Tạm ứng chuyến & đối soát"
        subtitle="Tiền đi đường đưa trước cho tài xế, đối soát với chi phí thực tế sau chuyến"
        breadcrumb={[{ label: 'Thu chi & Công nợ', to: PATHS.finance }, { label: 'Tạm ứng chuyến' }]}
        actions={hasPermission('expense.create') ? <Button onClick={() => navigate(`${PATHS.expenseNew}?kind=TRIP_ADVANCE`)}><Plus /> Tạo tạm ứng</Button> : null}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard loading={loading && !data} label="Chưa đối soát" value={open.length} tone={open.length ? 'warning' : 'neutral'} onClick={() => setParam('status', 'OPEN')} />
        <KpiCard loading={loading && !data} label="Tài xế cần nộp lại" value={formatVnd(open.filter((r) => r.difference > 0).reduce((s, r) => s + r.difference, 0))} />
        <KpiCard loading={loading && !data} label="Công ty cần hoàn thêm" value={formatVnd(open.filter((r) => r.difference < 0).reduce((s, r) => s - r.difference, 0))} />
      </div>
      <p className="text-body-sm text-text-muted">Tạm ứng chuyến khác ứng lương: tạm ứng phục vụ chuyến và đối soát theo chi phí; ứng lương trừ vào bảng lương. Tiền tài xế nộp lại tạm ứng không phải doanh thu.</p>
      <div className="flex flex-wrap gap-2">
        {['OPEN', 'RECONCILED', 'ALL'].map((s) => (
          <FilterChip key={s} label={s === 'ALL' ? 'Tất cả' : TRIP_ADVANCE_STATUS[s as 'OPEN'].label} active={status === s} onClick={() => setParam('status', s === 'OPEN' ? null : s)} />
        ))}
        {driverId || tripId ? <FilterChip label="Đang lọc theo tài xế/chuyến" active onRemove={() => { const n = new URLSearchParams(params); n.delete('driverId'); n.delete('tripId'); setParams(n, { replace: true }); }} /> : null}
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.tripId} loading={loading && !data} onRowClick={setOpenRow} empty={<EmptyState message="Chưa có tạm ứng chuyến" />} />
      )}
      {openRow ? <ReconcileDrawer row={rows.find((r) => r.tripId === openRow.tripId) ?? openRow} onClose={() => setOpenRow(null)} /> : null}
    </div>
  );
}

function ReconcileDrawer({ row, onClose }: { row: Row; onClose: () => void }) {
  const { hasPermission } = useAuth();
  const [resolution, setResolution] = React.useState(suggestedResolution(row.difference));
  const [amount, setAmount] = React.useState<number | null>(Math.abs(row.difference));
  const [reason, setReason] = React.useState('');
  const [note, setNote] = React.useState('');
  const [reconcile, { loading }] = useMutation(ReconcileTripAdvanceMutation);
  const running = !['COMPLETED', 'CANCELLED'].includes(row.tripStatus);
  const expectedAmount = Math.abs(row.difference);
  const adjusted = resolution === 'WRITE_OFF' || ((resolution === 'DRIVER_RETURNS' || resolution === 'COMPANY_REIMBURSES') && amount !== expectedAmount);
  const canReconcile = hasPermission('tripAdvance.reconcile') && row.status === 'OPEN' && !running;
  const invalid = (resolution === 'MATCHED' && row.difference !== 0) || (adjusted && reason.trim().length < 5) || ((resolution === 'DRIVER_RETURNS' || resolution === 'COMPANY_REIMBURSES') && !amount);

  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      title={`Đối soát tạm ứng ${row.tripCode}`}
      description={`${row.orderCode} · ${row.driver?.name ?? ''}`}
      width={560}
      footer={
        canReconcile ? (
          <>
            <Button variant="ghost" onClick={onClose}>Đóng</Button>
            <Button
              loading={loading}
              disabled={invalid}
              onClick={async () => {
                try {
                  await reconcile({
                    variables: {
                      input: {
                        tripId: row.tripId,
                        resolution,
                        amount: resolution === 'DRIVER_RETURNS' || resolution === 'COMPANY_REIMBURSES' ? amount : null,
                        reason: reason.trim() || null,
                        note: note.trim() || null,
                      },
                    },
                    refetchQueries: ['FinTripAdvances'],
                  });
                  toast.success('Đã đối soát tạm ứng');
                  onClose();
                } catch (e) {
                  toast.error(apolloErrorMessage(e));
                }
              }}
            >
              <Scale /> Xác nhận đối soát
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <DescriptionList
          columns={2}
          items={[
            { label: 'Đã tạm ứng', value: formatVnd(row.advanceAmount) },
            { label: 'Chi từ tạm ứng', value: formatVnd(row.spentFromAdvance) },
            { label: 'Tài xế đã nộp lại', value: formatVnd(row.returned) },
            { label: 'Công ty đã hoàn', value: formatVnd(row.reimbursed) },
            { label: 'Chi phí thực tế chuyến', value: formatVnd(row.actualCost) },
            { label: 'Chênh lệch', value: <strong>{formatVnd(row.difference)}</strong> },
          ]}
        />
        {running ? <Banner tone="warning" message="Chuyến chưa hoàn thành — chênh lệch đang tạm tính, chưa đối soát được." /> : null}
        {row.status === 'RECONCILED' ? (
          <Banner tone="success" message={`Đã đối soát: ${RESOLUTION_LABEL[row.resolution ?? ''] ?? row.resolution}${row.resolvedAt ? ` · ${formatDate(row.resolvedAt)}` : ''}${row.reason ? ` · Lý do: ${row.reason}` : ''}`} />
        ) : null}
        {canReconcile ? (
          <>
            <FormField label="Cách xử lý chênh lệch">
              <RadioGroup
                value={resolution}
                onValueChange={(v) => { setResolution(v); setAmount(expectedAmount); }}
                options={[
                  { value: 'DRIVER_RETURNS', label: RESOLUTION_LABEL.DRIVER_RETURNS, description: 'Tạo phiếu thu hoàn tạm ứng (không phải doanh thu)', disabled: row.difference < 0 },
                  { value: 'COMPANY_REIMBURSES', label: RESOLUTION_LABEL.COMPANY_REIMBURSES, description: 'Tạo phiếu chi hoàn ứng tài xế', disabled: row.difference > 0 },
                  { value: 'MATCHED', label: RESOLUTION_LABEL.MATCHED, description: 'Chỉ khi chênh lệch = 0', disabled: row.difference !== 0 },
                  { value: 'WRITE_OFF', label: RESOLUTION_LABEL.WRITE_OFF, description: 'Thao tác nhạy cảm — bắt buộc lý do' },
                ]}
              />
            </FormField>
            {resolution === 'DRIVER_RETURNS' || resolution === 'COMPANY_REIMBURSES' ? (
              <FormField label="Số tiền" hint={amount !== expectedAmount ? `Khác số hệ thống tính (${formatVnd(expectedAmount)}) — cần lý do` : undefined}>
                <MoneyInput value={amount} onChange={setAmount} />
              </FormField>
            ) : null}
            {adjusted ? (
              <FormField label="Lý do điều chỉnh" required hint="Tối thiểu 5 ký tự, ghi nhật ký">
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
              </FormField>
            ) : null}
            <FormField label="Ghi chú">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </FormField>
          </>
        ) : null}
        <CellLink to={`${PATHS.expenses}?tripId=${row.tripId}`}>Xem các phiếu chi của chuyến</CellLink>
      </div>
    </Drawer>
  );
}
