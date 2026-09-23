import * as React from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { CheckCircle2, Download, FileSpreadsheet, RefreshCw, Upload } from 'lucide-react';
import { Banner, Button, Checkbox, DataTable, Dialog, EmptyState, FilterChip, Select, Stepper, SummaryStrip, toast, type DataTableColumn } from '@bta/shadcn';
import type { IoImportJobFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { IoCancelImportMutation, IoCommitImportMutation, IoImportTemplateQuery, IoStartImportMutation } from './graphql-io';

export type ImportEntity = 'CUSTOMER' | 'VEHICLE' | 'DRIVER';

const ENTITY_LABEL: Record<ImportEntity, string> = { CUSTOMER: 'khách hàng', VEHICLE: 'xe', DRIVER: 'tài xế' };
const STEPS = [
  { key: 'upload', label: 'Tải file' },
  { key: 'map', label: 'Ghép cột' },
  { key: 'check', label: 'Kiểm tra lỗi' },
  { key: 'confirm', label: 'Xác nhận' },
];
const MAX_MB = 5;

type Job = IoImportJobFieldsFragment;
type Row = Job['rows'][number];

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(new Error('Không đọc được file'));
    r.readAsDataURL(file);
  });
}

function csvCell(v: unknown) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Tải file lỗi: CSV gồm dòng lỗi/cảnh báo + cột mô tả lỗi (tạo phía client). */
function downloadErrorFile(job: Job) {
  const keys = job.fields.map((f) => f.key);
  const header = ['Dòng', ...job.fields.map((f) => f.label), 'Lỗi', 'Cảnh báo'];
  const lines = job.rows
    .filter((r) => r.errors.length || r.warnings.length)
    .map((r) => {
      const v = (r.values ?? {}) as Record<string, unknown>;
      return [r.line, ...keys.map((k) => v[k]), r.errors.join('; '), r.warnings.join('; ')].map(csvCell).join(',');
    });
  const blob = new Blob(['﻿' + [header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `loi-import-${job.entityType.toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * WM-SHELL-04 — Import Excel: Tải file → Ghép cột → Kiểm tra lỗi (preview) → Xác nhận (commit).
 * API tự nhận diện header tiếng Việt; người dùng có thể ghép lại cột rồi kiểm tra lại.
 */
export function ImportWizard({ open, onOpenChange, entityType, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; entityType: ImportEntity; onDone?: () => void }) {
  const client = useApolloClient();
  const [start, { loading: starting }] = useMutation(IoStartImportMutation);
  const [commit, { loading: committing }] = useMutation(IoCommitImportMutation);
  const [cancel] = useMutation(IoCancelImportMutation);
  const [step, setStep] = React.useState(0);
  const [file, setFile] = React.useState<{ name: string; base64: string } | null>(null);
  const [job, setJob] = React.useState<Job | null>(null);
  const [mapping, setMapping] = React.useState<Record<string, string>>({}); // fieldKey → header
  const [onlyErrors, setOnlyErrors] = React.useState(false);
  const [skipErrors, setSkipErrors] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const label = ENTITY_LABEL[entityType];

  const reset = React.useCallback(() => {
    setStep(0);
    setFile(null);
    setJob(null);
    setMapping({});
    setOnlyErrors(false);
    setSkipErrors(true);
    setError(null);
  }, []);

  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const close = (o: boolean) => {
    if (!o && job && job.status === 'PREVIEW') void cancel({ variables: { id: job.id } }).catch(() => undefined);
    onOpenChange(o);
  };

  const runPreview = async (f: { name: string; base64: string }, map?: Record<string, string>) => {
    setError(null);
    try {
      // API nhận mapping dạng { "Tên cột trong file": fieldKey }
      const headerToKey = map ? Object.fromEntries(Object.entries(map).filter(([, h]) => h).map(([k, h]) => [h, k])) : undefined;
      const r = await start({ variables: { input: { entityType, fileName: f.name, fileBase64: f.base64, mapping: headerToKey } } });
      const j = r.data?.startImport ?? null;
      setJob(j);
      if (j) setMapping(Object.fromEntries(j.fields.map((x) => [x.key, x.sourceColumn ?? ''])));
      return j;
    } catch (e) {
      setError(apolloErrorMessage(e));
      return null;
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) return setError('Chỉ nhận file Excel (.xlsx) hoặc CSV');
    if (f.size > MAX_MB * 1024 * 1024) return setError(`File tối đa ${MAX_MB}MB`);
    const next = { name: f.name, base64: await readBase64(f) };
    setFile(next);
    const j = await runPreview(next);
    if (j) setStep(1);
  };

  const downloadTemplate = async () => {
    try {
      const r = await client.query({ query: IoImportTemplateQuery, variables: { entityType }, fetchPolicy: 'network-only' });
      const url = r.data?.importTemplate.url;
      if (url) window.open(url, '_blank', 'noopener');
    } catch (e) {
      toast.error(apolloErrorMessage(e));
    }
  };

  const doCommit = async () => {
    if (!job) return;
    setError(null);
    try {
      const r = await commit({ variables: { id: job.id, skipErrors } });
      const j = r.data?.commitImport;
      if (j) {
        setJob(j);
        setStep(3);
        toast.success(`Đã nhập ${j.createdCount ?? 0} ${label}`);
        onDone?.();
      }
    } catch (e) {
      setError(apolloErrorMessage(e));
    }
  };

  const headers = React.useMemo(() => {
    if (!job) return [];
    const set = new Set<string>([...job.fields.map((f) => f.sourceColumn).filter(Boolean) as string[], ...job.unmappedColumns]);
    return [...set];
  }, [job]);

  const rows = (job?.rows ?? []).filter((r) => !onlyErrors || r.errors.length || r.warnings.length);
  const committed = job?.status === 'COMMITTED';
  const columns: DataTableColumn<Row>[] = [
    { key: 'line', label: 'Dòng', width: 64, render: (r) => <span className="tabular-nums">{r.line}</span> },
    ...(job?.fields ?? []).slice(0, 5).map((f) => ({
      key: f.key,
      label: f.label,
      render: (r: Row) => <span className="line-clamp-1">{String(((r.values ?? {}) as Record<string, unknown>)[f.key] ?? '')}</span>,
    })),
    {
      key: 'result',
      label: committed ? 'Kết quả' : 'Kiểm tra',
      render: (r) =>
        r.createdCode ? (
          <span className="text-success">Đã tạo {r.createdCode}</span>
        ) : r.errors.length ? (
          <span className="text-danger">{r.errors.join('; ')}</span>
        ) : r.warnings.length ? (
          <span className="text-warning">{r.warnings.join('; ')}</span>
        ) : (
          <span className="text-success">Hợp lệ</span>
        ),
    },
  ];

  const footer =
    step === 0 ? (
      <Button variant="secondary" onClick={() => void downloadTemplate()}>
        <Download /> Tải file mẫu
      </Button>
    ) : step === 1 ? (
      <>
        <Button variant="secondary" onClick={reset}>
          Chọn file khác
        </Button>
        <Button variant="secondary" disabled={starting || !file} onClick={() => file && void runPreview(file, mapping)}>
          <RefreshCw /> Kiểm tra lại
        </Button>
        <Button disabled={!job || job.fields.some((f) => f.required && !mapping[f.key])} onClick={() => setStep(2)}>
          Tiếp tục
        </Button>
      </>
    ) : step === 2 ? (
      <>
        <Button variant="secondary" onClick={() => setStep(1)}>
          Quay lại
        </Button>
        {job && (job.errorRows || job.warningRows) ? (
          <Button variant="secondary" onClick={() => downloadErrorFile(job)}>
            <Download /> Tải file lỗi
          </Button>
        ) : null}
        <Button disabled={committing || !job || (!skipErrors && job.errorRows > 0) || job.validRows + job.warningRows === 0} onClick={() => void doCommit()}>
          {committing ? 'Đang nhập…' : `Xác nhận nhập ${job ? job.validRows + job.warningRows : 0} dòng`}
        </Button>
      </>
    ) : (
      <Button onClick={() => close(false)}>Đóng</Button>
    );

  return (
    <Dialog open={open} onOpenChange={close} title={`Import ${label} từ Excel`} size="lg" modalStrict footer={footer}>
      <div className="flex flex-col gap-4">
        <Stepper steps={STEPS} active={step} />
        {error ? <Banner tone="danger" message={error} /> : null}
        {step === 0 ? (
          <div
            className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface-muted px-6 py-10 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void onFile(e.dataTransfer.files[0]);
            }}
          >
            <FileSpreadsheet className="size-8 text-text-subtle" strokeWidth={1.5} />
            <p className="text-body">Kéo thả file Excel vào đây hoặc chọn file</p>
            <p className="text-caption text-text-subtle">Hàng đầu là tiêu đề cột tiếng Việt (xem file mẫu). Tối đa {MAX_MB}MB.</p>
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
            <Button disabled={starting} onClick={() => inputRef.current?.click()}>
              <Upload /> {starting ? 'Đang đọc file…' : 'Chọn file'}
            </Button>
          </div>
        ) : null}
        {step === 1 && job ? (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-text-muted">
              File <b>{job.fileName}</b> · {job.totalRows} dòng. Ghép cột trong file với trường dữ liệu; trường có dấu * là bắt buộc.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {job.fields.map((f) => (
                <label key={f.key} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                  <span className="text-body-sm">
                    {f.label}
                    {f.required ? <span className="text-danger"> *</span> : null}
                  </span>
                  <Select
                    className="w-48"
                    value={mapping[f.key] || ''}
                    allowEmpty
                    emptyLabel="— Không nhập —"
                    onValueChange={(v) => setMapping((m) => ({ ...m, [f.key]: v }))}
                    options={headers.map((h) => ({ value: h, label: h }))}
                  />
                </label>
              ))}
            </div>
            {job.unmappedColumns.length ? <Banner tone="info" message={`Cột không dùng: ${job.unmappedColumns.join(', ')}`} /> : null}
          </div>
        ) : null}
        {(step === 2 || step === 3) && job ? (
          <div className="flex flex-col gap-3">
            <SummaryStrip
              items={
                committed
                  ? [
                      { label: 'Đã tạo', value: job.createdCount ?? 0, tone: 'success' },
                      { label: 'Bỏ qua', value: job.skippedCount ?? 0, tone: job.skippedCount ? 'warning' : 'neutral' },
                      { label: 'Tổng dòng', value: job.totalRows },
                    ]
                  : [
                      { label: 'Tổng dòng', value: job.totalRows },
                      { label: 'Hợp lệ', value: job.validRows, tone: 'success' },
                      { label: 'Cảnh báo', value: job.warningRows, tone: job.warningRows ? 'warning' : 'neutral' },
                      { label: 'Lỗi', value: job.errorRows, tone: job.errorRows ? 'danger' : 'neutral' },
                    ]
              }
            />
            {committed ? <Banner tone="success" icon={<CheckCircle2 />} message={`Hoàn tất import ${label}. Dữ liệu mới đã có trong danh sách.`} /> : null}
            <div className="flex flex-wrap items-center gap-3">
              <FilterChip label="Chỉ dòng lỗi / cảnh báo" active={onlyErrors} onClick={() => setOnlyErrors((v) => !v)} />
              {!committed && job.errorRows > 0 ? (
                <label className="flex items-center gap-2 text-body-sm">
                  <Checkbox checked={skipErrors} onCheckedChange={(v) => setSkipErrors(v === true)} /> Bỏ qua {job.errorRows} dòng lỗi khi nhập
                </label>
              ) : null}
            </div>
            <DataTable columns={columns} rows={rows} rowKey={(r) => String(r.line)} compact maxHeight={360} empty={<EmptyState compact message="Không có dòng nào" />} />
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
