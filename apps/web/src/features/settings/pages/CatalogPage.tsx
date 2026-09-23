import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { GripVertical, Pencil, Plus } from 'lucide-react';
import { Badge, Banner, Button, DataTable, Drawer, EmptyState, ErrorState, FormField, Input, PageHeader, Select, Switch, Tabs, toast } from '@bta/shadcn';
import { CATALOG_TYPE, EXPENSE_KIND, labelOf, type CatalogType } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { useQueryParam } from '@/features/shared/useQueryParam';
import {
  ActivateCatalogItemMutation,
  CatalogItemsQuery,
  CreateCatalogItemMutation,
  DeactivateCatalogItemMutation,
  ReorderCatalogItemsMutation,
  UpdateCatalogItemMutation,
} from '../graphql/settings';

type Item = { id: string; type: string; code: string; name: string; appliesTo?: string | null; isDefault: boolean; sortOrder: number; active: boolean; usageCount: number };

const TYPES = Object.keys(CATALOG_TYPE) as CatalogType[];
const USED_IN: Partial<Record<CatalogType, string>> = {
  EXPENSE_CATEGORY: 'Phiếu chi (WM-EXP-03)',
  ADDON_SERVICE: 'Tạo đơn, giá bán (WM-ORD-03/06)',
  CARGO_TYPE: 'Hàng hóa (WM-ORD-05)',
  PACKAGING_UNIT: 'Hàng hóa (WM-ORD-05)',
  PAUSE_REASON: 'App tài xế – tạm dừng (DA-STATUS-02)',
  DEDUCTION_REASON: 'Giảm trừ lương (WM-PAYROLL-04)',
  DOCUMENT_TYPE: 'Chứng từ (WM-SHELL-06)',
  INCIDENT_TYPE: 'Sự cố (WM-INC-01, DA-INC-01)',
  VEHICLE_TYPE: 'Xe, yêu cầu xe của đơn',
  SUPPLIER_TYPE: 'Nhà cung cấp',
  CUSTOMER_GROUP: 'Khách hàng',
};
const EXPENSE_KIND_OPTIONS = Object.entries(EXPENSE_KIND)
  .filter(([, v]) => v.isCost)
  .map(([k, v]) => ({ value: k, label: v.label }));

