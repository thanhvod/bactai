import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { MIN_REASON_LENGTH } from '@bta/shared';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { FormField } from './form-field';
import { AuditDiff } from './timeline';

export interface SensitiveActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tên thao tác: "Hủy đơn DH-202609-0001" */
  action: React.ReactNode;
  description?: React.ReactNode;
  /** Dữ liệu bị ảnh hưởng (danh sách ngắn) */
  affected?: React.ReactNode[];
  /** Diff trước/sau nếu có */
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  diffLabels?: Record<string, string>;
  warning?: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
}

/** Modal thao tác nhạy cảm (WM-SHELL-08): lý do bắt buộc ≥ MIN_REASON_LENGTH, ghi audit ở backend. */
export function SensitiveActionModal({ open, onOpenChange, action, description, affected, before, after, diffLabels, warning, confirmLabel = 'Xác nhận', danger = true, loading, onConfirm }: SensitiveActionModalProps) {
  const [reason, setReason] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  React.useEffect(() => {
    if (!open) {
      setReason('');
      setTouched(false);
    }
  }, [open]);
  const valid = reason.trim().length >= MIN_REASON_LENGTH;
  const error = touched && !valid ? `Lý do tối thiểu ${MIN_REASON_LENGTH} ký tự` : undefined;
  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    await onConfirm(reason.trim());
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={action}
      description={description ?? 'Thao tác này được ghi vào nhật ký kèm lý do và người thực hiện.'}
      danger={danger}
      modalStrict
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Quay lại
          </Button>
          <Button variant={danger ? 'destructive' : 'primary'} onClick={submit} loading={loading} disabled={!valid && touched}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {warning ? (
          <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning-soft px-3 py-2 text-body-sm text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{warning}</span>
          </div>
        ) : null}
        {affected?.length ? (
          <div>
            <p className="mb-1 text-caption text-text-muted">Dữ liệu bị ảnh hưởng</p>
            <ul className="list-disc pl-5 text-body-sm">
              {affected.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {before || after ? <AuditDiff before={before ?? {}} after={after ?? {}} labels={diffLabels} /> : null}
        <FormField label="Lý do" required error={error} hint="Ghi rõ vì sao thay đổi để đối chiếu sau này.">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={3}
            autoFocus
            aria-invalid={!!error}
            placeholder="Ví dụ: Khách đổi lịch sản xuất, xác nhận qua Zalo lúc 14:30"
          />
        </FormField>
      </div>
    </Dialog>
  );
}

/** Hook tiện dụng: mở modal cho một action, trả về props để spread. */
export function useSensitiveAction<T = void>(run: (reason: string, payload: T) => Promise<void> | void) {
  const [state, setState] = React.useState<{ open: boolean; payload?: T; loading: boolean }>({ open: false, loading: false });
  return {
    open: (payload: T) => setState({ open: true, payload, loading: false }),
    modalProps: {
      open: state.open,
      loading: state.loading,
      onOpenChange: (o: boolean) => setState((s) => ({ ...s, open: o })),
      onConfirm: async (reason: string) => {
        setState((s) => ({ ...s, loading: true }));
        try {
          await run(reason, state.payload as T);
          setState({ open: false, loading: false });
        } catch (e) {
          setState((s) => ({ ...s, loading: false }));
          throw e;
        }
      },
    },
    payload: state.payload,
  };
}
