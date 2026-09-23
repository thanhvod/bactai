import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { FileText, Plus } from 'lucide-react';
import {
  Banner,
  Button,
  DataTable,
  DateField,
  Drawer,
  EmptyState,
  EntityPicker,
  ErrorState,
  FilterBar,
  FilterChip,
  FormField,
  MoneyCell,
  PageHeader,
  Pagination,
  RadioGroup,
  StatusBadge,
  Textarea,
  toast,
  type DataTableColumn,
  type PickerItem,
} from '@bta/shadcn';
import { DEBT_STATEMENT_STATUS, formatDate, formatDateTime, formatVnd, isoDate } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { paths } from '@/app/routes';
import type { DsFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { CellLink, useCursorPaging, useDebounced } from '@/features/master-data/helpers';
import { DsCreateMutation, DsCustomerOptionsQuery, DsListQuery } from '../graphql/debt-statements';

type Row = DsFieldsFragment;

/** WM-DEBT-03 — Danh sách bảng kê công nợ (nháp/đã chốt/đã gửi/đã hủy); tạo nháp & xem trước. `?customerId=&create=1` mở form. */
export default function DebtStatementListPage() {
  return (
    <RequirePermission permission={['debt.view', 'debtStatement.create']}>
      <DebtStatementList />
    </RequirePermission>
  );
}

function DebtStatementList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = params.get('status');
  const customerId = params.get('customerId');
  const paging = useCursorPaging();
  const [createOpen, setCreateOpen] = React.useState(params.get('create') === '1');
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    paging.reset();
  };
  const { data, loading, error, refetch } = useQuery(DsListQuery, {
    variables: { filter: { status: status ? [status] : null, customerId }, first: paging.first, after: paging.after },
  });
  const rows = data?.debtStatements.nodes ?? [];
  const canCreate = hasPermission('debtStatement.create');

  const columns: DataTableColumn<Row>[] = [
    { key: 'code', label: 'Mã bảng kê', width: 150, render: (r) => <span className="font-mono">{r.code}</span> },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (r) => (
        <div className="flex flex-col">
          <CellLink to={paths.customer(r.customer.id, 'statements')} className="font-medium text-text hover:text-accent hover:underline">
            {r.customer.name}
          </CellLink>
          <span className="text-caption text-text-subtle">{r.customer.code}</span>
        </div>
      ),
    },
    { key: 'period', label: 'Kỳ đối chiếu', render: (r) => `${formatDate(r.periodFrom)} – ${formatDate(r.periodTo)}` },
    { key: 'lines', label: 'Số đơn', align: 'right', hideBelow: 'md', render: (r) => <span className="tabular-nums">{r.lineCount}</span> },
    { key: 'total', label: 'Tổng tiền', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.totalAmount} /> },
    { key: 'paid', label: 'Đã thu', money: true, hideBelow: 'lg', render: (r) => <MoneyCell value={r.paidAmount} tone="success" /> },
    { key: 'remaining', label: 'Còn lại', money: true, render: (r) => <MoneyCell value={r.remainingAmount} strong tone={r.remainingAmount > 0 ? 'warning' : 'default'} /> },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <StatusBadge meta={DEBT_STATEMENT_STATUS} status={r.status} outline={r.status === 'CANCELLED'} />
          <span className="text-caption text-text-subtle">
            {r.sentAt ? `Gửi ${formatDate(r.sentAt)}` : r.finalizedAt ? `Chốt ${formatDateTime(r.finalizedAt)}` : `Tạo ${formatDate(r.createdAt)}`}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Bảng kê công nợ"
        subtitle="Bảng kê đã chốt lưu snapshot số liệu tại thời điểm chốt — không đổi khi đơn/phiếu thu thay đổi sau đó."
        actions={
          canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus /> Tạo bảng kê
            </Button>
          ) : null
        }
      />
      <FilterBar
        chips={
          <>
            {customerId ? <FilterChip label="Đang lọc theo khách" active onRemove={() => setParam('customerId', null)} /> : null}
            {(['DRAFT', 'FINALIZED', 'SENT', 'CANCELLED'] as const).map((s) => (
              <FilterChip key={s} label={DEBT_STATEMENT_STATUS[s].label} active={status === s} onClick={() => setParam('status', status === s ? null : s)} />
            ))}
          </>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            loading={loading && !data}
            onRowClick={(r) => navigate(paths.debtStatement(r.id))}
            rowClassName={(r) => (r.status === 'CANCELLED' ? 'opacity-60' : undefined)}
            empty={
              <EmptyState
                icon={<FileText strokeWidth={1.5} />}
                message={status || customerId ? 'Không có bảng kê khớp bộ lọc' : 'Chưa có bảng kê công nợ'}
                description="Tạo bảng kê cho khách theo kỳ, xem trước rồi chốt để xuất PDF gửi khách."
                action={canCreate ? <Button onClick={() => setCreateOpen(true)}><Plus /> Tạo bảng kê</Button> : null}
              />
            }
          />
          <Pagination
            hasNextPage={!!data?.debtStatements.pageInfo.hasNextPage}
            hasPrevPage={paging.hasPrev}
            onNext={() => paging.next(data?.debtStatements.pageInfo.endCursor)}
            onPrev={paging.prev}
            pageSize={paging.pageSize}
            onPageSizeChange={paging.setPageSize}
            shown={rows.length}
            total={data?.debtStatements.totalCount}
          />
        </>
      )}
      <CreateStatementDrawer
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o && params.get('create')) setParam('create', null);
        }}
        defaultCustomerId={customerId}
        onCreated={(id) => navigate(paths.debtStatement(id))}
      />
    </div>
  );
}

