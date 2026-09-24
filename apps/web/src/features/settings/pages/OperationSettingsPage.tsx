import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useBlocker } from 'react-router';
import { Banner, Button, Dialog, DetailSkeleton, ErrorState, FormField, FormSection, Input, MoneyInput, PageHeader, RadioGroup, Switch, toast } from '@bta/shadcn';
import { formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS } from '@/app/routes';
import { apolloErrorMessage } from '@/lib/apollo';
import { MerchantSettingsQuery, UpdateMerchantSettingsMutation } from '../graphql/settings';

interface Draft {
  payrollPeriodType: string;
  payrollStartDay: number;
  nearOverlapHours: number;
  defaultTripHours: number;
  codWarningAmount: number | null;
  codWarningDays: number;
  defaultDebtDays: number;
  defaultCreditLimit: number | null;
  gpsRetentionDays: number;
}

const SWITCHES = [
  ['overlapWarnVehicle', 'Cảnh báo trùng lịch xe'],
  ['overlapWarnDriver', 'Cảnh báo trùng lịch tài xế'],
  ['codDashboardAlert', 'Hiện cảnh báo COD trên dashboard'],
  ['warnOverLimit', 'Cảnh báo khi khách vượt hạn mức nợ'],
  ['warnOverdue', 'Cảnh báo khi khách có đơn quá hạn'],
] as const;

/** WM-SET-01 — Cài đặt vận hành (chỉ admin theo spec). Switch áp dụng ngay; các ô số lưu bằng save bar. */
export default function OperationSettingsPage() {
  return (
    <RequirePermission permission="settings.manage">
      <OperationSettings />
    </RequirePermission>
  );
}

