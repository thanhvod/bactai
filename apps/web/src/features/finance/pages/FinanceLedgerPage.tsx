import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { BookOpen, Plus } from 'lucide-react';
import { Banner, Button, DataTable, EmptyState, ErrorState, FilterBar, FilterChip, KpiCard, Menu, MoneyCell, PageHeader, Pagination, StatusBadge, type DataTableColumn } from '@bta/shadcn';
import { formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { FinLedgerQuery } from '@/gql/graphql';
import { CellLink, notReadyYet, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { DOC_STATUS, LEDGER_DIRECTION, NotRevenueTag } from '../components/common';
import { FinanceLedgerQuery } from '../graphql/finance';

type Row = FinLedgerQuery['financeLedger']['nodes'][number];

/** WM-FIN-01 — Sổ thu chi: gộp phiếu thu + phiếu chi. Doanh thu KHÔNG lấy từ sổ này (chỉ từ đơn). */
export default function FinanceLedgerPage() {
  return (
    <RequirePermission permission={['finance.view', 'expense.create', 'payment.create']}>
      <FinanceLedger />
    </RequirePermission>
  );
}

export function CreateVoucherMenu() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const items = [
    ...(hasPermission('payment.create')
      ? [
          { key: 'pt-customer', label: 'Phiếu thu — khách trả', onSelect: () => navigate(`${PATHS.paymentNew}?type=CUSTOMER_PAYMENT`) },
          ...(hasPermission('cod.remittance.record') ? [{ key: 'pt-cod', label: 'Phiếu thu — tài xế nộp COD', onSelect: () => navigate(`${PATHS.paymentNew}?type=DRIVER_COD_REMITTANCE`) }] : []),
          { key: 'pt-other', label: 'Phiếu thu — thu khác', onSelect: () => navigate(`${PATHS.paymentNew}?type=OTHER`) },
        ]
      : []),
    ...(hasPermission('expense.create')
      ? [
          { key: 'pc-cost', label: 'Phiếu chi — chi phí / NCC', onSelect: () => navigate(`${PATHS.expenseNew}?kind=TRIP_COST`), separatorBefore: hasPermission('payment.create') },
          { key: 'pc-adv', label: 'Phiếu chi — tạm ứng chuyến', onSelect: () => navigate(`${PATHS.expenseNew}?kind=TRIP_ADVANCE`) },
        ]
      : []),
  ];
  if (!items.length) return null;
  return (
    <Menu
      trigger={
        <Button>
          <Plus /> Tạo phiếu
        </Button>
      }
      items={items}
    />
  );
}

function FinanceLedger() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get('q') ?? '');
  const q = useDebounced(search.trim());
  const direction = params.get('direction');
  const status = params.get('status');
  const from = params.get('from');
  const to = params.get('to');
  const paging = useCursorPaging();
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  React.useEffect(() => paging.reset(), [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, loading, error, refetch } = useQuery(FinanceLedgerQuery, {
    variables: { filter: { search: q || null, direction, status, dateFrom: from, dateTo: to }, first: paging.first, after: paging.after },
  });
  const rows = data?.financeLedger.nodes ?? [];
  const s = data?.financeLedger.summary;
  const partial = !hasPermission('finance.view');

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã phiếu', width: 150, render: (r) => <CellLink to={r.direction === 'IN' ? paths.payment(r.id) : paths.expense(r.id)} className="font-mono text-body-sm text-accent hover:underline">{r.code}</CellLink> },
    { key: 'date', label: 'Ngày', width: 110, render: (r) => formatDate(r.date) },
    { key: 'dir', label: 'Loại', render: (r) => (
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5">
          <StatusBadge meta={LEDGER_DIRECTION} status={r.direction} />
          <span className="text-body-sm">{r.typeLabel}</span>
        </span>
        {r.notRevenue ? <NotRevenueTag /> : null}
      </div>
    ) },
    { key: 'counterpart', label: 'Đối tượng', render: (r) => (
      <div className="flex flex-col">
        <span>{r.counterpart}</span>
        {r.links ? <span className="text-caption text-text-subtle">{r.links}</span> : null}
      </div>
    ) },
    { key: 'status', label: 'Trạng thái', hideBelow: 'lg', render: (r) => <StatusBadge meta={DOC_STATUS} status={r.status} outline={r.status === 'CANCELLED'} /> },
    { key: 'amount', label: 'Số tiền phiếu', money: true, render: (r) => <MoneyCell value={r.amount} tone={r.status === 'CANCELLED' ? 'muted' : 'default'} /> },
    { key: 'in', label: 'Tiền vào', money: true, render: (r) => (r.direction === 'IN' && r.cashMoved && r.status !== 'CANCELLED' ? <MoneyCell value={r.amount} tone="success" /> : <span className="block text-right text-text-subtle">—</span>) },
    { key: 'out', label: 'Tiền ra', money: true, render: (r) => (r.direction === 'OUT' && r.cashMoved && r.status !== 'CANCELLED' ? <MoneyCell value={r.amount} tone="warning" /> : <span className="block text-right text-text-subtle">—</span>) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Sổ thu chi"
        subtitle="Mọi phiếu thu và phiếu chi; tiền vào/ra là dòng tiền thực tế"
        actions={
          <>
            <Button variant="secondary" onClick={() => notReadyYet('Xuất sổ thu chi')}>Xuất Excel</Button>
            <CreateVoucherMenu />
          </>
        }
      />
      {partial ? <Banner tone="info" message="Bạn chỉ xem được một phần sổ thu chi theo quyền được cấp." /> : null}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard loading={loading && !data} label="Tiền vào (thực thu)" value={formatVnd(s?.cashIn ?? 0)} tone="success" sub={`Khách trả ${formatVnd(s?.customerReceipts ?? 0)}`} onClick={() => setParam('direction', 'IN')} />
        <KpiCard loading={loading && !data} label="COD & hoàn tạm ứng tài xế nộp" value={formatVnd((s?.codRemittances ?? 0) + (s?.advanceReturns ?? 0))} tone="info" sub="Thu hồi — không tính doanh thu" to={PATHS.cod} />
        <KpiCard loading={loading && !data} label="Tiền ra (đã chi)" value={formatVnd(s?.cashOut ?? 0)} tone="warning" sub={`Tài xế chi trước ${formatVnd(s?.driverPaidOut ?? 0)}`} onClick={() => setParam('direction', 'OUT')} />
        <KpiCard loading={loading && !data} label="Phiếu chi chưa trả" value={formatVnd(s?.unpaidOut ?? 0)} tone={(s?.unpaidOut ?? 0) > 0 ? 'danger' : 'neutral'} sub="Công nợ NCC" to={PATHS.supplierDebt} />
      </div>
      <p className="text-body-sm text-text-muted">
        Doanh thu chỉ lấy từ đơn hàng (giá cước + dịch vụ cộng thêm), không lấy từ phiếu thu. Xem <CellLink to={PATHS.reportProfit}>báo cáo doanh thu – lãi/lỗ</CellLink>.
      </p>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã phiếu, đối tượng, đơn/chuyến"
        dateRange={{ from, to, onChange: (r) => { const n = new URLSearchParams(params); r.from ? n.set('from', r.from) : n.delete('from'); r.to ? n.set('to', r.to) : n.delete('to'); setParams(n, { replace: true }); paging.reset(); } }}
        selects={[
          { key: 'status', placeholder: 'Trạng thái', value: status ?? 'ALL', onChange: (v) => setParam('status', v === 'ALL' ? null : v), options: [{ value: 'ALL', label: 'Mọi trạng thái' }, { value: 'ACTIVE', label: 'Hiệu lực' }, { value: 'CANCELLED', label: 'Đã hủy' }], width: 160 },
        ]}
        chips={
          <>
            <FilterChip label="Phiếu thu" active={direction === 'IN'} onClick={() => setParam('direction', direction === 'IN' ? null : 'IN')} />
            <FilterChip label="Phiếu chi" active={direction === 'OUT'} onClick={() => setParam('direction', direction === 'OUT' ? null : 'OUT')} />
          </>
        }
      />
      {error ? (
        <ErrorState title="Không tải được sổ thu chi" error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => `${r.direction}-${r.id}`}
            loading={loading && !data}
            onRowClick={(r) => navigate(r.direction === 'IN' ? paths.payment(r.id) : paths.expense(r.id))}
            rowClassName={(r) => (r.status === 'CANCELLED' ? 'opacity-60' : undefined)}
            empty={<EmptyState icon={<BookOpen strokeWidth={1.5} />} message="Chưa có phiếu thu/chi trong kỳ" action={<CreateVoucherMenu />} />}
          />
          <Pagination
            hasNextPage={!!data?.financeLedger.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.financeLedger.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.financeLedger.totalCount}
          />
        </>
      )}
    </div>
  );
}
