import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { AppError } from './app-error';

/** REST (upload, GPS, driver auth...) trả JSON {code, message, validation?}. GraphQL để Apollo xử lý. */
@Catch()
export class RestExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RestExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') throw exception;
    const res = host.switchToHttp().getResponse<Response>();
    if (exception instanceof AppError) {
      res.status(exception.httpStatus).json({ code: exception.code, message: exception.message, validation: exception.validation });
      return;
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      res.status(status).json({ code: status === 404 ? 'NOT_FOUND' : status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'ERROR', message: exception.message });
      return;
    }
    this.logger.error((exception as Error)?.message, (exception as Error)?.stack);
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi hệ thống' });
  }
}
