import * as React from 'react';
import { Check, X, ShieldQuestion } from 'lucide-react';
import { MERCHANT_ROLES, MERCHANT_ROLE_LABEL, PERMISSIONS, PERMISSION_GROUPS, PERMISSION_KEYS, defaultGrant, type Grant, type MerchantRole, type Permission } from '@bta/shared';
import { Badge } from '../ui/badge';
import { cn } from '../lib/utils';

export interface PermissionMatrixProps {
  /** Ghi đè theo merchant: permission → role → grant */
  overrides?: Partial<Record<Permission, Partial<Record<MerchantRole, Grant>>>>;
  onChange?: (permission: Permission, role: MerchantRole, grant: Grant) => void;
  editable?: boolean;
  grantedUserCount?: Partial<Record<Permission, number>>;
  className?: string;
}

const cycle: Record<Grant, Grant> = { ALLOWED: 'GRANTABLE', GRANTABLE: 'DENIED', DENIED: 'ALLOWED' };

function GrantCell({ grant, onClick }: { grant: Grant; onClick?: () => void }) {
  const inner =
    grant === 'ALLOWED' ? <Check className="size-4 text-success" /> : grant === 'GRANTABLE' ? <ShieldQuestion className="size-4 text-warning" /> : <X className="size-4 text-text-subtle" />;
  const label = grant === 'ALLOWED' ? 'Có quyền' : grant === 'GRANTABLE' ? 'Cần cấp thêm' : 'Không';
  return (
    <button type="button" onClick={onClick} disabled={!onClick} title={label} aria-label={label} className={cn('inline-flex h-8 w-full items-center justify-center gap-1 rounded-sm text-caption', onClick && 'hover:bg-surface-muted')}>
      {inner}
      <span className="sr-only sm:not-sr-only sm:text-text-muted">{label}</span>
    </button>
  );
}

/** Ma trận quyền theo role (WM-RBAC-01): ✓ / cần cấp thêm / ✗; hành động nhạy cảm đánh dấu "Cần lý do". */
export function PermissionMatrix({ overrides, onChange, editable, grantedUserCount, className }: PermissionMatrixProps) {
  const groups = Object.keys(PERMISSION_GROUPS) as (keyof typeof PERMISSION_GROUPS)[];
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border bg-surface', className)}>
      <table className="w-full min-w-[720px] text-body">
        <thead className="sticky top-0 bg-surface-muted text-body-sm text-text-muted">
          <tr>
            <th className="h-10 px-3 text-left font-medium">Hành động</th>
            {MERCHANT_ROLES.map((r) => (
              <th key={r} className="h-10 w-36 px-2 text-center font-medium">
                {MERCHANT_ROLE_LABEL[r]}
              </th>
            ))}
            <th className="h-10 w-28 px-2 text-center font-medium">Lý do</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <React.Fragment key={g}>
              <tr className="bg-surface-muted/60">
                <td colSpan={MERCHANT_ROLES.length + 2} className="px-3 py-1.5 text-caption font-semibold uppercase tracking-wide text-text-subtle">
                  {PERMISSION_GROUPS[g]}
                </td>
              </tr>
              {PERMISSION_KEYS.filter((p) => PERMISSIONS[p].group === g).map((p) => (
                <tr key={p} className="border-t border-border">
                  <td className="px-3 py-1.5">
                    <div className="flex flex-col">
                      <span>{PERMISSIONS[p].label}</span>
                      <span className="font-mono text-caption text-text-subtle">
                        {p}
                        {grantedUserCount?.[p] ? ` · ${grantedUserCount[p]} nhân viên được cấp thêm` : ''}
                      </span>
                    </div>
                  </td>
                  {MERCHANT_ROLES.map((r) => {
                    const grant = overrides?.[p]?.[r] ?? defaultGrant(p, r);
                    return (
                      <td key={r} className="px-2 py-1 text-center">
                        <GrantCell grant={grant} onClick={editable && onChange && r !== 'ADMIN' ? () => onChange(p, r, cycle[grant]) : undefined} />
                      </td>
                    );
                  })}
                  <td className="px-2 py-1 text-center">{(PERMISSIONS[p] as { reason?: boolean }).reason ? <Badge tone="warning">Cần lý do</Badge> : null}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
