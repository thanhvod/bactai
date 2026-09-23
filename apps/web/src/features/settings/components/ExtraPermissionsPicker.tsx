import { Checkbox } from '@bta/shadcn';
import { MERCHANT_ROLES, PERMISSION_GROUPS, PERMISSION_KEYS, PERMISSIONS, defaultGrant, type MerchantRole, type Permission } from '@bta/shared';

/** Chọn quyền cấp thêm cho nhân viên: chỉ liệt kê quyền mà vai trò chưa có mặc định (GRANTABLE/DENIED). */
export function ExtraPermissionsPicker({ role, value, onChange, disabled }: { role: string; value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const r = (MERCHANT_ROLES.includes(role as MerchantRole) ? role : 'OPERATION') as MerchantRole;
  const candidates = PERMISSION_KEYS.filter((p) => defaultGrant(p, r) !== 'ALLOWED');
  if (r === 'ADMIN' || candidates.length === 0) return <p className="text-body-sm text-text-muted">Vai trò này đã có toàn quyền.</p>;
  const groups = Object.keys(PERMISSION_GROUPS) as (keyof typeof PERMISSION_GROUPS)[];
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => {
        const items = candidates.filter((p) => PERMISSIONS[p].group === g);
        if (!items.length) return null;
        return (
          <div key={g}>
            <p className="mb-1 text-caption font-medium uppercase text-text-subtle">{PERMISSION_GROUPS[g]}</p>
            <div className="flex flex-col gap-1">
              {items.map((p: Permission) => (
                <label key={p} className="flex items-center gap-2 text-body-sm">
                  <Checkbox
                    checked={value.includes(p)}
                    disabled={disabled}
                    onCheckedChange={(c) => onChange(c ? [...value, p] : value.filter((x) => x !== p))}
                  />
                  <span>{PERMISSIONS[p].label}</span>
                  {defaultGrant(p, r) === 'GRANTABLE' ? <span className="text-caption text-warning">cần cấp thêm</span> : null}
                  {(PERMISSIONS[p] as { reason?: boolean }).reason ? <span className="text-caption text-danger">cần lý do</span> : null}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
