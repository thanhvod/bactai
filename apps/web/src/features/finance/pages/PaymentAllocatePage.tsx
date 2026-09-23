import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { Wand2 } from 'lucide-react';
import {
  Banner,
  Button,
  DataTable,
  DetailSkeleton,
  DueIndicator,
  EmptyState,
  ErrorState,
  MoneyCell,
  MoneyInput,
  PageHeader,
  StatusBadge,
  SummaryStrip,
  WarningPanel,
  toast,
  type DataTableColumn,
} from '@bta/shadcn';
import { ORDER_STATUS, formatDate, formatVnd } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { FinCustomerDebtQuery } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { CellLink } from '@/features/master-data/helpers';
import { sum } from '../components/common';
import { AllocatePaymentMutation, CustomerDebtQuery, PaymentQuery } from '../graphql/finance';

type OrderRow = FinCustomerDebtQuery['customerDebt']['orders'][number];

/** Điền tự động theo hạn thanh toán cũ nhất (client-side): đơn hạn sớm/không hạn đặt sau. */
export function autoFillOldestFirst(orders: { orderId: string; remaining: number; dueDate?: string | null; orderDate: string }[], available: number): Record<string, number> {
  const sorted = [...orders]
    .filter((o) => o.remaining > 0)
    .sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db || new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
    });
  const out: Record<string, number> = {};
  let left = available;
  for (const o of sorted) {
    if (left <= 0) break;
    const amt = Math.min(o.remaining, left);
    out[o.orderId] = amt;
    left -= amt;
  }
  return out;
}

/** WM-PAY-04 — Phân bổ phiếu thu vào các đơn còn nợ của cùng khách; phần dư = số dư khách. */
export default function PaymentAllocatePage() {
  return (
    <RequirePermission permission="payment.allocate">
      <PaymentAllocate />
    </RequirePermission>
  );
}

