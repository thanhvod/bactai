import * as React from 'react';
import { CombinedGraphQLErrors } from '@apollo/client';
import { Button, WarningPanel, toast } from '@bta/shadcn';
import { SCHEDULE_WARNING_TYPE } from '@bta/shared';
import { apolloErrorMessage } from '@/lib/apollo';

/** Cảnh báo trùng lịch trả về trong extensions.details.warnings khi createTrip/createOrder bị chặn chờ override. */
export interface OverlapWarning {
  type: string;
  subject: string;
  subjectLabel?: string | null;
  conflictTripId?: string | null;
  conflictTripCode?: string | null;
  gapMinutes: number;
  thresholdMinutes?: number;
}

export function errorCode(error: unknown): string | undefined {
  if (!CombinedGraphQLErrors.is(error)) return undefined;
  return (error.errors[0]?.extensions as { code?: string } | undefined)?.code;
}

/** BUSINESS_RULE_VIOLATION có details.warnings → cảnh báo trùng lịch cần override. */
export function overlapWarningsFromError(error: unknown): OverlapWarning[] | null {
  if (!CombinedGraphQLErrors.is(error)) return null;
  for (const e of error.errors) {
    const ext = e.extensions as { code?: string; details?: { warnings?: OverlapWarning[] } } | undefined;
    if (ext?.code === 'BUSINESS_RULE_VIOLATION' && Array.isArray(ext.details?.warnings) && ext.details!.warnings!.length) return ext.details!.warnings!;
  }
  return null;
}

export function overlapText(w: OverlapWarning): string {
  const subject = w.subject === 'VEHICLE' ? 'Xe' : 'Tài xế';
  const who = w.subjectLabel ? `${subject} ${w.subjectLabel}` : subject;
  const kind = SCHEDULE_WARNING_TYPE[w.type as keyof typeof SCHEDULE_WARNING_TYPE] ?? w.type;
  const gap = w.type === 'OVERLAP' ? 'chồng giờ' : `cách ${formatMinutes(w.gapMinutes)}${w.thresholdMinutes ? ` (ngưỡng ${formatMinutes(w.thresholdMinutes)})` : ''}`;
  return `${kind}: ${who} với chuyến ${w.conflictTripCode ?? '—'} — ${gap}`;
}

export function formatMinutes(m: number): string {
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} giờ ${r} phút` : `${h} giờ`;
}

/** Panel cảnh báo trùng lịch — mềm, cho tiếp tục kèm lý do nếu có quyền. */
export function OverlapWarningPanel({
  warnings,
  canOverride,
  onOverride,
  checking,
}: {
  warnings: OverlapWarning[];
  canOverride: boolean;
  onOverride?: () => void;
  checking?: boolean;
}) {
  if (!warnings.length) return checking ? <p className="text-body-sm text-text-muted">Đang kiểm tra lịch xe/tài xế…</p> : null;
  return (
    <WarningPanel
      title={`${warnings.length} cảnh báo lịch xe/tài xế`}
      items={warnings.map((w) => overlapText(w))}
      action={
        onOverride ? (
          canOverride ? (
            <Button size="sm" variant="secondary" onClick={onOverride}>
              Tiếp tục và ghi lý do
            </Button>
          ) : (
            <span className="text-body-sm text-text-muted">Bạn không có quyền bỏ qua cảnh báo — đổi xe/tài xế/giờ hoặc nhờ admin.</span>
          )
        ) : null
      }
    />
  );
}

/** "YYYY-MM-DDTHH:mm" giờ máy cho input datetime-local. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fromLocalInput(v: string | null | undefined): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Ngày hôm nay YYYY-MM-DD giờ máy. */
export function todayIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Chạy mutation + toast; ném lại lỗi để form/modal giữ trạng thái. */
export async function runAction<T>(fn: () => Promise<T>, ok: string, failTitle = 'Không thực hiện được'): Promise<T> {
  try {
    const r = await fn();
    toast.success(ok);
    return r;
  } catch (e) {
    toast.error(failTitle, apolloErrorMessage(e));
    throw e;
  }
}

export function useNow(intervalMs = 60_000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** Thời gian tương đối ngắn: "5 phút trước". */
export function ago(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '—';
  const m = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.round(h / 24)} ngày trước`;
}
