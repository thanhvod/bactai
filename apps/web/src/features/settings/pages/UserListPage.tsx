import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { MoreHorizontal, Plus, ShieldCheck } from 'lucide-react';
import { Button, DataTable, Dialog, EmptyState, ErrorState, FilterBar, FilterChip, IconButton, Menu, PageHeader, Pagination, StatusBadge, toast } from '@bta/shadcn';
import { MEMBER_STATUS, MERCHANT_ROLE_LABEL, MERCHANT_ROLES, formatDate, formatDateTime } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { InviteUserDrawer } from '../components/InviteUserDrawer';
import { LockMerchantUserMutation, MerchantUsersQuery, ResendInviteMutation, UnlockMerchantUserMutation } from '../graphql/settings';

type UserRow = { id: string; name: string; email: string; role: string; status: string; lastAccessAt?: string | null; joinedAt?: string | null; invitedAt: string; invitedByName?: string | null; isSelf: boolean };

/** WM-USER-01 — Danh sách nhân viên (admin). `inviteOpen` = WM-USER-03 drawer trên list (route /settings/users/new). */
export function UserList({ inviteOpen = false }: { inviteOpen?: boolean }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const role = params.get('role');
  const status = params.get('status');
  const [pageSize, setPageSize] = React.useState(20);
  const [cursors, setCursors] = React.useState<(string | null)[]>([null]);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  React.useEffect(() => setCursors([null]), [debounced, role, status, pageSize]);
  const { data, loading, error, refetch } = useQuery(MerchantUsersQuery, {
    variables: { filter: { search: debounced || null, role: role || null, status: status || null }, first: pageSize, after: cursors[cursors.length - 1] },
  });
  const [lock] = useMutation(LockMerchantUserMutation);
  const [unlock] = useMutation(UnlockMerchantUserMutation);
  const [resend] = useMutation(ResendInviteMutation);
  const [confirm, setConfirm] = React.useState<{ user: UserRow; action: 'lock' | 'unlock' } | null>(null);
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next);
  };
  const rows = (data?.merchantUsers.nodes ?? []) as UserRow[];
  const filtered = !!(debounced || role || status);

  const doConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.action === 'lock') await lock({ variables: { id: confirm.user.id } });
      else await unlock({ variables: { id: confirm.user.id } });
      toast.success(confirm.action === 'lock' ? `Đã khóa ${confirm.user.name}` : `Đã mở khóa ${confirm.user.name}`);
      setConfirm(null);
      void refetch();
    } catch (e) {
      toast.error('Không thực hiện được', apolloErrorMessage(e));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Nhân viên"
        subtitle="Nhân viên đăng nhập bằng Google; vai trò quyết định quyền thao tác."
        breadcrumb={[{ label: 'Cài đặt', to: PATHS.settingsCompany }, { label: 'Nhân viên' }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(PATHS.settingsRoles)}>
              <ShieldCheck /> Vai trò & quyền
            </Button>
            <Button onClick={() => navigate(PATHS.settingsUserNew)}>
              <Plus /> Mời nhân viên
            </Button>
          </>
        }
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm tên, email"
        chips={
          <>
            {MERCHANT_ROLES.map((r) => (
              <FilterChip key={r} label={MERCHANT_ROLE_LABEL[r]} active={role === r} onClick={() => setParam('role', role === r ? null : r)} />
            ))}
            {Object.entries(MEMBER_STATUS).map(([k, v]) => (
              <FilterChip key={k} label={v.label} active={status === k} onClick={() => setParam('status', status === k ? null : k)} />
            ))}
          </>
        }
      />
      {error ? (
        <ErrorState title="Không tải được danh sách nhân viên" error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          loading={loading && !data}
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate(paths.settingsUser(r.id))}
          rowClassName={(r) => (r.status === 'LOCKED' ? 'opacity-60' : undefined)}
          empty={
            filtered ? (
              <EmptyState message="Không có nhân viên khớp bộ lọc" action={<Button variant="secondary" onClick={() => { setSearch(''); setParams(new URLSearchParams()); }}>Xóa bộ lọc</Button>} />
            ) : (
              <EmptyState message="Chưa có nhân viên khác" action={<Button onClick={() => navigate(PATHS.settingsUserNew)}>Mời nhân viên</Button>} />
            )
          }
          columns={[
            {
              key: 'name',
              label: 'Nhân viên',
              render: (r) => (
                <div className="flex flex-col">
                  <span className="font-medium">
                    {r.name} {r.isSelf ? <span className="text-caption text-text-subtle">(bạn)</span> : null}
                  </span>
                  <span className="text-caption text-text-muted">{r.email}</span>
                </div>
              ),
            },
            { key: 'role', label: 'Vai trò', render: (r) => MERCHANT_ROLE_LABEL[r.role as keyof typeof MERCHANT_ROLE_LABEL] ?? r.role },
            { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={MEMBER_STATUS} status={r.status} /> },
            { key: 'last', label: 'Truy cập gần nhất', render: (r) => (r.lastAccessAt ? formatDateTime(r.lastAccessAt) : '—'), hideBelow: 'md' },
            { key: 'joined', label: 'Tham gia', render: (r) => (r.joinedAt ? formatDate(r.joinedAt) : `Mời ${formatDate(r.invitedAt)}`), hideBelow: 'lg' },
            { key: 'invitedBy', label: 'Người mời', render: (r) => r.invitedByName ?? '—', hideBelow: 'lg' },
            {
              key: 'menu',
              label: '',
              align: 'right',
              render: (r) => (
                <span onClick={(e) => e.stopPropagation()}>
                  <Menu
                    trigger={<IconButton label="Thao tác" tooltip={false}><MoreHorizontal /></IconButton>}
                    items={[
                      { key: 'open', label: 'Xem chi tiết', onSelect: () => navigate(paths.settingsUser(r.id)) },
                      ...(r.status === 'INVITED'
                        ? [{ key: 'resend', label: 'Gửi lại lời mời', onSelect: () => void resend({ variables: { id: r.id } }).then(() => toast.success('Đã gửi lại lời mời')).catch((e) => toast.error('Không gửi được', apolloErrorMessage(e))) }]
                        : []),
                      r.status === 'LOCKED'
                        ? { key: 'unlock', label: 'Mở khóa', onSelect: () => setConfirm({ user: r, action: 'unlock' }) }
                        : { key: 'lock', label: 'Khóa tài khoản', danger: true, disabled: r.isSelf, onSelect: () => setConfirm({ user: r, action: 'lock' }) },
                    ]}
                  />
                </span>
              ),
            },
          ]}
        />
      )}
      <Pagination
        hasNextPage={!!data?.merchantUsers.pageInfo.hasNextPage}
        hasPrevPage={cursors.length > 1}
        onNext={() => setCursors([...cursors, data?.merchantUsers.pageInfo.endCursor ?? null])}
        onPrev={() => setCursors(cursors.slice(0, -1))}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        shown={rows.length}
        total={data?.merchantUsers.totalCount}
      />
      <InviteUserDrawer open={inviteOpen} onOpenChange={(o) => !o && navigate(PATHS.settingsUsers)} onInvited={() => void refetch()} />
      <Dialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.action === 'lock' ? `Khóa tài khoản ${confirm.user.name}?` : `Mở khóa ${confirm?.user.name ?? ''}?`}
        description={confirm?.action === 'lock' ? 'Nhân viên sẽ không truy cập được nhà xe này ngay lập tức. Dữ liệu và lịch sử được giữ nguyên.' : 'Nhân viên truy cập lại được theo vai trò hiện tại.'}
        danger={confirm?.action === 'lock'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Hủy
            </Button>
            <Button variant={confirm?.action === 'lock' ? 'destructive' : 'primary'} onClick={() => void doConfirm()}>
              {confirm?.action === 'lock' ? 'Khóa tài khoản' : 'Mở khóa'}
            </Button>
          </>
        }
      />
    </div>
  );
}

export default function UserListPage() {
  return (
    <RequirePermission permission="users.manage">
      <UserList />
    </RequirePermission>
  );
}
