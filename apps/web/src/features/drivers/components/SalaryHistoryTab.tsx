import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Banner, Button, DataTable, DateField, Dialog, EmptyState, FormField, Input, MoneyCell, MoneyInput, StatusBadge, toast, type DataTableColumn } from '@bta/shadcn';
import { formatDate, formatDateTime, formatVnd, isoDate, salaryHistorySchema, type SalaryHistoryInput } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import type { SalaryHistoryFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { AddSalaryHistoryMutation } from '../graphql/drivers';
import { DriverPayrollLines } from './DriverPayrollLines';

/** WM-DRV-04 — Lịch sử lương cố định: mốc lương + ngày hiệu lực để kỳ cũ tính đúng. */
export function SalaryHistoryTab({ driverId, history, onChanged }: { driverId: string; history: SalaryHistoryFieldsFragment[]; onChanged: () => void }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('driver.salary.manage');
  const [open, setOpen] = React.useState(false);
  const rows = [...history].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  const current = rows.find((r) => r.isCurrent);
  const columns: DataTableColumn<SalaryHistoryFieldsFragment>[] = [
    { key: 'from', label: 'Hiệu lực từ', render: (r) => formatDate(r.effectiveFrom) },
    { key: 'to', label: 'Đến', render: (r) => (r.effectiveTo ? formatDate(r.effectiveTo) : <span className="text-text-subtle">nay</span>) },
    { key: 'amount', label: 'Lương cố định', money: true, render: (r) => <MoneyCell value={r.amount} strong={r.isCurrent} /> },
    { key: 'delta', label: 'Thay đổi', money: true, render: (r) => (r.delta ? <MoneyCell value={r.delta} signed /> : <MoneyCell value={null} />) },
    { key: 'status', label: '', render: (r) => (r.isCurrent ? <StatusBadge label="Đang áp dụng" tone="success" /> : null) },
    { key: 'reason', label: 'Lý do', render: (r) => r.reason ?? <span className="text-text-subtle">—</span> },
    { key: 'by', label: 'Người sửa', hideBelow: 'lg', render: (r) => <span className="text-body-sm">{r.createdByName ?? '—'} · {formatDateTime(r.createdAt)}</span> },
  ];
  return (
    <div className="flex flex-col gap-4">
      <Banner
        tone="info"
        message="Bảng lương lấy mốc lương có hiệu lực tại ngày cuối kỳ. Thêm mốc mới thay vì sửa mốc cũ để các kỳ đã chốt không bị thay đổi."
      />
      <Panel
        title={`Lịch sử lương cố định${current ? ` · hiện tại ${formatVnd(current.amount)}` : ''}`}
        actions={
          canManage ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus /> Thêm mốc lương
            </Button>
          ) : null
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          compact
          empty={<EmptyState compact message="Chưa có mốc lương" description={canManage ? 'Thêm mốc lương đầu tiên để tạo bảng lương.' : undefined} />}
        />
      </Panel>
      <Panel title="Bảng lương đã dùng mức lương này" actions={<CellLink to={PATHS.payroll}>Mở danh sách bảng lương</CellLink>}>
        <DriverPayrollLines driverId={driverId} />
      </Panel>
      <AddSalaryDialog open={open} onOpenChange={setOpen} driverId={driverId} currentAmount={current?.amount ?? null} onSaved={onChanged} />
    </div>
  );
}

function AddSalaryDialog({ open, onOpenChange, driverId, currentAmount, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; driverId: string; currentAmount: number | null; onSaved: () => void }) {
  const [add, { loading }] = useMutation(AddSalaryHistoryMutation);
  const [err, setErr] = React.useState<string | null>(null);
  const form = useForm<SalaryHistoryInput>({ resolver: zodResolver(salaryHistorySchema) as never, defaultValues: { amount: currentAmount ?? 0, effectiveFrom: isoDate(new Date()), reason: '' } });
  React.useEffect(() => {
    if (open) {
      setErr(null);
      form.reset({ amount: currentAmount ?? 0, effectiveFrom: isoDate(new Date()), reason: '' });
    }
  }, [open, currentAmount, form]);
  const amount = form.watch('amount');
  const submit = form.handleSubmit(async (v) => {
    setErr(null);
    try {
      await add({ variables: { driverId, input: { amount: Number(v.amount), effectiveFrom: v.effectiveFrom, reason: v.reason || null } } });
      toast.success('Đã thêm mốc lương');
      onOpenChange(false);
      onSaved();
    } catch (e) {
      setErr(apolloErrorMessage(e));
    }
  });
  const f = form.formState.errors;
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thêm mốc lương cố định"
      modalStrict
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => void submit()} loading={loading}>
            Lưu mốc lương
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {err ? <Banner tone="danger" message={err} /> : null}
        <FormField label="Lương cố định / tháng" required error={f.amount?.message}>
          <Controller control={form.control} name="amount" render={({ field }) => <MoneyInput value={field.value ?? null} onChange={(v) => field.onChange(v ?? 0)} />} />
        </FormField>
        {currentAmount !== null && Number(amount) !== currentAmount ? (
          <p className="text-body-sm text-text-muted">
            So với hiện tại: <span className={Number(amount) > currentAmount ? 'text-success' : 'text-danger'}>{Number(amount) > currentAmount ? '+' : ''}{formatVnd(Number(amount) - currentAmount)}</span>
          </p>
        ) : null}
        <FormField label="Hiệu lực từ ngày" required error={f.effectiveFrom?.message} hint="Kỳ lương có ngày cuối ≥ ngày này sẽ dùng mức mới">
          <Controller control={form.control} name="effectiveFrom" render={({ field }) => <DateField value={field.value} onChange={field.onChange} />} />
        </FormField>
        <FormField label="Lý do" error={f.reason?.message}>
          <Input {...form.register('reason')} placeholder="Tăng lương định kỳ" />
        </FormField>
      </form>
    </Dialog>
  );
}
