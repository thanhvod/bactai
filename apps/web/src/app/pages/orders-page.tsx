import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea,
} from '@bta/shadcn';
import { ORDER_STATUS_LABEL } from '@bta/shared';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, formatMoney, localToIso, parseMoney } from '../../lib/format';
import { EmptyState, Field, FormDialog, PageHeader } from '../components/page-shell';
import { StatusBadge } from '../components/status-badge';

const LIST = gql`
  query Orders($status: OrderStatus, $search: String) {
    orders(status: $status, search: $search) {
      id code customerName status totalAmount paidAmount dueDate overdueDays tripCount createdAt
      stops { id }
    }
  }
`;
const CUSTOMERS = gql`query CustomerOptions { customers { id name } }`;
const ADDON_CATALOG = gql`query AddonCatalog { catalogItems(kind: ADDON_SERVICE) { id name } }`;
const CREATE = gql`mutation CreateOrder($input: CreateOrderInput!) { createOrder(input: $input) { id } }`;

interface OrderRow {
  id: string; code: string; customerName: string; status: string; totalAmount: number;
  paidAmount: number; dueDate?: string; overdueDays: number; tripCount: number; createdAt: string;
  stops: { id: string }[];
}

interface StopForm { type: 'PICKUP' | 'DROPOFF'; address: string; contactName: string; contactPhone: string; codExpected: string }
interface AddonForm { catalogItemId?: string; name: string; amount: string }

const EMPTY_FORM = () => ({
  customerId: '',
  price: '',
  dueDate: '',
  notes: '',
  cargoName: '',
  cargoNotes: '',
  stops: [
    { type: 'PICKUP', address: '', contactName: '', contactPhone: '', codExpected: '' },
    { type: 'DROPOFF', address: '', contactName: '', contactPhone: '', codExpected: '' },
  ] as StopForm[],
  addons: [] as AddonForm[],
});

