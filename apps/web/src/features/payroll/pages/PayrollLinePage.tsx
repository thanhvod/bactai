import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { Plus, Printer, Trash2 } from 'lucide-react';
import {
  Banner,
  Breadcrumb,
  Button,
  DataTable,
  DetailSkeleton,
  Dialog,
  EmptyState,
  EntityHeader,
  ErrorState,
  FormField,
  IconButton,
  Input,
  MoneyCell,
  MoneyInput,
  RadioGroup,
  SensitiveActionModal,
  StatusBadge,
  SummaryStrip,
  Textarea,
  Select,
  toast,
  type DataTableColumn,
} from '@bta/shadcn';
import { MIN_REASON_LENGTH, PAYROLL_ITEM_TYPE, PAYROLL_STATUS, formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { PrItemFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { ExportDialog } from '@/features/shared/ExportDialog';
import { PayrollStatusBanner, Section, isEditable } from '../components/payroll-ui';
import { PrAddItemMutation, PrPayrollLineQuery, PrRemoveItemMutation } from '../graphql/payroll';

type Item = PrItemFieldsFragment;
const SIGN: Record<string, number> = { BASE: 1, BONUS: 1, ADVANCE: -1, DEDUCTION: -1, ADJUSTMENT: 1 };

/** WM-PAYROLL-04 — Chi tiết dòng lương tài xế: các khoản cấu thành, thêm giảm trừ/điều chỉnh (chỉ khi nháp), in phiếu lương. */
export default function PayrollLinePage() {
  return (
    <RequirePermission permission="payroll.view">
      <PayrollLine />
    </RequirePermission>
  );
}

function PayrollLine() {
  const { payrollId = '', lineId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data, loading, error, refetch } = useQuery(PrPayrollLineQuery, { variables: { id: lineId } });
  const [remove, { loading: removing }] = useMutation(PrRemoveItemMutation);
  const [addOpen, setAddOpen] = React.useState(false);
  const [toRemove, setToRemove] = React.useState<Item | null>(null);
  const [printOpen, setPrintOpen] = React.useState(false);

  if (error) return /Không tìm thấy/.test(error.message) ? <EmptyState message="Không tìm thấy dòng lương" action={<Button onClick={() => navigate(paths.payrollDetail(payrollId))}>Về bảng lương</Button>} /> : <ErrorState error={error} onRetry={() => void refetch()} />;
  if (loading && !data) return <DetailSkeleton />;
  const l = data?.payrollLine;
  if (!l) return null;
  const status = l.payrollStatus ?? 'DRAFT';
  const editable = isEditable(status) && hasPermission('payroll.line.update');

  const columns: DataTableColumn<Item>[] = [
    { key: 'type', label: 'Khoản', width: 150, render: (r) => <StatusBadge meta={PAYROLL_ITEM_TYPE} status={r.type} /> },
    {
      key: 'desc',
      label: 'Diễn giải',
      render: (r) => (
        <div className="flex flex-col">
          <span>{r.description}</span>
          <span className="text-caption text-text-subtle">
            {[r.reasonName, r.note, r.createdByName ? `Thêm bởi ${r.createdByName}` : null].filter(Boolean).join(' · ')}
          </span>
        </div>
      ),
    },
    {
      key: 'source',
      label: 'Nguồn',
      hideBelow: 'md',
      render: (r) =>
        r.tripId ? (
          <a className="text-accent hover:underline" href={paths.trip(r.tripId)} onClick={(e) => { e.preventDefault(); navigate(paths.trip(r.tripId!)); }}>{r.sourceRef ?? 'Chuyến'}</a>
        ) : r.expenseId ? (
          <a className="text-accent hover:underline" href={paths.expense(r.expenseId)} onClick={(e) => { e.preventDefault(); navigate(paths.expense(r.expenseId!)); }}>{r.sourceRef ?? 'Phiếu chi'}</a>
        ) : (
          <span className="text-text-subtle">{r.sourceRef ?? 'Nhập tay'}</span>
        ),
    },
    { key: 'date', label: 'Ngày', hideBelow: 'lg', render: (r) => formatDate(r.itemDate) || '—' },
    { key: 'amount', label: 'Số tiền', money: true, render: (r) => <MoneyCell value={(SIGN[r.type] ?? 1) * r.amount} signed /> },
    {
      key: 'act',
      label: '',
      width: 48,
      render: (r) => (editable && r.id && r.type !== 'BASE' ? <IconButton label="Gỡ khoản" variant="ghost" onClick={() => setToRemove(r)}><Trash2 /></IconButton> : null),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Lương', to: PATHS.payroll }, { label: l.payrollCode ?? 'Bảng lương', to: paths.payrollDetail(payrollId) }, { label: l.driverName }]} />
      <EntityHeader
        code={l.driverCode ?? ''}
        title={l.driverName}
        status={<StatusBadge meta={PAYROLL_STATUS} status={status} />}
        subtitle={`${l.payrollCode ?? ''} · ${l.periodLabel ?? ''}${l.salaryEffectiveFrom ? ` · lương cố định theo mốc ${formatDate(l.salaryEffectiveFrom)}` : ''}`}
        primaryAction={
          editable ? (
            <Button onClick={() => setAddOpen(true)}>
              <Plus /> Thêm giảm trừ / điều chỉnh
            </Button>
          ) : null
        }
        secondaryActions={
          <>
            {hasPermission('payroll.export') ? (
              <Button variant="secondary" onClick={() => setPrintOpen(true)}>
                <Printer /> In phiếu lương
              </Button>
            ) : null}
            <Button variant="ghost" onClick={() => navigate(paths.driver(l.driverId, 'ledger'))}>
              Sổ công nợ tài xế
            </Button>
          </>
        }
      />
      <PayrollStatusBanner p={{ status }} />
      <SummaryStrip
        items={[
          { label: 'Lương cố định', value: formatVnd(l.baseSalary) },
          { label: 'Thưởng', value: formatVnd(l.bonusTotal), tone: 'success' },
          { label: 'Trừ ứng lương', value: formatVnd(l.advanceTotal), tone: l.advanceTotal ? 'warning' : 'neutral' },
          { label: 'Giảm trừ', value: formatVnd(l.deductionTotal), tone: l.deductionTotal ? 'danger' : 'neutral' },
          ...(l.adjustmentTotal ? [{ label: 'Điều chỉnh', value: formatVnd(l.adjustmentTotal), tone: 'info' as const }] : []),
          { label: 'Thực lãnh', value: formatVnd(l.netAmount), tone: 'primary' },
        ]}
      />
      {l.anomalies.length ? <Banner tone="warning" message={l.anomalies.join(' · ')} /> : null}
      <Section title="Các khoản cấu thành">
        <DataTable columns={columns} rows={l.items} rowKey={(r) => r.id ?? `${r.type}-${r.description}`} empty={<EmptyState compact message="Chưa có khoản nào" />} totalRow={{ desc: <span className="font-medium">Thực lãnh</span>, amount: <MoneyCell value={l.netAmount} strong /> }} />
      </Section>
      {l.excluded?.length ? (
        <Section title="Không tính vào lương (tham khảo)">
          <p className="text-caption text-text-subtle">Chi phí tài xế chi trước được hoàn qua phiếu chi; tạm ứng chuyến đối soát theo chuyến — không trừ lương.</p>
          <DataTable
            compact
            rows={l.excluded}
            rowKey={(r) => `${r.kind}-${r.code}`}
            columns={[
              { key: 'code', label: 'Chứng từ', render: (r) => <span className="font-mono">{r.code}</span> },
              { key: 'desc', label: 'Diễn giải', render: (r) => r.description },
              { key: 'reason', label: 'Lý do không trừ', hideBelow: 'md', render: (r) => <span className="text-text-muted">{r.reason}</span> },
              { key: 'date', label: 'Ngày', hideBelow: 'lg', render: (r) => formatDate(r.date) },
              { key: 'amount', label: 'Số tiền', money: true, render: (r) => <MoneyCell value={r.amount} tone="muted" /> },
            ]}
          />
        </Section>
      ) : null}
      {l.id ? <AddItemDialog open={addOpen} onOpenChange={setAddOpen} lineId={l.id} onSaved={() => void refetch()} /> : null}
      <SensitiveActionModal
        open={!!toRemove}
        onOpenChange={(o) => !o && setToRemove(null)}
        action={`Gỡ khoản "${toRemove?.description ?? ''}"`}
        affected={toRemove ? [`${PAYROLL_ITEM_TYPE[toRemove.type as keyof typeof PAYROLL_ITEM_TYPE]?.label ?? toRemove.type}: ${formatVnd(toRemove.amount)}`] : []}
        confirmLabel="Gỡ khoản"
        loading={removing}
        onConfirm={async (reason) => {
          try {
            await remove({ variables: { id: toRemove!.id!, reason } });
            toast.success('Đã gỡ khoản');
            setToRemove(null);
            await refetch();
          } catch (e) {
            toast.error(apolloErrorMessage(e));
          }
        }}
      />
      {l.id ? <ExportDialog open={printOpen} onOpenChange={setPrintOpen} title={`Phiếu lương ${l.driverName}`} documents={[{ template: 'PAYSLIP', entityId: l.id, label: 'Phiếu lương' }]} /> : null}
    </div>
  );
}

function AddItemDialog({ open, onOpenChange, lineId, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; lineId: string; onSaved: () => void }) {
  const [type, setType] = React.useState<'DEDUCTION' | 'ADJUSTMENT' | 'BONUS'>('DEDUCTION');
  const [amount, setAmount] = React.useState<number | null>(null);
  const [description, setDescription] = React.useState('');
  const [reasonId, setReasonId] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const [note, setNote] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);
  const { data: reasons } = useQuery(CatalogOptionsQuery, { variables: { type: 'DEDUCTION_REASON' as never, activeOnly: true }, skip: !open });
  const [add, { loading }] = useMutation(PrAddItemMutation);
  React.useEffect(() => {
    if (open) {
      setType('DEDUCTION');
      setAmount(null);
      setDescription('');
      setReasonId(null);
      setReason('');
      setNote('');
      setErr(null);
    }
  }, [open]);
  const needReason = type === 'DEDUCTION';
  const valid = !!amount && amount !== 0 && (type === 'ADJUSTMENT' || amount > 0) && description.trim() && (!needReason || (reasonId && reason.trim().length >= MIN_REASON_LENGTH));

  const save = async () => {
    setErr(null);
    try {
      await add({ variables: { input: { lineId, type, amount: amount!, description: description.trim(), reasonId: needReason ? reasonId : null, reason: reason.trim() || null, note: note.trim() || null } } });
      toast.success('Đã thêm khoản vào dòng lương');
      onOpenChange(false);
      onSaved();
    } catch (e) {
      setErr(apolloErrorMessage(e));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thêm khoản vào dòng lương"
      modalStrict
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={!valid || loading} onClick={() => void save()}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {err ? <Banner tone="danger" message={err} /> : null}
        <RadioGroup
          inline
          value={type}
          onValueChange={(v) => setType(v as typeof type)}
          options={[
            { value: 'DEDUCTION', label: 'Giảm trừ' },
            { value: 'ADJUSTMENT', label: 'Điều chỉnh kỳ trước' },
            { value: 'BONUS', label: 'Thưởng thêm' },
          ]}
        />
        {needReason ? (
          <FormField label="Lý do giảm trừ" required>
            <Select value={reasonId} onValueChange={setReasonId} options={(reasons?.catalogItems ?? []).map((c) => ({ value: c.id, label: c.name }))} placeholder="Chọn lý do" />
          </FormField>
        ) : null}
        <FormField label="Số tiền" required hint={type === 'ADJUSTMENT' ? 'Số dương cộng thêm, số âm trừ bớt' : 'Số tiền dương'}>
          <MoneyInput value={amount} onChange={setAmount} allowNegative={type === 'ADJUSTMENT'} />
        </FormField>
        <FormField label="Diễn giải" required>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={type === 'DEDUCTION' ? 'VD: Đền hàng hư đơn DH-...' : 'VD: Bù thiếu thưởng kỳ trước'} />
        </FormField>
        <FormField label={needReason ? 'Lý do chi tiết (ghi audit)' : 'Lý do (tùy chọn)'} required={needReason} error={needReason && reason && reason.trim().length < MIN_REASON_LENGTH ? `Tối thiểu ${MIN_REASON_LENGTH} ký tự` : undefined}>
          <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        </FormField>
        <FormField label="Ghi chú">
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  );
}
