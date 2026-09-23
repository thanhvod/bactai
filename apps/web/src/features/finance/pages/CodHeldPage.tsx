import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { HandCoins } from 'lucide-react';
import { Banner, Button, Checkbox, DataTable, EmptyState, ErrorState, FilterChip, KpiCard, MoneyCell, PageHeader, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { DriverCodItemFieldsFragment, FinDriverCodHeldQuery } from '@/gql/graphql';
import { CellLink, notReadyYet } from '@/features/master-data/helpers';
import { DriverCodHeldQuery } from '../graphql/finance';

type Row = FinDriverCodHeldQuery['driverCodHeld']['rows'][number];

/** URL tạo phiếu thu COD nộp lại, prefill tài xế + các khoản đã chọn. */
export function codRemittanceUrl(driverId: string, stopIds: string[] = []) {
  return `${PATHS.paymentNew}?type=DRIVER_COD_REMITTANCE&driverId=${driverId}${stopIds.length ? `&stopIds=${stopIds.join(',')}` : ''}`;
}

/** Bảng từng khoản COD tài xế đang giữ (dùng lại ở sổ tài xế WM-DRV-06). */
export function CodItemsTable({ items, warningDays, selectable, selected, onToggle }: { items: DriverCodItemFieldsFragment[]; warningDays: number; selectable?: boolean; selected?: Set<string>; onToggle?: (stopId: string, checked: boolean) => void }) {
  const columns: DataTableColumn<DriverCodItemFieldsFragment>[] = [
    ...(selectable
      ? [{ key: 'sel', label: '', width: 40, render: (r: DriverCodItemFieldsFragment) => <Checkbox checked={selected?.has(r.stopId)} onCheckedChange={(c) => onToggle?.(r.stopId, !!c)} aria-label={`Chọn ${r.orderCode}`} /> }]
      : []),
    { key: 'order', label: 'Đơn / chuyến', render: (r) => (
      <div className="flex flex-col">
        <CellLink to={paths.order(r.orderId)} className="font-mono text-accent hover:underline">{r.orderCode}</CellLink>
        <span className="text-caption text-text-subtle">{r.tripId ? r.tripCode : '—'} · {r.customerName}</span>
      </div>
    ) },
    { key: 'stop', label: 'Điểm thu', render: (r) => <CellLink to={paths.orderStop(r.orderId, r.stopId)}>#{r.stopSequence} {r.stopName ?? r.address}</CellLink> },
    { key: 'date', label: 'Ngày thu', render: (r) => formatDate(r.collectedAt) },
    { key: 'expected', label: 'COD dự kiến', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.codExpected} tone="muted" /> },
    { key: 'actual', label: 'Thực thu', money: true, render: (r) => <MoneyCell value={r.codActual} /> },
    { key: 'remitted', label: 'Đã nộp', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.remitted} tone="muted" /> },
    { key: 'held', label: 'Còn giữ', money: true, render: (r) => <MoneyCell value={r.held} strong tone={r.daysHeld >= warningDays ? 'danger' : 'default'} /> },
    { key: 'days', label: 'Tuổi', align: 'right', render: (r) => (r.daysHeld >= warningDays ? <StatusBadge tone="danger" label={`${r.daysHeld} ngày`} /> : `${r.daysHeld} ngày`) },
  ];
  return <DataTable columns={columns} rows={items} rowKey={(r) => r.stopId} compact empty={<EmptyState compact message="Không có khoản COD chưa nộp" />} />;
}

/** WM-COD-01 — COD tài xế đang giữ theo tài xế/đơn/điểm, cảnh báo theo ngưỡng cài đặt. */
export default function CodHeldPage() {
  return (
    <RequirePermission permission="driverLedger.view">
      <CodHeld />
    </RequirePermission>
  );
}