export function OrdersPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const { data, refetch } = useQuery<{ orders: OrderRow[] }>(LIST, {
    variables: { status: status === 'ALL' ? null : status, search: search || null },
  });
  const { data: custData } = useQuery<{ customers: { id: string; name: string }[] }>(CUSTOMERS);
  const { data: addonData } = useQuery<{ catalogItems: { id: string; name: string }[] }>(ADDON_CATALOG);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM());
  const [create, { loading, error }] = useMutation<any>(CREATE);

  const setStop = (i: number, patch: Partial<StopForm>) =>
    setForm({ ...form, stops: form.stops.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  const submit = async () => {
    const input = {
      customerId: form.customerId,
      price: parseMoney(form.price),
      dueDate: form.dueDate ? localToIso(form.dueDate) : null,
      notes: form.notes || null,
      stops: form.stops
        .filter((s) => s.address.trim())
        .map((s) => ({
          type: s.type,
          address: s.address,
          contactName: s.contactName || null,
          contactPhone: s.contactPhone || null,
          codExpected: s.codExpected ? parseMoney(s.codExpected) : 0,
        })),
      cargoLines: form.cargoName.trim()
        ? [{ name: form.cargoName, notes: form.cargoNotes || null }]
        : [],
      addons: form.addons
        .filter((a) => a.name.trim() && a.amount)
        .map((a) => ({ catalogItemId: a.catalogItemId || null, name: a.name, amount: parseMoney(a.amount) })),
    };
    const res = await create({ variables: { input } });
    setOpen(false);
    refetch();
    const id = res.data?.createOrder?.id;
    if (id) navigate(`/orders/${id}`);
  };

  const list = data?.orders ?? [];
  return (
    <div>
      <PageHeader
        title="Đơn hàng"
        actions={
          <>
            <Input placeholder="Tìm mã đơn / khách…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-52" />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => { setForm(EMPTY_FORM()); setOpen(true); }}><Plus className="size-4" /> Tạo đơn</Button>
          </>
        }
      />
      {list.length === 0 ? (
        <EmptyState message="Chưa có đơn hàng nào" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-right">Đã thu</TableHead>
              <TableHead>Hạn thanh toán</TableHead>
              <TableHead className="text-right">Điểm</TableHead>
              <TableHead className="text-right">Chuyến</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((o) => (
              <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                <TableCell className="font-medium"><Link to={`/orders/${o.id}`} onClick={(e) => e.stopPropagation()}>{o.code}</Link></TableCell>
                <TableCell>{o.customerName}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell className="text-right">{formatMoney(o.totalAmount)}</TableCell>
                <TableCell className="text-right">{formatMoney(o.paidAmount)}</TableCell>
                <TableCell>
                  {formatDate(o.dueDate)}
                  {o.overdueDays > 0 && <span className="ml-1 text-xs font-medium text-red-600">quá {o.overdueDays} ngày</span>}
                </TableCell>
                <TableCell className="text-right">{o.stops.length}</TableCell>
                <TableCell className="text-right">{o.tripCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Tạo đơn hàng"
        onSubmit={submit}
        submitDisabled={!form.customerId || !form.price || form.stops.filter((s) => s.address.trim()).length === 0}
        loading={loading}
        error={error?.message}
        wide
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Khách hàng *">
            <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
              <SelectTrigger><SelectValue placeholder="Chọn khách" /></SelectTrigger>
              <SelectContent>
                {(custData?.customers ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Giá cước (₫, chung cả đơn) *">
            <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="VD: 5000000" />
          </Field>
          <Field label="Hạn thanh toán">
            <Input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
          <Field label="Ghi chú">
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>

        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">Điểm lấy / trả hàng *</span>
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, stops: [...form.stops, { type: 'DROPOFF', address: '', contactName: '', contactPhone: '', codExpected: '' }] })}>
              <Plus className="size-3" /> Thêm điểm
            </Button>
          </div>
          <div className="grid gap-2">
            {form.stops.map((s, i) => (
              <div key={i} className="grid grid-cols-[110px_1fr_120px_120px_110px_32px] items-center gap-2">
                <Select value={s.type} onValueChange={(v) => setStop(i, { type: v as StopForm['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PICKUP">Lấy hàng</SelectItem>
                    <SelectItem value="DROPOFF">Trả hàng</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Địa chỉ" value={s.address} onChange={(e) => setStop(i, { address: e.target.value })} />
                <Input placeholder="Người liên hệ" value={s.contactName} onChange={(e) => setStop(i, { contactName: e.target.value })} />
                <Input placeholder="SĐT" value={s.contactPhone} onChange={(e) => setStop(i, { contactPhone: e.target.value })} />
                <Input placeholder="COD (₫)" value={s.codExpected} onChange={(e) => setStop(i, { codExpected: e.target.value })} />
                <Button variant="ghost" size="icon" onClick={() => setForm({ ...form, stops: form.stops.filter((_, j) => j !== i) })}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Hàng hóa (mô tả nhanh)">
            <Input value={form.cargoName} onChange={(e) => setForm({ ...form, cargoName: e.target.value })} placeholder='VD: "10 tấn gạo"' />
          </Field>
          <Field label="Ghi chú hàng hóa">
            <Textarea rows={1} value={form.cargoNotes} onChange={(e) => setForm({ ...form, cargoNotes: e.target.value })} />
          </Field>
        </div>

        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">Dịch vụ cộng thêm (thu khách)</span>
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, addons: [...form.addons, { name: '', amount: '' }] })}>
              <Plus className="size-3" /> Thêm dịch vụ
            </Button>
          </div>
          <div className="grid gap-2">
            {form.addons.map((a, i) => (
              <div key={i} className="grid grid-cols-[1fr_150px_32px] items-center gap-2">
                <Select
                  value={a.catalogItemId ?? 'CUSTOM'}
                  onValueChange={(v) => {
                    const item = addonData?.catalogItems.find((x) => x.id === v);
                    setForm({
                      ...form,
                      addons: form.addons.map((x, j) =>
                        j === i ? { ...x, catalogItemId: item?.id, name: item?.name ?? x.name } : x,
                      ),
                    });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Chọn dịch vụ" /></SelectTrigger>
                  <SelectContent>
                    {(addonData?.catalogItems ?? []).map((it) => (
                      <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Số tiền (₫)" value={a.amount} onChange={(e) => setForm({ ...form, addons: form.addons.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)) })} />
                <Button variant="ghost" size="icon" onClick={() => setForm({ ...form, addons: form.addons.filter((_, j) => j !== i) })}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
