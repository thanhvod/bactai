import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { Button, DataTable, DueIndicator, EmptyState, ErrorState, MoneyCell, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { ORDER_STATUS, formatDate } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS, paths } from '@/app/routes';
import type { FinCustomerDebtQuery, FinDriverLedgerQuery, PaymentFieldsFragment } from '@/gql/graphql';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { CustomerDebtQuery, DriverCodHeldQuery, DriverLedgerQuery, PaymentsQuery } from '../graphql/finance';
import { CodItemsTable, codRemittanceUrl } from '../pages/CodHeldPage';
import { DOC_STATUS, PAYMENT_METHOD } from './common';

type DebtOrder = FinCustomerDebtQuery['customerDebt']['orders'][number];
type Entry = FinDriverLedgerQuery['driverLedger']['entries'][number];

/** WM-CUS-05: danh sách đơn còn nợ + phiếu thu của khách (dùng trong tab công nợ khách hàng). */
export function CustomerDebtSection({ customerId }: { customerId: string }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data, loading, error, refetch } = useQuery(CustomerDebtQuery, { variables: { filter: { customerId, openOnly: true } } });
  const { data: pData, loading: pLoading } = useQuery(PaymentsQuery, { variables: { filter: { customerId, type: 'CUSTOMER_PAYMENT' }, first: 50 } });
  const orders = (data?.customerDebt.orders ?? []).filter((o) => o.remaining > 0);
  const payments = pData?.payments.nodes ?? [];

  const orderColumns: DataTableColumn<DebtOrder>[] = [
    { key: 'code', label: 'Đơn hàng', render: (o) => <div className="flex flex-col"><CellLink to={paths.order(o.orderId, 'finance')} className="font-mono text-accent hover:underline">{o.code}</CellLink><span className="text-caption text-text-subtle">{formatDate(o.orderDate)} · {o.routeSummary ?? ''}</span></div> },
    { key: 'status', label: 'Trạng thái', hideBelow: 'lg', render: (o) => <StatusBadge meta={ORDER_STATUS} status={o.status} /> },
    { key: 'total', label: 'Tổng thu', money: true, render: (o) => <MoneyCell value={o.total} /> },
    { key: 'paid', label: 'Đã thu', money: true, render: (o) => <MoneyCell value={o.allocated} /> },
    { key: 'remaining', label: 'Còn lại', money: true, render: (o) => <MoneyCell value={o.remaining} strong /> },
    { key: 'due', label: 'Hạn thanh toán', render: (o) => <DueIndicator dueDate={o.dueDate} overdueDays={o.overdueDays} /> },
    { key: 'statement', label: 'Bảng kê', hideBelow: 'lg', render: (o) => o.statementCode ?? '—' },
  ];

  const paymentColumns: DataTableColumn<PaymentFieldsFragment>[] = [
    { key: 'code', label: 'Phiếu thu', render: (p) => <CellLink to={paths.payment(p.id)} className="font-mono text-accent hover:underline">{p.code}</CellLink> },
    { key: 'date', label: 'Ngày', render: (p) => formatDate(p.receivedAt) },
    { key: 'method', label: 'Hình thức', hideBelow: 'lg', render: (p) => PAYMENT_METHOD[p.method as keyof typeof PAYMENT_METHOD]?.label ?? p.method },
    { key: 'amount', label: 'Số tiền', money: true, render: (p) => <MoneyCell value={p.amount} tone={p.status === 'CANCELLED' ? 'muted' : 'default'} /> },
    { key: 'alloc', label: 'Phân bổ', render: (p) => <span className="text-body-sm">{p.allocations.map((a) => a.orderCode).join(', ') || '—'}</span> },
    { key: 'unallocated', label: 'Chưa phân bổ', money: true, render: (p) => <MoneyCell value={p.status === 'ACTIVE' ? p.unallocatedAmount : 0} tone={p.unallocatedAmount > 0 && p.status === 'ACTIVE' ? 'warning' : 'muted'} /> },
    { key: 'status', label: '', render: (p) => (p.status === 'CANCELLED' ? <StatusBadge meta={DOC_STATUS} status="CANCELLED" outline /> : p.unallocatedAmount > 0 && hasPermission('payment.allocate') ? <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(paths.paymentAllocate(p.id)); }}>Phân bổ</Button> : null) },
  ];

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Đơn còn nợ"
        actions={hasPermission('debtStatement.create') ? <Button size="sm" variant="secondary" onClick={() => navigate(`${PATHS.debtStatements}?new=1&customerId=${customerId}`)}>Tạo bảng kê</Button> : null}
      >
        <DataTable
          columns={orderColumns}
          rows={orders}
          rowKey={(o) => o.orderId}
          loading={loading && !data}
          compact
          totalRow={orders.length ? { code: 'Tổng', remaining: <MoneyCell value={orders.reduce((s, o) => s + o.remaining, 0)} strong /> } : undefined}
          empty={<EmptyState compact message="Khách không còn đơn nợ" />}
        />
      </Panel>
      <Panel
        title="Phiếu thu & phân bổ"
        actions={hasPermission('payment.create') ? <Button size="sm" variant="secondary" onClick={() => navigate(`${PATHS.paymentNew}?type=CUSTOMER_PAYMENT&customerId=${customerId}`)}>Ghi nhận thanh toán</Button> : null}
      >
        <DataTable columns={paymentColumns} rows={payments} rowKey={(p) => p.id} loading={pLoading && !pData} compact onRowClick={(p) => navigate(paths.payment(p.id))} empty={<EmptyState compact message="Chưa có phiếu thu" />} />
      </Panel>
    </div>
  );
}

