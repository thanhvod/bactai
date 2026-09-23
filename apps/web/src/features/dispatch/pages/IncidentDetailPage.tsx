import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { CheckCircle2, History, Play, UserCheck, XCircle } from 'lucide-react';
import {
  Banner,
  Breadcrumb,
  Button,
  DescriptionList,
  DetailSkeleton,
  Dialog,
  EmptyState,
  EntityHeader,
  ErrorState,
  FormField,
  Select,
  SensitiveActionModal,
  StatusBadge,
  Textarea,
  toast,
  type MenuItemDef,
} from '@bta/shadcn';
import { INCIDENT_SEVERITY, INCIDENT_STATUS, formatDateTime } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { AttachmentsPanel } from '@/features/shared/AttachmentsPanel';
import { EntityTimeline, TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { AssignIncidentMutation, CancelIncidentMutation, CloseIncidentMutation, IncidentDetailQuery, StaffOptionsQuery, UpdateIncidentMutation } from '../graphql/dispatch';

/** WM-INC-01 — Chi tiết sự cố: cập nhật xử lý, gán người, đóng (ghi chú bắt buộc), ảnh/chứng từ, timeline. */
export default function IncidentDetailPage() {
  return (
    <RequirePermission permission="order.view">
      <IncidentDetail />
    </RequirePermission>
  );
}

function IncidentDetail() {
  const { incidentId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(IncidentDetailQuery, { variables: { id: incidentId } });
  const { data: staff } = useQuery(StaffOptionsQuery);
  const [update, { loading: updating }] = useMutation(UpdateIncidentMutation);
  const [assign, { loading: assigning }] = useMutation(AssignIncidentMutation);
  const [close, { loading: closing }] = useMutation(CloseIncidentMutation);
  const [cancel, { loading: cancelling }] = useMutation(CancelIncidentMutation);
  const [closeOpen, setCloseOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [assignee, setAssignee] = React.useState('');

  if (error) {
    return /Không tìm thấy/.test(error.message) ? (
      <EmptyState message="Không tìm thấy sự cố" action={<Button onClick={() => navigate(PATHS.incidents)}>Quay lại danh sách</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const i = data?.incident;
  if (!i) return null;
  const canManage = hasPermission('incident.manage');
  const active = i.status === 'OPEN' || i.status === 'IN_PROGRESS';
  const handlers = (staff?.staffOptions ?? []).filter((u) => u.effectivePermissions.includes('incident.manage'));

  const setStatus = async (status: string) => {
    try {
      await update({ variables: { id: i.id, input: { title: i.title, severity: i.severity, typeId: i.typeId ?? null, status } } });
      toast.success('Đã cập nhật sự cố');
      void refetch();
    } catch (e) {
      toast.error('Không cập nhật được', apolloErrorMessage(e));
    }
  };
  const setSeverity = async (severity: string) => {
    try {
      await update({ variables: { id: i.id, input: { title: i.title, severity, typeId: i.typeId ?? null } } });
      void refetch();
    } catch (e) {
      toast.error('Không cập nhật được', apolloErrorMessage(e));
    }
  };

  const menu: MenuItemDef[] = [
    ...(canManage && i.status === 'OPEN' ? [{ key: 'progress', label: 'Nhận xử lý', icon: <Play />, onSelect: () => void setStatus('IN_PROGRESS') }] : []),
    { key: 'timeline', label: 'Timeline', icon: <History />, onSelect: openTimeline },
    ...(canManage && active ? [{ key: 'cancel', label: 'Hủy sự cố (báo nhầm)', icon: <XCircle />, danger: true, separatorBefore: true, onSelect: () => setCancelOpen(true) }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Sự cố', to: PATHS.incidents }, { label: i.code }]} />
      <EntityHeader
        code={i.code}
        title={i.title}
        status={
          <span className="flex gap-1.5">
            <StatusBadge meta={INCIDENT_STATUS} status={i.status} />
            <StatusBadge meta={INCIDENT_SEVERITY} status={i.severity} />
          </span>
        }
        subtitle={[i.typeName, `Báo bởi ${i.reportedByName ?? (i.reportedByType === 'DRIVER' ? 'tài xế' : 'nhân viên')} lúc ${formatDateTime(i.createdAt)}`].filter(Boolean).join(' · ')}
        metrics={[
          { label: 'Đơn', value: i.orderId ? <CellLink to={paths.order(i.orderId)}>{i.orderCode}</CellLink> : '—' },
          { label: 'Chuyến', value: i.tripId ? <CellLink to={paths.trip(i.tripId)}>{i.tripCode}</CellLink> : '—' },
          { label: 'Người xử lý', value: i.assigneeName ?? 'Chưa gán' },
        ]}
        primaryAction={
          canManage && active ? (
            <Button onClick={() => setCloseOpen(true)}>
              <CheckCircle2 /> Đóng sự cố
            </Button>
          ) : null
        }
        menu={menu}
      />
      {i.status === 'RESOLVED' ? <Banner tone="success" message={`Đã xử lý lúc ${i.resolvedAt ? formatDateTime(i.resolvedAt) : '—'}: ${i.resolvedNote ?? ''}`} /> : null}
      {i.status === 'CANCELLED' ? <Banner tone="neutral" message={`Sự cố đã hủy${i.resolvedNote ? `: ${i.resolvedNote}` : ''}`} /> : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Panel title="Mô tả">
            <DescriptionList
              columns={2}
              items={[
                { label: 'Mô tả', value: i.description ?? 'Chưa có mô tả', span: 2 },
                { label: 'Vị trí', value: i.location },
                { label: 'Xe', value: i.vehicleId ? <CellLink to={paths.vehicle(i.vehicleId)}>{i.vehiclePlate}</CellLink> : null },
                { label: 'Tài xế', value: i.driverId ? <span><CellLink to={paths.driver(i.driverId)}>{i.driverName}</CellLink>{i.driverPhone ? <> · <a className="text-accent" href={`tel:${i.driverPhone}`}>{i.driverPhone}</a></> : null}</span> : null },
                { label: 'Cập nhật', value: formatDateTime(i.updatedAt) },
              ]}
            />
          </Panel>
          <AttachmentsPanel entityType="INCIDENT" entityId={i.id} category="INCIDENT_PHOTO" canUpload={canManage} emptyText="Chưa có ảnh/chứng từ sự cố" />
          <Panel title="Hoạt động">
            <EntityTimeline entity={{ type: 'INCIDENT', id: i.id }} compact />
          </Panel>
        </div>
        <div className="flex flex-col gap-4">
          {canManage && active ? (
            <Panel title="Xử lý">
              <div className="flex flex-col gap-3">
                <FormField label="Người xử lý">
                  <div className="flex gap-2">
                    <Select value={assignee || i.assigneeUserId || ''} onValueChange={setAssignee} placeholder="Chọn người" options={handlers.map((u) => ({ value: u.id, label: u.name }))} />
                    <Button
                      variant="secondary"
                      loading={assigning}
                      disabled={!assignee || assignee === i.assigneeUserId}
                      onClick={async () => {
                        try {
                          await assign({ variables: { id: i.id, userId: assignee } });
                          toast.success('Đã gán người xử lý — họ nhận thông báo');
                          void refetch();
                        } catch (e) {
                          toast.error('Không gán được', apolloErrorMessage(e));
                        }
                      }}
                    >
                      <UserCheck /> Gán
                    </Button>
                  </div>
                </FormField>
                <FormField label="Mức độ">
                  <Select value={i.severity} onValueChange={(v) => void setSeverity(v)} options={Object.entries(INCIDENT_SEVERITY).map(([value, m]) => ({ value, label: m.label }))} />
                </FormField>
                {i.status === 'OPEN' ? (
                  <Button variant="secondary" loading={updating} onClick={() => void setStatus('IN_PROGRESS')}>
                    <Play /> Chuyển sang đang xử lý
                  </Button>
                ) : null}
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
      <TimelineDrawer entity={{ type: 'INCIDENT', id: i.id, label: i.code }} />
      <Dialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title={`Đóng sự cố ${i.code}`}
        description="Ghi chú xử lý là bắt buộc — lưu vào lịch sử để đối chiếu sau."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCloseOpen(false)}>
              Hủy
            </Button>
            <Button
              loading={closing}
              disabled={note.trim().length < 5}
              onClick={async () => {
                try {
                  await close({ variables: { id: i.id, note: note.trim() } });
                  toast.success('Đã đóng sự cố');
                  setCloseOpen(false);
                  void refetch();
                } catch (e) {
                  toast.error('Không đóng được', apolloErrorMessage(e));
                }
              }}
            >
              <CheckCircle2 /> Đóng sự cố
            </Button>
          </>
        }
      >
        <FormField label="Ghi chú xử lý" required hint="Tối thiểu 5 ký tự">
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Đã thay lốp, xe chạy tiếp lúc 10:30…" />
        </FormField>
      </Dialog>
      <SensitiveActionModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        action={`Hủy sự cố ${i.code}`}
        description="Dùng khi báo nhầm/trùng. Sự cố vẫn lưu lịch sử."
        confirmLabel="Hủy sự cố"
        loading={cancelling}
        onConfirm={async (reason) => {
          try {
            await cancel({ variables: { id: i.id, reason } });
            toast.success('Đã hủy sự cố');
            setCancelOpen(false);
            void refetch();
          } catch (e) {
            toast.error('Không hủy được', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
