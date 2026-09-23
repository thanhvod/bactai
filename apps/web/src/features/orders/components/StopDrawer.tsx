import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { CheckCircle2, MapPinned, SkipForward, Wallet } from 'lucide-react';
import {
  AttachmentList,
  Button,
  DescriptionList,
  Drawer,
  EmptyState,
  ErrorState,
  FormField,
  MoneyCell,
  MoneyInput,
  SensitiveActionModal,
  Skeleton,
  StatusBadge,
  StatusStepper,
  Textarea,
  Timeline,
  toast,
} from '@bta/shadcn';
import { STOP_STATUS, STOP_TYPE, formatDateTime, formatVnd, labelOf } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { apolloErrorMessage } from '@/lib/apollo';
import { OrderStopDetailQuery, StopCodMutation, StopStatusMutation } from '../graphql/orders';
import { errorCode } from './common';

/**
 * WM-STOP-01 — Chi tiết điểm dừng (drawer trên đơn/chuyến): trạng thái, COD dự kiến/thực thu, POD, lịch sử.
 * Sửa COD đã có → thao tác nhạy cảm (cod.update + lý do).
 */
export function StopDrawer({ stopId, tripId, open, onOpenChange, onChanged }: { stopId: string | null; tripId?: string | null; open: boolean; onOpenChange: (o: boolean) => void; onChanged?: () => void }) {
  const { hasPermission } = useAuth();
  const { data, loading, error, refetch } = useQuery(OrderStopDetailQuery, { variables: { id: stopId ?? '' }, skip: !stopId || !open });
  const [setStatus, { loading: settingStatus }] = useMutation(StopStatusMutation);
  const [setCod, { loading: savingCod }] = useMutation(StopCodMutation);
  const [cod, setCodValue] = React.useState<number | null>(null);
  const [codNote, setCodNote] = React.useState('');
  const [skipOpen, setSkipOpen] = React.useState(false);
  const [codReasonOpen, setCodReasonOpen] = React.useState(false);
  const s = data?.orderStop;

  React.useEffect(() => {
    setCodValue(s?.codActual ?? null);
    setCodNote(s?.codNote ?? '');
  }, [s?.id, s?.codActual, s?.codNote]);

  const canStatus = hasPermission('trip.status.update');
  const after = async () => {
    await refetch();
    onChanged?.();
  };
  const changeStatus = async (status: string, reason?: string) => {
    try {
      const r = await setStatus({ variables: { id: s!.id, status, reason: reason ?? null, tripId: tripId ?? s!.tripIds[0] ?? null } });
      toast.success(`Điểm ${s!.sequence}: ${labelOf(STOP_STATUS, status)}`);
      for (const w of r.data?.updateStopStatus.warnings ?? []) toast.warning(w);
      await after();
    } catch (e) {
      toast.error('Không cập nhật được điểm dừng', apolloErrorMessage(e));
      throw e;
    }
  };
  const saveCod = async (reason?: string) => {
    if (cod == null) return toast.error('Nhập số COD thực thu');
    try {
      const r = await setCod({ variables: { id: s!.id, amount: cod, reason: reason ?? null, note: codNote || null } });
      toast.success(`Đã lưu COD thực thu ${formatVnd(cod)}`);
      for (const w of r.data?.updateStopCodActual.warnings ?? []) toast.warning(w);
      await after();
    } catch (e) {
      if (errorCode(e) === 'SENSITIVE_REASON_REQUIRED') {
        setCodReasonOpen(true);
        return;
      }
      toast.error('Không lưu được COD', apolloErrorMessage(e));
      throw e;
    }
  };

  const isEditCod = s?.codActual != null;
  const canCod = isEditCod ? hasPermission('cod.update') : canStatus;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} width={720} title={s ? `Điểm ${s.sequence} · ${labelOf(STOP_TYPE, s.type)}` : 'Điểm dừng'} description={s ? `${s.orderCode ?? ''}${s.tripCodes.length ? ` · chuyến ${s.tripCodes.join(', ')}` : ''}` : undefined}>
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : loading && !s ? (
        <div className="flex flex-col gap-3">
          <Skeleton h={24} w="60%" />
          <Skeleton h={120} />
        </div>
      ) : !s ? (
        <EmptyState message="Không tìm thấy điểm dừng" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge meta={STOP_STATUS} status={s.status} />
            <StatusBadge meta={STOP_TYPE} status={s.type} outline />
            {s.skipReason ? <span className="text-body-sm text-warning">Lý do bỏ qua: {s.skipReason}</span> : null}
          </div>
          <StatusStepper
            current={s.status === 'SKIPPED' ? 'NOT_ARRIVED' : s.status}
            steps={[
              { key: 'NOT_ARRIVED', label: 'Chưa đến', at: s.plannedAt ? `DK ${formatDateTime(s.plannedAt)}` : undefined },
              { key: 'ARRIVED', label: 'Đã đến', at: s.arrivedAt ? formatDateTime(s.arrivedAt) : undefined },
              { key: 'COMPLETED', label: 'Hoàn thành', at: s.completedAt ? formatDateTime(s.completedAt) : undefined },
            ]}
          />
          <DescriptionList
            columns={2}
            items={[
              { label: 'Địa điểm', value: s.locationName, span: 2 },
              { label: 'Địa chỉ', value: s.address, span: 2 },
              { label: 'Người liên hệ', value: s.contactName },
              { label: 'SĐT', value: s.contactPhone ? <a className="text-accent" href={`tel:${s.contactPhone}`}>{s.contactPhone}</a> : null },
              { label: 'Giờ dự kiến', value: s.plannedAt ? formatDateTime(s.plannedAt) : null },
              { label: 'Ghi chú', value: s.note },
            ]}
          />
          {canStatus && s.status !== 'COMPLETED' ? (
            <div className="flex flex-wrap gap-2">
              {s.status === 'NOT_ARRIVED' || s.status === 'SKIPPED' ? (
                <Button variant="secondary" loading={settingStatus} onClick={() => void changeStatus('ARRIVED')}>
                  <MapPinned /> Đánh dấu đã đến
                </Button>
              ) : null}
              <Button loading={settingStatus} onClick={() => void changeStatus('COMPLETED')}>
                <CheckCircle2 /> Hoàn thành điểm
              </Button>
              {s.status !== 'SKIPPED' ? (
                <Button variant="ghost" onClick={() => setSkipOpen(true)}>
                  <SkipForward /> Bỏ qua điểm
                </Button>
              ) : null}
            </div>
          ) : null}
          {s.status === 'COMPLETED' && canStatus ? (
            <p className="text-body-sm text-text-muted">Đổi ngược trạng thái điểm đã hoàn thành cần quyền "Đổi trạng thái ngược" — dùng trên chuyến.</p>
          ) : null}

          <section className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <h3 className="flex items-center gap-2 text-heading-sm">
              <Wallet className="size-4" /> Thu hộ (COD)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-body-sm">
              <div>
                <div className="text-caption text-text-muted">Dự kiến</div>
                <MoneyCell value={s.codExpected} emptyText="Không thu hộ" />
              </div>
              <div>
                <div className="text-caption text-text-muted">Thực thu</div>
                <MoneyCell value={s.codActual} tone={s.codActual != null && s.codExpected != null && s.codActual !== s.codExpected ? 'warning' : 'default'} emptyText="Chưa nhập" />
              </div>
              <div>
                <div className="text-caption text-text-muted">Lúc thu</div>
                {s.codCollectedAt ? formatDateTime(s.codCollectedAt) : '—'}
              </div>
            </div>
            {canCod ? (
              <div className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
                <FormField label={isEditCod ? 'Sửa COD thực thu' : 'Nhập COD thực thu'}>
                  <MoneyInput value={cod} onChange={setCodValue} placeholder="0" />
                </FormField>
                <FormField label="Ghi chú">
                  <Textarea rows={1} value={codNote} onChange={(e) => setCodNote(e.target.value)} placeholder="VD: khách trả thiếu, hẹn trả sau" />
                </FormField>
                <Button loading={savingCod} disabled={cod == null || (cod === s.codActual && codNote === (s.codNote ?? ''))} onClick={() => (isEditCod ? setCodReasonOpen(true) : void saveCod())}>
                  Lưu COD
                </Button>
              </div>
            ) : isEditCod ? (
              <p className="text-caption text-text-muted">Sửa COD đã lưu cần quyền "Sửa COD thực thu".</p>
            ) : null}
            <p className="text-caption text-text-subtle">COD tài xế thu là tiền của khách gửi công ty — khi tài xế nộp về là thu hồi, không tính doanh thu.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-heading-sm">POD ({s.podCount})</h3>
            {s.podAttachments?.length ? (
              <AttachmentList
                items={s.podAttachments.map((a) => ({ id: a.id, fileName: a.fileName, category: a.category, categoryLabel: 'POD', mimeType: a.mimeType, size: a.size, url: a.url, thumbnailUrl: a.mimeType.startsWith('image/') ? a.url : null, uploadedByName: a.uploadedByName, capturedAt: a.capturedAt, createdAt: a.createdAt }))}
                onOpen={(a) => (a.url ? window.open(a.url, '_blank') : undefined)}
              />
            ) : (
              <p className="text-body-sm text-text-muted">Chưa có ảnh POD — tài xế chụp trên app khi trả hàng.</p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-heading-sm">Lịch sử trạng thái</h3>
            <Timeline
              entries={(s.statusHistory ?? []).map((h) => ({ id: h.id, time: formatDateTime(h.createdAt), actor: h.actorName ?? 'Hệ thống', action: h.summary, reason: h.reason ?? undefined, tone: 'neutral' as const }))}
              emptyText="Chưa đổi trạng thái"
            />
          </section>
        </div>
      )}
      <SensitiveActionModal
        open={skipOpen}
        onOpenChange={setSkipOpen}
        action={`Bỏ qua điểm ${s?.sequence ?? ''}`}
        description="Điểm bị hủy/đổi giữa chừng. Lý do được lưu vào lịch sử."
        danger={false}
        confirmLabel="Bỏ qua điểm"
        loading={settingStatus}
        onConfirm={async (reason) => {
          await changeStatus('SKIPPED', reason);
          setSkipOpen(false);
        }}
      />
      <SensitiveActionModal
        open={codReasonOpen}
        onOpenChange={setCodReasonOpen}
        action={`Sửa COD thực thu điểm ${s?.sequence ?? ''}`}
        before={{ codActual: formatVnd(s?.codActual ?? 0) }}
        after={{ codActual: formatVnd(cod ?? 0) }}
        diffLabels={{ codActual: 'COD thực thu' }}
        warning="Sửa COD ảnh hưởng số tiền tài xế đang giữ; ghi audit trước/sau."
        confirmLabel="Lưu COD"
        loading={savingCod}
        onConfirm={async (reason) => {
          await saveCod(reason);
          setCodReasonOpen(false);
        }}
      />
    </Drawer>
  );
}
