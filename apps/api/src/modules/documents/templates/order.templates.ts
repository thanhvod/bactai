import { STOP_TYPE, labelOf, EXPENSE_KIND, EXPENSE_PAID_BY } from '@bta/shared';
import { date, dateTime, esc, kv, layout, money, signatures, table, type MerchantHeader } from './layout';

export interface DeliveryNoteData {
  merchant: MerchantHeader;
  order: { code: string; orderDate: Date; dueDate: Date | null; note: string | null; routeSummary: string | null; customer: { name: string; phone: string | null; billingAddress: string | null; taxCode: string | null } };
  stops: { sequence: number; type: string; locationName: string | null; address: string; contactName: string | null; contactPhone: string | null; codExpected: number; plannedAt: Date | null }[];
  cargo: { name: string; weightKg: number | null; volumeM3: number | null; quantity: number | null; packagingUnit: string | null; note: string | null }[];
  trips: { code: string; plate: string | null; driverName: string | null; driverPhone: string | null }[];
}

/** Phiếu giao hàng (09 §2.11) — không in giá cước (giấy đi theo hàng). */
export function deliveryNoteHtml(d: DeliveryNoteData): string {
  const o = d.order;
  const body = `
${kv([
  ['Khách hàng', `<b>${esc(o.customer.name)}</b>`],
  ['Điện thoại', esc(o.customer.phone ?? '')],
  ['Ngày đơn', date(o.orderDate)],
  ['Tuyến', esc(o.routeSummary ?? '')],
  ['Xe / tài xế', esc(d.trips.map((t) => `${t.plate ?? '—'} · ${t.driverName ?? '—'}${t.driverPhone ? ` (${t.driverPhone})` : ''}`).join('; ') || 'Chưa xếp xe')],
])}
<div class="section">Điểm lấy / trả hàng</div>
${table(d.stops, [
  { label: '#', value: (s) => String(s.sequence), align: 'center', width: '4%' },
  { label: 'Loại', value: (s) => esc(labelOf(STOP_TYPE, s.type)), width: '10%' },
  { label: 'Địa điểm', value: (s) => `<b>${esc(s.locationName ?? '')}</b><br/>${esc(s.address)}` },
  { label: 'Liên hệ', value: (s) => `${esc(s.contactName ?? '')}<br/>${esc(s.contactPhone ?? '')}`, width: '18%' },
  { label: 'Dự kiến', value: (s) => dateTime(s.plannedAt), width: '13%' },
  { label: 'Thu hộ (COD)', value: (s) => (s.codExpected ? money(s.codExpected) : ''), align: 'right', width: '13%' },
])}
<div class="section">Hàng hóa</div>
${table(d.cargo, [
  { label: 'Tên hàng', value: (c) => esc(c.name) },
  { label: 'Khối lượng (kg)', value: (c) => esc(c.weightKg ?? ''), align: 'right', width: '13%' },
  { label: 'Thể tích (m³)', value: (c) => esc(c.volumeM3 ?? ''), align: 'right', width: '12%' },
  { label: 'Số lượng', value: (c) => esc([c.quantity, c.packagingUnit].filter((x) => x !== null && x !== '').join(' ')), align: 'right', width: '13%' },
  { label: 'Ghi chú', value: (c) => esc(c.note ?? ''), width: '22%' },
])}
${o.note ? `<div class="note">Ghi chú: ${esc(o.note)}</div>` : ''}
${signatures(['Người giao hàng', 'Tài xế', 'Người nhận hàng'])}`;
  return layout({ merchant: d.merchant, title: 'PHIẾU GIAO HÀNG', code: o.code, subtitle: `Ngày ${date(o.orderDate)}`, body });
}

export interface DispatchNoteData {
  merchant: MerchantHeader;
  trip: { code: string; plannedStartAt: Date; plannedEndAt: Date | null; note: string | null; driverBonusAmount: number; orderCode: string; customerName: string; plate: string | null; vehicleType: string | null; driverName: string | null; driverPhone: string | null; licenseNumber: string | null };
  stops: DeliveryNoteData['stops'];
  cargo: DeliveryNoteData['cargo'];
  advanceAmount: number;
}

