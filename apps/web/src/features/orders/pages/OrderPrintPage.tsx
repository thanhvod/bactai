import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Download, Printer } from 'lucide-react';
import { Breadcrumb, Button, EmptyState, ErrorState, PageHeader, PrintSheet, SegmentedControl, Select, Skeleton, toast } from '@bta/shadcn';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { OrderDetailQuery, RenderDocumentMutation } from '../graphql/orders';

const TEMPLATES = [
  { value: 'DELIVERY_NOTE', label: 'Phiếu giao hàng', entity: 'ORDER' },
  { value: 'DISPATCH_NOTE', label: 'Phiếu điều xe', entity: 'TRIP' },
  { value: 'TRIP_COST_SHEET', label: 'Bảng chi phí chuyến', entity: 'TRIP' },
] as const;

/** WM-ORD-09 — In/chia sẻ đơn: preview HTML (PrintSheet A4) + tải PDF qua renderDocument. */
export default function OrderPrintPage() {
  return (
    <RequirePermission permission="order.view">
      <OrderPrint />
    </RequirePermission>
  );
}

function OrderPrint() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const template = (TEMPLATES.find((t) => t.value === params.get('template')) ?? TEMPLATES[0]).value;
  const def = TEMPLATES.find((t) => t.value === template)!;
  const { data, loading, error, refetch } = useQuery(OrderDetailQuery, { variables: { id: orderId } });
  const trips = (data?.order.trips ?? []).filter((t) => t.status !== 'CANCELLED');
  const tripId = params.get('tripId') ?? trips[0]?.id ?? '';
  const entityId = def.entity === 'ORDER' ? orderId : tripId;
  const [render, { loading: rendering }] = useMutation(RenderDocumentMutation);
  const [html, setHtml] = React.useState<string | null>(null);
  const [renderError, setRenderError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!entityId) return;
    setHtml(null);
    setRenderError(null);
    render({ variables: { input: { template, entityId, format: 'HTML' } } })
      .then((r) => setHtml(r.data?.renderDocument.html ?? ''))
      .catch((e) => setRenderError(apolloErrorMessage(e)));
  }, [template, entityId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  const downloadPdf = async () => {
    try {
      const r = await render({ variables: { input: { template, entityId, format: 'PDF' } } });
      const url = r.data?.renderDocument.url;
      if (url) window.open(url, '_blank');
      toast.success(`Đã tạo ${r.data?.renderDocument.fileName ?? 'PDF'} (lưu vào chứng từ)`);
    } catch (e) {
      toast.error('Không tạo được PDF', apolloErrorMessage(e));
    }
  };
  const printHtml = () => {
    const w = window.open('', '_blank');
    if (!w || !html) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  const o = data?.order;
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Đơn hàng', to: PATHS.orders }, ...(o ? [{ label: o.code, to: paths.order(o.id) }] : []), { label: 'In / chia sẻ' }]} />
      <PageHeader
        title={`In phiếu ${o?.code ?? ''}`}
        subtitle="Xem trước khổ A4, in trực tiếp hoặc tải PDF để gửi qua Zalo/email"
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(paths.order(orderId))}>
              Quay lại đơn
            </Button>
            <Button variant="secondary" disabled={!html} onClick={printHtml}>
              <Printer /> In
            </Button>
            <Button loading={rendering} disabled={!entityId} onClick={() => void downloadPdf()}>
              <Download /> Tải PDF
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl items={TEMPLATES.map((t) => ({ value: t.value, label: t.label }))} value={template} onChange={(v) => set('template', v)} />
        {def.entity === 'TRIP' && trips.length > 1 ? (
          <Select value={tripId} onValueChange={(v) => set('tripId', v)} options={trips.map((t) => ({ value: t.id, label: `${t.code} · ${t.vehicle?.plate ?? 'chưa gán xe'}` }))} className="w-64" />
        ) : null}
      </div>
      {loading && !data ? (
        <Skeleton h={600} />
      ) : def.entity === 'TRIP' && !tripId ? (
        <EmptyState message="Đơn chưa có chuyến" description="Phiếu điều xe và bảng chi phí chuyến cần có chuyến." />
      ) : renderError ? (
        <ErrorState title="Không tạo được bản xem trước" error={new Error(renderError)} onRetry={() => set('template', template)} />
      ) : html === null ? (
        <Skeleton h={600} />
      ) : (
        <PrintSheet title={def.label}>
          <iframe title={def.label} srcDoc={html} className="h-[1100px] w-full border-0 bg-white" />
        </PrintSheet>
      )}
    </div>
  );
}
