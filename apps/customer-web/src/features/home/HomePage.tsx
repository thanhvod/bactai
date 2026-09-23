import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Search, Truck } from 'lucide-react';
import { formatDate } from '@bta/shared';
import { Button, EmptyState, FormField, Input, PageHeader, Skeleton, Banner } from '@bta/shadcn';
import { MyBookingsQuery, PublicMerchantsQuery } from '@/graphql/operations';
import { useAuth } from '@/app/auth/AuthProvider';
import { paths } from '@/app/routes';
import { BookingStatusBadge, Panel } from '@/components/ui';

type MerchantNode = NonNullable<ReturnType<typeof useMerchants>['data']>['publicMerchants']['nodes'][number];

function useMerchants(filter: { keyword?: string; area?: string; service?: string; vehicleType?: string }) {
  return useQuery(PublicMerchantsQuery, { variables: { filter, first: 30 } });
}

export function MerchantCard({ m, onRequest }: { m: MerchantNode; onRequest: () => void }) {
  return (
    <li className="flex flex-col gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:flex-row sm:items-start">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-body-strong text-primary" aria-hidden>
        {m.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={paths.merchant(m.id)} className="text-heading-sm text-text hover:underline">
            {m.name}
          </Link>
          {m.hasRelationship ? (
            <span className="rounded-sm bg-success-soft px-1.5 py-0.5 text-caption text-success">Đã hợp tác · {m.myOrderCount} đơn</span>
          ) : null}
        </div>
        <p className="text-body-sm text-text-muted">{[m.serviceAreas.join(' · '), m.dispatchHotline ? `Điều phối ${m.dispatchHotline}` : null].filter(Boolean).join(' · ')}</p>
        {m.services.length ? <p className="text-body-sm text-text">{m.services.join(' · ')}</p> : null}
        {m.vehicleTypes.length ? (
          <p className="flex items-center gap-1 text-body-sm text-text-muted">
            <Truck className="size-3.5" aria-hidden /> {m.vehicleTypes.join(' · ')} · {m.vehicleCount} xe sẵn sàng
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" asChild>
          <Link to={paths.merchant(m.id)}>Xem hồ sơ</Link>
        </Button>
        <Button onClick={onRequest}>Gửi yêu cầu</Button>
      </div>
    </li>
  );
}

function RecentBookings() {
  const { data, loading } = useQuery(MyBookingsQuery, { variables: { first: 3 } });
  const nodes = data?.myBookings.nodes ?? [];
  return (
    <Panel title="Yêu cầu gần đây của bạn" actions={<Link to={paths.bookings()} className="text-body-sm text-accent hover:underline">Xem tất cả booking</Link>}>
      {loading && !data ? (
        <Skeleton className="h-16" />
      ) : nodes.length === 0 ? (
        <p className="text-body-sm text-text-muted">Bạn chưa gửi yêu cầu nào.</p>
      ) : (
        <ul className="space-y-3">
          {nodes.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <Link to={paths.booking(b.id)} className="text-body-strong text-accent hover:underline">
                  {b.code}
                </Link>
                <p className="truncate text-body-sm text-text-muted">
                  {b.merchantName} · {formatDate(b.createdAt)}
                </p>
              </div>
              <BookingStatusBadge status={b.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** CW-HOME-01 — Trang khám phá nhà xe (public). */
export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const applied = {
    area: params.get('area') ?? '',
    service: params.get('service') ?? '',
    vehicleType: params.get('vehicleType') ?? '',
    keyword: params.get('q') ?? '',
  };
  const [draft, setDraft] = React.useState(applied);
  const filter = Object.fromEntries(Object.entries({ area: applied.area, service: applied.service, vehicleType: applied.vehicleType, keyword: applied.keyword }).filter(([, v]) => v));
  const { data, loading, error, refetch } = useMerchants(filter);
  const nodes = [...(data?.publicMerchants.nodes ?? [])].sort((a, b) => Number(b.hasRelationship) - Number(a.hasRelationship) || b.myOrderCount - a.myOrderCount);
  const hasFilter = Object.keys(filter).length > 0;

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (draft.area.trim()) next.set('area', draft.area.trim());
    if (draft.service.trim()) next.set('service', draft.service.trim());
    if (draft.vehicleType.trim()) next.set('vehicleType', draft.vehicleType.trim());
    if (draft.keyword.trim()) next.set('q', draft.keyword.trim());
    setParams(next);
  };
  const clear = () => {
    setDraft({ area: '', service: '', vehicleType: '', keyword: '' });
    setParams(new URLSearchParams());
  };
  const request = (merchantId: string) => {
    const target = paths.bookingNew(merchantId);
    navigate(isAuthenticated ? target : paths.login(target));
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Tìm nhà xe" subtitle="Tìm theo khu vực, dịch vụ và loại xe; xem hồ sơ trước khi gửi yêu cầu vận chuyển" />
      <form onSubmit={search} className="grid gap-3 rounded-lg border border-border bg-surface-muted p-4 sm:grid-cols-2 lg:grid-cols-5">
        <FormField label="Khu vực / tuyến" htmlFor="f-area">
          <Input id="f-area" placeholder="VD: Bình Dương" value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} />
        </FormField>
        <FormField label="Dịch vụ" htmlFor="f-service">
          <Input id="f-service" placeholder="VD: Bốc xếp" value={draft.service} onChange={(e) => setDraft({ ...draft, service: e.target.value })} />
        </FormField>
        <FormField label="Loại xe" htmlFor="f-vt">
          <Input id="f-vt" placeholder="VD: Tải thùng" value={draft.vehicleType} onChange={(e) => setDraft({ ...draft, vehicleType: e.target.value })} />
        </FormField>
        <FormField label="Từ khóa" htmlFor="f-q">
          <Input id="f-q" placeholder="Tên nhà xe" value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} />
        </FormField>
        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            <Search /> Tìm nhà xe
          </Button>
          {hasFilter ? (
            <Button type="button" variant="ghost" onClick={clear}>
              Xóa lọc
            </Button>
          ) : null}
        </div>
      </form>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-border bg-surface" aria-live="polite">
          <div className="border-b border-border px-4 py-3 text-body-strong">
            {loading && !data ? 'Đang tìm…' : `${data?.publicMerchants.totalCount ?? 0} nhà xe phù hợp`}
            <span className="ml-2 text-body-sm font-normal text-text-muted">Sắp xếp: Đã hợp tác trước</span>
          </div>
          {error ? (
            <div className="p-4">
              <Banner tone="danger" message="Không tải được danh sách nhà xe" action={<Button variant="secondary" size="sm" onClick={() => refetch()}>Thử lại</Button>} />
            </div>
          ) : loading && !data ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : nodes.length === 0 ? (
            <EmptyState
              message="Chưa có nhà xe phù hợp tuyến này"
              action={hasFilter ? <Button variant="secondary" onClick={clear}>Xóa bộ lọc</Button> : undefined}
            />
          ) : (
            <ul>
              {nodes.map((m) => (
                <MerchantCard key={m.id} m={m} onRequest={() => request(m.id)} />
              ))}
            </ul>
          )}
          <p className="border-t border-border px-4 py-2 text-caption text-text-subtle">Chỉ hiển thị nhà xe đã bật hồ sơ công khai.</p>
        </section>
        <aside className="space-y-5">
          {isAuthenticated ? <RecentBookings /> : null}
          <Panel title="Cách gửi yêu cầu">
            <ol className="list-decimal space-y-1.5 pl-5 text-body-sm text-text">
              <li>Chọn nhà xe phù hợp tuyến và loại xe.</li>
              <li>Gửi yêu cầu: điểm lấy/trả, hàng, thời gian.</li>
              <li>Nhà xe xác nhận giá và tạo đơn.</li>
              <li>Theo dõi đơn và tải chứng từ tại mục Đơn hàng.</li>
            </ol>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
