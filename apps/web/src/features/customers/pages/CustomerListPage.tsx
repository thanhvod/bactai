import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { ImportWizard } from '@/features/shared/ImportWizard';
import { useExportFile } from '@/features/shared/ExportDialog';
import { useNavigate, useSearchParams } from 'react-router';
import { Download, MoreHorizontal, Plus, Upload } from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  FilterChip,
  IconButton,
  KpiCard,
  Menu,
  MoneyCell,
  PageHeader,
  Pagination,
  SensitiveActionModal,
  toast,
} from '@bta/shadcn';
import { formatVnd } from '@bta/shared';
import { Can, RequirePermission } from '@/app/auth/guards';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import type { CustomerListFieldsFragment } from '@/gql/graphql';
import { CustomerFormDrawer } from '../components/CustomerFormDrawer';
import { CreditUsage } from '../components/CreditUsage';
import { CustomerTotalsQuery, CustomersQuery, DeactivateCustomerMutation } from '../graphql/customers';

const DEBT_CHIPS = [
  { key: 'HAS_DEBT', label: 'Còn nợ' },
  { key: 'OVERDUE', label: 'Quá hạn' },
  { key: 'OVER_LIMIT', label: 'Vượt hạn mức' },
  { key: 'HAS_CREDIT', label: 'Có số dư' },
];

