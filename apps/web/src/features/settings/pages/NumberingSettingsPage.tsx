import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { History, Pencil } from 'lucide-react';
import { Banner, Button, DataTable, Drawer, ErrorState, FormField, Input, PageHeader, Select, toast } from '@bta/shadcn';
import { formatDocCode, type NumberFormat } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { NumberSequencesQuery, UpdateNumberFormatMutation } from '../graphql/settings';

const DATE_PARTS = [
  { value: 'YYYYMM', label: 'Năm tháng (YYYYMM)' },
  { value: 'YYMM', label: 'Năm rút gọn + tháng (YYMM)' },
  { value: 'YYYY', label: 'Năm (YYYY)' },
  { value: 'NONE', label: 'Không có ngày' },
];
const RESET = [
  { value: 'MONTHLY', label: 'Đặt lại mỗi tháng' },
  { value: 'YEARLY', label: 'Đặt lại mỗi năm' },
  { value: 'NEVER', label: 'Không đặt lại' },
];

type Row = { docType: string; label: string; prefix: string; separator: string; datePart: string; digits: number; resetPeriod: string; pattern: string; nextValue: string; issuedThisPeriod: number };

/** WM-SET-02 — Cấu hình mã tự động. Chỉ admin sửa; áp dụng cho chứng từ tạo mới. */
export default function NumberingSettingsPage() {
  const { hasPermission, current } = useAuth();
  const canEdit = hasPermission('settings.manage');
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(NumberSequencesQuery);
  const [save, { loading: saving }] = useMutation(UpdateNumberFormatMutation);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [draft, setDraft] = React.useState<NumberFormat | null>(null);

  const open = (r: Row) => {
    setEditing(r);
    setDraft({ prefix: r.prefix, separator: r.separator, datePart: r.datePart as NumberFormat['datePart'], digits: r.digits, resetPeriod: r.resetPeriod as NumberFormat['resetPeriod'] });
  };
  const prefixError = draft && !/^[A-Z0-9]{1,10}$/.test(draft.prefix) ? 'Tiền tố 1–10 ký tự chữ in hoa/số' : undefined;
  const digitsError = draft && (draft.digits < 2 || draft.digits > 8) ? 'Số chữ số 2–8' : undefined;
  const preview = draft ? formatDocCode(draft, (editing?.issuedThisPeriod ?? 0) + 1) : '';

  const submit = async () => {
    if (!editing || !draft || prefixError || digitsError) return;
    try {
      await save({ variables: { docType: editing.docType as never, input: draft } });
      toast.success(`Đã lưu định dạng mã ${editing.label}`, 'Áp dụng cho chứng từ tạo mới');
      setEditing(null);
      void refetch();
    } catch (e) {
      toast.error('Không lưu được định dạng', apolloErrorMessage(e));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Mã tự động"
        subtitle="Định dạng mã chứng từ theo nhà xe. Thay đổi chỉ áp dụng cho chứng từ tạo mới; mã đã cấp giữ nguyên."
        breadcrumb={[{ label: 'Cài đặt', to: PATHS.settingsCompany }, { label: 'Mã tự động' }]}
        actions={
          canEdit ? (
            <Button variant="secondary" onClick={openTimeline}>
              <History /> Xem lịch sử
            </Button>
          ) : null
        }
      />
      {!canEdit ? <Banner tone="info" message="Chỉ Admin được sửa định dạng mã." /> : null}
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          loading={loading && !data}
          rows={(data?.numberSequences ?? []) as Row[]}
          rowKey={(r) => r.docType}
          columns={[
            { key: 'label', label: 'Loại chứng từ', render: (r) => <span className="font-medium">{r.label}</span> },
            { key: 'pattern', label: 'Định dạng', render: (r) => <span className="font-mono">{r.pattern}</span> },
            { key: 'reset', label: 'Bộ đếm', render: (r) => RESET.find((x) => x.value === r.resetPeriod)?.label ?? r.resetPeriod, hideBelow: 'md' },
            { key: 'issued', label: 'Đã cấp kỳ này', align: 'right', render: (r) => <span className="tabular-nums">{r.issuedThisPeriod}</span> },
            { key: 'next', label: 'Mã tiếp theo', render: (r) => <span className="font-mono text-primary">{r.nextValue}</span> },
            {
              key: 'actions',
              label: '',
              align: 'right',
              render: (r) =>
                canEdit ? (
                  <Button size="sm" variant="ghost" onClick={() => open(r)}>
                    <Pencil /> Sửa
                  </Button>
                ) : null,
            },
          ]}
        />
      )}
      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={`Định dạng mã ${editing?.label ?? ''}`}
        description="Áp dụng cho chứng từ tạo mới."
        width={480}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Hủy
            </Button>
            <Button onClick={() => void submit()} loading={saving} disabled={!!prefixError || !!digitsError}>
              Lưu định dạng
            </Button>
          </>
        }
      >
        {draft ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tiền tố" required error={prefixError}>
                <Input value={draft.prefix} onChange={(e) => setDraft({ ...draft, prefix: e.target.value.toUpperCase() })} />
              </FormField>
              <FormField label="Ký tự phân cách">
                <Input value={draft.separator} maxLength={3} onChange={(e) => setDraft({ ...draft, separator: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Phần ngày">
              <Select value={draft.datePart} options={DATE_PARTS} onValueChange={(v) => setDraft({ ...draft, datePart: v as NumberFormat['datePart'] })} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Số chữ số" error={digitsError}>
                <Input type="number" min={2} max={8} value={draft.digits} onChange={(e) => setDraft({ ...draft, digits: Number(e.target.value) })} />
              </FormField>
              <FormField label="Bộ đếm">
                <Select value={draft.resetPeriod} options={RESET} onValueChange={(v) => setDraft({ ...draft, resetPeriod: v as NumberFormat['resetPeriod'] })} />
              </FormField>
            </div>
            <div className="rounded-md border border-border bg-surface-muted p-3">
              <p className="text-caption text-text-muted">Xem trước mã tiếp theo</p>
              <p className="font-mono text-heading-sm text-primary">{preview}</p>
            </div>
          </div>
        ) : null}
      </Drawer>
      {current ? <TimelineDrawer entity={{ type: 'SETTINGS', id: `numbering:${editing?.docType ?? 'ORDER'}` }} title="Lịch sử cấu hình mã" /> : null}
    </div>
  );
}
