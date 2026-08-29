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
  query Customers($search: String) {
    customers(search: $search) {
      id name phone email address taxCode notes totalDebt creditBalance
    }
  }
`;
const CREATE = gql`
  mutation CreateCustomer($input: CustomerInput!) { createCustomer(input: $input) { id } }
`;
const UPDATE = gql`
  mutation UpdateCustomer($id: ID!, $input: CustomerInput!) { updateCustomer(id: $id, input: $input) { id } }
`;
const DEACTIVATE = gql`
  mutation DeactivateCustomer($id: ID!) { deactivateCustomer(id: $id) { id } }
`;

interface Customer {
  id: string; name: string; phone?: string; email?: string; address?: string;
  taxCode?: string; notes?: string; totalDebt: number; creditBalance: number;
}

const EMPTY = { name: '', phone: '', email: '', address: '', taxCode: '', notes: '' };

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const { data, refetch } = useQuery<{ customers: Customer[] }>(LIST, { variables: { search: search || null } });
  const [dialog, setDialog] = useState<{ id?: string } | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [create, { loading: creating, error: ce }] = useMutation(CREATE);
  const [update, { loading: updating, error: ue }] = useMutation(UPDATE);
  const [deactivate] = useMutation(DEACTIVATE);

  const openCreate = () => { setForm(EMPTY); setDialog({}); };
  const openEdit = (c: Customer) => {
    setForm({ name: c.name, phone: c.phone ?? '', email: c.email ?? '', address: c.address ?? '', taxCode: c.taxCode ?? '', notes: c.notes ?? '' });
    setDialog({ id: c.id });
  };
  const submit = async () => {
    const input = { ...form, phone: form.phone || null, email: form.email || null, address: form.address || null, taxCode: form.taxCode || null, notes: form.notes || null };
    if (dialog?.id) await update({ variables: { id: dialog.id, input } });
    else await create({ variables: { input } });
    setDialog(null);
    refetch();
  };

  const list = data?.customers ?? [];
  return (
    <div>
      <PageHeader
        title="Khách hàng"
        actions={
          <>
            <Input placeholder="Tìm tên / SĐT…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
            <Button onClick={openCreate}><Plus className="size-4" /> Thêm khách hàng</Button>
          </>
        }
      />
      {list.length === 0 ? (
        <EmptyState message="Chưa có khách hàng nào" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead className="text-right">Công nợ</TableHead>
              <TableHead className="text-right">Số dư</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.phone ?? '—'}</TableCell>
                <TableCell className="max-w-64 truncate">{c.address ?? '—'}</TableCell>
                <TableCell className={`text-right ${c.totalDebt > 0 ? 'font-medium text-red-600' : ''}`}>{formatMoney(c.totalDebt)}</TableCell>
                <TableCell className="text-right">{formatMoney(c.creditBalance)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={async () => { if (confirm(`Ẩn khách "${c.name}"?`)) { await deactivate({ variables: { id: c.id } }); refetch(); } }}>
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
        title={dialog?.id ? 'Sửa khách hàng' : 'Thêm khách hàng'}
        onSubmit={submit}
        submitDisabled={!form.name.trim()}
        loading={creating || updating}
        error={(ce ?? ue)?.message}
      >
        <Field label="Tên khách hàng *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Số điện thoại"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Địa chỉ"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Mã số thuế"><Input value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} /></Field>
        <Field label="Ghi chú"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </FormDialog>
    </div>
  );
}
