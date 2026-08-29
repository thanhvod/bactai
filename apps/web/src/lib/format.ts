/** Tiền VND: API trả number (BigInt serialize) */
export function formatMoney(v: number | null | undefined): string {
  if (v == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(v) + ' ₫';
}

export function formatDate(v: string | Date | null | undefined): string {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('vi-VN');
}

export function formatDateTime(v: string | Date | null | undefined): string {
  if (!v) return '—';
  return new Date(v).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

/** input[type=datetime-local] → ISO; rỗng → undefined */
export function localToIso(v: string): string | undefined {
  return v ? new Date(v).toISOString() : undefined;
}

/** Parse "1.500.000" hoặc "1500000" → 1500000 */
export function parseMoney(v: string): number {
  const n = Number(v.replace(/[^\d-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