function firstOfMonth(d = new Date()) {
  return isoDate(new Date(d.getFullYear(), d.getMonth(), 1, 12));
}

/** Tạo bảng kê nháp: khách + kỳ + phạm vi → chuyển sang chi tiết để xem trước, làm mới, chốt. */
export function CreateStatementDrawer({ open, onOpenChange, defaultCustomerId, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; defaultCustomerId?: string | null; onCreated: (id: string) => void }) {
  const [search, setSearch] = React.useState('');
  const q = useDebounced(search);
  const [customerId, setCustomerId] = React.useState<string | null>(defaultCustomerId ?? null);
  const [from, setFrom] = React.useState(firstOfMonth(new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)));
  const [to, setTo] = React.useState(isoDate(new Date()));
  const [scope, setScope] = React.useState('UNPAID_ONLY');
  const [note, setNote] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);
  const { data, loading } = useQuery(DsCustomerOptionsQuery, { variables: { search: q || null }, skip: !open });
  const [create, { loading: creating }] = useMutation(DsCreateMutation);
  React.useEffect(() => {
    if (open) {
      setCustomerId(defaultCustomerId ?? null);
      setErr(null);
    }
  }, [open, defaultCustomerId]);
  const items: PickerItem[] = (data?.customers.nodes ?? []).map((c) => ({
    id: c.id,
    label: c.name,
    code: c.code,
    description: `${c.phone ?? ''}${c.debtSummary.remaining ? ` · còn nợ ${formatVnd(c.debtSummary.remaining)}` : ''}`,
  }));

  const submit = async () => {
    setErr(null);
    if (!customerId) return setErr('Chọn khách hàng');
    if (from > to) return setErr('Từ ngày phải trước đến ngày');
    try {
      const r = await create({ variables: { input: { customerId, periodFrom: from, periodTo: to, scope, note: note.trim() || null } } });
      const s = r.data?.createDebtStatement;
      if (s) {
        toast.success(`Đã tạo bảng kê nháp ${s.code}`);
        onOpenChange(false);
        onCreated(s.id);
      }
    } catch (e) {
      setErr(apolloErrorMessage(e));
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Tạo bảng kê công nợ"
      description="Bảng kê nháp tính số liệu tại thời điểm tạo; có thể làm mới trước khi chốt."
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={creating} onClick={() => void submit()}>
            Tạo nháp & xem trước
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {err ? <Banner tone="danger" message={err} /> : null}
        <FormField label="Khách hàng" required>
          <EntityPicker items={items} value={customerId} onChange={(id) => setCustomerId(id)} onSearch={setSearch} loading={loading} placeholder="Chọn khách hàng" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Từ ngày (ngày đơn)" required>
            <DateField value={from} onChange={setFrom} />
          </FormField>
          <FormField label="Đến ngày" required>
            <DateField value={to} onChange={setTo} />
          </FormField>
        </div>
        <FormField label="Phạm vi">
          <RadioGroup
            value={scope}
            onValueChange={setScope}
            options={[
              { value: 'UNPAID_ONLY', label: 'Chỉ đơn còn nợ', description: 'Đơn trong kỳ còn phải thu' },
              { value: 'ALL_IN_PERIOD', label: 'Tất cả đơn trong kỳ', description: 'Kèm đơn đã thu đủ để khách đối chiếu' },
            ]}
          />
        </FormField>
        <FormField label="Ghi chú (in trên bảng kê)">
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </div>
    </Drawer>
  );
}
