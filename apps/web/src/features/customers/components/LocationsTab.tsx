import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { MapPin, Plus } from 'lucide-react';
import { Badge, Button, DataTable, Dialog, EmptyState, ErrorState, MapView, SensitiveActionModal, StatusBadge, Switch, toast } from '@bta/shadcn';
import { LOCATION_USAGE } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { apolloErrorMessage } from '@/lib/apollo';
import type { CustomerLocationFieldsFragment } from '@/gql/graphql';
import { CustomerLocationsQuery, DeleteCustomerLocationMutation } from '../graphql/customers';
import { LocationFormDrawer } from './LocationFormDrawer';

/** WM-CUS-04 — Sổ địa chỉ/liên hệ. Địa chỉ đã dùng trong đơn chỉ ẩn khỏi picker (cần lý do). */
export function LocationsTab({ customerId, onChanged }: { customerId: string; onChanged?: () => void }) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('customer.edit');
  const [showInactive, setShowInactive] = React.useState(false);
  const { data, loading, error, refetch } = useQuery(CustomerLocationsQuery, { variables: { customerId, includeInactive: showInactive } });
  const [remove, { loading: removing }] = useMutation(DeleteCustomerLocationMutation);
  const [editing, setEditing] = React.useState<CustomerLocationFieldsFragment | null | 'new'>(null);
  const [toRemove, setToRemove] = React.useState<CustomerLocationFieldsFragment | null>(null);
  const rows = data?.customerLocations ?? [];
  const pins = rows.filter((r) => r.lat !== null && r.lat !== undefined && r.lng !== null && r.lng !== undefined).map((r) => ({ id: r.id, lat: r.lat!, lng: r.lng!, label: r.name, status: (r.usage === 'DROPOFF' ? 'accent' : 'primary') as 'accent' | 'primary' }));

  const doRemove = async (reason?: string) => {
    if (!toRemove) return;
    try {
      await remove({ variables: { id: toRemove.id, reason: reason ?? null } });
      toast.success(`Đã ẩn địa chỉ "${toRemove.name}" khỏi sổ địa chỉ`);
      setToRemove(null);
      void refetch();
      onChanged?.();
    } catch (e) {
      toast.error('Không xóa được địa chỉ', apolloErrorMessage(e));
      throw e;
    }
  };

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-body-sm text-text-muted">Kho/điểm giao nhận thường dùng; chọn nhanh khi tạo đơn.</p>
        <div className="flex-1" />
        <Switch label="Hiện địa chỉ đã ẩn" checked={showInactive} onCheckedChange={setShowInactive} />
        {canEdit ? (
          <Button onClick={() => setEditing('new')}>
            <Plus /> Thêm địa chỉ
          </Button>
        ) : null}
      </div>
      {pins.length ? <MapView pins={pins} height={240} /> : null}
      <DataTable
        loading={loading && !data}
        rows={rows}
        rowKey={(r) => r.id}
        rowClassName={(r) => (r.active ? undefined : 'opacity-60')}
        onRowClick={canEdit ? (r) => setEditing(r) : undefined}
        empty={<EmptyState icon={<MapPin strokeWidth={1.5} />} message="Chưa có địa chỉ thường dùng" action={canEdit ? <Button onClick={() => setEditing('new')}>Thêm địa chỉ</Button> : undefined} />}
        columns={[
          {
            key: 'name',
            label: 'Địa điểm',
            render: (r) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-2 font-medium">
                  {r.name}
                  {r.isDefault ? <Badge tone="primary">Mặc định</Badge> : null}
                  {!r.active ? <Badge tone="neutral">Đã ẩn</Badge> : null}
                </span>
                <span className="text-caption text-text-muted">{[r.address, r.province].filter(Boolean).join(', ')}</span>
              </div>
            ),
          },
          { key: 'usage', label: 'Dùng cho', render: (r) => <StatusBadge meta={LOCATION_USAGE} status={r.usage} /> },
          {
            key: 'contact',
            label: 'Liên hệ',
            render: (r) =>
              r.contactName || r.contactPhone ? (
                <div className="flex flex-col">
                  <span>{r.contactName ?? '—'}</span>
                  {r.contactPhone ? (
                    <a className="text-caption text-accent" href={`tel:${r.contactPhone}`} onClick={(e) => e.stopPropagation()}>
                      {r.contactPhone}
                    </a>
                  ) : null}
                </div>
              ) : (
                '—'
              ),
            hideBelow: 'md',
          },
          { key: 'used', label: 'Dùng trong', align: 'right', render: (r) => <span className="tabular-nums">{r.usedInOrders} đơn</span> },
          {
            key: 'actions',
            label: '',
            align: 'right',
            render: (r) =>
              canEdit && r.active ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setToRemove(r);
                  }}
                >
                  Xóa
                </Button>
              ) : null,
          },
        ]}
      />
      <LocationFormDrawer
        customerId={customerId}
        location={editing && editing !== 'new' ? editing : null}
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        onSaved={() => {
          void refetch();
          onChanged?.();
        }}
      />
      {toRemove && toRemove.usedInOrders > 0 ? (
        <SensitiveActionModal
          open
          onOpenChange={(o) => !o && setToRemove(null)}
          action={`Ẩn địa chỉ "${toRemove.name}"`}
          description="Địa chỉ đã dùng trong đơn: chỉ ẩn khỏi sổ địa chỉ, các đơn cũ giữ nguyên bản sao địa chỉ."
          affected={[`${toRemove.usedInOrders} đơn đã dùng địa chỉ này`]}
          confirmLabel="Ẩn địa chỉ"
          loading={removing}
          onConfirm={(reason) => doRemove(reason)}
        />
      ) : (
        <Dialog
          open={!!toRemove}
          onOpenChange={(o) => !o && setToRemove(null)}
          title={`Xóa địa chỉ "${toRemove?.name ?? ''}"?`}
          description="Địa chỉ chưa dùng trong đơn nào."
          danger
          footer={
            <>
              <Button variant="secondary" onClick={() => setToRemove(null)}>
                Hủy
              </Button>
              <Button variant="destructive" loading={removing} onClick={() => void doRemove().catch(() => undefined)}>
                Xóa địa chỉ
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
