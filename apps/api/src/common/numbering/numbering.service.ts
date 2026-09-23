import { Injectable } from '@nestjs/common';
import { DOC_TYPE, DEFAULT_NUMBER_FORMAT, formatDocCode, periodKey, type DocType, type NumberFormat } from '@bta/shared';
import { currentMerchantId } from '../context/request-context';
import { merchantRequired } from '../errors/app-error';
import { PrismaService, type DbClient } from '../prisma/prisma.service';

/**
 * Sinh mã chứng từ theo merchant + loại + kỳ (FDN-006). Tăng counter bằng UPSERT ... RETURNING nguyên tử
 * nên nhiều request đồng thời không trùng mã.
 */
@Injectable()
export class NumberingService {
  constructor(private readonly prisma: PrismaService) {}

  async format(docType: DocType, merchantId: string, db: DbClient = this.prisma.db): Promise<NumberFormat> {
    const f = await (db as any).numberFormat.findFirst({ where: { merchantId, docType } });
    return f
      ? { prefix: f.prefix, separator: f.separator, datePart: f.datePart, digits: f.digits, resetPeriod: f.resetPeriod }
      : { prefix: DOC_TYPE[docType].prefix, ...DEFAULT_NUMBER_FORMAT };
  }

  async next(docType: DocType, tx?: DbClient, at: Date = new Date()): Promise<string> {
    const merchantId = currentMerchantId();
    if (!merchantId) throw merchantRequired();
    const db = tx ?? this.prisma.db;
    const fmt = await this.format(docType, merchantId, db);
    const period = periodKey(fmt.resetPeriod, at);
    const rows = await (db as any).$queryRaw<{ currentValue: number }[]>`
      INSERT INTO number_sequences (id, "merchantId", "docType", period, "currentValue", "updatedAt")
      VALUES (gen_random_uuid()::text, ${merchantId}, ${docType}::"DocType", ${period}, 1, now())
      ON CONFLICT ("merchantId", "docType", period)
      DO UPDATE SET "currentValue" = number_sequences."currentValue" + 1, "updatedAt" = now()
      RETURNING "currentValue"`;
    return formatDocCode(fmt, Number(rows[0].currentValue), at);
  }

  /** Xem trước mã tiếp theo (không tăng counter). */
  async preview(docType: DocType, merchantId: string, at: Date = new Date()): Promise<{ next: string; issued: number }> {
    const fmt = await this.format(docType, merchantId, this.prisma.raw as any);
    const period = periodKey(fmt.resetPeriod, at);
    const seq = await this.prisma.raw.numberSequence.findUnique({ where: { merchantId_docType_period: { merchantId, docType, period } } });
    const issued = seq?.currentValue ?? 0;
    return { next: formatDocCode(fmt, issued + 1, at), issued };
  }
}
