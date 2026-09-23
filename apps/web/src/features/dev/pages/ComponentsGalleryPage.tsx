import * as React from 'react';
import { Plus, Search } from 'lucide-react';
import {
  AttachmentList, AttachmentUploader, AuditDiff, Badge, Banner, BarChart, Button, Checkbox, DataTable, DateField, DescriptionList, Dialog, Drawer, DueIndicator, EmptyState, EntityHeader, EntityPicker, ErrorState, FilterBar, FilterChip, FormField, IconButton, Input, KpiCard, LineChart, LineItemsEditor, MapView, MoneyCell, MoneyInput, NoPermissionState, PageHeader, Pagination, PartnerCard, PermissionMatrix, PrintSheet, RadioGroup, SegmentedControl, Select, SensitiveActionModal, StatusBadge, StatusStepper, Stepper, SummaryStrip, Switch, Tabs, TabsContent, Textarea, Timeline, WarningPanel, toast, Skeleton,
} from '@bta/shadcn';
import { ORDER_STATUS, PAYMENT_IN_TYPE, TRIP_STATUS } from '@bta/shared';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <h2 className="text-heading-sm">{title}</h2>
      {children}
    </section>
  );
}

type Row = { id: string; code: string; customer: string; status: string; total: number; remaining: number };
const rows: Row[] = [
  { id: '1', code: 'DH-202609-0001', customer: 'Công ty Gạo Miền Tây', status: 'IN_PROGRESS', total: 12_500_000, remaining: 12_500_000 },
  { id: '2', code: 'DH-202609-0002', customer: 'Kho Thép An Phát', status: 'DISPATCHED', total: 35_000_000, remaining: 35_000_000 },
  { id: '3', code: 'DH-202608-0009', customer: 'Công ty Gạo Miền Tây', status: 'COMPLETED', total: 20_000_000, remaining: 15_000_000 },
];

