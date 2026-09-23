import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router';
import { CalendarClock, History, Pencil, Plus, Power, Wrench, XCircle } from 'lucide-react';
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
import { TRIP_STATUS, VEHICLE_STATUS, formatDate, formatDateTime, formatVnd } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { RequirePermission } from '@/app/auth/guards';
import { PATHS, paths } from '@/app/routes';
import type { VehicleDetailQuery as VehicleDetailData } from '@/gql/graphql';
import { apolloErrorMessage } from '@/lib/apollo';
import { AttachmentsPanel } from '@/features/shared/AttachmentsPanel';
import { EntityTimeline, TimelineDrawer, useTimelineDrawer } from '@/features/shared/TimelineDrawer';
import { useQueryParam } from '@/features/shared/useQueryParam';
import { CellLink, Panel } from '@/features/master-data/helpers';
import { ActivateVehicleMutation, DeactivateVehicleMutation, SetVehicleStatusMutation, VehicleDetailQuery } from '../graphql/vehicles';
import { ExpiryCell, expenseColumns } from '@/features/master-data/tables';

type Vehicle = NonNullable<VehicleDetailData['vehicle']>;
type TripRow = NonNullable<Vehicle['tripHistory']>[number];
type ExpenseRow = NonNullable<Vehicle['expenses']>[number];
const TABS = ['overview', 'trips', 'expenses', 'attachments', 'timeline'];

/** WM-VEH-02 — Chi tiết xe (tabs ?tab=overview|trips|expenses|attachments|timeline). */
export default function VehicleDetailPage() {
  return (
    <RequirePermission permission="vehicle.view">
      <VehicleDetail />
    </RequirePermission>
  );
}

