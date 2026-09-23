import { Injectable } from '@nestjs/common';
import {
  DOC_TYPE,
  DOC_TYPES,
  merchantProfileSchema,
  merchantSettingsSchema,
  numberFormatSchema,
  type DocType,
} from '@bta/shared';
import { num } from '@bta/db';
import { z } from 'zod';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { currentMerchantId } from '../../common/context/request-context';
import { merchantRequired } from '../../common/errors/app-error';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { parse } from '../../common/validation/zod';
import type { MerchantProfileInput, MerchantSettingsInput, NumberFormatInput } from './merchants.types';

@Injectable()
export class MerchantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly storage: StorageService,
  ) {}

  private mid() {
    const id = currentMerchantId();
    if (!id) throw merchantRequired();
    return id;
  }

  async profile() {
    const m = await this.prisma.raw.merchant.findUniqueOrThrow({ where: { id: this.mid() } });
    let logoUrl: string | null = null;
    if (m.logoAttachmentId) {
      const a = await this.prisma.raw.attachment.findUnique({ where: { id: m.logoAttachmentId } });
      if (a && a.status === 'READY') logoUrl = await this.storage.adapter.presignGet(a.storageKey, a.fileName);
    }
    return { ...m, logoUrl };
  }

  async updateProfile(input: MerchantProfileInput) {
    const data = parse(merchantProfileSchema.extend({ logoAttachmentId: z.string().optional().nullable() }), input);
    const id = this.mid();
    const before = await this.prisma.raw.merchant.findUniqueOrThrow({ where: { id } });
    const updated = await this.prisma.raw.merchant.update({ where: { id }, data: data as any });
    const d = diffFields(before as any, data as any);
    if (d.changed.length) {
      await this.audit.log({ entityType: 'MERCHANT', entityId: id, category: 'UPDATE', action: 'merchant.update', summary: `Cập nhật hồ sơ nhà xe (${d.changed.join(', ')})`, before: d.before, after: d.after });
    }
    return this.profile().then((p) => ({ ...p, ...updated, logoUrl: p.logoUrl }));
  }

  async settings() {
    const id = this.mid();
    return this.prisma.raw.merchantSettings.upsert({ where: { merchantId: id }, create: { merchantId: id }, update: {} });
  }

  async updateSettings(input: MerchantSettingsInput) {
    const current = await this.settings();
    const merged = {
      ...current,
      codWarningAmount: num(current.codWarningAmount),
      defaultCreditLimit: current.defaultCreditLimit === null ? null : num(current.defaultCreditLimit),
      ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)),
    };
    const data = parse(merchantSettingsSchema, merged);
    const updated = await this.prisma.raw.merchantSettings.update({ where: { merchantId: current.merchantId }, data: data as any });
    const d = diffFields(current as any, data as any);
    if (d.changed.length) {
      await this.audit.log({ entityType: 'SETTINGS', entityId: current.id, category: 'UPDATE', action: 'settings.update', summary: `Cập nhật cài đặt vận hành (${d.changed.join(', ')})`, before: d.before, after: d.after });
    }
    return updated;
  }

  async numberSequences() {
    const merchantId = this.mid();
    return Promise.all(
      DOC_TYPES.map(async (docType: DocType) => {
        const fmt = await this.numbering.format(docType, merchantId, this.prisma.raw as any);
        const { next, issued } = await this.numbering.preview(docType, merchantId);
        const pattern = [fmt.prefix, fmt.datePart === 'NONE' ? '' : fmt.datePart, '#'.repeat(fmt.digits)].filter(Boolean).join(fmt.separator);
        return { docType, label: DOC_TYPE[docType].label, ...fmt, pattern, nextValue: next, issuedThisPeriod: issued };
      }),
    );
  }

  async updateNumberFormat(docType: DocType, input: NumberFormatInput) {
    const merchantId = this.mid();
    const data = parse(numberFormatSchema, { ...input, docType });
    const before = await this.numbering.format(docType, merchantId, this.prisma.raw as any);
    const { docType: _d, ...fields } = data;
    await this.prisma.raw.numberFormat.upsert({
      where: { merchantId_docType: { merchantId, docType } },
      create: { merchantId, docType, ...fields },
      update: fields,
    });
    await this.audit.log({ entityType: 'SETTINGS', entityId: `numbering:${docType}`, category: 'UPDATE', action: 'numbering.update', summary: `Đổi định dạng mã ${DOC_TYPE[docType].label}`, before, after: fields });
    return (await this.numberSequences()).find((s) => s.docType === docType)!;
  }
}
