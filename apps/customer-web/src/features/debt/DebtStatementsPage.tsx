import * as React from 'react';
import { Link, useSearchParams } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Download } from 'lucide-react';
import { formatDate, formatVnd } from '@bta/shared';
import { Banner, Button, DataTable, DueIndicator, EmptyState, KpiCard, MoneyCell, PageHeader, Skeleton } from '@bta/shadcn';
import { MyDebtStatementQuery, MyDebtStatementsQuery } from '@/graphql/operations';
import { paths } from '@/app/routes';
import { Panel, StatementStatusBadge } from '@/components/ui';

function StatementLines({ id }: { id: string }) {
  const { data, loading, error } = useQuery(MyDebtStatementQuery, { variables: { id } });
  type Line = NonNullable<typeof data>['myDebtStatement']['lines'] extends (infer T)[] | null | undefined ? T : never;
  if (loading && !data) return <Skeleton className="h-24" />;
  if (error || !data) return <Banner tone="danger" message="Không tải được chi tiết bảng kê" />;
  const lines = (data.myDebtStatement.lines ?? []) as Line[];
  return (
    <DataTable<Line>
      compact
      rowKey={(l) => l.orderId}
      rows={lines}
      empty={<p className="p-3 text-body-sm text-text-muted">Bảng kê không có dòng nào.</p>}
      columns={[
        { key: 'date', label: 'Ngày đơn', render: (l) => formatDate(l.orderDate) },
        { key: 'code', label: 'Mã đơn', render: (l) => <Link className="text-accent hover:underline" to={paths.order(l.orderId)}>{l.orderCode}</Link> },
        { key: 'route', label: 'Tuyến', render: (l) => l.route ?? '—' },
        { key: 'total', label: 'Tổng tiền', money: true, align: 'right', render: (l) => <MoneyCell value={l.total} /> },
        { key: 'paid', label: 'Đã thu', money: true, align: 'right', render: (l) => <MoneyCell value={l.paid} tone="muted" /> },
        { key: 'remaining', label: 'Còn lại', money: true, align: 'right', render: (l) => <MoneyCell value={l.remaining} strong /> },
        { key: 'due', label: 'Hạn thanh toán', render: (l) => (l.dueDate ? <DueIndicator dueDate={l.dueDate} overdueDays={l.overdueDays} paid={l.remaining <= 0} /> : '—') },
      ]}
      totalRow={{
        route: 'Tổng',
        total: <MoneyCell value={lines.reduce((s, l) => s + l.total, 0)} strong />,
        paid: <MoneyCell value={lines.reduce((s, l) => s + l.paid, 0)} />,
        remaining: <MoneyCell value={lines.reduce((s, l) => s + l.remaining, 0)} strong />,
      }}
    />
  );
}

/** CW-DEBT-01 — Bảng kê/công nợ của tôi: bảng kê là snapshot lúc chốt; KPI còn phải trả là số hiện tại. */
export default function DebtStatementsPage() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('statement');
  const { data, loading, error, refetch } = useQuery(MyDebtStatementsQuery);
  const rows = data?.myDebtStatements ?? [];
  const sum = data?.myDebtSummary;
  type Row = (typeof rows)[number];
  const select = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('statement', id);
    else next.delete('statement');
    setParams(next, { replace: true });
  };
  const current = rows.find((r) => r.id === selected);

  return (
    <div className="space-y-4">
      <PageHeader title="Bảng kê công nợ" subtitle="Bảng kê nhà xe đã chốt và gửi cho bạn để đối chiếu" actions={<Button variant="secondary" asChild><Link to={paths.orders()}>Xem đơn còn phải trả</Link></Button>} />
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Còn phải trả (hiện tại)" value={formatVnd(sum?.remaining ?? 0)} tone={sum && sum.remaining > 0 ? 'warning' : 'neutral'} loading={!sum && loading} sub={sum ? `${sum.openOrders} đơn chưa thanh toán đủ` : undefined} />
        <KpiCard label="Quá hạn" value={formatVnd(sum?.overdue ?? 0)} tone={sum && sum.overdue > 0 ? 'danger' : 'neutral'} loading={!sum && loading} />
        <KpiCard label="Đã thanh toán" value={formatVnd(sum?.paid ?? 0)} tone="success" loading={!sum && loading} />
      </div>
      {error ? <Banner tone="danger" message="Không tải được bảng kê" action={<Button size="sm" variant="secondary" onClick={() => refetch()}>Thử lại</Button>} /> : null}
      <DataTable<Row>
        rowKey={(r) => r.id}
        loading={loading && !data}
        rows={rows}
        onRowClick={(r) => select(r.id === selected ? null : r.id)}
        rowClassName={(r) => (r.id === selected ? 'bg-accent-soft' : undefined)}
        empty={<EmptyState message="Nhà xe chưa gửi bảng kê nào" />}
        columns={[
          { key: 'code', label: 'Mã bảng kê', render: (r) => <span className="text-body-strong text-accent">{r.code}</span> },
          { key: 'merchant', label: 'Nhà xe', render: (r) => r.merchantName },
          { key: 'period', label: 'Kỳ', render: (r) => `${formatDate(r.periodFrom)} – ${formatDate(r.periodTo)}` },
          { key: 'sent', label: 'Ngày gửi', render: (r) => (r.sentAt ? formatDate(r.sentAt) : '—'), hideBelow: 'md' },
          { key: 'count', label: 'Số đơn', align: 'right', render: (r) => r.orderCount, hideBelow: 'md' },
          { key: 'total', label: 'Tổng tiền', money: true, align: 'right', render: (r) => <MoneyCell value={r.total} /> },
          { key: 'remaining', label: 'Còn lại', money: true, align: 'right', render: (r) => <MoneyCell value={r.remaining} strong /> },
          { key: 'status', label: 'Trạng thái', render: (r) => <StatementStatusBadge status={r.status} /> },
          {
            key: 'pdf',
            label: '',
            render: (r) =>
              r.pdfUrl ? (
                <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                  <a href={r.pdfUrl} target="_blank" rel="noreferrer">
                    <Download /> PDF
                  </a>
                </Button>
              ) : null,
          },
        ]}
      />
      {current ? (
        <Panel title={`Chi tiết ${current.code} (số liệu tại thời điểm chốt)`} actions={<Button variant="ghost" size="sm" onClick={() => select(null)}>Đóng</Button>}>
          <StatementLines id={current.id} />
        </Panel>
      ) : null}
      <p className="text-body-sm text-text-muted">
        Số tiền bạn đã chuyển nhưng nhà xe chưa phân bổ vào đơn sẽ được tính là số dư, trừ vào các đơn sau.
      </p>
    </div>
  );
}