function VehicleDetail() {
  const { vehicleId = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [tabParam, setTab] = useQueryParam('tab');
  const tab = TABS.includes(tabParam ?? '') ? tabParam! : 'overview';
  const openTimeline = useTimelineDrawer();
  const { data, loading, error, refetch } = useQuery(VehicleDetailQuery, { variables: { id: vehicleId } });
  const [deactivate, { loading: deactivating }] = useMutation(DeactivateVehicleMutation);
  const [activate] = useMutation(ActivateVehicleMutation);
  const [setStatus] = useMutation(SetVehicleStatusMutation);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(false);

  if (error) {
    return /Không tìm thấy/.test(error.message) ? (
      <EmptyState message="Không tìm thấy xe" description="Xe không tồn tại hoặc thuộc nhà xe khác." action={<Button onClick={() => navigate(PATHS.vehicles)}>Quay lại danh sách xe</Button>} />
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }
  if (loading && !data) return <DetailSkeleton />;
  const v = data?.vehicle;
  if (!v) return null;
  const canEdit = hasPermission('vehicle.edit');
  const addExpenseUrl = `${PATHS.expenseNew}?kind=VEHICLE_SUPPLY&vehicleId=${v.id}`;
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      void refetch();
    } catch (e) {
      toast.error('Không thực hiện được', apolloErrorMessage(e));
    }
  };

  const tripColumns: DataTableColumn<TripRow>[] = [
    { key: 'code', label: 'Chuyến', render: (t) => <CellLink to={paths.trip(t.id)}>{t.code}</CellLink> },
    { key: 'order', label: 'Đơn', render: (t) => (t.orderCode ? <CellLink to={paths.order(t.orderId)}>{t.orderCode}</CellLink> : '—') },
    { key: 'route', label: 'Tuyến', render: (t) => t.routeSummary ?? '—' },
    { key: 'driver', label: 'Tài xế', render: (t) => t.driverName ?? '—' },
    { key: 'time', label: 'Thời gian', render: (t) => formatDateTime(t.actualStartAt ?? t.plannedStartAt) },
    { key: 'status', label: 'Trạng thái', render: (t) => <StatusBadge meta={TRIP_STATUS} status={t.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Xe', to: PATHS.vehicles }, { label: v.plate }]} />
      <EntityHeader
        code={v.plate}
        status={<StatusBadge meta={VEHICLE_STATUS} status={v.status} />}
        subtitle={[v.code, v.type?.name, v.capacityTons != null ? `${v.capacityTons} tấn` : null, v.brandModel].filter(Boolean).join(' · ')}
        metrics={[
          { label: 'Chuyến hiện tại', value: v.currentTrip ? <CellLink to={paths.trip(v.currentTrip.id)}>{v.currentTrip.code}</CellLink> : 'Không' },
          { label: 'Hạn đăng kiểm', value: v.registrationExpiresAt ? formatDate(v.registrationExpiresAt) : '—' },
        ]}
        primaryAction={
          hasPermission('expense.create') ? (
            <Button onClick={() => navigate(addExpenseUrl)}>
              <Plus /> Thêm chi phí xe
            </Button>
          ) : null
        }
        menu={[
          ...(canEdit ? [{ key: 'edit', label: 'Sửa xe', icon: <Pencil />, onSelect: () => navigate(paths.vehicleEdit(v.id)) }] : []),
          ...(canEdit && v.status === 'ACTIVE'
            ? [{ key: 'maint', label: 'Chuyển sang bảo dưỡng', icon: <Wrench />, onSelect: () => void run(() => setStatus({ variables: { id: v.id, status: 'MAINTENANCE' } }), 'Đã chuyển xe sang bảo dưỡng') }]
            : []),
          ...(canEdit && v.status === 'MAINTENANCE'
            ? [{ key: 'ready', label: 'Chuyển sang sẵn sàng', icon: <Power />, onSelect: () => void run(() => setStatus({ variables: { id: v.id, status: 'ACTIVE' } }), 'Xe đã sẵn sàng') }]
            : []),
          { key: 'schedule', label: 'Lịch xe', icon: <CalendarClock />, onSelect: () => navigate(PATHS.dispatchCalendar) },
          { key: 'timeline', label: 'Timeline', icon: <History />, onSelect: openTimeline },
          ...(canEdit
            ? v.status !== 'INACTIVE'
              ? [{ key: 'deactivate', label: 'Ngừng sử dụng xe', icon: <XCircle />, danger: true, separatorBefore: true, onSelect: () => setConfirmDeactivate(true) }]
              : [{ key: 'activate', label: 'Sử dụng lại', icon: <Power />, separatorBefore: true, onSelect: () => void run(() => activate({ variables: { id: v.id } }), 'Đã đưa xe vào sử dụng lại') }]
            : []),
        ]}
      />
      {v.expiryWarnings.length ? <Banner tone="danger" message={v.expiryWarnings.join(' · ')} /> : null}
      {v.status === 'INACTIVE' ? <Banner tone="neutral" message="Xe đã ngừng sử dụng: vẫn hiện ở lịch sử nhưng không chọn được khi tạo chuyến mới." /> : null}
      {v.status === 'MAINTENANCE' ? <Banner tone="warning" message="Xe đang bảo dưỡng: khi gán chuyến hệ thống sẽ cảnh báo." /> : null}
      <SummaryStrip
        items={[
          { label: 'Chuyến 30 ngày', value: v.stats?.tripCount30d ?? 0 },
          { label: 'Chi phí 30 ngày', value: formatVnd(v.stats?.cost30d ?? 0) },
          { label: 'Chi phí tháng này', value: formatVnd(v.monthCost) },
          { label: 'Hạn bảo hiểm', value: v.insuranceExpiresAt ? formatDate(v.insuranceExpiresAt) : '—' },
        ]}
      />
      <Tabs
        value={tab}
        onValueChange={(t) => setTab(t === 'overview' ? null : t)}
        items={[
          { value: 'overview', label: 'Hồ sơ' },
          { value: 'trips', label: 'Lịch sử chạy', count: v.tripHistory?.length ?? null },
          { value: 'expenses', label: 'Chi phí vật tư', count: v.expenses?.length ?? null },
          { value: 'attachments', label: 'Chứng từ' },
          { value: 'timeline', label: 'Timeline' },
        ]}
      >
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Thông tin xe">
              <DescriptionList
                items={[
                  { label: 'Biển số', value: <span className="font-mono">{v.plate}</span> },
                  { label: 'Mã xe', value: v.code },
                  { label: 'Loại xe', value: v.type?.name },
                  { label: 'Tải trọng', value: v.capacityTons != null ? `${v.capacityTons} tấn` : null },
                  { label: 'Hãng / model', value: v.brandModel },
                  { label: 'Năm sản xuất', value: v.year },
                  { label: 'Kích thước thùng', value: v.boxSize },
                  { label: 'Định mức nhiên liệu', value: v.fuelNorm },
                  { label: 'Ghi chú', value: v.note, span: 2 },
                ]}
              />
            </Panel>
            <div className="flex flex-col gap-4">
              <Panel title="Giấy tờ">
                <DescriptionList
                  items={[
                    { label: 'Số khung', value: v.chassisNo },
                    { label: 'Số máy', value: v.engineNo },
                    { label: 'Hạn đăng kiểm', value: <ExpiryCell date={v.registrationExpiresAt} /> },
                    { label: 'Hạn bảo hiểm', value: <ExpiryCell date={v.insuranceExpiresAt} /> },
                  ]}
                />
              </Panel>
              <Panel title="Chuyến hiện tại">
                {v.currentTrip ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <CellLink to={paths.trip(v.currentTrip.id)}>{v.currentTrip.code}</CellLink>
                    <StatusBadge meta={TRIP_STATUS} status={v.currentTrip.status} />
                    <span className="text-body-sm text-text-muted">{[v.currentTrip.driverName, formatDateTime(v.currentTrip.plannedStartAt)].filter(Boolean).join(' · ')}</span>
                  </div>
                ) : (
                  <span className="text-text-muted">Xe đang rảnh</span>
                )}
              </Panel>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="trips">
          <Panel title="Lịch sử chạy (10 chuyến gần nhất)" actions={<CellLink to={PATHS.dispatchCalendar}>Mở lịch xe</CellLink>}>
            <DataTable columns={tripColumns} rows={v.tripHistory ?? []} rowKey={(t) => t.id} compact onRowClick={(t) => navigate(paths.trip(t.id))} empty={<EmptyState compact message="Xe chưa chạy chuyến nào" />} />
          </Panel>
        </TabsContent>
        <TabsContent value="expenses">
          <Panel
            title="Chi phí gắn xe (20 phiếu gần nhất)"
            actions={
              <>
                <CellLink to={`${PATHS.expenses}?vehicleId=${v.id}`}>Mở phiếu chi xe</CellLink>
                {hasPermission('expense.create') ? (
                  <Button size="sm" onClick={() => navigate(addExpenseUrl)}>
                    <Plus /> Thêm chi phí
                  </Button>
                ) : null}
              </>
            }
          >
            <DataTable
              columns={expenseColumns<ExpenseRow>({ showTrip: true, showSupplier: true })}
              rows={v.expenses ?? []}
              rowKey={(e) => e.id}
              compact
              onRowClick={(e) => navigate(paths.expense(e.id))}
              totalRow={{ code: 'Tổng (còn hiệu lực)', amount: <MoneyCell value={(v.expenses ?? []).filter((e) => e.status !== 'CANCELLED').reduce((s, e) => s + e.amount, 0)} strong /> }}
              empty={<EmptyState compact message="Chưa có chi phí gắn xe" />}
            />
          </Panel>
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentsPanel entityType="VEHICLE" entityId={v.id} category="CONTRACT" canUpload={canEdit} emptyText="Chưa có chứng từ (đăng kiểm, bảo hiểm, cà vẹt...)" />
        </TabsContent>
        <TabsContent value="timeline">{tab === 'timeline' ? <EntityTimeline entity={{ type: 'VEHICLE', id: v.id }} /> : null}</TabsContent>
      </Tabs>
      <TimelineDrawer entity={{ type: 'VEHICLE', id: v.id, label: `${v.plate} · ${v.code}` }} />
      <SensitiveActionModal
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        action={`Ngừng sử dụng xe ${v.plate}`}
        description="Xe sẽ không chọn được khi tạo chuyến mới; lịch sử chạy và chi phí vẫn giữ nguyên."
        affected={[v.currentTrip ? `Xe đang có chuyến ${v.currentTrip.code}` : 'Không có chuyến đang chạy']}
        warning={v.currentTrip ? 'Xe đang chạy chuyến — hệ thống sẽ từ chối, hãy đổi xe cho chuyến trước.' : undefined}
        confirmLabel="Ngừng sử dụng"
        loading={deactivating}
        onConfirm={async (reason) => {
          try {
            await deactivate({ variables: { id: v.id, reason } });
            toast.success('Đã ngừng sử dụng xe');
            setConfirmDeactivate(false);
            void refetch();
          } catch (e) {
            toast.error('Không ngừng sử dụng được', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
