import { z } from 'zod';
import { bookingSchema } from '@bta/shared';

/**
 * Form CW-BOOK-01: dùng bookingSchema dùng chung + ràng buộc UI (spec: thiếu điểm lấy/trả, tên hàng,
 * thời gian lấy, SĐT liên hệ → lỗi inline). Ngày giờ nhập dạng datetime-local.
 */
const blankToNull = (v: unknown) => (v === '' || v === undefined ? null : v);

export const bookingFormSchema = bookingSchema
  .extend({
    pickupFrom: z.string().min(1, 'Chọn thời gian lấy hàng'),
    deliverBefore: z.string().optional().nullable(),
    weightTon: z.preprocess(blankToNull, z.coerce.number().min(0, 'Không được âm').nullable()).optional(),
    packages: z.preprocess(blankToNull, z.coerce.number().int('Số kiện là số nguyên').min(0, 'Không được âm').nullable()).optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.stops.some((s) => s.type === 'PICKUP')) ctx.addIssue({ code: 'custom', path: ['stops'], message: 'Cần ít nhất 1 điểm lấy hàng' });
    if (!v.stops.some((s) => s.type === 'DROPOFF')) ctx.addIssue({ code: 'custom', path: ['stops'], message: 'Cần ít nhất 1 điểm trả hàng' });
    if (v.deliverBefore && v.pickupFrom && new Date(v.deliverBefore) < new Date(v.pickupFrom))
      ctx.addIssue({ code: 'custom', path: ['deliverBefore'], message: 'Thời gian giao phải sau thời gian lấy' });
  });

export type BookingFormValues = Omit<z.input<typeof bookingFormSchema>, 'weightTon' | 'packages'> & {
  weightTon?: number | string | null;
  packages?: number | string | null;
};

export const emptyStop = (type: 'PICKUP' | 'DROPOFF') => ({ type, address: '', locationName: '', contactName: '', contactPhone: '', note: '', addressId: null as string | null });

export function defaultBookingValues(merchantId: string): BookingFormValues {
  return {
    merchantId,
    stops: [emptyStop('PICKUP'), emptyStop('DROPOFF')],
    cargoName: '',
    weightTon: '',
    packages: '',
    vehicleTypeHint: '',
    fragile: false,
    loadingAtPickup: false,
    loadingAtDrop: false,
    pickupFrom: '',
    deliverBefore: '',
    flexibility: '',
    note: '',
    contactName: '',
    contactPhone: '',
  };
}

/** "2026-09-23T08:00" (giờ máy) ↔ ISO. */
export function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v);

/** Chuẩn hóa giá trị form → BookingInput GraphQL. */
export function toBookingInput(v: z.output<typeof bookingFormSchema>) {
  return {
    merchantId: v.merchantId,
    stops: v.stops.map((s) => ({
      type: s.type,
      address: s.address,
      addressId: s.addressId || null,
      locationName: emptyToNull(s.locationName) as string | null,
      contactName: emptyToNull(s.contactName) as string | null,
      contactPhone: emptyToNull(s.contactPhone) as string | null,
      note: emptyToNull(s.note) as string | null,
    })),
    cargoName: v.cargoName,
    weightTon: v.weightTon ?? null,
    packages: v.packages ?? null,
    vehicleTypeHint: emptyToNull(v.vehicleTypeHint) as string | null,
    fragile: !!v.fragile,
    loadingAtPickup: !!v.loadingAtPickup,
    loadingAtDrop: !!v.loadingAtDrop,
    pickupFrom: v.pickupFrom ? new Date(v.pickupFrom).toISOString() : null,
    deliverBefore: v.deliverBefore ? new Date(v.deliverBefore).toISOString() : null,
    flexibility: emptyToNull(v.flexibility) as string | null,
    note: emptyToNull(v.note) as string | null,
    contactName: v.contactName,
    contactPhone: v.contactPhone,
  };
}
