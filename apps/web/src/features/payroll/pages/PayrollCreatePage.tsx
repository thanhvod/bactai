import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { Eye } from 'lucide-react';
import { Banner, Button, Checkbox, DataTable, EmptyState, ErrorState, FormField, MoneyCell, PageHeader, Select, Textarea, WarningPanel, toast, type DataTableColumn } from '@bta/shadcn';
import { formatDate } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { PrLineFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { PayrollTotalsStrip, Section, monthOptions, yearOptions } from '../components/payroll-ui';
import { PrDriverOptionsQuery, PrGenerateMutation, PrPreviewQuery } from '../graphql/payroll';

type Line = PrLineFieldsFragment & { items?: { type: string; description: string; amount: number; sourceRef?: string | null }[] };

/** WM-PAYROLL-03 — Tạo bảng lương: chọn kỳ + tài xế → xem trước từ dữ liệu gốc → tạo nháp (snapshot). */
export default function PayrollCreatePage() {
  return (
    <RequirePermission permission="payroll.generate">
      <PayrollCreate />
    </RequirePermission>
  );
}

function PayrollCreate() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = React.useState(String(now.getFullYear()));
  const [month, setMonth] = React.useState(String(now.getMonth() + 1));
  const [selected, setSelected] = React.useState<Set<string> | null>(null); // null = tất cả tài xế đang hoạt động
  const [note, setNote] = React.useState('');
  const [previewKey, setPreviewKey] = React.useState(0);
  const { data: drv } = useQuery(PrDriverOptionsQuery);
  const drivers = drv?.driverOptions ?? [];
  const input = { year: Number(year), month: Number(month), driverIds: selected ? [...selected] : null, note: note.trim() || null };
  const { data, loading, error, refetch } = useQuery(PrPreviewQuery, { variables: { input }, skip: previewKey === 0, fetchPolicy: 'network-only' });
  const [generate, { loading: generating }] = useMutation(PrGenerateMutation);
  const preview = data?.payrollPreview;

  const toggle = (id: string) => {
    const base = selected ?? new Set(drivers.map((d) => d.id));
    const next = new Set(base);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next.size === drivers.length ? null : next);
  };
  const isChecked = (id: string) => (selected ? selected.has(id) : true);

  const submit = async () => {
    try {
      const r = await generate({ variables: { input } });
      const p = r.data?.generatePayroll;
      if (p) {
        toast.success(`Đã tạo bảng lương nháp ${p.code}`);
        navigate(paths.payrollDetail(p.id));
      }
    } catch (e) {
      toast.error(apolloErrorMessage(e));
    }
  };

  const columns: DataTableColumn<Line>[] = [
    { key: 'driver', label: 'Tài xế', render: (r) => <div className="flex flex-col"><span className="font-medium">{r.driverName}</span><span className="text-caption text-text-subtle">{r.driverCode}</span></div> },
    { key: 'base', label: 'Lương cố định', money: true, render: (r) => <div className="text-right"><MoneyCell value={r.baseSalary} /><span className="block text-caption text-text-subtle">{r.salaryEffectiveFrom ? `từ ${formatDate(r.salaryEffectiveFrom)}` : 'Chưa có mốc lương'}</span></div> },
    { key: 'bonus', label: 'Thưởng', money: true, render: (r) => <div className="text-right"><MoneyCell value={r.bonusTotal} tone={r.bonusTotal ? 'success' : 'muted'} /><span className="block text-caption text-text-subtle">{(r.items ?? []).filter((i) => i.type === 'BONUS').length} chuyến</span></div> },
    { key: 'advance', label: 'Trừ ứng', money: true, render: (r) => <MoneyCell value={r.advanceTotal} tone={r.advanceTotal ? 'warning' : 'muted'} /> },
    { key: 'deduction', label: 'Giảm trừ', money: true, render: (r) => <MoneyCell value={r.deductionTotal} tone={r.deductionTotal ? 'danger' : 'muted'} /> },
    { key: 'net', label: 'Thực lãnh (dự kiến)', money: true, render: (r) => <MoneyCell value={r.netAmount} strong /> },
    { key: 'anomalies', label: 'Cảnh báo', hideBelow: 'lg', render: (r) => (r.anomalies.length ? <span className="text-warning">{r.anomalies.join('; ')}</span> : <span className="text-text-subtle">—</span>) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Tạo bảng lương"
        breadcrumb={[{ label: 'Lương', to: PATHS.payroll }, { label: 'Tạo bảng lương' }]}
        subtitle="Hệ thống cộng dồn lương cố định theo mốc hiện hành, thưởng các chuyến hoàn thành trong kỳ và ứng lương chưa trừ. Giảm trừ thêm tay sau khi tạo."
      />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tháng" required>
              <Select value={month} onValueChange={setMonth} options={monthOptions()} />
            </FormField>
            <FormField label="Năm" required>
              <Select value={year} onValueChange={setYear} options={yearOptions()} />
            </FormField>
          </div>
          <p className="text-caption text-text-subtle">Kỳ lương theo cài đặt nhà xe (tháng dương lịch hoặc ngày bắt đầu tùy chọn).</p>
          <FormField label={`Tài xế (${selected ? selected.size : drivers.length}/${drivers.length})`}>
            <div className="flex max-h-72 flex-col gap-1 overflow-auto rounded-md border border-border p-2">
              <label className="flex items-center gap-2 border-b border-border pb-1 text-body-sm font-medium">
                <Checkbox checked={selected === null} onCheckedChange={(v) => setSelected(v === true ? null : new Set())} /> Tất cả tài xế đang hoạt động
              </label>
              {drivers.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-body-sm">
                  <Checkbox checked={isChecked(d.id)} onCheckedChange={() => toggle(d.id)} /> {d.name} <span className="text-text-subtle">{d.code}</span>
                </label>
              ))}
            </div>
          </FormField>
          <FormField label="Ghi chú">
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
          <Button variant="secondary" disabled={selected?.size === 0} onClick={() => (previewKey ? void refetch() : setPreviewKey(1))}>
            <Eye /> Xem trước
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {previewKey === 0 ? (
            <EmptyState message="Chọn kỳ và tài xế rồi bấm Xem trước" description="Bản xem trước chưa lưu; bấm Tạo bảng lương nháp để chốt snapshot." />
          ) : error ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : (
            <>
              {preview ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-heading-sm">
                    {preview.periodLabel} · {formatDate(preview.periodFrom)} – {formatDate(preview.periodTo)}
                  </h2>
                </div>
              ) : null}
              {preview?.conflictPayrollCode ? <Banner tone="danger" message={`Kỳ này đã có bảng lương ${preview.conflictPayrollCode} (chưa hủy). Hủy bảng cũ hoặc chọn kỳ khác.`} /> : null}
              {preview?.warnings.length ? <WarningPanel title="Cảnh báo dữ liệu" items={preview.warnings} /> : null}
              {preview ? <PayrollTotalsStrip totals={preview.totals} /> : null}
              <Section title="Dòng lương dự kiến">
                <DataTable columns={columns} rows={(preview?.lines ?? []) as Line[]} rowKey={(r) => r.driverId} loading={loading} empty={<EmptyState compact message="Không có tài xế trong kỳ" />} />
              </Section>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => navigate(PATHS.payroll)}>
                  Hủy
                </Button>
                <Button disabled={!preview || !!preview.conflictPayrollCode || !preview.lines.length || generating} onClick={() => void submit()}>
                  {generating ? 'Đang tạo…' : 'Tạo bảng lương nháp'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
