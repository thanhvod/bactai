import * as React from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { Button, EmptyState, StatusBadge, toast, initials } from '@bta/shadcn';
import { MEMBER_STATUS, MERCHANT_ROLE_LABEL, formatDateTime } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { ACCEPT_INVITATION, type MeMembership } from '../graphql/me';
import { apolloErrorMessage } from '@/lib/apollo';
import { AuthLayout } from './AuthLayout';

/** WM-AUTH-03 — chọn nhà xe làm việc; membership INVITED có nút chấp nhận. */
export default function SelectMerchantPage() {
  const { memberships, current, selectMerchant, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [accept] = useMutation<{ acceptInvitation: MeMembership }>(ACCEPT_INVITATION);

  const choose = async (m: MeMembership) => {
    setBusy(m.id);
    try {
      await selectMerchant(m.merchantId);
      navigate(PATHS.dashboard, { replace: true });
    } catch (e) {
      toast.error('Không chọn được nhà xe', apolloErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };
  const doAccept = async (m: MeMembership) => {
    setBusy(m.id);
    try {
      await accept({ variables: { membershipId: m.id } });
      await refresh();
      toast.success('Đã tham gia nhà xe', m.merchantName);
    } catch (e) {
      toast.error('Không chấp nhận được lời mời', apolloErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AuthLayout title="Chọn nhà xe" subtitle="Tài khoản của bạn thuộc các nhà xe sau." width={520}>
      {memberships.length === 0 ? <EmptyState compact message="Bạn chưa thuộc nhà xe nào" /> : null}
      <ul className="flex flex-col gap-2">
        {memberships.map((m) => {
          const isCurrent = current?.merchantId === m.merchantId;
          return (
            <li key={m.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary-soft text-body-strong text-primary">{initials(m.merchantName)}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body-strong">{m.merchantName}</span>
                <span className="truncate text-caption text-text-subtle">
                  {m.merchantCode} · {MERCHANT_ROLE_LABEL[m.role]}
                  {m.lastAccessAt ? ` · truy cập ${formatDateTime(m.lastAccessAt)}` : ''}
                </span>
              </span>
              <StatusBadge meta={MEMBER_STATUS} status={m.status} />
              {m.status === 'ACTIVE' ? (
                <Button size="sm" variant={isCurrent ? 'secondary' : 'primary'} onClick={() => choose(m)} loading={busy === m.id}>
                  {isCurrent ? 'Đang dùng' : 'Chọn'}
                </Button>
              ) : m.status === 'INVITED' ? (
                <Button size="sm" onClick={() => doAccept(m)} loading={busy === m.id}>
                  Chấp nhận lời mời
                </Button>
              ) : (
                <Button size="sm" variant="secondary" disabled>
                  Đã khóa
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-2">
        <Button variant="link" onClick={() => navigate(PATHS.onboarding)}>
          Tạo nhà xe mới
        </Button>
        <Button variant="ghost" onClick={() => void logout().then(() => navigate(PATHS.login))}>
          Đăng xuất
        </Button>
      </div>
    </AuthLayout>
  );
}
