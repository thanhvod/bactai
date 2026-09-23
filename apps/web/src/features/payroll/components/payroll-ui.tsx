import * as React from 'react';
import { Lock } from 'lucide-react';
import { Banner, SummaryStrip } from '@bta/shadcn';
import { PAYROLL_EDITABLE_STATUSES, formatDate, formatDateTime, formatVnd, type PayrollStatus } from '@bta/shared';
import type { PrTotalsFieldsFragment } from '@/gql/graphql';

export function isEditable(status: string) {
  return PAYROLL_EDITABLE_STATUSES.includes(status as PayrollStatus);
}

/** Dải tổng lương: lương cố định · thưởng · trừ ứng · giảm trừ · điều chỉnh · thực lãnh. */
export function PayrollTotalsStrip({ totals, previous }: { totals: PrTotalsFieldsFragment; previous?: PrTotalsFieldsFragment | null }) {
  const delta = previous ? totals.net - previous.net : null;
  return (
    <SummaryStrip
      items={[
        { label: 'Số tài xế', value: totals.driverCount },
        { label: 'Lương cố định', value: formatVnd(totals.salary) },
        { label: 'Thưởng chuyến', value: formatVnd(totals.bonus), tone: 'success' },
        { label: 'Trừ ứng lương', value: formatVnd(totals.advance), tone: totals.advance ? 'warning' : 'neutral' },
        { label: 'Giảm trừ', value: formatVnd(totals.deduction), tone: totals.deduction ? 'danger' : 'neutral' },
        ...(totals.adjustment ? [{ label: 'Điều chỉnh', value: formatVnd(totals.adjustment), tone: 'info' as const }] : []),
        {
          label: 'Tổng thực lãnh',
          value: formatVnd(totals.net),
          tone: 'primary',
          hint: delta !== null ? `${delta >= 0 ? '+' : '−'}${formatVnd(Math.abs(delta))} so với kỳ trước` : undefined,
        },
      ]}
    />
  );
}

/** Banner snapshot/khóa theo trạng thái (D-012). */
export function PayrollStatusBanner({ p }: { p: { status: string; approvedAt?: string | null; approvedByName?: string | null; paidAt?: string | null; paidByName?: string | null; returnReason?: string | null; cancelReason?: string | null; submittedAt?: string | null } }) {
  if (p.status === 'PAID')
    return <Banner tone="primary" icon={<Lock />} message={`Đã chi trả ${formatDate(p.paidAt)}${p.paidByName ? ` · ${p.paidByName}` : ''}. Số liệu là snapshot, không sửa được; chênh lệch điều chỉnh vào kỳ sau (D-012).`} />;
  if (p.status === 'APPROVED')
    return <Banner tone="primary" icon={<Lock />} message={`Đã duyệt ${formatDateTime(p.approvedAt)}${p.approvedByName ? ` bởi ${p.approvedByName}` : ''}. Bảng lương khóa sửa; admin có thể trả về nháp (kèm lý do) trước khi chi trả.`} />;
  if (p.status === 'SUBMITTED') return <Banner tone="warning" message={`Đã gửi duyệt ${formatDateTime(p.submittedAt)} — chờ giám đốc duyệt. Không sửa được trong lúc chờ duyệt.`} />;
  if (p.status === 'RETURNED') return <Banner tone="danger" message={`Bị trả về: ${p.returnReason ?? '—'}. Sửa rồi gửi duyệt lại.`} />;
  if (p.status === 'CANCELLED') return <Banner tone="neutral" message={`Đã hủy: ${p.cancelReason ?? '—'}`} />;
  return null;
}

export function monthOptions() {
  return Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${String(i + 1).padStart(2, '0')}` }));
}

export function yearOptions() {
  const y = new Date().getFullYear();
  return [y + 1, y, y - 1, y - 2].map((v) => ({ value: String(v), label: String(v) }));
}

export function Section({ title, actions, children }: { title: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-heading-sm">{title}</h2>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