function CodHeld() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const warningOnly = params.get('warning') === '1';
  const driverId = params.get('driverId');
  const { data, loading, error, refetch } = useQuery(DriverCodHeldQuery, { variables: { filter: { warningOnly: warningOnly || null, driverId } } });
  const [selected, setSelected] = React.useState<Record<string, Set<string>>>({});
  const r = data?.driverCodHeld;
  const rows = (r?.rows ?? []).filter((x) => x.codHeld > 0);
  const canRemit = hasPermission('cod.remittance.record');
  const warnCount = rows.filter((x) => x.overAmount || x.overDays).length;

  const toggle = (dId: string, stopId: string, c: boolean) =>
    setSelected((s) => {
      const n = new Set(s[dId] ?? []);
      if (c) n.add(stopId);
      else n.delete(stopId);
      return { ...s, [dId]: n };
    });

  const columns: DataTableColumn<Row>[] = [
    { key: 'driver', label: 'Tài xế', render: (x) => (
      <div className="flex flex-col">
        <CellLink to={paths.driverCod(x.driver.id)} className="font-medium text-text hover:text-accent hover:underline">{x.driver.name}</CellLink>
        <span className="text-caption text-text-subtle">{x.phone}</span>
      </div>
    ) },
    { key: 'collected', label: 'Đã thu', money: true, hideBelow: 'lg', render: (x) => <MoneyCell value={x.codCollected} tone="muted" /> },
    { key: 'remitted', label: 'Đã nộp', money: true, hideBelow: 'lg', render: (x) => <MoneyCell value={x.codRemitted} tone="muted" /> },
    { key: 'held', label: 'Đang giữ', money: true, render: (x) => <MoneyCell value={x.codHeld} strong tone={x.overAmount || x.overDays ? 'danger' : 'default'} /> },
    { key: 'oldest', label: 'Khoản cũ nhất', render: (x) => (x.oldestHeldAt ? `${formatDate(x.oldestHeldAt)} · ${x.daysHeld} ngày` : '—') },
    { key: 'warn', label: 'Cảnh báo', render: (x) => (x.overAmount || x.overDays ? <StatusBadge tone="danger" label={[x.overAmount ? 'Vượt số tiền' : null, x.overDays ? 'Quá số ngày' : null].filter(Boolean).join(' · ')} /> : <span className="text-text-subtle">—</span>) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="COD tài xế đang giữ"
        subtitle="Tiền thu hộ tài xế đã thu nhưng chưa nộp về công ty"
        breadcrumb={[{ label: 'Thu chi & Công nợ', to: PATHS.finance }, { label: 'COD tài xế' }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => notReadyYet('Xuất COD tài xế đang giữ')}>Xuất Excel</Button>
            {canRemit ? <Button onClick={() => navigate(`${PATHS.paymentNew}?type=DRIVER_COD_REMITTANCE`)}><HandCoins /> Tạo phiếu thu COD</Button> : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard loading={loading && !data} label="Tổng COD đang giữ" value={formatVnd(r?.totalHeld ?? 0)} sub={`${rows.length} tài xế`} />
        <KpiCard loading={loading && !data} label="Tài xế vượt ngưỡng" value={warnCount} tone={warnCount ? 'danger' : 'neutral'} onClick={() => setParams(warningOnly ? {} : { warning: '1' }, { replace: true })} />
        <KpiCard loading={loading && !data} label="Ngưỡng cảnh báo" value={formatVnd(r?.codWarningAmount ?? 0)} sub={`hoặc giữ quá ${r?.codWarningDays ?? 0} ngày`} to={PATHS.settingsOperations} />
      </div>
      <Banner tone="info" message="Tiền tài xế nộp COD là thu hồi khoản phải thu từ tài xế — không phải doanh thu, không đổi công nợ khách." />
      <div className="flex gap-2">
        <FilterChip label="Chỉ tài xế vượt ngưỡng" active={warningOnly} onClick={() => setParams(warningOnly ? {} : { warning: '1' }, { replace: true })} />
        {driverId ? <FilterChip label="Đang lọc 1 tài xế" active onRemove={() => setParams({}, { replace: true })} /> : null}
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(x) => x.driver.id}
            loading={loading && !data}
            totalRow={rows.length ? { driver: 'Tổng', held: <MoneyCell value={r?.totalHeld ?? 0} strong /> } : undefined}
            empty={<EmptyState message="Chưa có khoản COD chưa nộp" />}
          />
          {rows.map((x) => {
            const sel = selected[x.driver.id] ?? new Set<string>();
            const selTotal = x.items.filter((i) => sel.has(i.stopId)).reduce((s, i) => s + i.held, 0);
            return (
              <section key={x.driver.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-heading-sm">{x.driver.name} — {formatVnd(x.codHeld)}</h3>
                  {canRemit ? (
                    <Button size="sm" variant={sel.size ? 'primary' : 'secondary'} onClick={() => navigate(codRemittanceUrl(x.driver.id, [...sel]))}>
                      <HandCoins /> {sel.size ? `Ghi nhận nộp ${formatVnd(selTotal)}` : 'Ghi nhận nộp COD'}
                    </Button>
                  ) : null}
                </div>
                <CodItemsTable items={x.items} warningDays={r?.codWarningDays ?? 2} selectable={canRemit} selected={sel} onToggle={(stopId, c) => toggle(x.driver.id, stopId, c)} />
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
