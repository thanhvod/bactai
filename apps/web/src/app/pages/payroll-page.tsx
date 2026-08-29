import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button, Card, CardContent, CardHeader, CardTitle, Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@bta/shadcn';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { formatDate, formatMoney, parseMoney } from '../../lib/format';
import { useMe } from '../auth/merchant-gate';
import { EmptyState, Field, FormDialog, PageHeader } from '../components/page-shell';
import { StatusBadge } from '../components/status-badge';

const LIST = gql`
  query Payrolls {
    payrolls {
      id periodStart periodEnd status createdByName approvedByName createdAt
      lines {
        id driverId driverName baseSalary totalBonus totalAdvance totalDeduction netAmount
        items { id type amount orderCode reasonName note }
      }
    }
  }
`;
const DEDUCTION_REASONS = gql`query DeductReasons { catalogItems(kind: DEDUCTION_REASON) { id name } }`;
const CREATE = gql`
  mutation CreatePayroll($periodStart: DateTime!, $periodEnd: DateTime!) {
    createPayroll(periodStart: $periodStart, periodEnd: $periodEnd) { id }
  }
`;
const UPDATE_STATUS = gql`
  mutation UpdatePayrollStatus($id: ID!, $status: PayrollStatus!) {
    updatePayrollStatus(id: $id, status: $status) { id status }
  }
`;
const ADD_DEDUCTION = gql`
  mutation AddDeduction($payrollLineId: ID!, $amount: BigInt!, $reasonId: ID, $note: String) {
    addPayrollDeduction(payrollLineId: $payrollLineId, amount: $amount, reasonId: $reasonId, note: $note) { id }
  }
`;

const ITEM_LABEL: Record<string, string> = { BONUS: 'Thưởng', ADVANCE: 'Ứng lương', DEDUCTION: 'Giảm trừ' };

