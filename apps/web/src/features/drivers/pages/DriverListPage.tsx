import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { ImportWizard } from '@/features/shared/ImportWizard';
import { useExportFile } from '@/features/shared/ExportDialog';
import { useNavigate, useSearchParams } from 'react-router';
import { Download, Plus, Upload, UserRound } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, KpiCard, MoneyCell, PageHeader, Pagination, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { ACTIVE_STATUS, TRIP_STATUS, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { DriverListFieldsFragment } from '@/gql/graphql';
import { APP_ACCOUNT_STATUS, CellLink, STATUS_FILTER_OPTIONS, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { DriversQuery } from '../graphql/drivers';

type Row = DriverListFieldsFragment;

/** WM-DRV-01 — Danh sách tài xế. */
export default function DriverListPage() {
  return (
    <RequirePermission permission="driver.view">
      <DriverList />
    </RequirePermission>
  );
}

function DriverList() {
  // WM-SHELL-04/05: import Excel + xuất Excel qua module P6
  const { exportFile, exporting } = useExportFile();
  const [importOpen, setImportOpen] = React.useState(false);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') ?? '');
  const q = useDebounced(search.trim());
  const status = params.get('status') ?? 'ACTIVE';
  const quick = params.get('quick'); // codWarning | noApp
  const paging = useCursorPaging();
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  React.useEffect(() => paging.reset(), [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const filter = {
    search: q || null,
    status: status === 'ALL' ? null : status,
    codWarning: quick === 'codWarning' ? true : null,
    hasApp: quick === 'noApp' ? false : quick === 'hasApp' ? true : null,
  };
  const { data, loading, error, refetch } = useQuery(DriversQuery, { variables: { filter, first: paging.first, after: paging.after, sort: 'name' } });
  // KPI: toàn bộ tài xế đang hoạt động (không phụ thuộc bộ lọc)
  const { data: all } = useQuery(DriversQuery, { variables: { filter: { status: 'ACTIVE' }, first: 200 } });
  const rows = data?.drivers.nodes ?? [];
  const allRows = all?.drivers.nodes ?? [];
  const running = allRows.filter((d) => d.currentTrip && !['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(d.currentTrip.status)).length;
  const codTotal = allRows.reduce((s, d) => s + d.ledgerSummary.codHeld, 0);
  const codWarn = allRows.filter((d) => d.ledgerSummary.overAmount || d.ledgerSummary.overDays).length;
  const companyOwes = allRows.reduce((s, d) => s + d.ledgerSummary.companyOwesDriver, 0);
  const canCreate = hasPermission('driver.edit');

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã', width: 110, render: (r) => <span className="font-mono text-body-sm">{r.code}</span> },
    {
      key: 'name',
      label: 'Tài xế',
      render: (r) => (
        <div className="flex flex-col">
          <CellLink to={paths.driver(r.id)} className="font-medium text-text hover:text-accent hover:underline">
            {r.name}
          </CellLink>
          <span className="text-caption text-text-subtle">{r.phone}</span>
        </div>
      ),
    },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={ACTIVE_STATUS} status={r.status} /> },
    {
      key: 'trip',
      label: 'Chuyến hiện tại',
      render: (r) =>
        r.currentTrip ? (
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5">
              <CellLink to={paths.trip(r.currentTrip.id)}>{r.currentTrip.code}</CellLink>
              <StatusBadge meta={TRIP_STATUS} status={r.currentTrip.status} />
            </span>
            <span className="text-caption text-text-subtle">
              {[r.currentTrip.vehiclePlate, r.currentTrip.routeSummary].filter(Boolean).join(' · ')}
            </span>
          </div>
        ) : (
          <span className="text-text-subtle">Rảnh</span>
        ),
    },
    { key: 'app', label: 'App tài xế', hideBelow: 'lg', render: (r) => <StatusBadge meta={APP_ACCOUNT_STATUS} status={r.appAccount.status} /> },
    { key: 'salary', label: 'Lương cố định', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.fixedSalary} /> },
    {
      key: 'cod',
      label: 'COD đang giữ',
      money: true,
      render: (r) => {
        const warn = r.ledgerSummary.overAmount || r.ledgerSummary.overDays;
        return r.ledgerSummary.codHeld > 0 ? (
          <CellLink to={paths.driverCod(r.id)} className="block">
            <MoneyCell value={r.ledgerSummary.codHeld} tone={warn ? 'danger' : 'default'} strong={warn} />
            {warn ? <span className="block text-right text-caption text-danger">Giữ {r.ledgerSummary.daysHeld} ngày · vượt ngưỡng</span> : null}
          </CellLink>
        ) : (
          <MoneyCell value={0} tone="muted" />
        );
      },
    },
    { key: 'companyOwes', label: 'Cty nợ TX', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.ledgerSummary.companyOwesDriver} tone={r.ledgerSummary.companyOwesDriver > 0 ? 'warning' : 'muted'} /> },
    { key: 'driverOwes', label: 'TX nợ Cty', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.ledgerSummary.driverOwesCompany} tone={r.ledgerSummary.driverOwesCompany > 0 ? 'warning' : 'muted'} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Tài xế"
        subtitle="Hồ sơ, tài khoản app, lương cố định, COD đang giữ và công nợ 2 chiều"
        actions={
          <>
            <Button variant="secondary" disabled={exporting} onClick={() => void exportFile('DRIVERS', { status: status === 'ALL' ? undefined : status })}>
              <Download /> Xuất Excel
            </Button>
            {canCreate ? (
              <>
                <Button variant="secondary" onClick={() => setImportOpen(true)}>
                  <Upload /> Import
                </Button>
                <ImportWizard open={importOpen} onOpenChange={setImportOpen} entityType="DRIVER" onDone={() => void refetch()} />
                <Button onClick={() => navigate(PATHS.driverNew)}>
                  <Plus /> Thêm tài xế
                </Button>
              </>
            ) : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Tài xế đang hoạt động" value={allRows.length} sub={`${running} đang chạy chuyến`} to={PATHS.dispatchCalendar} />
        <KpiCard label="COD tài xế đang giữ" value={formatVnd(codTotal)} tone={codWarn ? 'danger' : 'neutral'} sub={codWarn ? `${codWarn} tài xế vượt ngưỡng` : 'Không có cảnh báo'} onClick={() => setParam('quick', 'codWarning')} />
        <KpiCard label="Công ty nợ tài xế" value={formatVnd(companyOwes)} tone={companyOwes > 0 ? 'warning' : 'neutral'} sub="Chi phí tài xế ứng chưa hoàn" to={PATHS.expenses} />
        <KpiCard label="Chưa có tài khoản app" value={allRows.filter((d) => d.appAccount.status === 'NONE').length} onClick={() => setParam('quick', 'noApp')} />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm tên, SĐT, mã tài xế"
        selects={[
          {
            key: 'status',
            placeholder: 'Trạng thái',
            value: status,
            onChange: (v) => setParam('status', v === 'ACTIVE' ? null : v),
            options: [{ value: 'ALL', label: 'Tất cả trạng thái' }, ...STATUS_FILTER_OPTIONS],
            width: 170,
          },
        ]}
        chips={
          <>
            <FilterChip label="COD vượt ngưỡng" active={quick === 'codWarning'} onClick={() => setParam('quick', quick === 'codWarning' ? null : 'codWarning')} />
            <FilterChip label="Chưa có app" active={quick === 'noApp'} onClick={() => setParam('quick', quick === 'noApp' ? null : 'noApp')} />
            <FilterChip label="Đang dùng app" active={quick === 'hasApp'} onClick={() => setParam('quick', quick === 'hasApp' ? null : 'hasApp')} />
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
            onRowClick={(r) => navigate(paths.driver(r.id))}
            rowClassName={(r) => (r.status === 'INACTIVE' ? 'opacity-60' : undefined)}
            empty={
              <EmptyState
                icon={<UserRound strokeWidth={1.5} />}
                message={q || quick || status !== 'ACTIVE' ? 'Không có tài xế khớp bộ lọc' : 'Chưa có tài xế'}
                action={
                  canCreate && !q ? (
                    <Button onClick={() => navigate(PATHS.driverNew)}>
                      <Plus /> Thêm tài xế
                    </Button>
                  ) : null
                }
              />
            }
          />
          <Pagination
            hasNextPage={!!data?.drivers.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.drivers.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.drivers.totalCount}
          />
        </>
      )}
    </div>
  );
}
