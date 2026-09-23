import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { Save } from 'lucide-react';
import { Banner, Button, PageHeader, toast } from '@bta/shadcn';
import { EXPENSE_KIND, type ExpenseKind } from '@bta/shared';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { Panel } from '@/features/master-data/helpers';
import { ExpenseFormBody, emptyExpense, toExpenseInput, validateExpense, type ExpenseFormState } from '../components/ExpenseFormBody';
import { CreateExpenseMutation } from '../graphql/finance';

/** WM-EXP-03 — Tạo phiếu chi (prefill ?kind=&tripId=&orderId=&vehicleId=&driverId=&supplierId=&paidBy=). */
export default function ExpenseFormPage() {
  return (
    <RequirePermission permission="expense.create">
      <ExpenseForm />
    </RequirePermission>
  );
}

function initialState(params: URLSearchParams): ExpenseFormState {
  const kind = (params.get('kind') ?? 'TRIP_COST') as ExpenseKind;
  const s = emptyExpense(EXPENSE_KIND[kind] ? kind : 'TRIP_COST');
  s.tripId = params.get('tripId');
  s.orderId = params.get('orderId');
  s.vehicleId = params.get('vehicleId');
  s.driverId = params.get('driverId');
  s.supplierId = params.get('supplierId');
  const paidBy = params.get('paidBy');
  if (paidBy === 'DRIVER' || paidBy === 'DRIVER_ADVANCE') {
    s.paidBy = paidBy;
    s.reimbursable = paidBy === 'DRIVER';
  }
  if (params.get('paidStatus') === 'UNPAID') s.paidStatus = 'UNPAID';
  return s;
}

function ExpenseForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [state, setState] = React.useState<ExpenseFormState>(() => initialState(params));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [create, { loading }] = useMutation(CreateExpenseMutation);

  async function submit(andNew: boolean) {
    const e = validateExpense(state);
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      const res = await create({ variables: { input: toExpenseInput(state) } });
      const x = res.data!.createExpense;
      toast.success(`Đã tạo phiếu chi ${x.code}`);
      if (andNew) setState({ ...emptyExpense(state.kind), expenseDate: state.expenseDate });
      else navigate(paths.expense(x.id));
    } catch (err) {
      toast.error(apolloErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Tạo phiếu chi"
        breadcrumb={[{ label: 'Thu chi & Công nợ', to: PATHS.finance }, { label: 'Phiếu chi', to: PATHS.expenses }, { label: 'Tạo mới' }]}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate(-1)}>Hủy</Button>
            <Button variant="secondary" loading={loading} onClick={() => void submit(true)}>Lưu & tạo tiếp</Button>
            <Button loading={loading} onClick={() => void submit(false)}>
              <Save /> Lưu phiếu chi
            </Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel>
          <ExpenseFormBody state={state} onChange={setState} errors={errors} />
        </Panel>
        <div className="flex flex-col gap-3">
          <Panel title="Sau khi lưu">
            <ul className="list-disc space-y-1 pl-4 text-body-sm text-text-muted">
              {EXPENSE_KIND[state.kind].isCost ? <li>Cộng vào chi phí và lãi/lỗ đơn/chuyến/xe được gắn.</li> : <li>Không tính vào chi phí lãi/lỗ (dòng tiền với tài xế).</li>}
              {state.kind === 'TRIP_ADVANCE' ? <li>Xuất hiện ở Tạm ứng chuyến để đối soát sau chuyến.</li> : null}
              {state.kind === 'SALARY_ADVANCE' ? <li>Tự trừ vào bảng lương kỳ tới của tài xế.</li> : null}
              {state.paidBy === 'DRIVER' && state.reimbursable ? <li>Công ty nợ tài xế số tiền này tới khi tạo phiếu hoàn ứng.</li> : null}
              {state.paidStatus === 'UNPAID' ? <li>Cộng vào công nợ phải trả nhà cung cấp.</li> : null}
            </ul>
          </Panel>
          <Banner tone="info" message="Chứng từ (hóa đơn, biên lai) tải lên ở màn chi tiết sau khi lưu phiếu." />
        </div>
      </div>
    </div>
  );
}