/** WM-DRV-05/06: bảng bút toán sổ tài xế hoặc danh sách COD đang giữ theo điểm dừng. */
export function DriverLedgerDetail({ driverId, view }: { driverId: string; view: 'ledger' | 'cod' }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const ledger = useQuery(DriverLedgerQuery, { variables: { driverId }, skip: view !== 'ledger' });
  const cod = useQuery(DriverCodHeldQuery, { variables: { filter: { driverId } }, skip: view !== 'cod' });
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  if (view === 'cod') {
    if (cod.error) return <ErrorState error={cod.error} onRetry={() => void cod.refetch()} />;
    const row = cod.data?.driverCodHeld.rows.find((r) => r.driver.id === driverId);
    const canRemit = hasPermission('cod.remittance.record');
    return (
      <div className="flex flex-col gap-2">
        {canRemit && row?.items.length ? (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => navigate(codRemittanceUrl(driverId, [...selected]))}>
              {selected.size ? `Ghi nhận nộp ${selected.size} khoản đã chọn` : 'Ghi nhận nộp COD'}
            </Button>
          </div>
        ) : null}
        {cod.loading && !cod.data ? (
          <DataTable columns={[]} rows={[]} rowKey={() => ''} loading />
        ) : (
          <CodItemsTable
            items={row?.items ?? []}
            warningDays={cod.data?.driverCodHeld.codWarningDays ?? 2}
            selectable={canRemit}
            selected={selected}
            onToggle={(id, c) => setSelected((s) => { const n = new Set(s); c ? n.add(id) : n.delete(id); return n; })}
          />
        )}
      </div>
    );
  }

  if (ledger.error) return <ErrorState error={ledger.error} onRetry={() => void ledger.refetch()} />;
  const entries = ledger.data?.driverLedger.entries ?? [];
  const columns: DataTableColumn<Entry>[] = [
    { key: 'date', label: 'Ngày', width: 100, render: (e) => formatDate(e.date) },
    { key: 'doc', label: 'Chứng từ', render: (e) => <span className="font-mono text-body-sm">{e.docCode ?? '—'}</span> },
    { key: 'desc', label: 'Diễn giải', render: (e) => e.description },
    { key: 'driverOwes', label: 'Tài xế nợ', money: true, render: (e) => (e.driverOwes ? <MoneyCell value={e.driverOwes} tone="warning" /> : <span className="block text-right text-text-subtle">—</span>) },
    { key: 'companyOwes', label: 'Công ty nợ', money: true, render: (e) => (e.companyOwes ? <MoneyCell value={e.companyOwes} tone="success" /> : <span className="block text-right text-text-subtle">—</span>) },
    { key: 'balance', label: 'Số dư lũy kế', money: true, render: (e) => <MoneyCell value={e.runningBalance} strong tone={e.runningBalance > 0 ? 'danger' : e.runningBalance < 0 ? 'warning' : 'muted'} /> },
  ];
  return (
    <div className="flex flex-col gap-2">
      <DataTable columns={columns} rows={entries} rowKey={(e) => `${e.kind}-${e.refId ?? ''}-${entries.indexOf(e)}`} loading={ledger.loading && !ledger.data} compact empty={<EmptyState compact message="Chưa có bút toán nào" />} />
      <p className="text-caption text-text-muted">Số dư lũy kế dương: tài xế đang nợ công ty; âm: công ty nợ tài xế.</p>
    </div>
  );
}
