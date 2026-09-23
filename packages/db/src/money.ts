/** Chuyển BigInt (Prisma) ↔ number an toàn. Tiền VND < 9e15 nên luôn nằm trong safe integer. */
export function big(value: number | bigint | null | undefined): bigint {
  if (value === null || value === undefined) return 0n;
  return typeof value === 'bigint' ? value : BigInt(Math.trunc(value));
}

export function num(value: bigint | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === 'bigint' ? Number(value) : value;
}
