import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

/**
 * Tiền VND lưu BigInt trong DB (docs/07). GraphQL serialize về number —
 * an toàn vì tiền VND thực tế < 2^53.
 */
@Scalar('BigInt', () => BigInt)
export class BigIntScalar implements CustomScalar<number, bigint> {
  description = 'Số nguyên lớn (tiền VND), serialize về JS number';

  serialize(value: unknown): number {
    return Number(value);
  }

  parseValue(value: unknown): bigint {
    return BigInt(Math.round(Number(value)));
  }

  parseLiteral(ast: ValueNode): bigint {
    if (ast.kind === Kind.INT || ast.kind === Kind.FLOAT) {
      return BigInt(Math.round(Number(ast.value)));
    }
    throw new Error('BigInt phải là số');
  }
}
