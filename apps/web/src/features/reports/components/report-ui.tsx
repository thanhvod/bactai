import * as React from 'react';
import { useSearchParams } from 'react-router';
import { DateField, FilterBar, PageHeader, SegmentedControl, type FilterSelectDef } from '@bta/shadcn';
import { isoDate } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { ExportButton, type ExportTemplate } from '@/features/shared/ExportDialog';

export type Preset = 'month' | 'lastMonth' | 'quarter' | 'year' | 'custom';

export function presetRange(p: Preset, now = new Date()): { from: string; to: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (yy: number, mm: number, dd: number) => isoDate(new Date(yy, mm, dd, 12));
  switch (p) {
    case 'lastMonth':
      return { from: d(y, m - 1, 1), to: d(y, m, 0) };
    case 'quarter':
      return { from: d(y, Math.floor(m / 3) * 3, 1), to: isoDate(now) };
    case 'year':
      return { from: d(y, 0, 1), to: isoDate(now) };
    default:
      return { from: d(y, m, 1), to: isoDate(now) };
  }
}

/** Khoảng thời gian báo cáo lưu trên URL (?from=&to=&preset=) để chia sẻ link. */
export function useReportRange(defaultPreset: Preset = 'month') {
  const [params, setParams] = useSearchParams();
  const preset = (params.get('preset') as Preset | null) ?? (params.get('from') ? 'custom' : defaultPreset);
  const base = presetRange(preset === 'custom' ? 'month' : preset);
  const from = params.get('from') ?? base.from;
  const to = params.get('to') ?? base.to;
  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    setParams(next, { replace: true });
  };
  return {
    from,
    to,
    preset,
    params,
    set,
    setPreset: (p: Preset) => (p === 'custom' ? set({ preset: 'custom', from, to }) : set({ preset: p, from: null, to: null })),
    setRange: (f: string, t: string) => set({ preset: 'custom', from: f, to: t }),
  };
}

export function RangeControls({ range }: { range: ReturnType<typeof useReportRange> }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl
        size="sm"
        value={range.preset}
        onChange={(v) => range.setPreset(v as Preset)}
        items={[
          { value: 'month', label: 'Tháng này' },
          { value: 'lastMonth', label: 'Tháng trước' },
          { value: 'quarter', label: 'Quý này' },
          { value: 'year', label: 'Năm nay' },
          { value: 'custom', label: 'Tùy chọn' },
        ]}
      />
      {range.preset === 'custom' ? (
        <div className="flex items-center gap-1">
          <DateField className="w-40" value={range.from} onChange={(v) => v && range.setRange(v, range.to)} aria-label="Từ ngày" />
          <span className="text-text-subtle">–</span>
          <DateField className="w-40" value={range.to} onChange={(v) => v && range.setRange(range.from, v)} aria-label="Đến ngày" />
        </div>
      ) : null}
    </div>
  );
}

/** Khung trang báo cáo: tiêu đề + breadcrumb Trung tâm báo cáo + nút xuất Excel. */
export function ReportPage({
  title,
  subtitle,
  exportTemplate,
  exportFilter,
  range,
  selects,
  chips,
  children,
}: {
  title: string;
  subtitle?: string;
  exportTemplate?: ExportTemplate;
  exportFilter?: Record<string, unknown>;
  range?: ReturnType<typeof useReportRange>;
  selects?: FilterSelectDef[];
  chips?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { hasPermission } = useAuth();
  const canExport = exportTemplate ? hasPermission(exportTemplate === 'PAYROLL' ? 'payroll.export' : 'report.export') : false;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={[{ label: 'Báo cáo', to: PATHS.reports }, { label: title }]}
        actions={exportTemplate && canExport ? <ExportButton template={exportTemplate} filter={exportFilter} /> : null}
      />
      {range || selects?.length || chips ? <FilterBar selects={selects} chips={chips} right={range ? <RangeControls range={range} /> : undefined} /> : null}
      {children}
    </div>
  );
}

export function pct(v: number | null | undefined) {
  return v === null || v === undefined ? '—' : `${v.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}
