import * as React from 'react';
import { Download, FileText, Image as ImageIcon, Trash2, Upload, X } from 'lucide-react';
import { formatDateTime } from '@bta/shared';
import { Button } from '../ui/button';
import { IconButton } from '../ui/icon-button';
import { Drawer } from '../ui/drawer';
import { DescriptionList } from './description-list';
import { EmptyState } from './states';
import { cn } from '../lib/utils';

export interface AttachmentItem {
  id: string;
  fileName: string;
  category?: string | null;
  categoryLabel?: string | null;
  mimeType?: string | null;
  size?: number | null;
  url?: string | null;
  thumbnailUrl?: string | null;
  uploadedByName?: string | null;
  capturedAt?: string | null;
  createdAt?: string | null;
  note?: string | null;
  entityLabel?: string | null;
}

export function formatBytes(n: number | null | undefined): string {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const isImage = (m?: string | null) => !!m && m.startsWith('image/');

export function AttachmentList({ items, onOpen, onDelete, className, emptyText = 'Chưa có chứng từ' }: { items: AttachmentItem[]; onOpen?: (a: AttachmentItem) => void; onDelete?: (a: AttachmentItem) => void; className?: string; emptyText?: string }) {
  if (!items.length) return <EmptyState compact message={emptyText} />;
  return (
    <ul className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {items.map((a) => (
        <li key={a.id} className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-surface">
          <button type="button" onClick={() => onOpen?.(a)} className="flex aspect-[4/3] items-center justify-center bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {isImage(a.mimeType) && (a.thumbnailUrl || a.url) ? (
              <img src={a.thumbnailUrl ?? a.url ?? ''} alt={a.fileName} className="size-full object-cover" />
            ) : isImage(a.mimeType) ? (
              <ImageIcon className="size-8 text-text-subtle" strokeWidth={1.5} />
            ) : (
              <FileText className="size-8 text-text-subtle" strokeWidth={1.5} />
            )}
          </button>
          <div className="flex items-start gap-1 px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm text-text" title={a.fileName}>{a.fileName}</p>
              <p className="truncate text-caption text-text-subtle">{[a.categoryLabel ?? a.category, formatBytes(a.size)].filter(Boolean).join(' · ')}</p>
            </div>
            {onDelete ? (
              <IconButton label="Xóa chứng từ" size="sm" onClick={() => onDelete(a)}>
                <Trash2 />
              </IconButton>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Drawer 720px xem ảnh/PDF + metadata (WM-SHELL-06). */
export function AttachmentViewer({ file, open, onOpenChange, onDelete, canDelete }: { file: AttachmentItem | null; open: boolean; onOpenChange: (o: boolean) => void; onDelete?: (a: AttachmentItem) => void; canDelete?: boolean }) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      width={720}
      title={file?.fileName ?? 'Chứng từ'}
      description={file?.entityLabel ?? undefined}
      footer={
        file ? (
          <>
            {canDelete && onDelete ? (
              <Button variant="destructive-outline" onClick={() => onDelete(file)}>
                <Trash2 /> Xóa chứng từ
              </Button>
            ) : null}
            <div className="flex-1" />
            {file.url ? (
              <Button asChild variant="secondary">
                <a href={file.url} target="_blank" rel="noreferrer" download={file.fileName}>
                  <Download /> Tải xuống
                </a>
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {file ? (
        <div className="flex flex-col gap-4">
          <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted">
            {isImage(file.mimeType) && file.url ? (
              <img src={file.url} alt={file.fileName} className="max-h-[60vh] w-auto object-contain" />
            ) : file.mimeType === 'application/pdf' && file.url ? (
              <iframe title={file.fileName} src={file.url} className="h-[60vh] w-full" />
            ) : (
              <div className="flex flex-col items-center gap-2 p-8 text-text-muted">
                <FileText className="size-10" strokeWidth={1.5} />
                <span className="text-body-sm">Không xem trước được. Tải xuống để mở.</span>
              </div>
            )}
          </div>
          <DescriptionList
            columns={2}
            items={[
              { label: 'Loại chứng từ', value: file.categoryLabel ?? file.category },
              { label: 'Kích thước', value: formatBytes(file.size) },
              { label: 'Người tải lên', value: file.uploadedByName },
              { label: 'Chụp lúc', value: file.capturedAt ? formatDateTime(file.capturedAt) : null },
              { label: 'Tải lên lúc', value: file.createdAt ? formatDateTime(file.createdAt) : null },
              { label: 'Định dạng', value: file.mimeType },
              { label: 'Ghi chú', value: file.note, span: 2 },
            ]}
          />
        </div>
      ) : null}
    </Drawer>
  );
}

export interface UploadItemState {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
  error?: string;
}

export interface AttachmentUploaderProps {
  /** Thực hiện upload 1 file (presign → PUT → confirm). Ném lỗi nếu thất bại. */
  onUpload: (file: File, onProgress?: (pct: number) => void) => Promise<void>;
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  onDone?: () => void;
}

/** Kéo thả / chọn file; hiển thị tiến trình từng file; retry khi lỗi. */
export function AttachmentUploader({ onUpload, accept = 'image/*,application/pdf', maxSizeMb = 15, multiple = true, disabled, className, label = 'Kéo thả hoặc chọn file', onDone }: AttachmentUploaderProps) {
  const [items, setItems] = React.useState<UploadItemState[]>([]);
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const update = (id: string, patch: Partial<UploadItemState>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const run = async (it: UploadItemState) => {
    update(it.id, { status: 'uploading', progress: 0, error: undefined });
    try {
      await onUpload(it.file, (p) => update(it.id, { progress: p }));
      update(it.id, { status: 'done', progress: 100 });
      onDone?.();
    } catch (e) {
      update(it.id, { status: 'error', error: e instanceof Error ? e.message : 'Tải lên thất bại' });
    }
  };

  const add = (files: FileList | File[]) => {
    const list = Array.from(files)
      .filter((f) => {
        if (f.size > maxSizeMb * 1024 * 1024) {
          setItems((p) => [...p, { id: `${f.name}-${Date.now()}`, file: f, progress: 0, status: 'error', error: `Vượt ${maxSizeMb} MB` }]);
          return false;
        }
        return true;
      })
      .map((f) => ({ id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, file: f, progress: 0, status: 'queued' as const }));
    setItems((p) => [...p, ...list]);
    list.forEach((it) => void run(it));
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
        className={cn('flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong bg-surface px-4 py-6 text-center text-body-sm text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', drag && 'border-primary bg-primary-soft', disabled && 'cursor-not-allowed opacity-60')}
      >
        <Upload className="size-6 text-text-subtle" />
        <span>{label}</span>
        <span className="text-caption text-text-subtle">Ảnh hoặc PDF, tối đa {maxSizeMb} MB mỗi file</span>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => e.target.files && add(e.target.files)} />
      </div>
      {items.length ? (
        <ul className="flex flex-col gap-1">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-body-sm">
              <FileText className="size-4 shrink-0 text-text-subtle" />
              <span className="min-w-0 flex-1 truncate">{it.file.name}</span>
              {it.status === 'uploading' ? <span className="text-caption text-text-subtle tabular-nums">{it.progress}%</span> : null}
              {it.status === 'done' ? <span className="text-caption text-success">Đã tải lên</span> : null}
              {it.status === 'error' ? (
                <>
                  <span className="text-caption text-danger">{it.error}</span>
                  <Button size="sm" variant="ghost" onClick={() => run(it)}>
                    Thử lại
                  </Button>
                </>
              ) : null}
              <IconButton label="Bỏ" size="sm" onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))}>
                <X />
              </IconButton>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
