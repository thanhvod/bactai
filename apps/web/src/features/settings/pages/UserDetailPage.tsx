import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { History, Lock, LockOpen, Mail } from 'lucide-react';
import {
  Banner,
  Button,
  DescriptionList,
  DetailSkeleton,
  Dialog,
  EmptyState,
  EntityHeader,
  FormField,
  Input,
  RadioGroup,
  StatusBadge,
  Tabs,
  TabsContent,
  Textarea,
  Timeline,
  toast,
} from '@bta/shadcn';
import { MEMBER_STATUS, MERCHANT_ROLE_LABEL, MERCHANT_ROLES, PERMISSIONS, formatDate, formatDateTime, type Permission } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { ExtraPermissionsPicker } from '../components/ExtraPermissionsPicker';
import { StaffAppLoginSection } from '../components/StaffAppLoginSection';
import { LockMerchantUserMutation, MerchantUserQuery, ResendInviteMutation, UnlockMerchantUserMutation, UpdateMerchantUserMutation } from '../graphql/settings';

/** WM-USER-02 — Chi tiết nhân viên: hồ sơ, vai trò, quyền cấp thêm, hoạt động. */
export default function UserDetailPage() {
  return (
    <RequirePermission permission="users.manage">
      <UserDetail />
    </RequirePermission>
  );
}

