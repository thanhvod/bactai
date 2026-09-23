import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { ImportWizard } from '@/features/shared/ImportWizard';
import { useExportFile } from '@/features/shared/ExportDialog';
import { useNavigate, useSearchParams } from 'react-router';
import { Download, Plus, Truck, Upload } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, KpiCard, MoneyCell, PageHeader, Pagination, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { TRIP_STATUS, VEHICLE_STATUS, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { VehicleListFieldsFragment } from '@/gql/graphql';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { CellLink, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { ExpiryCell } from '@/features/master-data/tables';
import { VehiclesQuery } from '../graphql/vehicles';

type Row = VehicleListFieldsFragment;

/** WM-VEH-01 — Danh sách xe. */
export default function VehicleListPage() {
  return (
    <RequirePermission permission="vehicle.view">
      <VehicleList />
    </RequirePermission>
  );
}

function VehicleList() {
  // WM-SHELL-04/05: import Excel + xuất Excel qua module P6
  const { exportFile, exporting } = useExportFile();
  const [importOpen, setImportOpen] = React.useState(false);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') ?? '');
  const q = useDebounced(search.trim());
  const status = params.get('status') ?? 'ALL_ACTIVE';
  const typeId = params.get('typeId');
  const expiring = params.get('expiring') === '1';
  const paging = useCursorPaging();
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  React.useEffect(() => paging.reset(), [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: types } = useQuery(CatalogOptionsQuery, { variables: { type: 'VEHICLE_TYPE' as never, activeOnly: false } });
  const filter = { search: q || null, status: status === 'ALL_ACTIVE' || status === 'ALL' ? null : status, typeId: typeId || null };
  const { data, loading, error, refetch } = useQuery(VehiclesQuery, { variables: { filter, first: paging.first, after: paging.after, sort: 'plate' } });
  const { data: all } = useQuery(VehiclesQuery, { variables: { filter: {}, first: 200 } });
  let rows = data?.vehicles.nodes ?? [];
  if (status === 'ALL_ACTIVE') rows = rows.filter((r) => r.status !== 'INACTIVE');
  if (expiring) rows = rows.filter((r) => r.expiryWarnings.length > 0);
  const allRows = all?.vehicles.nodes ?? [];
  const inUse = allRows.filter((v) => v.status !== 'INACTIVE');
  const running = inUse.filter((v) => v.currentTrip && !['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(v.currentTrip.status)).length;
  const maintenance = inUse.filter((v) => v.status === 'MAINTENANCE').length;
  const expiringCount = inUse.filter((v) => v.expiryWarnings.length > 0).length;
  const monthCost = inUse.reduce((s, v) => s + v.monthCost, 0);
  const canEdit = hasPermission('vehicle.edit');

  const columns: DataTableColumn<Row>[] = [
    { key: 'plate', label: 'Biển số', render: (r) => <CellLink to={paths.vehicle(r.id)} className="font-mono font-medium text-text hover:text-accent hover:underline">{r.plate}</CellLink> },
    { key: 'code', label: 'Mã', hideBelow: 'lg', render: (r) => <span className="font-mono text-body-sm text-text-muted">{r.code}</span> },
    { key: 'type', label: 'Loại xe', render: (r) => r.type?.name ?? '—' },
    { key: 'capacity', label: 'Tải trọng', align: 'right', render: (r) => (r.capacityTons != null ? `${r.capacityTons} tấn` : '—') },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={VEHICLE_STATUS} status={r.status} /> },
    {
      key: 'trip',
      label: 'Chuyến hiện tại',
      render: (r) =>
        r.currentTrip ? (
          <span className="flex flex-col">
            <span className="flex items-center gap-1.5">
              <CellLink to={paths.trip(r.currentTrip.id)}>{r.currentTrip.code}</CellLink>
              <StatusBadge meta={TRIP_STATUS} status={r.currentTrip.status} />
            </span>
            {r.currentTrip.driverName ? <span className="text-caption text-text-subtle">{r.currentTrip.driverName}</span> : null}
          </span>
        ) : (
          <span className="text-text-subtle">—</span>
        ),
    },
    { key: 'monthCost', label: 'Chi phí tháng này', money: true, render: (r) => <MoneyCell value={r.monthCost} tone={r.monthCost ? 'default' : 'muted'} /> },
    { key: 'reg', label: 'Hạn đăng kiểm', hideBelow: 'md', render: (r) => <ExpiryCell date={r.registrationExpiresAt} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Xe"
        subtitle="Đội xe, trạng thái, chuyến hiện tại và chi phí vật tư"
        actions={
          <>
            <Button variant="secondary" disabled={exporting} onClick={() => void exportFile('VEHICLES', { status: status === 'ALL_ACTIVE' || status === 'ALL' ? undefined : status })}>
              <Download /> Xuất Excel
            </Button>
            {canEdit ? (
              <>
                <Button variant="secondary" onClick={() => setImportOpen(true)}>
                  <Upload /> Import
                </Button>
                <ImportWizard open={importOpen} onOpenChange={setImportOpen} entityType="VEHICLE" onDone={() => void refetch()} />
                <Button onClick={() => navigate(PATHS.vehicleNew)}>
                  <Plus /> Thêm xe
                </Button>
              </>
            ) : null}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Xe đang sử dụng" value={inUse.length} sub={`${running} đang chạy chuyến`} to={PATHS.dispatchCalendar} />
        <KpiCard label="Đang bảo dưỡng" value={maintenance} tone={maintenance ? 'warning' : 'neutral'} onClick={() => setParam('status', 'MAINTENANCE')} />
        <KpiCard label="Sắp hết đăng kiểm/bảo hiểm" value={expiringCount} tone={expiringCount ? 'danger' : 'neutral'} sub="Còn ≤ 30 ngày" onClick={() => setParam('expiring', '1')} />
        <KpiCard label="Chi phí xe tháng này" value={formatVnd(monthCost)} to={`${PATHS.expenses}?kind=VEHICLE_SUPPLY`} />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm biển số, mã xe"
        selects={[
          {
            key: 'status',
            placeholder: 'Trạng thái',
            value: status,
            onChange: (v) => setParam('status', v === 'ALL_ACTIVE' ? null : v),
            options: [{ value: 'ALL_ACTIVE', label: 'Đang sử dụng' }, { value: 'ALL', label: 'Tất cả' }, ...Object.entries(VEHICLE_STATUS).map(([value, m]) => ({ value, label: m.label }))],
            width: 160,
          },
          {
            key: 'type',
            placeholder: 'Loại xe',
            value: typeId ?? 'ALL',
            onChange: (v) => setParam('typeId', v === 'ALL' ? null : v),
            options: [{ value: 'ALL', label: 'Mọi loại xe' }, ...(types?.catalogItems ?? []).map((t) => ({ value: t.id, label: t.name }))],
            width: 170,
          },
        ]}
        chips={<FilterChip label="Sắp hết đăng kiểm" active={expiring} onClick={() => setParam('expiring', expiring ? null : '1')} />}
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
            onRowClick={(r) => navigate(paths.vehicle(r.id))}
            rowClassName={(r) => (r.status === 'INACTIVE' ? 'opacity-60' : undefined)}
            empty={
              <EmptyState
                icon={<Truck strokeWidth={1.5} />}
                message={q || typeId || expiring || status !== 'ALL_ACTIVE' ? 'Không có xe khớp bộ lọc' : 'Chưa có xe'}
                action={
                  canEdit && !q ? (
                    <Button onClick={() => navigate(PATHS.vehicleNew)}>
                      <Plus /> Thêm xe đầu tiên
                    </Button>
                  ) : null
                }
              />
            }
          />
          <Pagination
            hasNextPage={!!data?.vehicles.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.vehicles.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.vehicles.totalCount}
          />
        </>
      )}
    </div>
  );
}
