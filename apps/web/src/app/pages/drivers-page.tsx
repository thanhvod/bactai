import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@bta/shadcn';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatMoney, parseMoney } from '../../lib/format';
import { EmptyState, Field, FormDialog, PageHeader } from '../components/page-shell';

const LIST = gql`
  query Drivers {
    drivers {
      id fullName phone licenseNo baseSalary notes tripCount
      companyOwesDriver driverOwesCompany
    }
  }
`;
const CREATE = gql`mutation CreateDriver($input: DriverInput!) { createDriver(input: $input) { id } }`;
const UPDATE = gql`mutation UpdateDriver($id: ID!, $input: DriverInput!) { updateDriver(id: $id, input: $input) { id } }`;
const DEACTIVATE = gql`mutation DeactivateDriver($id: ID!) { deactivateDriver(id: $id) { id } }`;

interface Driver {
  id: string; fullName: string; phone: string; licenseNo?: string; baseSalary: number;
  notes?: string; tripCount: number; companyOwesDriver: number; driverOwesCompany: number;
}

const EMPTY = { fullName: '', phone: '', licenseNo: '', baseSalary: '', notes: '', password: '' };

export function DriversPage() {
  const { data, refetch } = useQuery<{ drivers: Driver[] }>(LIST);
  const [dialog, setDialog] = useState<{ id?: string } | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [create, { loading: creating, error: ce }] = useMutation(CREATE);
  const [update, { loading: updating, error: ue }] = useMutation(UPDATE);
  const [deactivate] = useMutation(DEACTIVATE);

  const submit = async () => {
    const input = {
      fullName: form.fullName,
      phone: form.phone,
      licenseNo: form.licenseNo || null,
      baseSalary: parseMoney(form.baseSalary),
      notes: form.notes || null,
      ...(form.password ? { password: form.password } : {}),
    };
    if (dialog?.id) await update({ variables: { id: dialog.id, input } });
    else await create({ variables: { input } });
    setDialog(null);
    refetch();
  };

  const list = data?.drivers ?? [];
  return (
    <div>
      <PageHeader
        title="Tài xế"
        actions={<Button onClick={() => { setForm(EMPTY); setDialog({}); }}><Plus className="size-4" /> Thêm tài xế</Button>}
      />
      {list.length === 0 ? (
        <EmptyState message="Chưa có tài xế nào" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>SĐT (đăng nhập app)</TableHead>
              <TableHead>GPLX</TableHead>
              <TableHead className="text-right">Lương cố định</TableHead>
              <TableHead className="text-right">Số chuyến</TableHead>
              <TableHead className="text-right">Cty nợ tài xế</TableHead>
              <TableHead className="text-right">Tài xế giữ (COD/ứng)</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.fullName}</TableCell>
                <TableCell>{d.phone}</TableCell>
                <TableCell>{d.licenseNo ?? '—'}</TableCell>
                <TableCell className="text-right">{formatMoney(d.baseSalary)}</TableCell>
                <TableCell className="text-right">{d.tripCount}</TableCell>
                <TableCell className={`text-right ${d.companyOwesDriver > 0 ? 'text-amber-600' : ''}`}>{formatMoney(d.companyOwesDriver)}</TableCell>
                <TableCell className={`text-right ${d.driverOwesCompany > 0 ? 'text-red-600' : ''}`}>{formatMoney(d.driverOwesCompany)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setForm({ fullName: d.fullName, phone: d.phone, licenseNo: d.licenseNo ?? '', baseSalary: String(d.baseSalary), notes: d.notes ?? '', password: '' }); setDialog({ id: d.id }); }}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={async () => { if (confirm(`Ẩn tài xế ${d.fullName}?`)) { await deactivate({ variables: { id: d.id } }); refetch(); } }}>
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
        title={dialog?.id ? 'Sửa tài xế' : 'Thêm tài xế'}
        onSubmit={submit}
        submitDisabled={!form.fullName.trim() || !form.phone.trim() || (!dialog?.id && !form.password)}
        loading={creating || updating}
        error={(ce ?? ue)?.message}
      >
        <Field label="Họ tên *"><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></Field>
        <Field label="Số điện thoại (đăng nhập app) *"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label={dialog?.id ? 'Đổi mật khẩu app (bỏ trống giữ nguyên)' : 'Mật khẩu app *'}>
          <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <Field label="Số GPLX"><Input value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} /></Field>
        <Field label="Lương cố định (₫/kỳ)"><Input value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} placeholder="VD: 8000000" /></Field>
        <Field label="Ghi chú"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </FormDialog>
    </div>
  );
}
