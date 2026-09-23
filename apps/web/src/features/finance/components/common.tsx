import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import type { PickerItem } from '@bta/shadcn';
import {
  DOC_STATUS,
  EXPENSE_KIND,
  EXPENSE_PAID_BY,
  PAID_STATUS,
  PAYMENT_IN_TYPE,
  PAYMENT_METHOD,
  TRIP_ADVANCE_STATUS,
  type EnumMeta,
} from '@bta/shared';
import { useDebounced } from '@/features/master-data/helpers';
import { ExpenseCategoriesQuery, FinCustomerOptionsQuery, FinOrderOptionsQuery, FinPickersQuery, FinTripOptionsQuery } from '../graphql/finance';

export { DOC_STATUS, EXPENSE_KIND, EXPENSE_PAID_BY, PAID_STATUS, PAYMENT_IN_TYPE, PAYMENT_METHOD, TRIP_ADVANCE_STATUS };

export const EXPENSE_KIND_META = EXPENSE_KIND as unknown as Record<string, EnumMeta>;

export const options = (meta: Record<string, EnumMeta>) => Object.entries(meta).map(([value, m]) => ({ value, label: m.label }));

export const LEDGER_DIRECTION: Record<string, EnumMeta> = {
  IN: { label: 'Phiếu thu', tone: 'success' },
  OUT: { label: 'Phiếu chi', tone: 'warning' },
};

/** Loại phiếu thu KHÔNG phải doanh thu (thu hồi phải thu tài xế / hoàn tạm ứng). */
export const NOT_REVENUE_TYPES = ['DRIVER_COD_REMITTANCE', 'DRIVER_ADVANCE_RETURN'];

export function NotRevenueTag() {
  return <span className="rounded border border-info/40 px-1.5 py-0.5 text-caption text-info">Thu hồi — không phải doanh thu</span>;
}

/** Cột @db.Date / DateTime → "YYYY-MM-DD" cho input date. */
export function toInputDate(v: string | null | undefined): string {
  return v ? String(v).slice(0, 10) : '';
}

export function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "YYYY-MM-DDTHH:mm" giờ máy (datetime-local). */
export function nowInputDateTime(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Driver/xe/NCC cho picker — bản ghi ngừng hoạt động hiện nhưng không chọn được. */
export function useMasterPickers() {
  const { data, loading } = useQuery(FinPickersQuery);
  return React.useMemo(
    () => ({
      loading,
      drivers: (data?.driverOptions ?? []).map<PickerItem>((d) => ({ id: d.id, label: d.name, code: d.code, description: d.phone, inactive: d.status !== 'ACTIVE' })),
      vehicles: (data?.vehicleOptions ?? []).map<PickerItem>((v) => ({ id: v.id, label: v.plate, code: v.code, description: v.typeName, inactive: v.status === 'INACTIVE' })),
      suppliers: (data?.supplierOptions ?? []).map<PickerItem>((s) => ({ id: s.id, label: s.name, code: s.code, description: s.typeName, inactive: s.status !== 'ACTIVE' })),
    }),
    [data, loading],
  );
}

export function useCustomerPicker() {
  const [search, setSearch] = React.useState('');
  const q = useDebounced(search);
  const { data, loading } = useQuery(FinCustomerOptionsQuery, { variables: { search: q || null } });
  const items = (data?.customers.nodes ?? []).map<PickerItem>((c) => ({ id: c.id, label: c.name, code: c.code, description: c.phone, inactive: c.status !== 'ACTIVE', meta: { creditBalance: c.creditBalance } }));
  return { items, loading, onSearch: setSearch };
}

export function useOrderPicker(customerId?: string | null) {
  const [search, setSearch] = React.useState('');
  const q = useDebounced(search);
  const { data, loading } = useQuery(FinOrderOptionsQuery, { variables: { search: q || null, customerId: customerId || null } });
  const items = (data?.orders.nodes ?? []).map<PickerItem>((o) => ({
    id: o.id,
    label: o.code,
    description: [o.customer.name, o.routeSummary].filter(Boolean).join(' · '),
    inactive: o.status === 'CANCELLED',
  }));
  return { items, loading, onSearch: setSearch };
}

export function useTripPicker(orderId?: string | null) {
  const [search, setSearch] = React.useState('');
  const q = useDebounced(search);
  const { data, loading } = useQuery(FinTripOptionsQuery, { variables: { search: q || null, orderId: orderId || null } });
  const trips = data?.trips.nodes ?? [];
  const items = trips.map<PickerItem>((t) => ({
    id: t.id,
    label: t.code,
    description: [t.order.code, t.vehicle?.plate, t.driver?.name].filter(Boolean).join(' · '),
    meta: { orderId: t.orderId, vehicleId: t.vehicle?.id ?? null, driverId: t.driver?.id ?? null },
  }));
  return { items, loading, onSearch: setSearch };
}

export function useExpenseCategories() {
  const { data } = useQuery(ExpenseCategoriesQuery);
  return data?.catalogItems ?? [];
}

export function sum(values: number[]) {
  return values.reduce((s, v) => s + v, 0);
}

/** ISO → "YYYY-MM-DDTHH:mm" giờ địa phương cho datetime-local. */
export function toLocalDateTimeInput(v: string | null | undefined): string {
  if (!v) return '';
  const d = new Date(v);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
