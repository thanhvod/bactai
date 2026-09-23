import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Wallet } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, KpiCard, MoneyCell, PageHeader, Pagination, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { PAYROLL_STATUS, formatDate, formatDateTime, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { PrPayrollFieldsFragment } from '@/gql/graphql';
import { useCursorPaging } from '@/features/master-data/helpers';
import { ExportButton } from '@/features/shared/ExportDialog';
import { yearOptions } from '../components/payroll-ui';
import { PrPayrollsQuery } from '../graphql/payroll';

type Row = PrPayrollFieldsFragment;

/** WM-PAYROLL-01 — Danh sách bảng lương. */
export default function PayrollListPage() {
  return (
    <RequirePermission permission="payroll.view">
      <PayrollList />
    </RequirePermission>
  );
}

function PayrollList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = params.get('status');
  const year = params.get('year') ?? String(new Date().getFullYear());
  const paging = useCursorPaging();
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  const filter = { status: status ? [status] : null, year: year === 'ALL' ? null : Number(year) };
  const { data, loading, error, refetch } = useQuery(PrPayrollsQuery, { variables: { filter, first: paging.first, after: paging.after } });
  const { data: pending } = useQuery(PrPayrollsQuery, { variables: { filter: { status: ['SUBMITTED'] }, first: 50 } });
  const { data: drafts } = useQuery(PrPayrollsQuery, { variables: { filter: { status: ['DRAFT', 'RETURNED'] }, first: 50 } });
  const rows = data?.payrolls.nodes ?? [];
  const pendingNet = (pending?.payrolls.nodes ?? []).reduce((s, p) => s + p.totals.net, 0);
  const latestPaid = rows.find((p) => p.status === 'PAID');

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã', width: 150, render: (r) => <span className="font-mono">{r.code}</span> },
    { key: 'period', label: 'Kỳ lương', render: (r) => <div className="flex flex-col"><span>{r.periodLabel}</span><span className="text-caption text-text-subtle">{formatDate(r.periodFrom)} – {formatDate(r.periodTo)}</span></div> },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={PAYROLL_STATUS} status={r.status} /> },
    { key: 'drivers', label: 'Tài xế', align: 'right', render: (r) => <span className="tabular-nums">{r.totals.driverCount}</span> },
    { key: 'net', label: 'Tổng thực lãnh', money: true, render: (r) => <MoneyCell value={r.totals.net} strong /> },
    { key: 'anomaly', label: 'Cảnh báo', hideBelow: 'lg', render: (r) => (r.anomalyCount ? <span className="text-warning">{r.anomalyCount} cảnh báo</span> : <span className="text-text-subtle">—</span>) },
    { key: 'created', label: 'Người tạo', hideBelow: 'lg', render: (r) => <div className="flex flex-col"><span>{r.createdByName ?? '—'}</span><span className="text-caption text-text-subtle">{formatDateTime(r.createdAt)}</span></div> },
    { key: 'approved', label: 'Duyệt / chi', hideBelow: 'md', render: (r) => (r.paidAt ? <span>Chi {formatDate(r.paidAt)}</span> : r.approvedAt ? <span>Duyệt {formatDate(r.approvedAt)}{r.approvedByName ? ` · ${r.approvedByName}` : ''}</span> : <span className="text-text-subtle">—</span>) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Bảng lương"
        subtitle="Lương cố định + thưởng chuyến − ứng lương − giảm trừ. Operation tạo, giám đốc duyệt, kế toán chi trả."
        actions={
          <>
            {hasPermission('payroll.export') ? <ExportButton template="PAYROLL" filter={{ year: year === 'ALL' ? undefined : Number(year), status: status ?? undefined }} /> : null}
            {hasPermission('payroll.generate') ? (
              <Button onClick={() => navigate(PATHS.payrollNew)}>
                <Plus /> Tạo bảng lương
              </Button>
            ) : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard label="Chờ duyệt" value={pending?.payrolls.totalCount ?? 0} sub={pendingNet ? `Tổng ${formatVnd(pendingNet)}` : 'Không có bảng chờ duyệt'} tone={pending?.payrolls.totalCount ? 'warning' : 'neutral'} onClick={() => setParam('status', 'SUBMITTED')} />
        <KpiCard label="Nháp / bị trả về" value={drafts?.payrolls.totalCount ?? 0} onClick={() => setParam('status', 'DRAFT')} />
        <KpiCard label="Kỳ đã chi gần nhất" value={latestPaid ? latestPaid.periodLabel : '—'} sub={latestPaid ? formatVnd(latestPaid.totals.net) : undefined} tone="success" />
      </div>
      <FilterBar
        selects={[{ key: 'year', placeholder: 'Năm', value: year, onChange: (v) => setParam('year', v), options: [{ value: 'ALL', label: 'Tất cả các năm' }, ...yearOptions()], width: 150 }]}
        chips={
          <>
            {(['DRAFT', 'SUBMITTED', 'RETURNED', 'APPROVED', 'PAID', 'CANCELLED'] as const).map((s) => (
              <FilterChip key={s} label={PAYROLL_STATUS[s].label} active={status === s} onClick={() => setParam('status', status === s ? null : s)} />
            ))}
          </>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            loading={loading && !data}
            onRowClick={(r) => navigate(paths.payrollDetail(r.id))}
            rowClassName={(r) => (r.status === 'CANCELLED' ? 'opacity-60' : undefined)}
            empty={
              <EmptyState
                icon={<Wallet strokeWidth={1.5} />}
                message={status ? 'Không có bảng lương khớp bộ lọc' : 'Chưa có bảng lương'}
                action={hasPermission('payroll.generate') && !status ? <Button onClick={() => navigate(PATHS.payrollNew)}><Plus /> Tạo bảng lương</Button> : null}
              />
            }
          />
          <Pagination
            hasNextPage={!!data?.payrolls.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.payrolls.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.payrolls.totalCount}
          />
        </>
      )}
    </div>
  );
}