/** Phiếu điều xe — lệnh giao chuyến cho tài xế. */
export function dispatchNoteHtml(d: DispatchNoteData): string {
  const t = d.trip;
  const body = `
${kv([
  ['Đơn hàng', `${esc(t.orderCode)} · ${esc(t.customerName)}`],
  ['Xe', `<b>${esc(t.plate ?? '—')}</b> ${t.vehicleType ? `(${esc(t.vehicleType)})` : ''}`],
  ['Tài xế', `<b>${esc(t.driverName ?? '—')}</b> ${t.driverPhone ? `· ${esc(t.driverPhone)}` : ''} ${t.licenseNumber ? `· GPLX ${esc(t.licenseNumber)}` : ''}`],
  ['Thời gian', `${dateTime(t.plannedStartAt)}${t.plannedEndAt ? ` → ${dateTime(t.plannedEndAt)}` : ''}`],
  ['Tạm ứng đi đường', money(d.advanceAmount)],
])}
<div class="section">Lộ trình</div>
${table(d.stops, [
  { label: '#', value: (s) => String(s.sequence), align: 'center', width: '4%' },
  { label: 'Loại', value: (s) => esc(labelOf(STOP_TYPE, s.type)), width: '10%' },
  { label: 'Địa điểm', value: (s) => `<b>${esc(s.locationName ?? '')}</b><br/>${esc(s.address)}` },
  { label: 'Liên hệ', value: (s) => `${esc(s.contactName ?? '')} ${esc(s.contactPhone ?? '')}`, width: '20%' },
  { label: 'Dự kiến', value: (s) => dateTime(s.plannedAt), width: '13%' },
  { label: 'COD cần thu', value: (s) => (s.codExpected ? money(s.codExpected) : ''), align: 'right', width: '13%' },
])}
<div class="section">Hàng hóa</div>
${table(d.cargo, [
  { label: 'Tên hàng', value: (c) => esc(c.name) },
  { label: 'Khối lượng (kg)', value: (c) => esc(c.weightKg ?? ''), align: 'right', width: '15%' },
  { label: 'Số lượng', value: (c) => esc([c.quantity, c.packagingUnit].filter((x) => x !== null && x !== '').join(' ')), align: 'right', width: '15%' },
  { label: 'Ghi chú', value: (c) => esc(c.note ?? ''), width: '25%' },
])}
${t.note ? `<div class="note">Ghi chú: ${esc(t.note)}</div>` : ''}
${signatures(['Điều phối', 'Tài xế'])}`;
  return layout({ merchant: d.merchant, title: 'PHIẾU ĐIỀU XE', code: t.code, subtitle: `Ngày ${date(t.plannedStartAt)}`, body });
}

export interface TripCostSheetData {
  merchant: MerchantHeader;
  trip: { code: string; orderCode: string; customerName: string; plate: string | null; driverName: string | null; plannedStartAt: Date; actualEndAt: Date | null };
  expenses: { code: string; expenseDate: Date; kind: string; category: string | null; description: string | null; paidBy: string; reimbursable: boolean; amount: number; status: string }[];
  advanceAmount: number;
}

/** Bảng chi phí chuyến — chi phí thực tế và đối chiếu tạm ứng. */
export function tripCostSheetHtml(d: TripCostSheetData): string {
  const active = d.expenses.filter((e) => e.status === 'ACTIVE' && e.kind !== 'TRIP_ADVANCE');
  const total = active.reduce((s, e) => s + e.amount, 0);
  const byDriver = active.filter((e) => e.paidBy !== 'COMPANY').reduce((s, e) => s + e.amount, 0);
  const t = d.trip;
  const body = `
${kv([
  ['Đơn hàng', `${esc(t.orderCode)} · ${esc(t.customerName)}`],
  ['Xe / tài xế', `${esc(t.plate ?? '—')} · ${esc(t.driverName ?? '—')}`],
  ['Thời gian', `${dateTime(t.plannedStartAt)}${t.actualEndAt ? ` → ${dateTime(t.actualEndAt)}` : ''}`],
])}
${table(
  active,
  [
    { label: 'Ngày', value: (e) => date(e.expenseDate), width: '10%' },
    { label: 'Mã phiếu', value: (e) => esc(e.code), width: '15%' },
    { label: 'Loại chi', value: (e) => esc(e.category ?? EXPENSE_KIND[e.kind as keyof typeof EXPENSE_KIND]?.label ?? e.kind) },
    { label: 'Diễn giải', value: (e) => esc(e.description ?? '') },
    { label: 'Người chi', value: (e) => esc(labelOf(EXPENSE_PAID_BY, e.paidBy)), width: '15%' },
    { label: 'Số tiền', value: (e) => money(e.amount), align: 'right', width: '14%' },
  ],
  `<tfoot><tr><td colspan="5">Tổng chi phí chuyến</td><td class="num">${money(total)}</td></tr></tfoot>`,
)}
${kv([
  ['Tài xế đã chi (trước / từ tạm ứng)', money(byDriver)],
  ['Tạm ứng đi đường', money(d.advanceAmount)],
  ['Chênh lệch tạm ứng', `${money(d.advanceAmount - active.filter((e) => e.paidBy === 'DRIVER_ADVANCE').reduce((s, e) => s + e.amount, 0))} <span class="muted">(dương: tài xế nộp lại; âm: công ty hoàn thêm)</span>`],
])}
${signatures(['Kế toán', 'Tài xế'])}`;
  return layout({ merchant: d.merchant, title: 'BẢNG CHI PHÍ CHUYẾN', code: t.code, body });
}
