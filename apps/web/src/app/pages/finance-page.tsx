import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@bta/shadcn';
import { PAYMENT_IN_KIND_LABEL } from '@bta/shared';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatMoney, parseMoney } from '../../lib/format';
import { EmptyState, Field, FormDialog, PageHeader } from '../components/page-shell';

const PAYMENTS = gql`
  query Payments {
    paymentsIn { id kind customerName driverName amount allocatedAmount receivedDate method notes }
  }
`;
const EXPENSES = gql`
  query Expenses {
    expenses { id categoryName amount expenseDate paymentStatus paidBy reimbursable isDriverAdvance supplierName orderCode vehiclePlate driverName notes }
  }
`;
const RECEIVABLES = gql`
  query Receivables($customerId: ID, $overdueOnly: Boolean) {
    receivables(customerId: $customerId, overdueOnly: $overdueOnly) {
      orderId orderCode orderDate customerName route totalAmount paidAmount remaining dueDate overdueDays
    }
  }
`;
const CUSTOMERS = gql`query FinCustomers { customers { id name creditBalance } }`;
const DRIVERS = gql`query FinDrivers { drivers { id fullName driverOwesCompany } }`;
const SUPPLIERS = gql`query FinSuppliers { suppliers { id name } }`;
const VEHICLES = gql`query FinVehicles { vehicles { id plateNumber } }`;
const EXP_CATS = gql`query FinExpCats { catalogItems(kind: EXPENSE_CATEGORY) { id name } }`;
const CREATE_PAYMENT = gql`mutation CreatePaymentIn($input: PaymentInInput!) { createPaymentIn(input: $input) { id } }`;
const CREATE_EXPENSE = gql`mutation CreateFinExpense($input: ExpenseInput!) { createExpense(input: $input) { id } }`;
const MARK_PAID = gql`mutation MarkExpensePaid($id: ID!) { markExpensePaid(id: $id) { id } }`;

