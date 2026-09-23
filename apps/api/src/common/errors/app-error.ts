import { GraphQLError } from 'graphql';
import { ERROR_CODES, type ErrorCode } from '@bta/shared';

export interface ValidationIssue {
  field: string;
  message: string;
}

export class AppError extends GraphQLError {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly validation?: ValidationIssue[];

  constructor(code: ErrorCode, message?: string, extra?: { validation?: ValidationIssue[]; details?: Record<string, unknown> }) {
    super(message ?? ERROR_CODES[code], {
      extensions: { code, validation: extra?.validation, details: extra?.details },
    });
    this.code = code;
    this.validation = extra?.validation;
    this.httpStatus = HTTP_STATUS[code];
  }
}

const HTTP_STATUS: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  TENANT_SCOPE_VIOLATION: 403,
  VALIDATION_ERROR: 400,
  CONFLICT: 409,
  SENSITIVE_REASON_REQUIRED: 400,
  NOT_FOUND: 404,
  BUSINESS_RULE_VIOLATION: 422,
  MERCHANT_REQUIRED: 400,
};

export const unauthenticated = (msg?: string) => new AppError('UNAUTHENTICATED', msg);
export const forbidden = (msg?: string) => new AppError('FORBIDDEN', msg);
export const notFound = (what = 'Dữ liệu') => new AppError('NOT_FOUND', `Không tìm thấy ${what}`);
export const conflict = (msg?: string) => new AppError('CONFLICT', msg);
export const businessRule = (msg: string) => new AppError('BUSINESS_RULE_VIOLATION', msg);
export const validationError = (issues: ValidationIssue[], msg?: string) =>
  new AppError('VALIDATION_ERROR', msg ?? issues.map((i) => `${i.field}: ${i.message}`).join('; '), { validation: issues });
export const reasonRequired = () => new AppError('SENSITIVE_REASON_REQUIRED');
export const merchantRequired = () => new AppError('MERCHANT_REQUIRED');
