import { Injectable, Logger } from '@nestjs/common';

/**
 * D-010: chạy job inline qua abstraction này. Sau này thay implement bằng BullMQ mà không đổi use-case.
 */
@Injectable()
export class JobRunner {
  private readonly logger = new Logger(JobRunner.name);

  async run<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const started = Date.now();
    try {
      return await fn();
    } finally {
      this.logger.log(`job ${name} ${Date.now() - started}ms`);
    }
  }

  /** Fire-and-forget (lỗi chỉ log). */
  enqueue(name: string, fn: () => Promise<unknown>): void {
    setImmediate(() => {
      this.run(name, fn).catch((e) => this.logger.error(`job ${name} failed: ${(e as Error).message}`));
    });
  }
}
