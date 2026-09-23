import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useExportFile } from '@/features/shared/ExportDialog';
import { useNavigate, useSearchParams } from 'react-router';
import { Building2, Download, Plus } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, KpiCard, MoneyCell, PageHeader, Pagination, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { ACTIVE_STATUS, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { SupplierListFieldsFragment } from '@/gql/graphql';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { CellLink, STATUS_FILTER_OPTIONS, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { SuppliersQuery } from '../graphql/suppliers';

type Row = SupplierListFieldsFragment;

/** WM-SUP-01 — Danh sách nhà cung cấp. */
export default function SupplierListPage() {
  return (
    <RequirePermission permission="supplier.view">
      <SupplierList />
    </RequirePermission>
  );
}

function SupplierList() {
  // WM-SHELL-05: xuất Excel qua module P6
  const { exportFile, exporting } = useExportFile();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') ?? '');
  const q = useDebounced(search.trim());
  const status = params.get('status') ?? 'ACTIVE';
  const typeId = params.get('typeId');
  const hasDebt = params.get('hasDebt') === '1';
  const paging = useCursorPaging();
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  React.useEffect(() => paging.reset(), [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const { data: types } = useQuery(CatalogOptionsQuery, { variables: { type: 'SUPPLIER_TYPE' as never, activeOnly: false } });
  const filter = { search: q || null, status: status === 'ALL' ? null : status, typeId: typeId || null, hasDebt: hasDebt || null };
  const { data, loading, error, refetch } = useQuery(SuppliersQuery, { variables: { filter, first: paging.first, after: paging.after, sort: 'name' } });
  const { data: debt } = useQuery(SuppliersQuery, { variables: { filter: { hasDebt: true }, first: 200 } });
  const rows = data?.suppliers.nodes ?? [];
  const debtRows = debt?.suppliers.nodes ?? [];
  const payable = debtRows.reduce((s, r) => s + r.payableAmount, 0);
  const canEdit = hasPermission('supplier.edit');

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã', width: 110, render: (r) => <span className="font-mono text-body-sm">{r.code}</span> },
    { key: 'name', label: 'Nhà cung cấp', render: (r) => <CellLink to={paths.supplier(r.id)} className="font-medium text-text hover:text-accent hover:underline">{r.name}</CellLink> },
    { key: 'type', label: 'Loại', render: (r) => r.type?.name ?? '—' },
    {
      key: 'contact',
      label: 'Liên hệ',
      hideBelow: 'md',
      render: (r) => {
        const c = r.contacts[0];
        return c ? (
          <span className="flex flex-col">
            <span>{c.name ?? '—'}</span>
            {c.phone ? <span className="text-caption text-text-subtle">{c.phone}</span> : null}
          </span>
        ) : (
          <span className="text-text-subtle">—</span>
        );
      },
    },
    { key: 'count', label: 'Số phiếu chi', align: 'right', render: (r) => <span className="tabular-nums">{r.expenseCount}</span> },
    { key: 'payable', label: 'Công nợ phải trả', money: true, render: (r) => <MoneyCell value={r.payableAmount} tone={r.payableAmount > 0 ? 'warning' : 'muted'} strong={r.payableAmount > 0} /> },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={ACTIVE_STATUS} status={r.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Nhà cung cấp"
        subtitle="Vận tải thuê ngoài, xăng dầu, sửa chữa, phụ tùng — công nợ phải trả = phiếu chi chưa trả"
        actions={
          <>
            <Button variant="secondary" disabled={exporting} onClick={() => void exportFile('SUPPLIERS', { status: status === 'ALL' ? undefined : status })}>
              <Download /> Xuất Excel
            </Button>
            {canEdit ? (
              <Button onClick={() => navigate(PATHS.supplierNew)}>
                <Plus /> Thêm NCC
              </Button>
            ) : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard label="Tổng công nợ phải trả" value={formatVnd(payable)} tone={payable > 0 ? 'warning' : 'neutral'} to={PATHS.supplierDebt} />
        <KpiCard label="NCC còn nợ" value={debtRows.length} onClick={() => setParam('hasDebt', '1')} />
        <KpiCard label="Phiếu chi" value="Mở danh sách" sub="Toàn bộ phiếu chi NCC" to={PATHS.expenses} />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm tên, mã, MST"
        selects={[
          {
            key: 'type',
            placeholder: 'Loại NCC',
            value: typeId ?? 'ALL',
            onChange: (v) => setParam('typeId', v === 'ALL' ? null : v),
            options: [{ value: 'ALL', label: 'Mọi loại NCC' }, ...(types?.catalogItems ?? []).map((t) => ({ value: t.id, label: t.name }))],
            width: 200,
          },
          {
            key: 'status',
            placeholder: 'Trạng thái',
            value: status,
            onChange: (v) => setParam('status', v === 'ACTIVE' ? null : v),
            options: [{ value: 'ALL', label: 'Tất cả trạng thái' }, ...STATUS_FILTER_OPTIONS],
            width: 170,
          },
        ]}
        chips={<FilterChip label="Còn công nợ" active={hasDebt} onClick={() => setParam('hasDebt', hasDebt ? null : '1')} />}
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
            onRowClick={(r) => navigate(paths.supplier(r.id))}
            rowClassName={(r) => (r.status === 'INACTIVE' ? 'opacity-60' : undefined)}
            totalRow={rows.length ? { name: 'Tổng trang này', payable: <MoneyCell value={rows.reduce((s, r) => s + r.payableAmount, 0)} strong /> } : undefined}
            empty={
              <EmptyState
                icon={<Building2 strokeWidth={1.5} />}
                message={q || typeId || hasDebt || status !== 'ACTIVE' ? 'Không có NCC khớp bộ lọc' : 'Chưa có nhà cung cấp'}
                action={
                  canEdit && !q ? (
                    <Button onClick={() => navigate(PATHS.supplierNew)}>
                      <Plus /> Thêm NCC
                    </Button>
                  ) : null
                }
              />
            }
          />
          <Pagination
            hasNextPage={!!data?.suppliers.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.suppliers.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.suppliers.totalCount}
          />
        </>
      )}
    </div>
  );
}
