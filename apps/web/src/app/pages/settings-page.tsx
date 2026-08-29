import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button, Card, CardContent, CardHeader, CardTitle, Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@bta/shadcn';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Field, PageHeader } from '../components/page-shell';

const MERCHANT = gql`
  query MyMerchant { myMerchant { id name taxCode address phone email scheduleWarnHours } }
`;
const UPDATE_MERCHANT = gql`
  mutation UpdateMerchant($input: UpdateMerchantInput!) { updateMerchant(input: $input) { id } }
`;
const CATALOGS = gql`
  query AllCatalogs { catalogItems(includeInactive: true) { id kind name isActive } }
`;
const CREATE_ITEM = gql`
  mutation CreateCatalogItem($kind: CatalogKind!, $name: String!) { createCatalogItem(kind: $kind, name: $name) { id } }
`;
const UPDATE_ITEM = gql`
  mutation UpdateCatalogItem($id: ID!, $name: String, $isActive: Boolean) { updateCatalogItem(id: $id, name: $name, isActive: $isActive) { id } }
`;

const KIND_LABEL: Record<string, string> = {
  EXPENSE_CATEGORY: 'Loại chi phí',
  INCOME_CATEGORY: 'Loại thu khác',
  ADDON_SERVICE: 'Dịch vụ cộng thêm',
  PAUSE_REASON: 'Lý do tạm dừng chuyến',
  DEDUCTION_REASON: 'Lý do giảm trừ lương',
  CARGO_TYPE: 'Loại hàng',
};

export function SettingsPage() {
  const { data: mData, refetch: refetchMerchant } = useQuery<any>(MERCHANT);
  const { data: cData, refetch: refetchCatalogs } = useQuery<any>(CATALOGS);
  const [updateMerchant, { loading: saving }] = useMutation(UPDATE_MERCHANT);
  const [createItem] = useMutation(CREATE_ITEM);
  const [updateItem] = useMutation(UPDATE_ITEM);

  const [form, setForm] = useState({ name: '', taxCode: '', address: '', phone: '', email: '', scheduleWarnHours: '2' });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const m = mData?.myMerchant;
    if (m) {
      setForm({
        name: m.name ?? '', taxCode: m.taxCode ?? '', address: m.address ?? '',
        phone: m.phone ?? '', email: m.email ?? '', scheduleWarnHours: String(m.scheduleWarnHours ?? 2),
      });
    }
  }, [mData]);

  const [newItem, setNewItem] = useState({ kind: 'EXPENSE_CATEGORY', name: '' });

  const items = cData?.catalogItems ?? [];
  const grouped = Object.keys(KIND_LABEL).map((kind) => ({
    kind,
    items: items.filter((i: any) => i.kind === kind),
  }));

  return (
    <div className="grid gap-4">
      <PageHeader title="Cài đặt" />

      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin nhà xe</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Field label="Tên nhà xe"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Mã số thuế"><Input value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} /></Field>
          <Field label="Địa chỉ"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="SĐT"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Ngưỡng cảnh báo gần-trùng lịch (giờ)">
            <Input type="number" value={form.scheduleWarnHours} onChange={(e) => setForm({ ...form, scheduleWarnHours: e.target.value })} />
          </Field>
          <div className="col-span-2 flex items-center gap-3">
            <Button
              disabled={saving}
              onClick={async () => {
                await updateMerchant({
                  variables: {
                    input: {
                      name: form.name, taxCode: form.taxCode || null, address: form.address || null,
                      phone: form.phone || null, email: form.email || null,
                      scheduleWarnHours: Number(form.scheduleWarnHours) || 2,
                    },
                  },
                });
                refetchMerchant();
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
            >
              {saving ? 'Đang lưu…' : 'Lưu thông tin'}
            </Button>
            {saved && <span className="text-sm text-emerald-600">Đã lưu ✓</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Danh mục</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-end gap-2">
            <Field label="Nhóm danh mục">
              <Select value={newItem.kind} onValueChange={(v) => setNewItem({ ...newItem, kind: v })}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(KIND_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tên mục mới">
              <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="w-56" />
            </Field>
            <Button
              disabled={!newItem.name.trim()}
              onClick={async () => {
                await createItem({ variables: { kind: newItem.kind, name: newItem.name } });
                setNewItem({ ...newItem, name: '' });
                refetchCatalogs();
              }}
            >
              <Plus className="size-4" /> Thêm
            </Button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {grouped.map((g) => (
              <div key={g.kind} className="rounded-lg border p-3">
                <p className="mb-2 text-sm font-medium">{KIND_LABEL[g.kind]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((it: any) => (
                    <button
                      key={it.id}
                      title={it.isActive ? 'Bấm để ẩn' : 'Bấm để hiện lại'}
                      onClick={async () => {
                        await updateItem({ variables: { id: it.id, isActive: !it.isActive } });
                        refetchCatalogs();
                      }}
                      className={`rounded-full border px-2.5 py-0.5 text-xs ${it.isActive ? 'bg-secondary' : 'bg-muted text-muted-foreground line-through'}`}
                    >
                      {it.name}
                    </button>
                  ))}
                  {g.items.length === 0 && <span className="text-xs text-muted-foreground">Trống</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
