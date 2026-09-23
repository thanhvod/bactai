import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Auth, Public } from '../../common/auth/decorators';
import { businessRule, notFound } from '../../common/errors/app-error';
import { StorageService } from '../../common/storage/storage.service';
import { AttachmentsService, MAX_UPLOAD_BYTES, type PresignInput } from './attachments.service';

/** REST upload theo ARCHITECTURE §16.1. */
@Controller()
export class AttachmentsController {
  constructor(private readonly svc: AttachmentsService, private readonly storage: StorageService) {}

  @Auth('USER', 'DRIVER')
  @Post('uploads/presign')
  @HttpCode(200)
  presign(@Body() body: PresignInput) {
    return this.svc.presign(body);
  }

  @Auth('USER', 'DRIVER')
  @Post('uploads/confirm')
  @HttpCode(200)
  confirm(@Body() body: { attachmentId: string; checksum?: string }) {
    return this.svc.confirm(body.attachmentId, body.checksum);
  }

  /** Nhận file khi STORAGE_DRIVER=local — token HMAC thay cho chữ ký S3. */
  @Public()
  @Put('files/upload/:token')
  @HttpCode(200)
  async upload(@Param('token') token: string, @Req() req: Request) {
    const local = this.storage.local;
    if (!local) throw notFound();
    const v = local.verify(token, 'put');
    if (!v) throw businessRule('Link tải lên không hợp lệ hoặc đã hết hạn');
    const [, maxStr] = v.extra.split('|');
    const max = Math.min(Number(maxStr) + 1024, MAX_UPLOAD_BYTES + 1024);
    const chunks: Buffer[] = [];
    let size = 0;
    const body = (req as any).body;
    if (Buffer.isBuffer(body) && body.length) {
      chunks.push(body);
      size = body.length;
    } else {
      for await (const chunk of req) {
        size += chunk.length;
        if (size > max) throw businessRule('File vượt dung lượng đã khai báo');
        chunks.push(chunk as Buffer);
      }
    }
    await local.putObject(v.key, Buffer.concat(chunks));
    return { ok: true, size };
  }

  @Public()
  @Get('files/raw/:token')
  async raw(@Param('token') token: string, @Res() res: Response) {
    const local = this.storage.local;
    if (!local) throw notFound();
    const v = local.verify(token, 'get');
    if (!v) throw businessRule('Link tải xuống không hợp lệ hoặc đã hết hạn');
    const buf = await local.getObject(v.key);
    if (!buf) throw notFound('file');
    const [disp, fileName] = v.extra.split('|');
    const ext = (fileName.split('.').pop() ?? '').toLowerCase();
    const type = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', csv: 'text/csv' }[ext] ?? 'application/octet-stream';
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Disposition', `${disp}; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(buf);
  }

  @Auth('USER', 'DRIVER')
  @Get('files/:attachmentId/download')
  async download(@Param('attachmentId') id: string, @Query('inline') inline: string, @Res() res: Response) {
    res.redirect(302, await this.svc.downloadUrl(id, inline !== '0'));
  }
}
