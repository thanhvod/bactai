import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { Save } from 'lucide-react';
import {
  Banner,
  Button,
  Checkbox,
  DataTable,
  DateField,
  EmptyState,
  EntityPicker,
  FormField,
  FormSection,
  Input,
  MoneyCell,
  MoneyInput,
  PageHeader,
  RadioGroup,
  Select,
  Textarea,
  toast,
  type DataTableColumn,
} from '@bta/shadcn';
import { formatDate, formatVnd, paymentInSchema } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { DriverCodItemFieldsFragment } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { Panel } from '@/features/master-data/helpers';
import { PAYMENT_METHOD, nowInputDateTime, options, sum, useCustomerPicker, useMasterPickers } from '../components/common';
import { CreatePaymentMutation, DriverCodHeldQuery } from '../graphql/finance';

const TYPE_OPTIONS = [
  { value: 'CUSTOMER_PAYMENT', label: 'Khách trả', description: 'Tiền khách chuyển/trả — phân bổ vào đơn, phần dư thành số dư khách' },
  { value: 'DRIVER_COD_REMITTANCE', label: 'Tài xế nộp COD', description: 'Thu hồi tiền thu hộ tài xế đang giữ — không phải doanh thu' },
  { value: 'OTHER', label: 'Thu khác', description: 'Khoản thu ngoài đơn hàng' },
];

/** WM-PAY-03 — Tạo phiếu thu (prefill ?type=&customerId=&driverId=&stopIds=). */
export default function PaymentFormPage() {
  return (
    <RequirePermission permission="payment.create">
      <PaymentForm />
    </RequirePermission>
  );
}

interface Errors {
  [field: string]: string | undefined;
}

function PaymentForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { hasPermission, account } = useAuth();
  const initialType = params.get('type') ?? 'CUSTOMER_PAYMENT';
  const [type, setType] = React.useState(initialType);
  const [customerId, setCustomerId] = React.useState<string | null>(params.get('customerId'));
  const [driverId, setDriverId] = React.useState<string | null>(params.get('driverId'));
  const [payerName, setPayerName] = React.useState('');
  const [amount, setAmount] = React.useState<number | null>(null);
  const [receivedAt, setReceivedAt] = React.useState(nowInputDateTime());
  const [method, setMethod] = React.useState(initialType === 'DRIVER_COD_REMITTANCE' ? 'CASH' : 'BANK_TRANSFER');
  const [bankAccount, setBankAccount] = React.useState('');
  const [transferNote, setTransferNote] = React.useState('');
  const [receivedBy, setReceivedBy] = React.useState(account?.name ?? '');
  const [note, setNote] = React.useState('');
  const [selectedStops, setSelectedStops] = React.useState<Set<string>>(new Set((params.get('stopIds') ?? '').split(',').filter(Boolean)));
  const [errors, setErrors] = React.useState<Errors>({});
  const customers = useCustomerPicker();
  const pickers = useMasterPickers();
  const [create, { loading: saving }] = useMutation(CreatePaymentMutation);
  const isCod = type === 'DRIVER_COD_REMITTANCE';
  const isAdvanceReturn = type === 'DRIVER_ADVANCE_RETURN';
  const canCod = hasPermission('cod.remittance.record');

  const { data: codData, loading: codLoading } = useQuery(DriverCodHeldQuery, { variables: { filter: { driverId } }, skip: !isCod || !driverId });
  const codRow = codData?.driverCodHeld.rows.find((r) => r.driver.id === driverId);
  const codItems = codRow?.items ?? [];
  const selectedTotal = sum(codItems.filter((i) => selectedStops.has(i.stopId)).map((i) => i.held));

  // Chọn khoản COD → tự điền số tiền = tổng còn giữ của các khoản chọn.
  React.useEffect(() => {
    if (isCod && selectedStops.size && codItems.length) setAmount(selectedTotal);
  }, [selectedTotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const typeOptions = isAdvanceReturn
    ? [...TYPE_OPTIONS, { value: 'DRIVER_ADVANCE_RETURN', label: 'Tài xế hoàn tạm ứng', description: 'Tài xế nộp lại tạm ứng dư — tạo từ màn đối soát tạm ứng' }]
    : TYPE_OPTIONS.filter((o) => o.value !== 'DRIVER_COD_REMITTANCE' || canCod);

  async function submit(andNew: boolean) {
    const input = {
      type,
      customerId: type === 'CUSTOMER_PAYMENT' ? customerId : null,
      driverId: isCod || isAdvanceReturn ? driverId : null,
      tripId: isAdvanceReturn ? params.get('tripId') : null,
      payerName: type === 'OTHER' ? payerName.trim() || null : null,
      amount: amount ?? 0,
      receivedAt: new Date(receivedAt).toISOString(),
      method,
      bankAccount: bankAccount.trim() || null,
      transferNote: transferNote.trim() || null,
      receivedBy: receivedBy.trim() || null,
      note: note.trim() || null,
      codStopIds: isCod && selectedStops.size ? [...selectedStops] : undefined,
    };
    const next: Errors = {};
    const parsed = paymentInSchema.safeParse(input);
    if (!parsed.success) for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
    if (type === 'CUSTOMER_PAYMENT' && !customerId) next.customerId = 'Chọn khách hàng';
    if ((isCod || isAdvanceReturn) && !driverId) next.driverId = 'Chọn tài xế';
    if (type === 'OTHER' && !payerName.trim()) next.payerName = 'Nhập người nộp';
    if (isCod && codRow && (amount ?? 0) > codRow.codHeld) next.amount = `Vượt số COD tài xế đang giữ (${formatVnd(codRow.codHeld)})`;
    if (isCod && selectedStops.size && (amount ?? 0) !== selectedTotal) next.amount = `Số tiền phải bằng tổng các khoản đã chọn (${formatVnd(selectedTotal)})`;
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      toast.error(Object.values(next).find(Boolean) as string);
      return;
    }
    try {
      const res = await create({ variables: { input: { ...input, clientRequestId: crypto.randomUUID() } } });
      const p = res.data!.createPaymentIn;
      toast.success(`Đã tạo phiếu thu ${p.code}`);
      if (andNew) {
        setAmount(null);
        setNote('');
        setTransferNote('');
        setSelectedStops(new Set());
      } else navigate(paths.payment(p.id));
    } catch (e) {
      toast.error(apolloErrorMessage(e));
    }
  }

  const codColumns: DataTableColumn<DriverCodItemFieldsFragment>[] = [
    {
      key: 'sel',
      label: '',
      width: 40,
      render: (r) => (
        <Checkbox
          checked={selectedStops.has(r.stopId)}
          onCheckedChange={(c) =>
            setSelectedStops((s) => {
              const n = new Set(s);
              if (c) n.add(r.stopId);
              else n.delete(r.stopId);
              return n;
            })
          }
          aria-label={`Chọn ${r.orderCode}`}
        />
      ),
    },
    { key: 'order', label: 'Đơn / chuyến', render: (r) => <div className="flex flex-col"><span className="font-mono text-body-sm">{r.orderCode}</span><span className="text-caption text-text-subtle">{r.tripCode ?? '—'} · {r.customerName}</span></div> },
    { key: 'stop', label: 'Điểm thu', render: (r) => <span className="text-body-sm">#{r.stopSequence} {r.stopName ?? r.address}</span> },
    { key: 'date', label: 'Ngày thu', render: (r) => formatDate(r.collectedAt) },
    { key: 'actual', label: 'Thực thu', money: true, render: (r) => <MoneyCell value={r.codActual} /> },
    { key: 'held', label: 'Còn giữ', money: true, render: (r) => <MoneyCell value={r.held} strong tone={r.daysHeld >= (codData?.driverCodHeld.codWarningDays ?? 2) ? 'danger' : 'default'} /> },
    { key: 'days', label: 'Số ngày giữ', align: 'right', render: (r) => `${r.daysHeld} ngày` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Tạo phiếu thu"
        breadcrumb={[{ label: 'Thu chi & Công nợ', to: PATHS.finance }, { label: 'Phiếu thu', to: PATHS.payments }, { label: 'Tạo mới' }]}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate(-1)}>Hủy</Button>
            <Button variant="secondary" loading={saving} onClick={() => void submit(true)}>Lưu & tạo tiếp</Button>
            <Button loading={saving} onClick={() => void submit(false)}>
              <Save /> Lưu phiếu thu
            </Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Panel title="Loại thu">
            <RadioGroup value={type} onValueChange={(v) => { setType(v); setErrors({}); setMethod(v === 'DRIVER_COD_REMITTANCE' ? 'CASH' : 'BANK_TRANSFER'); }} options={typeOptions} />
          </Panel>
          <Panel title="Thông tin phiếu thu">
            <FormSection title="Người nộp">
              {type === 'CUSTOMER_PAYMENT' ? (
                <FormField label="Khách hàng" required error={errors.customerId}>
                  <EntityPicker items={customers.items} loading={customers.loading} onSearch={customers.onSearch} value={customerId} onChange={(id) => setCustomerId(id)} placeholder="Chọn khách hàng" />
                </FormField>
              ) : isCod || isAdvanceReturn ? (
                <FormField label="Tài xế" required error={errors.driverId}>
                  <EntityPicker items={pickers.drivers} loading={pickers.loading} value={driverId} onChange={(id) => { setDriverId(id); setSelectedStops(new Set()); }} placeholder="Chọn tài xế" />
                </FormField>
              ) : (
                <FormField label="Người nộp" required error={errors.payerName}>
                  <Input value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Tên người/đơn vị nộp" />
                </FormField>
              )}
            </FormSection>
            <FormSection title="Số tiền & hình thức">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Số tiền" required error={errors.amount} hint={isCod && codRow ? `Tài xế đang giữ ${formatVnd(codRow.codHeld)}` : undefined}>
                  <MoneyInput value={amount} onChange={setAmount} />
                </FormField>
                <FormField label="Ngày giờ thu" required error={errors.receivedAt}>
                  <DateField mode="datetime" value={receivedAt} onChange={setReceivedAt} />
                </FormField>
                <FormField label="Hình thức">
                  <Select value={method} onValueChange={setMethod} options={options(PAYMENT_METHOD)} />
                </FormField>
                <FormField label="Người nhận tiền">
                  <Input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} />
                </FormField>
                {method === 'BANK_TRANSFER' ? (
                  <>
                    <FormField label="Tài khoản nhận">
                      <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="VD: VCB 0123456789" />
                    </FormField>
                    <FormField label="Nội dung chuyển khoản">
                      <Input value={transferNote} onChange={(e) => setTransferNote(e.target.value)} />
                    </FormField>
                  </>
                ) : null}
              </div>
              <FormField label="Ghi chú" className="mt-3">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
              </FormField>
            </FormSection>
          </Panel>
          {isCod ? (
            <Panel title="Khoản COD đối trừ" actions={codRow ? <span className="text-body-sm text-text-muted">Đã chọn {formatVnd(selectedTotal)} / đang giữ {formatVnd(codRow.codHeld)}</span> : null}>
              {!driverId ? (
                <EmptyState compact message="Chọn tài xế để xem các khoản COD đang giữ" />
              ) : (
                <DataTable
                  columns={codColumns}
                  rows={codItems}
                  rowKey={(r) => r.stopId}
                  loading={codLoading}
                  compact
                  empty={<EmptyState compact message="Tài xế không còn giữ khoản COD nào" />}
                />
              )}
              <p className="mt-2 text-caption text-text-muted">Không chọn khoản nào: hệ thống trừ lần lượt từ khoản thu cũ nhất (FIFO).</p>
            </Panel>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <Panel title="Sau khi lưu">
            {type === 'CUSTOMER_PAYMENT' ? (
              <ul className="list-disc space-y-1 pl-4 text-body-sm text-text-muted">
                <li>Mở chi tiết phiếu để phân bổ vào từng đơn còn nợ.</li>
                <li>Phần chưa phân bổ thành số dư (credit) của khách.</li>
                <li>Phiếu thu không phải doanh thu — doanh thu lấy từ đơn.</li>
              </ul>
            ) : isCod ? (
              <ul className="list-disc space-y-1 pl-4 text-body-sm text-text-muted">
                <li>Giảm số COD tài xế đang giữ.</li>
                <li>Không đổi doanh thu, không đổi công nợ khách.</li>
              </ul>
            ) : (
              <p className="text-body-sm text-text-muted">Ghi nhận tiền vào sổ thu chi.</p>
            )}
          </Panel>
          <Banner tone="info" message="Chứng từ (ảnh chuyển khoản, biên nhận) tải lên ở màn chi tiết sau khi lưu phiếu." />
        </div>
      </div>
    </div>
  );
}
