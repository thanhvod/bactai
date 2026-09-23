import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { Banner, Button, Dialog, ErrorState, KpiCard, PageHeader, PermissionMatrix, Skeleton, toast } from '@bta/shadcn';
import { MERCHANT_ROLE_LABEL, PERMISSIONS, type Grant, type MerchantRole, type Permission } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { RolesQuery, UpdateRolePermissionMutation } from '../graphql/settings';

const GRANT_LABEL: Record<Grant, string> = { ALLOWED: 'Có quyền', GRANTABLE: 'Cần cấp thêm', DENIED: 'Không' };

/** WM-RBAC-01 — Vai trò & phân quyền (chỉ admin). Ô ma trận bấm để đổi: Có quyền → Cần cấp thêm → Không. */
export default function RolesPage() {
  return (
    <RequirePermission permission="users.manage">
      <RolesContent />
    </RequirePermission>
  );
}

function RolesContent() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const { data, loading, error, refetch } = useQuery(RolesQuery);
  const [update, { loading: saving }] = useMutation(UpdateRolePermissionMutation);
  const [pending, setPending] = React.useState<{ permission: Permission; role: MerchantRole; grant: Grant; from: Grant } | null>(null);
  const [editable, setEditable] = React.useState(false);

  const overrides = React.useMemo(() => {
    const o: Partial<Record<Permission, Partial<Record<MerchantRole, Grant>>>> = {};
    for (const r of data?.permissionMatrix ?? []) o[r.action as Permission] = { ADMIN: r.admin as Grant, OPERATION: r.operation as Grant, ACCOUNTANT: r.accountant as Grant };
    return o;
  }, [data]);
  const granted = React.useMemo(() => Object.fromEntries((data?.permissionMatrix ?? []).map((r) => [r.action, r.grantedUserCount])), [data]);

  const apply = async () => {
    if (!pending) return;
    try {
      await update({ variables: { role: pending.role, permission: pending.permission, grant: pending.grant } });
      toast.success('Đã cập nhật quyền', `${PERMISSIONS[pending.permission].label} · ${MERCHANT_ROLE_LABEL[pending.role]}: ${GRANT_LABEL[pending.grant]}`);
      setPending(null);
      void refetch();
      void refresh();
    } catch (e) {
      toast.error('Không cập nhật được quyền', apolloErrorMessage(e));
    }
  };

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Vai trò & phân quyền"
        subtitle="Ma trận quyền theo vai trò. “Cần cấp thêm” nghĩa là vai trò chưa có quyền, admin có thể cấp riêng cho từng nhân viên."
        breadcrumb={[{ label: 'Cài đặt', to: PATHS.settingsCompany }, { label: 'Vai trò & quyền' }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(PATHS.settingsUsers)}>
              Cấp quyền cho nhân viên
            </Button>
            <Button variant={editable ? 'primary' : 'secondary'} onClick={() => setEditable((v) => !v)}>
              {editable ? 'Xong chỉnh sửa' : 'Chỉnh ma trận'}
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {loading && !data
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} h={88} />)
          : (data?.roles ?? []).map((r) => <KpiCard key={r.key} label={r.name} value={`${r.userCount} nhân viên`} sub="Xem nhân viên theo vai trò" to={`${PATHS.settingsUsers}?role=${r.key}`} />)}
      </div>
      <Banner tone="info" message="Hành động có nhãn “Cần lý do” luôn mở hộp xác nhận nhập lý do và ghi nhật ký. Backend vẫn là nơi kiểm tra quyền cuối cùng." />
      {loading && !data ? (
        <Skeleton h={400} />
      ) : (
        <PermissionMatrix
          overrides={overrides}
          grantedUserCount={granted}
          editable={editable}
          onChange={(permission, role, grant) => setPending({ permission, role, grant, from: overrides[permission]?.[role] ?? 'DENIED' })}
        />
      )}
      <Dialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="Đổi quyền vai trò?"
        description={pending ? `${PERMISSIONS[pending.permission].label} — ${MERCHANT_ROLE_LABEL[pending.role]}` : undefined}
        danger={!!pending && (PERMISSIONS[pending.permission] as { reason?: boolean }).reason === true}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPending(null)}>
              Hủy
            </Button>
            <Button onClick={() => void apply()} loading={saving}>
              Xác nhận
            </Button>
          </>
        }
      >
        {pending ? (
          <p className="text-body">
            {GRANT_LABEL[pending.from]} → <strong>{GRANT_LABEL[pending.grant]}</strong>. Áp dụng ngay cho mọi nhân viên có vai trò {MERCHANT_ROLE_LABEL[pending.role]}.
            {(PERMISSIONS[pending.permission] as { reason?: boolean }).reason ? ' Đây là thao tác nhạy cảm — hãy chắc chắn trước khi mở quyền.' : ''}
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}
