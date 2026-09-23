import * as React from 'react';
import { Banner, DateField, EntityPicker, FormField, FormSection, Input, MoneyInput, RadioGroup, Select, Switch, Textarea } from '@bta/shadcn';
import { EXPENSE_KIND, EXPENSE_PAID_BY, expenseSchema, type ExpenseKind } from '@bta/shared';
import { todayInput, useExpenseCategories, useMasterPickers, useOrderPicker, useTripPicker } from './common';

export interface ExpenseFormState {
  kind: ExpenseKind;
  categoryId: string | null;
  amount: number | null;
  expenseDate: string;
  paidBy: 'COMPANY' | 'DRIVER' | 'DRIVER_ADVANCE';
  reimbursable: boolean;
  paidStatus: 'PAID' | 'UNPAID';
  supplierId: string | null;
  orderId: string | null;
  tripId: string | null;
  vehicleId: string | null;
  driverId: string | null;
  description: string;
  note: string;
}

export function emptyExpense(kind: ExpenseKind = 'TRIP_COST'): ExpenseFormState {
  return {
    kind,
    categoryId: null,
    amount: null,
    expenseDate: todayInput(),
    paidBy: 'COMPANY',
    reimbursable: false,
    paidStatus: 'PAID',
    supplierId: null,
    orderId: null,
    tripId: null,
    vehicleId: null,
    driverId: null,
    description: '',
    note: '',
  };
}

type Link = 'trip' | 'order' | 'vehicle' | 'driver' | 'supplier';

/** Trường gắn theo loại chi (mockup WM-EXP-03): bắt buộc / tùy chọn. */
export const KIND_FIELDS: Record<ExpenseKind, { required: Link[]; optional: Link[]; driverFlow: boolean }> = {
  TRIP_COST: { required: ['trip'], optional: ['order', 'vehicle', 'driver', 'supplier'], driverFlow: false },
  EXTERNAL_TRANSPORT: { required: ['order', 'supplier'], optional: ['trip'], driverFlow: false },
  VEHICLE_SUPPLY: { required: ['vehicle'], optional: ['supplier', 'driver'], driverFlow: false },
  OTHER_COST: { required: [], optional: ['supplier', 'order', 'vehicle', 'driver'], driverFlow: false },
  DRIVER_REIMBURSEMENT: { required: ['driver'], optional: ['trip'], driverFlow: true },
  SALARY_ADVANCE: { required: ['driver'], optional: [], driverFlow: true },
  TRIP_ADVANCE: { required: ['trip', 'driver'], optional: [], driverFlow: true },
  SALARY_PAYMENT: { required: ['driver'], optional: [], driverFlow: true },
};

const LINK_LABEL: Record<Link, string> = { trip: 'Chuyến', order: 'Đơn hàng', vehicle: 'Xe', driver: 'Tài xế', supplier: 'Nhà cung cấp' };

export function validateExpense(s: ExpenseFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  const parsed = expenseSchema.safeParse(toExpenseInput(s));
  if (!parsed.success) for (const i of parsed.error.issues) errors[String(i.path[0])] = i.message;
  const f = KIND_FIELDS[s.kind];
  const val: Record<Link, string | null> = { trip: s.tripId, order: s.orderId, vehicle: s.vehicleId, driver: s.driverId, supplier: s.supplierId };
  for (const l of f.required) if (!val[l]) errors[`${l}Id`] = `Chọn ${LINK_LABEL[l].toLowerCase()}`;
  if ((s.paidBy === 'DRIVER' || s.paidBy === 'DRIVER_ADVANCE') && !s.driverId) errors.driverId = 'Chọn tài xế đã chi';
  if (s.paidBy === 'DRIVER_ADVANCE' && !s.tripId) errors.tripId = 'Chi từ tạm ứng phải gắn chuyến';
  if (s.paidStatus === 'UNPAID' && (s.paidBy !== 'COMPANY' || !s.supplierId)) errors.paidStatus = 'Chưa trả chỉ dùng khi công ty chi và có NCC';
  return errors;
}

