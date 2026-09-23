import { Logger } from '@nestjs/common';
import { Prisma } from '@bta/db';
import type { GraphQLFormattedError } from 'graphql';
import { env } from '../../config/env';

const logger = new Logger('GraphQLError');

/** Chuẩn hóa lỗi GraphQL: extensions.code theo 07 §11; ẩn lỗi nội bộ ở production. */
export function formatGraphQLError(formatted: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  const original = (error as any)?.originalError ?? error;
  const code = (formatted.extensions?.code as string) ?? 'INTERNAL_SERVER_ERROR';

  if (original instanceof Prisma.PrismaClientKnownRequestError) {
    if (original.code === 'P2002') {
      return { message: 'Dữ liệu bị trùng (mã/biển số/SĐT đã tồn tại)', path: formatted.path, extensions: { code: 'CONFLICT', target: original.meta?.target } };
    }
    if (original.code === 'P2025') return { message: 'Không tìm thấy dữ liệu', path: formatted.path, extensions: { code: 'NOT_FOUND' } };
  }
  const nestResponse = (original as any)?.response;
  if (nestResponse?.statusCode === 403) return { message: nestResponse.message ?? 'Không có quyền', path: formatted.path, extensions: { code: 'FORBIDDEN' } };
  if (nestResponse?.statusCode === 401) return { message: 'Chưa đăng nhập', path: formatted.path, extensions: { code: 'UNAUTHENTICATED' } };

  const known = ['UNAUTHENTICATED', 'FORBIDDEN', 'TENANT_SCOPE_VIOLATION', 'VALIDATION_ERROR', 'CONFLICT', 'SENSITIVE_REASON_REQUIRED', 'NOT_FOUND', 'BUSINESS_RULE_VIOLATION', 'MERCHANT_REQUIRED', 'GRAPHQL_VALIDATION_FAILED', 'BAD_USER_INPUT', 'GRAPHQL_PARSE_FAILED'];
  if (known.includes(code)) return { ...formatted, extensions: { ...formatted.extensions, stacktrace: undefined } };

  logger.error(formatted.message, (original as Error)?.stack);
  if (env().NODE_ENV === 'production') return { message: 'Lỗi hệ thống, vui lòng thử lại', path: formatted.path, extensions: { code: 'INTERNAL_SERVER_ERROR' } };
  return { ...formatted, extensions: { ...formatted.extensions, code: 'INTERNAL_SERVER_ERROR' } };
}
