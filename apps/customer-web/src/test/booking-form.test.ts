import { describe, expect, it } from 'vitest';
import { formatVnd, formatDate } from '@bta/shared';
import { bookingFormSchema, defaultBookingValues, toBookingInput } from '@/features/bookings/booking-form';
import { routeOf } from '@/components/ui';
import { notificationTarget } from '@/features/notifications/NotificationsPage';

const valid = () => ({
  ...defaultBookingValues('m1'),
  cargoName: '5 tấn phân bón',
  pickupFrom: '2026-09-25T08:00',
  contactName: 'Chị Ba',
  contactPhone: '0987654321',
  stops: [
    { type: 'PICKUP' as const, address: 'Cần Giuộc', locationName: 'Kho A', contactName: '', contactPhone: '', note: '', addressId: null },
    { type: 'DROPOFF' as const, address: 'Quận 8', locationName: '', contactName: '', contactPhone: '', note: '', addressId: null },
  ],
});

describe('CW-BOOK-01 form', () => {
  it('thiếu tên hàng, thời gian lấy, SĐT → lỗi inline', () => {
    const r = bookingFormSchema.safeParse({ ...valid(), cargoName: '', pickupFrom: '', contactPhone: 'abc' });
    expect(r.success).toBe(false);
    const fields = r.success ? [] : r.error.issues.map((i) => i.path.join('.'));
    expect(fields).toEqual(expect.arrayContaining(['cargoName', 'pickupFrom', 'contactPhone']));
  });

  it('phải có cả điểm lấy và điểm trả', () => {
    const v = valid();
    v.stops[1].type = 'PICKUP';
    const r = bookingFormSchema.safeParse(v);
    expect(r.success).toBe(false);
    expect(r.success ? '' : r.error.issues[0].message).toMatch(/điểm trả/);
  });

  it('giao trước phải sau lấy hàng', () => {
    const r = bookingFormSchema.safeParse({ ...valid(), deliverBefore: '2026-09-24T08:00' });
    expect(r.success).toBe(false);
  });

  it('chuẩn hóa sang BookingInput: rỗng → null, số, ISO', () => {
    const input = toBookingInput(bookingFormSchema.parse({ ...valid(), weightTon: '5' }));
    expect(input.weightTon).toBe(5);
    expect(input.packages).toBeNull();
    expect(input.stops[1].locationName).toBeNull();
    expect(input.pickupFrom).toMatch(/^2026-09-2\dT/);
    expect(input.merchantId).toBe('m1');
  });
});

describe('helpers', () => {
  it('routeOf lấy điểm lấy đầu → điểm trả cuối', () => {
    expect(routeOf([{ type: 'PICKUP', locationName: 'Kho A', address: 'x' }, { type: 'DROPOFF', address: 'Q7' }, { type: 'DROPOFF', address: 'Thủ Đức' }])).toBe('Kho A → Thủ Đức');
  });
  it('notificationTarget', () => {
    expect(notificationTarget({ type: 'BOOKING_UPDATED', entityType: 'BOOKING', entityId: 'b1' })).toBe('/bookings/b1');
    expect(notificationTarget({ type: 'DEBT_STATEMENT_SENT', entityType: 'DEBT_STATEMENT', entityId: 's1' })).toBe('/debt-statements?statement=s1');
  });
  it('định dạng tiền/ngày', () => {
    expect(formatVnd(1250000)).toBe('1.250.000 đ');
    expect(formatDate('2026-09-23T00:00:00Z')).toBe('23/09/2026');
  });
});