/** WM-CUS-01 — Danh sách khách hàng. `createOpen` = WM-CUS-03 drawer (route /customers/new). */
export function CustomerList({ createOpen = false }: { createOpen?: boolean }) {
  const navigate = useNavigate();
  // WM-SHELL-04/05: import Excel + xuất Excel qua module P6
  const { exportFile, exporting } = useExportFile();
  const [importOpen, setImportOpen] = React.useState(false);
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') ?? '');
  const [debounced, setDebounced] = React.useState(search);
  const debt = params.get('debt');
  const inactive = params.get('status') === 'INACTIVE';
  const [pageSize, setPageSize] = React.useState(20);
  const [cursors, setCursors] = React.useState<(string | null)[]>([null]);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  React.useEffect(() => setCursors([null]), [debounced, debt, inactive, pageSize]);
  const filter = { search: debounced || null, debtStatus: debt || null, status: inactive ? 'INACTIVE' : null };
  const { data, loading, error, refetch } = useQuery(CustomersQuery, { variables: { filter, first: pageSize, after: cursors[cursors.length - 1] } });
  // KPI tổng hợp tính ở API trên toàn bộ khách (customerTotals) — không phụ thuộc trang đang xem.
  const kpi = useQuery(CustomerTotalsQuery, { variables: { filter: { status: 'ACTIVE' } }, fetchPolicy: 'cache-and-network' });
  const [deactivate] = useMutation(DeactivateCustomerMutation);
  const [toDeactivate, setToDeactivate] = React.useState<CustomerListFieldsFragment | null>(null);

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next);
  };
  const rows = data?.customers.nodes ?? [];
  const t = kpi.data?.customerTotals;
  const totals = {
    active: t?.activeCount ?? 0,
    remaining: t?.remaining ?? 0,
    overLimit: t?.overLimitCustomers ?? 0,
    overdue: t?.overdueAmount ?? 0,
    overdueCustomers: t?.overdueCustomers ?? 0,
    credit: t?.creditBalance ?? 0,
    creditCustomers: t?.creditCustomers ?? 0,
  };
  const filtered = !!(debounced || debt || inactive);

  const onDeactivate = async (reason: string) => {
    if (!toDeactivate) return;
    try {
      await deactivate({ variables: { id: toDeactivate.id, reason: reason || null } });
      toast.success(`Đã ngừng hoạt động ${toDeactivate.name}`);
      setToDeactivate(null);
      void refetch();
    } catch (e) {
      toast.error('Không ngừng được khách hàng', apolloErrorMessage(e));
      throw e;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Khách hàng"
        subtitle="Theo dõi công nợ, hạn mức và lịch sử đơn của từng khách"
        actions={
          <>
            <Can permission="customer.edit">
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                <Upload /> Import
              </Button>
              <ImportWizard open={importOpen} onOpenChange={setImportOpen} entityType="CUSTOMER" onDone={() => { void refetch(); void kpi.refetch(); }} />
            </Can>
            <Button variant="secondary" disabled={exporting} onClick={() => void exportFile('CUSTOMERS', { status: inactive ? 'INACTIVE' : undefined })}>
              <Download /> Xuất Excel
            </Button>
            <Can permission="customer.edit">
              <Button onClick={() => navigate(PATHS.customerNew)}>
                <Plus /> Tạo khách hàng
              </Button>
            </Can>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard label="Khách đang hoạt động" value={totals.active} loading={kpi.loading && !kpi.data} />
        <KpiCard label="Tổng còn nợ" value={formatVnd(totals.remaining)} sub={totals.overLimit ? `${totals.overLimit} khách vượt hạn mức` : 'Tất cả khách trong hạn mức'} to={PATHS.customerDebt} tone="warning" loading={kpi.loading && !kpi.data} />
        <KpiCard label="Quá hạn" value={formatVnd(totals.overdue)} sub={`${totals.overdueCustomers} khách · cần thu hồi`} to={`${PATHS.customerDebt}?overdue=1`} tone="danger" loading={kpi.loading && !kpi.data} />
        <KpiCard label="Số dư chưa phân bổ" value={formatVnd(totals.credit)} sub={`${totals.creditCustomers} khách có tiền dư`} tone="info" loading={kpi.loading && !kpi.data} />
      </div>
      <FilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
        }}
        searchPlaceholder="Tìm tên, SĐT, MST, mã khách…"
        chips={
          <>
            <FilterChip label="Tất cả" active={!debt && !inactive} onClick={() => setParams(new URLSearchParams())} />
            {DEBT_CHIPS.map((c) => (
              <FilterChip key={c.key} label={c.label} active={debt === c.key} onClick={() => setParam('debt', debt === c.key ? null : c.key)} />
            ))}
            <FilterChip label="Ngừng hoạt động" active={inactive} onClick={() => setParam('status', inactive ? null : 'INACTIVE')} />
          </>
        }
      />
      {error ? (
        <ErrorState title="Không tải được danh sách khách" error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          loading={loading && !data}
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate(paths.customer(r.id))}
          rowClassName={(r) => (r.status === 'INACTIVE' ? 'opacity-60' : undefined)}
          empty={
            filtered ? (
              <EmptyState
                message="Không có khách khớp bộ lọc"
                action={
                  <Button variant="secondary" onClick={() => { setSearch(''); setParams(new URLSearchParams()); }}>
                    Xóa bộ lọc
                  </Button>
                }
              />
            ) : (
              <EmptyState message="Chưa có khách hàng" action={hasPermission('customer.edit') ? <Button onClick={() => navigate(PATHS.customerNew)}>Tạo khách hàng</Button> : undefined} />
            )
          }
          columns={[
            {
              key: 'name',
              label: 'Khách hàng',
              render: (r) => (
                <div className="flex flex-col">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-caption text-text-muted">
                    <span className="font-mono">{r.code}</span>
                    {r.phone ? ` · ${r.phone}` : ''}
                    {r.taxCode ? ` · MST ${r.taxCode}` : ''}
                  </span>
                </div>
              ),
            },
            {
              key: 'debt',
              label: 'Còn nợ · Quá hạn',
              align: 'right',
              render: (r) => (
                <div className="flex flex-col items-end">
                  <MoneyCell value={r.debtSummary.remaining} strong />
                  {r.debtSummary.overdueAmount > 0 ? (
                    <span className="text-caption text-danger tabular-nums">Quá hạn {formatVnd(r.debtSummary.overdueAmount)}</span>
                  ) : (
                    <span className="text-caption text-text-subtle">Không quá hạn</span>
                  )}
                </div>
              ),
            },
            { key: 'credit', label: 'Số dư', money: true, render: (r) => <MoneyCell value={r.creditBalance} tone={r.creditBalance > 0 ? 'success' : 'muted'} /> },
            { key: 'limit', label: 'Hạn mức · đã dùng', align: 'right', render: (r) => <CreditUsage limit={r.creditLimit} pct={r.debtSummary.limitUsagePct} />, hideBelow: 'md' },
            { key: 'days', label: 'Công nợ', align: 'right', render: (r) => (r.defaultDebtDays !== null && r.defaultDebtDays !== undefined ? `${r.defaultDebtDays} ngày` : '—'), hideBelow: 'lg' },
            { key: 'orders', label: 'Số đơn', align: 'right', render: (r) => <span className="tabular-nums">{r.orderCount}</span>, hideBelow: 'lg' },
            {
              key: 'warn',
              label: 'Cảnh báo',
              render: (r) => (
                <div className="flex flex-wrap gap-1">
                  {r.status === 'INACTIVE' ? <Badge tone="neutral">Ngừng hoạt động</Badge> : null}
                  {r.debtSummary.overLimit ? <Badge tone="danger">Vượt hạn mức</Badge> : null}
                  {r.debtSummary.overdueOrders > 0 ? <Badge tone="warning">Quá hạn {r.debtSummary.maxOverdueDays} ngày</Badge> : null}
                  {r.creditBalance > 0 ? <Badge tone="info">Có số dư</Badge> : null}
                  {r.status !== 'INACTIVE' && !r.debtSummary.overLimit && !r.debtSummary.overdueOrders && r.creditBalance <= 0 ? <span className="text-text-subtle">—</span> : null}
                </div>
              ),
            },
            {
              key: 'menu',
              label: '',
              align: 'right',
              render: (r) => (
                <span onClick={(e) => e.stopPropagation()}>
                  <Menu
                    trigger={
                      <IconButton label="Thao tác" tooltip={false}>
                        <MoreHorizontal />
                      </IconButton>
                    }
                    items={[
                      { key: 'view', label: 'Xem chi tiết', onSelect: () => navigate(paths.customer(r.id)) },
                      { key: 'order', label: 'Tạo đơn', disabled: r.status === 'INACTIVE' || !hasPermission('order.create'), onSelect: () => navigate(`${PATHS.orderNew}?customerId=${r.id}`) },
                      { key: 'pay', label: 'Ghi nhận thanh toán', disabled: !hasPermission('payment.create'), onSelect: () => navigate(`${PATHS.paymentNew}?customerId=${r.id}&type=CUSTOMER_PAYMENT`) },
                      { key: 'edit', label: 'Sửa', disabled: !hasPermission('customer.edit'), onSelect: () => navigate(paths.customerEdit(r.id)) },
                      ...(r.status !== 'INACTIVE'
                        ? [{ key: 'deactivate', label: 'Ngừng hoạt động', danger: true, separatorBefore: true, disabled: !(hasPermission('customer.deactivate') || (r.orderCount === 0 && hasPermission('customer.edit'))), onSelect: () => setToDeactivate(r) }]
                        : []),
                    ]}
                  />
                </span>
              ),
            },
          ]}
        />
      )}
      <Pagination
        hasNextPage={!!data?.customers.pageInfo.hasNextPage}
        hasPrevPage={cursors.length > 1}
        onNext={() => setCursors([...cursors, data?.customers.pageInfo.endCursor ?? null])}
        onPrev={() => setCursors(cursors.slice(0, -1))}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        shown={rows.length}
        total={data?.customers.totalCount}
      />
      <CustomerFormDrawer
        open={createOpen}
        onOpenChange={(o) => !o && navigate(PATHS.customers)}
        onSaved={(id) => {
          void refetch();
          navigate(paths.customer(id));
        }}
      />
      <SensitiveActionModal
        open={!!toDeactivate}
        onOpenChange={(o) => !o && setToDeactivate(null)}
        action={`Ngừng hoạt động khách hàng ${toDeactivate?.name ?? ''}`}
        description="Khách ngừng hoạt động vẫn hiện trong lịch sử nhưng không chọn được khi tạo đơn mới."
        affected={toDeactivate ? [`${toDeactivate.orderCount} đơn đã có`, `Còn nợ ${formatVnd(toDeactivate.debtSummary.remaining)}`] : []}
        warning={toDeactivate && toDeactivate.debtSummary.remaining > 0 ? 'Khách vẫn còn công nợ — tiếp tục theo dõi thu hồi ở màn công nợ.' : undefined}
        confirmLabel="Ngừng hoạt động"
        onConfirm={onDeactivate}
      />
    </div>
  );
}

export default function CustomerListPage() {
  return (
    <RequirePermission permission="customer.view">
      <CustomerList />
    </RequirePermission>
  );
}
