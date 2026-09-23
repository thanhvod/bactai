import { RequirePermission } from '@/app/auth/guards';
import { UserList } from './UserListPage';

/** WM-USER-03 — Mời nhân viên: drawer mở trên danh sách nhân viên (route /settings/users/new). */
export default function UserInvitePage() {
  return (
    <RequirePermission permission="users.manage">
      <UserList inviteOpen />
    </RequirePermission>
  );
}
