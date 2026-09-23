import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { FileText, History, Pencil, Plus, Wallet } from 'lucide-react';
import {
  Banner,
  Button,
  DataTable,
  DescriptionList,
  DetailSkeleton,
  EmptyState,
  EntityHeader,
  MoneyCell,
  SensitiveActionModal,
  StatusBadge,
  SummaryStrip,
  Tabs,
  TabsContent,
  toast,
} from '@bta/shadcn';
import { ACTIVE_STATUS, AGING_BUCKETS, CUSTOMER_TYPE, formatDate, formatVnd, labelOf } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { AttachmentsPanel } from '@/features/shared/AttachmentsPanel';
import { EntityTimeline, TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { CustomerOrdersTab } from '@/features/orders/components/CustomerOrdersTab';
import { useQueryParam } from '@/features/shared/useQueryParam';
import type { CustomerDetailFieldsFragment } from '@/gql/graphql';
import { CustomerFormDrawer } from '../components/CustomerFormDrawer';
import { CreditUsage } from '../components/CreditUsage';
import { LocationsTab } from '../components/LocationsTab';
import { CustomerStatementsTab } from '../components/CustomerStatementsTab';
import { CustomerDebtSection } from '@/features/finance/components/FinanceSections';
import { ActivateCustomerMutation, CustomerQuery, DeactivateCustomerMutation } from '../graphql/customers';

const TABS = ['overview', 'orders', 'debt', 'credit', 'locations', 'statements', 'attachments', 'timeline'] as const;
type Tab = (typeof TABS)[number];

/** Chờ API module khác (orders P3 / finance P5 / debt statement P6). */
function PendingModule({ message, action }: { message: string; action?: React.ReactNode }) {
  return <EmptyState message={message} description="Dữ liệu này sẽ hiển thị khi module tương ứng có API (đang triển khai)." action={action} />;
}

/** WM-CUS-02 — Chi tiết khách hàng (tabs qua ?tab=). `editOpen` = WM-CUS-03 drawer (route /customers/:id/edit). */
export function CustomerDetail({ editOpen = false, initialTab }: { editOpen?: boolean; initialTab?: Tab }) {
  const { customerId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const openTimeline = useTimelineDrawer();
  const [tabParam, setTab] = useQueryParam('tab');
  const tab = (TABS.includes(tabParam as Tab) ? tabParam : initialTab ?? 'overview') as Tab;
  const { data, loading, error, refetch } = useQuery(CustomerQuery, { variables: { id: customerId } });
  const [deactivate] = useMutation(DeactivateCustomerMutation);
  const [activate, { loading: activating }] = useMutation(ActivateCustomerMutation);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(false);
  const c = data?.customer;

  if (error)
    return (
      <EmptyState
        message="Không tìm thấy khách hàng hoặc bạn không có quyền xem"
        description={apolloErrorMessage(error)}
        action={<Button onClick={() => navigate(PATHS.customers)}>Về danh sách khách hàng</Button>}
      />
    );
  if ((loading && !c) || !c) return <DetailSkeleton />;
  const d = c.debtSummary;
  const inactive = c.status === 'INACTIVE';
  const canDeactivate = hasPermission('customer.deactivate') || (c.orderCount === 0 && hasPermission('customer.edit'));

  return (
    <div className="flex flex-col gap-4">
      <EntityHeader
        code={c.code}
        title={c.name}
        status={<StatusBadge meta={ACTIVE_STATUS} status={c.status} />}
        subtitle={[labelOf(CUSTOMER_TYPE, c.type), c.taxCode ? `MST ${c.taxCode}` : null, c.phone, c.groupName].filter(Boolean).join(' · ')}
        metrics={[
          { label: 'Còn nợ', value: <MoneyCell value={d.remaining} strong /> },
          { label: 'Quá hạn', value: <MoneyCell value={d.overdueAmount} tone={d.overdueAmount > 0 ? 'danger' : 'muted'} /> },
          { label: 'Số dư', value: <MoneyCell value={c.creditBalance} tone={c.creditBalance > 0 ? 'success' : 'muted'} /> },
          { label: 'Số đơn', value: c.orderCount },
        ]}
        primaryAction={
          hasPermission('order.create') && !inactive ? (
            <Button onClick={() => navigate(`${PATHS.orderNew}?customerId=${c.id}`)}>
              <Plus /> Tạo đơn
            </Button>
          ) : undefined
        }
        secondaryActions={
          <>
            {hasPermission('payment.create') ? (
              <Button variant="secondary" onClick={() => navigate(`${PATHS.paymentNew}?customerId=${c.id}&type=CUSTOMER_PAYMENT`)}>
                <Wallet /> Ghi nhận thanh toán
              </Button>
            ) : null}
            {hasPermission('customer.edit') ? (
              <Button variant="secondary" onClick={() => navigate(paths.customerEdit(c.id))}>
                <Pencil /> Sửa
              </Button>
            ) : null}
            <Button variant="secondary" onClick={openTimeline}>
              <History /> Timeline
            </Button>
          </>
        }
        menu={[
          ...(hasPermission('debtStatement.create') ? [{ key: 'statement', label: 'Tạo bảng kê công nợ', icon: <FileText />, onSelect: () => navigate(`${PATHS.debtStatements}?customerId=${c.id}&create=1`) }] : []),
          inactive
            ? { key: 'activate', label: 'Kích hoạt lại', disabled: !hasPermission('customer.edit') || activating, onSelect: () => void activate({ variables: { id: c.id } }).then(() => { toast.success('Đã kích hoạt lại khách hàng'); void refetch(); }).catch((e) => toast.error('Không kích hoạt được', apolloErrorMessage(e))) }
            : { key: 'deactivate', label: 'Ngừng hoạt động', danger: true, separatorBefore: true, disabled: !canDeactivate, onSelect: () => setConfirmDeactivate(true) },
        ]}
      />
      {inactive ? <Banner tone="neutral" message={`Khách đã ngừng hoạt động${c.deactivateReason ? `: ${c.deactivateReason}` : ''}. Không chọn được khi tạo đơn mới.`} /> : null}
      {c.warnings.length ? <Banner tone={d.overdueOrders ? 'danger' : 'warning'} message={c.warnings.join(' · ')} action={<Button size="sm" variant="secondary" onClick={() => setTab('debt')}>Xem công nợ</Button>} /> : null}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v === 'overview' ? null : v)}
        items={[
          { value: 'overview', label: 'Tổng quan' },
          { value: 'orders', label: 'Đơn hàng', count: c.orderCount },
          { value: 'debt', label: 'Công nợ', count: d.openOrders || null },
          { value: 'credit', label: 'Số dư' },
          { value: 'locations', label: 'Địa chỉ', count: c.locations?.filter((l) => l.active).length ?? 0 },
          { value: 'statements', label: 'Bảng kê' },
          { value: 'attachments', label: 'Chứng từ' },
          { value: 'timeline', label: 'Timeline' },
        ]}
      >
        <TabsContent value="overview">
          <Overview c={c} onTab={setTab} />
        </TabsContent>
        <TabsContent value="orders">
          <CustomerOrdersTab customerId={c.id} canCreate={!inactive} />
        </TabsContent>
        <TabsContent value="debt">
          <DebtTab c={c} />
        </TabsContent>
        <TabsContent value="credit">
          <div className="flex flex-col gap-3">
            <SummaryStrip items={[{ label: 'Số dư chưa phân bổ', value: formatVnd(c.creditBalance), tone: c.creditBalance > 0 ? 'success' : 'neutral', hint: 'Tiền khách trả dư/chưa phân bổ; dùng để phân bổ vào đơn sau.' }]} />
            {/* TODO(API P5): `payments(filter:{customerId, hasUnallocated:true})` */}
            <PendingModule message="Danh sách phiếu thu còn tiền chưa phân bổ" />
          </div>
        </TabsContent>
        <TabsContent value="locations">
          <LocationsTab customerId={c.id} onChanged={() => void refetch()} />
        </TabsContent>
        <TabsContent value="statements">
          <CustomerStatementsTab customerId={c.id} />
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentsPanel entityType="CUSTOMER" entityId={c.id} category="CONTRACT" canUpload={hasPermission('customer.edit')} />
        </TabsContent>
        <TabsContent value="timeline">
          <div className="rounded-lg border border-border bg-surface p-5">
            <EntityTimeline entity={{ type: 'CUSTOMER', id: c.id }} />
          </div>
        </TabsContent>
      </Tabs>
      <TimelineDrawer entity={{ type: 'CUSTOMER', id: c.id, label: `${c.code} · ${c.name}` }} />
      <CustomerFormDrawer
        open={editOpen}
        customer={c}
        onOpenChange={(o) => !o && navigate(paths.customer(c.id))}
        onSaved={() => {
          void refetch();
          navigate(paths.customer(c.id));
        }}
      />
      <SensitiveActionModal
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        action={`Ngừng hoạt động khách hàng ${c.name}`}
        description="Khách ngừng hoạt động vẫn hiện trong lịch sử nhưng không chọn được khi tạo đơn mới."
        affected={[`${c.orderCount} đơn đã có`, `Còn nợ ${formatVnd(d.remaining)}`]}
        warning={d.remaining > 0 ? 'Khách vẫn còn công nợ — tiếp tục theo dõi thu hồi.' : undefined}
        confirmLabel="Ngừng hoạt động"
        onConfirm={async (reason) => {
          try {
            await deactivate({ variables: { id: c.id, reason } });
            toast.success('Đã ngừng hoạt động khách hàng');
            setConfirmDeactivate(false);
            void refetch();
          } catch (e) {
            toast.error('Không ngừng được khách hàng', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}

function Overview({ c, onTab }: { c: CustomerDetailFieldsFragment; onTab: (t: string) => void }) {
  const pc = c.primaryContact;
  const locations = (c.locations ?? []).filter((l) => l.active).slice(0, 5);
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-4">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-3 text-heading-sm">Thông tin khách hàng</h2>
          <DescriptionList
            columns={2}
            items={[
              { label: 'Tên pháp lý', value: c.legalName ?? '—' },
              { label: 'Mã số thuế', value: c.taxCode ?? '—' },
              { label: 'Điện thoại', value: c.phone ? <a className="text-accent" href={`tel:${c.phone}`}>{c.phone}</a> : '—' },
              { label: 'Email', value: c.email ?? '—' },
              { label: 'Email nhận hóa đơn', value: c.invoiceEmail ?? '—' },
              { label: 'Nhóm khách', value: c.groupName ?? '—' },
              { label: 'Địa chỉ xuất hóa đơn', value: c.billingAddress ?? '—', span: 2 },
              { label: 'Người liên hệ', value: pc?.name ? `${pc.name}${pc.role ? ` (${pc.role})` : ''}` : '—' },
              { label: 'SĐT / Zalo liên hệ', value: [pc?.phone, pc?.zalo].filter(Boolean).join(' · ') || '—' },
              { label: 'Tài khoản Web Khách hàng', value: c.hasPortalAccount ? 'Đã liên kết' : 'Chưa liên kết' },
              { label: 'Tạo lúc', value: formatDate(c.createdAt) },
              { label: 'Ghi chú nội bộ', value: c.note ?? '—', span: 2 },
            ]}
          />
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-3 flex items-center">
            <h2 className="text-heading-sm">Địa chỉ thường dùng</h2>
            <div className="flex-1" />
            <Button size="sm" variant="link" onClick={() => onTab('locations')}>
              Xem tất cả
            </Button>
          </div>
          {locations.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {locations.map((l) => (
                <li key={l.id} className="py-2">
                  <p className="font-medium">{l.name}</p>
                  <p className="text-caption text-text-muted">{l.address}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-text-muted">Chưa có địa chỉ thường dùng.</p>
          )}
        </section>
      </div>
      <section className="flex flex-col gap-3 self-start rounded-lg border border-border bg-surface p-5">
        <h2 className="text-heading-sm">Công nợ</h2>
        <DescriptionList
          columns={1}
          items={[
            { label: 'Tổng phải thu', value: <MoneyCell value={c.debtSummary.receivable} /> },
            { label: 'Đã phân bổ', value: <MoneyCell value={c.debtSummary.paid} /> },
            { label: 'Còn nợ', value: <MoneyCell value={c.debtSummary.remaining} strong /> },
            { label: 'Quá hạn', value: c.debtSummary.overdueOrders ? <span className="text-danger">{formatVnd(c.debtSummary.overdueAmount)} · tối đa {c.debtSummary.maxOverdueDays} ngày</span> : 'Không' },
            { label: 'Hạn mức · đã dùng', value: <CreditUsage limit={c.debtSummary.creditLimit} pct={c.debtSummary.limitUsagePct} /> },
            { label: 'Số ngày công nợ mặc định', value: c.defaultDebtDays !== null && c.defaultDebtDays !== undefined ? `${c.defaultDebtDays} ngày` : 'Theo mặc định nhà xe' },
          ]}
        />
        <Button variant="secondary" onClick={() => onTab('debt')}>
          Xem chi tiết công nợ
        </Button>
      </section>
    </div>
  );
}

/** WM-CUS-05 — Công nợ khách: tổng + tuổi nợ từ debtSummary; đơn còn nợ + phiếu thu từ API finance (customerDebt/payments). */
function DebtTab({ c }: { c: CustomerDetailFieldsFragment }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const d = c.debtSummary;
  const agingRows = AGING_BUCKETS.map((b) => ({ key: b.key, label: b.label, amount: (d.aging as unknown as Record<string, number>)[b.key] ?? 0 }));
  return (
    <div className="flex flex-col gap-4">
      <SummaryStrip
        items={[
          { label: 'Tổng phải thu', value: formatVnd(d.receivable) },
          { label: 'Đã phân bổ', value: formatVnd(d.paid), tone: 'success' },
          { label: 'Còn nợ', value: formatVnd(d.remaining), tone: d.remaining > 0 ? 'warning' : 'neutral' },
          { label: 'Quá hạn', value: formatVnd(d.overdueAmount), tone: d.overdueAmount > 0 ? 'danger' : 'neutral', hint: d.overdueOrders ? `${d.overdueOrders} đơn, tối đa ${d.maxOverdueDays} ngày` : undefined },
          { label: 'Số dư chưa phân bổ', value: formatVnd(c.creditBalance), tone: c.creditBalance > 0 ? 'info' : 'neutral' },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        {hasPermission('payment.create') ? (
          <Button onClick={() => navigate(`${PATHS.paymentNew}?customerId=${c.id}&type=CUSTOMER_PAYMENT`)}>Ghi nhận thanh toán</Button>
        ) : null}
        {hasPermission('debtStatement.create') ? (
          <Button variant="secondary" onClick={() => navigate(`${PATHS.debtStatements}?customerId=${c.id}&create=1`)}>
            Tạo bảng kê
          </Button>
        ) : null}
      </div>
      <section className="flex flex-col gap-2">
        <h3 className="text-heading-sm">Tuổi nợ</h3>
        <DataTable
          rows={agingRows}
          rowKey={(r) => r.key}
          columns={[
            { key: 'label', label: 'Nhóm tuổi nợ' },
            { key: 'amount', label: 'Còn nợ', money: true, render: (r) => <MoneyCell value={r.amount} tone={r.key !== 'current' && r.amount > 0 ? 'danger' : 'default'} /> },
          ]}
          totalRow={{ label: 'Tổng', amount: <MoneyCell value={d.remaining} strong /> }}
        />
      </section>
      {d.remaining <= 0 ? <EmptyState message="Khách không còn công nợ" /> : null}
      <CustomerDebtSection customerId={c.id} />
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <RequirePermission permission="customer.view">
      <CustomerDetail />
    </RequirePermission>
  );
}
