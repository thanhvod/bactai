import { describe, expect, it } from 'vitest';
import { presetRange } from '@/features/reports/components/report-ui';

describe('presetRange (báo cáo)', () => {
  const now = new Date(2026, 8, 23, 10); // 23/09/2026
  it('tháng này / tháng trước / quý / năm', () => {
    expect(presetRange('month', now)).toEqual({ from: '2026-09-01', to: '2026-09-23' });
    expect(presetRange('lastMonth', now)).toEqual({ from: '2026-08-01', to: '2026-08-31' });
    expect(presetRange('quarter', now)).toEqual({ from: '2026-07-01', to: '2026-09-23' });
    expect(presetRange('year', now)).toEqual({ from: '2026-01-01', to: '2026-09-23' });
  });
});
