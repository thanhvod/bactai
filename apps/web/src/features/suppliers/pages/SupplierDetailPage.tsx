import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { History, Pencil, Plus, Power, Wallet, XCircle } from 'lucide-react';
import {
  Banner,
  Breadcrumb,
  Button,
  DataTable,
  DescriptionList,
  DetailSkeleton,
  EmptyState,
  EntityHeader,
  ErrorState,
  MoneyCell,
  SensitiveActionModal,
  StatusBadge,
  SummaryStrip,
  Tabs,
  TabsContent,
  toast,
  type DataTableColumn,
} from '@bta/shadcn';
import { ACTIVE_STATUS, formatDate, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { SupplierDetailQuery as SupplierDetailData } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { AttachmentsPanel } from '@/features/shared/AttachmentsPanel';
import { EntityTimeline, TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { expenseColumns } from '@/features/master-data/tables';
import { ActivateSupplierMutation, DeactivateSupplierMutation, SupplierDetailQuery } from '../graphql/suppliers';

type Supplier = NonNullable<SupplierDetailData['supplier']>;
type ExpenseRow = NonNullable<Supplier['recentExpenses']>[number];
type ExternalRow = NonNullable<Supplier['externalTransports']>[number];
const TABS = ['overview', 'expenses', 'payables', 'external', 'attachments', 'timeline'];

/** WM-SUP-02 — Chi tiết nhà cung cấp (tabs ?tab=overview|expenses|payables|external|attachments|timeline). */
export default function SupplierDetailPage() {
  return (
    <RequirePermission permission="supplier.view">
      <SupplierDetail />
    </RequirePermission>
  );
}

function SupplierDetail() {
  const { supplierId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [tabParam, setTab] = useQueryParam('tab');
  const tab = TABS.includes(tabParam ?? '') ? tabParam! : 'overview';
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(SupplierDetailQuery, { variables: { id: supplierId } });
  const [deactivate, { loading: deactivating }] = useMutation(DeactivateSupplierMutation);
  const [activate] = useMutation(ActivateSupplierMutation);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(false);

  if (error) {
    return /Không tìm thấy/.test(error.message) ? (
      <EmptyState message="Không tìm thấy nhà cung cấp" action={<Button onClick={() => navigate(PATHS.suppliers)}>Về danh sách NCC</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const s = data?.supplier;
  if (!s) return null;
  const canEdit = hasPermission('supplier.edit');
  const canExpense = hasPermission('expense.create');
  const newExpenseUrl = `${PATHS.expenseNew}?supplierId=${s.id}`;
  const payable = s.payable;
  const debtUrl = `${PATHS.supplierDebt}?supplierId=${s.id}`;

  const externalColumns: DataTableColumn<ExternalRow>[] = [
    { key: 'order', label: 'Đơn', render: (x) => <CellLink to={paths.order(x.orderId)}>{x.orderCode ?? 'Mở đơn'}</CellLink> },
    { key: 'trip', label: 'Chuyến', render: (x) => (x.tripId ? <CellLink to={paths.trip(x.tripId)}>{x.tripCode ?? 'Chuyến'}</CellLink> : '—') },
    { key: 'plate', label: 'Xe ngoài', render: (x) => x.vehiclePlate ?? '—' },
    { key: 'driver', label: 'Tài xế ngoài', render: (x) => (x.driverName ? `${x.driverName}${x.driverPhone ? ` · ${x.driverPhone}` : ''}` : '—') },
    { key: 'amount', label: 'Giá thuê thỏa thuận', money: true, render: (x) => <MoneyCell value={x.agreedAmount} /> },
    { key: 'date', label: 'Ngày', render: (x) => formatDate(x.createdAt) },
    { key: 'note', label: 'Ghi chú', hideBelow: 'lg', render: (x) => x.note ?? '—' },
  ];

  const expenseTable = (rows: ExpenseRow[], empty: string) => (
    <DataTable
      columns={expenseColumns<ExpenseRow>({ showOrder: true, showTrip: true, showVehicle: true })}
      rows={rows}
      rowKey={(e) => e.id}
      compact
      onRowClick={(e) => navigate(paths.expense(e.id))}
      empty={<EmptyState compact message={empty} action={canExpense ? <Button size="sm" onClick={() => navigate(newExpenseUrl)}><Plus /> Tạo phiếu chi</Button> : null} />}
    />
  );
  const unpaid = (s.recentExpenses ?? []).filter((e) => e.status === 'ACTIVE' && e.paidStatus === 'UNPAID' && e.paidBy === 'COMPANY');

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Nhà cung cấp', to: PATHS.suppliers }, { label: s.name }]} />
      <EntityHeader
        code={s.code}
        title={s.name}
        status={<StatusBadge meta={ACTIVE_STATUS} status={s.status} />}
        subtitle={[s.type?.name, s.taxCode ? `MST ${s.taxCode}` : null, s.address].filter(Boolean).join(' · ')}
        metrics={[
          { label: 'Công nợ phải trả', value: <span className={s.payableAmount > 0 ? 'text-warning' : undefined}>{formatVnd(s.payableAmount)}</span> },
          { label: 'Số phiếu chi', value: s.expenseCount },
        ]}
        primaryAction={
          canExpense && s.status === 'ACTIVE' ? (
            <Button onClick={() => navigate(newExpenseUrl)}>
              <Plus /> Tạo phiếu chi
            </Button>
          ) : null
        }
        menu={[
          ...(canEdit ? [{ key: 'edit', label: 'Sửa NCC', icon: <Pencil />, onSelect: () => navigate(paths.supplierEdit(s.id)) }] : []),
          { key: 'debt', label: 'Công nợ NCC', icon: <Wallet />, onSelect: () => navigate(debtUrl) },
          { key: 'timeline', label: 'Timeline', icon: <History />, onSelect: openTimeline },
          ...(canEdit
            ? s.status === 'ACTIVE'
              ? [{ key: 'deactivate', label: 'Ngừng giao dịch', icon: <XCircle />, danger: true, separatorBefore: true, onSelect: () => setConfirmDeactivate(true) }]
              : [
                  {
                    key: 'activate',
                    label: 'Giao dịch lại',
                    icon: <Power />,
                    separatorBefore: true,
                    onSelect: async () => {
                      try {
                        await activate({ variables: { id: s.id } });
                        toast.success('Đã kích hoạt lại NCC');
                        void refetch();
                      } catch (e) {
                        toast.error('Không kích hoạt được', apolloErrorMessage(e));
                      }
                    },
                  },
                ]
            : []),
        ]}
      />
      {s.status === 'INACTIVE' ? <Banner tone="neutral" message={`Đã ngừng giao dịch${s.deactivateReason ? `: ${s.deactivateReason}` : ''}. NCC không chọn được ở phiếu chi mới; công nợ cũ vẫn theo dõi.`} /> : null}
      <SummaryStrip
        items={[
          { label: 'Công nợ phải trả', value: formatVnd(payable?.total ?? s.payableAmount), tone: (payable?.total ?? 0) > 0 ? 'warning' : 'neutral' },
          { label: 'Phiếu chưa trả', value: payable?.unpaidCount ?? 0 },
          { label: 'Nợ lâu nhất', value: payable?.oldestDays ? `${payable.oldestDays} ngày` : '—', tone: (payable?.oldestDays ?? 0) > 30 ? 'danger' : 'neutral' },
          { label: 'Thuê xe ngoài', value: s.externalTransports?.length ?? 0 },
        ]}
      />
      <Tabs
        value={tab}
        onValueChange={(t) => setTab(t === 'overview' ? null : t)}
        items={[
          { value: 'overview', label: 'Hồ sơ' },
          { value: 'expenses', label: 'Khoản chi', count: s.expenseCount },
          { value: 'payables', label: 'Công nợ', count: payable?.unpaidCount ?? null },
          { value: 'external', label: 'Thuê xe ngoài', count: s.externalTransports?.length ?? null },
          { value: 'attachments', label: 'Chứng từ' },
          { value: 'timeline', label: 'Timeline' },
        ]}
      >
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Thông tin">
              <DescriptionList
                items={[
                  { label: 'Tên', value: s.name },
                  { label: 'Loại', value: s.type?.name },
                  { label: 'Mã số thuế', value: s.taxCode },
                  { label: 'Địa chỉ', value: s.address, span: 2 },
                  { label: 'Ngân hàng', value: s.bankName },
                  { label: 'Số tài khoản', value: s.bankAccountNo ? <span className="font-mono">{s.bankAccountNo}</span> : null },
                  { label: 'Điều khoản thanh toán', value: s.paymentTerms, span: 2 },
                  { label: 'Ghi chú', value: s.note, span: 2 },
                ]}
              />
            </Panel>
            <Panel title="Người liên hệ">
              {s.contacts.length ? (
                <ul className="flex flex-col divide-y divide-border">
                  {s.contacts.map((c, i) => (
                    <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-2 first:pt-0 last:pb-0">
                      <span>
                        <span className="font-medium">{c.name ?? '—'}</span>
                        {c.role ? <span className="text-body-sm text-text-muted"> · {c.role}</span> : null}
                      </span>
                      <span className="flex gap-3 text-body-sm">
                        {c.phone ? <a className="text-accent hover:underline" href={`tel:${c.phone}`}>{c.phone}</a> : null}
                        {c.email ? <a className="text-accent hover:underline" href={`mailto:${c.email}`}>{c.email}</a> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact message="Chưa có người liên hệ" />
              )}
            </Panel>
          </div>
        </TabsContent>
        <TabsContent value="expenses">
          <Panel title="Khoản chi gần đây (20 phiếu)" actions={<CellLink to={`${PATHS.expenses}?supplierId=${s.id}`}>Mở danh sách phiếu chi</CellLink>}>
            {expenseTable(s.recentExpenses ?? [], 'Chưa có khoản chi')}
          </Panel>
        </TabsContent>
        <TabsContent value="payables">
          <div className="flex flex-col gap-4">
            <SummaryStrip
              items={[
                { label: '0–15 ngày', value: formatVnd(payable?.aging.d0_15 ?? 0) },
                { label: '16–30 ngày', value: formatVnd(payable?.aging.d16_30 ?? 0), tone: (payable?.aging.d16_30 ?? 0) > 0 ? 'warning' : 'neutral' },
                { label: '31–60 ngày', value: formatVnd(payable?.aging.d31_60 ?? 0), tone: (payable?.aging.d31_60 ?? 0) > 0 ? 'danger' : 'neutral' },
                { label: '> 60 ngày', value: formatVnd(payable?.aging.d60p ?? 0), tone: (payable?.aging.d60p ?? 0) > 0 ? 'danger' : 'neutral' },
              ]}
            />
            <Panel
              title={`Phiếu chi chưa trả · ${formatVnd(payable?.total ?? 0)}`}
              actions={<CellLink to={debtUrl}>Mở công nợ NCC để trả tiền</CellLink>}
            >
              {expenseTable(unpaid, 'Không còn công nợ với NCC này')}
              {(payable?.unpaidCount ?? 0) > unpaid.length ? (
                <p className="mt-2 text-body-sm text-text-muted">Chỉ hiện phiếu trong 20 phiếu gần nhất — xem đủ ở trang Công nợ NCC.</p>
              ) : null}
            </Panel>
          </div>
        </TabsContent>
        <TabsContent value="external">
          <Panel title="Thông tin thuê xe ngoài">
            <p className="mb-3 text-body-sm text-text-muted">Chi phí thuê ngoài là phiếu chi gắn đơn, trừ vào lãi/lỗ đơn — không phải doanh thu.</p>
            <DataTable columns={externalColumns} rows={s.externalTransports ?? []} rowKey={(x) => x.id} compact onRowClick={(x) => navigate(paths.order(x.orderId))} empty={<EmptyState compact message="Chưa có chuyến thuê xe ngoài qua NCC này" />} />
          </Panel>
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentsPanel entityType="SUPPLIER" entityId={s.id} category="CONTRACT" canUpload={canEdit} emptyText="Chưa có chứng từ (hợp đồng, báo giá...)" />
        </TabsContent>
        <TabsContent value="timeline">{tab === 'timeline' ? <EntityTimeline entity={{ type: 'SUPPLIER', id: s.id }} /> : null}</TabsContent>
      </Tabs>
      <TimelineDrawer entity={{ type: 'SUPPLIER', id: s.id, label: `${s.code} · ${s.name}` }} />
      <SensitiveActionModal
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        action={`Ngừng giao dịch với ${s.name}`}
        description="NCC sẽ không chọn được ở phiếu chi mới. Công nợ và lịch sử vẫn giữ nguyên."
        affected={[s.payableAmount > 0 ? `Còn công nợ ${formatVnd(s.payableAmount)}` : 'Không còn công nợ']}
        warning={s.payableAmount > 0 ? 'NCC còn công nợ phải trả — vẫn theo dõi ở Công nợ NCC.' : undefined}
        confirmLabel="Ngừng giao dịch"
        loading={deactivating}
        onConfirm={async (reason) => {
          try {
            await deactivate({ variables: { id: s.id, reason } });
            toast.success('Đã ngừng giao dịch với NCC');
            setConfirmDeactivate(false);
            void refetch();
          } catch (e) {
            toast.error('Không thực hiện được', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
