import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router';
import { Button, Drawer, EmptyState, Skeleton } from '@bta/shadcn';
import { MyAddressesQuery } from '@/graphql/operations';
import { paths } from '@/app/routes';

export type PickedAddress = { id: string; name: string; address: string; contactName?: string | null; contactPhone?: string | null; note?: string | null };

/** CW-ADDR-01 ở chế độ chọn: click dòng → điền vào điểm lấy/trả. */
export function AddressPicker({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (a: PickedAddress) => void }) {
  const { data, loading } = useQuery(MyAddressesQuery, { skip: !open });
  const rows = data?.myAddresses ?? [];
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Chọn từ địa chỉ thường dùng" width={560}>
      {loading && !data ? (
        <Skeleton className="h-24" />
      ) : rows.length === 0 ? (
        <EmptyState
          message="Chưa có địa chỉ thường dùng"
          action={
            <Button variant="secondary" asChild>
              <Link to={paths.addresses()}>Thêm địa chỉ</Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {rows.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className="w-full px-3 py-3 text-left hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  onPick(a);
                  onOpenChange(false);
                }}
              >
                <span className="block text-body-strong">
                  {a.name}
                  {a.isDefaultPickup ? <span className="ml-2 text-caption text-primary">Điểm lấy mặc định</span> : null}
                </span>
                <span className="block text-body-sm text-text-muted">{a.address}</span>
                {a.contactName || a.contactPhone ? (
                  <span className="block text-body-sm text-text-muted">{[a.contactName, a.contactPhone].filter(Boolean).join(' · ')}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
