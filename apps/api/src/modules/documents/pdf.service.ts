import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { Browser } from 'playwright-core';
import { JobRunner } from '../../common/jobs/job-runner';

/** Tìm Chromium: env CHROMIUM_PATH → cache ms-playwright (headless shell / chrome-for-testing) → để playwright tự dò. */
function findChromium(): string | undefined {
  if (process.env.CHROMIUM_PATH && fs.existsSync(process.env.CHROMIUM_PATH)) return process.env.CHROMIUM_PATH;
  const cacheDirs = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(os.homedir(), 'Library/Caches/ms-playwright'),
    path.join(os.homedir(), '.cache/ms-playwright'),
  ].filter(Boolean) as string[];
  for (const dir of cacheDirs) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir).sort().reverse();
    for (const e of entries) {
      const candidates = [
        path.join(dir, e, 'chrome-headless-shell-mac-arm64/chrome-headless-shell'),
        path.join(dir, e, 'chrome-headless-shell-mac-x64/chrome-headless-shell'),
        path.join(dir, e, 'chrome-headless-shell-linux64/chrome-headless-shell'),
        path.join(dir, e, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
        path.join(dir, e, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
        path.join(dir, e, 'chrome-linux/chrome'),
        path.join(dir, e, 'chrome-linux64/chrome'),
      ];
      const hit = candidates.find((c) => fs.existsSync(c));
      if (hit) return hit;
    }
  }
  return undefined;
}

/** Render HTML → PDF A4 bằng Chromium headless (ARCHITECTURE §21.4). Một browser dùng lại cho mọi job. */
@Injectable()
export class PdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browser: Promise<Browser> | null = null;

  constructor(private readonly jobs: JobRunner) {}

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = (async () => {
        const { chromium } = await import('playwright-core');
        const executablePath = findChromium();
        this.logger.log(`Chromium: ${executablePath ?? '(playwright default)'}`);
        return chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--font-render-hinting=none'] });
      })().catch((e) => {
        this.browser = null;
        throw e;
      });
    }
    return this.browser;
  }

  async render(html: string, opts: { landscape?: boolean } = {}): Promise<Buffer> {
    return this.jobs.run('pdf.render', async () => {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      try {
        await page.setContent(html, { waitUntil: 'load' });
        const pdf = await page.pdf({
          format: 'A4',
          landscape: opts.landscape ?? false,
          printBackground: true,
          margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' },
        });
        return Buffer.from(pdf);
      } finally {
        await page.close();
      }
    });
  }

  async onModuleDestroy() {
    if (this.browser) {
      const b = await this.browser.catch(() => null);
      await b?.close().catch(() => undefined);
    }
  }
}