export function FinancePage() {
  const { data: payData, refetch: refetchPayments } = useQuery<any>(PAYMENTS);
  const { data: expData, refetch: refetchExpenses } = useQuery<any>(EXPENSES);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const { data: recvData, refetch: refetchRecv } = useQuery<any>(RECEIVABLES, { variables: { overdueOnly } });
  const { data: custData } = useQuery<any>(CUSTOMERS);
  const { data: drvData } = useQuery<any>(DRIVERS);
  const { data: supData } = useQuery<any>(SUPPLIERS);
  const { data: vehData } = useQuery<any>(VEHICLES);
  const { data: catData } = useQuery<any>(EXP_CATS);

  const [createPayment, { loading: pLoading, error: pError }] = useMutation(CREATE_PAYMENT);
  const [createExpense, { loading: eLoading, error: eError }] = useMutation(CREATE_EXPENSE);
  const [markPaid] = useMutation(MARK_PAID);

  // ----- Phiếu thu -----
  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({
    kind: 'CUSTOMER_PAYMENT', customerId: '', driverId: '', amount: '', method: '', notes: '',
    allocations: [] as { orderId: string; amount: string }[],
  });
  const { data: custRecv } = useQuery<any>(RECEIVABLES, {
    skip: payForm.kind !== 'CUSTOMER_PAYMENT' || !payForm.customerId,
    variables: { customerId: payForm.customerId || null, overdueOnly: false },
  });

  // Gợi ý phân bổ: tự chia số tiền vào các đơn còn nợ theo thứ tự cũ nhất
  const autoAllocate = () => {
    let left = parseMoney(payForm.amount);
    const allocs: { orderId: string; amount: string }[] = [];
    for (const r of custRecv?.receivables ?? []) {
      if (left <= 0) break;
      const a = Math.min(left, r.remaining);
      allocs.push({ orderId: r.orderId, amount: String(a) });
      left -= a;
    }
    setPayForm({ ...payForm, allocations: allocs });
  };

  const submitPayment = async () => {
    await createPayment({
      variables: {
        input: {
          kind: payForm.kind,
          customerId: payForm.kind === 'CUSTOMER_PAYMENT' ? payForm.customerId : null,
          driverId: payForm.kind === 'DRIVER_COD_REMIT' ? payForm.driverId : null,
          amount: parseMoney(payForm.amount),
          receivedDate: new Date().toISOString(),
          method: payForm.method || null,
          notes: payForm.notes || null,
          allocations: payForm.allocations
            .filter((a) => a.orderId && a.amount)
            .map((a) => ({ orderId: a.orderId, amount: parseMoney(a.amount) })),
        },
      },
    });
    setPayOpen(false);
    refetchPayments();
    refetchRecv();
  };

  // ----- Phiếu chi -----
  const [expOpen, setExpOpen] = useState(false);
  const [expForm, setExpForm] = useState({
    categoryId: '', amount: '', supplierId: '', vehicleId: '', driverId: '',
    paidByDriver: false, isDriverAdvance: false, markPaid: true, notes: '',
  });
  const submitExpense = async () => {
    await createExpense({
      variables: {
        input: {
          categoryId: expForm.categoryId,
          amount: parseMoney(expForm.amount),
          expenseDate: new Date().toISOString(),
          supplierId: expForm.supplierId || null,
          vehicleId: expForm.vehicleId || null,
          driverId: expForm.driverId || null,
          paidBy: expForm.paidByDriver ? 'DRIVER' : 'COMPANY',
          reimbursable: expForm.paidByDriver,
          isDriverAdvance: expForm.isDriverAdvance,
          markPaid: expForm.markPaid,
          notes: expForm.notes || null,
        },
      },
    });
    setExpOpen(false);
    refetchExpenses();
  };

  const payments = payData?.paymentsIn ?? [];
  const expenses = expData?.expenses ?? [];
  const receivables = recvData?.receivables ?? [];
  const totalRemaining = useMemo(
    () => receivables.reduce((s: number, r: any) => s + r.remaining, 0),
    [receivables],
  );

  return (
    <div>
      <PageHeader
        title="Thu chi & công nợ"
        actions={
          <>
            <Button variant="outline" onClick={() => { setExpForm({ categoryId: '', amount: '', supplierId: '', vehicleId: '', driverId: '', paidByDriver: false, isDriverAdvance: false, markPaid: true, notes: '' }); setExpOpen(true); }}>
              <Plus className="size-4" /> Phiếu chi
            </Button>
            <Button onClick={() => { setPayForm({ kind: 'CUSTOMER_PAYMENT', customerId: '', driverId: '', amount: '', method: '', notes: '', allocations: [] }); setPayOpen(true); }}>
              <Plus className="size-4" /> Phiếu thu
            </Button>
          </>
        }
      />

      <Tabs defaultValue="receivables">
        <TabsList>
          <TabsTrigger value="receivables">Công nợ khách ({formatMoney(totalRemaining)})</TabsTrigger>
          <TabsTrigger value="payments">Phiếu thu</TabsTrigger>
          <TabsTrigger value="expenses">Phiếu chi</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables" className="mt-3">
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} />
            Chỉ hiện quá hạn
          </label>
          {receivables.length === 0 ? (
            <EmptyState message="Không có công nợ" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày đơn</TableHead><TableHead>Mã đơn</TableHead><TableHead>Khách</TableHead>
                  <TableHead>Tuyến</TableHead><TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-right">Đã thu</TableHead><TableHead className="text-right">Còn lại</TableHead>
                  <TableHead>Hạn</TableHead><TableHead className="text-right">Quá hạn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivables.map((r: any) => (
                  <TableRow key={r.orderId}>
                    <TableCell>{formatDate(r.orderDate)}</TableCell>
                    <TableCell className="font-medium"><Link className="hover:underline" to={`/orders/${r.orderId}`}>{r.orderCode}</Link></TableCell>
                    <TableCell>{r.customerName}</TableCell>
                    <TableCell className="max-w-56 truncate">{r.route}</TableCell>
                    <TableCell className="text-right">{formatMoney(r.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatMoney(r.paidAmount)}</TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(r.remaining)}</TableCell>
                    <TableCell>{formatDate(r.dueDate)}</TableCell>
                    <TableCell className={`text-right ${r.overdueDays > 0 ? 'font-medium text-red-600' : ''}`}>
                      {r.overdueDays > 0 ? `${r.overdueDays} ngày` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-3">
          {payments.length === 0 ? (
            <EmptyState message="Chưa có phiếu thu" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead><TableHead>Loại</TableHead><TableHead>Đối tượng</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead><TableHead className="text-right">Đã phân bổ</TableHead>
                  <TableHead>Hình thức</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.receivedDate)}</TableCell>
                    <TableCell>
                      {PAYMENT_IN_KIND_LABEL[p.kind as keyof typeof PAYMENT_IN_KIND_LABEL]}
                      {p.kind === 'DRIVER_COD_REMIT' && <span className="ml-1 text-xs text-muted-foreground">(không phải doanh thu)</span>}
                    </TableCell>
                    <TableCell>{p.customerName ?? p.driverName ?? '—'}</TableCell>
                    <TableCell className="text-right">{formatMoney(p.amount)}</TableCell>
                    <TableCell className="text-right">{formatMoney(p.allocatedAmount)}</TableCell>
                    <TableCell>{p.method ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-3">
          {expenses.length === 0 ? (
            <EmptyState message="Chưa có phiếu chi" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead><TableHead>Loại</TableHead><TableHead>Gắn với</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead><TableHead>Trạng thái</TableHead><TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>{formatDate(e.expenseDate)}</TableCell>
                    <TableCell>
                      {e.categoryName}
                      {e.isDriverAdvance && <span className="ml-1 text-xs text-amber-600">(ứng lương)</span>}
                      {e.reimbursable && <span className="ml-1 text-xs text-amber-600">(tài xế ứng)</span>}
                    </TableCell>
                    <TableCell className="max-w-52 truncate">
                      {[e.supplierName, e.orderCode, e.vehiclePlate, e.driverName].filter(Boolean).join(' · ') || '—'}
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(e.amount)}</TableCell>
                    <TableCell>{e.paymentStatus === 'PAID' ? 'Đã trả' : <span className="text-amber-600">Chưa trả</span>}</TableCell>
                    <TableCell className="text-right">
                      {e.paymentStatus === 'UNPAID' && (
                        <Button size="sm" variant="outline" onClick={async () => { await markPaid({ variables: { id: e.id } }); refetchExpenses(); }}>
                          Đánh dấu đã trả
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog phiếu thu */}
      <FormDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        title="Tạo phiếu thu"
        onSubmit={submitPayment}
        submitDisabled={
          !payForm.amount ||
          (payForm.kind === 'CUSTOMER_PAYMENT' && !payForm.customerId) ||
          (payForm.kind === 'DRIVER_COD_REMIT' && !payForm.driverId)
        }
        loading={pLoading}
        error={pError?.message}
        wide
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Loại phiếu thu">
            <Select value={payForm.kind} onValueChange={(v) => setPayForm({ ...payForm, kind: v, allocations: [] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_IN_KIND_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Số tiền (₫) *">
            <Input value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
          </Field>
          {payForm.kind === 'CUSTOMER_PAYMENT' && (
            <Field label="Khách hàng *">
              <Select value={payForm.customerId} onValueChange={(v) => setPayForm({ ...payForm, customerId: v, allocations: [] })}>
                <SelectTrigger><SelectValue placeholder="Chọn khách" /></SelectTrigger>
                <SelectContent>
                  {(custData?.customers ?? []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.creditBalance > 0 ? ` (dư ${formatMoney(c.creditBalance)})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          {payForm.kind === 'DRIVER_COD_REMIT' && (
            <Field label="Tài xế *">
              <Select value={payForm.driverId} onValueChange={(v) => setPayForm({ ...payForm, driverId: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn tài xế" /></SelectTrigger>
                <SelectContent>
                  {(drvData?.drivers ?? []).map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.fullName}{d.driverOwesCompany > 0 ? ` (đang giữ ${formatMoney(d.driverOwesCompany)})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Hình thức">
            <Input value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} placeholder="Chuyển khoản / tiền mặt" />
          </Field>
          <Field label="Ghi chú">
            <Input value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} />
          </Field>
        </div>

        {payForm.kind === 'CUSTOMER_PAYMENT' && payForm.customerId && (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">Phân bổ vào đơn (operation tự trừ)</span>
              <Button variant="outline" size="sm" onClick={autoAllocate} disabled={!payForm.amount}>
                Tự phân bổ đơn cũ trước
              </Button>
            </div>
            {(custRecv?.receivables ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Khách này không còn đơn nợ — tiền sẽ vào số dư</p>
            ) : (
              <Table>
                <TableBody>
                  {(custRecv?.receivables ?? []).map((r: any) => {
                    const alloc = payForm.allocations.find((a) => a.orderId === r.orderId);
                    return (
                      <TableRow key={r.orderId}>
                        <TableCell>{r.orderCode}</TableCell>
                        <TableCell className="text-right text-muted-foreground">còn {formatMoney(r.remaining)}</TableCell>
                        <TableCell className="w-40">
                          <Input
                            placeholder="Số tiền trừ"
                            value={alloc?.amount ?? ''}
                            onChange={(e) => {
                              const rest = payForm.allocations.filter((a) => a.orderId !== r.orderId);
                              setPayForm({
                                ...payForm,
                                allocations: e.target.value ? [...rest, { orderId: r.orderId, amount: e.target.value }] : rest,
                              });
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Phần chưa phân bổ sẽ nằm trong số dư (credit) của khách.
            </p>
          </div>
        )}
      </FormDialog>

      {/* Dialog phiếu chi */}
      <FormDialog
        open={expOpen}
        onOpenChange={setExpOpen}
        title="Tạo phiếu chi"
        onSubmit={submitExpense}
        submitDisabled={!expForm.categoryId || !expForm.amount}
        loading={eLoading}
        error={eError?.message}
      >
        <Field label="Loại chi *">
          <Select value={expForm.categoryId} onValueChange={(v) => setExpForm({ ...expForm, categoryId: v })}>
            <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
            <SelectContent>
              {(catData?.catalogItems ?? []).map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Số tiền (₫) *"><Input value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} /></Field>
        <Field label="Nhà cung cấp (tùy chọn)">
          <Select value={expForm.supplierId || 'NONE'} onValueChange={(v) => setExpForm({ ...expForm, supplierId: v === 'NONE' ? '' : v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Không</SelectItem>
              {(supData?.suppliers ?? []).map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Xe (vật tư, tùy chọn)">
          <Select value={expForm.vehicleId || 'NONE'} onValueChange={(v) => setExpForm({ ...expForm, vehicleId: v === 'NONE' ? '' : v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Không</SelectItem>
              {(vehData?.vehicles ?? []).map((v: any) => (
                <SelectItem key={v.id} value={v.id}>{v.plateNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Tài xế (hoàn ứng / ứng lương, tùy chọn)">
          <Select value={expForm.driverId || 'NONE'} onValueChange={(v) => setExpForm({ ...expForm, driverId: v === 'NONE' ? '' : v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Không</SelectItem>
              {(drvData?.drivers ?? []).map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid gap-1 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={expForm.isDriverAdvance} onChange={(e) => setExpForm({ ...expForm, isDriverAdvance: e.target.checked })} />
            Là khoản ứng lương tài xế (trừ vào bảng lương)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={expForm.markPaid} onChange={(e) => setExpForm({ ...expForm, markPaid: e.target.checked })} />
            Đã chi tiền (bỏ chọn nếu ghi nhận nợ NCC)
          </label>
        </div>
        <Field label="Ghi chú"><Input value={expForm.notes} onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })} /></Field>
      </FormDialog>
    </div>
  );
}
