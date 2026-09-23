import { Link, useNavigate, useParams } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Phone } from 'lucide-react';
import { Button, DescriptionList, DetailSkeleton, EmptyState, PageHeader } from '@bta/shadcn';
import { PublicMerchantQuery } from '@/graphql/operations';
import { useAuth } from '@/app/auth/AuthProvider';
import { paths } from '@/app/routes';
import { Panel } from '@/components/ui';

/** CW-MER-01 — Hồ sơ nhà xe công khai. */
export default function MerchantPage() {
  const { merchantId = '' } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(PublicMerchantQuery, { variables: { id: merchantId } });
  const m = data?.publicMerchant;

  if (loading && !data) return <DetailSkeleton />;
  if (error || !m)
    return (
      <EmptyState
        message="Nhà xe không công khai hoặc không tồn tại"
        action={
          <Button asChild>
            <Link to="/">Quay lại Tìm nhà xe</Link>
          </Button>
        }
      />
    );

  const request = () => {
    const target = paths.bookingNew(m.id);
    navigate(isAuthenticated ? target : paths.login(target));
  };
  const hotline = m.dispatchHotline ?? m.phone;

  return (
    <div className="space-y-5">
      <PageHeader
        title={m.name}
        subtitle={[m.province, m.serviceAreas.join(' · ')].filter(Boolean).join(' · ')}
        breadcrumb={[{ label: 'Tìm nhà xe', to: '/' }, { label: m.name }]}
        actions={
          <>
            {hotline ? (
              <Button variant="secondary" asChild>
                <a href={`tel:${hotline}`}>
                  <Phone /> Gọi điều phối
                </a>
              </Button>
            ) : null}
            <Button onClick={request}>Gửi yêu cầu vận chuyển</Button>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Panel title="Giới thiệu">
            <p className="whitespace-pre-line text-body text-text">{m.intro || 'Nhà xe chưa cập nhật giới thiệu.'}</p>
          </Panel>
          <Panel title="Dịch vụ">
            {m.services.length ? (
              <ul className="list-disc space-y-1 pl-5 text-body">{m.services.map((s) => <li key={s}>{s}</li>)}</ul>
            ) : (
              <p className="text-body-sm text-text-muted">Chưa cập nhật.</p>
            )}
          </Panel>
          <Panel title="Loại xe">
            {m.vehicleTypes.length ? (
              <p className="text-body">{m.vehicleTypes.join(' · ')}</p>
            ) : (
              <p className="text-body-sm text-text-muted">Chưa cập nhật.</p>
            )}
            <p className="mt-1 text-body-sm text-text-muted">{m.vehicleCount} xe đang sẵn sàng</p>
          </Panel>
          <p className="text-body-sm text-text-muted">Giá cước do nhà xe xác nhận trên từng yêu cầu, không có bảng giá cố định.</p>
        </div>
        <aside className="space-y-5">
          <Panel title="Liên hệ">
            <DescriptionList
              columns={1}
              items={[
                { label: 'Điều phối', value: hotline ? <a className="text-accent hover:underline" href={`tel:${hotline}`}>{hotline}</a> : '—' },
                { label: 'Email', value: m.email ?? '—' },
                { label: 'Địa chỉ', value: m.address ?? '—' },
                { label: 'Khu vực phục vụ', value: m.serviceAreas.join(', ') || '—' },
              ]}
            />
          </Panel>
          {m.hasRelationship ? (
            <Panel title="Bạn và nhà xe này">
              <p className="text-body">Đã hợp tác · {m.myOrderCount} đơn hàng</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <Link to={paths.orders()}>Xem đơn hàng</Link>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link to={paths.debt()}>Xem bảng kê</Link>
                </Button>
              </div>
            </Panel>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
