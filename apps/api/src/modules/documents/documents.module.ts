import { Global, Module } from '@nestjs/common';
import { DocumentsResolver } from './documents.resolver';
import { DocumentsService } from './documents.service';
import { PdfService } from './pdf.service';

@Global()
@Module({ providers: [PdfService, DocumentsService, DocumentsResolver], exports: [PdfService, DocumentsService] })
export class DocumentsModule {}