/** WM-CAT-01 — Danh mục dùng chung theo merchant. Mục đã dùng chỉ ngừng, không xóa. */
export default function CatalogPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('catalogs.manage');
  const [typeParam, setTypeParam] = useQueryParam('type');
  const type = (TYPES.includes(typeParam as CatalogType) ? typeParam : 'EXPENSE_CATEGORY') as CatalogType;
  const { data, loading, error, refetch } = useQuery(CatalogItemsQuery, { variables: { type: type as never } });
  const [create, { loading: creating }] = useMutation(CreateCatalogItemMutation);
  const [update, { loading: updating }] = useMutation(UpdateCatalogItemMutation);
  const [deactivate] = useMutation(DeactivateCatalogItemMutation);
  const [activate] = useMutation(ActivateCatalogItemMutation);
  const [reorder] = useMutation(ReorderCatalogItemsMutation);
  const [editing, setEditing] = React.useState<Partial<Item> | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Item[]>([]);
  const dragId = React.useRef<string | null>(null);
  React.useEffect(() => setRows((data?.catalogItems ?? []) as Item[]), [data]);

  const submit = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) return setFormError('Nhập tên');
    setFormError(null);
    const input = { type, name: editing.name.trim(), code: editing.code?.trim() || undefined, appliesTo: editing.appliesTo || undefined };
    try {
      if (editing.id) await update({ variables: { id: editing.id, input } });
      else await create({ variables: { input } });
      toast.success(editing.id ? 'Đã lưu mục danh mục' : 'Đã thêm mục danh mục');
      setEditing(null);
      void refetch();
    } catch (e) {
      setFormError(apolloErrorMessage(e));
    }
  };

  const toggleActive = async (item: Item, active: boolean) => {
    try {
      if (active) await activate({ variables: { id: item.id } });
      else await deactivate({ variables: { id: item.id } });
      toast.success(active ? `Đã bật "${item.name}"` : `Đã ngừng "${item.name}"`, active ? undefined : 'Dữ liệu cũ vẫn giữ nhãn này');
      void refetch();
    } catch (e) {
      toast.error('Không cập nhật được', apolloErrorMessage(e));
    }
  };

  const onDrop = async (targetId: string) => {
    const from = dragId.current;
    dragId.current = null;
    if (!from || from === targetId) return;
    const next = [...rows];
    const i = next.findIndex((r) => r.id === from);
    const j = next.findIndex((r) => r.id === targetId);
    const [moved] = next.splice(i, 1);
    next.splice(j, 0, moved);
    setRows(next);
    try {
      await reorder({ variables: { type: type as never, ids: next.map((r) => r.id) } });
    } catch (e) {
      toast.error('Không lưu được thứ tự', apolloErrorMessage(e));
      void refetch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Danh mục dùng chung"
        subtitle="Danh mục riêng của nhà xe: loại chi phí, dịch vụ cộng thêm, loại hàng, lý do tạm dừng, lý do giảm trừ, loại chứng từ, loại sự cố…"
        breadcrumb={[{ label: 'Cài đặt', to: PATHS.settingsCompany }, { label: 'Danh mục' }]}
        actions={
          canEdit ? (
            <Button onClick={() => setEditing({ name: '', code: '' })}>
              <Plus /> Thêm mục
            </Button>
          ) : null
        }
      />
      {!canEdit ? <Banner tone="info" message="Bạn chỉ có quyền xem danh mục." /> : null}
      <Tabs items={TYPES.map((t) => ({ value: t, label: CATALOG_TYPE[t] }))} value={type} onValueChange={(v) => setTypeParam(v)}>
        <p className="text-body-sm text-text-muted">Dùng ở: {USED_IN[type] ?? '—'}. Kéo biểu tượng ⋮⋮ để sắp xếp thứ tự hiển thị.</p>
        {error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : (
          <DataTable
            loading={loading && !data}
            rows={rows}
            rowKey={(r) => r.id}
            rowClassName={(r) => (r.active ? undefined : 'opacity-60')}
            empty={<EmptyState message="Chưa có mục nào" action={canEdit ? <Button onClick={() => setEditing({ name: '' })}>Thêm mục</Button> : undefined} />}
            columns={[
              {
                key: 'drag',
                label: '',
                width: 36,
                render: (r) =>
                  canEdit ? (
                    <span
                      draggable
                      onDragStart={() => (dragId.current = r.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => void onDrop(r.id)}
                      className="inline-flex cursor-grab text-text-subtle"
                      aria-label="Kéo để sắp xếp"
                    >
                      <GripVertical className="size-4" />
                    </span>
                  ) : null,
              },
              { key: 'name', label: 'Tên', render: (r) => <span className="font-medium">{r.name}</span> },
              { key: 'code', label: 'Mã', render: (r) => <span className="font-mono text-body-sm">{r.code}</span> },
              ...(type === 'EXPENSE_CATEGORY'
                ? [{ key: 'appliesTo', label: 'Nhóm chi', render: (r: Item) => labelOf(EXPENSE_KIND, r.appliesTo) || '—' }]
                : []),
              { key: 'default', label: 'Nguồn', render: (r) => (r.isDefault ? <Badge tone="neutral">Mặc định</Badge> : <Badge tone="info">Tự thêm</Badge>), hideBelow: 'md' },
              { key: 'usage', label: 'Đã dùng', align: 'right', render: (r) => <span className="tabular-nums">{r.usageCount}</span> },
              {
                key: 'active',
                label: 'Hoạt động',
                render: (r) => <Switch checked={r.active} disabled={!canEdit} onCheckedChange={(v) => void toggleActive(r, v)} aria-label={`Bật/tắt ${r.name}`} />,
              },
              {
                key: 'actions',
                label: '',
                align: 'right',
                render: (r) =>
                  canEdit ? (
                    <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
                      <Pencil /> Sửa
                    </Button>
                  ) : null,
              },
            ]}
          />
        )}
      </Tabs>
      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.id ? 'Sửa mục danh mục' : `Thêm vào ${CATALOG_TYPE[type]}`}
        width={480}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Hủy
            </Button>
            <Button onClick={() => void submit()} loading={creating || updating}>
              Lưu
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="flex flex-col gap-3">
            {formError ? <Banner tone="danger" message={formError} /> : null}
            <FormField label="Tên" required>
              <Input value={editing.name ?? ''} autoFocus onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </FormField>
            <FormField label="Mã" hint={editing.isDefault ? 'Mục mặc định không đổi mã' : 'Để trống để tự sinh từ tên; duy nhất trong danh mục'}>
              <Input value={editing.code ?? ''} disabled={editing.isDefault} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} />
            </FormField>
            {type === 'EXPENSE_CATEGORY' ? (
              <FormField label="Thuộc nhóm chi" hint="Quyết định cách tính lãi/lỗ">
                <Select value={editing.appliesTo ?? null} allowEmpty options={EXPENSE_KIND_OPTIONS} onValueChange={(v) => setEditing({ ...editing, appliesTo: v || null })} />
              </FormField>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