/** Trang dev: xem toàn bộ component với mock data (chỉ DEV). */
export default function ComponentsGalleryPage() {
  const [money, setMoney] = React.useState<number | null>(1_250_000);
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [seg, setSeg] = React.useState('list');
  const [dialog, setDialog] = React.useState(false);
  const [drawer, setDrawer] = React.useState(false);
  const [sensitive, setSensitive] = React.useState(false);
  const [picker, setPicker] = React.useState<string | null>(null);
  const [lines, setLines] = React.useState([{ name: 'Gạo ST25', qty: 160, amount: 500_000 }]);
  const [tab, setTab] = React.useState('overview');
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Thư viện component" subtitle="Kiểm tra visual với mock data (chỉ môi trường dev)." breadcrumb={[{ label: 'Dev', to: '/' }, { label: 'Components' }]} actions={<Button onClick={() => toast.success('Đã lưu', 'Toast mẫu')}><Plus /> Primary</Button>} />
      <Section title="Button / IconButton / Badge">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="destructive-outline">Hủy</Button>
          <Button variant="link">Link</Button>
          <Button loading>Đang lưu</Button>
          <Button size="sm" variant="secondary">Nhỏ</Button>
          <IconButton label="Tìm kiếm"><Search /></IconButton>
          <Badge tone="success">Đã thu</Badge>
          <Badge tone="danger" outline>Đã hủy</Badge>
        </div>
      </Section>
      <Section title="StatusBadge (Order / Trip / Finance)">
        <div className="flex flex-wrap gap-2">
          {Object.keys(ORDER_STATUS).map((s) => <StatusBadge key={s} meta={ORDER_STATUS} status={s} />)}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(TRIP_STATUS).map((s) => <StatusBadge key={s} meta={TRIP_STATUS} status={s} />)}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PAYMENT_IN_TYPE).map((s) => <StatusBadge key={s} meta={PAYMENT_IN_TYPE} status={s} />)}
          <StatusBadge label="Đã chốt" status="FINALIZED" tone="primary" />
          <StatusBadge label="Quá hạn" tone="danger" />
        </div>
      </Section>
      <Section title="Form controls">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tên khách hàng" required hint="Tên hiển thị trên phiếu"><Input placeholder="Nhập tên" /></FormField>
          <FormField label="Giá cước" required error="Số tiền phải > 0"><MoneyInput value={money} onChange={setMoney} aria-invalid /></FormField>
          <FormField label="Trạng thái"><Select value="ACTIVE" options={[{ value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'INACTIVE', label: 'Ngừng' }]} /></FormField>
          <FormField label="Hạn thanh toán"><DateField value="2026-10-08" /></FormField>
          <FormField label="Khách hàng (EntityPicker)">
            <EntityPicker value={picker} onChange={(id) => setPicker(id)} items={[{ id: 'c1', label: 'Công ty Gạo Miền Tây', code: 'CUS-A-001', description: '0292123456' }, { id: 'c2', label: 'Kho Thép An Phát', code: 'CUS-A-002' }, { id: 'c3', label: 'Khách ngừng', code: 'CUS-X', inactive: true }]} allowCreate={{ label: 'Tạo khách mới', onCreate: () => toast.info('Mở form tạo khách') }} />
          </FormField>
          <FormField label="Ghi chú"><Textarea rows={2} /></FormField>
          <div className="flex flex-col gap-2">
            <Checkbox label="Hoàn tài xế" defaultChecked />
            <Switch label="Cảnh báo vượt hạn mức" defaultChecked />
          </div>
          <RadioGroup name="paidBy" defaultValue="COMPANY" inline options={[{ value: 'COMPANY', label: 'Công ty chi' }, { value: 'DRIVER', label: 'Tài xế chi trước' }]} />
        </div>
        <p className="text-body-sm text-text-muted">MoneyInput value: <MoneyCell value={money} className="inline" /></p>
      </Section>
      <Section title="FilterBar / SegmentedControl / Tabs / Pagination">
        <FilterBar search="" onSearchChange={() => undefined} chips={<><FilterChip label="Hôm nay" active /><FilterChip label="Còn nợ" count={3} /><FilterChip label="Quá hạn" onRemove={() => undefined} /></>} dateRange={{ from: null, to: null, onChange: () => undefined }} selects={[{ key: 'status', placeholder: 'Trạng thái', options: Object.entries(ORDER_STATUS).map(([v, m]) => ({ value: v, label: m.label })), onChange: () => undefined }]} onAdvanced={() => setDrawer(true)} right={<SegmentedControl value={seg} onChange={setSeg} items={[{ value: 'list', label: 'Danh sách' }, { value: 'board', label: 'Bảng' }, { value: 'cal', label: 'Lịch' }]} />} />
        <Tabs value={tab} onValueChange={setTab} items={[{ value: 'overview', label: 'Tổng quan' }, { value: 'stops', label: 'Điểm dừng', count: 2 }, { value: 'finance', label: 'Tài chính' }, { value: 'timeline', label: 'Timeline' }]}>
          <TabsContent value="overview"><p className="text-body-sm text-text-muted">Nội dung tab tổng quan</p></TabsContent>
          <TabsContent value="stops"><p className="text-body-sm text-text-muted">Điểm dừng</p></TabsContent>
        </Tabs>
        <Pagination hasNextPage hasPrevPage={false} onNext={() => undefined} onPrev={() => undefined} pageSize={20} onPageSizeChange={() => undefined} shown={20} total={128} />
      </Section>
      <Section title="DataTable (chọn dòng, bulk, tổng)">
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          selectable
          selected={sel}
          onSelectedChange={setSel}
          bulkActions={() => <Button size="sm" variant="secondary">In phiếu</Button>}
          onRowClick={(r) => toast.info(`Mở ${r.code}`)}
          columns={[
            { key: 'code', label: 'Mã đơn', render: (r) => <span className="font-mono">{r.code}</span> },
            { key: 'customer', label: 'Khách hàng' },
            { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge meta={ORDER_STATUS} status={r.status} /> },
            { key: 'total', label: 'Tổng tiền', money: true, render: (r) => <MoneyCell value={r.total} /> },
            { key: 'remaining', label: 'Còn nợ', money: true, render: (r) => <MoneyCell value={r.remaining} tone={r.remaining ? 'warning' : 'success'} /> },
            { key: 'due', label: 'Hạn', render: (r) => <DueIndicator dueDate="2026-09-13" overdueDays={r.id === '3' ? 10 : 0} paid={r.remaining === 0} /> },
          ]}
          totalRow={{ total: <MoneyCell value={67_500_000} strong />, remaining: <MoneyCell value={62_500_000} strong /> }}
        />
        <DataTable rows={[]} rowKey={() => ''} loading columns={[{ key: 'a', label: 'Đang tải' }, { key: 'b', label: 'Tiền', money: true }]} />
        <DataTable rows={[]} rowKey={() => ''} columns={[{ key: 'a', label: 'Rỗng' }]} empty={<EmptyState compact message="Chưa có đơn nào" action={<Button size="sm"><Plus /> Tạo đơn</Button>} />} />
      </Section>
      <Section title="KpiCard / SummaryStrip / EntityHeader / DescriptionList / PartnerCard">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Chuyến đang chạy" value={3} tone="accent" to="/dispatch" />
          <KpiCard label="Công nợ quá hạn" value="15.000.000 đ" tone="danger" sub="2 khách" />
          <KpiCard label="COD tài xế giữ" value="5.500.000 đ" tone="warning" />
          <KpiCard label="Đang tải" value="" loading />
        </div>
        <EntityHeader code="DH-202609-0001" status={<StatusBadge meta={ORDER_STATUS} status="IN_PROGRESS" />} subtitle="Kho Cần Thơ → Kho Bình Dương" metrics={[{ label: 'Khách', value: 'Công ty Gạo Miền Tây' }, { label: 'Ngày đơn', value: '22/09/2026' }]} primaryAction={<Button>Tạo chuyến</Button>} secondaryActions={<Button variant="secondary">Sửa</Button>} menu={[{ key: 'print', label: 'In phiếu' }, { key: 'cancel', label: 'Hủy đơn', danger: true, separatorBefore: true, onSelect: () => setSensitive(true) }]} />
        <SummaryStrip items={[{ label: 'Tổng thu', value: '12.500.000 đ' }, { label: 'Đã thu', value: '0 đ', tone: 'success' }, { label: 'Còn nợ', value: '12.500.000 đ', tone: 'warning' }, { label: 'Lãi tạm tính', value: '9.200.000 đ', tone: 'primary' }]} />
        <div className="grid gap-4 md:grid-cols-2">
          <DescriptionList items={[{ label: 'Khách hàng', value: 'Công ty Gạo Miền Tây' }, { label: 'MST', value: '1801234567' }, { label: 'Hạn thanh toán', value: '08/10/2026' }, { label: 'Ghi chú', value: null }]} />
          <PartnerCard name="Công ty Gạo Miền Tây" code="CUS-A-001" lines={['Anh Nam · 0912 000 001', 'Hạn mức 100.000.000 đ']} onClick={() => undefined} />
        </div>
      </Section>
      <Section title="Warning / Banner / States">
        <WarningPanel title="Gần trùng lịch xe 51C-123.45" items={['Cách chuyến CX-202609-0001 90 phút (ngưỡng 120 phút)']} action={<Button size="sm" variant="secondary">Tiếp tục và ghi lý do</Button>} />
        <Banner tone="primary" message="Bảng kê đã chốt — số liệu là snapshot tại 23/09/2026 14:30." />
        <Banner tone="offline" message="Mất kết nối. Dữ liệu sẽ được gửi lại khi có mạng." />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border"><EmptyState compact message="Chưa có chi phí" action={<Button size="sm" variant="secondary">Thêm chi phí</Button>} /></div>
          <div className="rounded-lg border border-border"><ErrorState error={new Error('Network request failed')} onRetry={() => undefined} /></div>
          <div className="rounded-lg border border-border"><NoPermissionState /></div>
        </div>
      </Section>
      <Section title="Timeline / AuditDiff">
        <Timeline entries={[
          { time: new Date().toISOString(), actor: 'Điều phối Demo', action: 'Tạo đơn DH-202609-0001', tone: 'primary' },
          { time: new Date().toISOString(), actor: 'Nguyễn Văn Tài', action: 'Đổi trạng thái chuyến: Đang lấy hàng → Đang vận chuyển', tone: 'info' },
          { time: new Date().toISOString(), actor: 'Giám đốc Demo', action: 'Sửa giá cước sau xác nhận', reason: 'Khách thỏa thuận lại qua Zalo', tone: 'danger', before: { freightAmount: 12_000_000 }, after: { freightAmount: 11_500_000 } },
        ]} />
        <AuditDiff before={{ codActual: 12_500_000, note: '' }} after={{ codActual: 12_000_000, note: 'Khách thiếu 500k' }} labels={{ codActual: 'COD thực thu', note: 'Ghi chú' }} />
      </Section>
      <Section title="Attachments">
        <AttachmentList items={[{ id: 'a1', fileName: 'pod-binh-duong.jpg', mimeType: 'image/jpeg', size: 245_000, categoryLabel: 'POD' }, { id: 'a2', fileName: 'hoa-don.pdf', mimeType: 'application/pdf', size: 1_200_000, categoryLabel: 'Hóa đơn' }]} onOpen={() => toast.info('Mở viewer')} onDelete={() => setSensitive(true)} />
        <AttachmentUploader onUpload={(f, p) => new Promise((res, rej) => { let i = 0; const t = setInterval(() => { i += 25; p?.(i); if (i >= 100) { clearInterval(t); f.name.includes('fail') ? rej(new Error('Máy chủ từ chối')) : res(); } }, 150); })} />
      </Section>
      <Section title="LineItemsEditor / Stepper / StatusStepper">
        <LineItemsEditor
          rows={lines}
          onChange={setLines}
          sortable
          newRow={() => ({ name: '', qty: 0, amount: 0 })}
          columns={[
            { key: 'name', label: 'Tên hàng', render: (r, _i, u) => <Input value={r.name} onChange={(e) => u({ name: e.target.value })} /> },
            { key: 'qty', label: 'Số lượng', width: 120, render: (r, _i, u) => <Input type="number" value={r.qty} onChange={(e) => u({ qty: Number(e.target.value) })} /> },
            { key: 'amount', label: 'Thành tiền', width: 180, align: 'right', render: (r, _i, u) => <MoneyInput value={r.amount} onChange={(v) => u({ amount: v ?? 0 })} /> },
          ]}
          footer={<span className="text-body-sm">Tổng: <MoneyCell value={lines.reduce((s, l) => s + l.amount, 0)} className="inline font-semibold" /></span>}
        />
        <Stepper steps={[{ key: '1', label: 'Tải file' }, { key: '2', label: 'Map cột' }, { key: '3', label: 'Kiểm tra lỗi' }, { key: '4', label: 'Xác nhận' }]} active={1} />
        <StatusStepper current="IN_TRANSIT" steps={Object.entries(TRIP_STATUS).filter(([k]) => !['PAUSED', 'CANCELLED'].includes(k)).map(([k, m]) => ({ key: k, label: m.label, at: k === 'SCHEDULED' ? '22/09 09:00' : undefined }))} />
      </Section>
      <Section title="Charts">
        <div className="grid gap-4 md:grid-cols-2">
          <BarChart money labels={['T6', 'T7', 'T8', 'T9']} series={[{ name: 'Doanh thu', values: [120e6, 150e6, 98e6, 175e6] }, { name: 'Chi phí', values: [80e6, 95e6, 70e6, 110e6] }]} />
          <LineChart money labels={['T6', 'T7', 'T8', 'T9']} series={[{ name: 'Lãi/lỗ', values: [40e6, 55e6, 28e6, 65e6], colorToken: 3 }]} />
        </div>
      </Section>
      <Section title="MapView">
        <MapView height={280} pins={[{ id: 't1', lat: 10.6, lng: 106.3, label: '51C-123.45 · CX-202609-0001', status: 'accent' }]} path={[{ lat: 10.0964, lng: 105.7005 }, { lat: 10.35, lng: 106.0 }, { lat: 10.6, lng: 106.3 }]} />
      </Section>
      <Section title="PermissionMatrix">
        <PermissionMatrix editable onChange={(p, r, g) => toast.info(`${p} · ${r} → ${g}`)} />
      </Section>
      <Section title="PrintSheet">
        <PrintSheet title="Phiếu giao hàng — xem trước A4">
          <h1 className="text-[18px] font-bold">PHIẾU GIAO HÀNG</h1>
          <p>Mã đơn: DH-202609-0001 · Khách: Công ty Gạo Miền Tây</p>
        </PrintSheet>
      </Section>
      <Section title="Dialog / Drawer / SensitiveActionModal / Skeleton">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setDialog(true)}>Mở Dialog</Button>
          <Button variant="secondary" onClick={() => setDrawer(true)}>Mở Drawer</Button>
          <Button variant="destructive-outline" onClick={() => setSensitive(true)}>Thao tác nhạy cảm</Button>
        </div>
        <div className="flex flex-col gap-2"><Skeleton w={260} h={20} /><Skeleton w="60%" /></div>
        <Dialog open={dialog} onOpenChange={setDialog} title="Xác nhận gửi duyệt" description="Bảng lương BL-202609-0001 sẽ chuyển sang trạng thái Chờ duyệt." footer={<><Button variant="secondary" onClick={() => setDialog(false)}>Hủy</Button><Button onClick={() => setDialog(false)}>Gửi duyệt</Button></>} />
        <Drawer open={drawer} onOpenChange={setDrawer} title="Lọc nâng cao" width={480} footer={<><Button variant="secondary" onClick={() => setDrawer(false)}>Xóa lọc</Button><Button onClick={() => setDrawer(false)}>Áp dụng</Button></>}>
          <div className="flex flex-col gap-3"><FormField label="Khách hàng"><Input /></FormField><FormField label="Tài xế"><Input /></FormField></div>
        </Drawer>
        <SensitiveActionModal open={sensitive} onOpenChange={setSensitive} action="Hủy đơn DH-202609-0001" affected={['1 chuyến CX-202609-0001 sẽ bị hủy', 'Chi phí 800.000 đ đã phát sinh được giữ lại']} before={{ status: 'Đang thực hiện' }} after={{ status: 'Đã hủy' }} warning="Đơn đang có chuyến chạy." confirmLabel="Hủy đơn" onConfirm={async (r) => { toast.success('Đã hủy đơn', `Lý do: ${r}`); }} />
      </Section>
    </div>
  );
}