export function PayrollPage() {
  const me = useMe();
  const { data, refetch } = useQuery<any>(LIST);
  const { data: reasonData } = useQuery<any>(DEDUCTION_REASONS);
  const [create, { loading: creating, error: cError }] = useMutation(CREATE);
  const [updateStatus, { error: sError }] = useMutation(UPDATE_STATUS);
  const [addDeduction, { loading: dLoading, error: dError }] = useMutation(ADD_DEDUCTION);

  const [createOpen, setCreateOpen] = useState(false);
  const [period, setPeriod] = useState({ start: '', end: '' });
  const [selected, setSelected] = useState<string | null>(null);
  const [deductDialog, setDeductDialog] = useState<{ lineId: string; driverName: string } | null>(null);
  const [deductForm, setDeductForm] = useState({ amount: '', reasonId: '', note: '' });

  const payrolls = data?.payrolls ?? [];
  const current = payrolls.find((p: any) => p.id === selected) ?? payrolls[0];

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Lương tài xế"
        actions={
          <Button onClick={() => { setPeriod({ start: '', end: '' }); setCreateOpen(true); }}>
            <Plus className="size-4" /> Tạo bảng lương
          </Button>
        }
      />
      {sError && <p className="text-sm text-destructive">{sError.message}</p>}

      {payrolls.length === 0 ? (
        <EmptyState message="Chưa có bảng lương. Tạo bảng lương cho kỳ đầu tiên." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {payrolls.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`rounded-md border px-3 py-1.5 text-sm ${current?.id === p.id ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-muted'}`}
              >
                {formatDate(p.periodStart)} – {formatDate(p.periodEnd)}{' '}
                <StatusBadge status={p.status} />
              </button>
            ))}
          </div>

          {current && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">
                  Kỳ {formatDate(current.periodStart)} – {formatDate(current.periodEnd)}
                  <span className="ml-2"><StatusBadge status={current.status} /></span>
                </CardTitle>
                <div className="flex gap-2">
                  {current.status === 'DRAFT' && (
                    <Button size="sm" onClick={async () => { await updateStatus({ variables: { id: current.id, status: 'PENDING_APPROVAL' } }); refetch(); }}>
                      Gửi duyệt
                    </Button>
                  )}
                  {current.status === 'PENDING_APPROVAL' && me.role === 'ADMIN' && (
                    <Button size="sm" onClick={async () => { await updateStatus({ variables: { id: current.id, status: 'APPROVED' } }); refetch(); }}>
                      Duyệt (giám đốc)
                    </Button>
                  )}
                  {current.status === 'APPROVED' && (
                    <Button size="sm" onClick={async () => { await updateStatus({ variables: { id: current.id, status: 'PAID' } }); refetch(); }}>
                      Đánh dấu đã trả
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tài xế</TableHead>
                      <TableHead className="text-right">Lương cố định</TableHead>
                      <TableHead className="text-right">Thưởng</TableHead>
                      <TableHead className="text-right">Ứng</TableHead>
                      <TableHead className="text-right">Giảm trừ</TableHead>
                      <TableHead className="text-right">Thực lãnh</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {current.lines.map((l: any) => (
                      <TableRow key={l.id}>
                        <TableCell>
                          <div className="font-medium">{l.driverName}</div>
                          {l.items.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {l.items.map((it: any) =>
                                [ITEM_LABEL[it.type], it.orderCode && `đơn ${it.orderCode}`, it.reasonName, it.note, formatMoney(it.amount)]
                                  .filter(Boolean).join(' '),
                              ).join(' · ')}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{formatMoney(l.baseSalary)}</TableCell>
                        <TableCell className="text-right text-emerald-700">+{formatMoney(l.totalBonus)}</TableCell>
                        <TableCell className="text-right text-amber-700">−{formatMoney(l.totalAdvance)}</TableCell>
                        <TableCell className="text-right text-red-700">−{formatMoney(l.totalDeduction)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatMoney(l.netAmount)}</TableCell>
                        <TableCell className="text-right">
                          {(current.status === 'DRAFT' || current.status === 'PENDING_APPROVAL') && (
                            <Button size="sm" variant="outline" onClick={() => { setDeductForm({ amount: '', reasonId: '', note: '' }); setDeductDialog({ lineId: l.id, driverName: l.driverName }); }}>
                              Giảm trừ
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Tạo bảng lương theo kỳ"
        onSubmit={async () => {
          await create({
            variables: {
              periodStart: new Date(period.start).toISOString(),
              periodEnd: new Date(period.end + 'T23:59:59').toISOString(),
            },
          });
          setCreateOpen(false);
          refetch();
        }}
        submitDisabled={!period.start || !period.end}
        loading={creating}
        error={cError?.message}
      >
        <Field label="Từ ngày *"><Input type="date" value={period.start} onChange={(e) => setPeriod({ ...period, start: e.target.value })} /></Field>
        <Field label="Đến ngày *"><Input type="date" value={period.end} onChange={(e) => setPeriod({ ...period, end: e.target.value })} /></Field>
        <p className="text-xs text-muted-foreground">
          Hệ thống tự cộng: lương cố định + thưởng các chuyến trong kỳ − các khoản ứng lương chưa trừ.
          Giảm trừ thêm tay sau khi tạo.
        </p>
      </FormDialog>

      <FormDialog
        open={deductDialog !== null}
        onOpenChange={(v) => !v && setDeductDialog(null)}
        title={`Giảm trừ — ${deductDialog?.driverName ?? ''}`}
        onSubmit={async () => {
          await addDeduction({
            variables: {
              payrollLineId: deductDialog!.lineId,
              amount: parseMoney(deductForm.amount),
              reasonId: deductForm.reasonId || null,
              note: deductForm.note || null,
            },
          });
          setDeductDialog(null);
          refetch();
        }}
        submitDisabled={!deductForm.amount}
        loading={dLoading}
        error={dError?.message}
      >
        <Field label="Số tiền (₫) *"><Input value={deductForm.amount} onChange={(e) => setDeductForm({ ...deductForm, amount: e.target.value })} /></Field>
        <Field label="Lý do">
          <Select value={deductForm.reasonId} onValueChange={(v) => setDeductForm({ ...deductForm, reasonId: v })}>
            <SelectTrigger><SelectValue placeholder="Chọn lý do" /></SelectTrigger>
            <SelectContent>
              {(reasonData?.catalogItems ?? []).map((r: any) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Ghi chú"><Input value={deductForm.note} onChange={(e) => setDeductForm({ ...deductForm, note: e.target.value })} /></Field>
      </FormDialog>
    </div>
  );
}
