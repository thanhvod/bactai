import * as React from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { LOCATION_USAGE, labelOf } from '@bta/shared';
import { Banner, Button, Checkbox, DataTable, Dialog, Drawer, EmptyState, FormField, Input, Menu, PageHeader, RadioGroup, Textarea, toast } from '@bta/shadcn';
import { CreateMyAddressMutation, DeleteMyAddressMutation, MyAddressesQuery, UpdateMyAddressMutation } from '@/graphql/operations';
import { apolloErrorMessage } from '@/lib/apollo';
import { paths } from '@/app/routes';
import { InlineError } from '@/components/ui';

type Addr = { id: string; name: string; address: string; usage: string; lat?: number | null; lng?: number | null; contactName?: string | null; contactPhone?: string | null; note?: string | null; isDefaultPickup: boolean };
const EMPTY = { name: '', address: '', usage: 'BOTH', contactName: '', contactPhone: '', note: '', lat: '', lng: '', isDefaultPickup: false };

/** CW-ADDR-01 — Sổ địa chỉ thường dùng của khách. */
export default function AddressesPage() {
  const { data, loading, error, refetch } = useQuery(MyAddressesQuery);
  const refetchQueries = [{ query: MyAddressesQuery }];
  const [create, cState] = useMutation(CreateMyAddressMutation, { refetchQueries });
  const [update, uState] = useMutation(UpdateMyAddressMutation, { refetchQueries });
  const [remove, dState] = useMutation(DeleteMyAddressMutation, { refetchQueries });
  const [editing, setEditing] = React.useState<Addr | 'new' | null>(null);
  const [deleting, setDeleting] = React.useState<Addr | null>(null);
  const [form, setForm] = React.useState(EMPTY);
  const [formError, setFormError] = React.useState<string | null>(null);
  const rows = (data?.myAddresses ?? []) as Addr[];

  const open = (a: Addr | 'new') => {
    setEditing(a);
    setFormError(null);
    setForm(
      a === 'new'
        ? EMPTY
        : { name: a.name, address: a.address, usage: a.usage, contactName: a.contactName ?? '', contactPhone: a.contactPhone ?? '', note: a.note ?? '', lat: a.lat?.toString() ?? '', lng: a.lng?.toString() ?? '', isDefaultPickup: a.isDefaultPickup },
    );
  };
  const saveForm = async () => {
    if (!form.name.trim() || !form.address.trim()) return setFormError('Nhập tên và địa chỉ');
    if (form.contactPhone && !/^[0-9+][0-9 .-]{6,19}$/.test(form.contactPhone.trim())) return setFormError('Số điện thoại không hợp lệ');
    const num = (v: string) => (v.trim() === '' ? null : Number(v));
    const input = {
      name: form.name.trim(), address: form.address.trim(), usage: form.usage, contactName: form.contactName.trim() || null, contactPhone: form.contactPhone.trim() || null,
      note: form.note.trim() || null, lat: num(form.lat), lng: num(form.lng), isDefaultPickup: form.isDefaultPickup,
    };
    try {
      if (editing === 'new') await create({ variables: { input } });
      else if (editing) await update({ variables: { id: editing.id, input } });
      toast.success('Đã lưu địa chỉ');
      setEditing(null);
    } catch (e) {
      setFormError(apolloErrorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Địa chỉ thường dùng"
        subtitle="Kho, điểm lấy/trả và người liên hệ để chọn nhanh khi gửi yêu cầu"
        breadcrumb={[{ label: 'Hồ sơ', to: paths.profile() }, { label: 'Địa chỉ thường dùng' }]}
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to={paths.bookingNew()}>Tạo yêu cầu vận chuyển</Link>
            </Button>
            <Button onClick={() => open('new')}>
              <Plus /> Thêm địa chỉ
            </Button>
          </>
        }
      />
      {error ? <Banner tone="danger" message="Không tải được sổ địa chỉ" action={<Button size="sm" variant="secondary" onClick={() => refetch()}>Thử lại</Button>} /> : null}
      <DataTable<Addr>
        rowKey={(r) => r.id}
        loading={loading && !data}
        rows={rows}
        onRowClick={(r) => open(r)}
        empty={<EmptyState message="Chưa có địa chỉ thường dùng" action={<Button onClick={() => open('new')}>Thêm địa chỉ</Button>} />}
        columns={[
          { key: 'name', label: 'Tên', render: (r) => <span className="text-body-strong">{r.name}{r.isDefaultPickup ? <span className="ml-2 text-caption text-primary">Mặc định</span> : null}</span> },
          { key: 'address', label: 'Địa chỉ', render: (r) => r.address },
          { key: 'usage', label: 'Dùng cho', render: (r) => labelOf(LOCATION_USAGE, r.usage), hideBelow: 'md' },
          { key: 'contact', label: 'Liên hệ', render: (r) => [r.contactName, r.contactPhone].filter(Boolean).join(' · ') || '—', hideBelow: 'md' },
          {
            key: 'actions',
            label: '',
            width: 48,
            render: (r) => (
              <span onClick={(e) => e.stopPropagation()}>
                <Menu
                  trigger={<Button variant="ghost" size="icon-sm" aria-label={`Thao tác ${r.name}`}>⋯</Button>}
                  items={[
                    { key: 'edit', label: 'Sửa', icon: <Pencil />, onSelect: () => open(r) },
                    { key: 'del', label: 'Xóa địa chỉ', icon: <Trash2 />, danger: true, onSelect: () => setDeleting(r) },
                  ]}
                />
              </span>
            ),
          },
        ]}
      />
      <p className="text-body-sm text-text-muted">Yêu cầu đã gửi lưu bản sao địa chỉ, sửa/xóa ở đây không ảnh hưởng yêu cầu hoặc đơn cũ.</p>

      <Drawer
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === 'new' ? 'Thêm địa chỉ' : 'Sửa địa chỉ'}
        width={480}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Hủy
            </Button>
            <Button loading={cState.loading || uState.loading} onClick={saveForm}>
              Lưu địa chỉ
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField label="Tên gợi nhớ" required htmlFor="a-name">
            <Input id="a-name" placeholder="VD: Kho Thuận An" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Địa chỉ" required htmlFor="a-address">
            <Textarea id="a-address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </FormField>
          <FormField label="Dùng cho">
            <RadioGroup
              name="usage"
              inline
              value={form.usage}
              onValueChange={(v: string) => setForm({ ...form, usage: v })}
              options={[
                { value: 'PICKUP', label: 'Điểm lấy' },
                { value: 'DROPOFF', label: 'Điểm trả' },
                { value: 'BOTH', label: 'Cả hai' },
              ]}
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Người liên hệ" htmlFor="a-cn">
              <Input id="a-cn" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            </FormField>
            <FormField label="SĐT liên hệ" htmlFor="a-cp">
              <Input id="a-cp" type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </FormField>
            <FormField label="Vĩ độ (tùy chọn)" htmlFor="a-lat">
              <Input id="a-lat" inputMode="decimal" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
            </FormField>
            <FormField label="Kinh độ (tùy chọn)" htmlFor="a-lng">
              <Input id="a-lng" inputMode="decimal" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Ghi chú" htmlFor="a-note">
            <Textarea id="a-note" rows={2} placeholder="VD: giờ nhận hàng, cổng vào" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </FormField>
          <Checkbox label="Đặt làm điểm lấy mặc định" checked={form.isDefaultPickup} onCheckedChange={(c) => setForm({ ...form, isDefaultPickup: !!c })} />
          <InlineError>{formError}</InlineError>
        </div>
      </Drawer>

      <Dialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Xóa địa chỉ"
        description={deleting ? `Xóa "${deleting.name}" khỏi sổ địa chỉ?` : undefined}
        danger
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Quay lại
            </Button>
            <Button
              variant="destructive"
              loading={dState.loading}
              onClick={async () => {
                if (!deleting) return;
                try {
                  await remove({ variables: { id: deleting.id } });
                  toast.success('Đã xóa địa chỉ');
                  setDeleting(null);
                } catch (e) {
                  toast.error('Không xóa được', apolloErrorMessage(e));
                }
              }}
            >
              Xóa
            </Button>
          </>
        }
      />
    </div>
  );
}
