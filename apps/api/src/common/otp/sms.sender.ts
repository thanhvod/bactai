import { Logger } from '@nestjs/common';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { env } from '../../config/env';

export interface SmsSender {
  send(phoneE164: string, message: string): Promise<void>;
}

/** Dev/test: không gửi thật, in ra log. */
export class LogSmsSender implements SmsSender {
  private readonly logger = new Logger('SMS');
  async send(phone: string, message: string) {
    this.logger.log(`[DEV SMS → ${phone}] ${message}`);
  }
}

/** Production (D-015): AWS SNS gửi SMS transactional. */
export class SnsSmsSender implements SmsSender {
  private readonly client = new SNSClient({ region: env().AWS_REGION });
  async send(phone: string, message: string) {
    await this.client.send(
      new PublishCommand({
        PhoneNumber: phone,
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
          ...(env().SNS_SENDER_ID ? { 'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: env().SNS_SENDER_ID! } } : {}),
        },
      }),
    );
  }
}

/** 0912345678 / +84912345678 / 84912345678 → +84912345678 */
export function toE164Vn(phone: string): string {
  const d = phone.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return d;
  if (d.startsWith('84')) return `+${d}`;
  if (d.startsWith('0')) return `+84${d.slice(1)}`;
  return `+84${d}`;
}

/** Chuẩn hóa về dạng lưu DB: 0xxxxxxxxx */
export function normalizeVnPhone(phone: string): string {
  const d = phone.replace(/[^\d+]/g, '');
  if (d.startsWith('+84')) return `0${d.slice(3)}`;
  if (d.startsWith('84') && d.length >= 11) return `0${d.slice(2)}`;
  return d;
}

export function isValidVnMobile(phone: string): boolean {
  return /^0[35789]\d{8}$/.test(normalizeVnPhone(phone));
}
