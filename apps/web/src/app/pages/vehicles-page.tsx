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
  query Vehicles { vehicles { id plateNumber type loadCapacityKg notes tripCount totalExpense } }
`;
const CREATE = gql`mutation CreateVehicle($input: VehicleInput!) { createVehicle(input: $input) { id } }`;
const UPDATE = gql`mutation UpdateVehicle($id: ID!, $input: VehicleInput!) { updateVehicle(id: $id, input: $input) { id } }`;
const DEACTIVATE = gql`mutation DeactivateVehicle($id: ID!) { deactivateVehicle(id: $id) { id } }`;

interface Vehicle {
  id: string; plateNumber: string; type?: string; loadCapacityKg?: number;
  notes?: string; tripCount: number; totalExpense: number;
}

const EMPTY = { plateNumber: '', type: '', loadCapacityKg: '', notes: '' };

export function VehiclesPage() {
  const { data, refetch } = useQuery<{ vehicles: Vehicle[] }>(LIST);
  const [dialog, setDialog] = useState<{ id?: string } | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [create, { loading: creating, error: ce }] = useMutation(CREATE);
  const [update, { loading: updating, error: ue }] = useMutation(UPDATE);
  const [deactivate] = useMutation(DEACTIVATE);

  const submit = async () => {
    const input = {
      plateNumber: form.plateNumber,
      type: form.type || null,
      loadCapacityKg: form.loadCapacityKg ? Number(form.loadCapacityKg) : null,
      notes: form.notes || null,
    };
    if (dialog?.id) await update({ variables: { id: dialog.id, input } });
    else await create({ variables: { input } });
    setDialog(null);
    refetch();
  };

  const list = data?.vehicles ?? [];
  return (
    <div>
      <PageHeader
        title="Xe"
        actions={<Button onClick={() => { setForm(EMPTY); setDialog({}); }}><Plus className="size-4" /> Thêm xe</Button>}
      />
      {list.length === 0 ? (
        <EmptyState message="Chưa có xe nào" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Biển số</TableHead>
              <TableHead>Loại xe</TableHead>
              <TableHead className="text-right">Tải trọng (kg)</TableHead>
              <TableHead className="text-right">Số chuyến</TableHead>
              <TableHead className="text-right">Chi phí vật tư</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.plateNumber}</TableCell>
                <TableCell>{v.type ?? '—'}</TableCell>
                <TableCell className="text-right">{v.loadCapacityKg ?? '—'}</TableCell>
                <TableCell className="text-right">{v.tripCount}</TableCell>
                <TableCell className="text-right">{formatMoney(v.totalExpense)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setForm({ plateNumber: v.plateNumber, type: v.type ?? '', loadCapacityKg: v.loadCapacityKg?.toString() ?? '', notes: v.notes ?? '' }); setDialog({ id: v.id }); }}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={async () => { if (confirm(`Ẩn xe ${v.plateNumber}?`)) { await deactivate({ variables: { id: v.id } }); refetch(); } }}>
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
        title={dialog?.id ? 'Sửa xe' : 'Thêm xe'}
        onSubmit={submit}
        submitDisabled={!form.plateNumber.trim()}
        loading={creating || updating}
        error={(ce ?? ue)?.message}
      >
        <Field label="Biển số *"><Input value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} placeholder="51C-123.45" /></Field>
        <Field label="Loại xe"><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Tải thùng / mui bạt / đầu kéo…" /></Field>
        <Field label="Tải trọng (kg)"><Input type="number" value={form.loadCapacityKg} onChange={(e) => setForm({ ...form, loadCapacityKg: e.target.value })} /></Field>
        <Field label="Ghi chú"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </FormDialog>
    </div>
  );
}