function OperationSettings() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('settings.manage');
  const { data, loading, error, refetch } = useQuery(MerchantSettingsQuery);
  const [update, { loading: saving }] = useMutation(UpdateMerchantSettingsMutation);
  const s = data?.merchantSettings;
  const initial = React.useMemo<Draft | null>(
    () =>
      s
        ? {
            payrollPeriodType: s.payrollPeriodType,
            payrollStartDay: s.payrollStartDay,
            nearOverlapHours: s.nearOverlapMinutes / 60,
            defaultTripHours: s.defaultTripHours,
            codWarningAmount: s.codWarningAmount,
            codWarningDays: s.codWarningDays,
            defaultDebtDays: s.defaultDebtDays,
            defaultCreditLimit: s.defaultCreditLimit ?? null,
            gpsRetentionDays: s.gpsRetentionDays,
          }
        : null,
    [s],
  );
  const [draft, setDraft] = React.useState<Draft | null>(null);
  React.useEffect(() => setDraft(initial), [initial]);
  const changed = draft && initial ? (Object.keys(draft) as (keyof Draft)[]).filter((k) => draft[k] !== initial[k]) : [];
  const blocker = useBlocker(changed.length > 0);

  const errors: Partial<Record<keyof Draft, string>> = {};
  if (draft) {
    if (draft.payrollStartDay < 1 || draft.payrollStartDay > 28) errors.payrollStartDay = 'Ngày bắt đầu kỳ 1–28';
    if (!(draft.nearOverlapHours > 0)) errors.nearOverlapHours = 'Ngưỡng phải > 0';
    if (!(draft.defaultTripHours > 0)) errors.defaultTripHours = 'Phải > 0';
    if (!draft.codWarningAmount || draft.codWarningAmount <= 0) errors.codWarningAmount = 'Ngưỡng phải > 0';
    if (!(draft.codWarningDays > 0)) errors.codWarningDays = 'Ngưỡng phải > 0';
    if (draft.defaultDebtDays < 0) errors.defaultDebtDays = 'Không âm';
    if (draft.gpsRetentionDays < 30) errors.gpsRetentionDays = 'Tối thiểu 30 ngày';
  }

  const save = async () => {
    if (!draft || Object.keys(errors).length) return;
    try {
      await update({
        variables: {
          input: {
            payrollPeriodType: draft.payrollPeriodType,
            payrollStartDay: draft.payrollPeriodType === 'MONTHLY' ? 1 : draft.payrollStartDay,
            nearOverlapMinutes: Math.round(draft.nearOverlapHours * 60),
            defaultTripHours: draft.defaultTripHours,
            codWarningAmount: draft.codWarningAmount ?? 0,
            codWarningDays: draft.codWarningDays,
            defaultDebtDays: draft.defaultDebtDays,
            defaultCreditLimit: draft.defaultCreditLimit,
            gpsRetentionDays: draft.gpsRetentionDays,
          },
        },
      });
      toast.success('Đã lưu cài đặt vận hành');
      void refetch();
    } catch (e) {
      toast.error('Không lưu được cài đặt', apolloErrorMessage(e));
    }
  };

  const toggle = async (key: (typeof SWITCHES)[number][0], value: boolean, label: string) => {
    try {
      await update({ variables: { input: { [key]: value } } });
      toast.success(`${value ? 'Đã bật' : 'Đã tắt'}: ${label}`);
    } catch (e) {
      toast.error('Không cập nhật được', apolloErrorMessage(e));
    }
  };

  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if ((loading && !s) || !draft || !s) return <DetailSkeleton />;
  const ro = !canEdit;
  const num = (key: keyof Draft, label: string, suffix: string, opts: { step?: number; hint?: string } = {}) => (
    <FormField label={label} error={errors[key]} hint={opts.hint} htmlFor={key}>
      <Input
        id={key}
        type="number"
        step={opts.step ?? 1}
        readOnly={ro}
        value={String(draft[key] ?? '')}
        suffix={suffix}
        aria-invalid={!!errors[key]}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value === '' ? 0 : Number(e.target.value) })}
      />
    </FormField>
  );

  return (
    <div className="flex flex-col gap-4 pb-16">
      <PageHeader
        title="Cài đặt vận hành"
        subtitle="Kỳ lương, ngưỡng cảnh báo trùng lịch, ngưỡng COD và công nợ mặc định của nhà xe."
        breadcrumb={[{ label: 'Cài đặt', to: PATHS.settingsCompany }, { label: 'Cài đặt vận hành' }]}
      />
      {ro ? <Banner tone="info" message="Chỉ Admin được thay đổi cài đặt vận hành. Bạn đang xem ở chế độ chỉ đọc." /> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <FormSection title="Kỳ lương" description="Dùng khi tạo bảng lương (WM-PAYROLL-03).">
            <RadioGroup
              value={draft.payrollPeriodType}
              disabled={ro}
              onValueChange={(v) => setDraft({ ...draft, payrollPeriodType: v })}
              options={[
                { value: 'MONTHLY', label: 'Theo tháng dương lịch (01 → cuối tháng)' },
                { value: 'CUSTOM', label: 'Theo ngày bắt đầu tùy chọn (ví dụ 05 → 04 tháng sau)' },
              ]}
            />
            {draft.payrollPeriodType === 'CUSTOM' ? <div className="mt-3 max-w-[200px]">{num('payrollStartDay', 'Ngày bắt đầu kỳ', 'hằng tháng')}</div> : null}
          </FormSection>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <FormSection title="Điều phối" description="Cảnh báo mềm, không chặn gán xe/tài xế.">
            <div className="grid gap-3 md:grid-cols-2">
              {num('nearOverlapHours', 'Ngưỡng gần trùng lịch', 'giờ', { step: 0.5, hint: 'Hai chuyến cách nhau dưới ngưỡng sẽ cảnh báo' })}
              {num('defaultTripHours', 'Thời lượng chuyến mặc định', 'giờ', { hint: 'Dùng khi chuyến chưa có giờ kết thúc' })}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {SWITCHES.slice(0, 2).map(([key, label]) => (
                <Switch key={key} label={label} checked={s[key]} disabled={ro || saving} onCheckedChange={(v) => void toggle(key, v, label)} />
              ))}
            </div>
          </FormSection>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <FormSection title="COD tài xế đang giữ" description="Cảnh báo khi tài xế giữ COD quá số tiền hoặc quá số ngày.">
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Ngưỡng số tiền" error={errors.codWarningAmount}>
                <MoneyInput value={draft.codWarningAmount} readOnly={ro} onChange={(v) => setDraft({ ...draft, codWarningAmount: v })} />
              </FormField>
              {num('codWarningDays', 'Ngưỡng số ngày giữ', 'ngày')}
            </div>
            <div className="mt-3">
              <Switch label={SWITCHES[2][1]} checked={s.codDashboardAlert} disabled={ro || saving} onCheckedChange={(v) => void toggle('codDashboardAlert', v, SWITCHES[2][1])} />
            </div>
          </FormSection>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <FormSection title="Công nợ khách hàng" description="Giá trị mặc định khi khách chưa cấu hình riêng.">
            <div className="grid gap-3 md:grid-cols-2">
              {num('defaultDebtDays', 'Số ngày công nợ mặc định', 'ngày', { hint: 'Gợi ý hạn thanh toán khi tạo đơn' })}
              <FormField label="Hạn mức nợ mặc định" hint="Để trống = không giới hạn">
                <MoneyInput value={draft.defaultCreditLimit} readOnly={ro} onChange={(v) => setDraft({ ...draft, defaultCreditLimit: v })} />
              </FormField>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {SWITCHES.slice(3).map(([key, label]) => (
                <Switch key={key} label={label} checked={s[key]} disabled={ro || saving} onCheckedChange={(v) => void toggle(key, v, label)} />
              ))}
            </div>
          </FormSection>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <FormSection title="Dữ liệu GPS" description="Thời gian giữ lộ trình GPS chi tiết.">
            <div className="max-w-[240px]">{num('gpsRetentionDays', 'Giữ GPS chi tiết', 'ngày')}</div>
          </FormSection>
        </section>
      </div>
      {changed.length && canEdit ? (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-surface px-6 py-3 shadow-popover lg:left-[260px]">
          <span className="text-body-sm text-text-muted">{changed.length} thay đổi chưa lưu</span>
          <div className="flex-1" />
          <Button variant="ghost" onClick={() => setDraft(initial)}>
            Hoàn tác
          </Button>
          <Button onClick={() => void save()} loading={saving} disabled={Object.keys(errors).length > 0}>
            Lưu cài đặt
          </Button>
        </div>
      ) : null}
      <Dialog
        open={blocker.state === 'blocked'}
        onOpenChange={(o) => !o && blocker.reset?.()}
        title="Rời trang khi chưa lưu?"
        description="Các thay đổi cài đặt chưa lưu sẽ bị mất."
        footer={
          <>
            <Button variant="secondary" onClick={() => blocker.reset?.()}>
              Ở lại
            </Button>
            <Button variant="destructive" onClick={() => blocker.proceed?.()}>
              Rời trang
            </Button>
          </>
        }
      />
      <p className="text-caption text-text-subtle">Ngưỡng COD hiện hành: {formatVnd(s.codWarningAmount)} / {s.codWarningDays} ngày.</p>
    </div>
  );
}