function UserDetail() {
  const { userId = '' } = useParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const openTimeline = useTimelineDrawer();
  const [tab, setTab] = useQueryParam('tab');
  const { data, loading, error, refetch } = useQuery(MerchantUserQuery, { variables: { id: userId } });
  const [update, { loading: saving }] = useMutation(UpdateMerchantUserMutation);
  const [lock] = useMutation(LockMerchantUserMutation);
  const [unlock] = useMutation(UnlockMerchantUserMutation);
  const [resend] = useMutation(ResendInviteMutation);
  const [draft, setDraft] = React.useState<{ name: string; phone: string; title: string; role: string; extraPermissions: string[]; note: string } | null>(null);
  const [confirmLock, setConfirmLock] = React.useState(false);
  const u = data?.merchantUser;
  React.useEffect(() => {
    if (u) setDraft({ name: u.name, phone: u.phone ?? '', title: u.title ?? '', role: u.role, extraPermissions: u.extraPermissions, note: u.note ?? '' });
  }, [u]);

  if (error)
    return <EmptyState message="Không tìm thấy nhân viên hoặc bạn không có quyền" description={apolloErrorMessage(error)} action={<Button onClick={() => navigate(PATHS.settingsUsers)}>Về danh sách</Button>} />;
  if ((loading && !u) || !u || !draft) return <DetailSkeleton />;
  const dirty = draft.name !== u.name || draft.phone !== (u.phone ?? '') || draft.title !== (u.title ?? '') || draft.role !== u.role || draft.note !== (u.note ?? '') || draft.extraPermissions.slice().sort().join() !== u.extraPermissions.slice().sort().join();

  const save = async () => {
    try {
      await update({ variables: { id: u.id, input: { name: draft.name, phone: draft.phone || null, title: draft.title || null, role: draft.role, extraPermissions: draft.extraPermissions, note: draft.note || null } as never } });
      toast.success('Đã lưu thay đổi nhân viên');
      void refetch();
      if (u.isSelf) void refresh();
    } catch (e) {
      toast.error('Không lưu được', apolloErrorMessage(e));
    }
  };

  const toggleLock = async () => {
    try {
      if (u.status === 'LOCKED') await unlock({ variables: { id: u.id } });
      else await lock({ variables: { id: u.id } });
      toast.success(u.status === 'LOCKED' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
      setConfirmLock(false);
      void refetch();
    } catch (e) {
      toast.error('Không thực hiện được', apolloErrorMessage(e));
    }
  };

  const activity = (data?.activityByActor ?? []).map((a) => ({
    id: a.id,
    time: a.createdAt,
    actor: a.actorName ?? undefined,
    action: a.summary,
    reason: a.reason ?? undefined,
    tone: a.sensitive ? ('danger' as const) : ('neutral' as const),
    before: (a.before as Record<string, unknown>) ?? null,
    after: (a.after as Record<string, unknown>) ?? null,
  }));

  return (
    <div className="flex flex-col gap-4">
      <EntityHeader
        code={u.email}
        title={u.name}
        status={<StatusBadge meta={MEMBER_STATUS} status={u.status} />}
        subtitle={`${MERCHANT_ROLE_LABEL[u.role as keyof typeof MERCHANT_ROLE_LABEL] ?? u.role}${u.isSelf ? ' · tài khoản của bạn' : ''}`}
        metrics={[
          { label: 'Tham gia', value: u.joinedAt ? formatDate(u.joinedAt) : 'Chưa chấp nhận' },
          { label: 'Truy cập gần nhất', value: u.lastAccessAt ? formatDateTime(u.lastAccessAt) : '—' },
          { label: 'Quyền hiệu lực', value: u.effectivePermissions.length },
        ]}
        primaryAction={
          <Button onClick={() => void save()} disabled={!dirty} loading={saving}>
            Lưu thay đổi
          </Button>
        }
        secondaryActions={
          <>
            <Button variant="secondary" onClick={openTimeline}>
              <History /> Timeline
            </Button>
            {u.status === 'INVITED' ? (
              <Button variant="secondary" onClick={() => void resend({ variables: { id: u.id } }).then(() => toast.success('Đã gửi lại lời mời'))}>
                <Mail /> Gửi lại lời mời
              </Button>
            ) : null}
            {!u.isSelf ? (
              <Button variant={u.status === 'LOCKED' ? 'secondary' : 'destructive'} onClick={() => setConfirmLock(true)}>
                {u.status === 'LOCKED' ? <LockOpen /> : <Lock />} {u.status === 'LOCKED' ? 'Mở khóa' : 'Khóa tài khoản'}
              </Button>
            ) : null}
          </>
        }
      />
      {u.isSelf ? <Banner tone="info" message="Bạn không thể tự đổi vai trò hoặc tự khóa tài khoản của mình." /> : null}
      <Tabs
        items={[
          { value: 'profile', label: 'Hồ sơ & vai trò' },
          { value: 'permissions', label: 'Quyền', count: u.effectivePermissions.length },
          { value: 'activity', label: 'Hoạt động' },
        ]}
        value={tab ?? 'profile'}
        onValueChange={setTab}
      >
        <TabsContent value="profile">
          <div className="grid gap-4 xl:grid-cols-2">
            <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
              <h2 className="text-heading-sm">Hồ sơ</h2>
              <FormField label="Email (đăng nhập Google)">
                <Input value={u.email} readOnly disabled />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Họ tên" required>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </FormField>
                <FormField label="Số điện thoại">
                  <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </FormField>
              </div>
              <FormField label="Chức danh">
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </FormField>
              <FormField label="Ghi chú">
                <Textarea rows={2} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
              </FormField>
            </section>
            <StaffAppLoginSection userId={u.id} userName={u.name} defaultPhone={u.phone} appLogin={u.appLogin} onChanged={() => void refetch()} />
            <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
              <h2 className="text-heading-sm">Vai trò</h2>
              <RadioGroup
                value={draft.role}
                disabled={u.isSelf}
                onValueChange={(v) => setDraft({ ...draft, role: v, extraPermissions: [] })}
                options={MERCHANT_ROLES.map((r) => ({ value: r, label: MERCHANT_ROLE_LABEL[r] }))}
              />
              <Button variant="link" className="self-start" onClick={() => navigate(PATHS.settingsRoles)}>
                Xem quyền của vai trò
              </Button>
              <h3 className="text-body-strong">Quyền cấp thêm</h3>
              <ExtraPermissionsPicker role={draft.role} value={draft.extraPermissions} onChange={(v) => setDraft({ ...draft, extraPermissions: v })} />
              <DescriptionList
                columns={1}
                items={[{ label: 'Người mời', value: u.invitedByName ?? '—' }, { label: 'Ngày mời', value: formatDate(u.invitedAt) }]}
              />
            </section>
          </div>
        </TabsContent>
        <TabsContent value="permissions">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="mb-3 text-body-sm text-text-muted">Quyền hiệu lực = quyền của vai trò (theo ma trận nhà xe) + quyền cấp thêm.</p>
            <ul className="grid gap-1 md:grid-cols-2">
              {u.effectivePermissions.map((p) => (
                <li key={p} className="flex items-center gap-2 text-body-sm">
                  <span className="size-1.5 rounded-full bg-success" />
                  {PERMISSIONS[p as Permission]?.label ?? p}
                  {u.extraPermissions.includes(p) ? <span className="text-caption text-warning">cấp thêm</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="activity">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="mb-3 text-body-sm text-text-muted">30 thao tác gần nhất do nhân viên này thực hiện.</p>
            <Timeline entries={activity} />
          </div>
        </TabsContent>
      </Tabs>
      <TimelineDrawer entity={{ type: 'MERCHANT_USER', id: u.id, label: u.name }} title="Lịch sử thay đổi nhân viên" />
      <Dialog
        open={confirmLock}
        onOpenChange={setConfirmLock}
        title={u.status === 'LOCKED' ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?'}
        description={u.status === 'LOCKED' ? 'Nhân viên truy cập lại được theo vai trò hiện tại.' : 'Nhân viên mất quyền truy cập ngay; dữ liệu, lịch sử giữ nguyên.'}
        danger={u.status !== 'LOCKED'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmLock(false)}>
              Hủy
            </Button>
            <Button variant={u.status === 'LOCKED' ? 'primary' : 'destructive'} onClick={() => void toggleLock()}>
              Xác nhận
            </Button>
          </>
        }
      />
    </div>
  );
}
