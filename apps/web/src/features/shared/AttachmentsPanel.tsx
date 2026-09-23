import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { AttachmentList, AttachmentUploader, AttachmentViewer, ErrorState, SensitiveActionModal, Skeleton, toast, type AttachmentItem } from '@bta/shadcn';
import { ATTACHMENT_CATEGORY, labelOf, type Tone } from '@bta/shared';
import { useAuth } from '@/app/auth/AuthProvider';
import { apolloErrorMessage } from '@/lib/apollo';
import { useUpload } from '@/lib/upload';
import { AttachmentsQuery, DeleteAttachmentMutation } from './graphql';
import { useQueryParam } from './useQueryParam';

const CATEGORY_META = Object.fromEntries(Object.entries(ATTACHMENT_CATEGORY).map(([k, v]) => [k, { label: v, tone: 'neutral' as Tone }]));

export interface AttachmentsPanelProps {
  entityType: string;
  entityId: string;
  /** Loại chứng từ mặc định khi upload */
  category?: string;
  canUpload?: boolean;
  accept?: string;
  emptyText?: string;
}

/** Chứng từ theo entity + viewer WM-SHELL-06 (`?attachment=:id`) + upload (presign → PUT → confirm) + xóa có lý do. */
export function AttachmentsPanel({ entityType, entityId, category = 'OTHER', canUpload = true, accept, emptyText }: AttachmentsPanelProps) {
  const { hasPermission } = useAuth();
  const { upload } = useUpload();
  const [openId, setOpenId] = useQueryParam('attachment');
  const [pendingDelete, setPendingDelete] = React.useState<AttachmentItem | null>(null);
  const { data, loading, error, refetch } = useQuery(AttachmentsQuery, { variables: { entityType: entityType as never, entityId } });
  const [remove, { loading: deleting }] = useMutation(DeleteAttachmentMutation);
  const items: AttachmentItem[] = (data?.attachments ?? []).map((a) => ({
    id: a.id,
    fileName: a.fileName,
    category: a.category,
    categoryLabel: labelOf(CATEGORY_META, a.category),
    mimeType: a.mimeType,
    size: a.size,
    url: a.url,
    thumbnailUrl: a.mimeType.startsWith('image/') ? a.url : null,
    uploadedByName: a.uploadedByName,
    capturedAt: a.capturedAt,
    createdAt: a.createdAt,
    note: a.note,
  }));
  const current = openId ? items.find((i) => i.id === openId) ?? null : null;
  const canDelete = hasPermission('attachments.delete');

  return (
    <div className="flex flex-col gap-3">
      {canUpload ? (
        <AttachmentUploader
          accept={accept}
          onUpload={async (file, onProgress) => {
            await upload(file, { entityType, entityId, category }, onProgress);
          }}
          onDone={() => {
            void refetch();
            toast.success('Đã tải chứng từ lên');
          }}
        />
      ) : null}
      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : loading && !data ? (
        <Skeleton h={80} />
      ) : (
        <AttachmentList items={items} onOpen={(a) => setOpenId(a.id)} onDelete={canDelete ? (a) => setPendingDelete(a) : undefined} emptyText={emptyText} />
      )}
      <AttachmentViewer
        file={current}
        open={!!current}
        onOpenChange={(o) => !o && setOpenId(null)}
        canDelete={canDelete}
        onDelete={(a) => setPendingDelete(a)}
      />
      <SensitiveActionModal
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        action="Xóa chứng từ"
        description="Chứng từ bị xóa sẽ không còn hiển thị; thao tác được ghi vào nhật ký."
        affected={pendingDelete ? [pendingDelete.fileName] : []}
        confirmLabel="Xóa chứng từ"
        loading={deleting}
        onConfirm={async (reason) => {
          if (!pendingDelete) return;
          try {
            await remove({ variables: { id: pendingDelete.id, reason } });
            toast.success('Đã xóa chứng từ');
            setPendingDelete(null);
            setOpenId(null);
            void refetch();
          } catch (e) {
            toast.error('Không xóa được chứng từ', apolloErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
