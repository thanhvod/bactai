import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Banner, Button, DateField, Drawer, FormField, Input, LineItemsEditor, MoneyCell, MoneyInput, Select, SensitiveActionModal, toast } from '@bta/shadcn';
import { formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { apolloErrorMessage } from '@/lib/apollo';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { UpdateOrderPricingMutation } from '../graphql/orders';
import { errorCode } from './common';

interface AddonRow {
  key: string;
  id?: string;
  serviceId: string;
  name: string;
  amount: number | null;
}
let n = 0;

/** WM-ORD-06 — Giá cước & add-on (drawer). Đơn đã xác nhận: sửa giá là thao tác nhạy cảm (order.price.update + lý do). */
export function PricingDrawer({
  open,
  onOpenChange,
  order,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  order: { id: string; code: string; freightAmount: number; addonTotal: number; totalAmount: number; priceLocked: boolean; dueDate?: string | null; addons?: { id: string; serviceId?: string | null; name: string; amount: number }[] | null };
  onSaved?: () => void;
}) {
  const { hasPermission } = useAuth();
  const { data: catalog } = useQuery(CatalogOptionsQuery, { variables: { type: 'ADDON_SERVICE' as never, activeOnly: true }, skip: !open });
  const [save, { loading }] = useMutation(UpdateOrderPricingMutation);
  const [freight, setFreight] = React.useState<number | null>(order.freightAmount);
  const [addons, setAddons] = React.useState<AddonRow[]>([]);
  const [dueDate, setDueDate] = React.useState('');
  const [reasonOpen, setReasonOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setFreight(order.freightAmount);
    setAddons((order.addons ?? []).map((a) => ({ key: `a${++n}`, id: a.id, serviceId: a.serviceId ?? '', name: a.name, amount: a.amount })));
    setDueDate(order.dueDate ? String(order.dueDate).slice(0, 10) : '');
  }, [open, order]);

  const addonTotal = addons.reduce((s, a) => s + (a.amount ?? 0), 0);
  const total = (freight ?? 0) + addonTotal;
  const options = (catalog?.catalogItems ?? []).map((c) => ({ value: c.id, label: c.name }));
  const locked = order.priceLocked;
  const canLocked = hasPermission('order.price.update');

  const submit = async (reason?: string) => {
    if (freight == null) return toast.error('Nhập giá cước');
    try {
      await save({
        variables: {
          id: order.id,
          input: {
            freightAmount: freight,
            dueDate: dueDate || null,
            addons: addons.filter((a) => a.name.trim() && a.amount != null).map((a) => ({ ...(a.id ? { id: a.id } : {}), serviceId: a.serviceId || null, name: a.name.trim(), amount: a.amount ?? 0 })),
            reason: reason ?? null,
          },
        },
      });
      toast.success(`Đã cập nhật giá đơn ${order.code}`);
      setReasonOpen(false);
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      if (errorCode(e) === 'SENSITIVE_REASON_REQUIRED') {
        setReasonOpen(true);
        return;
      }
      toast.error('Không lưu được giá', apolloErrorMessage(e));
      throw e;
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      width={720}
      title={`Giá cước & add-on · ${order.code}`}
      description="Giá cước tính chung cả đơn. Add-on là tiền thu thêm của khách, tách biệt chi phí."
      footer={
        <>
          <span className="mr-auto text-body-sm text-text-muted">
            Tổng thu khách: <strong className="text-text">{formatVnd(total)}</strong>
          </span>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button loading={loading} disabled={locked && !canLocked} onClick={() => (locked ? setReasonOpen(true) : void submit())}>
            Lưu thay đổi giá
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {locked ? (
          <Banner tone={canLocked ? 'warning' : 'danger'} message={canLocked ? 'Đơn đã xác nhận: lưu giá sẽ yêu cầu nhập lý do và ghi audit trước/sau.' : 'Đơn đã xác nhận: bạn không có quyền sửa giá cước.'} />
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Giá cước" required>
            <MoneyInput value={freight} onChange={setFreight} />
          </FormField>
          <FormField label="Hạn thanh toán">
            <DateField value={dueDate} onChange={setDueDate} />
          </FormField>
        </div>
        <LineItemsEditor<AddonRow>
          rows={addons}
          onChange={setAddons}
          newRow={() => ({ key: `a${++n}`, serviceId: '', name: '', amount: null })}
          addLabel="Thêm add-on"
          emptyText="Chưa có dịch vụ cộng thêm"
          columns={[
            { key: 'svc', label: 'Dịch vụ', render: (r, _i, u) => <Select value={r.serviceId} allowEmpty emptyLabel="— Khác —" onValueChange={(v) => u({ serviceId: v, name: options.find((o) => o.value === v)?.label?.toString() ?? r.name })} options={options} /> },
            { key: 'name', label: 'Tên', render: (r, _i, u) => <Input value={r.name} onChange={(e) => u({ name: e.target.value })} /> },
            { key: 'amt', label: 'Số tiền', width: 170, align: 'right', render: (r, _i, u) => <MoneyInput value={r.amount} onChange={(v) => u({ amount: v })} /> },
          ]}
        />
        <div className="grid grid-cols-3 gap-3 rounded-lg bg-surface-muted p-3 text-body-sm">
          <div>
            <div className="text-caption text-text-muted">Giá cước</div>
            <MoneyCell value={freight ?? 0} />
          </div>
          <div>
            <div className="text-caption text-text-muted">Add-on</div>
            <MoneyCell value={addonTotal} />
          </div>
          <div>
            <div className="text-caption text-text-muted">Tổng thu khách</div>
            <MoneyCell value={total} strong />
          </div>
        </div>
      </div>
      <SensitiveActionModal
        open={reasonOpen}
        onOpenChange={setReasonOpen}
        action={`Sửa giá cước đơn đã xác nhận ${order.code}`}
        before={{ freightAmount: formatVnd(order.freightAmount), addonTotal: formatVnd(order.addonTotal), totalAmount: formatVnd(order.totalAmount) }}
        after={{ freightAmount: formatVnd(freight ?? 0), addonTotal: formatVnd(addonTotal), totalAmount: formatVnd(total) }}
        diffLabels={{ freightAmount: 'Giá cước', addonTotal: 'Add-on', totalAmount: 'Tổng thu khách' }}
        warning="Đơn đã phân bổ tiền hoặc nằm trong bảng kê đã chốt vẫn giữ số cũ ở chứng từ đó."
        confirmLabel="Lưu giá mới"
        loading={loading}
        onConfirm={async (reason) => {
          await submit(reason);
        }}
      />
    </Drawer>
  );
}
