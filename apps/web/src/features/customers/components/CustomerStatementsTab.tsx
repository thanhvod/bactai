import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { FileText, Plus } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, MoneyCell, StatusBadge } from '@bta/shadcn';
import { DEBT_STATEMENT_STATUS, formatDate } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS, paths } from '@/app/routes';
import { DsListQuery } from '@/features/finance/graphql/debt-statements';

/** Tab "Bảng kê" của khách (WM-CUS-02 → WM-DEBT-03/04). */
export function CustomerStatementsTab({ customerId }: { customerId: string }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data, loading, error, refetch } = useQuery(DsListQuery, { variables: { filter: { customerId }, first: 50 } });
  const rows = data?.debtStatements.nodes ?? [];
  const create = () => navigate(`${PATHS.debtStatements}?customerId=${customerId}&create=1`);
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  return (
    <div className="flex flex-col gap-3">
      {hasPermission('debtStatement.create') && rows.length ? (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={create}>
            <Plus /> Tạo bảng kê
          </Button>
        </div>
      ) : null}
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading && !data}
        onRowClick={(r) => navigate(paths.debtStatement(r.id))}
        rowClassName={(r) => (r.status === 'CANCELLED' ? 'opacity-60' : undefined)}
        empty={
          <EmptyState
            compact
            icon={<FileText strokeWidth={1.5} />}
            message="Chưa có bảng kê công nợ cho khách"
            action={hasPermission('debtStatement.create') ? <Button variant="secondary" onClick={create}>Tạo bảng kê</Button> : undefined}
          />
        }
        columns={[
          { key: 'code', label: 'Mã', render: (r) => <span className="font-mono">{r.code}</span> },
          { key: 'period', label: 'Kỳ', render: (r) => `${formatDate(r.periodFrom)} – ${formatDate(r.periodTo)}` },
          { key: 'lines', label: 'Số đơn', align: 'right', hideBelow: 'md', render: (r) => r.lineCount },
          { key: 'total', label: 'Tổng', money: true, hideBelow: 'md', render: (r) => <MoneyCell value={r.totalAmount} /> },
          { key: 'remaining', label: 'Còn lại', money: true, render: (r) => <MoneyCell value={r.remainingAmount} strong /> },
          { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={DEBT_STATEMENT_STATUS} status={r.status} outline={r.status === 'CANCELLED'} /> },
          { key: 'sent', label: 'Đã gửi', hideBelow: 'lg', render: (r) => (r.sentAt ? formatDate(r.sentAt) : '—') },
        ]}
      />
    </div>
  );
}
