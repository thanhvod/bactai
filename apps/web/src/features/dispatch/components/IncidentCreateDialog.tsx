import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Dialog, FormField, Input, Select, Textarea, toast } from '@bta/shadcn';
import { INCIDENT_SEVERITY } from '@bta/shared';
import { apolloErrorMessage } from '@/lib/apollo';
import { CatalogOptionsQuery } from '@/features/shared/graphql';
import { CreateIncidentMutation, StaffOptionsQuery } from '../graphql/dispatch';

/** Tạo sự cố (WM-DISPATCH-05 "Tạo sự cố", Báo sự cố từ đơn/chuyến). */
export function IncidentCreateDialog({
  open,
  onOpenChange,
  orderId,
  tripId,
  trips,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  orderId?: string | null;
  tripId?: string | null;
  trips?: { id: string; code: string }[];
  onCreated?: (id: string) => void;
}) {
  const { data: types } = useQuery(CatalogOptionsQuery, { variables: { type: 'INCIDENT_TYPE' as never, activeOnly: true }, skip: !open });
  const { data: staff } = useQuery(StaffOptionsQuery, { skip: !open });
  const [create, { loading }] = useMutation(CreateIncidentMutation);
  const [typeId, setTypeId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [severity, setSeverity] = React.useState('MEDIUM');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [trip, setTrip] = React.useState(tripId ?? '');
  const [assignee, setAssignee] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTrip(tripId ?? '');
      setErr(null);
    }
  }, [open, tripId]);

  const submit = async () => {
    if (!title.trim()) return setErr('Nhập tiêu đề sự cố');
    try {
      const r = await create({
        variables: {
          input: {
            title: title.trim(),
            severity,
            typeId: typeId || null,
            description: description || null,
            location: location || null,
            orderId: orderId ?? null,
            tripId: trip || null,
            assigneeUserId: assignee || null,
          },
        },
      });
      toast.success(`Đã tạo sự cố ${r.data?.createIncident.code ?? ''}`);
      onOpenChange(false);
      setTitle('');
      setDescription('');
      setLocation('');
      onCreated?.(r.data!.createIncident.id);
    } catch (e) {
      toast.error('Không tạo được sự cố', apolloErrorMessage(e));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Báo sự cố"
      description="Sự cố là bản ghi riêng (khác trạng thái Tạm dừng) — gán người xử lý và theo dõi tới khi đóng."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button loading={loading} onClick={() => void submit()}>
            Tạo sự cố
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Tiêu đề" required error={err} className="md:col-span-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Hư xe tại cao tốc Trung Lương" autoFocus />
        </FormField>
        <FormField label="Loại sự cố">
          <Select value={typeId} allowEmpty onValueChange={setTypeId} options={(types?.catalogItems ?? []).map((t) => ({ value: t.id, label: t.name }))} placeholder="Chọn loại" />
        </FormField>
        <FormField label="Mức độ" required>
          <Select value={severity} onValueChange={setSeverity} options={Object.entries(INCIDENT_SEVERITY).map(([value, m]) => ({ value, label: m.label }))} />
        </FormField>
        {trips?.length ? (
          <FormField label="Chuyến liên quan">
            <Select value={trip} allowEmpty emptyLabel="— Không gắn chuyến —" onValueChange={setTrip} options={trips.map((t) => ({ value: t.id, label: t.code }))} />
          </FormField>
        ) : null}
        <FormField label="Người xử lý">
          <Select
            value={assignee}
            allowEmpty
            emptyLabel="— Chưa gán —"
            onValueChange={setAssignee}
            options={(staff?.staffOptions ?? []).filter((u) => u.effectivePermissions.includes('incident.manage')).map((u) => ({ value: u.id, label: u.name }))}
          />
        </FormField>
        <FormField label="Vị trí" className="md:col-span-2">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Địa điểm xảy ra" />
        </FormField>
        <FormField label="Mô tả" className="md:col-span-2">
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  );
}
