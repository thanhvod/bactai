import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@bta/shadcn';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatMoney } from '../../lib/format';
import { EmptyState, Field, FormDialog, PageHeader } from '../components/page-shell';

const LIST = gql`
  query Suppliers { suppliers { id name category phone address taxCode notes totalUnpaid } }
`;
const CREATE = gql`mutation CreateSupplier($input: SupplierInput!) { createSupplier(input: $input) { id } }`;
const UPDATE = gql`mutation UpdateSupplier($id: ID!, $input: SupplierInput!) { updateSupplier(id: $id, input: $input) { id } }`;
const DEACTIVATE = gql`mutation DeactivateSupplier($id: ID!) { deactivateSupplier(id: $id) { id } }`;

interface Supplier {
  id: string; name: string; category?: string; phone?: string; address?: string;
  taxCode?: string; notes?: string; totalUnpaid: number;
}

const EMPTY = { name: '', category: '', phone: '', address: '', taxCode: '', notes: '' };

export function SuppliersPage() {
  const { data, refetch } = useQuery<{ suppliers: Supplier[] }>(LIST);
  const [dialog, setDialog] = useState<{ id?: string } | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [create, { loading: creating, error: ce }] = useMutation(CREATE);
  const [update, { loading: updating, error: ue }] = useMutation(UPDATE);
  const [deactivate] = useMutation(DEACTIVATE);

  const submit = async () => {
    const input = { name: form.name, category: form.category || null, phone: form.phone || null, address: form.address || null, taxCode: form.taxCode || null, notes: form.notes || null };
    if (dialog?.id) await update({ variables: { id: dialog.id, input } });
    else await create({ variables: { input } });
    setDialog(null);
    refetch();
  };

  const list = data?.suppliers ?? [];
  return (
    <div>
      <PageHeader
        title="Nhà cung cấp"
        actions={<Button onClick={() => { setForm(EMPTY); setDialog({}); }}><Plus className="size-4" /> Thêm NCC</Button>}
      />
      {list.length === 0 ? (
        <EmptyState message="Chưa có nhà cung cấp nào" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead className="text-right">Công nợ phải trả</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.category ?? '—'}</TableCell>
                <TableCell>{s.phone ?? '—'}</TableCell>
                <TableCell className={`text-right ${s.totalUnpaid > 0 ? 'font-medium text-red-600' : ''}`}>{formatMoney(s.totalUnpaid)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setForm({ name: s.name, category: s.category ?? '', phone: s.phone ?? '', address: s.address ?? '', taxCode: s.taxCode ?? '', notes: s.notes ?? '' }); setDialog({ id: s.id }); }}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={async () => { if (confirm(`Ẩn NCC "${s.name}"?`)) { await deactivate({ variables: { id: s.id } }); refetch(); } }}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <FormDialog
        open={dialog !== null}
        onOpenChange={(v) => !v && setDialog(null)}
        title={dialog?.id ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
        onSubmit={submit}
        submitDisabled={!form.name.trim()}
        loading={creating || updating}
        error={(ce ?? ue)?.message}
      >
        <Field label="Tên NCC *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Loại"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Vận tải thuê ngoài / vật tư…" /></Field>
        <Field label="SĐT"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Địa chỉ"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Mã số thuế"><Input value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} /></Field>
        <Field label="Ghi chú"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </FormDialog>
    </div>
  );
}