function PaymentAllocate() {
  const { paymentId = '' } = useParams();
  const navigate = useNavigate();
  const { data: pData, loading: pLoading, error: pError, refetch } = useQuery(PaymentQuery, { variables: { id: paymentId } });
  const p = pData?.payment;
  const customerId = p?.customer?.id ?? null;
  const { data: dData, loading: dLoading, error: dError } = useQuery(CustomerDebtQuery, { variables: { filter: { customerId, openOnly: true } }, skip: !customerId });
  const [lines, setLines] = React.useState<Record<string, number | null>>({});
  const [allocate, { loading: saving }] = useMutation(AllocatePaymentMutation);

  if (pError || dError) return <ErrorState error={pError ?? dError} onRetry={() => void refetch()} />;
  if ((pLoading && !pData) || (dLoading && !dData)) return <DetailSkeleton />;
  if (!p) return null;
  if (p.type !== 'CUSTOMER_PAYMENT' || p.status !== 'ACTIVE') {
    return <EmptyState message="Chỉ phân bổ được phiếu thu khách trả đang hiệu lực" action={<Button onClick={() => navigate(paths.payment(p.id))}>Về phiếu thu</Button>} />;
  }
  const orders = (dData?.customerDebt.orders ?? []).filter((o) => o.remaining > 0);
  const totalLines = sum(Object.values(lines).map((v) => v ?? 0));
  const remainingAfter = p.unallocatedAmount - totalLines;
  const overTotal = totalLines > p.unallocatedAmount;
  const lineError = (o: OrderRow) => ((lines[o.orderId] ?? 0) > o.remaining ? `Vượt còn nợ ${formatVnd(o.remaining)}` : null);
  const hasLineError = orders.some((o) => lineError(o));
  const overdue = orders.filter((o) => o.overdueDays > 0);
  const creditNow = (dData?.customerDebt.rows[0]?.creditBalance ?? p.customerCreditBalance ?? 0);

  const columns: DataTableColumn<OrderRow>[] = [
    { key: 'code', label: 'Đơn hàng', render: (o) => <div className="flex flex-col"><CellLink to={paths.order(o.orderId, 'finance')} className="font-mono text-accent hover:underline">{o.code}</CellLink><span className="text-caption text-text-subtle">{o.routeSummary ?? ''}</span></div> },
    { key: 'status', label: 'Trạng thái', hideBelow: 'lg', render: (o) => <StatusBadge meta={ORDER_STATUS} status={o.status} /> },
    { key: 'date', label: 'Ngày đơn', render: (o) => formatDate(o.orderDate) },
    { key: 'due', label: 'Hạn thanh toán', render: (o) => <DueIndicator dueDate={o.dueDate} overdueDays={o.overdueDays} /> },
    { key: 'total', label: 'Tổng tiền', money: true, hideBelow: 'lg', render: (o) => <MoneyCell value={o.total} /> },
    { key: 'paid', label: 'Đã thu', money: true, hideBelow: 'lg', render: (o) => <MoneyCell value={o.allocated} /> },
    { key: 'remaining', label: 'Còn nợ', money: true, render: (o) => <MoneyCell value={o.remaining} strong /> },
    {
      key: 'alloc',
      label: 'Phân bổ lần này',
      width: 180,
      render: (o) => (
        <div className="flex flex-col gap-1">
          <MoneyInput value={lines[o.orderId] ?? null} onChange={(v) => setLines((s) => ({ ...s, [o.orderId]: v }))} aria-label={`Phân bổ cho ${o.code}`} />
          {lineError(o) ? <span className="text-caption text-danger">{lineError(o)}</span> : null}
        </div>
      ),
    },
  ];

  async function submit() {
    const payload = Object.entries(lines)
      .filter(([, v]) => (v ?? 0) > 0)
      .map(([orderId, amount]) => ({ orderId, amount: amount as number }));
    if (!payload.length) {
      toast.error('Nhập số tiền phân bổ cho ít nhất một đơn');
      return;
    }
    try {
      const res = await allocate({ variables: { input: { paymentId: p!.id, lines: payload } } });
      toast.success(`Đã phân bổ ${formatVnd(totalLines)} — số dư khách hiện ${formatVnd(res.data!.allocatePayment.creditBalance)}`);
      navigate(paths.payment(p!.id));
    } catch (e) {
      toast.error(apolloErrorMessage(e));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`Phân bổ phiếu thu ${p.code}`}
        subtitle={p.customer ? `Khách hàng: ${p.customer.name}` : undefined}
        breadcrumb={[{ label: 'Phiếu thu', to: PATHS.payments }, { label: p.code, to: paths.payment(p.id) }, { label: 'Phân bổ' }]}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate(paths.payment(p.id))}>Hủy</Button>
            <Button variant="secondary" onClick={() => setLines(autoFillOldestFirst(orders, p.unallocatedAmount))} disabled={!orders.length}>
              <Wand2 /> Tự điền theo hạn cũ nhất
            </Button>
            <Button loading={saving} disabled={overTotal || hasLineError || totalLines <= 0} onClick={() => void submit()}>
              Xác nhận phân bổ
            </Button>
          </>
        }
      />
      <SummaryStrip
        items={[
          { label: 'Tổng phiếu', value: formatVnd(p.amount) },
          { label: 'Đã phân bổ trước', value: formatVnd(p.allocatedAmount) },
          { label: 'Phân bổ lần này', value: formatVnd(totalLines), tone: overTotal ? 'danger' : 'primary' },
          { label: 'Còn lại → số dư khách', value: formatVnd(Math.max(remainingAfter, 0)), tone: remainingAfter > 0 ? 'info' : 'neutral', hint: `Số dư hiện tại ${formatVnd(creditNow)}` },
        ]}
      />
      {overTotal ? <Banner tone="danger" message={`Tổng phân bổ vượt số tiền còn lại của phiếu (${formatVnd(p.unallocatedAmount)}).`} /> : null}
      {overdue.length > 1 ? (
        <WarningPanel title={`Khách có ${overdue.length} đơn quá hạn — nên phân bổ đơn cũ trước`} items={overdue.slice(0, 5).map((o) => `${o.code}: còn ${formatVnd(o.remaining)}, quá hạn ${o.overdueDays} ngày`)} />
      ) : null}
      <DataTable
        columns={columns}
        rows={orders}
        rowKey={(o) => o.orderId}
        totalRow={{ code: 'Tổng', remaining: <MoneyCell value={sum(orders.map((o) => o.remaining))} strong />, alloc: <MoneyCell value={totalLines} strong /> }}
        empty={<EmptyState message="Khách không có đơn còn nợ" description="Toàn bộ tiền của phiếu sẽ nằm trong số dư khách để trừ dần vào đơn sau." />}
      />
    </div>
  );
}