export function toExpenseInput(s: ExpenseFormState) {
  const f = KIND_FIELDS[s.kind];
  const allowed = new Set<Link>([...f.required, ...f.optional]);
  return {
    kind: s.kind,
    categoryId: s.categoryId,
    amount: s.amount ?? 0,
    expenseDate: s.expenseDate,
    paidBy: f.driverFlow ? 'COMPANY' : s.paidBy,
    reimbursable: !f.driverFlow && s.paidBy === 'DRIVER' ? s.reimbursable : false,
    paidStatus: f.driverFlow || s.paidBy !== 'COMPANY' ? 'PAID' : s.paidStatus,
    supplierId: allowed.has('supplier') ? s.supplierId : null,
    orderId: allowed.has('order') ? s.orderId : null,
    tripId: allowed.has('trip') ? s.tripId : null,
    vehicleId: allowed.has('vehicle') ? s.vehicleId : null,
    driverId: allowed.has('driver') || s.paidBy !== 'COMPANY' ? s.driverId : null,
    description: s.description.trim() || null,
    note: s.note.trim() || null,
  };
}

/** Form phiếu chi dùng chung cho tạo mới (WM-EXP-03) và sửa (drawer ở WM-EXP-02). */
export function ExpenseFormBody({ state, onChange, errors, lockKind }: { state: ExpenseFormState; onChange: (s: ExpenseFormState) => void; errors: Record<string, string>; lockKind?: boolean }) {
  const set = <K extends keyof ExpenseFormState>(k: K, v: ExpenseFormState[K]) => onChange({ ...state, [k]: v });
  const f = KIND_FIELDS[state.kind];
  const show = (l: Link) => f.required.includes(l) || f.optional.includes(l) || (l === 'driver' && state.paidBy !== 'COMPANY');
  const req = (l: Link) => f.required.includes(l) || (l === 'driver' && state.paidBy !== 'COMPANY') || (l === 'trip' && state.paidBy === 'DRIVER_ADVANCE');
  const pickers = useMasterPickers();
  const orders = useOrderPicker();
  const trips = useTripPicker(state.orderId && state.kind !== 'TRIP_COST' ? state.orderId : null);
  const categories = useExpenseCategories().filter((c) => !c.appliesTo || c.appliesTo === state.kind);
  const cost = EXPENSE_KIND[state.kind].isCost;

  return (
    <div className="flex flex-col gap-4">
      <FormSection title="Loại chi">
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Loại" required>
            <Select
              value={state.kind}
              disabled={lockKind}
              onValueChange={(v) => onChange({ ...emptyExpense(v as ExpenseKind), amount: state.amount, expenseDate: state.expenseDate, description: state.description, note: state.note, driverId: state.driverId, tripId: state.tripId, orderId: state.orderId })}
              options={Object.entries(EXPENSE_KIND).map(([value, m]) => ({ value, label: m.label }))}
            />
          </FormField>
          <FormField label="Danh mục chi" hint={cost ? 'Cầu đường, bốc xếp, xăng dầu…' : undefined}>
            <Select value={state.categoryId} onValueChange={(v) => set('categoryId', v || null)} allowEmpty options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="Chọn danh mục" />
          </FormField>
        </div>
        {!cost ? <Banner className="mt-3" tone="info" message={`${EXPENSE_KIND[state.kind].label} là dòng tiền với tài xế — không tính vào chi phí lãi/lỗ đơn.`} /> : null}
      </FormSection>
      <FormSection title="Số tiền">
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Số tiền" required error={errors.amount}>
            <MoneyInput value={state.amount} onChange={(v) => set('amount', v)} />
          </FormField>
          <FormField label="Ngày chi" required error={errors.expenseDate}>
            <DateField value={state.expenseDate} onChange={(v) => set('expenseDate', v)} />
          </FormField>
        </div>
        {!f.driverFlow ? (
          <div className="mt-3 flex flex-col gap-3">
            <FormField label="Ai chi">
              <RadioGroup
                inline
                value={state.paidBy}
                onValueChange={(v) => onChange({ ...state, paidBy: v as ExpenseFormState['paidBy'], reimbursable: v === 'DRIVER', paidStatus: v === 'COMPANY' ? state.paidStatus : 'PAID' })}
                options={Object.entries(EXPENSE_PAID_BY).map(([value, m]) => ({ value, label: m.label }))}
              />
            </FormField>
            {state.paidBy === 'DRIVER' ? <Switch checked={state.reimbursable} onCheckedChange={(c) => set('reimbursable', c)} label="Hoàn lại cho tài xế (công ty nợ tài xế)" /> : null}
            {state.paidBy === 'COMPANY' ? (
              <FormField label="Tình trạng thanh toán" error={errors.paidStatus}>
                <RadioGroup inline value={state.paidStatus} onValueChange={(v) => set('paidStatus', v as 'PAID' | 'UNPAID')} options={[{ value: 'PAID', label: 'Đã trả' }, { value: 'UNPAID', label: 'Chưa trả (công nợ NCC)' }]} />
              </FormField>
            ) : null}
          </div>
        ) : null}
      </FormSection>
      <FormSection title="Gắn với">
        <div className="grid gap-3 md:grid-cols-2">
          {show('trip') ? (
            <FormField label="Chuyến" required={req('trip')} error={errors.tripId} hint={state.kind === 'TRIP_COST' ? 'Chọn chuyến tự điền đơn, xe, tài xế' : undefined}>
              <EntityPicker
                items={trips.items}
                loading={trips.loading}
                onSearch={trips.onSearch}
                value={state.tripId}
                onChange={(id, item) => {
                  const m = (item?.meta ?? {}) as { orderId?: string; vehicleId?: string | null; driverId?: string | null };
                  onChange({ ...state, tripId: id, orderId: id ? m.orderId ?? state.orderId : state.orderId, vehicleId: id ? m.vehicleId ?? state.vehicleId : state.vehicleId, driverId: id ? m.driverId ?? state.driverId : state.driverId });
                }}
                placeholder="Tìm mã chuyến"
              />
            </FormField>
          ) : null}
          {show('order') ? (
            <FormField label="Đơn hàng" required={req('order')} error={errors.orderId}>
              <EntityPicker items={orders.items} loading={orders.loading} onSearch={orders.onSearch} value={state.orderId} onChange={(id) => set('orderId', id)} placeholder="Tìm mã đơn" disabled={state.kind === 'TRIP_COST' && !!state.tripId} />
            </FormField>
          ) : null}
          {show('vehicle') ? (
            <FormField label="Xe" required={req('vehicle')} error={errors.vehicleId}>
              <EntityPicker items={pickers.vehicles} loading={pickers.loading} value={state.vehicleId} onChange={(id) => set('vehicleId', id)} placeholder="Chọn xe" disabled={state.kind === 'TRIP_COST' && !!state.tripId} />
            </FormField>
          ) : null}
          {show('driver') ? (
            <FormField label="Tài xế" required={req('driver')} error={errors.driverId}>
              <EntityPicker items={pickers.drivers} loading={pickers.loading} value={state.driverId} onChange={(id) => set('driverId', id)} placeholder="Chọn tài xế" />
            </FormField>
          ) : null}
          {show('supplier') ? (
            <FormField label="Nhà cung cấp" required={req('supplier')} error={errors.supplierId}>
              <EntityPicker items={pickers.suppliers} loading={pickers.loading} value={state.supplierId} onChange={(id) => set('supplierId', id)} placeholder="Chọn NCC" />
            </FormField>
          ) : null}
        </div>
      </FormSection>
      <FormSection title="Mô tả">
        <FormField label="Nội dung chi">
          <Input value={state.description} onChange={(e) => set('description', e.target.value)} placeholder="VD: Cầu đường Trung Lương – Mỹ Thuận" />
        </FormField>
        <FormField label="Ghi chú" className="mt-3">
          <Textarea value={state.note} onChange={(e) => set('note', e.target.value)} rows={2} />
        </FormField>
      </FormSection>
    </div>
  );
}
