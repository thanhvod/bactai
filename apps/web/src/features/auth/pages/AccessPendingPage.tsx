import * as React from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Button, Banner } from '@bta/shadcn';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import { AuthLayout } from './AuthLayout';

/** WM-AUTH-04 — tài khoản Google chưa thuộc merchant nào. */
export default function AccessPendingPage() {
  const { account, memberships, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(false);
  if (memberships.length > 0) return <Navigate to={PATHS.selectMerchant} replace />;
  return (
    <AuthLayout title="Chưa có quyền truy cập" subtitle={<>Tài khoản <strong>{account?.email}</strong> chưa thuộc nhà xe nào.</>}>
      <Banner tone="info" message="Nhờ admin nhà xe mời email này vào nhân viên, hoặc tạo nhà xe mới nếu bạn là chủ nhà xe." />
      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          loading={checking}
          onClick={async () => {
            setChecking(true);
            try {
              await refresh();
            } finally {
              setChecking(false);
            }
          }}
        >
          Kiểm tra lại lời mời
        </Button>
        <Button onClick={() => navigate(PATHS.onboarding)}>Tạo nhà xe mới</Button>
        <Button variant="ghost" onClick={() => void logout().then(() => navigate(PATHS.login))}>
          Đăng nhập tài khoản khác
        </Button>
      </div>
    </AuthLayout>
  );
}
