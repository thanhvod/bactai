import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { AlertTriangle, Plus } from 'lucide-react';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, KpiCard, Menu, PageHeader, Pagination, StatusBadge, toast, type DataTableColumn } from '@bta/shadcn';
import { INCIDENT_SEVERITY, INCIDENT_STATUS, formatDateTime } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { paths } from '@/app/routes';
import type { IncidentListFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { CellLink, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { IncidentCreateDialog } from '../components/IncidentCreateDialog';
import { AssignIncidentMutation, IncidentsQuery, StaffOptionsQuery } from '../graphql/dispatch';

type Row = IncidentListFieldsFragment;

/** WM-DISPATCH-05 — Sự cố vận hành: lọc theo trạng thái/mức độ/loại/người xử lý; tạo, gán, đóng. */
export default function IncidentListPage() {
  return (
    <RequirePermission permission="order.view">
      <IncidentList />
    </RequirePermission>
  );
}

function IncidentList() {
  const navigate = useNavigate();
  const { hasPermission, current } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState('');
  const q = useDebounced(search.trim());
  const view = params.get('view') ?? 'open';
  const severity = params.get('severity');
  const typeId = params.get('typeId');
  const assigneeId = params.get('assigneeId');
  const paging = useCursorPaging();
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  const status = view === 'open' ? ['OPEN', 'IN_PROGRESS'] : view === 'all' ? null : [view];
  const filter = { status, severity: severity ? [severity] : null, typeId: typeId || null, assigneeId: assigneeId || null, search: q || null };
  const { data, loading, error, refetch } = useQuery(IncidentsQuery, { variables: { filter, first: paging.first, after: paging.after }, pollInterval: 60_000 });
  const { data: openAll } = useQuery(IncidentsQuery, { variables: { filter: { status: ['OPEN', 'IN_PROGRESS'] }, first: 200 } });
  const { data: types } = useQuery(CatalogOptionsQuery, { variables: { type: 'INCIDENT_TYPE' as never, activeOnly: false } });
  const { data: staff } = useQuery(StaffOptionsQuery);
  const [assign] = useMutation(AssignIncidentMutation);
  const [createOpen, setCreateOpen] = React.useState(false);
  const canManage = hasPermission('incident.manage');
  const open = openAll?.incidents.nodes ?? [];
  const handlers = (staff?.staffOptions ?? []).filter((u) => u.effectivePermissions.includes('incident.manage'));
  const myId = current?.membershipId;

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã', render: (r) => <CellLink to={paths.incident(r.id)} className="font-mono font-medium text-text hover:text-accent hover:underline">{r.code}</CellLink> },
    { key: 'title', label: 'Sự cố', render: (r) => <span className="flex flex-col"><span className="font-medium">{r.title}</span><span className="text-caption text-text-muted">{r.typeName ?? '—'}</span></span> },
    { key: 'sev', label: 'Mức độ', render: (r) => <StatusBadge meta={INCIDENT_SEVERITY} status={r.severity} /> },
    { key: 'ref', label: 'Đơn / chuyến', render: (r) => <span className="flex flex-col">{r.orderId ? <CellLink to={paths.order(r.orderId)}>{r.orderCode}</CellLink> : '—'}{r.tripId ? <CellLink to={paths.trip(r.tripId)}>{r.tripCode}</CellLink> : null}</span> },
    { key: 'who', label: 'Xe / tài xế', hideBelow: 'lg', render: (r) => [r.vehiclePlate, r.driverName].filter(Boolean).join(' · ') || '—' },
    { key: 'rep', label: 'Báo bởi', hideBelow: 'lg', render: (r) => <span className="flex flex-col"><span>{r.reportedByName ?? '—'}</span><span className="text-caption text-text-subtle">{formatDateTime(r.createdAt)}</span></span> },
    {
      key: 'assignee',
      label: 'Người xử lý',
      render: (r) =>
        canManage && (r.status === 'OPEN' || r.status === 'IN_PROGRESS') ? (
          <span onClick={(e) => e.stopPropagation()}>
            <Menu
              trigger={<Button size="sm" variant="ghost">{r.assigneeName ?? <span className="text-warning">Chưa gán</span>}</Button>}
              items={handlers.map((u) => ({
                key: u.id,
                label: u.name,
                onSelect: async () => {
                  try {
                    await assign({ variables: { id: r.id, userId: u.id } });
                    toast.success(`Đã gán ${u.name} xử lý ${r.code}`);
                    void refetch();
                  } catch (e) {
                    toast.error('Không gán được', apolloErrorMessage(e));
                  }
                },
              }))}
            />
          </span>
        ) : (
          r.assigneeName ?? '—'
        ),
    },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={INCIDENT_STATUS} status={r.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sự cố vận hành"
        subtitle="Hư xe, trễ giờ, hàng hư/thiếu, sai COD… — bản ghi riêng, khác trạng thái Tạm dừng"
        actions={
          canManage ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus /> Tạo sự cố
            </Button>
          ) : null
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Đang mở" value={open.length} tone={open.length ? 'danger' : 'neutral'} onClick={() => set('view', null)} />
        <KpiCard label="Nghiêm trọng / cao" value={open.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length} tone="danger" onClick={() => set('severity', 'HIGH')} />
        <KpiCard label="Chưa gán người xử lý" value={open.filter((i) => !i.assigneeUserId).length} tone="warning" />
        <KpiCard label="Giao cho tôi" value={myId ? open.filter((i) => i.assigneeUserId === myId).length : '—'} onClick={myId ? () => set('assigneeId', myId) : undefined} />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã, tiêu đề"
        chips={
          <>
            {[
              { k: 'open', l: 'Đang mở' },
              { k: 'OPEN', l: 'Mới' },
              { k: 'IN_PROGRESS', l: 'Đang xử lý' },
              { k: 'RESOLVED', l: 'Đã xử lý' },
              { k: 'all', l: 'Tất cả' },
            ].map((c) => (
              <FilterChip key={c.k} label={c.l} active={view === c.k} onClick={() => set('view', c.k === 'open' ? null : c.k)} />
            ))}
            {assigneeId ? <FilterChip label="Lọc người xử lý" active onRemove={() => set('assigneeId', null)} /> : null}
          </>
        }
        selects={[
          { key: 'sev', placeholder: 'Mức độ', value: severity ?? 'ALL', onChange: (v) => set('severity', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi mức độ' }, ...Object.entries(INCIDENT_SEVERITY).map(([value, m]) => ({ value, label: m.label }))], width: 150 },
          { key: 'type', placeholder: 'Loại', value: typeId ?? 'ALL', onChange: (v) => set('typeId', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi loại' }, ...(types?.catalogItems ?? []).map((t) => ({ value: t.id, label: t.name }))], width: 170 },
        ]}
      />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data?.incidents.nodes ?? []}
            rowKey={(r) => r.id}
            loading={loading && !data}
            onRowClick={(r) => navigate(paths.incident(r.id))}
            rowClassName={(r) => (r.severity === 'CRITICAL' && r.status !== 'RESOLVED' ? 'bg-danger/5' : undefined)}
            empty={<EmptyState icon={<AlertTriangle strokeWidth={1.5} />} message={view === 'open' ? 'Không có sự cố đang mở' : 'Không có sự cố khớp bộ lọc'} />}
          />
          <Pagination
            hasNextPage={!!data?.incidents.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.incidents.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={data?.incidents.nodes.length ?? 0}
            total={data?.incidents.totalCount}
          />
        </>
      )}
      <IncidentCreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(id) => navigate(paths.incident(id))} />
    </div>
  );
}
