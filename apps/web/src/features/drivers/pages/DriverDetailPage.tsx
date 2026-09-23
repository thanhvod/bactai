import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { CalendarClock, History, KeyRound, Lock, Pencil, Power, UserX } from 'lucide-react';
import {
  Banner,
  Breadcrumb,
  Button,
  DataTable,
  DescriptionList,
  DetailSkeleton,
  Dialog,
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
import { ACTIVE_STATUS, TRIP_STATUS, formatDate, formatDateTime, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { DriverDetailQuery as DriverDetailData } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { AttachmentsPanel } from '@/features/shared/AttachmentsPanel';
import { EntityTimeline, TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { APP_ACCOUNT_STATUS, CellLink, Panel, daysUntil } from '@/features/master-data/helpers';
import { AccountCredentialsDialog, type Credentials } from '../components/AccountCredentialsDialog';
import { LedgerTab, codRemitUrl, reimburseUrl } from '../components/LedgerTab';
import { SalaryHistoryTab } from '../components/SalaryHistoryTab';
import { ActivateDriverMutation, DeactivateDriverMutation, DisableDriverAccountMutation, DriverDetailQuery, ResetDriverAccountMutation } from '../graphql/drivers';

type Driver = NonNullable<DriverDetailData['driver']>;
type TripRow = NonNullable<Driver['recentTrips']>[number];
const TABS = ['overview', 'trips', 'ledger', 'salary', 'attachments', 'timeline'] as const;

/** WM-DRV-02 — Chi tiết tài xế (tabs ?tab=overview|trips|ledger|salary|attachments|timeline). */
export default function DriverDetailPage({ forceTab }: { forceTab?: (typeof TABS)[number] }) {
  return (
    <RequirePermission permission="driver.view">
      <DriverDetail forceTab={forceTab} />
    </RequirePermission>
  );
}

function DriverDetail({ forceTab }: { forceTab?: string }) {
  const { driverId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [tabParam, setTab] = useQueryParam('tab');
  const tab = forceTab ?? (TABS.includes(tabParam as never) ? tabParam! : 'overview');
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(DriverDetailQuery, { variables: { id: driverId } });
  const [resetAccount, { loading: resetting }] = useMutation(ResetDriverAccountMutation);
  const [disableAccount, { loading: disabling }] = useMutation(DisableDriverAccountMutation);
  const [deactivate, { loading: deactivating }] = useMutation(DeactivateDriverMutation);
  const [activate] = useMutation(ActivateDriverMutation);
  const [credentials, setCredentials] = React.useState<Credentials | null>(null);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(false);

  if (error) {
    const notFound = /Không tìm thấy/.test(error.message);
    return notFound ? (
      <EmptyState message="Không tìm thấy tài xế" description="Tài xế không tồn tại hoặc thuộc nhà xe khác." action={<Button onClick={() => navigate(PATHS.drivers)}>Về danh sách tài xế</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const d = data?.driver;
  if (!d) return null;

  const canEdit = hasPermission('driver.edit');
  const canAccount = hasPermission('driver.account.manage');
  const l = d.ledgerSummary;
  const codWarn = l.overAmount || l.overDays;
  const hasAccount = d.appAccount.status !== 'NONE';
  const licenseDays = daysUntil(d.licenseExpiresAt);

  const primary =
    l.codHeld > 0 && hasPermission('cod.remittance.record') ? (
      <Button onClick={() => navigate(codRemitUrl(d.id))}>Ghi nhận nộp COD</Button>
    ) : l.companyOwesDriver > 0 && hasPermission('expense.create') ? (
      <Button onClick={() => navigate(reimburseUrl(d.id))}>Tạo phiếu chi hoàn ứng</Button>
    ) : canEdit ? (
      <Button onClick={() => navigate(paths.driverEdit(d.id))}>
        <Pencil /> Sửa
      </Button>
    ) : null;

  const doReset = async () => {
    try {
      const res = await resetAccount({ variables: { driverId: d.id } });
      const c = res.data?.createOrResetDriverAccount;
      setConfirmReset(false);
      if (c) setCredentials({ phone: c.phone, tempPassword: c.tempPassword });
      void refetch();
    } catch (e) {
      toast.error('Không tạo/đặt lại được tài khoản', apolloErrorMessage(e));
    }
  };

  const tripColumns: DataTableColumn<TripRow>[] = [
    { key: 'code', label: 'Chuyến', render: (t) => <CellLink to={paths.trip(t.id)}>{t.code}</CellLink> },
    { key: 'order', label: 'Đơn', render: (t) => (t.orderCode ? <CellLink to={paths.order(t.orderId)}>{t.orderCode}</CellLink> : '—') },
    { key: 'route', label: 'Tuyến', render: (t) => t.routeSummary ?? '—' },
    { key: 'vehicle', label: 'Xe', render: (t) => t.vehiclePlate ?? '—' },
    { key: 'time', label: 'Thời gian', render: (t) => formatDateTime(t.actualStartAt ?? t.plannedStartAt) },
    { key: 'status', label: 'Trạng thái', render: (t) => <StatusBadge meta={TRIP_STATUS} status={t.status} /> },
    { key: 'bonus', label: 'Thưởng', money: true, render: (t) => <MoneyCell value={t.driverBonusAmount} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Tài xế', to: PATHS.drivers }, { label: d.name }]} />
      <EntityHeader
        code={d.code}
        title={d.name}
        status={<StatusBadge meta={ACTIVE_STATUS} status={d.status} />}
        subtitle={`${d.phone}${d.licenseClass ? ` · GPLX hạng ${d.licenseClass}` : ''}`}
        metrics={[
          { label: 'App', value: <StatusBadge meta={APP_ACCOUNT_STATUS} status={d.appAccount.status} /> },
          { label: 'Lương cố định', value: d.fixedSalary != null ? formatVnd(d.fixedSalary) : '—' },
          {
            label: 'Chuyến hiện tại',
            value: d.currentTrip ? <CellLink to={paths.trip(d.currentTrip.id)}>{d.currentTrip.code}</CellLink> : 'Rảnh',
          },
        ]}
        primaryAction={primary}
        menu={[
          ...(canEdit ? [{ key: 'edit', label: 'Sửa tài xế', icon: <Pencil />, onSelect: () => navigate(paths.driverEdit(d.id)) }] : []),
          ...(canAccount ? [{ key: 'reset', label: hasAccount ? 'Đặt lại mật khẩu app' : 'Tạo tài khoản app', icon: <KeyRound />, onSelect: () => setConfirmReset(true) }] : []),
          ...(canAccount && hasAccount && d.appAccount.status !== 'DISABLED'
            ? [
                {
                  key: 'disable',
                  label: 'Khóa tài khoản app',
                  icon: <Lock />,
                  onSelect: async () => {
                    try {
                      await disableAccount({ variables: { driverId: d.id } });
                      toast.success('Đã khóa tài khoản app');
                      void refetch();
                    } catch (e) {
                      toast.error('Không khóa được', apolloErrorMessage(e));
                    }
                  },
                },
              ]
            : []),
          { key: 'schedule', label: 'Lịch xe/tài xế', icon: <CalendarClock />, onSelect: () => navigate(PATHS.dispatchCalendar) },
          { key: 'timeline', label: 'Timeline', icon: <History />, onSelect: openTimeline },
          ...(canEdit
            ? d.status === 'ACTIVE'
              ? [{ key: 'deactivate', label: 'Ngừng hoạt động', icon: <UserX />, danger: true, separatorBefore: true, onSelect: () => setConfirmDeactivate(true) }]
              : [
                  {
                    key: 'activate',
                    label: 'Kích hoạt lại',
                    icon: <Power />,
                    separatorBefore: true,
                    onSelect: async () => {
                      try {
                        await activate({ variables: { id: d.id } });
                        toast.success('Đã kích hoạt lại tài xế');
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
      {d.warnings.length ? <Banner tone={codWarn ? 'danger' : 'warning'} message={d.warnings.join(' · ')} /> : null}
      {d.status === 'INACTIVE' ? <Banner tone="neutral" message="Tài xế đã ngừng hoạt động: vẫn hiện ở lịch sử nhưng không chọn được khi tạo chuyến mới." /> : null}
      <SummaryStrip
        items={[
          { label: 'COD đang giữ', value: formatVnd(l.codHeld), tone: codWarn ? 'danger' : 'neutral', hint: l.codHeld ? `${l.daysHeld} ngày` : undefined },
          { label: 'Công ty nợ tài xế', value: formatVnd(l.companyOwesDriver), tone: l.companyOwesDriver > 0 ? 'warning' : 'neutral' },
          { label: 'Tài xế nợ công ty', value: formatVnd(l.driverOwesCompany), tone: l.driverOwesCompany > 0 ? 'warning' : 'neutral' },
          { label: 'Chuyến gần đây', value: d.recentTrips?.length ?? 0 },
        ]}
      />
      <Tabs
        value={tab}
        onValueChange={(v) => (forceTab ? navigate(v === 'overview' ? paths.driver(d.id) : paths.driver(d.id, v as never)) : setTab(v === 'overview' ? null : v))}
        items={[
          { value: 'overview', label: 'Tổng quan' },
          { value: 'trips', label: 'Lịch sử lái', count: d.recentTrips?.length ?? null },
          { value: 'ledger', label: 'Công nợ & COD' },
          { value: 'salary', label: 'Lương / ứng' },
          { value: 'attachments', label: 'Chứng từ' },
          { value: 'timeline', label: 'Timeline' },
        ]}
      >
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Hồ sơ">
              <DescriptionList
                items={[
                  { label: 'Họ tên', value: d.name },
                  { label: 'Số điện thoại', value: <a className="text-accent hover:underline" href={`tel:${d.phone}`}>{d.phone}</a> },
                  { label: 'Ngày sinh', value: d.dob ? formatDate(d.dob) : null },
                  { label: 'Số CCCD', value: d.idNumber },
                  { label: 'Địa chỉ', value: d.address, span: 2 },
                  { label: 'Liên hệ khẩn cấp', value: d.emergencyContact, span: 2 },
                  { label: 'Ghi chú', value: d.note, span: 2 },
                ]}
              />
            </Panel>
            <div className="flex flex-col gap-4">
              <Panel title="Giấy phép lái xe">
                <DescriptionList
                  items={[
                    { label: 'Hạng', value: d.licenseClass },
                    { label: 'Số GPLX', value: d.licenseNumber },
                    {
                      label: 'Hết hạn',
                      value: d.licenseExpiresAt ? (
                        <span className={licenseDays !== null && licenseDays <= 30 ? 'text-danger' : undefined}>
                          {formatDate(d.licenseExpiresAt)}
                          {licenseDays !== null && licenseDays <= 30 ? (licenseDays < 0 ? ' · đã hết hạn' : ` · còn ${licenseDays} ngày`) : ''}
                        </span>
                      ) : null,
                    },
                  ]}
                />
              </Panel>
              <Panel
                title="Tài khoản app"
                actions={
                  canAccount ? (
                    <Button size="sm" variant="secondary" onClick={() => setConfirmReset(true)}>
                      <KeyRound /> {hasAccount ? 'Đặt lại mật khẩu' : 'Mời dùng app'}
                    </Button>
                  ) : null
                }
              >
                <DescriptionList
                  items={[
                    { label: 'Trạng thái', value: <StatusBadge meta={APP_ACCOUNT_STATUS} status={d.appAccount.status} /> },
                    { label: 'Đăng nhập', value: hasAccount ? `SĐT ${d.phone}` : null },
                    { label: 'Lần đăng nhập cuối', value: d.appAccount.lastLoginAt ? formatDateTime(d.appAccount.lastLoginAt) : 'Chưa đăng nhập' },
                    { label: 'Thiết bị', value: d.appAccount.deviceInfo },
                  ]}
                />
              </Panel>
              <Panel title="Chuyến hiện tại">
                {d.currentTrip ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <CellLink to={paths.trip(d.currentTrip.id)}>{d.currentTrip.code}</CellLink>
                    <StatusBadge meta={TRIP_STATUS} status={d.currentTrip.status} />
                    <span className="text-body-sm text-text-muted">
                      {[d.currentTrip.vehiclePlate, d.currentTrip.routeSummary, formatDateTime(d.currentTrip.plannedStartAt)].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                ) : (
                  <span className="text-text-muted">Không có chuyến đang chạy hoặc sắp chạy</span>
                )}
              </Panel>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="trips">
          <Panel title="Lịch sử lái (chuyến gần nhất)" actions={<CellLink to={PATHS.dispatchCalendar}>Mở lịch xe/tài xế</CellLink>}>
            <DataTable columns={tripColumns} rows={d.recentTrips ?? []} rowKey={(t) => t.id} compact onRowClick={(t) => navigate(paths.trip(t.id))} empty={<EmptyState compact message="Tài xế chưa chạy chuyến nào" />} />
          </Panel>
        </TabsContent>
        <TabsContent value="ledger">
          <LedgerTab driverId={d.id} ledger={l} />
        </TabsContent>
        <TabsContent value="salary">
          <SalaryHistoryTab driverId={d.id} history={d.salaryHistory ?? []} onChanged={() => void refetch()} />
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentsPanel entityType="DRIVER" entityId={d.id} category="LICENSE" canUpload={canEdit} emptyText="Chưa có chứng từ (GPLX, CCCD, hợp đồng...)" />
        </TabsContent>
        <TabsContent value="timeline">{tab === 'timeline' ? <EntityTimeline entity={{ type: 'DRIVER', id: d.id }} /> : null}</TabsContent>
      </Tabs>

      <TimelineDrawer entity={{ type: 'DRIVER', id: d.id, label: `${d.code} · ${d.name}` }} />
      <Dialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={hasAccount ? 'Đặt lại mật khẩu app tài xế?' : 'Tạo tài khoản app cho tài xế?'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Hủy
            </Button>
            <Button onClick={() => void doReset()} loading={resetting}>
              {hasAccount ? 'Đặt lại mật khẩu' : 'Tạo tài khoản'}
            </Button>
          </>
        }
      >
        <p className="text-body">
          Hệ thống tạo mật khẩu tạm cho <b>{d.name}</b> (đăng nhập bằng SĐT {d.phone}). {hasAccount ? 'Mật khẩu cũ và các phiên đăng nhập hiện tại sẽ bị vô hiệu.' : ''} Mật khẩu tạm chỉ hiện một lần.
        </p>
      </Dialog>
      <AccountCredentialsDialog credentials={credentials} driverName={d.name} onClose={() => setCredentials(null)} />
      <SensitiveActionModal
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        action={`Ngừng hoạt động tài xế ${d.code} · ${d.name}`}
        description="Tài xế sẽ không chọn được khi tạo chuyến mới và tài khoản app bị khóa. Dữ liệu cũ vẫn giữ."
        affected={[d.currentTrip ? `Còn chuyến ${d.currentTrip.code} chưa xong` : 'Không có chuyến đang chạy', l.codHeld ? `Đang giữ COD ${formatVnd(l.codHeld)}` : 'Không giữ COD']}
        warning={d.currentTrip || l.codHeld ? 'Tài xế còn chuyến/COD chưa xử lý — nên xử lý trước khi ngừng.' : undefined}
        confirmLabel="Ngừng hoạt động"
        loading={deactivating}
        onConfirm={async (reason) => {
          try {
            await deactivate({ variables: { id: d.id, reason } });
            toast.success('Đã ngừng hoạt động tài xế');
            setConfirmDeactivate(false);
            void refetch();
          } catch (e) {
            toast.error('Không ngừng hoạt động được', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
