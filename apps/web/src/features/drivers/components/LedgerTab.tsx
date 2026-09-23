import { useNavigate } from 'react-router';
import { ArrowLeftRight, HandCoins, Receipt } from 'lucide-react';
import { Banner, Button, EmptyState, SegmentedControl, SummaryStrip } from '@bta/shadcn';
import { formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { PATHS } from '@/app/routes';
import type { DriverListFieldsFragment } from '@/gql/graphql';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { DriverLedgerDetail } from '@/features/finance/components/FinanceSections';

type Ledger = DriverListFieldsFragment['ledgerSummary'];

export function reimburseUrl(driverId: string) {
  return `${PATHS.expenseNew}?kind=DRIVER_REIMBURSEMENT&driverId=${driverId}`;
}
export function codRemitUrl(driverId: string) {
  return `${PATHS.paymentNew}?type=DRIVER_COD_REMITTANCE&driverId=${driverId}`;
}

/**
 * WM-DRV-05 (Sổ công nợ) / WM-DRV-06 (COD đang giữ — `?view=cod`).
 * Tổng hợp lấy từ driver.ledgerSummary (FinanceCalcService); bảng bút toán + COD theo điểm dừng từ
 * API tài chính `driverLedger` / `driverCodHeld` (DriverLedgerDetail).
 */
export function LedgerTab({ driverId, ledger }: { driverId: string; ledger: Ledger }) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [view, setView] = useQueryParam('view');
  const codWarn = ledger.overAmount || ledger.overDays;
  const balanced = ledger.codHeld === 0 && ledger.companyOwesDriver === 0 && ledger.driverOwesCompany === 0;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl
          value={view === 'cod' ? 'cod' : 'ledger'}
          onChange={(v) => setView(v === 'cod' ? 'cod' : null)}
          items={[
            { value: 'ledger', label: 'Sổ công nợ' },
            { value: 'cod', label: 'COD đang giữ' },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          {hasPermission('expense.create') ? (
            <Button variant="secondary" size="sm" onClick={() => navigate(reimburseUrl(driverId))}>
              <Receipt /> Tạo phiếu chi hoàn ứng
            </Button>
          ) : null}
          {hasPermission('cod.remittance.record') ? (
            <Button variant="secondary" size="sm" onClick={() => navigate(codRemitUrl(driverId))}>
              <HandCoins /> Ghi nhận nộp COD
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => navigate(`${PATHS.tripAdvances}?driverId=${driverId}`)}>
            <ArrowLeftRight /> Đối soát tạm ứng
          </Button>
        </div>
      </div>
      <SummaryStrip
        items={[
          { label: 'Công ty nợ tài xế', value: formatVnd(ledger.companyOwesDriver), tone: ledger.companyOwesDriver > 0 ? 'warning' : 'neutral', hint: 'Chi phí tài xế chi trước chưa hoàn' },
          { label: 'COD tài xế đang giữ', value: formatVnd(ledger.codHeld), tone: codWarn ? 'danger' : 'neutral', hint: ledger.codHeld > 0 ? `Khoản cũ nhất ${ledger.daysHeld} ngày` : undefined },
          { label: 'Tài xế nợ công ty', value: formatVnd(ledger.driverOwesCompany), tone: ledger.driverOwesCompany > 0 ? 'warning' : 'neutral', hint: 'COD + tạm ứng còn giữ + ứng lương chưa trừ' },
          { label: 'Số dư ròng', value: formatVnd(ledger.netBalance), tone: ledger.netBalance > 0 ? 'danger' : ledger.netBalance < 0 ? 'warning' : 'neutral', hint: ledger.netBalance > 0 ? 'Tài xế nợ công ty' : ledger.netBalance < 0 ? 'Công ty nợ tài xế' : 'Cân bằng' },
        ]}
      />
      {codWarn ? (
        <Banner
          tone="danger"
          message={`Tài xế đang giữ COD ${formatVnd(ledger.codHeld)}${ledger.overDays ? `, khoản cũ nhất ${ledger.daysHeld} ngày` : ''} — vượt ngưỡng cảnh báo.`}
          action={<CellLink to={PATHS.settingsOperations}>Xem ngưỡng</CellLink>}
        />
      ) : null}
      <p className="text-body-sm text-text-muted">Tiền tài xế nộp COD là thu hồi khoản phải thu, không phải doanh thu. Số dư ròng chỉ để tham khảo; hai chiều tất toán bằng chứng từ riêng.</p>
      <Panel title={view === 'cod' ? 'COD đang giữ theo điểm dừng' : 'Bút toán đối chiếu'} actions={<CellLink to={view === 'cod' ? PATHS.cod : PATHS.finance}>{view === 'cod' ? 'Mở COD tài xế (tài chính)' : 'Mở sổ thu chi'}</CellLink>}>
        {balanced ? (
          <EmptyState compact message="Công nợ tài xế đang cân bằng" />
        ) : (
          <DriverLedgerDetail driverId={driverId} view={view === 'cod' ? 'cod' : 'ledger'} />
        )}
      </Panel>
    </div>
  );
}
